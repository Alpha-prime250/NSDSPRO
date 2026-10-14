const pool = require('../db');
const crypto = require('crypto');
const AuditLog = require('./AuditLog');

class Return {
  static async createReturn(returnData, staffUser = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        sale_id,
        reason = 'Customer Return / Damaged Goods',
        refund_mode = 'Cash',
        refund_method = 'Cash',
        items = []
      } = returnData;

      const finalRefundMode = returnData.refund_mode || returnData.refund_method || 'Cash';

      if (!sale_id) {
        throw new Error('Original Sale ID is required to process return');
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Return must specify at least one product to return');
      }

      // Check original sale
      const [sales] = await connection.query('SELECT * FROM sales WHERE id = ?', [sale_id]);
      if (sales.length === 0) {
        throw new Error('Original sale invoice not found');
      }
      const sale = sales[0];

      // Generate Return ID e.g. RET-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as cnt FROM returns WHERE DATE(created_at) = CURRENT_DATE'
      );
      const seq = String(countResult[0].cnt + 1).padStart(4, '0');
      const return_number = `RET-${datePart}-${seq}`;

      let totalRefund = 0;
      const verifiedItems = [];

      for (const item of items) {
        const qty = Number(item.quantity);
        const price = Number(item.unit_price);
        if (!item.product_id || qty <= 0) {
          throw new Error('Each returned item must have a valid product and positive quantity');
        }

        let prodName = item.product_name;
        if (!prodName) {
          const [pRows] = await connection.query('SELECT name FROM products WHERE id = ?', [item.product_id]);
          if (pRows.length > 0) prodName = pRows[0].name;
          else prodName = 'Product ' + item.product_id;
        }

        const lineRefund = Number((qty * price).toFixed(2));
        totalRefund += lineRefund;

        verifiedItems.push({
          product_id: item.product_id,
          product_name: prodName,
          quantity: qty,
          unit_price: price,
          total_refund: lineRefund
        });
      }

      const returnId = crypto.randomUUID();
      const processedBy = staffUser?.name || 'Staff Cashier';

      // Insert return header
      await connection.query(
        `INSERT INTO returns 
        (id, return_number, sale_id, invoice_number, customer_id, customer_name, total_refund_amount, refund_mode, reason, processed_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [returnId, return_number, sale.id, sale.invoice_number, sale.customer_id, sale.customer_name, totalRefund, finalRefundMode, reason, processedBy]
      );

      // Insert return items, restore stock, log movement
      for (const item of verifiedItems) {
        const returnItemId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO return_items (id, return_id, product_id, product_name, quantity, unit_price, total_refund) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [returnItemId, returnId, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_refund]
        );

        // Fetch current stock and restore
        const [prodRows] = await connection.query('SELECT quantity FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
        if (prodRows.length > 0) {
          const currentStock = prodRows[0].quantity;
          const newStock = currentStock + item.quantity;

          await connection.query('UPDATE products SET quantity = ? WHERE id = ?', [newStock, item.product_id]);

          await connection.query(
            `INSERT INTO stock_movements (id, product_id, movement_type, quantity, previous_quantity, new_quantity, note) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), item.product_id, 'IN', item.quantity, currentStock, newStock, `Restocked via Return ${return_number} (Inv: ${sale.invoice_number})`]
          );
        }
      }

      // Update sale return_status
      await connection.query(
        'UPDATE sales SET return_status = ? WHERE id = ?',
        ['Returned', sale.id]
      );

      // If customer has ledger credit adjustment
      if (sale.customer_id && (finalRefundMode === 'Credit Note' || finalRefundMode === 'Ledger Adjustment')) {
        const CustomerLedger = require('./CustomerLedger');
        await CustomerLedger.addCreditEntry({
          customerId: sale.customer_id,
          amount: totalRefund,
          referenceType: 'RETURN',
          referenceNumber: return_number,
          notes: `Credit adjustment for returned goods against Invoice ${sale.invoice_number}`,
          performedBy: processedBy
        }, connection);
      }

      await AuditLog.log({
        userId: staffUser?.id,
        userName: processedBy,
        action: 'RETURN_PROCESSED',
        entityType: 'Return',
        entityId: returnId,
        details: { return_number, invoice_number: sale.invoice_number, total_refund: totalRefund, refund_mode: finalRefundMode }
      });

      await connection.commit();
      const created = await this.findById(returnId, connection);
      return { success: true, refund_amount: totalRefund, ...created };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async findAll({ search = '', limit = 50 } = {}) {
    let query = 'SELECT * FROM returns WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (return_number LIKE ? OR invoice_number LIKE ? OR customer_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id, conn = pool) {
    const [returns] = await conn.query('SELECT * FROM returns WHERE id = ? OR return_number = ?', [id, id]);
    if (returns.length === 0) return null;

    const ret = returns[0];
    const [items] = await conn.query('SELECT * FROM return_items WHERE return_id = ?', [ret.id]);
    ret.items = items;
    return ret;
  }
}

module.exports = Return;
