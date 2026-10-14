import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Store, 
  ShoppingCart, 
  Search, 
  Truck, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Plus, 
  Minus, 
  Trash2,
  Lock,
  MessageCircle,
  Menu
} from 'lucide-react';

export default function StoreLayout({ settings }) {
  const { cart, cartCount, subtotal, deliveryFee, grandTotal, updateQty, removeFromCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const symbol = settings?.currency_symbol || '₹';
  const shopName = settings?.shop_name || 'Fresh Grocery Store';

  const customerLoggedIn = Boolean(localStorage.getItem('customer_token'));

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop Groceries', path: '/shop' },
    ...(customerLoggedIn
      ? [
          { label: 'My Orders', path: '/customer-orders' },
          { label: 'My Account', path: '/customer-profile' }
        ]
      : [{ label: 'Customer Login', path: '/customer-login' }]),
    { label: 'Track Order', path: '/track' },
    { label: 'Contact & Store', path: '/contact' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* 1. Top Announcement Bar */}
      <div style={{
        backgroundColor: '#064e3b',
        color: '#a7f3d0',
        padding: '0.45rem 1.5rem',
        fontSize: '0.775rem',
        fontWeight: '600',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={15} />
          <span>FREE Home Delivery on all orders above {symbol}499!</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {settings?.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={13} /> Order Helpline: <a href={`tel:${settings.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{settings.phone}</a>
            </span>
          )}
          <Link
            to="/admin/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              padding: '0.2rem 0.65rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.725rem'
            }}
          >
            <Lock size={12} />
            <span>Staff POS Portal</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Store Navigation Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.9rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          {/* Logo & Branding */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)'
            }}>
              <Store size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: 1.1 }}>
                {shopName}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Online Supermarket & Express Delivery
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? 'var(--primary)' : 'var(--text-main)',
                    borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                    paddingBottom: '0.25rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Search Link & Cart Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link
              to="/shop"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f1f5f9',
                padding: '0.5rem 0.85rem',
                borderRadius: '9999px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.825rem'
              }}
            >
              <Search size={15} />
              <span>Search items...</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.85rem'
              }}
            >
              <ShoppingCart size={17} />
              <span>Cart ({cartCount})</span>
              {subtotal > 0 && (
                <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                  {symbol}{subtotal.toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Outlet (Child Pages) */}
      <main style={{ flex: 1 }}>
        <Outlet context={{ settings }} />
      </main>

      {/* 4. Slide-out Cart Drawer */}
      {isCartOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setIsCartOpen(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 25px rgba(0,0,0,0.15)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>
                  Your Basket ({cartCount})
                </h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Delivery Incentive Banner */}
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: subtotal >= 499 ? '#ecfdf5' : '#fef3c7',
              borderBottom: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              color: subtotal >= 499 ? '#065f46' : '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Truck size={16} />
              <span>
                {subtotal >= 499 
                  ? '🎉 Free delivery unlocked!' 
                  : `Add ${symbol}${(499 - subtotal).toFixed(2)} more for FREE Delivery!`}
              </span>
            </div>

            {/* Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={48} style={{ opacity: 0.25, margin: '0 auto 1rem auto' }} />
                  <div style={{ fontWeight: '700', fontSize: '1rem' }}>Your cart is empty</div>
                  <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>Add fresh groceries to get started.</p>
                  <button 
                    onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                    className="btn btn-primary" 
                    style={{ marginTop: '1rem', fontSize: '0.85rem' }}
                  >
                    Start Shopping &rarr;
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div 
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#f8fafc',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {symbol}{item.selling_price} / {item.unit}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <button
                          onClick={() => updateQty(item.product_id, -1)}
                          style={{ padding: '0.2rem 0.45rem', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', minWidth: '22px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product_id, 1)}
                          style={{ padding: '0.2rem 0.45rem', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div style={{ fontWeight: '800', fontSize: '0.875rem', minWidth: '60px', textAlign: 'right' }}>
                        {symbol}{(item.selling_price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  <span>Items Total</span>
                  <span>{symbol}{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Delivery Charge</span>
                  <span>{deliveryFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `${symbol}${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary)' }}>{symbol}{grandTotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => { setIsCartOpen(false); navigate('/cart'); }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.7rem' }}
                  >
                    View Cart
                  </button>
                  <button
                    onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.7rem' }}
                  >
                    Checkout &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Rich Multi-Column Customer Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '3rem 2rem 1.5rem 2rem',
        borderTop: '1px solid #1e293b',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid #1e293b'
        }}>
          {/* Col 1: Store Bio */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={18} color="white" />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: '800' }}>{shopName}</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Your friendly neighbourhood grocery store. Bringing fresh daily staples, flours, dairy, oils, and packaged foods directly to your doorstep with guaranteed fast delivery.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#34d399', fontSize: '0.85rem', fontWeight: '600' }}>
              <ShieldCheck size={18} />
              <span>100% Quality & Freshness Guarantee</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Customer Service</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/shop" style={{ color: '#cbd5e1', textDecoration: 'none' }}>All Groceries & Staples</Link></li>
              <li><Link to="/cart" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Shopping Basket</Link></li>
              <li><Link to="/checkout" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Express Checkout</Link></li>
              <li><Link to="/track" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Track Your Order Status</Link></li>
              <li><Link to="/contact" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Store Location & Helpline</Link></li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Popular Categories</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/shop?cat=Atta & Flours" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Atta, Flours & Grains</Link></li>
              <li><Link to="/shop?cat=Dairy & Eggs" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Milk, Curd, Butter & Paneer</Link></li>
              <li><Link to="/shop?cat=Oils & Ghee" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Mustard Oil & Pure Desi Ghee</Link></li>
              <li><Link to="/shop?cat=Snacks & Biscuits" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Tea, Coffee & Tea-time Snacks</Link></li>
              <li><Link to="/shop?cat=Spices & Masalas" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Whole & Ground Spices</Link></li>
            </ul>
          </div>

          {/* Col 4: Store Contact & Hours */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem' }}>Store Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              {settings?.address && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} color="var(--primary)" />
                  <a href={`tel:${settings.phone}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{settings.phone}</a>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--primary)" />
                <span>Open Daily: 7:00 AM – 10:00 PM</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <Link
                  to="/admin/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    textDecoration: 'none'
                  }}
                >
                  <Lock size={12} /> Staff Login Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem'
        }}>
          <div>
            &copy; {new Date().getFullYear()} {shopName}. Powered by Single Vendor Cloud POS.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Secure Cash & UPI Payments</span>
            <span>Free Home Delivery</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

