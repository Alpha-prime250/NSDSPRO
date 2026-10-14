import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Search, Trash2, X, Truck, RefreshCw } from 'lucide-react';

export default function Suppliers({ settings }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const list = await api.getSuppliers({ search: searchTerm });
      setSuppliers(list);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [searchTerm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      setIsSaving(true);
      await api.createSupplier({
        name,
        company_name: companyName,
        phone,
        email,
        address
      });
      setIsModalOpen(false);
      setName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setAddress('');
      loadSuppliers();
    } catch (err) {
      alert(err.message || 'Failed to create supplier');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, sName) => {
    if (window.confirm(`Delete supplier "${sName}"?`)) {
      try {
        await api.deleteSupplier(id);
        loadSuppliers();
      } catch (err) {
        alert(err.message || 'Failed to delete supplier');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Suppliers Directory</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Manage distributors, wholesalers and manufacturers
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search by supplier or company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Supplier Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Contact Name</th>
              <th>Company / Agency</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Loading suppliers...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No suppliers registered yet.
                </td>
              </tr>
            ) : (
              suppliers.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: '700' }}>{s.name}</td>
                  <td>{s.company_name || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.phone || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.email || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.address || '—'}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(s.id, s.name)}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Add Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                  Contact Person *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Anil Distributors"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                  Company Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. ITC Wholesale Ltd."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
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
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="email@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                  Address
                </label>
                <input 
                  type="text" 
                  placeholder="Office / Warehouse address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
