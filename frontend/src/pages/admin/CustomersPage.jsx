import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Customers from '../../components/Customers';

export default function CustomersPage() {
  const { settings } = useOutletContext();
  return <Customers settings={settings} />;
}
