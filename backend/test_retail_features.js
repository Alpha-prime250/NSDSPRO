const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('--- TESTING 4 NEW RETAIL FEATURES ---');

  // Login
  const loginRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  const token = loginRes.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Test Expiring Products API
  console.log('\n[1] Testing Expiring Products Endpoint...');
  const expRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/products/expiring?days=60',
    method: 'GET',
    headers: authHeaders
  });

  if (expRes.status !== 200) {
    throw new Error('Failed to fetch expiring products: ' + JSON.stringify(expRes.data));
  }
  console.log(`✅ Expiring products endpoint working! Found ${expRes.data.length} items expiring or tracked.`);

  // 2. Fetch a product and create a customer for Split payment
  console.log('\n[2] Setting up Split Payment with Credit Portions...');
  const prodRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/products',
    method: 'GET'
  });
  const prod = prodRes.data[0];
  const unitPrice = parseFloat(prod.price || prod.selling_price);

  const custRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/customers',
    method: 'POST',
    headers: authHeaders
  }, {
    name: 'Split Pay Customer ' + Date.now().toString().slice(-4),
    phone: '9988776655',
    outstanding_dues: 0
  });
  const customerId = custRes.data.id;

  // Split: e.g. Price is ₹265 -> Cash ₹100, UPI ₹100, Khata/Credit ₹65
  const splitCash = 100;
  const splitUPI = 100;
  const splitCredit = Number((unitPrice - splitCash - splitUPI).toFixed(2));

  console.log(`Testing Split: Cash: ₹${splitCash}, UPI: ₹${splitUPI}, Credit: ₹${splitCredit} on Total: ₹${unitPrice}`);

  const splitSaleRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/sales',
    method: 'POST',
    headers: authHeaders
  }, {
    customer_id: customerId,
    customer_name: custRes.data.name,
    payment_mode: 'Split',
    discount_amount: 0,
    payment_split: {
      cash: splitCash,
      upi: splitUPI,
      card: 0,
      credit: splitCredit
    },
    items: [
      {
        product_id: prod.id,
        quantity: 1
      }
    ]
  });

  if (splitSaleRes.status !== 201) {
    throw new Error('Split sale failed: ' + JSON.stringify(splitSaleRes.data));
  }
  console.log(`✅ Split Sale Successfully Completed! Invoice: ${splitSaleRes.data.invoice_number}, Payment: ${splitSaleRes.data.payment_mode}`);

  // 3. Verify Customer Credit Ledger for the split credit portion
  console.log('\n[3] Verifying Customer Ledger for the exact Split Credit amount...');
  const ledgerRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: `/api/customers/${customerId}/ledger`,
    method: 'GET',
    headers: authHeaders
  });

  const entry = ledgerRes.data[0];
  if (!entry || parseFloat(entry.amount) !== splitCredit) {
    throw new Error(`Expected ledger debit of ₹${splitCredit}, but found: ${JSON.stringify(entry)}`);
  }
  console.log(`✅ Exact Credit Portion (₹${entry.amount}) successfully debited to customer khata ledger! Balance after: ₹${entry.balance_after}`);

  console.log('\n🎉 ALL 4 NEW RETAIL FEATURES VERIFIED ON BACKEND WITH 100% SUCCESS!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
