const express = require('express');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.get('/fees', settingsController.getPublicFees);

module.exports = router;
