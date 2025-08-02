// controllers/Admin/userController.js
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../../models/usersModel'); // giữ nguyên theo cấu trúc của bạn

// ✅ Nhúng trực tiếp hàm phân trang, không cần utils/pagination
function buildPagination({ page = 1, limit = 10 }) {
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
}

const ALLOW_SORT = new Set(['id', 'name', 'email', 'role', 'status', 'created_at', 'updated_at']);

function safeSort(sortBy, sortOrder) {
  const key = ALLOW_SORT.has(sortBy) ? sortBy : 'created_at';
  const order = (String(sortOrder || '').toUpperCase() === 'ASC') ? 'ASC' : 'DESC';
  return [key, order];
}

class UserController {
  /**
   * GET /admin/users
   */
  static async getAll(req, res) {
    try {
      const {
        page, limit, search, role, status, 
        dateFrom, dateTo, sortBy, sortOrder,
      } = req.query;

      const where = {};

      if (search) {
        const like = `%${search.trim()}%`;
        where[Op.or] = [
          { name: { [Op.like]: like } },
          { email: { [Op.like]: like } },
          { phone: { [Op.like]: like } },
        ];
      }

      if (role) where.role = role;
      if (status) where.status = status;

      // ❌ Bỏ toàn bộ xử lý verified/email_verified_at

      if (dateFrom || dateTo) {
        where.created_at = {};
        if (dateFrom) where.created_at[Op.gte] = new Date(`${dateFrom} 00:00:00`);
        if (dateTo) where.created_at[Op.lte] = new Date(`${dateTo} 23:59:59`);
      }

      const { page: p, limit: l, offset } = buildPagination({ page, limit });
      const order = [safeSort(sortBy, sortOrder)];

      const { rows, count } = await User.findAndCountAll({
        where,
        offset,
        limit: l,
        order: [order],
        attributes: { exclude: ['password', 'remember_token'] },
      });

      return res.json({
        data: rows,
        pagination: {
          total: count,
          page: p,
          limit: l,
          totalPages: Math.ceil(count / l),
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' });
    }
  }

  /**
   * GET /admin/users/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'remember_token'] },
      });
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi lấy chi tiết user' });
    }
  }

  /**
   * POST /admin/users
   */
  static async create(req, res) {
    try {
      const { name, email, password, phone, avatar, role, status } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Thiếu name/email/password' });
      }

      const existed = await User.findOne({ where: { email } });
      if (existed) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
      }

      const hash = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hash,
        phone: phone || null,
        avatar: avatar || null,
        role: role || 'user',
        status: status || 'active',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const { password: _, remember_token, ...safe } = newUser.toJSON();
      return res.status(201).json(safe);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi tạo user' });
    }
  }

  /**
   * PUT /admin/users/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, phone, avatar, role, status, lockout_reason } = req.body;

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

      if (email && email !== user.email) {
        const existed = await User.findOne({ where: { email } });
        if (existed) return res.status(409).json({ message: 'Email đã tồn tại' });
        user.email = email;
        // ❌ bỏ user.email_verified_at vì đã loại khỏi hệ thống
      }

      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone || null;
      if (avatar !== undefined) user.avatar = avatar || null;
      if (role !== undefined) user.role = role;
      if (status !== undefined) user.status = status;
      if (lockout_reason !== undefined) user.lockout_reason = lockout_reason || null;

      if (password) {
        const hash = await bcrypt.hash(password, 10);
        user.password = hash;
      }

      user.updated_at = new Date();
      await user.save();

      const { password: _, remember_token, ...safe } = user.toJSON();
      return res.json(safe);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi cập nhật user' });
    }
  }

  /**
   * PATCH /admin/users/:id/status
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, lockout_reason } = req.body;

      if (!status) return res.status(400).json({ message: 'Thiếu status' });

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

      user.status = status;
      if (status === 'locked') {
        user.lockout_reason = lockout_reason || 'Vi phạm chính sách';
      } else {
        user.lockout_reason = null;
      }
      user.updated_at = new Date();
      await user.save();

      const { password: _, remember_token, ...safe } = user.toJSON();
      return res.json(safe);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
    }
  }

  /**
   * DELETE /admin/users/:id
   */
  static async remove(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

      await user.destroy();
      return res.json({ message: 'Đã xóa user' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Lỗi xóa user' });
    }
  }
}

module.exports = UserController;
