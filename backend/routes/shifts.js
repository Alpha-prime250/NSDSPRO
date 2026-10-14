const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { authenticateToken } = require('../middleware/auth');

router.get('/current', authenticateToken, shiftController.getCurrentShift);
router.post('/open', authenticateToken, shiftController.openShift);
router.post('/close', authenticateToken, shiftController.closeShift);
router.get('/', authenticateToken, shiftController.getAllShifts);

module.exports = router;
