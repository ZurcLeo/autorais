import React from 'react';
import { Tabs, Tab } from '@mui/material';

const AdminTabs = ({ activeTab, onTabChange }) => {
  const handleChange = (event, newValue) => {
    onTabChange(newValue);
  };

  return (
    <Tabs value={activeTab} onChange={handleChange} aria-label="admin tabs">
      <Tab label="Categorias" value="categories" />
      <Tab label="Interesses" value="interests" />
      <Tab label="Estatísticas" value="stats" />
      <Tab label="Migração" value="migration" />
    </Tabs>
  );
};

export default AdminTabs;