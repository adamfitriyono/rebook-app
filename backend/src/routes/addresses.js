const express = require('express');
const addressController = require('../controllers/addressController');

const router = express.Router();

router.get('/search', addressController.searchAddresses);

module.exports = router;
