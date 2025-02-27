import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCaixinha } from '../../context/CaixinhaContext';
import { showToast } from '../../utils/toastUtils';

const MembersList = ({ caixinha }) => {
  const { t } = useTranslation();
  const { addMember, updateMember, removeMember } = useCaixinha();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [email, setEmail] = useState('');

  const handleAddMember = () => {
    setSelectedMember(null);
    setEmail('');
    setOpenDialog(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEmail(member.email);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedMember) {
        await updateMember(caixinha.id, selectedMember.id, { email });
        showToast(t('membersList.memberUpdated'), { type: 'success' });
      } else {
        await addMember(caixinha.id, { email });
        showToast(t('membersList.memberAdded'), { type: 'success' });
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error managing member:', error);
      showToast(t('membersList.errorManagingMember'), { type: 'error' });
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember(caixinha.id, memberId);
      showToast(t('membersList.memberRemoved'), { type: 'success' });
    } catch (error) {
      console.error('Error removing member:', error);
      showToast(t('membersList.errorRemovingMember'), { type: 'error' });
    }
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {t('membersList.members', { count: caixinha.members?.length || 0 })}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleAddMember}
        >
          {t('membersList.addMember')}
        </Button>
      </Box>

      <List>
        {caixinha.members?.map((member) => (
          <ListItem key={member.id}>
            <ListItemAvatar>
              <Avatar src={member.fotoPerfil}>
                {member.nome?.[0] || '?'}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={member.nome}
              secondary={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {member.email}
                  {member.isAdmin && (
                    <Chip
                      size="small"
                      icon={<StarIcon />}
                      label={t('membersList.admin')}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label={t('common.edit')}
                onClick={() => handleEditMember(member)}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label={t('common.delete')}
                onClick={() => handleRemoveMember(member.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedMember ? t('membersList.editMember') : t('membersList.addNewMember')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('common.email')}
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedMember ? t('common.save') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MembersList;