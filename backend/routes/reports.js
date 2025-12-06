const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isPublisher } = require('../middleware/auth');

router.get('/today', reportController.getTodayReports);
router.get('/today/types', verifyToken, reportController.getTodayReportsByType);
router.get('/today/cities', verifyToken, reportController.getTodayReportsByCity);
router.get('/today/full', verifyToken, reportController.getTodayReportsFull);
router.get('/', verifyToken, reportController.getAllReports);
router.get('/:id', verifyToken, reportController.getReport);

// Protected routes (publisher only)
router.post('/', verifyToken, isPublisher, reportController.createReport);
router.put('/:id', verifyToken, reportController.updateReport);
router.delete('/:id', verifyToken, reportController.deleteReport);

module.exports = router;
