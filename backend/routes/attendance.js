const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

// ========================================
// GET ALL ATTENDANCE
// GET /api/attendance
// ========================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        attendance.id,
        attendance.staff_id,
        staff.name AS staff_name,
        staff.role AS staff_role,
        attendance.attendance_date,
        attendance.status,
        attendance.created_at
      FROM attendance
      LEFT JOIN staff
        ON attendance.staff_id = staff.id
      ORDER BY attendance.attendance_date DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error('Get Attendance Error:', error);

    res.status(500).json({
      error: 'Failed to fetch attendance',
      message: error.message
    });
  }
});

// ========================================
// GET ATTENDANCE BY STAFF
// GET /api/attendance/staff/:staffId
// ========================================
router.get('/staff/:staffId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        attendance.*,
        staff.name AS staff_name,
        staff.role AS staff_role
      FROM attendance
      LEFT JOIN staff
        ON attendance.staff_id = staff.id
      WHERE attendance.staff_id = ?
      ORDER BY attendance.attendance_date DESC
    `, [req.params.staffId]);

    res.json(rows);

  } catch (error) {
    console.error('Get Staff Attendance Error:', error);

    res.status(500).json({
      error: 'Failed to fetch staff attendance',
      message: error.message
    });
  }
});

// ========================================
// ADD ATTENDANCE
// POST /api/attendance
// ========================================
router.post('/', async (req, res) => {
  try {
    const {
      staff_id,
      attendance_date,
      status
    } = req.body;

    if (!staff_id) {
      return res.status(400).json({
        error: 'Staff is required'
      });
    }

    if (!attendance_date) {
      return res.status(400).json({
        error: 'Attendance date is required'
      });
    }

    const validStatus = [
      'Present',
      'Absent',
      'Half Day'
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: 'Invalid attendance status'
      });
    }

    // Check staff exists
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
      INSERT INTO attendance
      (
        id,
        staff_id,
        attendance_date,
        status
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        id,
        staff_id,
        attendance_date,
        status
      ]
    );

    const [newAttendance] = await pool.query(
      'SELECT * FROM attendance WHERE id = ?',
      [id]
    );

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: newAttendance[0]
    });

  } catch (error) {
    console.error('Add Attendance Error:', error);

    res.status(500).json({
      error: 'Failed to mark attendance',
      message: error.message
    });
  }
});

// ========================================
// UPDATE ATTENDANCE
// PUT /api/attendance/:id
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const {
      attendance_date,
      status
    } = req.body;

    const validStatus = [
      'Present',
      'Absent',
      'Half Day'
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: 'Invalid attendance status'
      });
    }

    const [result] = await pool.query(
      `
      UPDATE attendance
      SET
        attendance_date = ?,
        status = ?
      WHERE id = ?
      `,
      [
        attendance_date,
        status,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance updated successfully'
    });

  } catch (error) {
    console.error('Update Attendance Error:', error);

    res.status(500).json({
      error: 'Failed to update attendance',
      message: error.message
    });
  }
});

// ========================================
// DELETE ATTENDANCE
// DELETE /api/attendance/:id
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM attendance WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance deleted successfully'
    });

  } catch (error) {
    console.error('Delete Attendance Error:', error);

    res.status(500).json({
      error: 'Failed to delete attendance',
      message: error.message
    });
  }
});

module.exports = router;
