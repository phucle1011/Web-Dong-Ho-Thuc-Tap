const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Client/authController');
const CartController = require('../controllers/Client/cartsController');
const ProductController = require('../controllers/Client/productController');
const CategoryController = require('../controllers/Client/categoryController');
const ShippingController = require('../controllers/Client/shippingController');
const OrderController = require('../controllers/Client/ordersController');

//------------------[ CLIENT ROUTES ]------------------

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/otp", AuthController.OTP);
router.post("/reset-password", AuthController.resetPassword);
//-----------------[Product]------------------
router.get('/products', ProductController.getAllProducts);
router.get('/products/:productIdOrSlug', ProductController.getProductDetail);
router.get('/products/:productIdOrSlug/variants', ProductController.getProductVariants);
router.get('/products/:productIdOrSlug/variants/:variantId', ProductController.getProductVariantDetail);
//------------------[ CATEGORY ROUTES ]------------------
router.get('/category/list', CategoryController.getCategories);

//------------------[ CARTS ]------------------
router.get("/carts", CartController.getCartByUser);
router.post("/add-to-carts", CartController.addToCart);
router.put("/update-to-carts/:productVariantId", CartController.updateCartItem);
router.delete("/delete-to-carts/:productVariantId", CartController.removeCartItem);
router.delete("/clear-cart", CartController.clearCartByUser);

//------------------[ SHIPPING ]------------------
router.post('/shipping/shipping-fee', ShippingController.calculateShippingFee);

//------------------[ ORDERS ]------------------
router.get("/orders", OrderController.get);
router.post("/orders", OrderController.create);
router.post("/orders-momo", OrderController.createMomoUrl);
router.post("/payment-notification", OrderController.momoPaymentNotification);
router.post("/orders-vnpay", OrderController.createVNPayUrl);
router.get("/vnpay-callback", OrderController.handleVNPayCallback);
router.put("/orders/cancel/:id", OrderController.cancelOrder);
router.put("/orders/confirm-delivered/:id", OrderController.confirmDelivered);

module.exports = router;