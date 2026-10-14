import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  DollarSign, 
  Lock, 
  Unlock, 
  History, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

export default function CashShift({ settings }) {
  const [currentShift, setCurrentShift] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('1000');
  const [closingCounted, setClosingCounted] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const currency = settings?.currency_symbol || '₹';

  useEffect(() => {
    loadShiftData();
  }, []);

  const loadShiftData = async () => {
    setLoading(true);
    try {
      const [shift, pastShifts] = await Promise.all([
        api.getCurrentShift().catch(() => null),
        api.getShifts().catch(() => [])
      ]);
      setCurrentShift(shift);
      setHistory(pastShifts || []);
    } catch (err) {
      console.error('Failed to load shift data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('pos_user') || '{}');
      await api.openShift({
        user_name: user.name || 'Cashier',
        opening_cash: parseFloat(openingFloat) || 0
      });
      setOpenModal(false);
      setMessage({ type: 'success', text: 'Shift opened successfully!' });
      loadShiftData();
    } catch (err) {
      alert(err.message || 'Failed to open shift');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (!currentShift) return;
    setSubmitting(true);
    try {
      await api.closeShift({
        id: currentShift.id,
        closing_cash: parseFloat(closingCounted) || 0
      });
      setCloseModal(false);
      setClosingCounted('');
      setMessage({ type: 'success', text: 'Shift closed and drawer reconciled successfully!' });
      loadShiftData();
    } catch (err) {
      alert(err.message || 'Failed to close shift');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <RefreshCw className="animate-spin" size={24} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign color="#059669" /> Cash Drawer & Shift Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Track cash float, register sales, and drawer reconciliation between cashier shifts.
          </p>
        </div>

        <button 
          onClick={loadShiftData} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {message && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          borderRadius: 'var(--radius-md)',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Active Shift Card */}
      <div className="card" style={{ padding: '1.5rem', borderLeft: currentShift ? '5px solid #059669' : '5px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: currentShift ? '#dcfce7' : '#f1f5f9',
              color: currentShift ? '#059669' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentShift ? <Unlock size={22} /> : <Lock size={22} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>
                {currentShift ? 'Active Cash Register Shift' : 'Drawer is Currently Closed'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {currentShift ? `Opened by ${currentShift.user_name} on ${new Date(currentShift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Open a shift to start recording cash sales in POS'}
              </p>
            </div>
          </div>

          <div>
            {currentShift ? (
              <button 
                onClick={() => setCloseModal(true)}
                className="btn"
                style={{ backgroundColor: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Lock size={16} /> Close & Balance Shift
              </button>
            ) : (
              <button 
                onClick={() => setOpenModal(true)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Unlock size={16} /> Open New Shift
              </button>
            )}
          </div>
        </div>

        {currentShift && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Opening Cash Float</span>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {currency}{Number(currentShift.opening_cash || 0).toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Cash Sales in Shift</span>
              <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#059669', marginTop: '0.25rem' }}>
                +{currency}{Number(currentShift.cash_sales || 0).toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.75rem', color: '#065f46', textTransform: 'uppercase', fontWeight: '700' }}>Expected in Drawer</span>
              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#047857', marginTop: '0.25rem' }}>
                {currency}{Number(currentShift.expected_cash || 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Past Shifts History */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} /> Shift Reconciliation History
        </h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Cashier / User</th>
                <th>Opened At</th>
                <th>Closed At</th>
                <th>Opening Float</th>
                <th>Closing Count</th>
                <th>Expected</th>
                <th>Difference (Short/Over)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No shift history recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((s) => {
                  const diff = Number(s.difference || 0);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: '600' }}>{s.user_name}</td>
                      <td>{new Date(s.opened_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{s.closed_at ? new Date(s.closed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                      <td>{currency}{Number(s.opening_cash || 0).toLocaleString()}</td>
                      <td>{s.closing_cash !== null ? `${currency}${Number(s.closing_cash).toLocaleString()}` : '—'}</td>
                      <td>{s.expected_cash !== null ? `${currency}${Number(s.expected_cash).toLocaleString()}` : '—'}</td>
                      <td>
                        {s.closing_cash !== null ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '700',
                            color: diff === 0 ? '#059669' : diff > 0 ? '#2563eb' : '#dc2626'
                          }}>
                            {diff > 0 && <ArrowUpRight size={14} />}
                            {diff < 0 && <ArrowDownRight size={14} />}
                            {currency}{Math.abs(diff).toLocaleString()} {diff === 0 ? '(Exact)' : diff > 0 ? '(Over)' : '(Short)'}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'Open' ? 'badge-success' : 'badge-neutral'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Shift Modal */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Open Cash Register</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter the starting physical cash amount in the drawer (float).
            </p>

            <form onSubmit={handleOpenShift}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Opening Cash Float ({currency})
                </label>
                <input 
                  type="number"
                  step="any"
                  className="input-field"
                  required
                  autoFocus
                  placeholder="e.g. 1000"
                  value={openingFloat}
                  onChange={e => setOpeningFloat(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setOpenModal(false)} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Opening...' : 'Start Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {closeModal && currentShift && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Close & Reconcile Shift</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Count all physical cash currently in the drawer and enter it below.
            </p>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opening Float</span>
                <div style={{ fontWeight: '700' }}>{currency}{Number(currentShift.opening_cash || 0).toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cash Sales</span>
                <div style={{ fontWeight: '700', color: '#059669' }}>+{currency}{Number(currentShift.cash_sales || 0).toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected in Drawer</span>
                <div style={{ fontWeight: '800', color: '#047857' }}>{currency}{Number(currentShift.expected_cash || 0).toLocaleString()}</div>
              </div>
            </div>

            <form onSubmit={handleCloseShift}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Counted Physical Cash ({currency})
                </label>
                <input 
                  type="number"
                  step="any"
                  className="input-field"
                  required
                  autoFocus
                  placeholder={`e.g. ${currentShift.expected_cash}`}
                  value={closingCounted}
                  onChange={e => setClosingCounted(e.target.value)}
                />
              </div>

              {closingCounted !== '' && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  backgroundColor: Number(closingCounted) === Number(currentShift.expected_cash) ? '#ecfdf5' : '#fef2f2',
                  color: Number(closingCounted) === Number(currentShift.expected_cash) ? '#065f46' : '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {Number(closingCounted) === Number(currentShift.expected_cash) 
                    ? '✓ Drawer balances perfectly!' 
                    : `Difference: ${Number(closingCounted) - Number(currentShift.expected_cash) > 0 ? '+' : ''}${currency}${(Number(closingCounted) - Number(currentShift.expected_cash)).toFixed(2)} (${Number(closingCounted) > Number(currentShift.expected_cash) ? 'Over' : 'Short'})`
                  }
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setCloseModal(false)} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  style={{ backgroundColor: '#dc2626', color: 'white' }}
                  disabled={submitting}
                >
                  {submitting ? 'Closing...' : 'Confirm & Close Drawer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
