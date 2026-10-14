const pool = require('../db');
const crypto = require('crypto');

class Shift {
  static async findActiveShift() {
    const [rows] = await pool.query("SELECT * FROM cash_shifts WHERE status = 'Open' ORDER BY opened_at DESC LIMIT 1");
    if (rows.length === 0) return null;

    const currentShift = rows[0];

    // Calculate cash sales completed during this shift
    const [salesRows] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as cash_sales FROM sales WHERE payment_mode = 'Cash' AND created_at >= ?",
      [currentShift.opened_at]
    );

    const cashSales = Number(salesRows[0].cash_sales || 0);
    const expectedCash = Number(currentShift.opening_cash) + cashSales;

    return {
      ...currentShift,
      cash_sales: cashSales,
      expected_cash: expectedCash
    };
  }

  static async open({ user_name = 'Cashier', opening_cash = 0 }) {
    const active = await this.findActiveShift();
    if (active) {
      throw new Error('A shift is already open. Please close it first.');
    }

    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO cash_shifts (id, user_name, opening_cash, status) VALUES (?, ?, ?, ?)',
      [id, user_name, opening_cash, 'Open']
    );

    const [created] = await pool.query('SELECT * FROM cash_shifts WHERE id = ?', [id]);
    return created[0];
  }

  static async close({ id, closing_cash }) {
    const [shiftRows] = await pool.query('SELECT * FROM cash_shifts WHERE id = ? AND status = "Open"', [id]);
    if (shiftRows.length === 0) {
      throw new Error('Open shift not found');
    }

    const shift = shiftRows[0];
    const [salesRows] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) as cash_sales FROM sales WHERE payment_mode = 'Cash' AND created_at >= ?",
      [shift.opened_at]
    );

    const cashSales = Number(salesRows[0].cash_sales || 0);
    const expectedCash = Number(shift.opening_cash) + cashSales;
    const actualCash = Number(closing_cash);
    const difference = actualCash - expectedCash;

    await pool.query(
      `UPDATE cash_shifts 
       SET closing_cash = ?, expected_cash = ?, difference = ?, status = 'Closed', closed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [actualCash, expectedCash, difference, id]
    );

    const [closed] = await pool.query('SELECT * FROM cash_shifts WHERE id = ?', [id]);
    return closed[0];
  }

  static async findAll(limit = 30) {
    const [rows] = await pool.query('SELECT * FROM cash_shifts ORDER BY opened_at DESC LIMIT ?', [parseInt(limit, 10)]);
    return rows;
  }
}

module.exports = Shift;
