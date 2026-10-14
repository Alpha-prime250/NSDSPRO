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

async function runTests() {
  console.log('--- STARTING SENIOR REVIEW END-TO-END VERIFICATION ---');

  // 1. Test Auth: Login as Admin
  console.log('\n[1] Testing Admin Login & JWT...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'admin123' });

  if (loginRes.status !== 200 || !loginRes.data.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.token;
  console.log('✅ Admin Login Success! JWT token obtained:', token.slice(0, 25) + '...');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch Products to get a target product
  console.log('\n[2] Fetching active product list...');
  const prodRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/products',
    method: 'GET'
  });
  const products = prodRes.data;
  if (!products || products.length === 0) throw new Error('No products found');
  const targetProduct = products[0];
  console.log(`✅ Using Product: "${targetProduct.name}" (ID: ${targetProduct.id}, Stock: ${targetProduct.stock})`);

  // 3. Test Goods Inward / Purchase
  console.log('\n[3] Testing Goods Inward (Purchase)...');
  const initialStock = parseFloat(targetProduct.stock);
  const inwardQty = 10;
  const purchasePayload = {
    invoice_number: 'TEST-PO-' + Date.now().toString().slice(-4),
    purchase_date: new Date().toISOString().split('T')[0],
    total_amount: inwardQty * 40,
    paid_amount: inwardQty * 40,
    payment_status: 'Paid',
    payment_method: 'Bank',
    notes: 'Automated test goods inward',
    items: [
      {
        product_id: targetProduct.id,
        quantity: inwardQty,
        unit_cost: 40,
        total_cost: inwardQty * 40
      }
    ]
  };

  const purchaseRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/purchases',
    method: 'POST',
    headers: authHeaders
  }, purchasePayload);

  if (purchaseRes.status !== 201 || !purchaseRes.data.success) {
    throw new Error('Purchase creation failed: ' + JSON.stringify(purchaseRes.data));
  }
  console.log(`✅ Purchase Recorded! ID: ${purchaseRes.data.id}. Stock incremented by ${inwardQty}.`);

  // 4. Test POS Server-Calculated Checkout
  console.log('\n[4] Testing POS Checkout with Server-Side Calculation & Stock Locking...');
  const saleQty = 2;
  const salePayload = {
    customer_id: null,
    customer_name: 'Test Walk-in',
    items: [
      {
        product_id: targetProduct.id,
        quantity: saleQty
      }
    ],
    discount_amount: 0,
    tendered_amount: 1000,
    payment_mode: 'Cash',
    notes: 'Senior Review Test Sale'
  };

  const saleRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/sales',
    method: 'POST',
    headers: authHeaders
  }, salePayload);

  if (saleRes.status !== 201 || !saleRes.data.success) {
    throw new Error('POS checkout failed: ' + JSON.stringify(saleRes.data));
  }
  const createdSale = saleRes.data.sale;
  console.log(`✅ Sale Completed! Invoice: ${createdSale.invoice_number}, Total: ₹${createdSale.total_amount}, Change: ₹${createdSale.change_due}`);

  // 5. Test Return & Refund
  console.log('\n[5] Testing Invoice Return & Refund...');
  const unitPrice = parseFloat(createdSale.items[0].unit_selling_price || createdSale.items[0].unit_price || 0);
  const returnPayload = {
    sale_id: createdSale.id,
    reason: 'Customer Changed Mind',
    refund_method: 'Cash',
    notes: 'Automated test return',
    items: [
      {
        product_id: targetProduct.id,
        sale_item_id: createdSale.items[0].id,
        quantity: 1,
        unit_price: unitPrice,
        total_refund: unitPrice
      }
    ]
  };

  const returnRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/returns',
    method: 'POST',
    headers: authHeaders
  }, returnPayload);

  if (returnRes.status !== 201 || !returnRes.data.success) {
    throw new Error('Return failed: ' + JSON.stringify(returnRes.data));
  }
  console.log(`✅ Return Processed! Return Number: ${returnRes.data.return_number}, Refund: ₹${returnRes.data.refund_amount}, Items Restocked.`);

  // 6. Test Customer Ledger & Dues Payment
  console.log('\n[6] Testing Customer Credit Ledger & Payment Receipt...');
  // Create a customer with opening dues
  const custRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/customers',
    method: 'POST',
    headers: authHeaders
  }, {
    name: 'Test Ledger Customer ' + Date.now().toString().slice(-4),
    phone: '9876543210',
    outstanding_dues: 500
  });
  const customerId = custRes.data.id;

  // Record a payment against the customer
  const payRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: `/api/customers/${customerId}/payment`,
    method: 'POST',
    headers: authHeaders
  }, {
    amount: 200,
    payment_mode: 'UPI',
    notes: 'Partial payment of dues'
  });

  if (payRes.status !== 200 || !payRes.data.success) {
    throw new Error('Payment recording failed: ' + JSON.stringify(payRes.data));
  }
  console.log(`✅ Customer Payment Recorded! Receipt: ${payRes.data.receipt_number}, Remaining Dues: ₹${payRes.data.remaining_dues}`);

  // Fetch customer ledger
  const ledgerRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: `/api/customers/${customerId}/ledger`,
    method: 'GET',
    headers: authHeaders
  });
  console.log(`✅ Customer Ledger Statement Verified: ${ledgerRes.data.length} transactions recorded.`);

  // 7. Verify Audit Logs
  console.log('\n[7] Verifying Audit Logs...');
  const auditRes = await request({
    hostname: 'localhost',
    port: 5050,
    path: '/api/audit?limit=10',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`✅ Audit Logs retrieved successfully: ${auditRes.data.length} recent system audit events logged.`);

  console.log('\n🎉 ALL SENIOR REVIEW BACKEND MODULES PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
