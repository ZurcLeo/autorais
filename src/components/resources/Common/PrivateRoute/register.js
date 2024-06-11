import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthService'; // Importando o hook useAuth
import { Card, Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
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
        <Container maxWidth="xs" sx={{ mt: 4, mb: 4 }}>
            <Card>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h5" component="div" gutterBottom>
                        Registrar
                    </Typography>
                    <Box component="form">
                        <TextField
                            id="email"
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            type="email"
                            placeholder="Digite seu email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled // Desabilitado porque o email já está validado
                        />
                        <TextField
                            id="password"
                            label="Senha"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Button variant="contained" onClick={handleRegisterWithEmail} fullWidth sx={{ mt: 1 }}>
                        Registrar com Email
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleGoogleRegister} fullWidth sx={{ mt: 2 }}>
                        Registrar com Google
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleMicrosoftRegister} fullWidth sx={{ mt: 2 }}>
                        Registrar com Microsoft
                    </Button>
                </Box>
            </Card>
        </Container>
    );
};

export default Register;