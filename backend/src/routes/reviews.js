const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.get('/eligibility/:productId', authenticate, reviewController.getReviewEligibility);
router.post('/', authenticate, reviewController.createReview);
router.post('/:id/report', authenticate, reviewController.reportReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
