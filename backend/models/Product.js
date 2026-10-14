const pool = require('../db');
const crypto = require('crypto');

class Product {
  static async findAll({ search = '', category = '', limit = 100 } = {}) {
    let query = `
      SELECT 
        id, name, category, barcode, purchase_price, selling_price,
        purchase_price as cost_price, selling_price as price,
        quantity as stock_quantity, quantity as stock, quantity, min_stock_level,
        supplier_id, supplier_name, mfg_date, expiry_date, unit, created_at, updated_at
      FROM products 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR barcode LIKE ? OR category LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY name ASC LIMIT ?';
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT 
        id, name, category, barcode, purchase_price, selling_price,
        purchase_price as cost_price, selling_price as price,
        quantity as stock_quantity, quantity as stock, quantity, min_stock_level,
        supplier_id, supplier_name, mfg_date, expiry_date, unit, created_at, updated_at
      FROM products WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByBarcode(barcode) {
    const [rows] = await pool.query(
      `SELECT 
        id, name, category, barcode, purchase_price, selling_price,
        purchase_price as cost_price, selling_price as price,
        quantity as stock_quantity, quantity as stock, quantity, min_stock_level,
        supplier_id, supplier_name, mfg_date, expiry_date, unit, created_at, updated_at
      FROM products WHERE barcode = ? LIMIT 1`,
      [barcode]
    );
    return rows[0] || null;
  }

  static async findLowStock() {
    const [rows] = await pool.query(
      `SELECT 
        id, name, category, barcode, purchase_price, selling_price,
        quantity as stock_quantity, quantity, min_stock_level,
        supplier_id, supplier_name, mfg_date, expiry_date, unit, created_at, updated_at
      FROM products 
      WHERE quantity <= min_stock_level 
      ORDER BY quantity ASC`
    );
    return rows;
  }

  static async findExpiring({ days = 30 } = {}) {
    const numDays = parseInt(days, 10) || 30;
    const [rows] = await pool.query(
      `SELECT 
        id, name, category, barcode, purchase_price, selling_price,
        quantity as stock_quantity, quantity, min_stock_level,
        supplier_id, supplier_name, mfg_date, expiry_date, unit,
        DATEDIFF(expiry_date, CURRENT_DATE) as days_until_expiry,
        CASE 
          WHEN expiry_date < CURRENT_DATE THEN 'Expired'
          WHEN DATEDIFF(expiry_date, CURRENT_DATE) <= 7 THEN 'Critical'
          ELSE 'Expiring Soon'
        END as expiry_status
      FROM products 
      WHERE expiry_date IS NOT NULL 
        AND expiry_date <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
      ORDER BY expiry_date ASC`,
      [numDays]
    );
    return rows;
  }

  static async getCategories() {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category ASC');
    return rows.map(r => r.category).filter(Boolean);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    const {
      name,
      category = 'General',
      barcode = '',
      purchase_price = 0,
      selling_price = 0,
      stock_quantity = 0,
      quantity = 0,
      min_stock_level = 5,
      supplier_id = null,
      supplier_name = '',
      mfg_date = null,
      expiry_date = null,
      unit = 'pcs'
    } = data;

    const initialQty = stock_quantity || quantity || 0;
    const cleanMfgDate = (mfg_date && mfg_date !== '') ? mfg_date : null;
    const cleanExpiryDate = (expiry_date && expiry_date !== '') ? expiry_date : null;

    await pool.query(
      `INSERT INTO products 
      (id, name, category, barcode, purchase_price, selling_price, quantity, min_stock_level, supplier_id, supplier_name, mfg_date, expiry_date, unit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category, barcode, purchase_price, selling_price, initialQty, min_stock_level, supplier_id, supplier_name, cleanMfgDate, cleanExpiryDate, unit]
    );

    if (initialQty > 0) {
      await pool.query(
        'INSERT INTO stock_movements (id, product_id, movement_type, quantity, previous_quantity, new_quantity, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), id, 'IN', initialQty, 0, initialQty, 'Initial stock entry']
      );
    }

    return this.findById(id);
  }

  static async update(id, data) {
    const current = await this.findById(id);
    if (!current) return null;

    const {
      name,
      category,
      barcode,
      purchase_price,
      selling_price,
      stock_quantity,
      quantity,
      min_stock_level,
      supplier_id,
      supplier_name,
      mfg_date,
      expiry_date,
      unit
    } = data;

    const newQty = stock_quantity !== undefined ? stock_quantity : quantity;
    const finalMfgDate = mfg_date !== undefined ? ((mfg_date && mfg_date !== '') ? mfg_date : null) : current.mfg_date;
    const finalExpiryDate = expiry_date !== undefined ? ((expiry_date && expiry_date !== '') ? expiry_date : null) : current.expiry_date;

    await pool.query(
      `UPDATE products SET 
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        barcode = COALESCE(?, barcode),
        purchase_price = COALESCE(?, purchase_price),
        selling_price = COALESCE(?, selling_price),
        quantity = COALESCE(?, quantity),
        min_stock_level = COALESCE(?, min_stock_level),
        supplier_id = COALESCE(?, supplier_id),
        supplier_name = COALESCE(?, supplier_name),
        mfg_date = ?,
        expiry_date = ?,
        unit = COALESCE(?, unit)
      WHERE id = ?`,
      [name, category, barcode, purchase_price, selling_price, newQty, min_stock_level, supplier_id, supplier_name, finalMfgDate, finalExpiryDate, unit, id]
    );

    if (newQty !== undefined && newQty !== current.quantity) {
      const diff = newQty - current.quantity;
      await pool.query(
        'INSERT INTO stock_movements (id, product_id, movement_type, quantity, previous_quantity, new_quantity, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), id, 'ADJUSTMENT', diff, current.quantity, newQty, 'Manual stock adjustment']
      );
    }

    return this.findById(id);
  }

  static async delete(id) {
    const [res] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return res.affectedRows > 0;
  }
}

module.exports = Product;
