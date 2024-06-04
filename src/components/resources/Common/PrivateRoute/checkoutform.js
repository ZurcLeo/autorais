import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

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
        <form onSubmit={handleSubmit}>
            <CardElement />
            <Button type="submit" variant="primary" disabled={!stripe}>
                Pagar
            </Button>
        </form>
    );
};

export default CheckoutForm;
