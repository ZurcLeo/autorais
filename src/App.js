import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { Button, Container } from '@mui/material';

const App = ({ toggleTheme }) => {
  return (
    <Router>
      <Container>
        <Button onClick={toggleTheme} variant="contained" color="primary" style={{ marginBottom: '1rem' }}>
          Toggle Theme
        </Button>
        <AppRoutes />
      </Container>
    </Router>
  );
};

export default App;