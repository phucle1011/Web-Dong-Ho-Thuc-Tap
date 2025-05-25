const CategoryModel = require('../../models/categoriesModel');
const { Op } = require('sequelize');

class CategoryController {

  static async get(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const { searchTerm } = req.query;

      const where = {};

      if (searchTerm) {
        where.name = { [Op.like]: `%${searchTerm}%` };
      }

      const categories = await CategoryModel.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      res.status(200).json({
        status: 200,
        message: 'Lấy danh sách danh mục thành công',
        data: categories.rows,
        totalPages: Math.ceil(categories.count / limit),
        currentPage: page,
        totalItems: categories.count
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findByPk(id);

      if (!category) {
        return res.status(404).json({ message: 'Id không tồn tại' });
      }

      res.status(200).json({
        status: 200,
        message: 'Lấy danh mục thành công',
        data: category
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    let { name, slug, description, status } = req.body;
    if (!name || !description) {
      return res.status(400).json({ status: 400, message: "Tên và mô tả danh mục là bắt buộc.", });
    }
    const normalizedName = name.trim().replace(/\s+/g, " ").toLowerCase();
    try {
      const existingCategory = await CategoryModel.findOne({
        where: {
          name: normalizedName,
        },
      });
      if (existingCategory) {
        return res.status(409).json({ status: 409, message: "Tên danh mục đã tồn tại.", });
      }
      const newCategory = await CategoryModel.create({ name: normalizedName, slug, description, status, });
      return res.status(201).json({ status: 201, message: "Thêm danh mục thành công.", data: newCategory, });
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      return res.status(500).json({ status: 500, message: "Lỗi server khi thêm danh mục.", });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, slug, description, status } = req.body;

      const category = await CategoryModel.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: 'Id không tồn tại' });
      }

      if (name !== undefined) category.name = name;
      if (slug !== undefined) category.slug = slug;
      if (description !== undefined) category.description = description;
      if (status !== undefined) category.status = status;

      await category.save();

      res.status(200).json({
        status: 200,
        message: 'Cập nhật danh mục thành công',
        data: category
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const category = await CategoryModel.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: 'Id không tồn tại' });
      }

      await category.destroy();

      res.status(200).json({
        status: 200,
        message: 'Xóa danh mục thành công',
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CategoryController;