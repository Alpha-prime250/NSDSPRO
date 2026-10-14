const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public read (shop branding, tax, currency needed for storefront & receipt)
router.get('/', settingController.getSettings);

// Admin-only updates
router.put('/', authenticateToken, requireRole('Admin'), settingController.updateSettings);

module.exports = router;
