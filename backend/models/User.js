const pool = require('../db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class User {
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT id, username, password, role, name, pin FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    return rows[0] || null;
  }

  static async findByPin(pin) {
    // Check all active users and compare bcrypt hash
    const [rows] = await pool.query(
      'SELECT id, username, password, role, name, pin FROM users'
    );
    for (const u of rows) {
      if (u.pin) {
        const isMatch = await bcrypt.compare(pin, u.pin).catch(() => false);
        if (isMatch) return u;
      }
    }
    return null;
  }

  static async verifyPassword(user, plainPassword) {
    if (!user || !user.password) return false;
    return await bcrypt.compare(plainPassword, user.password).catch(() => false);
  }

  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, username, role, name, created_at FROM users ORDER BY created_at ASC'
    );
    return rows;
  }

  static async create(data) {
    const id = crypto.randomUUID();
    const { username, password = '', role = 'Cashier', name, pin = '' } = data;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';
    const hashedPin = pin ? await bcrypt.hash(pin, 10) : '';

    await pool.query(
      'INSERT INTO users (id, username, password, role, name, pin) VALUES (?, ?, ?, ?, ?, ?)',
      [id, username, hashedPassword, role, name, hashedPin]
    );

    const [rows] = await pool.query('SELECT id, username, role, name, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async delete(id) {
    const [res] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = User;
