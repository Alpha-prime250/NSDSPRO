import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { useCart } from '../../context/CartContext';

import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  Check,
  MessageCircle,
  TrendingUp,
  Percent,
  Star,
  MapPin,
  Search,
  XCircle
} from 'lucide-react';

export default function StoreHomePage() {

  const { settings } = useOutletContext();

  const {
    cart,
    addToCart,
    updateQty
  } = useCart();

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // DELIVERY AVAILABILITY STATES
  // ==========================================

  const [deliveryType, setDeliveryType] = useState('pincode');

  const [deliveryValue, setDeliveryValue] = useState('');

  const [deliveryLoading, setDeliveryLoading] =
    useState(false);

  const [deliveryResult, setDeliveryResult] =
    useState(null);

  const [deliveryError, setDeliveryError] =
    useState('');

  const symbol =
    settings?.currency_symbol || '₹';

  const shopName =
    settings?.shop_name || 'Fresh Grocery Store';


  // ==========================================
  // LOAD HOME PAGE DATA
  // ==========================================

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {

    setLoading(true);

    try {

      const [
        prods,
        cats
      ] = await Promise.all([

        api.getProducts({
          limit: 12
        }),

        api.getProducts().then(list => [

          'All',

          ...new Set(
            (list || []).map(
              p => p.category || 'General'
            )
          )

        ])

      ]);

      setProducts(prods || []);
      setCategories(cats || []);

    } catch (err) {

      console.error(
        'Failed to load homepage data:',
        err
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // CUSTOMER SHOPPING
  // =====================================================

  const handleStartShopping = (
    shopPath = '/shop'
  ) => {

    sessionStorage.setItem(
      'customer_shop_path',
      shopPath
    );

    navigate('/customer-register');
  };


  // =====================================================
  // CART QUANTITY
  // =====================================================

  const getItemCartQty = (
    productId
  ) => {

    const it = cart.find(
      i => i.product_id === productId
    );

    return it
      ? it.quantity
      : 0;
  };


  // =====================================================
  // DELIVERY AVAILABILITY CHECK
  // =====================================================

  const handleCheckDelivery = async () => {

    const value =
      String(deliveryValue || '').trim();

    // Clear previous messages
    setDeliveryResult(null);
    setDeliveryError('');

    if (!value) {

      setDeliveryError(
        deliveryType === 'pincode'
          ? 'Please enter your PIN code.'
          : 'Please enter your place or area.'
      );

      return;
    }


    // PIN validation
    if (
      deliveryType === 'pincode' &&
      !/^\d{6}$/.test(value)
    ) {

      setDeliveryError(
        'Please enter a valid 6-digit PIN code.'
      );

      return;
    }


    setDeliveryLoading(true);

    try {

      const result =
        await api.checkDeliveryAvailability(
          value
        );

      setDeliveryResult(result);

    } catch (error) {

      console.error(
        'Delivery availability check failed:',
        error
      );

      setDeliveryResult({
        available: false,
        message:
          'Delivery is not available.'
      });

    } finally {

      setDeliveryLoading(false);

    }
  };


  // =====================================================
  // CLEAR DELIVERY CHECK
  // =====================================================

  const clearDeliveryCheck = () => {

    setDeliveryValue('');

    setDeliveryResult(null);

    setDeliveryError('');

  };


  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
        paddingBottom: '3rem'
      }}
    >

      {/* =====================================================
          1. HERO BANNER
      ===================================================== */}

      <section
        style={{
          background:
            'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',

          color: 'white',

          padding: '4rem 2rem',

          position: 'relative',

          overflow: 'hidden'
        }}
      >

        <div
          style={{
            maxWidth: '1280px',

            margin: '0 auto',

            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(320px, 1fr))',

            alignItems: 'center',

            gap: '2.5rem',

            position: 'relative',

            zIndex: 2
          }}
        >

          {/* HERO LEFT */}

          <div>

            <div
              style={{
                display: 'inline-flex',

                alignItems: 'center',

                gap: '0.5rem',

                backgroundColor:
                  'rgba(255,255,255,0.18)',

                backdropFilter: 'blur(8px)',

                padding: '0.4rem 0.9rem',

                borderRadius: '9999px',

                fontSize: '0.85rem',

                fontWeight: '700',

                marginBottom: '1.25rem',

                color: '#a7f3d0'
              }}
            >

              <Sparkles size={16} />

              <span>
                Free Delivery on orders above {symbol}499
              </span>

            </div>


            <h1
              style={{
                fontSize:
                  'clamp(2rem, 5vw, 3.2rem)',

                fontWeight: '900',

                lineHeight: 1.15,

                marginBottom: '1rem',

                letterSpacing: '-0.5px'
              }}
            >

              Fresh Daily Groceries
              <br />

              <span
                style={{
                  color: '#6ee7b7'
                }}
              >
                Delivered to Your Doorstep.
              </span>

            </h1>


            <p
              style={{
                fontSize: '1.05rem',

                color: '#d1fae5',

                maxWidth: '520px',

                lineHeight: 1.6,

                marginBottom: '2rem'
              }}
            >

              Shop pure chakki atta, farm-fresh dairy,
              cold-pressed oils, premium rice, and daily
              household essentials from {shopName}.

            </p>


            <div
              style={{
                display: 'flex',

                gap: '1rem',

                flexWrap: 'wrap'
              }}
            >

              <button
                type="button"

                onClick={() =>
                  handleStartShopping('/shop')
                }

                className="btn"

                style={{
                  backgroundColor: '#ffffff',

                  color: '#065f46',

                  fontWeight: '800',

                  fontSize: '1rem',

                  padding:
                    '0.85rem 1.75rem',

                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.2)',

                  border: 'none',

                  cursor: 'pointer',

                  display: 'inline-flex',

                  alignItems: 'center',

                  gap: '0.5rem'
                }}
              >

                <span>
                  Shop All Groceries
                </span>

                <ArrowRight size={18} />

              </button>


              <Link
                to="/track"

                className="btn"

                style={{
                  backgroundColor:
                    'rgba(255,255,255,0.15)',

                  color: 'white',

                  fontWeight: '700',

                  fontSize: '1rem',

                  padding:
                    '0.85rem 1.5rem',

                  border:
                    '1px solid rgba(255,255,255,0.3)'
                }}
              >

                Track Live Order

              </Link>

            </div>

          </div>


          {/* =====================================================
              HERO FEATURE CARD
          ===================================================== */}

          <div
            style={{
              backgroundColor:
                'rgba(255,255,255,0.1)',

              backdropFilter: 'blur(12px)',

              border:
                '1px solid rgba(255,255,255,0.2)',

              borderRadius:
                'var(--radius-xl)',

              padding: '2rem',

              color: 'white'
            }}
          >

            <div
              style={{
                fontSize: '1.2rem',

                fontWeight: '800',

                marginBottom: '1.25rem',

                display: 'flex',

                alignItems: 'center',

                gap: '0.5rem'
              }}
            >

              <TrendingUp color="#6ee7b7" />

              Why Shop with {shopName}?

            </div>


            <div
              style={{
                display: 'flex',

                flexDirection: 'column',

                gap: '1.25rem'
              }}
            >

              {/* DELIVERY */}

              <div
                style={{
                  display: 'flex',

                  gap: '1rem',

                  alignItems: 'flex-start'
                }}
              >

                <div
                  style={{
                    width: '40px',

                    height: '40px',

                    borderRadius: '10px',

                    backgroundColor:
                      'rgba(255,255,255,0.2)',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    flexShrink: 0
                  }}
                >

                  <Truck
                    size={20}
                    color="#a7f3d0"
                  />

                </div>


                <div>

                  <div
                    style={{
                      fontWeight: '700',

                      fontSize: '0.95rem'
                    }}
                  >
                    Express Local Delivery
                  </div>

                  <div
                    style={{
                      fontSize: '0.825rem',

                      color: '#d1fae5'
                    }}
                  >
                    Delivered directly to your home within
                    2 hours or your scheduled slot.
                  </div>

                </div>

              </div>


              {/* PRICES */}

              <div
                style={{
                  display: 'flex',

                  gap: '1rem',

                  alignItems: 'flex-start'
                }}
              >

                <div
                  style={{
                    width: '40px',

                    height: '40px',

                    borderRadius: '10px',

                    backgroundColor:
                      'rgba(255,255,255,0.2)',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    flexShrink: 0
                  }}
                >

                  <Percent
                    size={20}
                    color="#a7f3d0"
                  />

                </div>


                <div>

                  <div
                    style={{
                      fontWeight: '700',

                      fontSize: '0.95rem'
                    }}
                  >
                    Supermarket Best Prices
                  </div>

                  <div
                    style={{
                      fontSize: '0.825rem',

                      color: '#d1fae5'
                    }}
                  >
                    MRP discounts on all branded staples,
                    flours, oils, and spices.
                  </div>

                </div>

              </div>


              {/* PAYMENT */}

              <div
                style={{
                  display: 'flex',

                  gap: '1rem',

                  alignItems: 'flex-start'
                }}
              >

                <div
                  style={{
                    width: '40px',

                    height: '40px',

                    borderRadius: '10px',

                    backgroundColor:
                      'rgba(255,255,255,0.2)',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    flexShrink: 0
                  }}
                >

                  <ShieldCheck
                    size={20}
                    color="#a7f3d0"
                  />

                </div>


                <div>

                  <div
                    style={{
                      fontWeight: '700',

                      fontSize: '0.95rem'
                    }}
                  >
                    Pay on Delivery
                  </div>

                  <div
                    style={{
                      fontSize: '0.825rem',

                      color: '#d1fae5'
                    }}
                  >
                    Pay comfortably with Cash or
                    Google Pay / PhonePe UPI when your
                    bag arrives.
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          2. DELIVERY AVAILABILITY
      ===================================================== */}

      <section
        style={{
          maxWidth: '1280px',

          margin: '0 auto',

          padding: '0 2rem',

          width: '100%'
        }}
      >

        <div
          style={{
            backgroundColor: '#ffffff',

            border:
              '1px solid var(--border-color)',

            borderRadius:
              'var(--radius-xl)',

            padding: '2rem',

            boxShadow:
              '0 8px 25px rgba(0,0,0,0.05)',

            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',

            gap: '2rem',

            alignItems: 'center'
          }}
        >

          {/* LEFT */}

          <div>

            <div
              style={{
                display: 'inline-flex',

                alignItems: 'center',

                gap: '0.5rem',

                color: 'var(--primary)',

                fontWeight: '800',

                fontSize: '0.8rem',

                textTransform: 'uppercase',

                marginBottom: '0.6rem'
              }}
            >

              <Truck size={16} />

              Delivery Availability

            </div>


            <h2
              style={{
                margin: '0 0 0.6rem 0',

                fontSize: '1.6rem',

                fontWeight: '900',

                color: 'var(--text-main)'
              }}
            >
              Check if we deliver to your area
            </h2>


            <p
              style={{
                margin: 0,

                color: 'var(--text-muted)',

                lineHeight: 1.6,

                fontSize: '0.9rem'
              }}
            >
              Enter your PIN code or place/area to check
              whether home delivery is available in your
              location.
            </p>

          </div>


          {/* RIGHT CHECKER */}

          <div>

            {/* TOGGLE */}

            <div
              style={{
                display: 'inline-flex',

                backgroundColor: '#f1f5f9',

                padding: '4px',

                borderRadius: '10px',

                marginBottom: '1rem'
              }}
            >

              <button
                type="button"

                onClick={() => {

                  setDeliveryType('pincode');

                  setDeliveryValue('');

                  setDeliveryResult(null);

                  setDeliveryError('');

                }}

                style={{
                  border: 'none',

                  cursor: 'pointer',

                  padding:
                    '0.55rem 0.9rem',

                  borderRadius: '8px',

                  backgroundColor:
                    deliveryType === 'pincode'
                      ? '#ffffff'
                      : 'transparent',

                  color:
                    deliveryType === 'pincode'
                      ? '#065f46'
                      : '#64748b',

                  fontWeight:
                    deliveryType === 'pincode'
                      ? '800'
                      : '600',

                  boxShadow:
                    deliveryType === 'pincode'
                      ? '0 2px 6px rgba(0,0,0,0.08)'
                      : 'none'
                }}
              >
                PIN Code
              </button>


              <button
                type="button"

                onClick={() => {

                  setDeliveryType('place');

                  setDeliveryValue('');

                  setDeliveryResult(null);

                  setDeliveryError('');

                }}

                style={{
                  border: 'none',

                  cursor: 'pointer',

                  padding:
                    '0.55rem 0.9rem',

                  borderRadius: '8px',

                  backgroundColor:
                    deliveryType === 'place'
                      ? '#ffffff'
                      : 'transparent',

                  color:
                    deliveryType === 'place'
                      ? '#065f46'
                      : '#64748b',

                  fontWeight:
                    deliveryType === 'place'
                      ? '800'
                      : '600',

                  boxShadow:
                    deliveryType === 'place'
                      ? '0 2px 6px rgba(0,0,0,0.08)'
                      : 'none'
                }}
              >
                Place / Area
              </button>

            </div>


            {/* INPUT */}

            <div
              style={{
                display: 'flex',

                gap: '0.6rem',

                flexWrap: 'wrap'
              }}
            >

              <div
                style={{
                  flex: '1 1 220px',

                  position: 'relative'
                }}
              >

                <MapPin
                  size={18}

                  style={{
                    position: 'absolute',

                    left: '12px',

                    top: '50%',

                    transform:
                      'translateY(-50%)',

                    color: '#64748b'
                  }}
                />


                <input
                  type={
                    deliveryType === 'pincode'
                      ? 'tel'
                      : 'text'
                  }

                  value={deliveryValue}

                  onChange={e => {

                    setDeliveryValue(
                      e.target.value
                    );

                    setDeliveryResult(null);

                    setDeliveryError('');

                  }}

                  onKeyDown={e => {

                    if (
                      e.key === 'Enter'
                    ) {

                      handleCheckDelivery();

                    }

                  }}

                  placeholder={
                    deliveryType === 'pincode'
                      ? 'Enter 6-digit PIN code'
                      : 'Enter place or area'
                  }

                  maxLength={
                    deliveryType === 'pincode'
                      ? 6
                      : 100
                  }

                  style={{
                    width: '100%',

                    boxSizing: 'border-box',

                    padding:
                      '0.8rem 0.9rem 0.8rem 2.5rem',

                    border:
                      '1px solid #cbd5e1',

                    borderRadius: '10px',

                    outline: 'none',

                    fontSize: '0.9rem',

                    fontFamily: 'inherit'
                  }}
                />

              </div>


              <button
                type="button"

                onClick={
                  handleCheckDelivery
                }

                disabled={
                  deliveryLoading
                }

                style={{
                  border: 'none',

                  borderRadius: '10px',

                  padding:
                    '0.8rem 1.25rem',

                  backgroundColor:
                    '#059669',

                  color: '#ffffff',

                  fontWeight: '800',

                  cursor:
                    deliveryLoading
                      ? 'not-allowed'
                      : 'pointer',

                  opacity:
                    deliveryLoading
                      ? 0.7
                      : 1,

                  display: 'inline-flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  gap: '0.45rem'
                }}
              >

                <Search size={17} />

                {deliveryLoading
                  ? 'Checking...'
                  : 'Check'}

              </button>

            </div>


            {/* ERROR */}

            {deliveryError && (

              <div
                style={{
                  marginTop: '0.8rem',

                  padding: '0.75rem',

                  backgroundColor: '#fef2f2',

                  border:
                    '1px solid #fecaca',

                  borderRadius: '10px',

                  color: '#b91c1c',

                  fontSize: '0.85rem',

                  display: 'flex',

                  alignItems: 'center',

                  gap: '0.5rem'
                }}
              >

                <XCircle size={18} />

                <span>
                  {deliveryError}
                </span>

              </div>

            )}


            {/* SUCCESS */}

            {deliveryResult?.available && (

              <div
                style={{
                  marginTop: '0.8rem',

                  padding: '1rem',

                  backgroundColor: '#ecfdf5',

                  border:
                    '1px solid #a7f3d0',

                  borderRadius: '10px',

                  color: '#065f46'
                }}
              >

                <div
                  style={{
                    display: 'flex',

                    justifyContent:
                      'space-between',

                    alignItems: 'flex-start',

                    gap: '1rem'
                  }}
                >

                  <div>

                    <div
                      style={{
                        display: 'flex',

                        alignItems: 'center',

                        gap: '0.45rem',

                        fontWeight: '900',

                        fontSize: '1rem',

                        marginBottom: '0.5rem'
                      }}
                    >

                      <Check size={19} />

                      Delivery Available

                    </div>


                    <div
                      style={{
                        fontSize: '0.82rem',

                        lineHeight: 1.7
                      }}
                    >

                      {deliveryResult.zone?.place && (

                        <div>
                          <strong>Area:</strong>{' '}
                          {deliveryResult.zone.place}
                        </div>

                      )}


                      <div>
                        <strong>
                          Delivery Fee:
                        </strong>{' '}

                        {symbol}
                        {Number(
                          deliveryResult.zone
                            ?.delivery_fee || 0
                        ).toFixed(2)}
                      </div>


                      <div>
                        <strong>
                          Estimated Delivery:
                        </strong>{' '}

                        {deliveryResult.zone
                          ?.estimated_minutes || 60}{' '}
                        minutes
                      </div>


                      {Number(
                        deliveryResult.zone
                          ?.min_order_amount || 0
                      ) > 0 && (

                        <div>
                          <strong>
                            Minimum Order:
                          </strong>{' '}

                          {symbol}
                          {Number(
                            deliveryResult.zone
                              .min_order_amount
                          ).toFixed(2)}
                        </div>

                      )}

                    </div>

                  </div>


                  <button
                    type="button"

                    onClick={
                      clearDeliveryCheck
                    }

                    style={{
                      border: 'none',

                      background: 'transparent',

                      cursor: 'pointer',

                      color: '#047857',

                      padding: '2px'
                    }}
                  >

                    <XCircle size={18} />

                  </button>

                </div>

              </div>

            )}


            {/* NOT AVAILABLE */}

            {deliveryResult &&
              !deliveryResult.available && (

                <div
                  style={{
                    marginTop: '0.8rem',

                    padding: '1rem',

                    backgroundColor: '#fef2f2',

                    border:
                      '1px solid #fecaca',

                    borderRadius: '10px',

                    color: '#991b1b'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',

                      alignItems: 'center',

                      gap: '0.5rem',

                      fontWeight: '900',

                      fontSize: '1rem',

                      marginBottom: '0.3rem'
                    }}
                  >

                    <XCircle size={19} />

                    Delivery is not available

                  </div>


                  <div
                    style={{
                      fontSize: '0.82rem',

                      lineHeight: 1.5
                    }}
                  >
                    Sorry, home delivery is currently not
                    available for this PIN code or area.
                  </div>

                </div>

            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          3. POPULAR CATEGORIES
      ===================================================== */}

      <section
        style={{
          maxWidth: '1280px',

          margin: '0 auto',

          padding: '0 2rem',

          width: '100%'
        }}
      >

        <div
          style={{
            display: 'flex',

            justifyContent:
              'space-between',

            alignItems: 'flex-end',

            marginBottom: '1.5rem'
          }}
        >

          <div>

            <h2
              style={{
                fontSize: '1.6rem',

                fontWeight: '800',

                color: 'var(--text-main)'
              }}
            >
              Shop by Category
            </h2>


            <p
              style={{
                color: 'var(--text-muted)',

                fontSize: '0.875rem'
              }}
            >
              Explore our complete grocery assortment
            </p>

          </div>


          <button
            type="button"

            onClick={() =>
              handleStartShopping('/shop')
            }

            style={{
              color: 'var(--primary)',

              fontWeight: '700',

              fontSize: '0.9rem',

              textDecoration: 'none',

              display: 'flex',

              alignItems: 'center',

              gap: '0.25rem',

              background: 'none',

              border: 'none',

              cursor: 'pointer'
            }}
          >
            View All Categories →
          </button>

        </div>


        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fill, minmax(170px, 1fr))',

            gap: '1rem'
          }}
        >

          {[
            {
              name: 'Atta & Flours',
              icon: '🌾',
              count: 'Wheat, Maida, Besan'
            },
            {
              name: 'Dairy & Eggs',
              icon: '🥛',
              count: 'Milk, Butter, Paneer'
            },
            {
              name: 'Oils & Ghee',
              icon: '🛢️',
              count:
                'Mustard, Sunflower, Desi Ghee'
            },
            {
              name: 'Rice & Pulses',
              icon: '🍚',
              count:
                'Basmati, Toor, Moong Daal'
            },
            {
              name: 'Snacks & Biscuits',
              icon: '🍪',
              count:
                'Cookies, Chips, Namkeen'
            },
            {
              name: 'Spices & Masalas',
              icon: '🌶️',
              count:
                'Turmeric, Chilli, Garam Masala'
            },
            {
              name: 'Beverages',
              icon: '☕',
              count:
                'Tea, Coffee, Health Drinks'
            }
          ].map(cat => (

            <button
              key={cat.name}

              type="button"

              onClick={() =>
                handleStartShopping(
                  `/shop?cat=${encodeURIComponent(
                    cat.name
                  )}`
                )
              }

              style={{
                backgroundColor: 'white',

                border:
                  '1px solid var(--border-color)',

                borderRadius:
                  'var(--radius-lg)',

                padding: '1.25rem 1rem',

                textDecoration: 'none',

                textAlign: 'center',

                transition:
                  'all 0.2s ease',

                display: 'flex',

                flexDirection: 'column',

                alignItems: 'center',

                boxShadow:
                  '0 2px 4px rgba(0,0,0,0.02)',

                cursor: 'pointer',

                width: '100%',

                fontFamily: 'inherit'
              }}

              onMouseEnter={e => {

                e.currentTarget.style.transform =
                  'translateY(-3px)';

                e.currentTarget.style.borderColor =
                  'var(--primary)';

                e.currentTarget.style.boxShadow =
                  '0 10px 15px -3px rgba(0,0,0,0.07)';

              }}

              onMouseLeave={e => {

                e.currentTarget.style.transform =
                  'none';

                e.currentTarget.style.borderColor =
                  'var(--border-color)';

                e.currentTarget.style.boxShadow =
                  '0 2px 4px rgba(0,0,0,0.02)';

              }}
            >

              <span
                style={{
                  fontSize: '2.5rem',

                  marginBottom: '0.5rem'
                }}
              >
                {cat.icon}
              </span>


              <span
                style={{
                  fontWeight: '700',

                  fontSize: '0.95rem',

                  color:
                    'var(--text-main)',

                  marginBottom: '0.2rem'
                }}
              >
                {cat.name}
              </span>


              <span
                style={{
                  fontSize: '0.75rem',

                  color:
                    'var(--text-muted)'
                }}
              >
                {cat.count}
              </span>

            </button>

          ))}

        </div>

      </section>


      {/* =====================================================
          4. FEATURED PRODUCTS
      ===================================================== */}

      <section
        style={{
          maxWidth: '1280px',

          margin: '0 auto',

          padding: '0 2rem',

          width: '100%'
        }}
      >

        <div
          style={{
            display: 'flex',

            justifyContent:
              'space-between',

            alignItems: 'flex-end',

            marginBottom: '1.5rem'
          }}
        >

          <div>

            <div
              style={{
                display: 'inline-flex',

                alignItems: 'center',

                gap: '0.35rem',

                color: '#059669',

                fontWeight: '700',

                fontSize: '0.8rem',

                textTransform: 'uppercase'
              }}
            >

              <Star
                size={14}
                fill="#059669"
              />

              Daily Best Deals

            </div>


            <h2
              style={{
                fontSize: '1.6rem',

                fontWeight: '800',

                color: 'var(--text-main)'
              }}
            >
              Featured Grocery Items
            </h2>

          </div>


          <button
            type="button"

            onClick={() =>
              handleStartShopping('/shop')
            }

            style={{
              color: 'var(--primary)',

              fontWeight: '700',

              fontSize: '0.9rem',

              textDecoration: 'none',

              background: 'none',

              border: 'none',

              cursor: 'pointer'
            }}
          >
            Explore Complete Catalog →
          </button>

        </div>


        {loading ? (

          <div
            style={{
              textAlign: 'center',

              padding: '3rem',

              color: 'var(--text-muted)'
            }}
          >
            Loading grocery items...
          </div>

        ) : (

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                'repeat(auto-fill, minmax(250px, 1fr))',

              gap: '1.25rem'
            }}
          >

            {products.slice(0, 8).map(
              prod => {

                const qtyInCart =
                  getItemCartQty(
                    prod.id
                  );

                return (

                  <div
                    key={prod.id}

                    style={{
                      backgroundColor: 'white',

                      border:
                        '1px solid var(--border-color)',

                      borderRadius:
                        'var(--radius-lg)',

                      padding: '1.25rem',

                      display: 'flex',

                      flexDirection:
                        'column',

                      justifyContent:
                        'space-between',

                      gap: '1rem',

                      transition:
                        'all 0.2s ease',

                      position: 'relative'
                    }}

                    onMouseEnter={e =>
                      e.currentTarget.style.boxShadow =
                        '0 10px 20px -5px rgba(0,0,0,0.08)'
                    }

                    onMouseLeave={e =>
                      e.currentTarget.style.boxShadow =
                        'none'
                    }
                  >

                    {/* CATEGORY */}

                    <div
                      style={{
                        display: 'flex',

                        justifyContent:
                          'space-between',

                        alignItems: 'center'
                      }}
                    >

                      <span
                        style={{
                          backgroundColor:
                            '#f1f5f9',

                          color: '#475569',

                          fontSize:
                            '0.725rem',

                          fontWeight: '700',

                          padding:
                            '0.2rem 0.6rem',

                          borderRadius:
                            '9999px',

                          textTransform:
                            'uppercase'
                        }}
                      >
                        {prod.category ||
                          'Grocery'}
                      </span>


                      <span
                        style={{
                          fontSize:
                            '0.75rem',

                          color: '#059669',

                          fontWeight: '700'
                        }}
                      >
                        In Stock
                      </span>

                    </div>


                    {/* TITLE */}

                    <div>

                      <button
                        type="button"

                        onClick={() =>
                          handleStartShopping(
                            `/product/${prod.id}`
                          )
                        }

                        style={{
                          textDecoration:
                            'none',

                          fontSize:
                            '1rem',

                          fontWeight: '700',

                          color:
                            'var(--text-main)',

                          display:
                            '-webkit-box',

                          WebkitLineClamp: 2,

                          WebkitBoxOrient:
                            'vertical',

                          overflow:
                            'hidden',

                          lineHeight: 1.3,

                          background: 'none',

                          border: 'none',

                          padding: 0,

                          cursor: 'pointer',

                          textAlign: 'left',

                          fontFamily:
                            'inherit',

                          width: '100%'
                        }}
                      >
                        {prod.name}
                      </button>


                      <div
                        style={{
                          fontSize:
                            '0.8rem',

                          color:
                            'var(--text-muted)',

                          marginTop:
                            '0.25rem'
                        }}
                      >
                        Pack size: 1{' '}
                        {prod.unit ||
                          'pcs'}
                      </div>

                    </div>


                    {/* PRICE & CART */}

                    <div
                      style={{
                        display: 'flex',

                        justifyContent:
                          'space-between',

                        alignItems: 'center',

                        paddingTop:
                          '0.75rem',

                        borderTop:
                          '1px solid #f1f5f9'
                      }}
                    >

                      <div>

                        <div
                          style={{
                            fontSize:
                              '1.25rem',

                            fontWeight: '900',

                            color:
                              'var(--text-main)'
                          }}
                        >

                          {symbol}

                          {Number(
                            prod.selling_price
                          ).toFixed(2)}

                        </div>


                        <div
                          style={{
                            fontSize:
                              '0.725rem',

                            color:
                              'var(--text-muted)'
                          }}
                        >
                          Inclusive of all taxes
                        </div>

                      </div>


                      {qtyInCart === 0 ? (

                        <button
                          type="button"

                          onClick={() =>
                            handleStartShopping(
                              '/shop'
                            )
                          }

                          className="btn btn-primary"

                          style={{
                            padding:
                              '0.5rem 1rem',

                            fontSize:
                              '0.825rem',

                            borderRadius:
                              'var(--radius-md)'
                          }}
                        >

                          <Plus size={15} />

                          Add

                        </button>

                      ) : (

                        <div
                          style={{
                            display: 'flex',

                            alignItems:
                              'center',

                            backgroundColor:
                              '#ecfdf5',

                            border:
                              '1px solid #a7f3d0',

                            borderRadius:
                              'var(--radius-md)',

                            overflow:
                              'hidden'
                          }}
                        >

                          <button
                            type="button"

                            onClick={() =>
                              updateQty(
                                prod.id,
                                -1
                              )
                            }

                            style={{
                              padding:
                                '0.45rem 0.65rem',

                              border: 'none',

                              background:
                                'none',

                              cursor:
                                'pointer',

                              color:
                                '#065f46'
                            }}
                          >

                            <Minus size={14} />

                          </button>


                          <span
                            style={{
                              fontWeight:
                                '800',

                              fontSize:
                                '0.9rem',

                              color:
                                '#065f46',

                              minWidth:
                                '24px',

                              textAlign:
                                'center'
                            }}
                          >
                            {qtyInCart}
                          </span>


                          <button
                            type="button"

                            onClick={() =>
                              updateQty(
                                prod.id,
                                1
                              )
                            }

                            style={{
                              padding:
                                '0.45rem 0.65rem',

                              border: 'none',

                              background:
                                'none',

                              cursor:
                                'pointer',

                              color:
                                '#065f46'
                            }}
                          >

                            <Plus size={14} />

                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          5. WHATSAPP ORDERING
      ===================================================== */}

      <section
        style={{
          maxWidth: '1280px',

          margin: '0 auto',

          padding: '0 2rem',

          width: '100%'
        }}
      >

        <div
          style={{
            backgroundColor: '#059669',

            borderRadius:
              'var(--radius-xl)',

            padding:
              '2.5rem 2rem',

            color: 'white',

            display: 'flex',

            justifyContent:
              'space-between',

            alignItems: 'center',

            flexWrap: 'wrap',

            gap: '1.5rem',

            boxShadow:
              '0 15px 30px -10px rgba(5, 150, 105, 0.4)'
          }}
        >

          <div>

            <div
              style={{
                display: 'inline-flex',

                alignItems: 'center',

                gap: '0.4rem',

                backgroundColor:
                  'rgba(255,255,255,0.2)',

                padding:
                  '0.25rem 0.75rem',

                borderRadius:
                  '9999px',

                fontSize:
                  '0.75rem',

                fontWeight: '700',

                marginBottom:
                  '0.5rem'
              }}
            >

              <MessageCircle size={14} />

              WhatsApp Quick Order

            </div>


            <h3
              style={{
                fontSize: '1.5rem',

                fontWeight: '900',

                margin:
                  '0 0 0.5rem 0'
              }}
            >
              Prefer to order your grocery list on WhatsApp?
            </h3>


            <p
              style={{
                margin: 0,

                color: '#d1fae5',

                fontSize: '0.95rem',

                maxWidth: '540px'
              }}
            >
              Just send us your grocery list or photo
              of handwritten items on WhatsApp, and our
              store manager will deliver it to your home!
            </p>

          </div>


          <a
            href={`https://wa.me/${(
              settings?.phone ||
              '919876543210'
            ).replace(
              /[^0-9]/g,
              ''
            )}?text=${encodeURIComponent(
              'Hello ' +
              shopName +
              ', I want to place an order for groceries!'
            )}`}

            target="_blank"

            rel="noopener noreferrer"

            className="btn"

            style={{
              backgroundColor:
                '#25D366',

              color: 'white',

              fontWeight: '800',

              fontSize: '1rem',

              padding:
                '0.85rem 1.75rem',

              borderRadius:
                '9999px',

              textDecoration:
                'none',

              display: 'inline-flex',

              alignItems: 'center',

              gap: '0.5rem',

              boxShadow:
                '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >

            <MessageCircle size={20} />

            <span>
              Chat & Order on WhatsApp
            </span>

          </a>

        </div>

      </section>

    </div>
  );
}
