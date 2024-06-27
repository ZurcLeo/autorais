import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../../../firebase.config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, Form, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AceitarConvite = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // Extrair inviteId da URL
        const inviteId = searchParams.get('inviteId');
        if (!inviteId) {
            toast.error('Convite inválido.');
            return;
        }
        // Aqui você pode adicionar lógica para validar o inviteId se necessário
    }, [searchParams]);

    const handleAcceptInvite = async () => {
        setLoading(true);
        const inviteId = searchParams.get('inviteId');
        const functions = getFunctions();
        const acceptInvite = httpsCallable(functions, 'acceptInvite');

        try {
            const result = await acceptInvite({ inviteId });
            toast.success('Convite aceito com sucesso! Você recebeu 5000 ElosCoins.');
            await signInWithEmailAndPassword(auth, email, password);
            // Redirecionar para a página inicial ou outra página
        } catch (error) {
            console.error('Erro ao aceitar convite:', error);
            toast.error('Erro ao aceitar convite.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <h2>Aceitar Convite</h2>
            <Form>
                <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" onClick={handleAcceptInvite} disabled={loading}>
                    {loading ? 'Aceitando...' : 'Aceitar Convite'}
                </Button>
            </Form>
        </Container>
    );
};

export default AceitarConvite;
