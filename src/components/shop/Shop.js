import React from 'react';
import ProductGrid from './ProductGrid'; // Certifique-se que o caminho para ProductGrid está correto
import { Container, Typography, Box } from '@mui/material';

const Shop = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Nossa Loja
        </Typography>
        <ProductGrid />
        {/* Você pode adicionar outros componentes relacionados à loja aqui, como:
            - Componentes de filtro (por categoria, preço, etc.)
            - Componentes de ordenação
            - Banner promocional específico da página da loja
        */}
      </Container>
    </Box>
  );
};

export default Shop;