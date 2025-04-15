import React from 'react';
import { Box, Avatar, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next'; // Importa a função de tradução
import { serviceLocator } from '../../core/services/BaseService';

const ProfileHeader = ({ onEditImage }) => {
  const { t } = useTranslation(); // Obtém a função de tradução
    const serviceStore = serviceLocator.get('store').getState()?.auth;
    const { currentUser } = serviceStore;

  return (
    <Box display="flex" alignItems="center" justifyContent="center" position="relative" mb={2}>
      {/* Imagem do perfil */}
      <Avatar
        src={currentUser.fotoDoPerfil}
        sx={{
          width: 120,
          height: 120,
          border: '3px solid #fff',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.3)',
          },
        }}
      />

      {/* Botão de editar */}
      <Tooltip title={t('profileHeader.editProfileImage')} arrow>
        <IconButton
          onClick={onEditImage}
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
            color: '#fff',
          }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ProfileHeader;