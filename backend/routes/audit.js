const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, requireRole('Admin'), async (req, res) => {
  try {
    const logs = await AuditLog.getRecent(req.query.limit || 100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs', message: err.message });
  }
});

module.exports = router;
