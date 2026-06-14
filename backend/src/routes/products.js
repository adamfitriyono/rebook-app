const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/categories/list', productController.getCategories);
router.get('/my-listings', authenticate, authorize('seller'), productController.getMyListings);
router.get('/', optionalAuthenticate, productController.getProducts);
router.get('/:id', optionalAuthenticate, productController.getProductById);
router.post(
  '/',
  authenticate,
  authorize('seller'),
  upload.array('images', 5),
  productController.createProduct
);
router.put(
  '/:id',
  authenticate,
  authorize('seller'),
  upload.array('images', 5),
  productController.updateProduct
);
router.delete('/:id', authenticate, authorize('seller'), productController.deleteProduct);

module.exports = router;
