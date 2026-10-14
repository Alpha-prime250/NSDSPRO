const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, reportController.getDashboard);
router.get('/analytics', authenticateToken, requireRole('Admin'), reportController.getAnalytics);

module.exports = router;
