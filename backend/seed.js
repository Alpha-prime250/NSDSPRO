const mysql = require('mysql2/promise');
const crypto = require('crypto');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'single_vendor_pos'
  });

  console.log('Connected to single_vendor_pos...');

  // Ensure default setting has proper rupee symbol
  await connection.query(`
    UPDATE settings 
    SET currency_symbol = '₹', shop_name = 'Green Grocery & Retail Store'
    WHERE id = 1
  `);

  // Check product count
  const [[{ count }]] = await connection.query('SELECT COUNT(*) as count FROM products');
  if (count > 0) {
    console.log(`Products already seeded (${count} items). Skipping product seed.`);
  } else {
    console.log('Seeding initial grocery items...');
    const sampleProducts = [
      { name: 'Aashirvaad Shudh Chakki Atta 5kg', category: 'Atta & Flours', barcode: '8901030383182', purchase: 210, selling: 265, qty: 35, unit: 'bag' },
      { name: 'Fortune Sunlite Sunflower Oil 1L', category: 'Oils & Ghee', barcode: '8906007281014', purchase: 115, selling: 145, qty: 50, unit: 'packet' },
      { name: 'India Gate Basmati Rice Feast 1kg', category: 'Rice & Grains', barcode: '8901262010047', purchase: 95, selling: 130, qty: 40, unit: 'kg' },
      { name: 'Tata Salt Vaccum Evaporated 1kg', category: 'Spices & Seasoning', barcode: '8901058852332', purchase: 22, selling: 28, qty: 100, unit: 'packet' },
      { name: 'Amul Butter Pasteurised 500g', category: 'Dairy & Eggs', barcode: '8901262020015', purchase: 240, selling: 275, qty: 25, unit: 'pcs' },
      { name: 'Maggi 2-Minute Instant Noodles 280g', category: 'Snacks & Instant Food', barcode: '8901058841022', purchase: 45, selling: 56, qty: 60, unit: 'packet' },
      { name: 'Tata Tea Gold 500g', category: 'Beverages', barcode: '8901058860016', purchase: 280, selling: 340, qty: 30, unit: 'packet' },
      { name: 'Surf Excel Quick Wash Detergent 1kg', category: 'Household Care', barcode: '8901030701023', purchase: 155, selling: 190, qty: 45, unit: 'packet' },
      { name: 'Dettol Original Soap 125g (Pack of 3)', category: 'Personal Care', barcode: '8901396312017', purchase: 110, selling: 140, qty: 4, unit: 'pack' }, // Low stock sample
      { name: 'Parle-G Gold Biscuits 1kg', category: 'Biscuits & Cookies', barcode: '8901719101018', purchase: 90, selling: 120, qty: 3, unit: 'pack' } // Low stock sample
    ];

    for (const p of sampleProducts) {
      const id = crypto.randomUUID();
      await connection.query(
        `INSERT INTO products (id, name, category, barcode, purchase_price, selling_price, quantity, min_stock_level, unit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, p.name, p.category, p.barcode, p.purchase, p.selling, p.qty, 5, p.unit]
      );
    }
    console.log(`Inserted ${sampleProducts.length} sample products.`);
  }

  // Seed default sample customers if empty
  const [[{ custCount }]] = await connection.query('SELECT COUNT(*) as custCount FROM customers');
  if (custCount === 0) {
    console.log('Seeding initial customers...');
    const customers = [
      { name: 'Ramesh Sharma', phone: '9876543210', dues: 0 },
      { name: 'Sunita Verma', phone: '9823456789', dues: 250 },
      { name: 'Anil Gupta', phone: '9811223344', dues: 0 }
    ];
    for (const c of customers) {
      await connection.query(
        `INSERT INTO customers (id, name, phone, outstanding_dues) VALUES (?, ?, ?, ?)`,
        [crypto.randomUUID(), c.name, c.phone, c.dues]
      );
    }
  }

  console.log('Database initialized and verified successfully!');
  await connection.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
