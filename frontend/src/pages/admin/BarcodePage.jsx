import React from 'react';
import { useOutletContext } from 'react-router-dom';
import BarcodeGenerator from '../../components/BarcodeGenerator';

export default function BarcodePage() {
  const { settings } = useOutletContext();
  return <BarcodeGenerator settings={settings} />;
}
