const CommentModel = require('../../models/commentsModel');
const OrderDetailModel = require('../../models/orderDetailsModel');
const ProductVariantsModel = require('../../models/productVariantsModel');
const ProductModel = require('../../models/productsModel');
const UserModel = require('../../models/usersModel');
const { Op } = require("sequelize");
const sequelize = require("../../config/database");
class CommentController {
  /**
   * POST /comments
   * Body: { user_id, order_detail_id, rating, comment_text }
   */
  static async create(req, res) {
    try {
      const { user_id, order_detail_id, rating, comment_text } = req.body;

      if (!user_id || !order_detail_id || !rating || !comment_text) {
        return res.status(400).json({
          status: 400,
          message: 'Thiếu dữ liệu bắt buộc: user_id, order_detail_id, rating, comment_text'
        });
      }

      const detail = await OrderDetailModel.findByPk(order_detail_id, {
        attributes: [
          'id',
          'product_variant_id',
          'order_id',
          'quantity',
          'price',
          'created_at',
          'updated_at'
        ]
      });

      if (!detail) {
        return res.status(404).json({
          status: 404,
          message: 'Chi tiết đơn hàng không tồn tại'
        });
      }

      const newComment = await CommentModel.create({
        user_id,
        order_detail_id,
        order_id: detail.order_id,
        rating,
        comment_text
      });

      return res.status(201).json({
        status: 201,
        message: 'Tạo bình luận thành công',
        data: newComment
      });
    } catch (error) {
      console.error('Lỗi tạo bình luận:', error);
      return res.status(500).json({
        status: 500,
        message: 'Lỗi máy chủ',
        error: error.message
      });
    }
  }

  /**
   * GET /comments/product/:productId
   * Lấy tất cả bình luận cho product
   */
static async getByProduct(req, res) {
  try {
    const { productId } = req.params;

    const comments = await CommentModel.findAll({
      include: [
        {
          model: OrderDetailModel,
          as: 'orderDetail',
          required: true,
          attributes: ['id', 'order_id', 'quantity', 'price', 'product_variant_id'],
          include: [
            {
              model: ProductVariantsModel,
              as: 'variant',
              required: true,
              attributes: ['id', 'product_id', 'price', 'stock'],
              include: [
                {
                  model: ProductModel,
                  required: true,
                  where: { id: productId },
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        },
        {
          model: UserModel,
          as: 'user',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json({
      status: 200,
      data: comments
    });
  } catch (error) {
    console.error('Lỗi lấy bình luận theo product:', error);
    return res.status(500).json({
      status: 500,
      message: 'Lỗi máy chủ',
      error: error.message
    });
  }
}



}

module.exports = CommentController;
