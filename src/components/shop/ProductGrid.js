import React from 'react';
import { Container, Box, Card, CardActionArea, CardContent, CardMedia, Chip, Grid, Typography, Rating, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';

const products = [
  {
    id: 1,
    name: 'Produto Premium',
    price: 99.99,
    image: '/product1.jpg',
    isNew: true,
    rating: 4.5,
    reviewCount: 25,
    originalPrice: 120.00,
    discountPercentage: 17,
    isInStock: true,
  },
  {
    id: 1,
    name: 'Produto Premium',
    price: 99.99,
    image: '/product1.jpg',
    isNew: true,
    rating: 4.5,
    reviewCount: 25,
    originalPrice: 120.00,
    discountPercentage: 17,
    isInStock: true,
  },
  // Mais produtos...
];

const ProductGrid = () => {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6, fontWeight: 700 }}>
          Nossos Produtos
        </Typography>
        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea component={Link} to={`/product/${product.id}`}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.name}
                      sx={{ height: 200, objectFit: 'cover' }}
                    />
                    {product.isNew && (
                      <Chip
                        label="Novo"
                        color="secondary"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                      />
                    )}
                    {product.discountPercentage > 0 && (
                      <Chip
                        label={`-${product.discountPercentage}%`}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {product.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                      <Rating name={`rating-${product.id}`} value={product.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">
                        ({product.reviewCount})
                      </Typography>
                    </Stack>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      R$ {product.price.toFixed(2)}
                      {product.originalPrice && (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, textDecoration: 'line-through' }}>
                          R$ {product.originalPrice.toFixed(2)}
                        </Typography>
                      )}
                    </Typography>
                    {product.isInStock ? (
                      <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                        <CheckCircleOutlineIcon color="success" fontSize="small" />
                        <Typography variant="caption" color="success">Em estoque</Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                        <RemoveShoppingCartIcon color="error" fontSize="small" />
                        <Typography variant="caption" color="error">Fora de estoque</Typography>
                      </Stack>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductGrid;