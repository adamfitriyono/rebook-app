const express = require('express');
const disputeController = require('../controllers/disputeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', disputeController.getMyDisputes);
router.post('/', disputeController.createDispute);

module.exports = router;
