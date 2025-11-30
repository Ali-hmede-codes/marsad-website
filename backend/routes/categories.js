const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/children', categoryController.getChildCategories);
router.get('/parents', categoryController.getParentCategories);

// Protected routes (admin only)
router.post('/', verifyToken, isAdmin, upload.single('catg_picture'), categoryController.createCategory);
router.put('/:id', verifyToken, isAdmin, upload.single('catg_picture'), categoryController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);

module.exports = router;
