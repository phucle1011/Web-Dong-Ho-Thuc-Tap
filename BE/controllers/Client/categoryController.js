const { Op } = require('sequelize');
const CategoryModel = require('../../models/categoriesModel');

class CategoryController {
  // [GET] /categories?searchTerm=&status=
  static async getCategories(req, res) {
    try {
      const { searchTerm = '', status } = req.query;

      const where = {};
      if (searchTerm) {
        where[Op.or] = [
          { name: { [Op.like]: `%${searchTerm}%` } },
          { slug: { [Op.like]: `%${searchTerm}%` } }
        ];
      }
      if (status) {
        where.status = status;
      }

      const categories = await CategoryModel.findAll({
        where,
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'slug', 'description', 'status', 'created_at', 'updated_at']
      });

      res.status(200).json({
        status: 200,
        message: 'Lấy danh sách danh mục thành công',
        data: categories
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      res.status(500).json({
        status: 500,
        message: "Lỗi máy chủ",
        error: error.message
      });
    }
  }


}

module.exports = CategoryController;
