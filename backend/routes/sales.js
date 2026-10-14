const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, saleController.createSale);
router.get('/', authenticateToken, saleController.getAllSales);
router.get('/:id', authenticateToken, saleController.getSaleById);

module.exports = router;
