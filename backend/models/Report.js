const pool = require('../db');

class Report {
  // =====================================================
  // DASHBOARD KPIs
  // =====================================================

  static async getDashboardKPIs() {
    // 1. TODAY'S REVENUE
    const [todaySales] = await pool.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS todayRevenue,
        COUNT(*) AS todaySalesCount
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE
      AND status = 'Completed'
    `);

    // 2. TODAY'S GROSS PROFIT
    const [profitRows] = await pool.query(`
      SELECT
        COALESCE(
          SUM(
            (si.unit_selling_price - si.unit_purchase_price)
            * si.quantity
          ),
          0
        ) AS grossProfit
      FROM sale_items si
      INNER JOIN sales s ON s.id = si.sale_id
      WHERE DATE(s.created_at) = CURRENT_DATE
      AND s.status = 'Completed'
    `);

    // 3. TODAY'S EXPENSES
    const [expenseRows] = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS todayExpenses
      FROM expenses
      WHERE expense_date = CURRENT_DATE
    `);

    const grossProfit = Number(
      profitRows[0]?.grossProfit || 0
    );

    const todayExpenses = Number(
      expenseRows[0]?.todayExpenses || 0
    );

    const todayProfit = grossProfit - todayExpenses;

    // 4. TOTAL PRODUCTS AND STOCK
    const [productRows] = await pool.query(`
      SELECT
        COUNT(*) AS totalProducts,
        COALESCE(SUM(quantity), 0) AS totalStockQty
      FROM products
    `);

    // 5. LOW STOCK COUNT
    const [lowStockRows] = await pool.query(`
      SELECT COUNT(*) AS lowStockCount
      FROM products
      WHERE quantity <= min_stock_level
    `);

    // 6. TODAY'S SALES PAYMENT DATA
    const [salesRows] = await pool.query(`
      SELECT
        payment_mode,
        total_amount
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE
      AND status = 'Completed'
    `);

    const payments = {
      Cash: 0,
      UPI: 0,
      Card: 0,
      Credit: 0
    };

    // 7. CUSTOMER OUTSTANDING CREDIT
    const [creditRows] = await pool.query(`
      SELECT
        COALESCE(SUM(outstanding_dues), 0)
        AS totalCustomerCredit
      FROM customers
    `);

    const totalCustomerCredit = Number(
      creditRows[0]?.totalCustomerCredit || 0
    );

    // 8. PAYMENT MODE CALCULATION
    salesRows.forEach((sale) => {
      const mode = String(sale.payment_mode || '');
      const amount = Number(sale.total_amount || 0);

      if (mode === 'Cash') {
        payments.Cash += amount;
      } else if (mode === 'UPI') {
        payments.UPI += amount;
      } else if (mode === 'Card') {
        payments.Card += amount;
      } else if (mode === 'Credit') {
        payments.Credit += amount;
      } else if (mode.startsWith('Split')) {
        const cashMatch = mode.match(
          /Cash:\s*₹?([\d.]+)/i
        );

        const upiMatch = mode.match(
          /UPI:\s*₹?([\d.]+)/i
        );

        const cardMatch = mode.match(
          /Card:\s*₹?([\d.]+)/i
        );

        const creditMatch = mode.match(
          /(?:Due|Khata|Credit):\s*₹?([\d.]+)/i
        );

        if (cashMatch) {
          payments.Cash += Number(cashMatch[1]);
        }

        if (upiMatch) {
          payments.UPI += Number(upiMatch[1]);
        }

        if (cardMatch) {
          payments.Card += Number(cardMatch[1]);
        }

        if (creditMatch) {
          payments.Credit += Number(creditMatch[1]);
        }
      }
    });

    // 9. RECENT INVOICES
    const [recentInvoices] = await pool.query(`
      SELECT
        id,
        invoice_number,
        customer_name,
        total_amount,
        payment_mode,
        created_at
      FROM sales
      WHERE status = 'Completed'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 10. LOW STOCK PRODUCTS
    const [lowStockItems] = await pool.query(`
      SELECT
        id,
        name,
        category,
        quantity,
        unit,
        min_stock_level
      FROM products
      WHERE quantity <= min_stock_level
      ORDER BY quantity ASC
      LIMIT 5
    `);

    return {
      todayRevenue: Number(
        todaySales[0]?.todayRevenue || 0
      ),

      todaySalesCount: Number(
        todaySales[0]?.todaySalesCount || 0
      ),

      todayProfit: Number(todayProfit || 0),

      totalProducts: Number(
        productRows[0]?.totalProducts || 0
      ),

      totalStockQty: Number(
        productRows[0]?.totalStockQty || 0
      ),

      lowStockCount: Number(
        lowStockRows[0]?.lowStockCount || 0
      ),

      payments: {
        Cash: Number(payments.Cash.toFixed(2)),
        UPI: Number(payments.UPI.toFixed(2)),
        Card: Number(payments.Card.toFixed(2)),
        Credit: Number(totalCustomerCredit.toFixed(2))
      },

      recentInvoices,
      lowStockItems
    };
  }

  // =====================================================
  // REPORTS & ANALYTICS
  // =====================================================

  static async getAnalytics() {
    // SAFE QUERY HELPER
    const safeRows = async (label, sql) => {
      try {
        const [rows] = await pool.query(sql);
        return Array.isArray(rows) ? rows : [];
      } catch (error) {
        console.error(
          `[Reports] ${label} query failed:`,
          error.message
        );
        return [];
      }
    };

    // =====================================================
    // 1. DAILY SALES - LAST 7 DAYS
    // =====================================================

    const dailyTrend = await safeRows('Daily Sales', `
      SELECT
        DATE(created_at) AS date,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*) AS orders
      FROM sales
      WHERE created_at >= DATE_SUB(
        CURRENT_DATE,
        INTERVAL 7 DAY
      )
      AND status = 'Completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // =====================================================
    // 2. MONTHLY SALES
    // =====================================================

    const monthlySales = await safeRows('Monthly Sales', `
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*) AS orders,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM sales
      WHERE status = 'Completed'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // =====================================================
    // 3. TOP SELLING PRODUCTS
    // =====================================================

    const topProducts = await safeRows('Top Products', `
      SELECT
        si.product_name,
        COALESCE(SUM(si.quantity), 0) AS units_sold,
        COALESCE(SUM(si.total_price), 0) AS total_revenue
      FROM sale_items si
      INNER JOIN sales s ON s.id = si.sale_id
      WHERE s.status = 'Completed'
      GROUP BY si.product_id, si.product_name
      ORDER BY units_sold DESC
      LIMIT 5
    `);

    // =====================================================
    // 4. PAYMENT REPORT
    // =====================================================

    const paymentReport = await safeRows('Payment Report', `
      SELECT
        payment_mode AS payment_method,
        COUNT(*) AS count,
        COALESCE(SUM(total_amount), 0) AS total
      FROM sales
      WHERE status = 'Completed'
      GROUP BY payment_mode
      ORDER BY total DESC
    `);

    // =====================================================
    // 5. CUSTOMER CREDIT & DUES
    // =====================================================

    const customerDues = await safeRows('Customer Dues', `
      SELECT
        id,
        name AS customer_name,
        phone,
        COALESCE(outstanding_dues, 0) AS total_due
      FROM customers
      WHERE COALESCE(outstanding_dues, 0) > 0
      ORDER BY outstanding_dues DESC
    `);

    // =====================================================
    // 6. INVENTORY & STOCK REPORT
    // UPDATED: STOCK ALIASES + STOCK VALUE
    // =====================================================

    const inventoryReport = await safeRows('Inventory', `
      SELECT
        id,

        name AS product_name,
        name AS name,

        category,

        COALESCE(quantity, 0) AS stock,
        COALESCE(quantity, 0) AS stock_quantity,
        COALESCE(quantity, 0) AS quantity,

        unit,
        min_stock_level,

        COALESCE(selling_price, 0) AS selling_price,

        (
          COALESCE(quantity, 0) *
          COALESCE(selling_price, 0)
        ) AS stock_value

      FROM products
      ORDER BY quantity ASC
    `);

    // =====================================================
    // 7. PURCHASE REPORT
    // =====================================================

    const purchaseReport = await safeRows('Purchases', `
      SELECT
        p.id,
        p.purchase_number,
        p.supplier_invoice_number,
        p.supplier_id,
        p.supplier_name,
        p.created_at AS purchase_date,
        p.total_amount,
        p.payment_status,
        p.payment_mode,
        p.notes,

        CASE
          WHEN p.payment_status = 'Paid'
          THEN p.total_amount
          ELSE 0
        END AS paid_amount,

        CASE
          WHEN p.payment_status IN ('Pending', 'Partial')
          THEN p.total_amount
          ELSE 0
        END AS outstanding

      FROM purchases p
      ORDER BY p.created_at DESC
    `);

    // =====================================================
    // 8. EXPENSES REPORT
    // =====================================================

    const expenseReport = await safeRows('Expenses', `
      SELECT
        id,
        expense_date,
        title,
        category,
        notes,
        amount,
        payment_mode
      FROM expenses
      ORDER BY expense_date DESC
    `);

    // =====================================================
    // 9. SUPPLIER REPORT - DATA FROM PURCHASES
    // =====================================================

    const supplierReport = await safeRows('Suppliers', `
      SELECT
        supplier_name,
        MAX(supplier_id) AS id,

        NULL AS company_name,
        NULL AS phone,
        NULL AS email,

        COUNT(*) AS purchase_count,

        COALESCE(
          SUM(total_amount),
          0
        ) AS total_purchases,

        COALESCE(
          SUM(
            CASE
              WHEN payment_status = 'Paid'
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS paid_amount,

        COALESCE(
          SUM(
            CASE
              WHEN payment_status IN ('Pending', 'Partial')
              THEN total_amount
              ELSE 0
            END
          ),
          0
        ) AS outstanding

      FROM purchases

      WHERE supplier_name IS NOT NULL
        AND TRIM(supplier_name) != ''

      GROUP BY supplier_name

      ORDER BY total_purchases DESC
    `);

    // =====================================================
    // 10. PROFIT & LOSS
    // =====================================================

    const salesProfitRows = await safeRows(
      'Profit & Loss Sales',
      `
        SELECT
          COALESCE(
            SUM(si.quantity * si.unit_purchase_price),
            0
          ) AS total_cost,

          COALESCE(
            SUM(si.total_price),
            0
          ) AS total_revenue

        FROM sale_items si
        INNER JOIN sales s ON s.id = si.sale_id
        WHERE s.status = 'Completed'
      `
    );

    const expenseTotalRows = await safeRows(
      'Profit & Loss Expenses',
      `
        SELECT
          COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
      `
    );

    const revenue = Number(
      salesProfitRows[0]?.total_revenue || 0
    );

    const cost = Number(
      salesProfitRows[0]?.total_cost || 0
    );

    const expenses = Number(
      expenseTotalRows[0]?.total_expenses || 0
    );

    const grossProfit = revenue - cost;
    const netProfit = grossProfit - expenses;

    const profitMargin = revenue > 0
      ? Number(
          ((netProfit / revenue) * 100).toFixed(2)
        )
      : 0;

    // =====================================================
    // 11. LIFETIME REVENUE & EXPENSES
    // =====================================================

    const lifetimeSalesRows = await safeRows(
      'Lifetime Revenue',
      `
        SELECT
          COALESCE(SUM(total_amount), 0) AS lifetimeRevenue
        FROM sales
        WHERE status = 'Completed'
      `
    );

    const lifetimeExpenseRows = await safeRows(
      'Lifetime Expenses',
      `
        SELECT
          COALESCE(SUM(amount), 0) AS lifetimeExpenses
        FROM expenses
      `
    );

    // =====================================================
    // FINAL ANALYTICS RESPONSE
    // =====================================================

    return {
      // Existing Overview compatibility
      lifetimeRevenue: Number(
        lifetimeSalesRows[0]?.lifetimeRevenue || 0
      ),

      lifetimeExpenses: Number(
        lifetimeExpenseRows[0]?.lifetimeExpenses || 0
      ),

      dailySales: dailyTrend,
      topProducts,

      // Daily Sales
      daily_trend: dailyTrend,

      // Monthly Sales
      monthlySales,

      // Payment Report
      paymentReport,

      // Customer Dues
      customerDues,

      // Inventory
      inventoryReport,

      // Purchases
      purchaseReport,

      // Expenses
      expenseReport,

      // Suppliers
      supplierReport,

      // Profit & Loss
      profitLoss: [
        {
          revenue,
          cost_of_goods: cost,
          expenses,
          gross_profit: grossProfit,
          net_profit: netProfit,
          profit_margin_percent: profitMargin
        }
      ],

      profit_summary: {
        total_revenue: revenue,
        cost_of_goods_sold: cost,
        gross_profit: grossProfit,
        operating_expenses: expenses,
        net_profit: netProfit,
        profit_margin_percent: profitMargin
      }
    };
  }
}

module.exports = Report;