const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
const OrderHistoryController = require('../controllers/Admin/orderHistoryController');

//------------------[ ADMIN ROUTES ]------------------

//------------------[ ORDERS ]------------------
router.get('/orders/search', OrderController.searchOrders);
router.get('/orders/track/:orderCode', OrderController.trackOrder);
router.get('/orders/list', OrderController.get);
router.get('/orders/:id', OrderController.getById); 
router.put('/orders/edit/:id', OrderController.update); 
router.delete("/orders/delete/:id", OrderController.delete);

//------------------[ ORDERHISTORY ]------------------
router.get('/order-history/search', OrderHistoryController.searchOrderHistory);
router.get('/order-history/list', OrderHistoryController.get);
router.get('/order-history/:id', OrderHistoryController.getById); 
router.put('/orders/:id', OrderController.update); 
router.delete("/orders/:id", OrderController.delete);

module.exports = router;