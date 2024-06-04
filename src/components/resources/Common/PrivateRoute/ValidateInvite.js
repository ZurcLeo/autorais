import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'react-toastify';
import { Container, Form, Button } from 'react-bootstrap';

const ValidateInvite = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [inviteId, setInviteId] = useState(null);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const inviteIdParam = searchParams.get('inviteId');
        setInviteId(inviteIdParam);

        if (!inviteIdParam) {
            toast.error('Convite inválido.');
        }
    }, [location.search]);

    const handleValidateInvite = async () => {
        if (!userEmail) {
            toast.error('Por favor, insira o email que recebeu o convite.');
            return;
        }

        const functions = getFunctions();
        const validateInviteFunction = httpsCallable(functions, 'validateInvite');
        try {
            const result = await validateInviteFunction({ inviteId, userEmail });
            if (result.data.success) {
                toast.success('Convite validado com sucesso! Você recebeu 5.000 ElosCoins.');
                // Armazene as informações validadas no localStorage
                localStorage.setItem('validatedInvite', JSON.stringify({ inviteId, userEmail }));
                navigate('/Registro');
            } else {
                toast.error('Falha ao validar o convite.');
            }
        } catch (error) {
            console.error('Erro ao validar o convite:', error);
            toast.error('Erro ao validar o convite.');
        }
    };

    return (
        <Container style={{ marginTop: '20px', marginBottom: '20px', maxWidth: '400px' }}>
            <h1>Validar Convite</h1>
            <Form>
                <Form.Group controlId="formEmailInvite">
                    <Form.Label>Email que recebeu o convite:</Form.Label>
                    <Form.Control
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button onClick={handleValidateInvite} className="w-100 mt-3">Validar Convite</Button>
            </Form>
        </Container>
    );
};

export default ValidateInvite;