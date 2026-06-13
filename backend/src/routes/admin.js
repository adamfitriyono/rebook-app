const express = require('express');
const adminController = require('../controllers/adminController');
const adminPlatformController = require('../controllers/adminPlatformController');
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/analytics', adminPlatformController.getAnalytics);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.patchUserRole);
router.patch('/users/:id/verify', adminController.patchUserSellerVerified);
router.post('/users/:id/impersonate', adminPlatformController.impersonateUser);
router.get('/products', adminController.getProducts);
router.patch('/products/:id/availability', adminController.patchProductAvailability);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id', adminPlatformController.patchOrderStatus);
router.get('/categories', categoryController.getAdminCategories);
router.post('/categories', categoryController.createCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

router.get('/reviews', adminPlatformController.getReviews);
router.patch('/reviews/:id', adminPlatformController.patchReview);
router.delete('/reviews/:id', adminPlatformController.deleteReview);
router.get('/reports', adminPlatformController.getReports);
router.patch('/reports/:id', adminPlatformController.patchReport);

router.get('/banners', adminPlatformController.getBanners);
router.post('/banners', adminPlatformController.createBanner);
router.patch('/banners/:id', adminPlatformController.updateBanner);
router.delete('/banners/:id', adminPlatformController.deleteBanner);

router.get('/disputes', adminPlatformController.getDisputes);
router.patch('/disputes/:id', adminPlatformController.patchDispute);

router.get('/audit-logs', adminPlatformController.getAuditLogs);
router.get('/settings', adminPlatformController.getSettings);
router.patch('/settings', adminPlatformController.patchSettings);

module.exports = router;
