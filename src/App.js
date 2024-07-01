import React from 'react';
import AppRoutes from './routes';
import { Container } from '@mui/material';

const App = ({ toggleTheme }) => {
  return (
    <Container>
      <AppRoutes toggleTheme={toggleTheme} />
    </Container>
  );
};

export default App;