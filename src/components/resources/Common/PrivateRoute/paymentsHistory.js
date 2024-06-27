import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../../../firebase.config';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PaymentsHistory = () => {
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

    const formatDate = (timestamp) => {
        if (!timestamp || !timestamp.seconds) return 'Data Indisponível';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <Container>
            <Typography variant="h5" gutterBottom>
                Minhas Compras
            </Typography>
            <Button variant="contained" color="primary" onClick={handleBackToHome} sx={{ mb: 2 }}>
                Voltar à Página Principal
            </Button>
            {purchases.length > 0 ? (
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
                                    <TableCell>{formatDate(purchase.dataCompra)}</TableCell>
                                    <TableCell>{purchase.quantidade}</TableCell>
                                    <TableCell>R$ {purchase.valorPago.toFixed(2)}</TableCell>
                                    <TableCell>{purchase.nomeDoProduto || 'Nome Indisponível'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1">Nenhuma compra encontrada.</Typography>
            )}
        </Container>
    );
};

export default PaymentsHistory;
