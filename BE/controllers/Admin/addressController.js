// controllers/Admin/addressController.js
const AddressModel = require('../../models/addressesModel');
const UserModel = require('../../models/usersModel');
const { Op } = require('sequelize');

class AddressController {
  // GET /admin/address/list?search=...
  static async getAllAddress(req, res) {
    try {
      const { search } = req.query;
      let whereUser = {};
      if (search) {
        whereUser = {
          name: { [Op.like]: `%${search}%` }
        };
      }

      const addresses = await AddressModel.findAll({
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email'],
            where: search ? whereUser : undefined,
            required: !!search // nếu có search thì inner join để lọc theo user.name
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      console.error('Error in AddressController.getAllAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách địa chỉ' });
    }
  }

  // GET /admin/address/:id
  static async getAddressDetail(req, res) {
    const { id } = req.params;
    try {
      const address = await AddressModel.findOne({
        where: { id },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!address) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
      }

      return res.status(200).json({ success: true, data: address });
    } catch (error) {
      console.error('Error in AddressController.getAddressDetail:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết địa chỉ' });
    }
  }

  // GET /admin/address/user/:id
  static async getAddressesByUser(req, res) {
    // ✅ dùng params.id đúng với route bạn đã khai báo
    const userId = req.params.id;
    try {
      const addresses = await AddressModel.findAll({
        where: { user_id: userId },
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      console.error('Error in AddressController.getAddressesByUser:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi lấy địa chỉ theo user' });
    }
  }

  // POST /admin/user/:userId/addresses
  static async addAddress(req, res) {
    const {
      address_line,
      city,
      district,
      province, // ✅ đổi từ ward -> province
      is_default
    } = req.body;

    const user_id = req.params.userId;

    try {
      if (!user_id) {
        return res.status(400).json({ success: false, message: 'user_id là bắt buộc' });
      }
      if (!address_line || !city || !district || !province) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin địa chỉ (address_line/city/district/province)' });
      }

      // Nếu set mặc định, bỏ mặc định các địa chỉ khác của user
      if (is_default) {
        await AddressModel.update({ is_default: 0 }, { where: { user_id } });
      }

      const newAddress = await AddressModel.create({
        address_line,
        city,
        district,
        province,
        is_default: is_default ? 1 : 0,
        user_id
      });

      return res.status(201).json({ success: true, data: newAddress, message: 'Thêm địa chỉ thành công' });
    } catch (error) {
      console.error('Error in AddressController.addAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi thêm địa chỉ' });
    }
  }

  // PUT /admin/user/:userId/addresses/:id
  static async updateAddress(req, res) {
    const { id } = req.params;
    const {
      address_line,
      city,
      district,
      province, // ✅ đổi từ ward -> province
      is_default
    } = req.body;

    try {
      const address = await AddressModel.findOne({ where: { id } });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
      }

      // Nếu set mặc định -> bỏ mặc định các địa chỉ khác của cùng user
      if (is_default) {
        await AddressModel.update(
          { is_default: 0 },
          {
            where: {
              user_id: address.user_id,
              id: { [Op.ne]: id }
            }
          }
        );
      }

      await AddressModel.update(
        {
          address_line,
          city,
          district,
          province,
          is_default: is_default ? 1 : 0
        },
        { where: { id } }
      );

      return res.status(200).json({ success: true, message: 'Cập nhật địa chỉ thành công' });
    } catch (error) {
      console.error('Error in AddressController.updateAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật địa chỉ' });
    }
  }


  static async deleteAddress(req, res) {
    const { id } = req.params;

    try {
      const address = await AddressModel.findOne({ where: { id } });
      if (!address) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
      }

      await AddressModel.destroy({ where: { id } });
      return res.status(200).json({ success: true, message: 'Xóa địa chỉ thành công' });
    } catch (error) {
      console.error('Error in AddressController.deleteAddress:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server khi xóa địa chỉ' });
    }
  }
}

module.exports = AddressController;
