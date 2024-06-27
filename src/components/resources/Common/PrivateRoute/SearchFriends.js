import React, { useState } from 'react';
import { Card, TextField, Button, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useConnections } from './hooks/useConnections';

const SearchFriends = () => {
    const { searchResults, handleSearch, handleSendRequest } = useConnections();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted with searchTerm:", searchTerm);
        handleSearch(searchTerm);
    };

    return (
        <Box sx={{ mt: 4, p: 2 }}>
            <Typography variant="h6" gutterBottom>Buscar Conexões</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', mb: 4 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por nome ou email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon />,
                    }}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ ml: 2 }}>
                    Buscar
                </Button>
            </Box>
            {searchResults.length > 0 && (
                <List>
                    {searchResults.map((result) => (
                        <ListItem key={result.user} alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar src={result.fotoDoPerfil} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={<a href={`/perfil/${result.user}`} style={{ textDecoration: 'none', color: 'inherit' }}>{result.nome}</a>}
                                secondary={result.email}
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" color="primary" onClick={() => handleSendRequest(result.user)}>
                                    <PersonAddIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default SearchFriends;
