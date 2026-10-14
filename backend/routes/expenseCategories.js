const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const pool = require('../db');
const {
  authenticateToken,
  requireRole
} = require('../middleware/auth');

// ============================================================
// GET ACTIVE EXPENSE CATEGORIES
// GET /api/expense-categories
// ============================================================

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        description,
        is_active,
        created_at
      FROM expense_categories
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    res.status(200).json(rows);

  } catch (error) {

    console.error(
      'GET EXPENSE CATEGORIES ERROR:',
      error
    );

    res.status(500).json({
      error: 'Failed to fetch expense categories',
      message: error.message
    });
  }
});

// ============================================================
// GET ALL EXPENSE CATEGORIES
// GET /api/expense-categories/all
// ============================================================

router.get('/all', authenticateToken, async (req, res) => {
  try {

    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        description,
        is_active,
        created_at
      FROM expense_categories
      ORDER BY
        is_active DESC,
        name ASC
    `);

    res.status(200).json(rows);

  } catch (error) {

    console.error(
      'GET ALL EXPENSE CATEGORIES ERROR:',
      error
    );

    res.status(500).json({
      error: 'Failed to fetch all expense categories',
      message: error.message
    });
  }
});

// ============================================================
// ADD NEW EXPENSE CATEGORY
// POST /api/expense-categories
// ============================================================

router.post('/', authenticateToken, async (req, res) => {

  try {

    const name = String(
      req.body.name || ''
    ).trim();

    const description = String(
      req.body.description || ''
    ).trim();

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {

      return res.status(400).json({
        error: 'Category name is required'
      });

    }

    if (name.length > 100) {

      return res.status(400).json({
        error:
          'Category name must be 100 characters or less'
      });

    }

    // --------------------------------------------------------
    // CHECK DUPLICATE CATEGORY
    // --------------------------------------------------------

    const [existingRows] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        is_active
      FROM expense_categories
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
      LIMIT 1
      `,
      [name]
    );

    // --------------------------------------------------------
    // CATEGORY ALREADY EXISTS
    // --------------------------------------------------------

    if (existingRows.length > 0) {

      const existing = existingRows[0];

      // If inactive, restore it
      if (Number(existing.is_active) === 0) {

        await pool.query(
          `
          UPDATE expense_categories
          SET
            name = ?,
            description = ?,
            is_active = 1
          WHERE id = ?
          `,
          [
            name,
            description || null,
            existing.id
          ]
        );

        const [restoredRows] =
          await pool.query(
            `
            SELECT
              id,
              name,
              description,
              is_active,
              created_at
            FROM expense_categories
            WHERE id = ?
            `,
            [existing.id]
          );

        return res.status(201).json({
          message:
            'Category restored successfully',
          category:
            restoredRows[0]
        });

      }

      return res.status(409).json({
        error:
          'Category already exists'
      });
    }

    // --------------------------------------------------------
    // CREATE UUID
    // --------------------------------------------------------

    const id = crypto.randomUUID();

    // --------------------------------------------------------
    // INSERT CATEGORY
    // --------------------------------------------------------

    await pool.query(
      `
      INSERT INTO expense_categories
      (
        id,
        name,
        description,
        is_active
      )
      VALUES
      (
        ?,
        ?,
        ?,
        1
      )
      `,
      [
        id,
        name,
        description || null
      ]
    );

    // --------------------------------------------------------
    // GET CREATED CATEGORY
    // --------------------------------------------------------

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        is_active,
        created_at
      FROM expense_categories
      WHERE id = ?
      `,
      [id]
    );

    return res.status(201).json({
      message:
        'Category added successfully',
      category: rows[0]
    });

  } catch (error) {

    console.error(
      'ADD EXPENSE CATEGORY ERROR:',
      error
    );

    // Duplicate database error
    if (
      error.code === 'ER_DUP_ENTRY'
    ) {

      return res.status(409).json({
        error:
          'Category already exists'
      });

    }

    return res.status(500).json({
      error:
        'Failed to add expense category',
      message: error.message
    });
  }
});

// ============================================================
// UPDATE EXPENSE CATEGORY
// PUT /api/expense-categories/:id
// ============================================================

router.put('/:id', authenticateToken, async (req, res) => {

  try {

    const { id } = req.params;

    const name = String(
      req.body.name || ''
    ).trim();

    const description = String(
      req.body.description || ''
    ).trim();

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {

      return res.status(400).json({
        error:
          'Category name is required'
      });

    }

    if (name.length > 100) {

      return res.status(400).json({
        error:
          'Category name must be 100 characters or less'
      });

    }

    // --------------------------------------------------------
    // CHECK CATEGORY EXISTS
    // --------------------------------------------------------

    const [categoryRows] =
      await pool.query(
        `
        SELECT
          id,
          name,
          is_active
        FROM expense_categories
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (categoryRows.length === 0) {

      return res.status(404).json({
        error:
          'Category not found'
      });

    }

    // --------------------------------------------------------
    // CHECK DUPLICATE NAME
    // --------------------------------------------------------

    const [duplicateRows] =
      await pool.query(
        `
        SELECT id
        FROM expense_categories
        WHERE
          LOWER(TRIM(name)) =
          LOWER(TRIM(?))
          AND id <> ?
        LIMIT 1
        `,
        [name, id]
      );

    if (duplicateRows.length > 0) {

      return res.status(409).json({
        error:
          'Another category with this name already exists'
      });

    }

    // --------------------------------------------------------
    // UPDATE CATEGORY
    // --------------------------------------------------------

    const [result] =
      await pool.query(
        `
        UPDATE expense_categories
        SET
          name = ?,
          description = ?
        WHERE id = ?
        `,
        [
          name,
          description || null,
          id
        ]
      );

    if (result.affectedRows === 0) {

      return res.status(404).json({
        error:
          'Category not found'
      });

    }

    // --------------------------------------------------------
    // RETURN UPDATED CATEGORY
    // --------------------------------------------------------

    const [rows] =
      await pool.query(
        `
        SELECT
          id,
          name,
          description,
          is_active,
          created_at
        FROM expense_categories
        WHERE id = ?
        `,
        [id]
      );

    return res.status(200).json({
      message:
        'Category updated successfully',
      category: rows[0]
    });

  } catch (error) {

    console.error(
      'UPDATE EXPENSE CATEGORY ERROR:',
      error
    );

    if (
      error.code === 'ER_DUP_ENTRY'
    ) {

      return res.status(409).json({
        error:
          'Category already exists'
      });

    }

    return res.status(500).json({
      error:
        'Failed to update expense category',
      message: error.message
    });
  }
});

// ============================================================
// DELETE EXPENSE CATEGORY
// DELETE /api/expense-categories/:id
// ============================================================

router.delete(
  '/:id',
  authenticateToken,
  requireRole('Admin'),
  async (req, res) => {

    try {

      const { id } = req.params;

      // ------------------------------------------------------
      // FIND CATEGORY
      // ------------------------------------------------------

      const [categoryRows] =
        await pool.query(
          `
          SELECT
            id,
            name,
            is_active
          FROM expense_categories
          WHERE id = ?
          LIMIT 1
          `,
          [id]
        );

      if (categoryRows.length === 0) {

        return res.status(404).json({
          error:
            'Category not found'
        });

      }

      const category =
        categoryRows[0];

      const categoryName =
        category.name;

      // ------------------------------------------------------
      // CHECK IF CATEGORY IS USED
      // ------------------------------------------------------

      const [usedRows] =
        await pool.query(
          `
          SELECT
            COUNT(*) AS total
          FROM expenses
          WHERE category = ?
          `,
          [categoryName]
        );

      const usedCount =
        Number(
          usedRows[0]?.total || 0
        );

      // ------------------------------------------------------
      // DON'T DELETE USED CATEGORY
      // ------------------------------------------------------

      if (usedCount > 0) {

        return res.status(409).json({
          error:
            `Category "${categoryName}" is already used by ${usedCount} expense record(s). It cannot be deleted.`,
          usedCount
        });

      }

      // ------------------------------------------------------
      // DELETE CATEGORY
      // ------------------------------------------------------

      const [result] =
        await pool.query(
          `
          DELETE FROM expense_categories
          WHERE id = ?
          `,
          [id]
        );

      if (result.affectedRows === 0) {

        return res.status(404).json({
          error:
            'Category not found'
        });

      }

      return res.status(200).json({
        message:
          'Category deleted successfully',
        deletedCategory:
          categoryName
      });

    } catch (error) {

      console.error(
        'DELETE EXPENSE CATEGORY ERROR:',
        error
      );

      return res.status(500).json({
        error:
          'Failed to delete expense category',
        message: error.message
      });
    }
  }
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
