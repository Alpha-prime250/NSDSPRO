import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Plus,
  Search,
  Trash2,
  X,
  RefreshCw,
  BookOpen,
  Printer,
  CheckCircle
} from 'lucide-react';

export default function Customers({ settings }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [outstandingDues, setOutstandingDues] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Settle Dues Modal State
  const [settleModalCust, setSettleModalCust] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settlePaymentMode, setSettlePaymentMode] = useState('Cash');
  const [settleNotes, setSettleNotes] = useState('');
  const [isSettling, setIsSettling] = useState(false);

  // Payment Receipt Modal State
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  // Customer Ledger Modal State
  const [ledgerCust, setLedgerCust] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const symbol = settings?.currency_symbol || '₹';

  // Load Customers
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const list = await api.getCustomers({ search: searchTerm });
      setCustomers(list);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchTerm]);

  // Create Customer
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      setIsSaving(true);

      await api.createCustomer({
        name,
        phone,
        email,
        address,
        outstanding_dues: Number(outstandingDues || 0)
      });

      setIsModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setOutstandingDues(0);

      loadCustomers();
    } catch (err) {
      alert(err.message || 'Failed to create customer');
    } finally {
      setIsSaving(false);
    }
  };

  // Settle Customer Dues
  const handleSettleDues = async (e) => {
    e.preventDefault();

    if (!settleModalCust || !settleAmount) return;

    const paid = parseFloat(settleAmount);

    if (isNaN(paid) || paid <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    if (paid > Number(settleModalCust.outstanding_dues || 0)) {
      alert('Payment amount cannot exceed outstanding dues.');
      return;
    }

    try {
      setIsSettling(true);

      const res = await api.recordCustomerPayment(settleModalCust.id, {
        amount: paid,
        payment_mode: settlePaymentMode,
        notes: settleNotes || `Dues payment by ${settlePaymentMode}`
      });

      if (res && res.success) {
        setPaymentReceipt({
          receipt_number: res.receipt_number,
          customer_name: settleModalCust.name,
          customer_phone: settleModalCust.phone,
          amount_paid: Number(res.amount_paid ?? paid),
          remaining_dues: Number(res.remaining_dues ?? 0),
          payment_mode: settlePaymentMode,
          date: new Date().toLocaleString()
        });

        setSettleModalCust(null);
        setSettleAmount('');
        setSettleNotes('');

        loadCustomers();
      } else {
        alert(res?.error || 'Failed to record payment');
      }
    } catch (err) {
      alert(err.message || 'Failed to record customer payment');
    } finally {
      setIsSettling(false);
    }
  };

  // Escape HTML for receipt
  const escapeHTML = (value) => {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Print Customer Payment Receipt on 80mm Thermal Printer
  const handlePrintPaymentReceipt = () => {
    if (!paymentReceipt) {
      alert('Payment receipt not found.');
      return;
    }

    const receiptWindow = window.open(
      '',
      '_blank',
      'width=400,height=650'
    );

    if (!receiptWindow) {
      alert('Please allow pop-ups to print the receipt.');
      return;
    }

    const amountPaid = Number(paymentReceipt.amount_paid || 0);
    const remainingDues = Number(paymentReceipt.remaining_dues || 0);

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Customer Payment Receipt</title>

        <style>
          @page {
            size: 80mm auto;
            margin: 3mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            width: 72mm;
            margin: 0 auto;
            padding: 8px;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            background: #fff;
          }

          .center {
            text-align: center;
          }

          h2 {
            font-size: 18px;
            margin: 5px 0;
            font-weight: 800;
          }

          p {
            margin: 5px 0;
          }

          .line {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }

          .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 8px;
            margin: 8px 0;
          }

          .label {
            flex: 1;
          }

          .value {
            flex: 1;
            text-align: right;
            font-weight: bold;
            overflow-wrap: anywhere;
          }

          .amount {
            font-size: 16px;
          }

          .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 11px;
          }

          .bold {
            font-weight: bold;
          }

          @media print {
            body {
              width: 72mm;
              margin: 0 auto;
              padding: 0;
            }

            button {
              display: none;
            }
          }
        </style>
      </head>

      <body>
        <div class="center">
          <h2>PAYMENT RECEIPT</h2>
          <p>Customer Dues Payment</p>
        </div>

        <div class="line"></div>

        <div class="row">
          <span class="label">Receipt No:</span>
          <span class="value">
            ${escapeHTML(paymentReceipt.receipt_number || 'N/A')}
          </span>
        </div>

        <div class="row">
          <span class="label">Date & Time:</span>
          <span class="value">
            ${escapeHTML(paymentReceipt.date || '')}
          </span>
        </div>

        <div class="line"></div>

        <div class="row">
          <span class="label">Customer:</span>
          <span class="value">
            ${escapeHTML(paymentReceipt.customer_name || '')}
          </span>
        </div>

        <div class="row">
          <span class="label">Phone:</span>
          <span class="value">
            ${escapeHTML(paymentReceipt.customer_phone || 'N/A')}
          </span>
        </div>

        <div class="row">
          <span class="label">Payment Mode:</span>
          <span class="value">
            ${escapeHTML(paymentReceipt.payment_mode || '')}
          </span>
        </div>

        <div class="line"></div>

        <div class="row">
          <span class="label bold">Amount Paid:</span>
          <span class="value amount">
            ${escapeHTML(symbol)}${amountPaid.toFixed(2)}
          </span>
        </div>

        <div class="row">
          <span class="label">Remaining Dues:</span>
          <span class="value">
            ${escapeHTML(symbol)}${remainingDues.toFixed(2)}
          </span>
        </div>

        <div class="line"></div>

        <div class="footer">
          <p class="bold">Payment Received Successfully</p>
          <p>Thank You!</p>
          <p>Customer Copy</p>
        </div>

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 500);
          };

          window.onafterprint = function () {
            window.close();
          };
        <\/script>
      </body>
      </html>
    `;

    receiptWindow.document.open();
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  // Open Customer Ledger
  const handleOpenLedger = async (cust) => {
    setLedgerCust(cust);
    setLedgerLoading(true);

    try {
      const entries = await api.getCustomerLedger(cust.id);
      setLedgerEntries(Array.isArray(entries) ? entries : []);
    } catch (err) {
      console.error('Failed to load ledger:', err);
      setLedgerEntries([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Delete Customer
  const handleDelete = async (id, cName) => {
    if (window.confirm(`Delete customer "${cName}"?`)) {
      try {
        await api.deleteCustomer(id);
        loadCustomers();
      } catch (err) {
        alert(err.message || 'Failed to delete customer');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Top Header */}
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
            Customer Directory & Dues
          </h2>

          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Track regular customers, store credit and pending dues
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '260px' }}>
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
              placeholder="Search customer by name or phone..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Email</th>
              <th>Address</th>
              <th>Outstanding Dues</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
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
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  No customers registered yet.
                </td>
              </tr>
            ) : (
              customers.map(c => {
                const dues = Number(c.outstanding_dues || 0);

                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '700' }}>{c.name}</td>

                    <td style={{ color: 'var(--text-muted)' }}>
                      {c.phone || '—'}
                    </td>

                    <td style={{ color: 'var(--text-muted)' }}>
                      {c.email || '—'}
                    </td>

                    <td style={{ color: 'var(--text-muted)' }}>
                      {c.address || '—'}
                    </td>

                    <td>
                      <span className={`badge ${dues > 0 ? 'badge-danger' : 'badge-success'}`}>
                        {symbol}{dues.toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenLedger(c)}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="View Ledger Statement"
                        >
                          <BookOpen size={13} /> Ledger
                        </button>

                        {dues > 0 && (
                          <button
                            onClick={() => {
                              setSettleModalCust(c);
                              setSettleAmount(dues.toString());
                              setSettlePaymentMode('Cash');
                              setSettleNotes('');
                            }}
                            className="btn btn-primary"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          >
                            Pay Dues
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            color: 'var(--danger)'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ padding: '1.5rem' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                Add New Customer
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Customer Name *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      display: 'block'
                    }}
                  >
                    Phone
                  </label>

                  <input
                    type="text"
                    placeholder="Mobile number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem',
                      display: 'block'
                    }}
                  >
                    Opening Dues ({symbol})
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={outstandingDues}
                    onChange={e => setOutstandingDues(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Address
                </label>

                <input
                  type="text"
                  placeholder="Street / City"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input-field"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Dues Modal */}
      {settleModalCust && (
        <div className="modal-overlay" onClick={() => setSettleModalCust(null)}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: '1.5rem' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>
                Settle Customer Dues
              </h3>

              <button
                onClick={() => setSettleModalCust(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}
            >
              Customer: <strong>{settleModalCust.name}</strong>
              <br />
              Current Dues:{' '}
              <strong style={{ color: '#dc2626' }}>
                {symbol}{Number(settleModalCust.outstanding_dues).toFixed(2)}
              </strong>
            </div>

            <form
              onSubmit={handleSettleDues}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Amount Paid ({symbol}) *
                </label>

                <input
                  type="number"
                  min="1"
                  max={settleModalCust.outstanding_dues}
                  step="0.01"
                  required
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Payment Mode
                </label>

                <select
                  value={settlePaymentMode}
                  onChange={e => setSettlePaymentMode(e.target.value)}
                  className="input-field"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                    display: 'block'
                  }}
                >
                  Notes (Optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g. Cleared pending bill dues"
                  value={settleNotes}
                  onChange={e => setSettleNotes(e.target.value)}
                  className="input-field"
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => setSettleModalCust(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSettling}
                  className="btn btn-primary"
                >
                  {isSettling ? 'Recording...' : 'Record Payment & Print Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {paymentReceipt && (
        <div className="modal-overlay" onClick={() => setPaymentReceipt(null)}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '420px', padding: '1.5rem' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <CheckCircle
                size={40}
                color="#059669"
                style={{ margin: '0 auto 0.5rem' }}
              />

              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                Payment Recorded Successfully!
              </h3>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Official Receipt Issued
              </span>
            </div>

            <div
              style={{
                border: '1px dashed #cbd5e1',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Receipt #:</span>
                <strong>{paymentReceipt.receipt_number}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Date & Time:</span>
                <span>{paymentReceipt.date}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Customer:</span>
                <strong>{paymentReceipt.customer_name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <span>{paymentReceipt.payment_mode}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '0.4rem'
                }}
              >
                <span style={{ fontWeight: '600' }}>Amount Paid:</span>
                <strong style={{ color: '#059669', fontSize: '1rem' }}>
                  {symbol}{Number(paymentReceipt.amount_paid || 0).toFixed(2)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#dc2626' }}>Remaining Dues:</span>
                <strong style={{ color: '#dc2626' }}>
                  {symbol}{Number(paymentReceipt.remaining_dues || 0).toFixed(2)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handlePrintPaymentReceipt}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={15} /> Print Receipt
              </button>

              <button
                type="button"
                onClick={() => setPaymentReceipt(null)}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Ledger Statement Modal */}
      {ledgerCust && (
        <div className="modal-overlay" onClick={() => setLedgerCust(null)}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '820px',
              width: '90%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Customer Ledger Statement
                </h3>

                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Customer: <strong>{ledgerCust.name}</strong> ({ledgerCust.phone || 'No phone'})
                  {' | '}
                  Current Balance:{' '}
                  <strong style={{ color: '#dc2626' }}>
                    {symbol}{Number(ledgerCust.outstanding_dues || 0).toFixed(2)}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => setLedgerCust(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Table */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {ledgerLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <RefreshCw
                    className="animate-spin"
                    size={22}
                    style={{ display: 'inline', marginRight: '0.5rem' }}
                  />
                  Loading customer ledger entries...
                </div>
              ) : ledgerEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No ledger transactions found for this customer.
                </div>
              ) : (
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden'
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Reference</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Debit ({symbol})</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Credit ({symbol})</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>Balance ({symbol})</th>
                        <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>Notes</th>
                      </tr>
                    </thead>

                    <tbody>
                      {ledgerEntries.map((entry) => {
                        const isDebit = entry.transaction_type === 'DEBIT';

                        return (
                          <tr key={entry.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748b' }}>
                              {new Date(entry.created_at).toLocaleDateString()}
                            </td>

                            <td style={{ padding: '0.6rem 0.75rem' }}>
                              <span
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  backgroundColor: isDebit ? '#fee2e2' : '#ecfdf5',
                                  color: isDebit ? '#dc2626' : '#059669'
                                }}
                              >
                                {entry.transaction_type}
                              </span>
                            </td>

                            <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'monospace', fontWeight: '600' }}>
                              {entry.reference_number || '—'}
                            </td>

                            <td
                              style={{
                                padding: '0.6rem 0.75rem',
                                textAlign: 'right',
                                color: isDebit ? '#dc2626' : '#94a3b8'
                              }}
                            >
                              {isDebit ? Number(entry.amount || 0).toFixed(2) : '—'}
                            </td>

                            <td
                              style={{
                                padding: '0.6rem 0.75rem',
                                textAlign: 'right',
                                color: !isDebit ? '#059669' : '#94a3b8',
                                fontWeight: !isDebit ? '600' : 'normal'
                              }}
                            >
                              {!isDebit ? Number(entry.amount || 0).toFixed(2) : '—'}
                            </td>

                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: '700' }}>
                              {Number(entry.balance_after || 0).toFixed(2)}
                            </td>

                            <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontSize: '0.78rem' }}>
                              {entry.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#f8fafc'
              }}
            >
              <button
                type="button"
                onClick={() => setLedgerCust(null)}
                className="btn btn-secondary"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
