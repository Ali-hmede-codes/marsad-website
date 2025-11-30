const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isPublisher } = require('../middleware/auth');

// Public routes
router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReport);

// Protected routes (publisher only)
router.post('/', verifyToken, isPublisher, reportController.createReport);
router.put('/:id', verifyToken, reportController.updateReport);
router.delete('/:id', verifyToken, reportController.deleteReport);

module.exports = router;
