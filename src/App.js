import React from 'react';

import AppRoutes from './routes';
import { Button, Container } from '@mui/material';

const App = ({ toggleTheme }) => {
  return (
   
      <Container>
        <Button onClick={toggleTheme} variant="contained" color="primary" style={{ marginBottom: '1rem' }}>
          Toggle Theme
        </Button>
        <AppRoutes />
      </Container>
   
  );
};

export default App;
