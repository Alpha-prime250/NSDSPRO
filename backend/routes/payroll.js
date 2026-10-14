const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

// ========================================
// GET ALL PAYROLL
// GET /api/payroll
// ========================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        payroll.id,
        payroll.staff_id,
        staff.name AS staff_name,
        staff.role AS staff_role,
        payroll.salary_amount,
        payroll.payment_date,
        payroll.month,
        payroll.payment_status,
        payroll.created_at
      FROM payroll
      LEFT JOIN staff
        ON payroll.staff_id = staff.id
      ORDER BY payroll.payment_date DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error('Get Payroll Error:', error);

    res.status(500).json({
      error: 'Failed to fetch payroll',
      message: error.message
    });
  }
});

// ========================================
// GET PAYROLL BY STAFF
// GET /api/payroll/staff/:staffId
// ========================================
router.get('/staff/:staffId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM payroll
      WHERE staff_id = ?
      ORDER BY payment_date DESC
    `, [req.params.staffId]);

    res.json(rows);

  } catch (error) {
    console.error('Get Staff Payroll Error:', error);

    res.status(500).json({
      error: 'Failed to fetch staff payroll',
      message: error.message
    });
  }
});

// ========================================
// GET SINGLE PAYROLL
// GET /api/payroll/:id
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payroll WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Payroll record not found'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Get Payroll Error:', error);

    res.status(500).json({
      error: 'Failed to fetch payroll',
      message: error.message
    });
  }
});

// ========================================
// CREATE PAYROLL
// POST /api/payroll
// ========================================
router.post('/', async (req, res) => {
  try {
    const {
      staff_id,
      salary_amount,
      payment_date,
      month,
      payment_status
    } = req.body;

    if (!staff_id) {
      return res.status(400).json({
        error: 'Staff is required'
      });
    }

    if (!payment_date) {
      return res.status(400).json({
        error: 'Payment date is required'
      });
    }

    if (!month) {
      return res.status(400).json({
        error: 'Month is required'
      });
    }

    const validStatus = [
      'Paid',
      'Pending'
    ];

    const finalStatus =
      payment_status || 'Pending';

    if (!validStatus.includes(finalStatus)) {
      return res.status(400).json({
        error: 'Invalid payment status'
      });
    }

    // Check staff
    const [staff] = await pool.query(
      'SELECT id FROM staff WHERE id = ?',
      [staff_id]
    );

    if (staff.length === 0) {
      return res.status(404).json({
        error: 'Staff member not found'
      });
    }

    const id = crypto.randomUUID();

    await pool.query(
      `
      INSERT INTO payroll
      (
        id,
        staff_id,
        salary_amount,
        payment_date,
        month,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        staff_id,
        Number(salary_amount || 0),
        payment_date,
        month,
        finalStatus
      ]
    );

    const [newPayroll] = await pool.query(
      'SELECT * FROM payroll WHERE id = ?',
      [id]
    );

    res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      payroll: newPayroll[0]
    });

  } catch (error) {
    console.error('Create Payroll Error:', error);

    res.status(500).json({
      error: 'Failed to create payroll',
      message: error.message
    });
  }
});

// ========================================
// UPDATE PAYROLL
// PUT /api/payroll/:id
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const {
      salary_amount,
      payment_date,
      month,
      payment_status
    } = req.body;

    const validStatus = [
      'Paid',
      'Pending'
    ];

    if (!validStatus.includes(payment_status)) {
      return res.status(400).json({
        error: 'Invalid payment status'
      });
    }

    const [result] = await pool.query(
      `
      UPDATE payroll
      SET
        salary_amount = ?,
        payment_date = ?,
        month = ?,
        payment_status = ?
      WHERE id = ?
      `,
      [
        Number(salary_amount || 0),
        payment_date,
        month,
        payment_status,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Payroll record not found'
      });
    }

    res.json({
      success: true,
      message: 'Payroll updated successfully'
    });

  } catch (error) {
    console.error('Update Payroll Error:', error);

    res.status(500).json({
      error: 'Failed to update payroll',
      message: error.message
    });
  }
});

// ========================================
// DELETE PAYROLL
// DELETE /api/payroll/:id
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM payroll WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Payroll record not found'
      });
    }

    res.json({
      success: true,
      message: 'Payroll deleted successfully'
    });

  } catch (error) {
    console.error('Delete Payroll Error:', error);

    res.status(500).json({
      error: 'Failed to delete payroll',
      message: error.message
    });
  }
});

module.exports = router;
