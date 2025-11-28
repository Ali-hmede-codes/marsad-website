const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Get all locations
router.get('/', locationController.getAllLocations);

// Get locations by type (governorate, district, village)
router.get('/type/:type', locationController.getLocationsByType);

// Get child locations by parent ID
router.get('/children/:parentId', locationController.getChildLocations);

module.exports = router;
