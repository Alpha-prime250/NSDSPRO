import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Settings from '../../components/Settings';

export default function SettingsPage() {
  const { settings } = useOutletContext();
  return (
    <Settings
      settings={settings}
      onUpdateSettings={() => {
        // Refresh page or settings
        window.location.reload();
      }}
    />
  );
}
