const ProductModel = require('../../models/productsModel');
const ProductVariantModel = require('../../models/productVariantsModel');
const ProductVariantAttributeValueModel = require('../../models/productVariantAttributeValuesModel');
const ProductAttributeModel = require('../../models/productAttributesModel');
const VariantImageModel = require('../../models/variantImagesModel');
const CategoryModel = require('../../models/categoriesModel');
const { Op } = require('sequelize');

class ProductController {
    // [GET] /products
    static async getAllProducts(req, res) {
        try {
            const { category, search } = req.query;

            const where = {};
            if (category) {
                where.category_id = category;
            }
            if (search) {
                where[Op.or] = [
                    { name: { [Op.like]: `%${search}%` } },
                    { slug: { [Op.like]: `%${search}%` } }
                ];
            }

            const products = await ProductModel.findAll({
                where,
                include: [
                    {
                        model: CategoryModel,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            res.status(200).json({
                status: 200,
                message: 'Lấy danh sách sản phẩm thành công',
                data: products
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            res.status(500).json({ status: 500, message: "Lỗi máy chủ", error: error.message });
        }
    }

    // [GET] /products/:productIdOrSlug
    static async getProductDetail(req, res) {
        try {
            const { productIdOrSlug } = req.params;

            const product = await ProductModel.findOne({
                where: {
                    [Op.or]: [
                        { id: productIdOrSlug },
                        { slug: productIdOrSlug }
                    ]
                },
                include: [
                    {
                        model: CategoryModel,
                        as: 'category',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!product) {
                return res.status(404).json({ status: 404, message: 'Không tìm thấy sản phẩm' });
            }

            res.status(200).json({
                status: 200,
                message: 'Lấy chi tiết sản phẩm thành công',
                data: product
            });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
            res.status(500).json({ status: 500, message: "Lỗi máy chủ", error: error.message });
        }
    }

    // [GET] /products/:productIdOrSlug/variants
    static async getProductVariants(req, res) {
        try {
            const { productIdOrSlug } = req.params;

            const product = await ProductModel.findOne({
                where: {
                    [Op.or]: [{ id: productIdOrSlug }, { slug: productIdOrSlug }]
                }
            });

            if (!product) {
                return res.status(404).json({ status: 404, message: 'Không tìm thấy sản phẩm' });
            }

            const variants = await ProductVariantModel.findAll({
                where: { product_id: product.id },
                include: [
                    {
                        model: VariantImageModel,
                        as: 'images',
                        attributes: ['image_url'],
                        required: false
                    },
                    {
                        model: ProductVariantAttributeValueModel,
                        as: 'attributeValues',
                        include: [
                            {
                                model: ProductAttributeModel,
                                as: 'attribute',
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                status: 200,
                message: 'Lấy danh sách biến thể thành công',
                data: variants
            });
        } catch (error) {
            console.error("Lỗi khi lấy biến thể sản phẩm:", error);
            res.status(500).json({ status: 500, message: "Lỗi máy chủ", error: error.message });
        }
    }

    // [GET] /products/:productIdOrSlug/variants/:variantId
    static async getProductVariantDetail(req, res) {
        try {
            const { productIdOrSlug, variantId } = req.params;

            const product = await ProductModel.findOne({
                where: {
                    [Op.or]: [{ id: productIdOrSlug }, { slug: productIdOrSlug }]
                }
            });

            if (!product) {
                return res.status(404).json({ status: 404, message: 'Không tìm thấy sản phẩm' });
            }

            const variant = await ProductVariantModel.findOne({
                where: {
                    id: variantId,
                    product_id: product.id
                },
                include: [
                    {
                        model: VariantImageModel,
                        as: 'images',
                        attributes: ['image_url'],
                        required: false
                    },
                    {
                        model: ProductVariantAttributeValueModel,
                        as: 'attributeValues',
                        include: [
                            {
                                model: ProductAttributeModel,
                                as: 'attribute',
                                attributes: ['name']
                            }
                        ]
                    }
                ]
            });

            if (!variant) {
                return res.status(404).json({ status: 404, message: 'Không tìm thấy biến thể' });
            }

            res.status(200).json({
                status: 200,
                message: 'Lấy chi tiết biến thể thành công',
                data: variant
            });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết biến thể:", error);
            res.status(500).json({ status: 500, message: "Lỗi máy chủ", error: error.message });
        }
    }
}

module.exports = ProductController;
