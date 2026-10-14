const pool = require('../db');
const crypto = require('crypto');

class Supplier {
  static async findAll({ search = '' } = {}) {
    let query = 'SELECT * FROM suppliers';
    const params = [];

    if (search) {
      query += ' WHERE name LIKE ? OR company_name LIKE ? OR phone LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY name ASC';
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const id = crypto.randomUUID();
    const { name, company_name = '', phone = '', email = '', address = '' } = data;

    await pool.query(
      'INSERT INTO suppliers (id, name, company_name, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, company_name, phone, email, address]
    );

    return this.findById(id);
  }

  static async update(id, data) {
    const { name, company_name, phone, email, address } = data;
    await pool.query(
      `UPDATE suppliers SET 
        name = COALESCE(?, name),
        company_name = COALESCE(?, company_name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address)
      WHERE id = ?`,
      [name, company_name, phone, email, address, id]
    );
    return this.findById(id);
  }

  static async delete(id) {
    const [res] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = Supplier;
