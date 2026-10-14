import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Suppliers from '../../components/Suppliers';

export default function SuppliersPage() {
  const { settings } = useOutletContext();
  return <Suppliers settings={settings} />;
}
