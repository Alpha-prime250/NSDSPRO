const express = require('express');
const router = express.Router();

const saleController = require('../controllers/saleController');
const { authenticateToken } = require('../middleware/auth');

/*
|--------------------------------------------------------------------------
| SALES ROUTES
|--------------------------------------------------------------------------
| Online billing + Offline queued billing sync
|--------------------------------------------------------------------------
*/

/**
 * CREATE SALE
 * Normal online POS billing
 */
router.post(
  '/',
  authenticateToken,
  saleController.createSale
);

/**
 * SYNC OFFLINE SALES
 * Used when pending offline bills are sent to backend
 * after internet/backend becomes available.
 */
router.post(
  '/sync',
  authenticateToken,
  saleController.createSale
);

/**
 * GET ALL SALES
 * Sales History
 */
router.get(
  '/',
  authenticateToken,
  saleController.getAllSales
);

/**
 * GET SINGLE SALE
 * Invoice details
 */
router.get(
  '/:id',
  authenticateToken,
  saleController.getSaleById
);

module.exports = router;