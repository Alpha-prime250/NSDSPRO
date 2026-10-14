const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, expenseController.getAllExpenses);
router.post('/', authenticateToken, expenseController.createExpense);
router.delete('/:id', authenticateToken, requireRole('Admin'), expenseController.deleteExpense);

module.exports = router;
