import React, { useState, useEffect } from 'react';

import {
  Outlet,
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { api } from '../api';

import Navbar from '../components/Navbar';

import Sidebar from '../components/Sidebar';

export default function AdminLayout({ settings }) {

  const { user, logout, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);


  // =========================================================
  // ACTIVE SIDEBAR TAB
  // Example:
  // /admin/dashboard      -> dashboard
  // /admin/pos            -> pos
  // /admin/staff          -> staff
  // /admin/delivery-zones -> delivery-zones
  // =========================================================

  const currentTab =
    location.pathname
      .replace(/^\/admin\/?/, '')
      .split('/')[0] || 'dashboard';


  // =========================================================
  // CHECK PENDING ONLINE ORDERS
  // =========================================================

  useEffect(() => {

    checkPendingOrders();

    const interval = setInterval(
      checkPendingOrders,
      30000
    );

    return () => clearInterval(interval);

  }, []);


  const checkPendingOrders = async () => {

    try {

      const orders =
        await api.getOnlineOrders({
          status: 'Pending'
        });

      if (Array.isArray(orders)) {

        setPendingOrdersCount(
          orders.length
        );

      }

    } catch {

      // Ignore API errors

    }

  };


  // =========================================================
  // KEYBOARD SHORTCUT
  // F2 = POS BILLING
  // =========================================================

  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === 'F2') {

        e.preventDefault();

        navigate('/admin/pos');

      }

    };


    window.addEventListener(
      'keydown',
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );

    };

  }, [navigate]);


  // =========================================================
  // AUTHENTICATION CHECK
  // =========================================================

  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );

  }


  // =========================================================
  // SIDEBAR TAB CHANGE
  // =========================================================

  const handleTabChange = (tabId) => {

    // Delivery Zones
    if (tabId === 'delivery_zones') {

      navigate('/admin/delivery-zones');

      return;

    }


    // All other sidebar pages

    navigate(`/admin/${tabId}`);

  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    logout();

    navigate('/login');

  };


  // =========================================================
  // MAIN LAYOUT
  // =========================================================

  return (

    <div className="app-container">


      {/* =====================================================
          SIDEBAR NAVIGATION
      ===================================================== */}

      <Sidebar

        activeTab={currentTab}

        setActiveTab={handleTabChange}

        pendingOrdersCount={
          pendingOrdersCount
        }

        onOpenStorefront={() =>
          navigate('/')
        }

        onLogout={handleLogout}

      />


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="main-content">


        {/* ===================================================
            NAVBAR
        =================================================== */}

        <Navbar

          settings={settings}

          user={user}

          onOpenPOS={() =>
            navigate('/admin/pos')
          }

          onOpenStorefront={() =>
            navigate('/')
          }

          onLogout={handleLogout}

        />


        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="page-body">

          <Outlet
            context={{
              settings
            }}
          />

        </main>

      </div>

    </div>

  );

}
