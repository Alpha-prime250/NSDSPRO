import React, { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { api } from '../../api';
import { 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  MessageCircle, 
  CreditCard,
  Banknote
} from 'lucide-react';

export default function StoreCheckoutPage() {
  const { settings } = useOutletContext();
  const { cart, clearCart, subtotal, deliveryFee, grandTotal, cartCount } = useCart();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Express 2-Hour Delivery');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const symbol = settings?.currency_symbol || '₹';
  const shopName = settings?.shop_name || 'Fresh Grocery Store';

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress || cart.length === 0) {
      alert('Please fill in your name, contact phone, and delivery address.');
      return;
    }

    try {
      setSubmitting(true);
      const fullAddress = landmark ? `${customerAddress} (Landmark: ${landmark})` : customerAddress;
      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: fullAddress,
        items: cart,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        notes: `Slot: ${deliverySlot}${notes ? ` | Note: ${notes}` : ''}`
      };

      const res = await api.createOnlineOrder(orderPayload);
      setPlacedOrder(res);
      clearCart();
    } catch (err) {
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!placedOrder) return;
    const storePhone = (settings?.phone || '919876543210').replace(/[^0-9]/g, '');
    let msg = `🛒 *New Order Confirmation - ${placedOrder.order_number}*\n\n`;
    msg += `*Name:* ${placedOrder.customer_name}\n`;
    msg += `*Phone:* ${placedOrder.customer_phone}\n`;
    msg += `*Delivery Address:* ${placedOrder.customer_address}\n\n`;
    msg += `*Items Ordered:*\n`;
    (placedOrder.items || []).forEach((it, idx) => {
      msg += `${idx + 1}. ${it.name} - ${it.quantity} ${it.unit} @ ${symbol}${it.selling_price}\n`;
    });
    msg += `\n*Total Payable:* ${symbol}${Number(placedOrder.total_amount).toFixed(2)}`;
    msg += `\n*Payment Mode:* ${placedOrder.payment_method}`;

    window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Order Confirmed Success Screen
  if (placedOrder) {
    return (
      <div style={{ maxWidth: '650px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
            Thank you, {placedOrder.customer_name}! Your grocery bag is being packed right now.
          </p>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Order Number</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)', marginTop: '0.2rem' }}>
                {placedOrder.order_number}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)' }}></div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Amount to Pay</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {symbol}{Number(placedOrder.total_amount).toFixed(2)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleWhatsAppShare}
              className="btn"
              style={{
                backgroundColor: '#25D366',
                color: 'white',
                fontWeight: '700',
                padding: '0.85rem',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <MessageCircle size={18} />
              <span>Send Order Receipt on WhatsApp</span>
            </button>

            <Link
              to={`/track?query=${placedOrder.order_number}`}
              className="btn btn-primary"
              style={{ padding: '0.85rem', fontSize: '0.95rem' }}
            >
              Track Live Order Status &rarr;
            </Link>

            <Link
              to="/shop"
              className="btn btn-secondary"
              style={{ padding: '0.75rem', fontSize: '0.9rem' }}
            >
              Back to Home Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <h3>Your basket is empty</h3>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Explore Groceries
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Basket
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
          Checkout & Delivery Address
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Delivery Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Contact Details Card */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" /> 1. Contact Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--primary)" /> 2. Delivery Address
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  House / Flat / Street Address *
                </label>
                <textarea
                  required
                  rows="3"
                  className="input-field"
                  placeholder="e.g. Flat 302, Royal Residency, Main Road"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Near SBI Bank"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                    Delivery Slot
                  </label>
                  <select
                    className="input-field"
                    value={deliverySlot}
                    onChange={e => setDeliverySlot(e.target.value)}
                  >
                    <option value="Express 2-Hour Delivery">Express (Within 2 Hours)</option>
                    <option value="Today Evening (6 PM - 9 PM)">Today Evening (6 PM - 9 PM)</option>
                    <option value="Tomorrow Morning (8 AM - 11 AM)">Tomorrow Morning (8 AM - 11 AM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Banknote size={18} color="var(--primary)" /> 3. Payment Mode
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: paymentMethod === 'Cash on Delivery' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: paymentMethod === 'Cash on Delivery' ? '#ecfdf5' : '#f8fafc',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={e => setPaymentMethod(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Cash on Delivery</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay cash when bag arrives</div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: paymentMethod === 'UPI on Delivery' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: paymentMethod === 'UPI on Delivery' ? '#ecfdf5' : '#f8fafc',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="payment"
                  value="UPI on Delivery"
                  checked={paymentMethod === 'UPI on Delivery'}
                  onChange={e => setPaymentMethod(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>UPI on Delivery</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GPay / PhonePe / Paytm</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Order Review ({cartCount} items)</h3>

          <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cart.map(it => (
              <div key={it.product_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-main)' }}>{it.name} &times; {it.quantity}</span>
                <span style={{ fontWeight: '700' }}>{symbol}{(it.selling_price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>{symbol}{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Delivery Charges</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `${symbol}${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary)' }}>{symbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {submitting ? 'Placing Order...' : `Confirm & Place Order (${symbol}${grandTotal.toFixed(2)})`}
          </button>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Guaranteed fresh items · Free replacement if damaged</span>
          </div>
        </div>
      </form>
    </div>
  );
}
