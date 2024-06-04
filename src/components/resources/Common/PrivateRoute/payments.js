import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { auth, functions, requestNotificationPermission } from '../../../../firebase.config';
import { getIdToken, onAuthStateChanged } from 'firebase/auth';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import './payments.css'; 

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            }
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
        <form onSubmit={handleSubmit} className="stripe-form">
            <CardElement className="stripe-card-element" />
            <Button type="submit" variant="primary" disabled={!stripe}>
                Pagar
            </Button>
        </form>
    );
};

const Payments = () => {
    const [clientSecret, setClientSecret] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await getIdToken(user);
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
    
        try {
            const description = `${quantidade} ElosCoins`;
    
            if (grecaptcha && !window.recaptchaExecuted) {
                window.recaptchaExecuted = true;
    
                grecaptcha.enterprise.ready(() => {
                    grecaptcha.enterprise.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, { action: 'purchase' })
                        .then(async (recaptchaToken) => {
    
                            const result = await axios.post('https://us-central1-elossolucoescloud-1804e.cloudfunctions.net/createPaymentIntent', {
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
    
                            setClientSecret(result.data.clientSecret);
                            window.recaptchaExecuted = false; // Reset the flag for future use
                        })
                        .catch(error => {
                            console.error('Erro ao executar reCAPTCHA:', error);
                            toast.error('Erro ao executar reCAPTCHA. Por favor, tente novamente mais tarde.');
                            window.recaptchaExecuted = false; // Reset the flag for future use
                        });
                });
            } else {
                console.error('reCAPTCHA não está carregado ou já foi executado');
                toast.error('Erro ao carregar reCAPTCHA. Por favor, tente novamente mais tarde.');
            }
        } catch (error) {
            console.error('Erro ao criar intenção de pagamento:', error);
            toast.error(`Erro ao criar intenção de pagamento: ${error.message}`);
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
            <h2>Comprar ElosCoins</h2>
            <Row>
                {precos.map((preco, index) => (
                    <Col key={index} md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{preco.quantidade} ElosCoins</Card.Title>
                                <Card.Text>Preço: R$ {preco.valor.toFixed(2)}</Card.Text>
                                <Button
                                    variant="primary"
                                    onClick={() => handleCompra(preco.quantidade, preco.valor)}
                                    disabled={!!clientSecret}
                                >
                                    Comprar
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} />
                </Elements>
            )}
        </Container>
    );
};

export default Payments;
