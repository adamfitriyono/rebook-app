const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.patchUserRole);
router.get('/products', adminController.getProducts);
router.patch('/products/:id/availability', adminController.patchProductAvailability);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/orders', adminController.getOrders);

module.exports = router;
