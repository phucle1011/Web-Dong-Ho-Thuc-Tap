const UserModel = require('./usersModel');
const AddressesModel = require('./addressesModel');
const ProductModel = require('./productsModel');
const CommentModel = require('./commentsModel');
const OrderModel = require('./ordersModel');
const CategoriesModel = require('./categoriesModel');
const CartDetailModel = require('./cartDetailsModel');
const OrderDetailModel = require('./orderDetailsModel');
const ProductVariantsModel = require('./productVariantsModel');
const ProductAttributeModel = require('../models/productAttributesModel');
const ProductVariantAttributeValueModel = require('../models/productVariantAttributeValuesModel');
const VariantImageModel = require('../models/variantImagesModel');

//--------------------- [ Thiết lập quan hệ ]------------------------

// User - Address
UserModel.hasMany(AddressesModel, { foreignKey: 'user_id', as: 'addresses' });
AddressesModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });



// Product - Comment


// User - Comment
UserModel.hasMany(CommentModel, { foreignKey: 'user_id', as: 'comments' }); // ✅ thêm dòng này
CommentModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });


// Order - Comment

// User - Order
UserModel.hasMany(OrderModel, { foreignKey: 'user_id', as: 'orders' });
OrderModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });




// Category - Product
CategoriesModel.hasMany(ProductModel, { foreignKey: 'category_id', as: 'products' });
ProductModel.belongsTo(CategoriesModel, { foreignKey: 'category_id', as: 'category' });

// comment - OrderDetail
CommentModel.belongsTo(OrderDetailModel, { foreignKey: 'order_detail_id', as: 'orderDetail' });
OrderDetailModel.hasMany(CommentModel, { foreignKey: 'order_detail_id', as: 'comments' });


// User - Cart
UserModel.hasMany(CartDetailModel, { foreignKey: 'user_id', as: 'carts' });
CartDetailModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Product - ProductVariant
ProductModel.hasMany(ProductVariantsModel, { foreignKey: 'product_id', as: 'variants' });
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' }); // ✅ alias: product

// ProductVariant - Cart
ProductVariantsModel.hasMany(CartDetailModel, { foreignKey: 'product_variant_id', as: 'carts' });
CartDetailModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' }); // ✅ alias: variant


// Orders - OrderDetails
OrderModel.hasMany(OrderDetailModel, { foreignKey: 'order_id', as: 'orderDetails' });
OrderDetailModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });

// OrderDetails - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'orderedProduct' });
ProductModel.hasMany(OrderDetailModel, { foreignKey: 'product_id', as: 'orderItems' });



// OrderDetail - ProductVariant
OrderDetailModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' });
ProductVariantsModel.hasMany(OrderDetailModel, { foreignKey: 'product_variant_id', as: 'orderDetails' });

// ProductVariant - Product
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id' });

// ProductVariant - ProductVariantAttributeValue
ProductVariantsModel.hasMany(ProductVariantAttributeValueModel, { foreignKey: 'product_variant_id', as: 'attributeValues' });
ProductVariantAttributeValueModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'variant' }); // ✅ alias: variant

// ProductAttribute - ProductVariantAttributeValue
ProductAttributeModel.hasMany(ProductVariantAttributeValueModel, { foreignKey: 'product_attribute_id', as: 'values' });
ProductVariantAttributeValueModel.belongsTo(ProductAttributeModel, { foreignKey: 'product_attribute_id', as: 'attribute' });

// ProductVariant - VariantImage
ProductVariantsModel.hasMany(VariantImageModel, { foreignKey: 'variant_id', as: 'images' });
VariantImageModel.belongsTo(ProductVariantsModel, { foreignKey: 'variant_id', as: 'variant' }); // ✅ alias: variant

// Export all models
module.exports = {
  UserModel,
  AddressesModel,
  ProductModel,
  CommentModel,
  OrderModel,
  CategoriesModel,
  CartDetailModel,
  OrderDetailModel,
  ProductVariantsModel,
  ProductAttributeModel,
  ProductVariantAttributeValueModel,
  VariantImageModel,
};
