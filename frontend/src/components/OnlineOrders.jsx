import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function OnlineOrders({ settings }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [gpsOrderId, setGpsOrderId] = useState(null);
  const watchRef = useRef(null);

  const symbol = settings?.currency_symbol || '₹';

  useEffect(() => () => {
    if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
  }, []);

  const startLiveGps = async (order) => {
    if (!navigator.geolocation) {
      alert('This device/browser does not support GPS location.');
      return;
    }
    try {
      setUpdatingId(order.id);
      if (order.status !== 'Out for Delivery') {
        await api.updateOrderStatus(order.id, 'Out for Delivery');
      }
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      const watchId = navigator.geolocation.watchPosition(
        async position => {
          try {
            await api.updateRiderLocation(order.id, {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            setGpsOrderId(order.id);
          } catch (err) {
            console.error('GPS update failed:', err);
          }
        },
        error => {
          console.error('GPS error:', error);
          alert(`GPS permission/location error: ${error.message}`);
          setGpsOrderId(null);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
      watchRef.current = watchId;
      setGpsOrderId(order.id);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Could not start live GPS tracking.');
    } finally {
      setUpdatingId(null);
    }
  };

  const stopLiveGps = (orderId) => {
    if (watchRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    setGpsOrderId(null);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const list = await api.getOnlineOrders({ status: filterStatus });
      setOrders(list);
    } catch (err) {
      console.error('Failed to load online orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-warning">Pending Review</span>;
      case 'Accepted':
        return <span className="badge badge-info">Packing & Dispatch</span>;
      case 'Out for Delivery':
        return <span className="badge badge-info"><Truck size={13} /> Out for Delivery</span>;
      case 'Delivered':
        return <span className="badge badge-success">Delivered</span>;
      case 'Cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Incoming Web Orders</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Customer orders received from the integrated online storefront website
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
            {['All', 'Pending', 'Accepted', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filterStatus === st ? 'white' : 'transparent',
                  color: filterStatus === st ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <button onClick={loadOrders} className="btn btn-secondary">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Loading online orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>No Online Orders Found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            When customers place orders on your website, they will show up here instantly.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {orders.map(o => (
            <div key={o.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                {/* Order Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '1rem' }}>{o.order_number}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                  {getStatusBadge(o.status)}
                </div>

                {/* Customer Details */}
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{o.customer_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                    <Phone size={14} color="var(--primary)" />
                    <a href={`tel:${o.customer_phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {o.customer_phone}
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    <MapPin size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{o.customer_address}</span>
                  </div>
                </div>

                {/* Items Ordered List */}
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Items Ordered ({o.items?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {(o.items || []).map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                        <span>{it.name} &times; {it.quantity} {it.unit || 'pcs'}</span>
                        <span style={{ fontWeight: '600' }}>{symbol}{(Number(it.selling_price) * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Footer & Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {o.payment_method}
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {symbol}{Number(o.total_amount).toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons based on status */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {o.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Accepted')}
                        disabled={updatingId === o.id}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem' }}
                      >
                        Accept & Pack
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Cancelled')}
                        disabled={updatingId === o.id}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem', fontSize: '0.8125rem', color: 'var(--danger)' }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {o.status === 'Accepted' && (
                    <button
                      onClick={() => startLiveGps(o)}
                      disabled={updatingId === o.id}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.8125rem' }}
                    >
                      <Truck size={15} /> Start Delivery & Share GPS
                    </button>
                  )}

                  {o.status === 'Out for Delivery' && (
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button
                        onClick={() => gpsOrderId === o.id ? stopLiveGps(o.id) : startLiveGps(o)}
                        disabled={updatingId === o.id}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem' }}
                      >
                        <MapPin size={15} /> {gpsOrderId === o.id ? 'GPS Sharing Active' : 'Start / Resume GPS'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'Delivered')}
                        disabled={updatingId === o.id}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem', fontSize: '0.8125rem' }}
                      >
                        <CheckCircle2 size={15} /> Delivered
                      </button>
                    </div>
                  )}

                  {(o.status === 'Delivered' || o.status === 'Cancelled') && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
                      Order is archived ({o.status})
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
