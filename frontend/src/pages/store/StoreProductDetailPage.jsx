import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { useCart } from '../../context/CartContext';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Check, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  Tag,
  PackageCheck
} from 'lucide-react';

export default function StoreProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useOutletContext();
  const { cart, addToCart, updateQty } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);

  const symbol = settings?.currency_symbol || '₹';

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const prod = await api.getProducts({ search: '', limit: 100 });
      const found = (prod || []).find(p => p.id === id);
      setProduct(found || null);

      if (found) {
        const related = (prod || []).filter(p => p.category === found.category && p.id !== found.id).slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getItemCartQty = (productId) => {
    const it = cart.find(i => i.product_id === productId);
    return it ? it.quantity : 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        <RefreshCw className="animate-spin" size={32} style={{ display: 'inline', marginBottom: '0.75rem' }} />
        <div>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>
          This item may have been moved or is currently unavailable.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Return to Shop Catalog
        </Link>
      </div>
    );
  }

  const currentCartQty = getItemCartQty(product.id);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Main Product Details Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        padding: '2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Product Visual Box */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          height: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <span style={{ fontSize: '6rem', marginBottom: '1rem' }}>🛒</span>
          <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>
            {product.name}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Barcode: {product.barcode || 'Standard SKU'}
          </div>
        </div>

        {/* Product Meta & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f1f5f9', color: '#334155', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <Tag size={13} /> {product.category || 'General Staple'}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Pack Size: <strong>1 {product.unit || 'pcs'}</strong></span>
              <span>·</span>
              <span style={{ color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <PackageCheck size={16} /> In Stock & Fresh
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Special Selling Price</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--text-main)' }}>
                {symbol}{Number(product.selling_price).toFixed(2)}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                inclusive of all taxes
              </span>
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingTop: '0.5rem' }}>
            {currentCartQty === 0 ? (
              <button
                onClick={() => addToCart(product, 1)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem 1.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ShoppingCart size={18} />
                <span>Add to Shopping Basket</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => updateQty(product.id, -1)}
                    style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#065f46' }}
                  >
                    <Minus size={18} />
                  </button>
                  <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#065f46', minWidth: '40px', textAlign: 'center' }}>
                    {currentCartQty}
                  </span>
                  <button
                    onClick={() => updateQty(product.id, 1)}
                    style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', color: '#065f46' }}
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <Link to="/cart" className="btn btn-secondary" style={{ padding: '0.85rem 1.25rem', fontSize: '0.95rem' }}>
                  View in Basket &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Guarantee Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.825rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Truck size={18} color="var(--primary)" />
              <span>Fast 2-Hr Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>100% Quality Assured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Category Items */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem' }}>
            More in {product.category}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {relatedProducts.map(rel => (
              <div key={rel.id} style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <Link to={`/product/${rel.id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: '700', fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
                  {rel.name}
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{symbol}{rel.selling_price}</span>
                  <button onClick={() => addToCart(rel)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
