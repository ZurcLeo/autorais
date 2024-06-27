import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Return = () => {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('payment_intent');

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/session-status?payment_intent=${sessionId}`)
            .then((res) => {
                setStatus(res.data.status);
                setCustomerEmail(res.data.customer_email);
                if (res.data.status === 'succeeded') {
                    navigate('/Payments/success');
                }
            }).catch(error => {
                console.error('Erro ao recuperar o estado da sessão:', error);
            });
    }, [navigate]);

    return (
        <Container>
            {status === 'succeeded' ? (
                <>
                    <Typography variant="h4" gutterBottom>
                        Pagamento realizado com sucesso!
                    </Typography>
                    <Typography>
                        Um e-mail de confirmação foi enviado para {customerEmail}. Se você tiver alguma dúvida, entre em contato com suporte@eloscloud.com.br.
                    </Typography>
                </>
            ) : (
                <Typography variant="h6">Aguardando confirmação do pagamento...</Typography>
            )}
        </Container>
    );
};

export default Return;
