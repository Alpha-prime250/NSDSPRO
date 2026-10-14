import React from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';

export default function StoreCartPage() {
  const { settings } = useOutletContext();
  const { cart, updateQty, removeFromCart, clearCart, subtotal, deliveryFee, grandTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const symbol = settings?.currency_symbol || '₹';

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', backgroundColor: 'white', padding: '4rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
        <ShoppingCart size={64} style={{ opacity: 0.25, margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Your Shopping Basket is Empty</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.5rem 0 2rem' }}>
          Explore our wide range of daily staples, dairy, flours, and fresh snacks.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
          Explore Groceries &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
            Shopping Basket
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Review your {cartCount} items before proceeding to home delivery
          </p>
        </div>

        <button onClick={clearCart} className="btn btn-secondary" style={{ fontSize: '0.8rem', color: '#ef4444' }}>
          Clear Basket
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Free Delivery Bar */}
          <div style={{
            backgroundColor: subtotal >= 499 ? '#ecfdf5' : '#fef3c7',
            border: `1px solid ${subtotal >= 499 ? '#a7f3d0' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: subtotal >= 499 ? '#065f46' : '#92400e',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            <Truck size={20} />
            <span>
              {subtotal >= 499 
                ? '🎉 Congratulations! You have qualified for FREE Home Delivery!' 
                : `Add ${symbol}${(499 - subtotal).toFixed(2)} more worth of groceries to get FREE Home Delivery!`}
            </span>
          </div>

          {/* Items Card */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {cart.map((item, idx) => (
              <div
                key={item.product_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  borderBottom: idx === cart.length - 1 ? 'none' : '1px solid #f1f5f9',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={`/product/${item.product_id}`}
                    style={{ textDecoration: 'none', fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', display: 'block' }}
                  >
                    {item.name}
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {symbol}{item.selling_price} per {item.unit}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={() => updateQty(item.product_id, -1)}
                      style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: '800', minWidth: '30px', textAlign: 'center', fontSize: '0.9rem' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product_id, 1)}
                      style={{ padding: '0.5rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ fontWeight: '800', fontSize: '1.05rem', minWidth: '80px', textAlign: 'right' }}>
                    {symbol}{(item.selling_price * item.quantity).toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Order Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Items Total ({cartCount})</span>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{symbol}{subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Estimated Delivery Fee</span>
              <span>{deliveryFee === 0 ? <strong style={{ color: '#059669' }}>FREE</strong> : `${symbol}${deliveryFee.toFixed(2)}`}</span>
            </div>

            <div style={{ paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '900' }}>
              <span>Payable Total</span>
              <span style={{ color: 'var(--primary)' }}>{symbol}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#059669" />
            <span>Pay securely on delivery via Cash or UPI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
