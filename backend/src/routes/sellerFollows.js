const express = require('express');
const sellerFollowController = require('../controllers/sellerFollowController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/ids', sellerFollowController.getFollowedSellerIds);
router.get('/', sellerFollowController.getFollowedSellers);
router.post('/toggle', sellerFollowController.toggleSellerFollow);

module.exports = router;
