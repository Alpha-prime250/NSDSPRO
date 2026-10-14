import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import POSBilling from '../../components/POSBilling';
import InvoiceModal from '../../components/InvoiceModal';

export default function POSBillingPage() {
  const { settings } = useOutletContext();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  return (
    <>
      <POSBilling
        settings={settings}
        onSaleComplete={inv => setSelectedInvoice(inv)}
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
