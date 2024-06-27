import React from 'react';
import { Box, Grid, Typography, Button, Container, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const planos = [
    {
        nome: "Plano Mico-Leão-Dourado",
        preco: "R$ 5,90",
        descricao: [
            "30 ElosCoins/dia",
            "Cumulativos por 30 dias",
            "R$0,19 centavos por unidade!"
        ],
        botao: "ASSINAR AGORA",
    },
    {
        nome: "Plano Onça-Pintada",
        preco: "R$ 9,90",
        descricao: [
            "80 ElosCoins/dia",
            "Cumulativos por 45 dias",
            "R$0,12 centavos por unidade!"
        ],
        botao: "ASSINAR AGORA",
    },
    {
        nome: "Plano Lobo-Guará",
        preco: "R$ 19,90",
        descricao: [
            "200 ElosCoins/dia",
            "Cumulativos por 60 dias",
            "R$0,09 centavos por unidade!"
        ],
        botao: "ASSINAR AGORA",
    },
];

const Pricing = () => {
    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" component="h1" align="center" gutterBottom>
                Planos de Assinatura
            </Typography>
            <Typography variant="h6" component="p" align="center" gutterBottom>
                Escolha o plano que melhor se adapta às suas necessidades e aproveite os benefícios de ElosCoins diariamente.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                {planos.map((plano, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box 
                            sx={{
                                border: '1px solid #ccc',
                                borderRadius: 2,
                                textAlign: 'center',
                                padding: 3,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                },
                            }}
                        >
                            <Typography variant="h5" component="h3" gutterBottom>
                                {plano.nome}
                            </Typography>
                            <Typography variant="h4" component="p" gutterBottom>
                                {plano.preco}/mês
                            </Typography>
                            <List>
                                {plano.descricao.map((item, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CheckCircleIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                    </ListItem>
                                ))}
                            </List>
                            <Button variant="contained" color="primary" fullWidth>
                                {plano.botao}
                            </Button>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Pricing;
