import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Expenses from '../../components/Expenses';

export default function ExpensesPage() {
  const { settings } = useOutletContext();
  return <Expenses settings={settings} />;
}
