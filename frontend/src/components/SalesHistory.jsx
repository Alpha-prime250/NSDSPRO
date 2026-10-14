import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Search,
  Eye,
  RefreshCw,
  RotateCcw,
  Download,
  X,
  Printer,
  FileText
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

export default function SalesHistory({
  settings,
  onViewInvoice,
  onProcessReturn
}) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Print format modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedAction, setSelectedAction] = useState('invoice');
  const [selectedFormat, setSelectedFormat] = useState('80mm');

  const symbol = settings?.currency_symbol || '₹';

  const loadSales = async () => {
    try {
      setLoading(true);
      const list = await api.getSales({ search: searchTerm });
      setSales(list);
    } catch (err) {
      console.error('Failed to load sales history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [searchTerm]);

  const handleExportCSV = () => {
    exportToCSV('sales_invoices', sales, [
      { key: 'invoice_number', label: 'Invoice Number' },
      { key: 'created_at', label: 'Date & Time' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'payment_mode', label: 'Payment Mode' },
      { key: 'subtotal', label: 'Subtotal' },
      { key: 'tax_amount', label: 'Tax' },
      { key: 'discount_amount', label: 'Discount' },
      { key: 'total_amount', label: 'Total Amount' },
      { key: 'status', label: 'Status' }
    ]);
  };

  // Open format selection modal
  const openPrintModal = (saleId, action) => {
    setSelectedSale(saleId);
    setSelectedAction(action);
    setSelectedFormat('80mm');
    setShowPrintModal(true);
  };

  // Continue with selected print format
  const handleContinue = () => {
    if (!selectedSale) return;

    if (selectedAction === 'invoice') {
      if (onViewInvoice) {
        onViewInvoice(selectedSale, selectedFormat);
      }
    } else {
      if (onProcessReturn) {
        onProcessReturn(selectedSale, selectedFormat);
      }
    }

    setShowPrintModal(false);
    setSelectedSale(null);
  };

  const formatOptions = [
    {
      value: '80mm',
      title: '80mm Thermal',
      description: 'Standard thermal receipt',
      icon: <Printer size={24} />
    },
    {
      value: '58mm',
      title: '58mm Thermal',
      description: 'Compact thermal receipt',
      icon: <Printer size={24} />
    },
    {
      value: 'A4',
      title: 'A4 Size',
      description: 'Full-page invoice',
      icon: <FileText size={24} />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header & Search */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
            Sales Invoices History
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            All past completed billing transactions
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '10px',
                top: '10px',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search by invoice # or customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            title="Download Excel/CSV report"
          >
            <Download size={15} /> Export CSV
          </button>

          <button onClick={loadSales} className="btn btn-secondary">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Date & Time</th>
              <th>Customer Name</th>
              <th>Payment Mode</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <RefreshCw
                    className="animate-spin"
                    size={20}
                    style={{ display: 'inline', marginRight: '0.5rem' }}
                  />
                  Loading sales history...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  No sales invoices found.
                </td>
              </tr>
            ) : (
              sales.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                    {s.invoice_number}
                  </td>

                  <td
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    {new Date(s.created_at).toLocaleString()}
                  </td>

                  <td style={{ fontWeight: '600' }}>
                    {s.customer_name}
                  </td>

                  <td>
                    <span className="badge badge-success">
                      {s.payment_mode}
                    </span>
                  </td>

                  <td
                    style={{
                      fontWeight: '800',
                      color: 'var(--primary)',
                      fontSize: '0.95rem'
                    }}
                  >
                    {symbol}
                    {Number(s.total_amount).toFixed(2)}
                  </td>

                  <td>
                    <span className="badge badge-info">
                      {s.status}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => openPrintModal(s.id, 'invoice')}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem'
                        }}
                        title="View or print invoice"
                      >
                        <Eye size={13} /> View
                      </button>

                      <button
                        onClick={() => openPrintModal(s.id, 'return')}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          color: '#e11d48',
                          borderColor: '#fecdd3'
                        }}
                        title="Process Return / Refund"
                      >
                        <RotateCcw size={13} /> Return
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Print Format Selection Modal */}
      {showPrintModal && (
        <div
          onClick={() => setShowPrintModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--text-main, #111827)',
              borderRadius: '14px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                  {selectedAction === 'invoice'
                    ? 'Select Invoice Size'
                    : 'Select Return Receipt Size'}
                </h3>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.4rem'
                  }}
                >
                  Choose the format for your receipt.
                </p>
              </div>

              <button
                onClick={() => setShowPrintModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0.4rem' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Format Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {formatOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedFormat(option.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '10px',
                    border:
                      selectedFormat === option.value
                        ? '2px solid var(--primary, #2563eb)'
                        : '1px solid var(--border, #e5e7eb)',
                    background:
                      selectedFormat === option.value
                        ? 'rgba(37, 99, 235, 0.08)'
                        : 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ color: 'var(--primary, #2563eb)' }}>
                    {option.icon}
                  </span>

                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>
                      {option.title}
                    </strong>
                    <small
                      style={{
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginTop: '0.25rem'
                      }}
                    >
                      {option.description}
                    </small>
                  </span>

                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border:
                        selectedFormat === option.value
                          ? '6px solid var(--primary, #2563eb)'
                          : '2px solid #9ca3af',
                      flexShrink: 0
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}
            >
              <button
                onClick={() => setShowPrintModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>

              <button
                onClick={handleContinue}
                className="btn btn-primary"
              >
                <Printer size={15} />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
