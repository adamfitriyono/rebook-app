const express = require('express');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
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
router.get('/categories', categoryController.getAdminCategories);
router.post('/categories', categoryController.createCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;
