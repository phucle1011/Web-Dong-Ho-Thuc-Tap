const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Client/authController');

//------------------[ CLIENT ROUTES ]------------------

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/otp", AuthController.OTP);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;