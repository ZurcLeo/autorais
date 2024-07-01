import React from 'react';
import { Container, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, toggleTheme }) => {
  const { currentUser } = useAuth();

  return (
    <Container>
      {currentUser && (
        <Button onClick={toggleTheme} variant="contained" color="primary" style={{ marginBottom: '1rem' }}>
          Toggle Theme
        </Button>
      )}
      {children}
    </Container>
  );
};

export default Layout;