import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthService'; // Importando o hook useAuth
import { Card, Container, Form, Button, FloatingLabel } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Register = () => {
    const navigate = useNavigate();
    const [inviteId, setInviteId] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const { registerWithEmail, registerWithProvider } = useAuth(); // Obtendo as funções de registro do AuthProvider

    useEffect(() => {
        // Carregar informações de validação do localStorage
        const validatedInvite = JSON.parse(localStorage.getItem('validatedInvite'));
        if (validatedInvite) {
            setInviteId(validatedInvite.inviteId);
            setUserEmail(validatedInvite.userEmail);
        } else {
            toast.error('Convite inválido.');
            navigate('/invite'); // Redirecionar se não houver informações de validação
        }
    }, [navigate]);

    const handleRegisterWithEmail = async () => {
        if (!inviteId) {
            toast.error('Convite inválido.');
            return;
        }

        if (!userEmail || !password) {
            toast.error('Por favor, preencha todos os campos.');
            return;
        }

        try {
            await registerWithEmail(userEmail, password, inviteId);
        } catch (error) {
            console.error('Erro ao registrar e invalidar o convite:', error);
            toast.error('Erro ao registrar e invalidar o convite.');
        }
    };

    const handleGoogleRegister = async () => {
        if (!inviteId) {
            toast.error('Convite inválido.');
            return;
        }
        try {
            await registerWithProvider('google', inviteId);
        } catch (error) {
            console.error('Erro ao registrar e invalidar o convite:', error);
            toast.error('Erro ao registrar e invalidar o convite.');
        }
    };

    const handleMicrosoftRegister = async () => {
        if (!inviteId) {
            toast.error('Convite inválido.');
            return;
        }
        try {
            await registerWithProvider('microsoft', inviteId);
        } catch (error) {
            console.error('Erro ao registrar e invalidar o convite:', error);
            toast.error('Erro ao registrar e invalidar o convite.');
        }
    };

    return (
        <Container style={{ marginTop: '20px', marginBottom: '20px', maxWidth: '400px' }}>
            <Card>
                <Card.Header>Registrar</Card.Header>
                <Card.Body>
                    <Form>
                        <FloatingLabel controlId="floatingEmailRegister1" label="Email" className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                required
                                autoComplete="email"
                                disabled // Desabilitado porque o email já está validado
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingPasswordRegister1" label="Senha" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </FloatingLabel>
                    </Form>
                </Card.Body>
                <Card.Footer>
                    <Button variant="primary" onClick={handleRegisterWithEmail} type="submit" className="w-100 mt-3">
                        Registrar com Email
                    </Button>
                    <Button variant="outline-danger" onClick={handleGoogleRegister} className="w-100 mt-2">
                        Registrar com Google
                    </Button>
                    <Button variant="outline-primary" onClick={handleMicrosoftRegister} className="w-100 mt-2">
                        Registrar com Microsoft
                    </Button>
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default Register;