const express = require('express');
const supportController = require('../controllers/supportController');

const router = express.Router();

router.post('/chat', supportController.chat);

module.exports = router;
