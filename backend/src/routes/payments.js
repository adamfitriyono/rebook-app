const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/checkout', paymentController.processCheckoutPayment);
router.post('/', paymentController.processPayment);
router.get('/:orderId', paymentController.getPaymentStatus);
router.post('/:orderId/confirm', paymentController.confirmPayment);

module.exports = router;
