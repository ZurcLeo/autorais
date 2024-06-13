import React from 'react';
import { Container, Grid, Typography, Avatar, Button, Box } from '@mui/material';
import { FaUserCircle } from 'react-icons/fa';
import { useConnections } from './hooks/useConnections';
import { useAuth } from '../../AuthService';
import './ActiveConnections.css';

const ActiveConnections = () => {
    const { activeConnections, handleAuthorizeFriend, handleDeauthorizeFriend } = useConnections();
    const { currentUser } = useAuth();

    const handleImageError = (e) => {
        e.target.src = process.env.REACT_APP_PLACE_HOLDER_IMG;
    };

    const handleCardClick = (uid) => {
        window.location.href = `/perfil/${uid}`;
    };

    const isAuthorized = (uid) => currentUser.amigosAutorizados.includes(uid);

    return (
        <Box sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>Conexões Ativas</Typography>
            <Container>
                <Grid container spacing={4}>
                    {activeConnections.length > 0 ? (
                        activeConnections.map((connection) => (
                            <Grid item key={connection.uid} sm={6}>
                                <Box
                                    className="clickable-card"
                                    onClick={() => handleCardClick(connection.uid)}
                                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', cursor: 'pointer' }}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <Avatar
                                            src={connection.fotoDoPerfil || process.env.REACT_APP_PLACE_HOLDER_IMG}
                                            alt={connection.nome}
                                            onError={handleImageError}
                                            sx={{ width: 100, height: 100, marginBottom: 2 }}
                                        />
                                        {isAuthorized(connection.uid) && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    width: 16,
                                                    height: 16,
                                                    bgcolor: 'primary.main',
                                                    borderRadius: '50%',
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Typography variant="h6" className="text-name mb-2">{connection.nome}</Typography>
                                    <Typography variant="body2" color="text.secondary" className="text-muted mb-3">{connection.email}</Typography>
                                    {/* {isAuthorized(connection.uid) ? (
                                        <Button variant="outlined" color="error" onClick={() => handleDeauthorizeFriend(connection.uid)}>
                                            Desautorizar
                                        </Button>
                                    ) : (
                                        <Button variant="outlined" color="success" onClick={() => handleAuthorizeFriend(connection.uid)}>
                                            Autorizar
                                        </Button>
                                    )} */}
                                </Box>
                            </Grid>
                        ))
                    ) : (
                        <Grid item>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 2,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                }}
                            >
                                <FaUserCircle size={50} style={{ color: 'white' }} className="mb-3" />
                                <Typography variant="body1" style={{ color: 'white' }}>Você não possui conexões ativas.</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default ActiveConnections;
