const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/Admin/ordersController');
const CategoryController = require('../controllers/Admin/categoriesController');
const DashboardController = require('../controllers/Admin/dashboardController');

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

module.exports = router;