const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placesController');
const verifyToken = require('../middlewares/verifyToken');

// Routes publiques
router.get('/', placeController.getAllPlaces);
router.get('/:id', placeController.getPlaceById);

// Routes protégées
router.post('/', verifyToken, placeController.createPlace);
router.put('/:id', verifyToken, placeController.updatePlace);
router.delete('/:id', verifyToken, placeController.deletePlace);

module.exports = router;
