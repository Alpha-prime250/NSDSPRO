const pool = require('../db');
const crypto = require('crypto');
const AuditLog = require('./AuditLog');

class CustomerLedger {
  static async recordPayment(paymentData, staffUser = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        customer_id,
        amount,
        payment_mode = 'Cash',
        notes = 'Customer Dues Payment'
      } = paymentData;

      const numAmount = Number(amount);
      if (!customer_id || !numAmount || numAmount <= 0) {
        throw new Error('Valid customer ID and positive payment amount are required');
      }

      const [custRows] = await connection.query('SELECT * FROM customers WHERE id = ? FOR UPDATE', [customer_id]);
      if (custRows.length === 0) {
        throw new Error('Customer not found');
      }
      const customer = custRows[0];

      const currentDues = Number(customer.outstanding_dues || 0);
      const newDues = Math.max(0, Number((currentDues - numAmount).toFixed(2)));

      await connection.query('UPDATE customers SET outstanding_dues = ? WHERE id = ?', [newDues, customer_id]);

      // Generate Receipt Number RCP-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const [countResult] = await connection.query(
        "SELECT COUNT(*) as cnt FROM customer_ledger WHERE transaction_type = 'PAYMENT_CREDIT' AND DATE(created_at) = CURRENT_DATE"
      );
      const seq = String(countResult[0].cnt + 1).padStart(4, '0');
      const receipt_number = `RCP-${datePart}-${seq}`;

      const ledgerId = crypto.randomUUID();
      const createdBy = staffUser?.name || 'Staff Cashier';

      await connection.query(
        `INSERT INTO customer_ledger 
         (id, customer_id, transaction_type, reference_id, reference_number, amount, balance_after, payment_mode, notes, created_by) 
         VALUES (?, ?, 'PAYMENT_CREDIT', ?, ?, ?, ?, ?, ?, ?)`,
        [ledgerId, customer_id, ledgerId, receipt_number, numAmount, newDues, payment_mode, notes, createdBy]
      );

      await AuditLog.log({
        userId: staffUser?.id,
        userName: createdBy,
        action: 'CUSTOMER_PAYMENT_RECEIVED',
        entityType: 'Customer',
        entityId: customer_id,
        details: { customer_name: customer.name, amount_paid: numAmount, receipt_number, new_dues: newDues }
      });

      await connection.commit();

      return {
        success: true,
        id: ledgerId,
        receipt_number,
        customer_id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        amount_paid: numAmount,
        previous_dues: currentDues,
        remaining_dues: newDues,
        balance_remaining: newDues,
        payment_mode,
        notes,
        created_by: createdBy,
        created_at: new Date().toISOString()
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async addDebitEntry({ customerId, amount, referenceType, referenceNumber, notes, performedBy }, conn = pool) {
    const [custRows] = await conn.query('SELECT outstanding_dues FROM customers WHERE id = ? FOR UPDATE', [customerId]);
    if (custRows.length === 0) return;
    const currentDues = Number(custRows[0].outstanding_dues || 0);
    const newDues = Number((currentDues + Number(amount)).toFixed(2));
    await conn.query('UPDATE customers SET outstanding_dues = ? WHERE id = ?', [newDues, customerId]);
    await conn.query(
      `INSERT INTO customer_ledger 
       (id, customer_id, transaction_type, reference_id, reference_number, amount, balance_after, payment_mode, notes, created_by) 
       VALUES (?, ?, 'SALE_DEBIT', ?, ?, ?, ?, 'Credit', ?, ?)`,
      [crypto.randomUUID(), customerId, referenceNumber, referenceNumber, amount, newDues, notes || 'Credit Sale Debit', performedBy || 'Admin']
    );
  }

  static async addCreditEntry({ customerId, amount, referenceType, referenceNumber, notes, performedBy }, conn = pool) {
    const [custRows] = await conn.query('SELECT outstanding_dues FROM customers WHERE id = ? FOR UPDATE', [customerId]);
    if (custRows.length === 0) return;
    const currentDues = Number(custRows[0].outstanding_dues || 0);
    const newDues = Math.max(0, Number((currentDues - Number(amount)).toFixed(2)));
    await conn.query('UPDATE customers SET outstanding_dues = ? WHERE id = ?', [newDues, customerId]);
    await conn.query(
      `INSERT INTO customer_ledger 
       (id, customer_id, transaction_type, reference_id, reference_number, amount, balance_after, payment_mode, notes, created_by) 
       VALUES (?, ?, 'RETURN_CREDIT', ?, ?, ?, ?, 'Credit Adjustment', ?, ?)`,
      [crypto.randomUUID(), customerId, referenceNumber, referenceNumber, amount, newDues, notes || 'Credit Adjustment', performedBy || 'Admin']
    );
  }

  static async getLedger(customerId) {
    const [rows] = await pool.query(
      'SELECT * FROM customer_ledger WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );
    return rows;
  }
}

module.exports = CustomerLedger;
