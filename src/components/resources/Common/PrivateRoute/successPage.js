import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../../../firebase.config';  // Ajuste o caminho conforme necessário
import { toast } from 'react-toastify';

const SuccessPage = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUser(user);
                fetchPurchases(user);
            } else {
                setCurrentUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchPurchases = async (user) => {
        try {
            const token = await user.getIdToken();
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/purchases`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setPurchases(response.data);
        } catch (error) {
            console.error('Erro ao buscar compras:', error);
            toast.error('Erro ao buscar compras. Por favor, tente novamente mais tarde.');
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewPurchases = () => {
        if (currentUser) {
            fetchPurchases(currentUser);
        }
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
            {purchases.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Minhas Compras
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell>Quantidade</TableCell>
                                    <TableCell>Valor</TableCell>
                                    <TableCell>Produto</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {purchases.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>{new Date(purchase.dataCompra.seconds * 1000).toLocaleDateString()}</TableCell>
                                        <TableCell>{purchase.quantidade}</TableCell>
                                        <TableCell>R$ {purchase.valorPago.toFixed(2)}</TableCell>
                                        <TableCell>{purchase.produto}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Container>
    );
};

export default SuccessPage;
