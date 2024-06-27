import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthService';
import {
    Card, Container, TextField, Button, Typography, Box, Alert, Dialog, DialogContent, DialogActions
} from '@mui/material';
import ComoFunciona from '../../../pages/howitwork';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

const validationSchema = Yup.object({
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    password: Yup.string().min(8, 'Senha deve ter no mínimo 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/, 'Senha deve conter uma letra maiúscula, uma letra minúscula, um número e um caractere especial')
        .required('Senha é obrigatória')
});

const Login = () => {
    const { signInWithEmail, signInWithProvider } = useAuth();
    const [open, setOpen] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const response = await axios.post('/api/register', values);
                console.log(response.data);
            } catch (error) {
                console.error('Erro ao enviar dados:', error.response?.data || error.message);
            }
        }
    });

    const handleGoogleLogin = async () => {
        await signInWithProvider('google');
    };

    const handleMicrosoftLogin = async () => {
        await signInWithProvider('microsoft');
    };

    const handleFacebookLogin = (response) => {
        console.log(response);
        if (response.accessToken) {
            // Enviar o token para o backend para autenticação
            axios.post('/api/facebook-login', { accessToken: response.accessToken })
                .then(res => {
                    console.log(res.data);
                    // Obter a lista de amigos
                    axios.get(`https://graph.facebook.com/me/friends?access_token=${response.accessToken}`)
                        .then(friendsResponse => {
                            console.log(friendsResponse.data);
                            // Use os dados dos amigos conforme necessário
                        })
                        .catch(err => console.error('Erro ao obter amigos:', err));
                })
                .catch(err => console.error('Erro ao autenticar com Facebook:', err));
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Container style={{ marginTop: '100px' }} maxWidth="xs" sx={{ mt: 4, mb: 4 }}>
            <Card>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h5" component="div" gutterBottom>
                        ElosCloud
                    </Typography>
                    <form onSubmit={formik.handleSubmit}>
                        <TextField
                            id="email"
                            label="Email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            type="email"
                            placeholder="Digite seu email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            required
                            autoComplete="email"
                        />
                        <TextField
                            id="password"
                            label="Senha"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            type="password"
                            placeholder="Digite sua senha"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            required
                            autoComplete="current-password"
                        />
                        <Box sx={{ p: 2 }}>
                            <Button variant="contained" type="submit" fullWidth sx={{ mt: 1 }}>
                                Entrar
                            </Button>
                        </Box>
                    </form>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Button variant="text" fullWidth sx={{ mt: 2 }} onClick={handleOpen}>
                        Como Criar Minha Conta
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleGoogleLogin} fullWidth sx={{ mt: 2 }}>
                        Entrar com Google
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleMicrosoftLogin} fullWidth sx={{ mt: 2 }}>
                        Entrar com Microsoft
                    </Button>
                    <FacebookLogin
                        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                        fields="name,email,picture"
                        scope="public_profile,email"
                        callback={handleFacebookLogin}
                        render={renderProps => (
                            <Button variant="outlined" color="primary" onClick={renderProps.onClick} fullWidth sx={{ mt: 2 }}>
                                Entrar com Facebook
                            </Button>
                        )}
                    />
                </Box>
            </Card>
            <Box textAlign="center" sx={{ mt: 2 }}>
                <Alert severity="info">No momento apenas convidados podem se cadastrar.</Alert>
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <ComoFunciona />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Login;
