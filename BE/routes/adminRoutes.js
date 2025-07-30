const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
const CategoryController = require('../controllers/Admin/categoriesController');
const ProductController = require('../controllers/Admin/productsController');
const ProductAttributeController = require('../controllers/Admin/product_attributesController');
const AddressController = require('../controllers/Admin/addressController');
const DashboardController = require('../controllers/Admin/dashboardController');
const CommentController = require('../controllers/Admin/commentController');
const UserController = require('../controllers/Admin/userController');
//------------------[ ADMIN ROUTES ]------------------

//------------------[ ORDERS ]------------------
router.get('/orders/search', OrderController.searchOrders);
router.get('/orders/track/:orderCode', OrderController.trackOrder);
router.get('/orders/export-excel', OrderController.exportExcel);
router.get('/orders/filter-by-date', OrderController.filterByDate);
router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById); 
router.put('/orders/edit/:id', OrderController.update); 
router.delete("/orders/delete/:id", OrderController.delete);

//------------------[ CATEGORIES ]------------------
router.get('/categories/list', CategoryController.get);
router.get('/categories/detail/:id', CategoryController.getById);
router.post('/categories/create', CategoryController.create);
router.put('/categories/edit/:id', CategoryController.update);
router.delete('/categories/delete/:id', CategoryController.delete);

//------------------[ DASHBOARD ]------------------\
router.get('/dashboard/counts', DashboardController.getCounts);
router.get('/dashboard/revenue/days', DashboardController.getRevenueByDaysInMonth);
router.get('/dashboard/revenue/months', DashboardController.getRevenueByMonthsInYear);
router.get('/dashboard/revenue', DashboardController.getRevenueByCustomRange);


//------------------[ PRODUCT ]------------------\
router.get('/products', ProductController.get);
router.get('/products/:id', ProductController.getById);
router.post('/products', ProductController.createProduct);
router.post('/products/:product_id/variants', ProductController.addVariant);
router.delete('/products/:id', ProductController.delete);
router.get('/products/productList/search', ProductController.searchProducts);
router.post('/variants/:variant_id/images', ProductController.addVariantImages);
router.put("/variants/:variant_id", ProductController.updateVariant);
router.put("/products/:id", ProductController.update);
router.delete('/variant-images/:image_id', ProductController.deleteSingleVariantImage);
router.get("/product-attributes", ProductController.getAllAttributes);
router.delete("/variants/:variant_id", ProductController.deleteVariant);
router.get("/variants/:variant_id", ProductController.getVariantById);
router.get('/product-variants', ProductController.getAllVariants);
router.delete('/product-variants/deleteAttributeValueById/:id', ProductController.deleteAttributeValueById);
// router.post('/products/imagesClauding/:public_id', ProductController.deleteImagesClauding);

//------------------[ ProductAttributeController ]------------------\

router.get('/attribute', ProductAttributeController.getAll);
router.post('/attribute', ProductAttributeController.create);
router.get('/attribute/:id', ProductAttributeController.getById);
router.put('/attribute/:id', ProductAttributeController.update);
router.delete('/attribute/:id', ProductAttributeController.delete);

//------------------[ COMMENTS ]------------------\
router.get('/comment/list', CommentController.getAllComments);
router.get('/comment/detail/:id', CommentController.getCommentById);

//------------------[ ADDRESS ]------------------\
router.get('/address/list', AddressController.getAllAddress);
router.get('/address/user/:id', AddressController.getAddressesByUser);
router.delete('/user/:userId/addresses/:id', AddressController.deleteAddress);
router.put('/user/:userId/addresses/:id', AddressController.updateAddress);
router.post('/user/:userId/addresses', AddressController.addAddress);



//------------------[ user ]------------------\
router.get('/users',UserController.getAll);
router.get('/users/:id',UserController.getById);
router.post('/users', UserController.create);
router.put('/users/:id',UserController.update);
router.delete('/users/:id', UserController.remove);


module.exports = router;