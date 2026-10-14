const express = require('express');
const router = express.Router();

// MySQL connection
const db = require('../db');

// ==========================================
// GET ALL ACTIVE STAFF ROLES
// GET /api/staff-roles
// ==========================================
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, role_name, status, created_at
       FROM staff_roles
       WHERE status = 'active'
       ORDER BY role_name ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error('Get staff roles error:', error);
    res.status(500).json({
      error: 'Failed to fetch staff roles',
      message: error.message
    });
  }
});

// ==========================================
// GET SINGLE STAFF ROLE
// GET /api/staff-roles/:id
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT id, role_name, status, created_at
       FROM staff_roles
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Staff role not found'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get staff role error:', error);
    res.status(500).json({
      error: 'Failed to fetch staff role',
      message: error.message
    });
  }
});

// ==========================================
// ADD NEW STAFF ROLE
// POST /api/staff-roles
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { role_name, status = 'active' } = req.body;

    if (!role_name || !role_name.trim()) {
      return res.status(400).json({
        error: 'Role name is required'
      });
    }

    const roleName = role_name.trim();

    // Check duplicate role
    const [existing] = await db.query(
      `SELECT id
       FROM staff_roles
       WHERE LOWER(role_name) = LOWER(?)`,
      [roleName]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Staff role already exists'
      });
    }

    const [result] = await db.query(
      `INSERT INTO staff_roles (role_name, status)
       VALUES (?, ?)`,
      [roleName, status === 'inactive' ? 'inactive' : 'active']
    );

    const [newRole] = await db.query(
      `SELECT id, role_name, status, created_at
       FROM staff_roles
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(newRole[0]);
  } catch (error) {
    console.error('Create staff role error:', error);
    res.status(500).json({
      error: 'Failed to create staff role',
      message: error.message
    });
  }
});

// ==========================================
// UPDATE STAFF ROLE
// PUT /api/staff-roles/:id
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, status } = req.body;

    if (!role_name || !role_name.trim()) {
      return res.status(400).json({
        error: 'Role name is required'
      });
    }

    const roleName = role_name.trim();

    // Check role exists
    const [roleExists] = await db.query(
      `SELECT id
       FROM staff_roles
       WHERE id = ?`,
      [id]
    );

    if (roleExists.length === 0) {
      return res.status(404).json({
        error: 'Staff role not found'
      });
    }

    // Check duplicate name
    const [duplicate] = await db.query(
      `SELECT id
       FROM staff_roles
       WHERE LOWER(role_name) = LOWER(?)
       AND id != ?`,
      [roleName, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        error: 'Another staff role with this name already exists'
      });
    }

    const newStatus =
      status === 'inactive' ? 'inactive' : 'active';

    await db.query(
      `UPDATE staff_roles
       SET role_name = ?, status = ?
       WHERE id = ?`,
      [roleName, newStatus, id]
    );

    const [updatedRole] = await db.query(
      `SELECT id, role_name, status, created_at
       FROM staff_roles
       WHERE id = ?`,
      [id]
    );

    res.json(updatedRole[0]);
  } catch (error) {
    console.error('Update staff role error:', error);
    res.status(500).json({
      error: 'Failed to update staff role',
      message: error.message
    });
  }
});

// ==========================================
// DELETE STAFF ROLE
// DELETE /api/staff-roles/:id
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check role exists
    const [roleExists] = await db.query(
      `SELECT id
       FROM staff_roles
       WHERE id = ?`,
      [id]
    );

    if (roleExists.length === 0) {
      return res.status(404).json({
        error: 'Staff role not found'
      });
    }

    // Soft delete - role remains in database
    // but will not appear in active dropdown
    await db.query(
      `UPDATE staff_roles
       SET status = 'inactive'
       WHERE id = ?`,
      [id]
    );

    res.json({
      message: 'Staff role deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff role error:', error);
    res.status(500).json({
      error: 'Failed to delete staff role',
      message: error.message
    });
  }
});

module.exports = router;
