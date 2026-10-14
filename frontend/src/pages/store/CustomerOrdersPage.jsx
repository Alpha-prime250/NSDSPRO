import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await api.getCustomerOnlineOrders();

        const orderList = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (isMounted) {
          setOrders(orderList);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);

        if (isMounted) {
          setError(
            err.message || 'Orders load nahi ho sake. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currency = (amount) =>
    `₹${Number(amount || 0).toFixed(2)}`;

  const getStatusStyle = (status) => {
    const value = String(status || 'Pending').toLowerCase();

    if (value.includes('deliver') || value.includes('complete')) {
      return {
        background: '#dcfce7',
        color: '#166534',
      };
    }

    if (value.includes('cancel')) {
      return {
        background: '#fee2e2',
        color: '#991b1b',
      };
    }

    if (value.includes('process') || value.includes('confirm')) {
      return {
        background: '#dbeafe',
        color: '#1d4ed8',
      };
    }

    return {
      background: '#fef3c7',
      color: '#92400e',
    };
  };

  const getOrderItems = (order) => {
    let items = order.items || order.items_json || [];

    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch {
        items = [];
      }
    }

    return Array.isArray(items) ? items : [];
  };

  const getProductName = (item) =>
    item.product_name ||
    item.name ||
    item.title ||
    item.product?.name ||
    'Product';

  const getProductQuantity = (item) =>
    Number(item.quantity || item.qty || 1);

  const getProductPrice = (item) =>
    Number(
      item.price ||
        item.unit_price ||
        item.product?.price ||
        0
    );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>My Orders</h1>
          <p style={styles.subtitle}>
            View and manage your previous grocery orders.
          </p>
        </div>

        <Link to="/shop" style={styles.shopButton}>
          Continue Shopping
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.messageBox}>
          <div style={styles.loader}></div>
          <p>Loading your orders...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={styles.errorBox}>
          <h3>Unable to Load Orders</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Orders */}
      {!loading && !error && orders.length === 0 && (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>🛒</div>
          <h2>No Orders Yet</h2>
          <p style={styles.subtitle}>
            You have not placed any orders yet.
          </p>

          <Link to="/shop" style={styles.shopButton}>
            Start Shopping
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div style={styles.ordersContainer}>
          <div style={styles.orderCount}>
            Total Orders: <strong>{orders.length}</strong>
          </div>

          {orders.map((order, index) => {
            const items = getOrderItems(order);
            const statusStyle = getStatusStyle(order.status);

            return (
              <div
                key={order.id || order.order_number || index}
                style={styles.orderCard}
              >
                {/* Order Header */}
                <div style={styles.orderHeader}>
                  <div>
                    <h3 style={styles.orderTitle}>
                      Order #{order.order_number || order.id || index + 1}
                    </h3>

                    <p style={styles.dateText}>
                      Ordered on: {formatDate(order.created_at)}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...statusStyle,
                    }}
                  >
                    {order.status || 'Pending'}
                  </span>
                </div>

                <hr style={styles.divider} />

                {/* Product Items */}
                {items.length > 0 && (
                  <div style={styles.productsSection}>
                    <h4 style={styles.sectionTitle}>
                      Order Items ({items.length})
                    </h4>

                    <div style={styles.productList}>
                      {items.map((item, itemIndex) => (
                        <div
                          key={item.id || item.product_id || itemIndex}
                          style={styles.productRow}
                        >
                          <div style={styles.productInfo}>
                            <span style={styles.productIcon}>📦</span>

                            <div>
                              <strong style={styles.productName}>
                                {getProductName(item)}
                              </strong>

                              <p style={styles.productQuantity}>
                                Quantity: {getProductQuantity(item)}
                              </p>
                            </div>
                          </div>

                          <strong style={styles.productPrice}>
                            {currency(
                              getProductPrice(item) *
                                getProductQuantity(item)
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <hr style={styles.divider} />

                {/* Payment Details */}
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>
                      Payment Method
                    </span>
                    <strong style={styles.detailValue}>
                      {order.payment_method || 'N/A'}
                    </strong>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>
                      Order Status
                    </span>
                    <strong style={styles.detailValue}>
                      {order.status || 'Pending'}
                    </strong>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>
                      Total Amount
                    </span>
                    <strong style={styles.totalAmount}>
                      {currency(order.total_amount)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: '60vh',
    background: '#f8fafc',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },

  heading: {
    margin: 0,
    color: '#0f172a',
    fontSize: '2rem',
    fontWeight: '800',
  },

  subtitle: {
    color: '#64748b',
    marginTop: '0.5rem',
    lineHeight: 1.6,
  },

  shopButton: {
    display: 'inline-block',
    background: '#059669',
    color: '#fff',
    padding: '0.8rem 1.3rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
  },

  messageBox: {
    textAlign: 'center',
    padding: '3rem 1rem',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    color: '#64748b',
  },

  loader: {
    width: '35px',
    height: '35px',
    border: '4px solid #d1fae5',
    borderTop: '4px solid #059669',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },

  errorBox: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
  },

  retryButton: {
    background: '#991b1b',
    color: '#fff',
    border: 'none',
    padding: '0.7rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  emptyBox: {
    textAlign: 'center',
    background: '#fff',
    padding: '3rem 1rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },

  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },

  ordersContainer: {
    display: 'grid',
    gap: '1.5rem',
  },

  orderCount: {
    color: '#475569',
    fontSize: '1rem',
  },

  orderCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '1.5rem',
    boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
  },

  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
  },

  orderTitle: {
    margin: '0 0 0.5rem',
    color: '#0f172a',
    fontSize: '1.2rem',
  },

  dateText: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9rem',
  },

  statusBadge: {
    padding: '0.45rem 0.9rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  divider: {
    border: 0,
    borderTop: '1px solid #e2e8f0',
    margin: '1.25rem 0',
  },

  productsSection: {
    marginBottom: '0.5rem',
  },

  sectionTitle: {
    margin: '0 0 1rem',
    color: '#334155',
    fontSize: '1rem',
  },

  productList: {
    display: 'grid',
    gap: '0.8rem',
  },

  productRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.8rem',
    background: '#f8fafc',
    borderRadius: '8px',
  },

  productInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
  },

  productIcon: {
    fontSize: '1.5rem',
  },

  productName: {
    color: '#0f172a',
    display: 'block',
  },

  productQuantity: {
    margin: '0.3rem 0 0',
    color: '#64748b',
    fontSize: '0.85rem',
  },

  productPrice: {
    color: '#334155',
    whiteSpace: 'nowrap',
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1.5rem',
  },

  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },

  detailLabel: {
    color: '#64748b',
    fontSize: '0.85rem',
  },

  detailValue: {
    color: '#334155',
    textTransform: 'capitalize',
  },

  totalAmount: {
    color: '#059669',
    fontSize: '1.25rem',
    fontWeight: '800',
  },
};
