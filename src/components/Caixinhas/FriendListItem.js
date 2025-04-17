import { 
    ListItem, ListItemAvatar, Avatar, ListItemText, Checkbox
  } from '@mui/material';

export const FriendListItem = ({ friend, isSelected, onSelect, disabled }) => {
    return (
      <ListItem 
        button 
        onClick={onSelect}
        disabled={disabled}
        selected={isSelected}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          '&.Mui-selected': {
            backgroundColor: 'primary.light',
          }
        }}
      >
        <ListItemAvatar>
          <Avatar src={friend.fotoPerfil}>
            {friend.nome?.[0] || '?'}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={friend.nome}
          secondary={friend.email}
        />
        <Checkbox 
          checked={isSelected}
          disabled={disabled}
          color="primary"
        />
      </ListItem>
    );
  };