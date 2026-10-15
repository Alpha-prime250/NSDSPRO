
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Search,
  Trash2,
  RefreshCw,
  UserPlus,
  LogIn,
  X,
  Pencil,
  Save
} from 'lucide-react';

export default function Suppliers({ settings }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('register');
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // LOAD SUPPLIERS
  // ============================================
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const list = await api.getSuppliers({ search: searchTerm });
      setSuppliers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [searchTerm]);

  // ============================================
  // RESET FORM
  // ============================================
  const resetForm = () => {
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPassword('');
    setEditingSupplier(null);
  };

  // ============================================
  // CLOSE MODAL
  // ============================================
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setMode('register');
  };

  // ============================================
  // OPEN EDIT SUPPLIER FORM
  // ============================================
  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name || '');
    setCompanyName(supplier.company_name || '');
    setPhone(supplier.phone || '');
    setEmail(supplier.email || '');
    setAddress(supplier.address || '');
    setPassword('');
    setMode('edit');
    setIsModalOpen(true);
  };

  // ============================================
  // OPEN REGISTRATION FORM
  // ============================================
  const openRegister = () => {
    resetForm();
    setMode('register');
    setIsModalOpen(true);
  };

  // ============================================
  // SUBMIT REGISTER / LOGIN / EDIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      if (mode === 'edit') {
        if (!editingSupplier?.id) {
          throw new Error('Supplier ID is missing');
        }

        await api.updateSupplier(editingSupplier.id, {
          name: name.trim(),
          company_name: companyName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim()
        });

        alert('Supplier updated successfully.');
        closeModal();
        await loadSuppliers();
      } else if (mode === 'register') {
        await api.registerSupplier({
          name: name.trim(),
          company_name: companyName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          password
        });

        alert('Account created successfully. Please log in to continue.');
        resetForm();
        setMode('login');
      } else {
        await api.loginSupplier({
          email: email.trim(),
          password
        });

        alert('Login successful.');
        closeModal();
        await loadSuppliers();
      }
    } catch (err) {
      alert(err.message || 'Unable to continue. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // DELETE SUPPLIER
  // ============================================
  const handleDelete = async (id, supplierName) => {
    if (!window.confirm(`Delete supplier "${supplierName}"?`)) {
      return;
    }

    try {
      await api.deleteSupplier(id);
      alert('Supplier deleted successfully.');
      await loadSuppliers();
    } catch (err) {
      alert(err.message || 'Failed to delete supplier');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      {/* ========================================
          SUPPLIERS HEADER
      ======================================== */}
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
            Suppliers Directory
          </h2>

          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}
          >
            Registered suppliers who have logged in
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
              placeholder="Search supplier or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '2.2rem',
                fontSize: '0.8125rem'
              }}
            />
          </div>

          <button
            type="button"
            onClick={openRegister}
            className="btn btn-primary"
          >
            <UserPlus size={16} />
            Supplier Register / Login
          </button>
        </div>
      </div>

      {/* ========================================
          SUPPLIERS TABLE
      ======================================== */}
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
                    style={{
                      display: 'inline',
                      marginRight: '0.5rem'
                    }}
                  />
                  Loading suppliers...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  No logged-in suppliers found yet.
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td style={{ fontWeight: '700' }}>
                    {supplier.name}
                  </td>

                  <td>{supplier.company_name || '—'}</td>

                  <td style={{ color: 'var(--text-muted)' }}>
                    {supplier.phone || '—'}
                  </td>

                  <td style={{ color: 'var(--text-muted)' }}>
                    {supplier.email || '—'}
                  </td>

                  <td style={{ color: 'var(--text-muted)' }}>
                    {supplier.address || '—'}
                  </td>

                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      {/* EDIT BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleEdit(supplier)}
                        className="btn btn-secondary"
                        style={{
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--primary)'
                        }}
                        title="Edit supplier"
                        aria-label={`Edit ${supplier.name}`}
                      >
                        <Pencil size={13} />
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(supplier.id, supplier.name)
                        }
                        className="btn btn-secondary"
                        style={{
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--danger)'
                        }}
                        title="Delete supplier"
                        aria-label={`Delete ${supplier.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================
          REGISTER / LOGIN / EDIT MODAL
      ======================================== */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
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
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '800'
                }}
              >
                {mode === 'edit'
                  ? 'Edit Supplier'
                  : mode === 'register'
                    ? 'Create Supplier Account'
                    : 'Supplier Login'}
              </h3>

              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Registration and edit fields */}
              {(mode === 'register' || mode === 'edit') && (
                <>
                  <div>
                    <label>Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field"
                      placeholder="Supplier name"
                    />
                  </div>

                  <div>
                    <label>Company Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input-field"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label>Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      placeholder="Mobile number"
                    />
                  </div>

                  <div>
                    <label>Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field"
                      placeholder="Office / warehouse address"
                    />
                  </div>
                </>
              )}

              <div>
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="supplier@example.com"
                  autoComplete="email"
                />
              </div>

              {/* Password is not needed when editing */}
              {mode !== 'edit' && (
                <div>
                  <label>Password *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="At least 8 characters"
                    autoComplete={
                      mode === 'register'
                        ? 'new-password'
                        : 'current-password'
                    }
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
              >
                {isSaving ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                    Please wait...
                  </>
                ) : mode === 'edit' ? (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                ) : mode === 'register' ? (
                  'Create Account'
                ) : (
                  'Login'
                )}
              </button>

              {/* Register / login switch */}
              {mode !== 'edit' && (
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '0.875rem'
                  }}
                >
                  {mode === 'register' ? (
                    <>
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setPassword('');
                          setMode('login');
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}
                      >
                        <LogIn
                          size={14}
                          style={{
                            display: 'inline',
                            verticalAlign: 'middle'
                          }}
                        />{' '}
                        Login
                      </button>
                    </>
                  ) : (
                    <>
                      New supplier?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setMode('register');
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontWeight: '700'
                        }}
                      >
                        Create account
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
