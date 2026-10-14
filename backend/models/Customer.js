const pool = require('../db');
const crypto = require('crypto');

class Customer {

  // ======================================================
  // GET ALL CUSTOMERS
  // ======================================================

  static async findAll({ search = '' } = {}) {

    let query = `
      SELECT
        id,
        name,
        phone,
        email,
        pincode,
        address,
        outstanding_dues,
        created_at
      FROM customers
    `;

    const params = [];

    if (search) {
      query += `
        WHERE name LIKE ?
        OR phone LIKE ?
        OR email LIKE ?
        OR pincode LIKE ?
        OR address LIKE ?
      `;

      const term = `%${search}%`;

      params.push(
        term,
        term,
        term,
        term,
        term
      );
    }

    query += ` ORDER BY name ASC`;

    const [rows] = await pool.query(
      query,
      params
    );

    return rows;
  }


  // ======================================================
  // GET CUSTOMER BY ID
  // ======================================================

  static async findById(id) {

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        email,
        pincode,
        address,
        outstanding_dues,
        created_at
      FROM customers
      WHERE id = ?
      `,
      [id]
    );

    return rows[0] || null;
  }


  // ======================================================
  // FIND CUSTOMER FOR LOGIN
  // ======================================================
  // Customer email OR mobile number se login kar sakta hai.
  //
  // password_hash sirf authentication ke liye use hota hai.
  // Frontend response mein password_hash nahi bhejna hai.
  // ======================================================

  static async findByLogin(login) {

    const cleanLogin = String(login || '')
      .trim()
      .toLowerCase();

    const originalLogin = String(login || '')
      .trim();

    const [rows] = await pool.query(
      `
      SELECT
        id,
        name,
        phone,
        email,
        password_hash,
        is_active,
        pincode,
        address,
        outstanding_dues,
        created_at
      FROM customers
      WHERE LOWER(email) = ?
         OR phone = ?
      LIMIT 1
      `,
      [
        cleanLogin,
        originalLogin
      ]
    );

    return rows[0] || null;
  }


  // ======================================================
  // CREATE NORMAL CUSTOMER
  // ======================================================
  // Existing Admin Customer Management ke liye.
  //
  // Existing POS functionality ko disturb nahi karta.
  // ======================================================

  static async create(data) {

    const id = crypto.randomUUID();

    const {
      name,
      phone = '',
      email = '',
      pincode = '',
      address = '',
      outstanding_dues = 0,
      current_balance = 0
    } = data;

    const dues =
      outstanding_dues || current_balance || 0;

    await pool.query(
      `
      INSERT INTO customers
      (
        id,
        name,
        phone,
        email,
        pincode,
        address,
        outstanding_dues
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        name,
        phone,
        email,
        pincode,
        address,
        dues
      ]
    );

    return this.findById(id);
  }


  // ======================================================
  // CREATE CUSTOMER ACCOUNT
  // ======================================================
  // Customer registration page ke liye.
  //
  // Password already bcrypt hash ke form mein
  // controller se receive hota hai.
  // ======================================================

  static async createAccount(data) {

    const id = crypto.randomUUID();

    const {
      name,
      phone,
      email,
      password_hash,
      pincode,
      address = ''
    } = data;

    await pool.query(
      `
      INSERT INTO customers
      (
        id,
        name,
        phone,
        email,
        password_hash,
        is_active,
        pincode,
        address,
        outstanding_dues
      )
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, 0)
      `,
      [
        id,
        name,
        phone,
        email,
        password_hash,
        pincode,
        address
      ]
    );

    return this.findById(id);
  }


  // ======================================================
  // UPDATE LAST LOGIN
  // ======================================================

  static async updateLastLogin(id) {

    await pool.query(
      `
      UPDATE customers
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [id]
    );

    return true;
  }


  // ======================================================
  // UPDATE CUSTOMER
  // ======================================================

  static async update(id, data) {

    const {
      name,
      phone,
      email,
      pincode,
      address,
      outstanding_dues,
      current_balance
    } = data;

    const dues =
      outstanding_dues !== undefined
        ? outstanding_dues
        : current_balance;

    await pool.query(
      `
      UPDATE customers
      SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        pincode = COALESCE(?, pincode),
        address = COALESCE(?, address),
        outstanding_dues = COALESCE(?, outstanding_dues)
      WHERE id = ?
      `,
      [
        name,
        phone,
        email,
        pincode,
        address,
        dues,
        id
      ]
    );

    return this.findById(id);
  }


  // ======================================================
  // DELETE CUSTOMER
  // ======================================================

  static async delete(id) {

    const [res] = await pool.query(
      'DELETE FROM customers WHERE id = ?',
      [id]
    );

    return res.affectedRows > 0;
  }
}

module.exports = Customer;
