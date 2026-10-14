import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  CreditCard,
  QrCode,
  Banknote,
  Users,
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function Dashboard({ settings, onNavigate, onViewInvoice }) {
  const [data, setData] = useState(null);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ==============================
  // LOAD DASHBOARD DATA
  // ==============================
  const loadMetrics = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const [metrics, expiring] = await Promise.all([
        api.getDashboard(),
        api.getExpiringProducts(30).catch(() => [])
      ]);

      setData(metrics);

      setExpiringProducts(
        Array.isArray(expiring) ? expiring : []
      );

    } catch (err) {
      console.error('Failed to load dashboard:', err);

      setError(
        err.message || 'Unable to load dashboard data'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==============================
  // INITIAL LOAD + AUTO REFRESH
  // ==============================
  useEffect(() => {
    // First Load
    loadMetrics(true);

    // Auto Refresh Every 15 Seconds
    const interval = setInterval(() => {
      loadMetrics(false);
    }, 15000);

    // Refresh when user comes back to browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadMetrics(false);
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    // Cleanup
    return () => {
      clearInterval(interval);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };

  }, [loadMetrics]);

  const symbol = settings?.currency_symbol || '₹';

  // ==============================
  // LOADING SCREEN
  // ==============================
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          gap: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <RefreshCw
          className="animate-spin"
          size={24}
        />

        <span>
          Loading store metrics from MySQL...
        </span>
      </div>
    );
  }

  // ==============================
  // ERROR SCREEN
  // ==============================
  if (error) {
    return (
      <div
        className="card"
        style={{
          borderColor: 'var(--danger)',
          color: 'var(--danger)',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <AlertTriangle
          size={36}
          style={{
            margin: '0 auto 1rem auto'
          }}
        />

        <h3>Failed to load metrics</h3>

        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--text-muted)'
          }}
        >
          {error}
        </p>

        <button
          onClick={() => loadMetrics(true)}
          className="btn btn-secondary"
          style={{
            marginTop: '1rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}
    >

      {/* ==============================
          TOP BANNER & QUICK ACTIONS
      ============================== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '800'
            }}
          >
            Store Overview & Performance
          </h2>

          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}
          >
            Real-time sales, inventory alerts, and profit tracking from single vendor database.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center'
          }}
        >

          {/* REFRESH BUTTON */}
          <button
            onClick={() => loadMetrics(false)}
            className="btn btn-secondary"
            disabled={refreshing}
            title="Refresh Dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />

            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            onClick={() => onNavigate('pos')}
            className="btn btn-primary"
          >
            Open Billing Counter (F2)
          </button>

          <button
            onClick={() => onNavigate('products')}
            className="btn btn-secondary"
          >
            Manage Products
          </button>

        </div>
      </div>

      {/* ==============================
          4 KPI CARDS
      ============================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >

        {/* TODAY'S REVENUE */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <DollarSign size={24} />
          </div>

          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              Today's Revenue
            </div>

            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                marginTop: '0.2rem'
              }}
            >
              {symbol}
              {Number(
                data?.todayRevenue || 0
              ).toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2
                }
              )}
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              {data?.todaySalesCount || 0} completed transactions
            </div>
          </div>
        </div>

        {/* TODAY'S NET PROFIT */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={24} />
          </div>

          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              Today's Net Profit
            </div>

            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                marginTop: '0.2rem',
                color: '#047857'
              }}
            >
              {symbol}
              {Number(
                data?.todayProfit || 0
              ).toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2
                }
              )}
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              Gross margin profit today
            </div>
          </div>
        </div>

        {/* TOTAL PRODUCTS */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--info-light)',
              color: 'var(--info)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={24} />
          </div>

          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              Total Items / SKUs
            </div>

            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                marginTop: '0.2rem'
              }}
            >
              {data?.totalProducts || 0} SKUs
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              {Number(
                data?.totalStockQty || 0
              ).toFixed(0)} total stock units
            </div>
          </div>
        </div>

        {/* LOW STOCK ALERT */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={24} />
          </div>

          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              Low Stock Alert
            </div>

            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                marginTop: '0.2rem',
                color:
                  data?.lowStockCount > 0
                    ? 'var(--danger)'
                    : 'var(--text-main)'
              }}
            >
              {data?.lowStockCount || 0} Needs Reorder
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              Stock &le; minimum threshold
            </div>
          </div>
        </div>

      </div>

      {/* ==============================
          PAYMENT COLLECTIONS
      ============================== */}
      <div className="card">

        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}
        >
          Today's Payment Collections
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >

          {/* CASH */}
          <div
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--primary)',
                fontSize: '0.8125rem',
                fontWeight: '600'
              }}
            >
              <Banknote size={16} /> Cash
            </div>

            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginTop: '0.35rem'
              }}
            >
              {symbol}
              {Number(
                data?.payments?.Cash || 0
              ).toFixed(2)}
            </div>
          </div>

          {/* UPI */}
          <div
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#8b5cf6',
                fontSize: '0.8125rem',
                fontWeight: '600'
              }}
            >
              <QrCode size={16} /> UPI QR
            </div>

            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginTop: '0.35rem'
              }}
            >
              {symbol}
              {Number(
                data?.payments?.UPI || 0
              ).toFixed(2)}
            </div>
          </div>

          {/* CARD */}
          <div
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#3b82f6',
                fontSize: '0.8125rem',
                fontWeight: '600'
              }}
            >
              <CreditCard size={16} /> Card
            </div>

            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginTop: '0.35rem'
              }}
            >
              {symbol}
              {Number(
                data?.payments?.Card || 0
              ).toFixed(2)}
            </div>
          </div>

          {/* CUSTOMER CREDIT */}
          <div
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              background: '#f8fafc',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#f59e0b',
                fontSize: '0.8125rem',
                fontWeight: '600'
              }}
            >
              <Users size={16} /> Customer Credit
            </div>

            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                marginTop: '0.35rem'
              }}
            >
              {symbol}
              {Number(
                data?.payments?.Credit || 0
              ).toFixed(2)}
            </div>
          </div>

        </div>
      </div>

      {/* ==============================
          RECENT INVOICES & LOW STOCK
      ============================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem'
        }}
      >

        {/* RECENT INVOICES */}
        <div className="card">

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: '700'
              }}
            >
              Recent Invoices
            </h3>

            <button
              onClick={() => onNavigate('sales')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">

              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {!data?.recentInvoices ||
                data.recentInvoices.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        padding: '2rem'
                      }}
                    >
                      No sales recorded today yet.
                    </td>
                  </tr>

                ) : (

                  data.recentInvoices.map((inv) => (

                    <tr key={inv.id}>

                      <td
                        style={{
                          fontWeight: '600'
                        }}
                      >
                        {inv.invoice_number}
                      </td>

                      <td>
                        {inv.customer_name}
                      </td>

                      <td
                        style={{
                          fontWeight: '700'
                        }}
                      >
                        {symbol}
                        {Number(
                          inv.total_amount
                        ).toFixed(2)}
                      </td>

                      <td>
                        <span className="badge badge-success">
                          {inv.payment_mode}
                        </span>
                      </td>

                      <td>
                        <button
                          onClick={() =>
                            onViewInvoice(inv.id)
                          }
                          className="btn btn-secondary"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem'
                          }}
                          title="View Receipt"
                        >
                          <Eye size={13} />
                        </button>
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>
          </div>

        </div>

        {/* LOW STOCK WATCHLIST */}
        <div className="card">

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: '700'
              }}
            >
              Low Stock Watchlist
            </h3>

            <button
              onClick={() => onNavigate('products')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              Manage Stock <ArrowRight size={14} />
            </button>

          </div>

          <div className="table-container">

            <table className="data-table">

              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Limit</th>
                </tr>
              </thead>

              <tbody>

                {!data?.lowStockItems ||
                data.lowStockItems.length === 0 ? (

                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        padding: '2rem'
                      }}
                    >
                      All items have healthy stock levels!
                    </td>
                  </tr>

                ) : (

                  data.lowStockItems.map((item) => (

                    <tr key={item.id}>

                      <td
                        style={{
                          fontWeight: '600'
                        }}
                      >
                        {item.name}
                      </td>

                      <td>
                        {item.category}
                      </td>

                      <td>
                        <span className="badge badge-danger">
                          {Number(
                            item.quantity
                          ).toFixed(0)} {item.unit}
                        </span>
                      </td>

                      <td
                        style={{
                          color: 'var(--text-muted)'
                        }}
                      >
                        {Number(
                          item.min_stock_level
                        ).toFixed(0)} {item.unit}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ==============================
          NEAR EXPIRY PRODUCTS
      ============================== */}
      <div
        className="card"
        style={{
          border:
            expiringProducts.some(
              p =>
                p.expiry_status === 'Expired' ||
                p.expiry_status === 'Critical'
            )
              ? '1px solid #fca5a5'
              : '1px solid var(--border-color)',

          backgroundColor: '#ffffff'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.85rem'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >

            <div
              style={{
                backgroundColor:
                  expiringProducts.length > 0
                    ? '#fef2f2'
                    : '#ecfdf5',

                color:
                  expiringProducts.length > 0
                    ? '#ef4444'
                    : '#059669',

                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={18} />
            </div>

            <div>

              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  margin: 0
                }}
              >
                Near-Expiry & Shelf-Life Watchlist (Next 30 Days)
              </h3>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                FMCG products approaching expiration or expired
              </span>

            </div>

          </div>

          <button
            onClick={() => onNavigate('products')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: '600',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            Inventory List <ArrowRight size={14} />
          </button>

        </div>

        {expiringProducts.length === 0 ? (

          <div
            style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: '#059669',
              backgroundColor: '#f0fdf4',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            ✓ No products expiring within the next 30 days.
            Shelf inventory is fresh!
          </div>

        ) : (

          <div className="table-container">

            <table className="data-table">

              <thead>
                <tr
                  style={{
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Mfg / Expiry Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {expiringProducts.map((p) => {

                  const isExpired =
                    p.expiry_status === 'Expired';

                  const isCritical =
                    p.expiry_status === 'Critical';

                  return (

                    <tr key={p.id}>

                      <td
                        style={{
                          fontWeight: '600'
                        }}
                      >
                        {p.name}
                      </td>

                      <td
                        style={{
                          color: 'var(--text-muted)'
                        }}
                      >
                        {p.category}
                      </td>

                      <td>
                        <strong>
                          {Number(
                            p.quantity ||
                            p.stock ||
                            0
                          ).toFixed(0)}
                        </strong>{' '}
                        {p.unit || 'pcs'}
                      </td>

                      <td
                        style={{
                          color: '#64748b',
                          fontSize: '0.8125rem'
                        }}
                      >

                        {p.mfg_date && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)'
                            }}
                          >
                            Mfg:{' '}
                            {new Date(
                              p.mfg_date
                            ).toLocaleDateString()}
                          </div>
                        )}

                        <div
                          style={{
                            fontWeight: '600'
                          }}
                        >
                          Exp:{' '}
                          {p.expiry_date
                            ? new Date(
                                p.expiry_date
                              ).toLocaleDateString()
                            : '-'}
                        </div>

                      </td>

                      <td>

                        <span
                          style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: '700',

                            backgroundColor:
                              isExpired
                                ? '#fee2e2'
                                : isCritical
                                ? '#fffbeb'
                                : '#eff6ff',

                            color:
                              isExpired
                                ? '#dc2626'
                                : isCritical
                                ? '#d97706'
                                : '#2563eb'
                          }}
                        >
                          {isExpired
                            ? 'Expired'
                            : `${p.days_until_expiry} days left`}
                        </span>

                      </td>

                      <td>

                        <button
                          onClick={() =>
                            onNavigate('products')
                          }
                          className="btn btn-secondary"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          Discount / Manage
                        </button>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}
