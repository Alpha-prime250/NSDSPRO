import React from 'react';
import { useOutletContext } from 'react-router-dom';
import OnlineOrders from '../../components/OnlineOrders';

export default function OnlineOrdersPage() {
  const { settings } = useOutletContext();
  return <OnlineOrders settings={settings} />;
}
