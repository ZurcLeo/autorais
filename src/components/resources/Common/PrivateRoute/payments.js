import React, { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { auth, requestNotificationPermission } from '../../../../firebase.config';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import { Box, Grid, Button, Typography, CircularProgress, Paper, Container } from '@mui/material';
import { toast } from 'react-toastify';
import './payments.css';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/return`
            },
        });

        if (result.error) {
            toast.error(`Erro no pagamento: ${result.error.message}`);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                toast.success('Pagamento realizado com sucesso!');
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <PaymentElement />
            <Button type="submit" variant="contained" color="primary" disabled={!stripe} sx={{ mt: 2 }}>
                Pagar
            </Button>
        </Box>
    );
};


const Return = () => {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get('payment_intent');

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/payments/session-status?payment_intent=${sessionId}`)
            .then((res) => {
                setStatus(res.data.status);
                setCustomerEmail(res.data.customer_email);
                if (res.data.status === 'succeeded') {
                    navigate('/payments/success');
                }
            });
    }, [navigate]);

    if (status === 'requires_action') {
        return navigate('/checkout');
    }

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


const Payments = () => {
    const [clientSecret, setClientSecret] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await getIdToken(user);
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleNotificationPermission = () => {
        requestNotificationPermission()
            .then(() => {
                toast.success('Permissão para notificações solicitada.');
            })
            .catch((error) => {
                console.error('Erro ao solicitar permissão para notificações:', error);
            });
    };

    const handleCompra = async (quantidade, valor) => {
        if (!currentUser) {
            toast.error('Você precisa estar logado para comprar ElosCoins');
            return;
        }

        setLoading(true);

        try {
            const description = `${quantidade} ElosCoins`;

            if (grecaptcha && !window.recaptchaExecuted) {
                window.recaptchaExecuted = true;

                grecaptcha.enterprise.ready(async () => {
                    try {
                        const recaptchaToken = await grecaptcha.enterprise.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, { action: 'purchase' });

                        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/payments/create-payment-intent`, {
                            quantidade: Number(quantidade),
                            valor: Number(valor),
                            userId: currentUser.uid,
                            description,
                            recaptchaToken
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${currentUser.stsTokenManager.accessToken}`
                            }
                        });

                        setClientSecret(response.data.clientSecret);
                        window.recaptchaExecuted = false; // Reset the flag for future use
                    } catch (error) {
                        console.error('Erro ao executar reCAPTCHA ou criar intenção de pagamento:', error);
                        toast.error('Erro ao executar reCAPTCHA ou criar intenção de pagamento. Por favor, tente novamente mais tarde.');
                    } finally {
                        setLoading(false);
                    }
                });
            } else {
                console.error('reCAPTCHA não está carregado ou já foi executado');
                toast.error('Erro ao carregar reCAPTCHA. Por favor, tente novamente mais tarde.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Erro ao criar intenção de pagamento:', error);
            toast.error(`Erro ao criar intenção de pagamento: ${error.message}`);
            setLoading(false);
        }
    };

    const precos = [
        { quantidade: 1, valor: 0.5 },
        { quantidade: 10, valor: 2.5 },
        { quantidade: 50, valor: 8 },
        { quantidade: 500, valor: 10 },
        { quantidade: 5000, valor: 90 },
        { quantidade: 50000, valor: 900 },
    ];

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Comprar ElosCoins
            </Typography>
            <Grid container spacing={3}>
                {precos.map((preco, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper elevation={3} sx={{ padding: 2 }}>
                            <Typography variant="h5">{preco.quantidade} ElosCoins</Typography>
                            <Typography variant="body2">Preço: R$ {preco.valor.toFixed(2)}</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleCompra(preco.quantidade, preco.valor)}
                                disabled={!!clientSecret || loading}
                                sx={{ mt: 2 }}
                            >
                                Comprar
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}
            {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} />
                </Elements>
            )}
        </Container>
    );
};

export default Payments;

