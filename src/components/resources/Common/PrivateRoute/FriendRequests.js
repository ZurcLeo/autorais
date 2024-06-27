import React, { useEffect } from 'react';
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton, Box, Button, Grid } from '@mui/material';
import { useConnections } from './hooks/useConnections';
import { FaCheck, FaTimes } from 'react-icons/fa';

const FriendRequests = () => {
    const { friendRequests, handleAcceptFriendRequest, handleRejectRequest, fetchFriendRequests } = useConnections();

    useEffect(() => {
        fetchFriendRequests(); 
    }, [fetchFriendRequests]);

    return (
        <Box sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>Solicitações de Amizade</Typography>
            <List>
                {friendRequests.map((request) => (
                    <ListItem key={request.id} alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar src={request.fotoDoPerfil} />
                        </ListItemAvatar>
                        <ListItemText
                            primary={request.nome}
                            secondary={request.email}
                        />
                        <ListItemSecondaryAction>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<FaCheck />}
                                        onClick={() => handleAcceptFriendRequest(request.uid)}
                                    >
                                        Aceitar
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<FaTimes />}
                                        onClick={() => handleRejectRequest(request.uid)}
                                    >
                                        Rejeitar
                                    </Button>
                                </Grid>
                            </Grid>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default FriendRequests;
