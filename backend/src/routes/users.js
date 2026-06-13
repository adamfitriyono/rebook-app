const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticate, userController.getDashboardStats);
router.get('/seller/analytics', authenticate, userController.getSellerAnalytics);

module.exports = router;
