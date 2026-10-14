import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Store, 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  MessageCircle,
  Truck,
  Sparkles
} from 'lucide-react';

export default function Storefront({ settings, onBackToPOS }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Cart & Drawer
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const symbol = settings?.currency_symbol || '₹';

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const list = await api.getProducts();
      setProducts(list);
    } catch (err) {
      console.error('Failed to load online catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(it => it.product_id === product.id);
      if (existing) {
        return prev.map(it => it.product_id === product.id ? { ...it, quantity: it.quantity + 1 } : it);
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        selling_price: Number(product.selling_price),
        unit: product.unit || 'pcs',
        quantity: 1
      }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => prev.map(it => {
      if (it.product_id === productId) {
        const newQty = it.quantity + delta;
        return newQty <= 0 ? null : { ...it, quantity: newQty };
      }
      return it;
    }).filter(Boolean));
  };

  const cartItemCount = cart.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = cart.reduce((sum, it) => sum + (it.selling_price * it.quantity), 0);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  // Place Web Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress || cart.length === 0) return;

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: cart,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        notes
      };

      const res = await api.createOnlineOrder(orderPayload);
      setPlacedOrder(res);
      setCart([]);
    } catch (err) {
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Checkout
  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    const storePhone = (settings?.phone || '919876543210').replace(/[^0-9]/g, '');
    
    let msg = `🛒 *New Order from ${settings?.shop_name || 'Store'} Website*\n\n`;
    msg += `*Customer:* ${customerName || 'Customer'}\n`;
    if (customerPhone) msg += `*Phone:* ${customerPhone}\n`;
    if (customerAddress) msg += `*Address:* ${customerAddress}\n\n`;
    msg += `*Order Items:*\n`;
    cart.forEach((it, idx) => {
      msg += `${idx + 1}. ${it.name} - ${it.quantity} ${it.unit} @ ${symbol}${it.selling_price} = ${symbol}${(it.quantity * it.selling_price).toFixed(2)}\n`;
    });
    msg += `\n*Subtotal:* ${symbol}${subtotal.toFixed(2)}`;
    msg += `\n*Delivery:* ${deliveryFee === 0 ? 'FREE' : `${symbol}${deliveryFee}`}`;
    msg += `\n*Total Amount:* ${symbol}${grandTotal.toFixed(2)}`;
    msg += `\n*Payment:* ${paymentMethod}\n`;

    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Notice Bar */}
      <div style={{
        backgroundColor: '#064e3b',
        color: '#a7f3d0',
        padding: '0.4rem 1.5rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={14} />
          <span>FREE Home Delivery on all orders above {symbol}499!</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {settings?.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={13} /> Helpline: {settings.phone}
            </span>
          )}
          <button 
            onClick={onBackToPOS}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.7rem'
            }}
          >
            Switch to Staff POS
          </button>
        </div>
      </div>

      {/* Customer Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Store size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {settings?.shop_name || 'Fresh Grocery Store'}
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Order Online · Fast Local Delivery
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search atta, oil, rice, biscuits..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem', borderRadius: '9999px' }}
          />
        </div>

        {/* View Cart Button */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="btn btn-primary"
          style={{ padding: '0.625rem 1.25rem', borderRadius: '9999px', position: 'relative' }}
        >
          <ShoppingCart size={18} />
          <span>My Cart</span>
          {cartItemCount > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '9999px',
              padding: '0.15rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '800',
              marginLeft: '0.25rem'
            }}>
              {cartItemCount}
            </span>
          )}
        </button>
      </header>

      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white',
        padding: '2.5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '0.3rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={14} /> Fresh & Hygenic Everyday
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1.2 }}>
            Fresh Groceries & Daily Needs Delivered Fast
          </h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', opacity: 0.9 }}>
            Shop authentic quality staples, packaged groceries, and home essentials directly from your neighborhood store.
          </p>
        </div>
      </section>

      {/* Main Catalog Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem', flex: 1 }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'white',
                color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: selectedCategory === cat ? '0 4px 6px -1px rgba(5,150,105,0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredProducts.map(prod => {
            const inCart = cart.find(it => it.product_id === prod.id);
            const isOutOfStock = prod.quantity <= 0;
            return (
              <div 
                key={prod.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem'
                  }}>
                    {prod.category}
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700', lineHeight: 1.3 }}>
                    {prod.name}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Unit: {prod.unit || 'pcs'}
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {symbol}{Number(prod.selling_price).toFixed(2)}
                    </span>
                  </div>

                  {isOutOfStock ? (
                    <span className="badge badge-danger">Out of Stock</span>
                  ) : inCart ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button 
                        onClick={() => updateCartQty(prod.id, -1)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', minWidth: '20px', textAlign: 'center' }}>
                        {inCart.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartQty(prod.id, 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart(prod)}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8125rem' }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Customer Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '2rem',
        borderTop: '1px solid #1e293b',
        textAlign: 'center',
        fontSize: '0.8125rem'
      }}>
        <div style={{ fontWeight: '700', color: 'white', fontSize: '1rem', marginBottom: '0.25rem' }}>
          {settings?.shop_name || 'Retail & Grocery Store'}
        </div>
        <div>{settings?.address || 'Main Market Road, City Center'}</div>
        {settings?.phone && <div style={{ marginTop: '0.25rem' }}>Call / WhatsApp: {settings.phone}</div>}
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
          &copy; {new Date().getFullYear()} Single Vendor POS & Online Storefront. All rights reserved.
        </div>
      </footer>

      {/* Slide-Over Shopping Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div 
            className="modal-card" 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: '480px', height: '100%', maxHeight: '100vh', margin: '0 0 0 auto', borderRadius: 0 }}
          >
            {/* Drawer Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.1rem' }}>
                <ShoppingCart size={20} color="var(--primary)" />
                <span>Your Basket ({cartItemCount} items)</span>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Placed Order Success Modal */}
            {placedOrder ? (
              <div style={{ padding: '2rem', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={54} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Order Confirmed!</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700', margin: '0.5rem 0' }}>
                  Order ID: {placedOrder.order_number}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                  Thank you, <strong>{placedOrder.customer_name}</strong>! Your order has been sent to our store for packing and dispatch.
                </p>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '1rem' }}>
                  Total Amount: {symbol}{Number(placedOrder.total_amount).toFixed(2)} ({placedOrder.payment_method})
                </div>

                <button 
                  onClick={() => { setPlacedOrder(null); setIsCartOpen(false); }}
                  className="btn btn-primary"
                  style={{ marginTop: '1.5rem', width: '100%' }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <ShoppingCart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <div style={{ fontWeight: '700', fontSize: '1rem' }}>Your basket is empty</div>
                <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Add some fresh groceries to get started!</p>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {/* Cart Items List */}
                <div style={{ padding: '1rem', flex: '0 0 auto', maxHeight: '220px', overflowY: 'auto' }}>
                  {cart.map(it => (
                    <div key={it.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{it.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {symbol}{it.selling_price} &times; {it.quantity}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button 
                          onClick={() => updateCartQty(it.product_id, -1)}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: '700', fontSize: '0.85rem', minWidth: '20px', textAlign: 'center' }}>
                          {it.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQty(it.product_id, 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div style={{ width: '65px', textAlign: 'right', fontWeight: '700', fontSize: '0.875rem' }}>
                        {symbol}{(it.selling_price * it.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Form */}
                <form onSubmit={handlePlaceOrder} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '800' }}>Delivery Details</div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem', display: 'block' }}>Full Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="Your full name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem', display: 'block' }}>Mobile / WhatsApp Number *</label>
                    <input 
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem', display: 'block' }}>Complete Delivery Address *</label>
                    <textarea 
                      required
                      rows="2"
                      placeholder="Flat / House no, Landmark, Area"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="input-field"
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2rem', display: 'block' }}>Payment Method</label>
                    <select 
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="input-field"
                    >
                      <option value="Cash on Delivery">Cash on Delivery (Pay when order arrives)</option>
                      <option value="UPI on Delivery">UPI QR on Delivery (GPay / PhonePe / Paytm)</option>
                    </select>
                  </div>

                  {/* Pricing Breakdown */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span>Subtotal</span>
                      <span>{symbol}{subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                      <span>Delivery Charges</span>
                      <span>{deliveryFee === 0 ? <strong style={{ color: 'var(--primary)' }}>FREE</strong> : `${symbol}${deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span>Total Payable</span>
                      <span style={{ color: 'var(--primary)' }}>{symbol}{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem', fontSize: '0.95rem' }}
                    >
                      {isSubmitting ? 'Placing Order...' : `Place Delivery Order (${symbol}${grandTotal.toFixed(2)})`}
                    </button>

                    <button
                      type="button"
                      onClick={handleWhatsAppOrder}
                      style={{
                        padding: '0.625rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        backgroundColor: '#25D366',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <MessageCircle size={18} />
                      <span>Send Order on WhatsApp</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
