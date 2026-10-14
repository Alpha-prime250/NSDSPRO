import React from 'react';
import { useOutletContext } from 'react-router-dom';
import CashShift from '../../components/CashShift';

export default function CashShiftPage() {
  const { settings } = useOutletContext();
  return <CashShift settings={settings} />;
}
