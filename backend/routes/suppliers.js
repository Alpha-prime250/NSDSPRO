const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, supplierController.getAllSuppliers);
router.get('/:id', authenticateToken, supplierController.getSupplierById);
router.post('/', authenticateToken, requireRole('Admin'), supplierController.createSupplier);
router.put('/:id', authenticateToken, requireRole('Admin'), supplierController.updateSupplier);
router.delete('/:id', authenticateToken, requireRole('Admin'), supplierController.deleteSupplier);

module.exports = router;
