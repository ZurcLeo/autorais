import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewPurchases = () => {
        navigate('/payments-history');
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Pagamento realizado com sucesso!
            </Typography>
            <Typography gutterBottom>
                Um e-mail de confirmação foi enviado. Se você tiver alguma dúvida, entre em contato com suporte@eloscloud.com.br.
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" onClick={handleBackToHome} sx={{ mr: 2 }}>
                    Voltar à Página Principal
                </Button>
                <Button variant="contained" color="secondary" onClick={handleViewPurchases}>
                    Consultar Minhas Compras
                </Button>
            </Box>
        </Container>
    );
};

export default SuccessPage;
