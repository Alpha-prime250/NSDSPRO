const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, returnController.getAllReturns);
router.get('/:id', authenticateToken, returnController.getReturnById);
router.post('/', authenticateToken, returnController.createReturn);

module.exports = router;
