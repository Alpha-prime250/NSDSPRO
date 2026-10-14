const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public / Read-Only Endpoints (used by both Storefront and POS)
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/barcode/:barcode', productController.getProductByBarcode);
router.get('/low-stock', authenticateToken, productController.getLowStock);
router.get('/expiring', authenticateToken, productController.getExpiringProducts);
router.get('/:id', productController.getProductById);

// Protected Staff Operations
router.post('/', authenticateToken, requireRole('Admin'), productController.createProduct);
router.put('/:id', authenticateToken, requireRole('Admin'), productController.updateProduct);
router.delete('/:id', authenticateToken, requireRole('Admin'), productController.deleteProduct);

module.exports = router;
