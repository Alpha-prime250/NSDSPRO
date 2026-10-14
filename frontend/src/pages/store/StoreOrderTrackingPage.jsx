import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import OrderTrackingMap from '../../components/OrderTrackingMap';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function StoreOrderTrackingPage() {
  const { settings } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('query') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [liveTracking, setLiveTracking] = useState({});
  const [liveLoading, setLiveLoading] = useState(false);

  const symbol = settings?.currency_symbol || '₹';


  // ==========================================================
  // LIVE TRACKING
  // ==========================================================

  const refreshLiveTracking = useCallback(
    async (orderNumber, showLoader = true) => {
      const value = String(orderNumber || '').trim();

      if (!value) return;

      try {
        if (showLoader) {
          setLiveLoading(true);
        }

        const data = await api.getLiveOrderTracking(value);

        setLiveTracking((prev) => ({
          ...prev,
          [value]: data || {}
        }));

      } catch (err) {
        console.error(
          `Live tracking failed for ${value}:`,
          err
        );

        setLiveTracking((prev) => ({
          ...prev,
          [value]: {}
        }));

      } finally {
        if (showLoader) {
          setLiveLoading(false);
        }
      }
    },
    []
  );


  // ==========================================================
  // SEARCH ORDER
  // ==========================================================

  const handleSearch = useCallback(
    async (q = searchQuery) => {
      const value = String(q || '').trim();

      if (!value) {
        return;
      }

      setLoading(true);
      setSearched(true);

      // Keep URL query synchronized
      setSearchParams({ query: value });

      try {
        const res = await api.trackCustomerOrder(value);

        const list = Array.isArray(res)
          ? res
          : res
          ? [res]
          : [];

        setOrders(list);

        // IMPORTANT:
        // Live tracking MUST use order_number,
        // NOT the product name / search text.
        if (list.length > 0) {
          for (const order of list) {
            if (order?.order_number) {
              await refreshLiveTracking(
                order.order_number,
                false
              );
            }
          }
        }

      } catch (err) {
        console.error(
          'Failed to track order:',
          err
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [
      searchQuery,
      setSearchParams,
      refreshLiveTracking
    ]
  );


  // ==========================================================
  // INITIAL SEARCH FROM URL
  // ==========================================================

  useEffect(() => {
    const query = searchParams.get('query');

    if (query && query.trim()) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, []);


  // ==========================================================
  // AUTO REFRESH LIVE GPS EVERY 5 SECONDS
  // ==========================================================

  useEffect(() => {
    if (
      !searched ||
      orders.length === 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      orders.forEach((order) => {
        if (order?.order_number) {
          refreshLiveTracking(
            order.order_number,
            false
          );
        }
      });
    }, 5000);

    return () => clearInterval(timer);

  }, [
    searched,
    orders,
    refreshLiveTracking
  ]);


  // ==========================================================
  // ORDER STATUS STEP
  // ==========================================================

  const getStepActiveIndex = (status) => {
    switch (status) {
      case 'Pending':
        return 1;

      case 'Accepted':
        return 2;

      case 'Out for Delivery':
        return 3;

      case 'Delivered':
        return 4;

      case 'Cancelled':
        return -1;

      default:
        return 1;
    }
  };


  // ==========================================================
  // VALID SEARCH CHECK
  // ==========================================================

  const isValidSearchValue = (value) => {
    const text = String(value || '').trim();

    if (!text) {
      return false;
    }

    // 10 digit mobile number
    const isPhone = /^\d{10}$/.test(text);

    // Common order number formats
    const isOrderNumber =
      /^(WEB-|ORD-|ORDER-)/i.test(text);

    // UUID order ID
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(text);

    return (
      isPhone ||
      isOrderNumber ||
      isUUID
    );
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '0 auto',
        padding: '3rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={{ textAlign: 'center' }}>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '900',
            color: 'var(--text-main)',
            margin: '0 0 0.5rem 0'
          }}
        >
          Track Your Grocery Order
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem'
          }}
        >
          Enter your Order ID
          {' '}
          (e.g. <code>WEB-248415</code>)
          {' '}
          or your registered 10-digit mobile number.
        </p>

      </div>


      {/* =====================================================
          SEARCH BOX
      ===================================================== */}

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '1.5rem',
          boxShadow:
            '0 10px 25px -5px rgba(0,0,0,0.05)'
        }}
      >

        <form
          onSubmit={(e) => {
            e.preventDefault();

            const value = searchQuery.trim();

            if (!isValidSearchValue(value)) {
              alert(
                'Please enter a valid Order ID or 10-digit mobile number.'
              );
              return;
            }

            handleSearch(value);
          }}
          style={{
            display: 'flex',
            gap: '0.75rem'
          }}
        >

          <div
            style={{
              position: 'relative',
              flex: 1
            }}
          >

            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform:
                  'translateY(-50%)',
                color:
                  'var(--text-muted)'
              }}
            />

            <input
              type="text"
              className="input-field"
              placeholder="e.g. WEB-248415 or 9876543210"
              style={{
                paddingLeft: '2.75rem',
                fontSize: '1rem',
                height: '48px'
              }}
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '0 1.75rem',
              fontSize: '0.95rem'
            }}
            disabled={loading}
          >
            {loading
              ? 'Searching...'
              : 'Track Order'}
          </button>

        </form>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)'
          }}
        >

          <RefreshCw
            className="animate-spin"
            size={28}
            style={{
              display: 'inline',
              marginBottom: '0.5rem'
            }}
          />

          <div>
            Checking live order status...
          </div>

        </div>


      ) : searched && orders.length === 0 ? (

        /* ===================================================
           NO ORDER
        =================================================== */

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-xl)',
            border:
              '1px solid var(--border-color)',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >

          <AlertCircle
            size={44}
            style={{
              color: '#ef4444',
              margin:
                '0 auto 1rem auto'
            }}
          />

          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: '800',
              color:
                'var(--text-main)'
            }}
          >
            No Orders Found
          </h3>

          <p
            style={{
              fontSize: '0.875rem',
              marginTop: '0.35rem'
            }}
          >
            We could not locate any order
            with
            {' '}
            <strong>
              "{searchQuery}"
            </strong>.
            Please verify your order number
            or phone number.
          </p>

        </div>


      ) : (

        /* ===================================================
           ORDERS
        =================================================== */

        orders.map((order) => {

          const activeStep =
            getStepActiveIndex(
              order.status
            );

          const isCancelled =
            order.status === 'Cancelled';

          const live =
            liveTracking[
              order.order_number
            ] || {};


          // Customer destination
          const destination =
            live.customer_lat != null &&
            live.customer_lng != null
              ? {
                  lat: Number(
                    live.customer_lat
                  ),
                  lng: Number(
                    live.customer_lng
                  )
                }
              : null;


          // Rider current location
          const rider =
            live.rider_lat != null &&
            live.rider_lng != null
              ? {
                  lat: Number(
                    live.rider_lat
                  ),
                  lng: Number(
                    live.rider_lng
                  ),
                  accuracy:
                    live.rider_accuracy
                      ? Number(
                          live.rider_accuracy
                        )
                      : null
                }
              : null;


          return (

            <div
              key={
                order.id ||
                order.order_number
              }
              style={{
                backgroundColor: 'white',
                borderRadius:
                  'var(--radius-xl)',
                border:
                  '1px solid var(--border-color)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                boxShadow:
                  '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >

              {/* =================================================
                  ORDER HEADER
              ================================================= */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  borderBottom:
                    '1px solid #f1f5f9',
                  paddingBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >

                <div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color:
                        'var(--text-muted)',
                      textTransform:
                        'uppercase',
                      fontWeight: '700'
                    }}
                  >
                    Order Identifier
                  </span>

                  <div
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: '900',
                      color:
                        'var(--primary)'
                    }}
                  >
                    {order.order_number ||
                      order.id}
                  </div>

                </div>


                <div
                  style={{
                    textAlign: 'right'
                  }}
                >

                  <span
                    style={{
                      fontSize: '0.75rem',
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    Placed on{' '}
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleDateString(
                          [],
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }
                        )
                      : '-'}
                    {' '}at{' '}
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleTimeString(
                          [],
                          {
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )
                      : '-'}
                  </span>

                  <div>

                    <span
                      className={`badge ${
                        order.status ===
                        'Delivered'
                          ? 'badge-success'
                          : order.status ===
                            'Cancelled'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                      style={{
                        fontSize: '0.825rem',
                        padding:
                          '0.25rem 0.75rem'
                      }}
                    >
                      {order.status ||
                        'Pending'}
                    </span>

                  </div>

                </div>

              </div>


              {/* =================================================
                  TIMELINE
              ================================================= */}

              {!isCancelled ? (

                <div
                  style={{
                    padding: '1rem 0'
                  }}
                >

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(4, 1fr)',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >

                    {[
                      {
                        step: 1,
                        label:
                          'Order Received',
                        icon: Clock
                      },
                      {
                        step: 2,
                        label:
                          'Packing Items',
                        icon: Package
                      },
                      {
                        step: 3,
                        label:
                          'Out for Delivery',
                        icon: Truck
                      },
                      {
                        step: 4,
                        label:
                          'Delivered',
                        icon:
                          CheckCircle2
                      }
                    ].map(
                      ({
                        step,
                        label,
                        icon: Icon
                      }) => {

                        const isDone =
                          activeStep >=
                          step;

                        return (

                          <div
                            key={step}
                            style={{
                              display:
                                'flex',
                              flexDirection:
                                'column',
                              alignItems:
                                'center',
                              gap:
                                '0.5rem',
                              zIndex: 2
                            }}
                          >

                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius:
                                  '50%',
                                backgroundColor:
                                  isDone
                                    ? '#059669'
                                    : '#f1f5f9',
                                color:
                                  isDone
                                    ? 'white'
                                    : '#94a3b8',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                boxShadow:
                                  isDone
                                    ? '0 4px 10px rgba(5,150,105,0.3)'
                                    : 'none',
                                transition:
                                  'all 0.3s ease'
                              }}
                            >
                              <Icon
                                size={20}
                              />
                            </div>

                            <span
                              style={{
                                fontSize:
                                  '0.8rem',
                                fontWeight:
                                  isDone
                                    ? '700'
                                    : '500',
                                color:
                                  isDone
                                    ? 'var(--text-main)'
                                    : 'var(--text-muted)'
                              }}
                            >
                              {label}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              ) : (

                <div
                  style={{
                    padding: '1rem',
                    backgroundColor:
                      '#fef2f2',
                    border:
                      '1px solid #fecaca',
                    borderRadius:
                      'var(--radius-md)',
                    color: '#991b1b',
                    fontSize: '0.875rem'
                  }}
                >
                  ⚠️ This order was cancelled.
                  If you believe this is an
                  error, please contact the
                  store helpline.
                </div>

              )}


              {/* =================================================
                  LIVE MAP
              ================================================= */}

              {!isCancelled && (

                <div
                  style={{
                    borderTop:
                      '1px solid #f1f5f9',
                    paddingTop: '1.25rem'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom:
                        '0.75rem',
                      flexWrap: 'wrap'
                    }}
                  >

                    <div>

                      <div
                        style={{
                          fontSize:
                            '0.75rem',
                          fontWeight: '800',
                          color:
                            'var(--text-muted)',
                          textTransform:
                            'uppercase'
                        }}
                      >
                        Live Delivery Tracking
                      </div>

                      <div
                        style={{
                          fontWeight: '700',
                          marginTop:
                            '0.2rem'
                        }}
                      >
                        OpenStreetMap
                      </div>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        refreshLiveTracking(
                          order.order_number
                        )
                      }
                      className="btn btn-secondary"
                      style={{
                        padding:
                          '0.45rem 0.75rem',
                        fontSize:
                          '0.75rem'
                      }}
                      disabled={
                        liveLoading
                      }
                    >

                      <RefreshCw
                        size={14}
                        className={
                          liveLoading
                            ? 'animate-spin'
                            : ''
                        }
                      />

                      {' '}Refresh

                    </button>

                  </div>


                  <OrderTrackingMap
                    destination={
                      destination
                    }
                    rider={rider}
                    height={340}
                  />


                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      marginTop:
                        '0.75rem',
                      fontSize:
                        '0.78rem',
                      color:
                        'var(--text-muted)'
                    }}
                  >

                    <span>
                      📍 Delivery address
                    </span>

                    <span>
                      🚚 Delivery person
                    </span>

                    {rider ? (

                      <span>
                        Updated{' '}
                        {live.rider_location_updated_at
                          ? new Date(
                              live.rider_location_updated_at
                            ).toLocaleTimeString()
                          : 'just now'}
                      </span>

                    ) : (

                      <span>
                        Waiting for rider GPS...
                      </span>

                    )}

                    {!destination && (

                      <span>
                        Delivery address
                        coordinates are
                        being prepared...
                      </span>

                    )}

                  </div>

                </div>

              )}


              {/* =================================================
                  ITEMS & DELIVERY INFORMATION
              ================================================= */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  paddingTop: '1rem',
                  borderTop:
                    '1px solid #f1f5f9'
                }}
              >

                {/* ITEMS */}

                <div>

                  <div
                    style={{
                      fontSize:
                        '0.75rem',
                      fontWeight: '700',
                      color:
                        'var(--text-muted)',
                      textTransform:
                        'uppercase',
                      marginBottom:
                        '0.5rem'
                    }}
                  >
                    Items in Bag
                    {' '}
                    ({order.items?.length || 0})
                  </div>


                  <div
                    style={{
                      display:
                        'flex',
                      flexDirection:
                        'column',
                      gap:
                        '0.35rem',
                      backgroundColor:
                        '#f8fafc',
                      padding:
                        '0.85rem',
                      borderRadius:
                        'var(--radius-md)'
                    }}
                  >

                    {(order.items || []).map(
                      (it, idx) => (

                        <div
                          key={idx}
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            fontSize:
                              '0.85rem'
                          }}
                        >

                          <span>
                            {it.name}
                            {' × '}
                            {it.quantity}
                            {' '}
                            {it.unit || ''}
                          </span>

                          <span
                            style={{
                              fontWeight:
                                '700'
                            }}
                          >
                            {symbol}
                            {(
                              Number(
                                it.selling_price
                              ) *
                              Number(
                                it.quantity
                              )
                            ).toFixed(2)}
                          </span>

                        </div>

                      )
                    )}


                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        fontSize:
                          '0.95rem',
                        fontWeight:
                          '900',
                        borderTop:
                          '1px dashed #cbd5e1',
                        paddingTop:
                          '0.4rem',
                        marginTop:
                          '0.25rem'
                      }}
                    >

                      <span>
                        Total
                      </span>

                      <span
                        style={{
                          color:
                            'var(--primary)'
                        }}
                      >
                        {symbol}
                        {Number(
                          order.total_amount || 0
                        ).toFixed(2)}
                      </span>

                    </div>

                  </div>

                </div>


                {/* DELIVERY DETAILS */}

                <div
                  style={{
                    display:
                      'flex',
                    flexDirection:
                      'column',
                    gap:
                      '0.75rem',
                    fontSize:
                      '0.85rem'
                  }}
                >

                  <div>

                    <span
                      style={{
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '700',
                        color:
                          'var(--text-muted)',
                        textTransform:
                          'uppercase'
                      }}
                    >
                      Delivery Recipient
                    </span>

                    <div
                      style={{
                        fontWeight:
                          '700',
                        fontSize:
                          '0.95rem'
                      }}
                    >
                      {order.customer_name ||
                        '-'}
                    </div>

                    <div
                      style={{
                        color:
                          'var(--text-muted)'
                      }}
                    >
                      {order.customer_phone ||
                        '-'}
                    </div>

                  </div>


                  <div>

                    <span
                      style={{
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '700',
                        color:
                          'var(--text-muted)',
                        textTransform:
                          'uppercase'
                      }}
                    >
                      Delivery Location
                    </span>

                    <div
                      style={{
                        color:
                          'var(--text-main)'
                      }}
                    >
                      {order.customer_address ||
                        '-'}
                    </div>

                  </div>


                  <div>

                    <span
                      style={{
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '700',
                        color:
                          'var(--text-muted)',
                        textTransform:
                          'uppercase'
                      }}
                    >
                      Payment Details
                    </span>

                    <div
                      style={{
                        fontWeight:
                          '600'
                      }}
                    >
                      {order.payment_method ||
                        '-'}
                    </div>

                  </div>

                </div>

              </div>

            </div>
          );
        })
      )}

    </div>
  );
}