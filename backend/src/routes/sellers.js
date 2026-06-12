const express = require('express');
const sellerStoreController = require('../controllers/sellerStoreController');

const router = express.Router();

router.get('/:id/products', sellerStoreController.getSellerProducts);
router.get('/:id', sellerStoreController.getSellerProfile);

module.exports = router;
