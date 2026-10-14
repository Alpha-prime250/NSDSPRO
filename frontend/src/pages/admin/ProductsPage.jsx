import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Products from '../../components/Products';

export default function ProductsPage() {
  const { settings } = useOutletContext();
  return <Products settings={settings} />;
}
