import React, { useState, useEffect } from 'react';
import { api } from '../api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  BarChart3,
  TrendingUp,
  Package,
  RefreshCw,
  CalendarDays,
  CreditCard,
  Users,
  ShoppingBag,
  Receipt,
  Truck,
  Wallet,
  AlertCircle,
  Download,
} from 'lucide-react';

// =====================================================
// REPORT NAVIGATION
// =====================================================

const REPORTS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'daily', label: 'Daily Sales', icon: CalendarDays },
  { id: 'monthly', label: 'Monthly Sales', icon: TrendingUp },
  { id: 'payments', label: 'Payment Report', icon: CreditCard },
  { id: 'customers', label: 'Customer Dues', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'profit', label: 'Profit & Loss', icon: Wallet },
];

// =====================================================
// REPORT CONFIGURATION
// =====================================================

const REPORT_CONFIG = {
  daily: {
    title: 'Daily Sales Report',
    description: 'Daily orders, sales revenue and transaction activity.',
    keys: ['dailySales', 'daily_sales', 'daily_trend'],
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'orders', label: 'Orders' },
      { key: 'revenue', label: 'Revenue', currency: true },
    ],
    empty: 'No daily sales data available.',
  },

  monthly: {
    title: 'Monthly Sales Report',
    description: 'Monthly sales, order count and revenue summary.',
    keys: ['monthlySales', 'monthly_sales'],
    columns: [
      { key: 'month', label: 'Month' },
      { key: 'orders', label: 'Orders' },
      { key: 'revenue', label: 'Revenue', currency: true },
    ],
    empty: 'Monthly sales data is not available yet.',
  },

  payments: {
    title: 'Payment Report',
    description: 'Payment collection through different payment methods.',
    keys: [
      'paymentReport',
      'payment_report',
      'paymentSummary',
      'payment_summary',
      'payments',
    ],
    columns: [
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'count', label: 'Transactions' },
      { key: 'total', label: 'Total Amount', currency: true },
    ],
    empty: 'Payment-wise data is not available yet.',
  },

  customers: {
    title: 'Customer Credit & Dues Report',
    description: 'Customer outstanding balances and credit information.',
    keys: [
      'customerDues',
      'customer_dues',
      'customerCredit',
      'customer_credit',
      'customerDuesReport',
    ],
    columns: [
      { key: 'customer_name', label: 'Customer' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_due', label: 'Outstanding Amount', currency: true },
    ],
    empty: 'Customer dues data is not available yet.',
  },

  inventory: {
    title: 'Inventory & Stock Report',
    description: 'Current stock levels, product quantities and inventory value.',
    keys: [
      'inventoryReport',
      'inventory_report',
      'inventory',
      'stockReport',
      'stock_report',
    ],
    columns: [
      { key: 'product_name', label: 'Product' },
      { key: 'category', label: 'Category' },
      { key: 'stock_quantity', label: 'Stock Quantity' },
      { key: 'unit', label: 'Unit' },
      { key: 'selling_price', label: 'Selling Price', currency: true },
      { key: 'stock_value', label: 'Stock Value', currency: true },
    ],
    empty: 'Inventory report data is not available yet.',
  },

  purchases: {
    title: 'Purchase Report',
    description: 'Goods receiving, supplier purchases and pending payments.',
    keys: [
      'purchaseReport',
      'purchase_report',
      'purchases',
      'purchaseSummary',
      'purchase_summary',
    ],
    columns: [
      { key: 'purchase_number', label: 'Purchase Number' },
      { key: 'supplier_invoice_number', label: 'Supplier Invoice' },
      { key: 'supplier_name', label: 'Supplier' },
      { key: 'purchase_date', label: 'Date' },
      { key: 'total_amount', label: 'Total Amount', currency: true },
      { key: 'outstanding', label: 'Pending Amount', currency: true },
      { key: 'payment_status', label: 'Payment Status' },
    ],
    empty: 'Purchase report data is not available yet.',
  },

  expenses: {
    title: 'Expenses Report',
    description: 'Operating expenses, categories and payment totals.',
    keys: [
      'expenseReport',
      'expense_report',
      'expenseSummary',
      'expense_summary',
      'expenses',
    ],
    columns: [
      { key: 'expense_date', label: 'Date' },
      { key: 'title', label: 'Expense Title' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', currency: true },
      { key: 'payment_mode', label: 'Payment Mode' },
      { key: 'notes', label: 'Notes' },
    ],
    empty: 'Expense report data is not available yet.',
  },

  suppliers: {
    title: 'Supplier Report',
    description: 'Supplier purchases and outstanding balances.',
    keys: [
      'supplierReport',
      'supplier_report',
      'supplierSummary',
      'supplier_summary',
      'suppliers',
    ],
    columns: [
      { key: 'supplier_name', label: 'Supplier Name' },
      { key: 'total_purchases', label: 'Total Purchases', currency: true },
      { key: 'paid_amount', label: 'Total Paid', currency: true },
      { key: 'outstanding', label: 'Outstanding Amount', currency: true },
    ],
    empty: 'Supplier report data is not available yet.',
  },

  profit: {
    title: 'Profit & Loss Report',
    description: 'Revenue, expenses, cost of goods sold and net profit.',
    keys: [
      'profitLoss',
      'profit_loss',
      'profitAndLoss',
      'profit_and_loss',
      'profitLossReport',
    ],
    columns: [
      { key: 'revenue', label: 'Revenue', currency: true },
      { key: 'cost_of_goods', label: 'Cost of Goods', currency: true },
      { key: 'expenses', label: 'Expenses', currency: true },
      { key: 'gross_profit', label: 'Gross Profit', currency: true },
      { key: 'net_profit', label: 'Net Profit', currency: true },
      {
        key: 'profit_margin_percent',
        label: 'Profit Margin (%)',
        suffix: '%',
      },
    ],
    empty: 'Profit & Loss details are not available yet.',
  },
};

// =====================================================
// MAIN REPORTS COMPONENT
// =====================================================

export default function Reports({ settings }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('overview');
  const [error, setError] = useState('');

  const symbol = settings?.currency_symbol || '₹';

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (value) => {
    const amount = Number(value || 0);

    return (
      symbol +
      amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  // =====================================================
  // LOAD ANALYTICS
  // =====================================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.getAnalytics();
      setData(res || {});
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // =====================================================
  // NET BALANCE
  // =====================================================

  const netBalance =
    Number(data?.lifetimeRevenue || 0) -
    Number(data?.lifetimeExpenses || 0);

  // =====================================================
  // GET REPORT ROWS
  // =====================================================

  const getReportRows = (config) => {
    if (!config || !data) return [];

    for (const key of config.keys) {
      const value = data?.[key];

      if (Array.isArray(value)) {
        return value;
      }

      if (value && typeof value === 'object') {
        return [value];
      }
    }

    return [];
  };

  // =====================================================
  // GET VALUE WITH FALLBACKS
  // =====================================================

  const getCellValue = (row, column) => {
    if (!row || !column) return null;

    let value = row[column.key];

    // Customer name
    if (column.key === 'customer_name') {
      value =
        row.customer_name ??
        row.name ??
        row.customer ??
        value;
    }

    // Product name
    if (column.key === 'product_name') {
      value =
        row.product_name ??
        row.name ??
        row.product ??
        value;
    }

    // Supplier name
    if (column.key === 'supplier_name') {
      value =
        row.supplier_name ??
        row.name ??
        row.company_name ??
        value;
    }

    // Payment method
    if (column.key === 'payment_method') {
      value =
        row.payment_method ??
        row.method ??
        row.payment_mode ??
        value;
    }

    // Purchase date
    if (column.key === 'purchase_date') {
      value =
        row.purchase_date ??
        row.created_at ??
        value;
    }

    // Stock quantity
    if (column.key === 'stock_quantity') {
      value =
        row.stock_quantity ??
        row.quantity ??
        row.stock ??
        value;
    }

    // Customer due amount
    if (column.key === 'total_due') {
      value =
        row.total_due ??
        row.due_amount ??
        row.outstanding_dues ??
        row.balance ??
        value;
    }

    // Payment total
    if (column.key === 'total') {
      value =
        row.total ??
        row.amount ??
        value;
    }

    // Profit and loss aliases
    if (column.key === 'cost_of_goods') {
      value =
        row.cost_of_goods ??
        row.cost_of_goods_sold ??
        value;
    }

    if (column.key === 'gross_profit') {
      value =
        row.gross_profit ??
        value;
    }

    if (column.key === 'net_profit') {
      value =
        row.net_profit ??
        value;
    }

    // Calculate stock value automatically
    if (column.key === 'stock_value') {
      const quantity = Number(
        row.stock_quantity ??
        row.quantity ??
        row.stock ??
        0
      );

      const price = Number(
        row.selling_price ??
        row.price ??
        0
      );

      value = quantity * price;
    }

    return value;
  };

  // =====================================================
  // CHECK IF VALUE IS AVAILABLE
  // =====================================================

  const hasValue = (value) => {
    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
    );
  };

  // =====================================================
  // GET ONLY VISIBLE COLUMNS
  // =====================================================

  const getVisibleColumns = (config, rows) => {
    if (!config || !Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    return config.columns.filter((column) => {
      return rows.some((row) => {
        const value = getCellValue(row, column);
        return hasValue(value);
      });
    });
  };

  // =====================================================
  // RENDER TABLE CELL
  // =====================================================

  const renderCell = (row, column) => {
    const value = getCellValue(row, column);

    if (!hasValue(value)) {
      return '—';
    }

    if (column.currency) {
      return formatMoney(value);
    }

    if (column.key.toLowerCase().includes('date')) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN');
      }
    }

    if (column.suffix) {
      return `${value}${column.suffix}`;
    }

    return String(value);
  };

  // =====================================================
  // PREPARE EXPORT DATA
  // =====================================================

  const getExportData = () => {
    if (activeReport === 'overview') {
      alert('Please select a report before exporting.');
      return null;
    }

    const config = REPORT_CONFIG[activeReport];
    if (!config) {
      alert('The selected report is not supported for export.');
      return null;
    }

    const rows = getReportRows(config);
    if (!rows.length) {
      alert('No report data available to export.');
      return null;
    }

    const columns = getVisibleColumns(config, rows);
    if (!columns.length) {
      alert('No report columns available to export.');
      return null;
    }

    return {
      config,
      columns,
      rows,
      head: columns.map((column) => column.label),
      body: rows.map((row) =>
        columns.map((column) => {
          const value = renderCell(row, column);
          return value === null || value === undefined ? '' : String(value);
        })
      ),
    };
  };

  const makeExportFilename = (extension) => {
    const safeReportName = String(activeReport || 'report')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_');
    return `${safeReportName}_report.${extension}`;
  };

  // =====================================================
  // EXPORT REPORT TO CSV
  // =====================================================

  const exportCurrentReport = () => {
    const exportData = getExportData();
    if (!exportData) return;

    try {
      const escapeCSV = (value) => {
        const text = String(value ?? '');
        return `"${text.replace(/"/g, '""')}"`;
      };

      const csv = [
        exportData.head.map(escapeCSV).join(','),
        ...exportData.body.map((row) => row.map(escapeCSV).join(',')),
      ].join('\r\n');

      const blob = new Blob(['\uFEFF' + csv], {
        type: 'text/csv;charset=utf-8;',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = makeExportFilename('csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
      alert('CSV export failed. Please try again.');
    }
  };

  // =====================================================
  // EXPORT REPORT TO EXCEL
  // =====================================================

  const exportCurrentReportToExcel = () => {
    const exportData = getExportData();
    if (!exportData) return;

    try {
      const worksheet = XLSX.utils.aoa_to_sheet([
        exportData.head,
        ...exportData.body,
      ]);
      worksheet['!cols'] = exportData.head.map((heading, index) => ({
        wch: Math.min(
          32,
          Math.max(
            String(heading).length + 2,
            ...exportData.body.map((row) => String(row[index] ?? '').length + 2),
          ),
        ),
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, makeExportFilename('xlsx'));
    } catch (err) {
      console.error('Excel export failed:', err);
      alert('Excel export failed. Check that the xlsx package is installed.');
    }
  };

  // =====================================================
  // EXPORT REPORT TO PDF
  // =====================================================

  const exportCurrentReportToPDF = () => {
    const exportData = getExportData();
    if (!exportData) return;

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      doc.setFontSize(16);
      doc.text(exportData.config.title || 'Report', 40, 38);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, 55);

      autoTable(doc, {
        head: [exportData.head],
        body: exportData.body,
        startY: 70,
        margin: { left: 40, right: 40 },
        styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fontStyle: 'bold' },
        didDrawPage: () => {
          const pageNumber = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${pageNumber}`,
            doc.internal.pageSize.getWidth() - 55,
            doc.internal.pageSize.getHeight() - 18,
          );
        },
      });

      doc.save(makeExportFilename('pdf'));
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Check that jspdf and jspdf-autotable are installed.');
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          gap: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <RefreshCw className="animate-spin" size={24} />
        <span>Calculating business analytics...</span>
      </div>
    );
  }

  const currentConfig = REPORT_CONFIG[activeReport];
  const currentRows = currentConfig
    ? getReportRows(currentConfig)
    : [];

  const visibleColumns = currentConfig
    ? getVisibleColumns(currentConfig, currentRows)
    : [];

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* TOP BANNER */}

      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
            Store Financials & P&L Reports
          </h2>

          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
            }}
          >
            Revenue, expenses, sales and business analytics
          </span>
        </div>

        <button
          onClick={loadAnalytics}
          className="btn btn-secondary"
        >
          <RefreshCw size={15} />
          Refresh Analytics
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div
          className="card"
          style={{
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* REPORT NAVIGATION */}

      <div className="card" style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '0.65rem',
            flexWrap: 'wrap',
          }}
        >
          {REPORTS.map((report) => {
            const Icon = report.icon;
            const isActive = activeReport === report.id;

            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1rem',
                  borderRadius: '9px',
                  border: isActive
                    ? '1px solid var(--primary)'
                    : '1px solid var(--border-color, #e2e8f0)',
                  background: isActive ? 'var(--primary)' : 'white',
                  color: isActive ? 'white' : 'var(--text-main)',
                  cursor: 'pointer',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '0.85rem',
                }}
              >
                <Icon size={16} />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW REPORT */}

      {activeReport === 'overview' && (
        <>
          {/* SUMMARY CARDS */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* LIFETIME REVENUE */}

            <div className="card">
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Lifetime Total Revenue
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginTop: '0.35rem',
                  color: 'var(--primary)',
                }}
              >
                {formatMoney(data?.lifetimeRevenue)}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
                }}
              >
                From all completed POS sales
              </div>
            </div>

            {/* LIFETIME EXPENSES */}

            <div className="card">
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Lifetime Total Expenses
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginTop: '0.35rem',
                  color: 'var(--danger)',
                }}
              >
                {formatMoney(data?.lifetimeExpenses)}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
                }}
              >
                Store rent, electricity & overheads
              </div>
            </div>

            {/* NET CASH BALANCE */}

            <div className="card">
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: netBalance >= 0 ? '#047857' : 'var(--danger)',
                  textTransform: 'uppercase',
                }}
              >
                Net Cash Balance
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  marginTop: '0.35rem',
                  color: netBalance >= 0 ? '#047857' : 'var(--danger)',
                }}
              >
                {formatMoney(netBalance)}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
                }}
              >
                Revenue minus logged expenses
              </div>
            </div>
          </div>

          {/* DAILY SALES AND TOP PRODUCTS */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* DAILY SALES */}

            <div className="card">
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                }}
              >
                Daily Sales Activity (Last 7 Days)
              </h3>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Orders</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!data?.dailySales || data.dailySales.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          No sales data in the last 7 days.
                        </td>
                      </tr>
                    ) : (
                      data.dailySales.map((d, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>
                            {new Date(d.date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          <td>{d.orders} orders</td>

                          <td
                            style={{
                              fontWeight: '800',
                              color: 'var(--primary)',
                            }}
                          >
                            {formatMoney(d.revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOP PRODUCTS */}

            <div className="card">
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                }}
              >
                Top Selling Products by Volume
              </h3>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Units Sold</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!data?.topProducts || data.topProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          style={{
                            textAlign: 'center',
                            padding: '2rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          No product sales yet.
                        </td>
                      </tr>
                    ) : (
                      data.topProducts.map((p, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600' }}>
                            {p.product_name}
                          </td>

                          <td>
                            <span className="badge badge-info">
                              {Number(p.units_sold).toFixed(0)} units
                            </span>
                          </td>

                          <td
                            style={{
                              fontWeight: '800',
                              color: 'var(--primary)',
                            }}
                          >
                            {formatMoney(p.total_revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* INDIVIDUAL REPORTS */}

      {currentConfig && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  marginBottom: '0.4rem',
                }}
              >
                {currentConfig.title}
              </h3>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                {currentConfig.description}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={exportCurrentReport}
                disabled={!currentRows.length}
                title={!currentRows.length ? 'No data available to export' : 'Download CSV'}
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={exportCurrentReportToExcel}
                disabled={!currentRows.length}
                title={!currentRows.length ? 'No data available to export' : 'Download Excel'}
              >
                <Download size={16} />
                Export Excel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={exportCurrentReportToPDF}
                disabled={!currentRows.length}
                title={!currentRows.length ? 'No data available to export' : 'Download PDF'}
              >
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </div>

          {/* EMPTY STATE */}

          {currentRows.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                border: '1px dashed var(--border-color, #e2e8f0)',
                borderRadius: '10px',
              }}
            >
              <AlertCircle
                size={32}
                style={{
                  marginBottom: '0.75rem',
                  opacity: 0.6,
                }}
              />

              <p style={{ fontWeight: '600' }}>
                {currentConfig.empty}
              </p>

              <p
                style={{
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                }}
              >
                This report requires data from the backend API.
              </p>
            </div>
          ) : visibleColumns.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              No displayable columns found in this report.
            </div>
          ) : (
            /* DATA TABLE */

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    {visibleColumns.map((column, index) => (
                      <th key={`${column.key}-${index}`}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {currentRows.map((row, rowIndex) => (
                    <tr key={row.id || rowIndex}>
                      {visibleColumns.map((column, colIndex) => (
                        <td key={`${column.key}-${colIndex}`}>
                          {renderCell(row, column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
