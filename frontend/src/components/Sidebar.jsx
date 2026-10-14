import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Globe,
  Package,
  Receipt,
  Users,
  Truck,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  ShoppingBag,
  DollarSign,
  Barcode,
  PackagePlus,
  MapPin,
  LogOut,
  Menu
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },

  { id: 'pos', label: 'POS Billing (F2)', icon: ShoppingCart, highlight: true },

  { id: 'online_orders', label: 'Online Orders', icon: ShoppingBag, badge: true },

  { id: 'products', label: 'Products & Inventory', icon: Package },

  { id: 'purchases', label: 'Goods Receiving', icon: PackagePlus },

  { id: 'barcodes', label: 'Barcode Generator', icon: Barcode },

  { id: 'shifts', label: 'Cash Shifts / Drawer', icon: DollarSign },

  { id: 'sales', label: 'Sales History', icon: Receipt },

  { id: 'customers', label: 'Customers & Dues', icon: Users },

  { id: 'suppliers', label: 'Suppliers', icon: Truck },

  { id: 'expenses', label: 'Expenses', icon: CreditCard },

  { id: 'reports', label: 'Reports & P&L', icon: BarChart3 },

  // STAFF MANAGEMENT
  { id: 'staff', label: 'Staff Management', icon: Users },

  // DELIVERY ZONES
  { id: 'delivery_zones', label: 'Delivery Zones', icon: MapPin },

  { id: 'settings', label: 'Shop Settings', icon: SettingsIcon },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenStorefront,
  onLogout,
  pendingOrdersCount = 0
}) {

  // Sidebar Toggle State
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '245px',
        backgroundColor: 'var(--bg-sidebar)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        userSelect: 'none',
        height: '100vh',
        transition: 'width 0.25s ease',
        overflow: 'hidden'
      }}
    >

      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '1.25rem 0.75rem' : '1.25rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between'
        }}
      >

        {!isCollapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                backgroundColor: 'var(--primary)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                flexShrink: 0
              }}
            >
              P
            </div>

            <div>
              <div
                style={{
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  letterSpacing: '-0.2px'
                }}
              >
                StorePOS
              </div>

              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#94a3b8'
                }}
              >
                Web Edition v2.0
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Logo */}
        {isCollapsed && (
          <div
            style={{
              width: '34px',
              height: '34px',
              backgroundColor: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            P
          </div>
        )}

        {/* Toggle Button */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            title="Collapse Sidebar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Menu size={20} />
          </button>
        )}

      </div>

      {/* Toggle Button When Sidebar is Collapsed */}
      {isCollapsed && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0.5rem 0'
          }}
        >
          <button
            onClick={() => setIsCollapsed(false)}
            title="Open Sidebar"
            style={{
              width: '40px',
              height: '36px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Menu size={21} />
          </button>
        </div>
      )}

      {/* Online Storefront Quick Switch */}
      <div
        style={{
          padding: isCollapsed
            ? '0.5rem 0.75rem'
            : '0.75rem 0.75rem 0.25rem'
        }}
      >
        <button
          onClick={onOpenStorefront}
          title="View Online Store"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #334155',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#38bdf8',
            fontWeight: '600',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              'rgba(56, 189, 248, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              'rgba(255, 255, 255, 0.05)';
          }}
        >
          <Globe size={17} />

          {!isCollapsed && (
            <span>View Online Store 🌐</span>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: isCollapsed
            ? '0.5rem 0.5rem'
            : '0.5rem 0.75rem',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >

          {MENU_ITEMS.map((item) => {

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed
                    ? 'center'
                    : 'space-between',
                  padding: isCollapsed
                    ? '0.7rem 0.4rem'
                    : '0.6rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor:
                    isActive
                      ? 'var(--primary)'
                      : item.highlight
                        ? 'rgba(5, 150, 105, 0.18)'
                        : 'transparent',
                  color:
                    isActive
                      ? 'white'
                      : item.highlight
                        ? '#34d399'
                        : '#cbd5e1',
                  fontWeight:
                    isActive || item.highlight
                      ? '600'
                      : '500',
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCollapsed ? '0' : '0.65rem'
                  }}
                >
                  <Icon size={18} />

                  {!isCollapsed && (
                    <span>{item.label}</span>
                  )}
                </div>

                {/* Pending Orders Badge */}
                {item.badge && pendingOrdersCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      lineHeight: 1,
                      position: isCollapsed
                        ? 'absolute'
                        : 'static',
                      top: isCollapsed ? '3px' : 'auto',
                      right: isCollapsed ? '3px' : 'auto'
                    }}
                  >
                    {pendingOrdersCount}
                  </span>
                )}

              </button>
            );
          })}

        </div>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: isCollapsed
            ? '0.75rem 0.4rem'
            : '0.75rem 1rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isCollapsed ? '0.6rem' : '0',
          fontSize: '0.75rem',
          color: '#64748b'
        }}
      >

        {!isCollapsed && (
          <span>MySQL Connected</span>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isCollapsed ? '0' : '0.35rem',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.75rem',
              padding: '0.35rem',
              borderRadius: '4px'
            }}
          >

            <LogOut size={16} />

            {!isCollapsed && (
              <span>Logout</span>
            )}

          </button>
        )}

      </div>

    </aside>
  );
}
