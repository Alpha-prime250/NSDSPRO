const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// POST /api/auth/login - Public: Manager credentials or Cashier PIN
router.post('/login', authController.login);

// Protected Staff User Management
router.get('/users', authenticateToken, requireRole('Admin'), authController.getAllUsers);
router.post('/users', authenticateToken, requireRole('Admin'), authController.createUser);
router.delete('/users/:id', authenticateToken, requireRole('Admin'), authController.deleteUser);

module.exports = router;
