const pool = require('../db');
const crypto = require('crypto');
const Setting = require('./Setting');
const AuditLog = require('./AuditLog');

class Sale {
  static async createAtomicSale(saleData, staffUser = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        customer_id = null,
        customer_name = 'Walk-in Customer',
        customer_phone = null,
        discount_amount = 0,
        payment_mode = 'Cash',
        payment_split = null,
        received_amount = null,
        amount_paid = null,
        items = [],
        notes = ''
      } = saleData;

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Sale must contain at least one item');
      }

      // 1. Get Active Open Shift
      const [openShifts] = await connection.query(
        "SELECT id FROM cash_shifts WHERE status = 'Open' ORDER BY opened_at DESC LIMIT 1"
      );
      const shiftId = openShifts.length > 0 ? openShifts[0].id : null;

      // 2. Fetch Shop Settings for Tax Calculation
      const settings = await Setting.get();
      const defaultTaxPercent = Number(settings.tax_rate || settings.default_tax_percent || 0);

      // 3. Extract and Lock Products FOR UPDATE
      const productIds = items.map(it => it.product_id).filter(Boolean);
      if (productIds.length === 0) {
        throw new Error('All sale items must have a valid product_id');
      }

      const placeholders = productIds.map(() => '?').join(',');
      const [lockedProducts] = await connection.query(
        `SELECT id, name, category, barcode, purchase_price, selling_price, quantity 
         FROM products 
         WHERE id IN (${placeholders}) 
         FOR UPDATE`,
        productIds
      );

      const productMap = new Map(lockedProducts.map(p => [p.id, p]));

      // 4. Server-Side Calculations & Negative Stock Prevention
      let calculatedSubtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const product = productMap.get(item.product_id);
        if (!product) {
          throw new Error(`Product not found in inventory: ${item.product_name || item.product_id}`);
        }

        const qty = Number(item.quantity);
        if (!qty || qty <= 0) {
          throw new Error(`Invalid quantity for item ${product.name}`);
        }

        // Negative stock check
        if (product.quantity < qty) {
          throw new Error(`Insufficient stock for "${product.name}". Available: ${product.quantity} ${product.unit || 'pcs'}, Requested: ${qty}`);
        }

        const unitSellingPrice = Number(product.selling_price);
        const unitPurchasePrice = Number(product.purchase_price || 0);
        const lineTotal = Number((qty * unitSellingPrice).toFixed(2));

        calculatedSubtotal += lineTotal;

        verifiedItems.push({
          product_id: product.id,
          product_name: product.name,
          barcode: product.barcode || '',
          quantity: qty,
          unit_purchase_price: unitPurchasePrice,
          unit_selling_price: unitSellingPrice,
          total_price: lineTotal,
          current_stock: product.quantity
        });
      }

      // Server calculates Tax, Discount, and Total Amount
      const validatedDiscount = Math.max(0, Number(discount_amount || 0));
      const taxableSubtotal = Math.max(0, calculatedSubtotal - validatedDiscount);
      const calculatedTax = defaultTaxPercent > 0 
        ? Number(((taxableSubtotal * defaultTaxPercent) / 100).toFixed(2)) 
        : 0;
      const calculatedTotal = Number((taxableSubtotal + calculatedTax).toFixed(2));

      // Validate Tender / Received Amount & Split details
      const rawReceived = received_amount !== null && received_amount !== undefined 
        ? Number(received_amount) 
        : (amount_paid !== null && amount_paid !== undefined ? Number(amount_paid) : calculatedTotal);

      let splitDetails = '';
      let splitCreditDue = 0;
      let effectiveReceived = rawReceived;

      if (payment_mode === 'Split' && payment_split) {
        const sCash = Number(payment_split.cash || 0);
        const sUPI = Number(payment_split.upi || 0);
        const sCard = Number(payment_split.card || 0);
        const sCredit = Number(payment_split.credit || 0);
        const totalSplit = Number((sCash + sUPI + sCard + sCredit).toFixed(2));

        if (Math.abs(totalSplit - calculatedTotal) > 0.1) {
          throw new Error(`Split payment sum (₹${totalSplit.toFixed(2)}) does not match invoice total (₹${calculatedTotal.toFixed(2)})`);
        }

        splitCreditDue = sCredit;
        effectiveReceived = Number((sCash + sUPI + sCard).toFixed(2));

        const parts = [];
        if (sCash > 0) parts.push(`Cash: ₹${sCash.toFixed(2)}`);
        if (sUPI > 0) parts.push(`UPI: ₹${sUPI.toFixed(2)}`);
        if (sCard > 0) parts.push(`Card: ₹${sCard.toFixed(2)}`);
        if (sCredit > 0) parts.push(`Due/Khata: ₹${sCredit.toFixed(2)}`);
        splitDetails = parts.join(' | ');
      } else {
        if (payment_mode !== 'Credit' && rawReceived < calculatedTotal) {
          throw new Error(`Insufficient payment amount. Total is ${settings.currency_symbol || '₹'}${calculatedTotal}, but only received ${settings.currency_symbol || '₹'}${rawReceived}`);
        }
      }

      const calculatedChange = payment_mode === 'Split' 
        ? 0 
        : Math.max(0, Number((rawReceived - calculatedTotal).toFixed(2)));

      // 5. Generate Invoice Sequence INV-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as cnt FROM sales WHERE DATE(created_at) = CURRENT_DATE'
      );
      const invoiceSeq = String(countResult[0].cnt + 1).padStart(4, '0');
      const invoice_number = `INV-${datePart}-${invoiceSeq}`;

      const saleId = crypto.randomUUID();
      const cashierId = staffUser?.id || null;
      const cashierName = staffUser?.name || 'Staff Cashier';

      const finalPaymentMode = payment_mode === 'Split' && splitDetails ? `Split (${splitDetails})` : payment_mode;
      const finalReceivedAmount = payment_mode === 'Split' ? calculatedTotal : rawReceived;

      // 6. Insert Sale Record
      await connection.query(
        `INSERT INTO sales 
        (id, invoice_number, customer_id, customer_name, cashier_id, cashier_name, shift_id, payment_mode, subtotal, tax_percent, tax_amount, discount_amount, total_amount, received_amount, change_amount, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed')`,
        [saleId, invoice_number, customer_id, customer_name, cashierId, cashierName, shiftId, finalPaymentMode, calculatedSubtotal, defaultTaxPercent, calculatedTax, validatedDiscount, calculatedTotal, finalReceivedAmount, calculatedChange]
      );

      // 7. Insert Sale Items & Decrement Stock
      for (const item of verifiedItems) {
        const saleItemId = crypto.randomUUID();
        await connection.query(
          `INSERT INTO sale_items (id, sale_id, product_id, product_name, barcode, unit_purchase_price, unit_selling_price, quantity, total_price) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [saleItemId, saleId, item.product_id, item.product_name, item.barcode, item.unit_purchase_price, item.unit_selling_price, item.quantity, item.total_price]
        );

        const newStock = Math.max(0, item.current_stock - item.quantity);
        await connection.query(
          'UPDATE products SET quantity = ? WHERE id = ?',
          [newStock, item.product_id]
        );

        await connection.query(
          `INSERT INTO stock_movements (id, product_id, movement_type, quantity, previous_quantity, new_quantity, note) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), item.product_id, 'SALE', -item.quantity, item.current_stock, newStock, `Sold via invoice ${invoice_number}`]
        );
      }

      // 8. Handle Customer Credit Dues & Customer Ledger
      const isCreditSale = payment_mode === 'Credit';
      const isSplitWithCredit = payment_mode === 'Split' && splitCreditDue > 0;
      const isUnderpaid = rawReceived < calculatedTotal && customer_id;

      if (isCreditSale || isSplitWithCredit || isUnderpaid) {
        let creditDue = 0;
        if (isSplitWithCredit) {
          creditDue = splitCreditDue;
        } else if (isCreditSale) {
          creditDue = calculatedTotal;
        } else {
          creditDue = Number((calculatedTotal - Math.min(rawReceived, calculatedTotal)).toFixed(2));
        }

        if (creditDue > 0 && customer_id) {
          await connection.query(
            'UPDATE customers SET outstanding_dues = outstanding_dues + ? WHERE id = ?',
            [creditDue, customer_id]
          );

          // Get updated customer balance
          const [custRows] = await connection.query('SELECT outstanding_dues FROM customers WHERE id = ?', [customer_id]);
          const balanceAfter = custRows.length > 0 ? custRows[0].outstanding_dues : creditDue;

          // Record in customer_ledger
          await connection.query(
            `INSERT INTO customer_ledger 
             (id, customer_id, transaction_type, reference_id, reference_number, amount, balance_after, payment_mode, notes, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), customer_id, 'SALE_DEBIT', saleId, invoice_number, creditDue, balanceAfter, payment_mode === 'Split' ? 'Split Credit' : 'Credit', `Credit sale on invoice ${invoice_number}${splitDetails ? ` (${splitDetails})` : ''}`, cashierName]
          );
        }
      }

      // 9. Audit Log
      await AuditLog.log({
        userId: cashierId,
        userName: cashierName,
        action: 'SALE_COMPLETED',
        entityType: 'Sale',
        entityId: saleId,
        details: { invoice_number, total_amount: calculatedTotal, items_count: verifiedItems.length, payment_mode: finalPaymentMode, split_details: splitDetails || undefined }
      });

      await connection.commit();
      return await this.findById(saleId, connection);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async findAll({ search = '', startDate = '', endDate = '', page = 1, limit = 50 } = {}) {
    let query = 'SELECT * FROM sales WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (invoice_number LIKE ? OR customer_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(`${startDate} 00:00:00`);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(`${endDate} 23:59:59`);
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async findById(id, conn = pool) {
    const [sales] = await conn.query('SELECT * FROM sales WHERE id = ? OR invoice_number = ?', [id, id]);
    if (sales.length === 0) return null;

    const sale = sales[0];
    const [items] = await conn.query('SELECT * FROM sale_items WHERE sale_id = ?', [sale.id]);
    sale.items = items;
    return sale;
  }
}

module.exports = Sale;
