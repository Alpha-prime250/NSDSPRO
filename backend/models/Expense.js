const pool = require('../db');
const crypto = require('crypto');

class Expense {
  static async findAll({ category = '', startDate = '', endDate = '' } = {}) {
    let query = 'SELECT id, title, category, amount, expense_date, payment_mode, notes, notes as note, created_at FROM expenses WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      query += ' AND expense_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND expense_date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY expense_date DESC, created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, title, category, amount, expense_date, payment_mode, notes, notes as note, created_at FROM expenses WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const id = crypto.randomUUID();
    const {
      title,
      category = 'General',
      amount,
      expense_date = new Date().toISOString().slice(0, 10),
      payment_mode = 'Cash',
      notes = '',
      note = ''
    } = data;

    const actualNotes = notes || note || '';

    await pool.query(
      'INSERT INTO expenses (id, title, category, amount, expense_date, payment_mode, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, category, amount, expense_date, payment_mode, actualNotes]
    );

    return this.findById(id);
  }

  static async delete(id) {
    const [res] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = Expense;
