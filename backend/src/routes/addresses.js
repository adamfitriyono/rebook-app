const express = require('express');
const addressController = require('../controllers/addressController');
const savedAddressController = require('../controllers/savedAddressController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/search', addressController.searchAddresses);

router.use(authenticate);
router.get('/', savedAddressController.getSavedAddresses);
router.post('/', savedAddressController.createSavedAddress);
router.put('/:id', savedAddressController.updateSavedAddress);
router.delete('/:id', savedAddressController.deleteSavedAddress);
router.patch('/:id/default', savedAddressController.setDefaultSavedAddress);

module.exports = router;
