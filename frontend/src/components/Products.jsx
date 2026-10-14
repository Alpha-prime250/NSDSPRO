import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Barcode, 
  X, 
  Check, 
  Package, 
  RefreshCw 
} from 'lucide-react';

export default function Products({ settings }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    barcode: '',
    purchase_price: 0,
    selling_price: 0,
    quantity: 0,
    min_stock_level: 5,
    mfg_date: '',
    expiry_date: '',
    unit: 'pcs'
  });
  const [modalError, setModalError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const symbol = settings?.currency_symbol || '₹';

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await api.getProducts();
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(searchTerm));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'General',
      barcode: Date.now().toString().slice(-8), // Generate 8-digit barcode default
      purchase_price: 0,
      selling_price: 0,
      quantity: 10,
      min_stock_level: 5,
      mfg_date: '',
      expiry_date: '',
      unit: 'pcs'
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category || 'General',
      barcode: prod.barcode || '',
      purchase_price: Number(prod.purchase_price || 0),
      selling_price: Number(prod.selling_price || 0),
      quantity: Number(prod.quantity || 0),
      min_stock_level: Number(prod.min_stock_level || 5),
      mfg_date: prod.mfg_date ? prod.mfg_date.split('T')[0] : '',
      expiry_date: prod.expiry_date ? prod.expiry_date.split('T')[0] : '',
      unit: prod.unit || 'pcs'
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.selling_price) {
      setModalError('Name and Selling Price are required.');
      return;
    }

    try {
      setIsSaving(true);
      setModalError('');
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      setModalError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Search Controls */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Products & Inventory</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Total {products.length} products registered in single shop catalog
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search product or barcode..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', fontSize: '0.8125rem' }}
            />
          </div>

          {/* Category Filter */}
          <select 
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input-field"
            style={{ width: '160px', fontSize: '0.8125rem' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Add Product Button */}
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Mfg / Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Loading product catalog...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No products found. Click "Add Product" to add your first item.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const isLow = Number(p.quantity) <= Number(p.min_stock_level);
                return (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {p.barcode || '—'}
                    </td>
                    <td style={{ fontWeight: '700' }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{symbol}{Number(p.purchase_price).toFixed(2)}</td>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {symbol}{Number(p.selling_price).toFixed(2)}
                    </td>
                    <td style={{ fontWeight: '700' }}>
                      {Number(p.quantity).toFixed(0)} {p.unit}
                    </td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {p.mfg_date && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          Mfg: {new Date(p.mfg_date).toLocaleDateString()}
                        </div>
                      )}
                      {p.expiry_date ? (
                        <div style={{ fontWeight: '600' }}>
                          Exp: {new Date(p.expiry_date).toLocaleDateString()}
                          {(() => {
                            const today = new Date();
                            today.setHours(0,0,0,0);
                            const exp = new Date(p.expiry_date);
                            const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
                            if (diffDays < 0) {
                              return <span style={{ marginLeft: '0.35rem', color: '#dc2626', fontWeight: '800' }}>(Expired)</span>;
                            }
                            if (diffDays <= 30) {
                              return <span style={{ marginLeft: '0.35rem', color: '#d97706', fontWeight: '700' }}>({diffDays}d left)</span>;
                            }
                            return null;
                          })()}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button 
                          onClick={() => openEditModal(p)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.name)}
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}
                          title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div style={{
                padding: '0.625rem',
                backgroundColor: 'var(--danger-light)',
                color: 'var(--danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                marginBottom: '1rem'
              }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                  Product Name *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Aashirvaad Atta 5kg"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Category
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Atta & Flours"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Barcode
                  </label>
                  <input 
                    type="text"
                    placeholder="Scan or auto-generated"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Purchase Cost ({symbol})
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchase_price}
                    onChange={e => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Selling Price * ({symbol})
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.selling_price}
                    onChange={e => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Current Stock
                  </label>
                  <input 
                    type="number"
                    step="1"
                    min="0"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Min Stock
                  </label>
                  <input 
                    type="number"
                    step="1"
                    min="1"
                    value={formData.min_stock_level}
                    onChange={e => setFormData({ ...formData, min_stock_level: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Unit
                  </label>
                  <select 
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="input-field"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="packet">packet</option>
                    <option value="bag">bag</option>
                    <option value="pack">pack</option>
                    <option value="box">box</option>
                    <option value="litre">litre</option>
                  </select>
                </div>
              </div>

              {/* Manufacturing & Expiry Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Manufacturing Date (Optional)
                  </label>
                  <input 
                    type="date"
                    value={formData.mfg_date}
                    onChange={e => setFormData({ ...formData, mfg_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                    Expiry Date (Optional)
                  </label>
                  <input 
                    type="date"
                    value={formData.expiry_date}
                    onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary">
                  {isSaving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
