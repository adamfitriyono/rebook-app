const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/categories/list', productController.getCategories);
router.get('/my-listings', authenticate, authorize('seller', 'admin'), productController.getMyListings);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post(
  '/',
  authenticate,
  authorize('seller', 'admin'),
  upload.array('images', 5),
  productController.createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize('seller', 'admin'),
  upload.array('images', 5),
  productController.updateProduct
);
router.delete('/:id', authenticate, authorize('seller', 'admin'), productController.deleteProduct);

module.exports = router;
