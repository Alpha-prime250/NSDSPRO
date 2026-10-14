import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function StoreContactPage() {
  const { settings } = useOutletContext();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const shopName = settings?.shop_name || 'Fresh Grocery Store';

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
          Contact & Store Information
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Have a question about groceries, bulk party orders, or delivery timing? Reach out to us.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Contact Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>Store Location</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {settings?.address || 'Main Market Road, City Centre, Near Central Bank'}
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Phone size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>Phone & WhatsApp</h3>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Direct store helpline for orders: <strong>{settings?.phone || '9876543210'}</strong>
              </p>
              <a
                href={`https://wa.me/${(settings?.phone || '919876543210').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#25D366',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={16} /> Chat on WhatsApp &rarr;
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.35rem 0' }}>Working Hours</h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Monday – Sunday: <strong>7:00 AM – 10:00 PM</strong><br />
                Home delivery runs all 7 days of the week!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Send Message Form */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem' }}>Send Us a Message</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Fill in your enquiry and our store manager will get back to you shortly.
          </p>

          {submitted ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', color: '#065f46' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>Message Sent!</h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Thank you, {name}. We will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>Your Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Rahul"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>Your Message / Query *</label>
                <textarea
                  required
                  rows="4"
                  className="input-field"
                  placeholder="Type your message or special grocery request here..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.8rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Send size={16} />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
