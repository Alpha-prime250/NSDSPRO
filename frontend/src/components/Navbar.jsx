import React, { useState, useEffect } from 'react';
import { Store, Clock, User, CheckCircle2, Zap, Globe, LogOut } from 'lucide-react';

export default function Navbar({ settings, user, onOpenPOS, onOpenStorefront, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      flexShrink: 0
    }}>
      {/* Left: Shop Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Store size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.05rem', fontWeight: '700', lineHeight: 1.2 }}>
            {settings?.shop_name || 'Retail & Grocery POS'}
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Single Vendor Edition · MySQL Powered
          </span>
        </div>
      </div>

      {/* Right: Actions, Live Clock & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Customer Storefront button */}
        {onOpenStorefront && (
          <button 
            onClick={onOpenStorefront}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Open Public Customer Website"
          >
            <Globe size={15} color="#0284c7" />
            <span>Store Website</span>
          </button>
        )}

        {/* Quick Billing Button */}
        <button 
          onClick={onOpenPOS}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          <Zap size={15} />
          <span>New Sale (F2)</span>
        </button>

        {/* Database Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.35rem 0.75rem',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={14} />
          <span>DB Online</span>
        </div>

        {/* Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          fontWeight: '500'
        }}>
          <Clock size={15} />
          <span>{currentTime}</span>
        </div>

        {/* User Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.75rem',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-color)',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontWeight: '600'
        }}>
          <User size={15} color="#059669" />
          <span>{user?.name || settings?.owner_name || 'Admin'}</span>
          {user?.role && (
            <span style={{
              fontSize: '0.65rem',
              backgroundColor: user.role === 'admin' ? '#dbeafe' : '#fef3c7',
              color: user.role === 'admin' ? '#1e40af' : '#92400e',
              padding: '0.1rem 0.4rem',
              borderRadius: '9999px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              {user.role}
            </span>
          )}
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            className="btn btn-secondary"
            style={{ padding: '0.45rem', borderRadius: '50%', color: '#ef4444' }}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
