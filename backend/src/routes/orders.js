const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/seller', authorize('seller'), orderController.getSellerOrders);
router.get('/group/:checkoutGroupId', orderController.getOrdersByGroup);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/status', authorize('seller'), orderController.updateOrderStatus);
router.put('/:id/confirm', orderController.confirmOrder);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
