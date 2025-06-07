const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Client/authController');
const CartController = require('../controllers/Client/cartsController');

//------------------[ CLIENT ROUTES ]------------------

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/otp", AuthController.OTP);
router.post("/reset-password", AuthController.resetPassword);

//------------------[ CARTS ]------------------
router.get("/carts", CartController.getCartByUser);
router.post("/add-to-carts", CartController.addToCart);
router.put("/update-to-carts/:userId/:productVariantId", CartController.updateCartItem);
router.delete("/delete-to-carts/:userId/:productVariantId", CartController.removeCartItem);
router.delete("/clear-cart/:userId", CartController.clearCartByUser);

module.exports = router;