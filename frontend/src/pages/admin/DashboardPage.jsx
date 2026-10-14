import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import InvoiceModal from '../../components/InvoiceModal';
import { api } from '../../api';

export default function DashboardPage() {
  const { settings } = useOutletContext();
  const navigate = useNavigate();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleViewInvoice = async (invoiceId) => {
    try {
      const inv = await api.getSaleById(invoiceId);
      setSelectedInvoice(inv);
    } catch (err) {
      alert(err.message || 'Failed to load receipt');
    }
  };

  return (
    <>
      <Dashboard
        settings={settings}
        onNavigate={tab => navigate(`/admin/${tab}`)}
        onViewInvoice={handleViewInvoice}
      />
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          settings={settings}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
