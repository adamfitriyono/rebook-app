const express = require('express');
const likeController = require('../controllers/likeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/ids', likeController.getLikedIds);
router.post('/toggle', likeController.toggleLike);

module.exports = router;
