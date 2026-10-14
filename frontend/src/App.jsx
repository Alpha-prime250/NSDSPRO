import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { api } from './api';

// =====================================================
// LAYOUTS
// =====================================================
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';

// =====================================================
// STOREFRONT PAGES
// =====================================================
import StoreHomePage from './pages/store/StoreHomePage';
import StoreShopPage from './pages/store/StoreShopPage';
import StoreProductDetailPage from './pages/store/StoreProductDetailPage';
import StoreCartPage from './pages/store/StoreCartPage';
import StoreCheckoutPage from './pages/store/StoreCheckoutPage';
import StoreOrderTrackingPage from './pages/store/StoreOrderTrackingPage';
import StoreContactPage from './pages/store/StoreContactPage';

// =====================================================
// CUSTOMER ACCOUNT PAGES
// =====================================================
import CustomerRegisterPage from './pages/store/CustomerRegisterPage';
import CustomerLoginPage from './pages/store/CustomerLoginPage';
import CustomerOrdersPage from './pages/store/CustomerOrdersPage';

// =====================================================
// ADMIN PAGES
// =====================================================
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import POSBillingPage from './pages/admin/POSBillingPage';
import OnlineOrdersPage from './pages/admin/OnlineOrdersPage';
import ProductsPage from './pages/admin/ProductsPage';
import PurchasesPage from './pages/admin/PurchasesPage';
import BarcodePage from './pages/admin/BarcodePage';
import CashShiftPage from './pages/admin/CashShiftPage';
import SalesHistoryPage from './pages/admin/SalesHistoryPage';
import CustomersPage from './pages/admin/CustomersPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import ExpensesPage from './pages/admin/ExpensesPage';
import ReportsPage from './pages/admin/ReportsPage';

// =====================================================
// STAFF
// =====================================================
import StaffPage from './pages/admin/StaffPage';

// =====================================================
// DELIVERY ZONES
// =====================================================
import DeliveryZonesPage from './pages/admin/DeliveryZonesPage';

// =====================================================
// SETTINGS
// =====================================================
import SettingsPage from './pages/admin/SettingsPage';


// =====================================================
// CUSTOMER PROFILE PAGE
// =====================================================
function CustomerProfilePage() {
  const navigate = useNavigate();

  let customer = {};

  try {
    const storedCustomer = localStorage.getItem('store_customer');
    customer = storedCustomer ? JSON.parse(storedCustomer) : {};
  } catch (error) {
    console.error('Failed to read customer details:', error);
  }

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('store_customer');
    localStorage.removeItem('customer_registered');

    sessionStorage.removeItem('customer_shop_path');

    navigate('/customer-login', { replace: true });
    window.location.reload();
  };

  const name =
    customer.name ||
    customer.customer_name ||
    customer.full_name ||
    'Customer';

  const email =
    customer.email ||
    customer.customer_email ||
    'Not available';

  const phone =
    customer.phone ||
    customer.customer_phone ||
    'Not available';

  return (
    <div
      style={{
        minHeight: '70vh',
        backgroundColor: '#f8fafc',
        padding: '3rem 1rem'
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '0.5rem'
          }}
        >
          My Account
        </h1>

        <p
          style={{
            color: '#64748b',
            marginBottom: '2rem'
          }}
        >
          Manage your account and view your personal details.
        </p>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}
          >
            <div
              style={{
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '800'
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.4rem',
                  color: '#0f172a'
                }}
              >
                {name}
              </h2>

              <p
                style={{
                  margin: '0.4rem 0 0',
                  color: '#059669',
                  fontWeight: '600'
                }}
              >
                Customer Account
              </p>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.5rem'
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#64748b', margin: '0 0 0.4rem' }}>
                Full Name
              </p>

              <p
                style={{
                  color: '#0f172a',
                  fontWeight: '600',
                  margin: 0
                }}
              >
                {name}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#64748b', margin: '0 0 0.4rem' }}>
                Email Address
              </p>

              <p
                style={{
                  color: '#0f172a',
                  fontWeight: '600',
                  margin: 0
                }}
              >
                {email}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#64748b', margin: '0 0 0.4rem' }}>
                Phone Number
              </p>

              <p
                style={{
                  color: '#0f172a',
                  fontWeight: '600',
                  margin: 0
                }}
              >
                {phone}
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '2rem'
            }}
          >
            <Link
              to="/customer-orders"
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '0.8rem 1.3rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '700'
              }}
            >
              View My Orders
            </Link>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '0.8rem 1.3rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// =====================================================
// CUSTOMER PROTECTED ROUTE
// =====================================================
function CustomerProtectedRoute({ children }) {
  const customerToken = localStorage.getItem('customer_token');

  const isRegistered =
    localStorage.getItem('customer_registered') === 'true';

  if (!customerToken || !isRegistered) {
    const currentPath = window.location.pathname;

    sessionStorage.setItem('customer_shop_path', currentPath);

    return (
      <Navigate
        to="/customer-login"
        replace
      />
    );
  }

  return children;
}


// =====================================================
// MAIN APP
// =====================================================
export default function App() {
  const [settings, setSettings] = useState(null);

  // =====================================================
  // LOAD STORE SETTINGS
  // =====================================================
  useEffect(() => {
    api.getSettings()
      .then((s) => {
        setSettings(s);
      })
      .catch((err) => {
        console.error('Failed to fetch settings:', err);
      });
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>

            {/* =====================================================
                1. CUSTOMER STOREFRONT WEBSITE
               ===================================================== */}

            <Route
              element={
                <StoreLayout settings={settings} />
              }
            >

              {/* HOME PAGE */}
              <Route
                index
                element={<StoreHomePage />}
              />

              {/* SHOP PAGE */}
              <Route
                path="shop"
                element={
                  <CustomerProtectedRoute>
                    <StoreShopPage />
                  </CustomerProtectedRoute>
                }
              />

              {/* PRODUCT DETAILS */}
              <Route
                path="product/:id"
                element={
                  <CustomerProtectedRoute>
                    <StoreProductDetailPage />
                  </CustomerProtectedRoute>
                }
              />

              {/* CART */}
              <Route
                path="cart"
                element={
                  <CustomerProtectedRoute>
                    <StoreCartPage />
                  </CustomerProtectedRoute>
                }
              />

              {/* CHECKOUT */}
              <Route
                path="checkout"
                element={
                  <CustomerProtectedRoute>
                    <StoreCheckoutPage />
                  </CustomerProtectedRoute>
                }
              />

              {/* TRACK ORDER */}
              <Route
                path="track"
                element={<StoreOrderTrackingPage />}
              />

              {/* CONTACT */}
              <Route
                path="contact"
                element={<StoreContactPage />}
              />

              {/* CUSTOMER ORDER HISTORY */}
              <Route
                path="customer-orders"
                element={
                  <CustomerProtectedRoute>
                    <CustomerOrdersPage />
                  </CustomerProtectedRoute>
                }
              />

              {/* CUSTOMER PROFILE / MY ACCOUNT */}
              <Route
                path="customer-profile"
                element={
                  <CustomerProtectedRoute>
                    <CustomerProfilePage />
                  </CustomerProtectedRoute>
                }
              />

            </Route>


            {/* =====================================================
                2. CUSTOMER REGISTRATION
               ===================================================== */}
            <Route
              path="customer-register"
              element={<CustomerRegisterPage />}
            />


            {/* =====================================================
                3. CUSTOMER LOGIN
               ===================================================== */}
            <Route
              path="customer-login"
              element={<CustomerLoginPage />}
            />


            {/* =====================================================
                4. ADMIN LOGIN
               ===================================================== */}
            <Route
              path="login"
              element={
                <LoginPage settings={settings} />
              }
            />


            {/* =====================================================
                5. ADMIN / POS BACKOFFICE
               ===================================================== */}
            <Route
              path="admin"
              element={
                <AdminLayout settings={settings} />
              }
            >

              {/* ADMIN DEFAULT */}
              <Route
                index
                element={
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                }
              />

              {/* DASHBOARD */}
              <Route
                path="dashboard"
                element={<DashboardPage />}
              />

              {/* POS BILLING */}
              <Route
                path="pos"
                element={<POSBillingPage />}
              />

              {/* ONLINE ORDERS */}
              <Route
                path="online_orders"
                element={<OnlineOrdersPage />}
              />

              {/* PRODUCTS */}
              <Route
                path="products"
                element={<ProductsPage />}
              />

              {/* PURCHASES */}
              <Route
                path="purchases"
                element={<PurchasesPage />}
              />

              {/* BARCODE */}
              <Route
                path="barcodes"
                element={<BarcodePage />}
              />

              {/* CASH SHIFT */}
              <Route
                path="shifts"
                element={<CashShiftPage />}
              />

              {/* SALES HISTORY */}
              <Route
                path="sales"
                element={<SalesHistoryPage />}
              />

              {/* CUSTOMERS */}
              <Route
                path="customers"
                element={<CustomersPage />}
              />

              {/* SUPPLIERS */}
              <Route
                path="suppliers"
                element={<SuppliersPage />}
              />

              {/* EXPENSES */}
              <Route
                path="expenses"
                element={<ExpensesPage />}
              />

              {/* REPORTS */}
              <Route
                path="reports"
                element={<ReportsPage />}
              />

              {/* STAFF MANAGEMENT */}
              <Route
                path="staff"
                element={<StaffPage />}
              />

              {/* DELIVERY ZONES */}
              <Route
                path="delivery-zones"
                element={<DeliveryZonesPage />}
              />

              {/* SETTINGS */}
              <Route
                path="settings"
                element={<SettingsPage />}
              />

            </Route>


            {/* =====================================================
                6. FALLBACK
               ===================================================== */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
