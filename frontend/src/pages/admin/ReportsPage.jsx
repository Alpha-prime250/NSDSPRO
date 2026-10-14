import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Reports from '../../components/Reports';

export default function ReportsPage() {
  const { settings } = useOutletContext();
  return <Reports settings={settings} />;
}
