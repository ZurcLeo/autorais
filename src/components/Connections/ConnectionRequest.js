// src/components/Connections/ConnectionRequest.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  Alert,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Button,
  ButtonGroup,
  Paper,
  Divider,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Badge,
  Collapse,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Block as BlockIcon,
  ArrowForward as ViewProfileIcon,
  Visibility as VisibilityIcon,
  PersonAdd as ConnectionIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon
} from '@mui/icons-material';
import { useConnections } from '../../providers/ConnectionProvider';
import { useToast } from '../../providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Componente que exibe as solicitações de amizade pendentes com melhorias de UX/UI
 * @param {Array} connections - Array de objetos com dados das solicitações
 * @param {Function} onConnectionUpdate - Callback quando uma solicitação é aceita/rejeitada
 */
const ConnectionRequest = ({ connections = [], onConnectionUpdate }) => {
  const { acceptConnectionRequest, rejectConnectionRequest, blockUser } = useConnections();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados
  const [loadingStates, setLoadingStates] = useState({});
  const [processedRequests, setProcessedRequests] = useState({});
  const [dialogState, setDialogState] = useState({ open: false, type: null, connection: null });
  const [expandedItems, setExpandedItems] = useState({});
  const [newRequests, setNewRequests] = useState({});

  // Efeito para marcar solicitações novas
  useEffect(() => {
    if (connections && connections.length > 0) {
      const now = Date.now();
      const twoHoursAgo = now - (2 * 60 * 60 * 1000);
      
      const newOnes = connections.reduce((acc, conn) => {
        const timestamp = conn.dataSolicitacao?._seconds 
          ? conn.dataSolicitacao._seconds * 1000 
          : now;
        
        acc[conn.id || conn.requestId] = timestamp > twoHoursAgo;
        return acc;
      }, {});
      
      setNewRequests(newOnes);
    }
  }, [connections]);

  // Verificar se há solicitações
  if (!connections || connections.length === 0) {
    return (
                <Alert severity="info" sx={{ backgroundColor: 'lightblue', color: 'darkblue' }}>
      
                    {t('connectionRequest.noRequests')}
                </Alert>
    );
  }

  // Ordenar conexões (mais recentes primeiro)
  const sortedConnections = [...connections].sort((a, b) => {
    const dateA = a.dataSolicitacao?._seconds || 0;
    const dateB = b.dataSolicitacao?._seconds || 0;
    return dateB - dateA;
  });

  // Funções de gerenciamento de estado
  const setLoading = (requestId, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [requestId]: isLoading
    }));
  };

  const toggleExpanded = (requestId) => {
    setExpandedItems(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  // Abrir diálogo de confirmação
  const openConfirmDialog = (type, connection) => {
    setDialogState({
      open: true,
      type,
      connection
    });
  };

  // Fechar diálogo de confirmação
  const closeConfirmDialog = () => {
    setDialogState({
      open: false,
      type: null, 
      connection: null
    });
  };

  // Funções para operações de conexão
  const handleAccept = async (connection) => {
    const requestId = connection.solicitanteId || connection.senderId;
    setLoading(requestId, true);
    
    try {
      await acceptConnectionRequest(requestId);
      showToast(t('connectionRequest.acceptSuccess'), { 
        type: 'success',
        autoHideDuration: 3000
      });
      
      // Atualizar estado visual
      setProcessedRequests(prev => ({
        ...prev,
        [requestId]: 'accepted'
      }));
      
      // Notificar o componente pai sobre a atualização
      if (onConnectionUpdate) {
        onConnectionUpdate({
          type: 'accept',
          connection,
          requestId,
          success: true
        });
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      showToast(t('connectionRequest.acceptError'), { type: 'error' });
    } finally {
      setLoading(requestId, false);
    }
  };

  const handleReject = async (connection) => {
    const requestId = connection.id || connection.requestId;
    setLoading(requestId, true);
    
    try {
      await rejectConnectionRequest(requestId);
      showToast(t('connectionRequest.rejectSuccess'), { type: 'info' });
      
      // Atualizar estado visual
      setProcessedRequests(prev => ({
        ...prev,
        [requestId]: 'rejected'
      }));
      
      // Notificar o componente pai sobre a atualização
      if (onConnectionUpdate) {
        onConnectionUpdate({
          type: 'reject',
          connection,
          success: true
        });
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      showToast(t('connectionRequest.rejectError'), { type: 'error' });
    } finally {
      setLoading(requestId, false);
    }
  };

  const handleBlock = async (connection) => {
    closeConfirmDialog();
    
    const userId = connection.senderId || connection.userId;
    const requestId = connection.id || connection.requestId;
    setLoading(requestId, true);
    
    try {
      await blockUser(userId);
      showToast(t('connectionRequest.blockSuccess'), { type: 'warning' });
      
      // Atualizar estado visual
      setProcessedRequests(prev => ({
        ...prev,
        [requestId]: 'blocked'
      }));
      
      // Notificar o componente pai sobre a atualização
      if (onConnectionUpdate) {
        onConnectionUpdate({
          type: 'block',
          connection,
          success: true
        });
      }
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      showToast(t('connectionRequest.blockError'), { type: 'error' });
    } finally {
      setLoading(requestId, false);
    }
  };

  // Função para navegar até o perfil do usuário
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Função utilitária para formatar datas com segurança
  const formatDateSafely = (dateInput) => {
    if (!dateInput) return new Date().toLocaleDateString();
    
    try {
      // Se for um timestamp do Firestore
      if (dateInput._seconds) {
        return new Date(dateInput._seconds * 1000).toLocaleDateString();
      }
      
      // Se for um timestamp comum (número)
      if (typeof dateInput === 'number') {
        return new Date(dateInput).toLocaleDateString();
      }
      
      // Se for já uma string de data formatada
      if (typeof dateInput === 'string') {
        return new Date(dateInput).toLocaleDateString();
      }
      
      // Se for um objeto Date
      if (dateInput instanceof Date) {
        return dateInput.toLocaleDateString();
      }
      
      // Fallback se nenhuma opção funcionar
      return new Date().toLocaleDateString();
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return new Date().toLocaleDateString();
    }
  };

  // Renderizar lista de solicitações com melhorias
  return (
    <>
      <List sx={{ width: '100%' }}>
        {sortedConnections.map((connection) => {
          const requestId = connection.id || connection.requestId;
          const isLoading = loadingStates[requestId] || false;
          const status = processedRequests[requestId] || connection.status || 'pending';
          const isExpanded = expandedItems[requestId] || false;
          const isNew = newRequests[requestId] || false;
          
          // Se a conexão foi processada como hidden, não mostrar
          if (status === 'hidden') return null;
          
          return (
            <Box
              key={requestId}
              sx={{
                mb: 3,
                opacity: ['accepted', 'rejected', 'blocked'].includes(status) ? 0.75 : 1,
                transition: 'all 0.3s ease',
                animation: isNew ? `${theme.transitions.create('transform', {
                  duration: theme.transitions.duration.standard,
                  easing: theme.transitions.easing.easeInOut
                })} 0.5s ease` : 'none',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(10px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' }
                }
              }}
            >
              <Paper
                elevation={isNew ? 3 : 1}
                sx={{
                  overflow: 'hidden',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: isNew 
                    ? '0 4px 12px rgba(25, 118, 210, 0.2)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                  },
                  border: isNew ? '1px solid' : 'none',
                  borderColor: 'primary.light',
                  position: 'relative'
                }}
              >
                {isNew && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1
                    }}
                  >
                    <Chip 
                      label={t('connectionRequest.new')}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                )}
                
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    p: 2,
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    gap: 2
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      status === 'accepted' ? (
                        <Tooltip title={t('connectionRequest.connected')}>
                          <AcceptIcon sx={{ color: 'success.main', backgroundColor: 'white', borderRadius: '50%' }} />
                        </Tooltip>
                      ) : null
                    }
                  >
                    <ListItemAvatar sx={{ minWidth: isMobile ? 'auto' : 72 }}>
                      <Avatar 
                        src={connection.senderPhotoURL || connection.fotoDoPerfil} 
                        alt={connection.senderName || connection.friendName || connection.nome}
                        sx={{ 
                          width: 72, 
                          height: 72,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      >
                        {(connection.senderName || connection.friendName || connection.nome || '?').charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                  </Badge>
                  
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                        <Typography 
                          variant="h6" 
                          component="span" 
                          fontWeight="bold"
                          sx={{ 
                            color: theme.palette.text.primary,
                            transition: 'color 0.2s',
                            '&:hover': {
                              color: theme.palette.primary.main,
                              cursor: 'pointer'
                            }
                          }}
                          onClick={() => handleViewProfile(connection.solicitanteId || connection.userId)}
                        >
                          {connection.senderName || connection.friendName || connection.nome}
                        </Typography>
                        
                        <Chip 
                          size="small" 
                          label={t(`connectionRequest.${status}`)}
                          color={
                            status === 'pending' ? 'primary' : 
                            status === 'accepted' ? 'success' :
                            status === 'rejected' ? 'default' :
                            status === 'blocked' ? 'error' : 'default'
                          }
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box component="div" sx={{ mt: 1 }}>
                        <Typography 
                          component="span" 
                          variant="body2" 
                          color="textPrimary" 
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          {connection.senderEmail}
                        </Typography>
                        
                        <Typography 
                          variant="caption" 
                          color="textSecondary" 
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 1
                          }}
                        >
                          <ConnectionIcon fontSize="small" />
                          {t('connectionRequest.mutualConnections', { count: connection.mutualConnections || 0 })}
                        </Typography>

                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          {connection.message && (
                            <Box sx={{ 
                              mt: 1, 
                              p: 2, 
                              bgcolor: theme.palette.background.paper, 
                              borderRadius: 2,
                              borderLeft: '3px solid',
                              borderColor: 'primary.light',
                              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.05)'
                            }}>
                              <Typography variant="body2" color="textSecondary">
                                "{connection.message}"
                              </Typography>
                            </Box>
                          )}
                            
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            display="block" 
                            sx={{ mt: 1 }}
                          >
                            {t('connectionRequest.sentAt', {
                              date: connection.dataSolicitacao?._seconds
                                ? new Date(connection.dataSolicitacao._seconds * 1000).toLocaleString()
                                : new Date().toLocaleString()
                            })}
                          </Typography>
                        </Collapse>
                        
                        {connection.message && (
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => toggleExpanded(requestId)}
                            sx={{ mt: 1, textTransform: 'none' }}
                          >
                            {isExpanded ? t('connectionRequest.showLess') : t('connectionRequest.showMore')}
                          </Button>
                        )}
                      </Box>
                    }
                    sx={{ 
                      flex: 1,
                      margin: 0,
                      '.MuiListItemText-primary': {
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 1
                      }
                    }}
                  />
                </ListItem>
                
                <Divider sx={{ opacity: 0.6 }} />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0,
                  p: 2,
                  bgcolor: theme.palette.background.default
                }}>
                  {status === 'pending' ? (
                    <ButtonGroup 
                      variant="contained" 
                      size="small"
                      orientation={isMobile ? 'vertical' : 'horizontal'}
                      sx={{ width: isMobile ? '100%' : 'auto' }}
                    >
                      <Button
                        color="success"
                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <AcceptIcon />}
                        onClick={() => handleAccept(connection)}
                        aria-label={t('connectionRequest.acceptRequest', {name: connection.senderName})}
                        disabled={isLoading}
                        sx={{ 
                          py: 1,
                          px: 2,
                          width: isMobile ? '100%' : 'auto',
                          '&:active': {
                            transform: 'scale(0.98)'
                          }
                        }}
                      >
                        {t('connectionRequest.acceptButton')}
                      </Button>
                      
                      <Button
                        color="error"
                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <RejectIcon />}
                        onClick={() => handleReject(connection)}
                        aria-label={t('connectionRequest.rejectRequest', {name: connection.senderName})}
                        disabled={isLoading}
                        sx={{ 
                          py: 1,
                          px: 2,
                          width: isMobile ? '100%' : 'auto',
                          '&:active': {
                            transform: 'scale(0.98)'
                          }
                        }}
                      >
                        {t('connectionRequest.rejectButton')}
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      {t(`connectionRequest.${status}Status`)}
                    </Typography>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex',
                    gap: 1,
                    mt: isMobile ? 1 : 0,
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'space-between' : 'flex-end'
                  }}>
                    <Tooltip title={t('connectionRequest.viewProfile')}>
                      <span>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleViewProfile(connection.solicitanteId || connection.userId)}
                          disabled={isLoading}
                          startIcon={<VisibilityIcon />}
                          size="small"
                          sx={{ 
                            borderRadius: '20px',
                            '&:active': {
                              transform: 'scale(0.98)'
                            }
                          }}
                        >
                          {t('connectionRequest.viewProfileButton')}
                        </Button>
                      </span>
                    </Tooltip>
                    
                    {status === 'pending' && (
                      <Tooltip title={t('connectionRequest.block')}>
                        <span>
                          <IconButton
                            color="warning"
                            onClick={() => openConfirmDialog('block', connection)}
                            aria-label={t('connectionRequest.blockUser', {name: connection.senderName})}
                            size="small"
                            disabled={isLoading}
                            sx={{ 
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              '&:active': {
                                transform: 'scale(0.95)'
                              }
                            }}
                          >
                            {isLoading ? <CircularProgress size={20} /> : <BlockIcon />}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Box>
          );
        })}
      </List>

      {/* Diálogo de confirmação para ações destrutivas */}
      <Dialog
        open={dialogState.open}
        onClose={closeConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogState.type === 'block' && t('connectionRequest.confirmBlockTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogState.type === 'block' && t('connectionRequest.confirmBlockMessage', {
              name: dialogState.connection?.senderName || dialogState.connection?.friendName || t('connectionRequest.thisUser')
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={() => {
              if (dialogState.type === 'block') {
                handleBlock(dialogState.connection);
              }
            }} 
            color="error" 
            variant="contained"
            autoFocus
          >
            {dialogState.type === 'block' && t('connectionRequest.confirmBlock')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConnectionRequest;