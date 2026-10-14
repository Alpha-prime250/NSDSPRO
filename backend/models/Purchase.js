const pool = require('../db');
const crypto = require('crypto');
const AuditLog = require('./AuditLog');

class Purchase {
  static async createPurchase(purchaseData, staffUser = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        supplier_id = null,
        supplier_name,
        supplier_invoice_number = '',
        invoice_number = '',
        payment_status = 'Paid',
        payment_mode = 'Cash',
        payment_method = 'Cash',
        paid_amount,
        notes = '',
        items = []
      } = purchaseData;

      let resolvedSupplierName = supplier_name;
      if (!resolvedSupplierName && supplier_id) {
        const [supp] = await connection.query('SELECT name FROM suppliers WHERE id = ?', [supplier_id]);
        if (supp.length > 0) resolvedSupplierName = supp[0].name;
      }
      if (!resolvedSupplierName) {
        resolvedSupplierName = 'General Supplier';
      }

      const finalInvoiceNumber = supplier_invoice_number || invoice_number || '';
      const finalPaymentMode = payment_mode || payment_method || 'Cash';

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Purchase must contain at least one item');
      }

      // Generate Purchase Number e.g. PO-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as cnt FROM purchases WHERE DATE(created_at) = CURRENT_DATE'
      );
      const seq = String(countResult[0].cnt + 1).padStart(4, '0');
      const purchase_number = `PO-${datePart}-${seq}`;

      let totalAmount = 0;
      const verifiedItems = [];

      for (const item of items) {
        const qty = Number(item.quantity);
        const cost = Number(item.unit_cost);
        if (!item.product_id || qty <= 0 || cost < 0) {
          throw new Error('Each purchase item must have a valid product, positive quantity, and non-negative cost');
        }

        let prodName = item.product_name;
        if (!prodName) {
          const [pRows] = await connection.query('SELECT name FROM products WHERE id = ?', [item.product_id]);
          if (pRows.length > 0) prodName = pRows[0].name;
          else prodName = 'Product ' + item.product_id;
        }

        const lineTotal = Number((qty * cost).toFixed(2));
        totalAmount += lineTotal;

        verifiedItems.push({
          product_id: item.product_id,
          product_name: prodName,
          quantity: qty,
          unit_cost: cost,
          total_cost: lineTotal
        });
      }

      const purchaseId = crypto.randomUUID();
      const createdBy = staffUser?.name || 'Admin';

      // Insert purchase header
      await connection.query(
        `INSERT INTO purchases 
        (id, purchase_number, supplier_id, supplier_name, supplier_invoice_number, total_amount, payment_status, payment_mode, notes, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [purchaseId, purchase_number, supplier_id, resolvedSupplierName, finalInvoiceNumber, totalAmount, payment_status, finalPaymentMode, notes, createdBy]
      );

      // Insert items, update inventory stock, log stock movement
      for (const item of verifiedItems) {
        const itemId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO purchase_items (id, purchase_id, product_id, product_name, quantity, unit_cost, total_cost) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [itemId, purchaseId, item.product_id, item.product_name, item.quantity, item.unit_cost, item.total_cost]
        );

        // Fetch current stock
        const [prodRows] = await connection.query('SELECT quantity, name FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (prodRows.length > 0) {
          const currentStock = prodRows[0].quantity;
          const newStock = currentStock + item.quantity;

          await connection.query(
            'UPDATE products SET quantity = ?, purchase_price = ? WHERE id = ?',
            [newStock, item.unit_cost, item.product_id]
          );

          await connection.query(
            `INSERT INTO stock_movements (id, product_id, movement_type, quantity, previous_quantity, new_quantity, note) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), item.product_id, 'IN', item.quantity, currentStock, newStock, `Received via PO ${purchase_number}${finalInvoiceNumber ? ` (Inv: ${finalInvoiceNumber})` : ''}`]
          );
        }
      }

      await AuditLog.log({
        userId: staffUser?.id,
        userName: createdBy,
        action: 'GOODS_RECEIVED',
        entityType: 'Purchase',
        entityId: purchaseId,
        details: { purchase_number, supplier_name: resolvedSupplierName, total_amount: totalAmount, items_count: verifiedItems.length }
      });

      await connection.commit();
      const created = await this.findById(purchaseId, connection);
      return { success: true, ...created };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async findAll({ search = '', limit = 50 } = {}) {
    let query = 'SELECT * FROM purchases WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (purchase_number LIKE ? OR supplier_name LIKE ? OR supplier_invoice_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id, conn = pool) {
    const [purchases] = await conn.query('SELECT * FROM purchases WHERE id = ? OR purchase_number = ?', [id, id]);
    if (purchases.length === 0) return null;

    const purchase = purchases[0];
    const [items] = await conn.query('SELECT * FROM purchase_items WHERE purchase_id = ?', [purchase.id]);
    purchase.items = items;
    return purchase;
  }
}

module.exports = Purchase;
