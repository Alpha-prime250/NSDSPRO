import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Store,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';

import { api } from '../../api';

export default function CustomerLoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    login: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const login = form.login.trim();
    const password = form.password;

    if (!login) {
      setError('Please enter your email or mobile number.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const data = await api.loginCustomer({
        login,
        password
      });

      if (!data?.token) {
        throw new Error('Login successful response did not include a token.');
      }

      // Save customer token
      localStorage.setItem('customer_token', data.token);

      // Save customer profile
      if (data?.customer) {
        localStorage.setItem(
          'store_customer',
          JSON.stringify(data.customer)
        );
      }

      // Mark customer as logged in
      localStorage.setItem('customer_registered', 'true');

      // Get previous shopping path, if any
      const shopPath =
        sessionStorage.getItem('customer_shop_path') || '/shop';

      sessionStorage.removeItem('customer_shop_path');

      // If user specifically came from My Orders, go there
      const redirectPath =
        sessionStorage.getItem('customer_redirect_path');

      if (redirectPath) {
        sessionStorage.removeItem('customer_redirect_path');
        navigate(redirectPath);
      } else {
        navigate(shopPath);
      }

    } catch (err) {
      console.error('Customer Login Error:', err);

      setError(
        err?.message ||
        'Invalid email/mobile number or password.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f8f7',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#08a66a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Store size={25} />
          </div>

          <div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#172033'
              }}
            >
              Green Grocery & Retail Store
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                color: '#718096'
              }}
            >
              Online Supermarket & Express Delivery
            </div>
          </div>
        </Link>

        <Link
          to="/"
          style={{
            textDecoration: 'none',
            color: '#087f5b',
            fontWeight: '700'
          }}
        >
          Home
        </Link>
      </header>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem 1rem'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: '#ffffff',
            borderRadius: '18px',
            padding: '2rem',
            boxShadow: '0 10px 35px rgba(0,0,0,0.08)',
            boxSizing: 'border-box'
          }}
        >
          {/* TITLE */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '1.75rem'
            }}
          >
            <div
              style={{
                width: '58px',
                height: '58px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: '#e7f8f1',
                color: '#08a66a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={28} />
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '1.7rem',
                fontWeight: '800',
                color: '#172033'
              }}
            >
              Welcome Back
            </h1>

            <p
              style={{
                marginTop: '0.5rem',
                color: '#718096',
                fontSize: '0.9rem'
              }}
            >
              Login to continue shopping and view your orders.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#be123c',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                lineHeight: '1.5'
              }}
            >
              {error}
            </div>
          )}

          {/* LOGIN FORM */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* EMAIL OR MOBILE */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontWeight: '700',
                  color: '#374151',
                  fontSize: '0.85rem'
                }}
              >
                Email or Mobile Number *
              </label>

              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />

                <input
                  type="text"
                  name="login"
                  value={form.login}
                  onChange={handleChange}
                  placeholder="Enter email or mobile number"
                  autoComplete="username"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.85rem 1rem 0.85rem 2.7rem',
                    border: '1px solid #dbe2e8',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  fontWeight: '700',
                  color: '#374151',
                  fontSize: '0.85rem'
                }}
              >
                Password *
              </label>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8'
                  }}
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.85rem 3rem 0.85rem 2.7rem',
                    border: '1px solid #dbe2e8',
                    borderRadius: '10px',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SECURITY INFO */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                background: '#f0fdf8',
                border: '1px solid #ccefe2',
                padding: '0.8rem',
                borderRadius: '10px',
                color: '#166534',
                fontSize: '0.8rem'
              }}
            >
              <ShieldCheck size={18} style={{ flexShrink: 0 }} />

              <span>
                Your account information is securely protected.
              </span>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              style={{
                border: 'none',
                borderRadius: '10px',
                padding: '0.95rem 1rem',
                background: '#08a66a',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? 'Logging in...' : 'Login & Continue'}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* CREATE ACCOUNT */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.85rem',
              color: '#718096'
            }}
          >
            Don't have an account?{' '}

            <Link
              to="/customer-register"
              style={{
                color: '#087f5b',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              Create Account
            </Link>
          </div>

          {/* MY ORDERS LINK */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1rem'
            }}
          >
            <Link
              to="/my-orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: '#087f5b',
                fontWeight: '700',
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
            >
              <ShoppingBag size={18} />
              View My Orders
            </Link>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.8rem',
              color: '#718096'
            }}
          >
            Login with your existing account to continue shopping and view your order history.
          </div>
        </div>
      </main>
    </div>
  );
}