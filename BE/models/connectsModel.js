const UserModel = require('./usersModel');
const AddressesModel = require('./addressesModel');
const ProductModel = require('./productsModel');
const CommentModel = require('./commentsModel');
const OrderModel = require('./ordersModel');
const CategoriesModel = require('./categoriesModel');
const CartDetailModel = require('./cartDetailsModel');
const OrderDetailModel = require('./orderDetailsModel');
const ProductVariantsModel = require('./productVariantsModel');

//--------------------- [ Thiết lập quan hệ ]------------------------

// User - Address
UserModel.hasMany(AddressesModel, { foreignKey: 'user_id', as: 'addresses' });
AddressesModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });


// Product - Comment
ProductModel.hasMany(CommentModel, { foreignKey: 'product_id', as: 'comments' });
CommentModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// User - Comment
CommentModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Order - Comment
CommentModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });

// User - Order
UserModel.hasMany(OrderModel, { foreignKey: 'user_id', as: 'orders' });
OrderModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });


// Category - Product
CategoriesModel.hasMany(ProductModel, { foreignKey: 'category_id', as: 'products' });
ProductModel.belongsTo(CategoriesModel, { foreignKey: 'category_id', as: 'category' });

// User - Cart
UserModel.hasMany(CartDetailModel, { foreignKey: 'user_id', as: 'carts' });
CartDetailModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

// Product - Cart
ProductModel.hasMany(CartDetailModel, { foreignKey: 'product_id', as: 'carts' });
CartDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });


// Orders - OrderDetails
OrderModel.hasMany(OrderDetailModel, { foreignKey: 'order_id', as: 'orderDetails' });
OrderDetailModel.belongsTo(OrderModel, { foreignKey: 'order_id', as: 'order' });

// OrderDetails - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' });

// OrderItems - Product
OrderDetailModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'orderedProduct' }); 
ProductModel.hasMany(OrderDetailModel, { foreignKey: 'product_id', as: 'orderItems' });

// OrderDetailModel - ProductVariants
OrderDetailModel.belongsTo(ProductVariantsModel, { foreignKey: 'product_variant_id', as: 'productVariant' }); 
ProductVariantsModel.hasMany(OrderDetailModel, { foreignKey: 'product_variant_id', as: 'orderDetails' });

// ProductVariantsModel - ProductModel
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'variantProduct' }); 
ProductModel.hasMany(ProductVariantsModel, { foreignKey: 'product_id', as: 'variants' });


// ProductVariant - Product
ProductVariantsModel.belongsTo(ProductModel, { foreignKey: 'product_id' });

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
};
