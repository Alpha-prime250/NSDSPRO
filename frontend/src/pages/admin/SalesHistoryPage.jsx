import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SalesHistory from '../../components/SalesHistory';
import InvoiceModal from '../../components/InvoiceModal';
import ReturnModal from '../../components/ReturnModal';
import { api } from '../../api';

export default function SalesHistoryPage() {
  const { settings } = useOutletContext();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [returnInvoice, setReturnInvoice] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewInvoice = async (invoiceId) => {
    try {
      const inv = await api.getSaleById(invoiceId);
      setSelectedInvoice(inv);
    } catch (err) {
      alert(err.message || 'Failed to fetch invoice');
    }
  };

  const handleProcessReturn = async (invoiceId) => {
    try {
      const inv = await api.getSaleById(invoiceId);
      setReturnInvoice(inv);
    } catch (err) {
      alert(err.message || 'Failed to fetch invoice for return');
    }
  };

  return (
    <>
      <SalesHistory
        key={refreshKey}
        settings={settings}
        onViewInvoice={handleViewInvoice}
        onProcessReturn={handleProcessReturn}
      />
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          settings={settings}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
      {returnInvoice && (
        <ReturnModal
          sale={returnInvoice}
          settings={settings}
          onClose={() => setReturnInvoice(null)}
          onReturnSuccess={() => {
            setRefreshKey(k => k + 1);
          }}
        />
      )}
    </>
  );
}
