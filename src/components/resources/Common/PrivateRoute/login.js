import React, { useState } from 'react';
import { useAuth } from '../../AuthService';
import { Card, Container, Form, Button, FloatingLabel, Badge } from 'react-bootstrap';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signInWithEmail, signInWithProvider } = useAuth(); // Obtendo as funções de login do AuthProvider

    const handleLoginWithEmail = async () => {
        await signInWithEmail(email, password);
    };

    const handleGoogleLogin = async () => {
        await signInWithProvider('google');
    };

    const handleMicrosoftLogin = async () => {
        await signInWithProvider('microsoft');
    };

    return (
        <Container style={{ marginTop: '20px', marginBottom: '20px', maxWidth: '400px' }}>
            <Card>
                <Card.Header>Login</Card.Header>
                <Card.Body>
                    <Form>
                        <FloatingLabel controlId="floatingEmailLogin1" label="Email" className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Digite seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </FloatingLabel>
                        <FloatingLabel controlId="floatingPasswordLogin1" label="Senha" className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </FloatingLabel>
                    </Form>
                </Card.Body>
                <Card.Footer>
                    <Button variant="primary" onClick={handleLoginWithEmail} type="submit" className="w-100 mt-3">
                        Entrar
                    </Button>
                    <Button variant="link" className="w-100 mt-3">
                        Como Criar Minha Conta
                    </Button>
                    <Button variant="outline-danger" onClick={handleGoogleLogin} className="w-100 mt-2">
                        Entrar com Google
                    </Button>
                    <Button variant="outline-primary" onClick={handleMicrosoftLogin} className="w-100 mt-2">
                        Entrar com Microsoft
                    </Button>
                </Card.Footer>
            </Card>
            <div className="text-center mt-3">
                <Badge bg="secondary">No momento apenas convidados podem se cadastrar.</Badge>
            </div>
        </Container>
    );
};

export default Login;
