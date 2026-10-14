const pool = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
  const connection = await pool.getConnection();
  console.log('Starting Senior Roadmap Database Migration...');

  try {
    // 1. Create purchases table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id VARCHAR(36) PRIMARY KEY,
        purchase_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id VARCHAR(36),
        supplier_name VARCHAR(255) NOT NULL,
        supplier_invoice_number VARCHAR(100),
        total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        payment_status ENUM('Paid', 'Partial', 'Pending') DEFAULT 'Paid',
        payment_mode VARCHAR(50) DEFAULT 'Cash',
        notes TEXT,
        created_by VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ purchases table verified');

    // 2. Create purchase_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id VARCHAR(36) PRIMARY KEY,
        purchase_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit_cost DECIMAL(10, 2) NOT NULL,
        total_cost DECIMAL(12, 2) NOT NULL,
        INDEX idx_purchase_id (purchase_id),
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ purchase_items table verified');

    // 3. Create returns table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS returns (
        id VARCHAR(36) PRIMARY KEY,
        return_number VARCHAR(50) UNIQUE NOT NULL,
        sale_id VARCHAR(36) NOT NULL,
        invoice_number VARCHAR(50) NOT NULL,
        customer_id VARCHAR(36),
        customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
        total_refund_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        refund_mode VARCHAR(50) DEFAULT 'Cash',
        reason VARCHAR(255) DEFAULT 'Customer return',
        processed_by VARCHAR(100) DEFAULT 'Cashier',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sale_id (sale_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ returns table verified');

    // 4. Create return_items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS return_items (
        id VARCHAR(36) PRIMARY KEY,
        return_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_refund DECIMAL(12, 2) NOT NULL,
        INDEX idx_return_id (return_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ return_items table verified');

    // 5. Create customer_ledger table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customer_ledger (
        id VARCHAR(36) PRIMARY KEY,
        customer_id VARCHAR(36) NOT NULL,
        transaction_type ENUM('SALE_DEBIT', 'PAYMENT_CREDIT', 'RETURN_CREDIT') NOT NULL,
        reference_id VARCHAR(36),
        reference_number VARCHAR(50),
        amount DECIMAL(12, 2) NOT NULL,
        balance_after DECIMAL(12, 2) NOT NULL,
        payment_mode VARCHAR(50) DEFAULT 'Cash',
        notes VARCHAR(255),
        created_by VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_customer_id (customer_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ customer_ledger table verified');

    // 6. Create audit_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        user_name VARCHAR(100) DEFAULT 'System',
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100),
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_entity (entity_type, entity_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✓ audit_logs table verified');

    // 7. Add columns to sales if missing
    const [salesCols] = await connection.query('DESCRIBE sales');
    const salesFieldNames = salesCols.map(c => c.Field);

    if (!salesFieldNames.includes('cashier_id')) {
      await connection.query(
        'ALTER TABLE sales ADD COLUMN cashier_id VARCHAR(36) AFTER customer_name'
      );
    }

    if (!salesFieldNames.includes('cashier_name')) {
      await connection.query(
        'ALTER TABLE sales ADD COLUMN cashier_name VARCHAR(100) DEFAULT "Staff" AFTER cashier_id'
      );
    }

    if (!salesFieldNames.includes('shift_id')) {
      await connection.query(
        'ALTER TABLE sales ADD COLUMN shift_id VARCHAR(36) AFTER cashier_name'
      );
    }

    if (!salesFieldNames.includes('return_status')) {
      await connection.query(
        "ALTER TABLE sales ADD COLUMN return_status ENUM('None', 'Partial', 'Full') DEFAULT 'None' AFTER status"
      );
    }

    console.log('✓ sales table schema updated');

    // 8. Add columns to online_orders if missing
    const [orderCols] = await connection.query('DESCRIBE online_orders');
    const orderFieldNames = orderCols.map(c => c.Field);

    if (!orderFieldNames.includes('assigned_rider')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN assigned_rider VARCHAR(100) AFTER status'
      );
    }

    if (!orderFieldNames.includes('packed_at')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN packed_at DATETIME AFTER assigned_rider'
      );
    }

    if (!orderFieldNames.includes('delivered_at')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN delivered_at DATETIME AFTER packed_at'
      );
    }

    if (!orderFieldNames.includes('sale_id')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN sale_id VARCHAR(36) AFTER delivered_at'
      );
    }

    if (!orderFieldNames.includes('customer_lat')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN customer_lat DECIMAL(10,7) NULL AFTER customer_address'
      );
    }

    if (!orderFieldNames.includes('customer_lng')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN customer_lng DECIMAL(10,7) NULL AFTER customer_lat'
      );
    }

    if (!orderFieldNames.includes('customer_location_updated_at')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN customer_location_updated_at DATETIME NULL AFTER customer_lng'
      );
    }

    if (!orderFieldNames.includes('rider_lat')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN rider_lat DECIMAL(10,7) NULL AFTER assigned_rider'
      );
    }

    if (!orderFieldNames.includes('rider_lng')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN rider_lng DECIMAL(10,7) NULL AFTER rider_lat'
      );
    }

    if (!orderFieldNames.includes('rider_accuracy')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN rider_accuracy DECIMAL(10,2) NULL AFTER rider_lng'
      );
    }

    if (!orderFieldNames.includes('rider_location_updated_at')) {
      await connection.query(
        'ALTER TABLE online_orders ADD COLUMN rider_location_updated_at DATETIME NULL AFTER rider_accuracy'
      );
    }

    // Existing application already uses "Out for Delivery" in the UI and
    // order model, so make sure older databases accept that status too.
    await connection.query(`
      ALTER TABLE online_orders
      MODIFY COLUMN status ENUM('Pending','Accepted','Packed','Out for Delivery','Delivered','Cancelled')
      DEFAULT 'Pending'
    `);

    console.log('✓ online_orders tracking schema updated');

    // 9. Add Thermal Printer Settings columns if missing
    const [settingsCols] = await connection.query('DESCRIBE settings');
    const settingsFieldNames = settingsCols.map(c => c.Field);

    if (!settingsFieldNames.includes('thermal_printer_size')) {
      await connection.query(`
        ALTER TABLE settings
        ADD COLUMN thermal_printer_size VARCHAR(10) DEFAULT '80mm'
      `);
    }

    if (!settingsFieldNames.includes('auto_print_receipt')) {
      await connection.query(`
        ALTER TABLE settings
        ADD COLUMN auto_print_receipt TINYINT(1) DEFAULT 1
      `);
    }

    if (!settingsFieldNames.includes('receipt_header_note')) {
      await connection.query(`
        ALTER TABLE settings
        ADD COLUMN receipt_header_note VARCHAR(255)
        DEFAULT 'TAX INVOICE / CASH MEMO'
      `);
    }

    if (!settingsFieldNames.includes('receipt_footer_note')) {
      await connection.query(`
        ALTER TABLE settings
        ADD COLUMN receipt_footer_note TEXT
      `);
    }

    if (!settingsFieldNames.includes('show_upi_qr_on_receipt')) {
      await connection.query(`
        ALTER TABLE settings
        ADD COLUMN show_upi_qr_on_receipt TINYINT(1) DEFAULT 1
      `);
    }

    if (!settingsFieldNames.includes('show_barcode_on_receipt')) {
      await connection.query(`
        ALTER TABLE settings
        ADD COLUMN show_barcode_on_receipt TINYINT(1) DEFAULT 1
      `);
    }

    console.log('✓ Thermal printer settings columns verified');

    // 10. Ensure users table has bcrypt hashed passwords & PINs
    const [users] = await connection.query(
      'SELECT id, password, pin FROM users'
    );

    for (const u of users) {
      let updated = false;
      let newPass = u.password;
      let newPin = u.pin;

      // If password does not look like bcrypt hash
      if (
        u.password &&
        !u.password.startsWith('$2a$') &&
        !u.password.startsWith('$2b$') &&
        !u.password.startsWith('$2y$')
      ) {
        newPass = await bcrypt.hash(u.password, 10);
        updated = true;
      }

      // If PIN does not look like bcrypt hash
      if (
        u.pin &&
        !u.pin.startsWith('$2a$') &&
        !u.pin.startsWith('$2b$') &&
        !u.pin.startsWith('$2y$')
      ) {
        newPin = await bcrypt.hash(u.pin, 10);
        updated = true;
      }

      if (updated) {
        await connection.query(
          'UPDATE users SET password = ?, pin = ? WHERE id = ?',
          [newPass, newPin, u.id]
        );

        console.log(
          `✓ Migrated plain credentials to bcrypt hash for user ID: ${u.id}`
        );
      }
    }

    console.log(
      '🎉 Senior Roadmap Database Migration Completed Successfully!'
    );

  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
