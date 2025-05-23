import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  SortByAlpha as SortIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useCaixinhaInvite } from '../../providers/CaixinhaInviteProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';

const MODULE_NAME = 'CaixinhaInviteRequest';

/**
 * Componente que exibe e gerencia convites de caixinha recebidos pelo usuário.
 * Enriquece cada convite com dados da caixinha correspondente usando o hook useCaixinha.
 *
 * @param {Object} props
 * @param {Array} props.invites - Lista de convites a serem exibidos
 * @param {Function} props.onInviteUpdate - Função chamada após aceitar/rejeitar um convite
 * @returns {React.ReactElement} Componente renderizado
 */
const CaixinhaInviteRequest = ({ invites = [], onInviteUpdate }) => {
  const { t } = useTranslation();
  const { acceptInvite, rejectInvite } = useCaixinhaInvite();
  const { getCaixinha } = useCaixinha();
  
  // Estados locais
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingInviteId, setProcessingInviteId] = useState(null);
  const [enrichedInvites, setEnrichedInvites] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});

  /**
   * Formata valor monetário para exibição
   * @param {number} value - Valor a ser formatado
   * @returns {string} Valor formatado como moeda
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };
  
  /**
   * Alterna a direção da ordenação
   */
  const toggleSortDirection = () => {
    setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
  };

  /**
   * Efeito para carregar detalhes das caixinhas
   */
  useEffect(() => {
    const enrichInvites = async () => {
      if (!invites || invites.length === 0) {
        setEnrichedInvites([]);
        return;
      }

      // Iniciar o carregamento para cada convite
      setLoadingStates(
        invites.reduce((acc, invite) => {
          acc[invite.id] = true;
          return acc;
        }, {})
      );

      // Processar cada convite de forma sequencial para não sobrecarregar a API
      const enriched = [];
      for (const invite of invites) {
        try {
          // Buscar detalhes da caixinha - importante usar corretamente o ID da caixinha
          coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Fetching caixinha details', {
            caixinhaId: invite.caixinhaId
          });
          
          // Chamar o serviço para obter os detalhes reais da caixinha
          const caixinhaDetails = await getCaixinha(invite.caixinhaId);
          
          // Verificar se temos dados válidos
          if (!caixinhaDetails) {
            throw new Error(`No data received for caixinha ${invite.caixinhaId}`);
          }
          
          // Log para debug
          coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Retrieved caixinha details', {
            caixinhaId: invite.caixinhaId,
            caixinhaName: caixinhaDetails.nome || caixinhaDetails.name,
            contribution: caixinhaDetails.contribuicaoMensal
          });

          // Adicionar detalhes da caixinha ao convite
          const enrichedInvite = {
            ...invite,
            caixinhaNome: caixinhaDetails.nome || caixinhaDetails.name,
            contribuicaoMensal: caixinhaDetails.contribuicaoMensal,
            caixinhaDetails: caixinhaDetails
          };

          // Verificar dados ausentes e marcar o problema
          if (!enrichedInvite.caixinhaNome) {
            console.log('verififi:', enrichedInvite)
            enrichedInvite.dataMissing = true;
            enrichedInvite.caixinhaNome = t('inviteRequest.nameMissing');
          }
          
          if (enrichedInvite.contribuicaoMensal === undefined || enrichedInvite.contribuicaoMensal === null) {
            enrichedInvite.dataMissing = true;
            enrichedInvite.contribuicaoMensal = 0;
          }

          enriched.push(enrichedInvite);
        } catch (error) {
          // Registrar erro e adicionar convite com informações de erro
          coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to enrich invite', {
            inviteId: invite.id,
            caixinhaId: invite.caixinhaId,
            error: error.message
          });

          const errorInvite = {
            ...invite,
            caixinhaNome: t('inviteRequest.errorLoadingCaixinha'),
            contribuicaoMensal: null,
            error: true,
            errorMessage: error.message
          };

          enriched.push(errorInvite);
        } finally {
          // Marcar o convite como processado
          setLoadingStates(prev => ({
            ...prev,
            [invite.id]: false
          }));
        }
      }

      setEnrichedInvites(enriched);
    };

    enrichInvites();
  }, [invites, getCaixinha, t]);

  /**
   * Abre o diálogo de confirmação para aceitar ou rejeitar um convite
   * @param {string} action - 'accept' ou 'reject'
   * @param {Object} invite - Convite a ser aceito ou rejeitado
   */
  const handleConfirmAction = (action, invite) => {
    setSelectedInvite(invite);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  /**
   * Aceita um convite de caixinha
   */
  const handleAcceptInvite = async () => {
    if (!selectedInvite || !acceptInvite) {
      setConfirmDialogOpen(false);
      return;
    }

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Accepting caixinha invite', {
      inviteId: selectedInvite.id,
      caixinhaId: selectedInvite.caixinhaId
    });

    // Fechar o diálogo e marcar o convite como em processamento
    setConfirmDialogOpen(false);
    setProcessingInviteId(selectedInvite.id);

    try {
      // Aceitar o convite
      await acceptInvite(selectedInvite.id);

      // Notificar que o convite foi aceito (para atualizar a UI)
      if (onInviteUpdate) {
        onInviteUpdate(selectedInvite.id, 'accepted');
      }

      // Remover o convite da lista
      setEnrichedInvites(prevInvites => 
        prevInvites.filter(invite => invite.id !== selectedInvite.id)
      );

      // Log de sucesso
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite accepted successfully', {
        inviteId: selectedInvite.id
      });
    } catch (error) {
      // Log de erro
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to accept invite', {
        inviteId: selectedInvite.id,
        error: error.message
      });
    } finally {
      // Limpar estado
      setProcessingInviteId(null);
      setSelectedInvite(null);
    }
  };

  /**
   * Rejeita um convite de caixinha
   */
  const handleRejectInvite = async () => {
    if (!selectedInvite || !rejectInvite) {
      setConfirmDialogOpen(false);
      return;
    }

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Rejecting caixinha invite', {
      inviteId: selectedInvite.id,
      caixinhaId: selectedInvite.caixinhaId
    });

    // Fechar o diálogo e marcar o convite como em processamento
    setConfirmDialogOpen(false);
    setProcessingInviteId(selectedInvite.id);

    try {
      // Rejeitar o convite
      await rejectInvite(selectedInvite.id);

      // Notificar que o convite foi rejeitado (para atualizar a UI)
      if (onInviteUpdate) {
        onInviteUpdate(selectedInvite.id, 'rejected');
      }

      // Remover o convite da lista
      setEnrichedInvites(prevInvites => 
        prevInvites.filter(invite => invite.id !== selectedInvite.id)
      );

      // Log de sucesso
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.INFO, 'Invite rejected successfully', {
        inviteId: selectedInvite.id
      });
    } catch (error) {
      // Log de erro
      coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to reject invite', {
        inviteId: selectedInvite.id,
        error: error.message
      });
    } finally {
      // Limpar estado
      setProcessingInviteId(null);
      setSelectedInvite(null);
    }
  };

  /**
   * Renderiza um item de convite individual na lista
   * @param {Object} invite - Convite a ser renderizado
   * @returns {React.ReactElement} Item de convite renderizado
   */
  const renderInviteItem = (invite) => {
    const isLoading = loadingStates[invite.id] || processingInviteId === invite.id;
    
    // Formatar a data
    const formatDate = (date) => {
      if (!date) return '';
      
      // Verificar se é um timestamp do Firestore
      if (date._seconds) {
        const dateObj = new Date(date._seconds * 1000 + (date._nanoseconds || 0) / 1000000);
        return dateObj.toLocaleDateString();
      }
      
      // Caso contrário, tratar como data normal
      return new Date(date).toLocaleDateString();
    };
    
    // Obter o remetente
    const sender = invite.senderName || invite.from || t('inviteRequest.unknownSender');
    
    // Determinar a cor do card baseado no estado do convite
    let bgColor = 'background.paper';
    if (invite.error) {
      bgColor = 'error.lighter'; // Cor suave para indicar erro
    } else if (invite.dataMissing) {
      bgColor = 'warning.lighter'; // Cor suave para indicar dados incompletos
    }
    
    return (
      <ListItem 
        sx={{ 
          bgcolor: bgColor, 
          mb: 1,
          borderRadius: 1,
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'action.hover',
          }
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ 
            bgcolor: invite.error ? 'error.light' : invite.dataMissing ? 'warning.light' : 'primary.light' 
          }}>
            {invite.caixinhaNome ? invite.caixinhaNome.charAt(0).toUpperCase() : 'C'}
          </Avatar>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Typography variant="subtitle1" component="div">
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="span">
                  {invite.caixinhaNome}
                </Box>
                {invite.contribuicaoMensal !== null && (
                  <Chip 
                    size="small" 
                    label={formatCurrency(invite.contribuicaoMensal || 0)}
                    sx={{ ml: 1 }}
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {invite.error && (
                  <Chip 
                    size="small" 
                    label={t('inviteRequest.errorLoading')}
                    sx={{ ml: 1 }}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            </Typography>
          }
          secondary={
            <Typography component="div" variant="body2">
              <Box component="span" sx={{ display: 'block' }}>
                <Typography variant="body2" component="span" color="text.secondary">
                  {t('inviteRequest.from')}: {sender}
                </Typography>
              </Box>
              <Box component="span" sx={{ display: 'block' }}>
                <Typography variant="caption" component="span" color="text.secondary">
                  {formatDate(invite.createdAt)}
                </Typography>
                {invite.errorMessage && (
                  <Typography 
                    variant="caption" 
                    component="div" 
                    color="error"
                    sx={{ mt: 0.5 }}
                  >
                    {invite.errorMessage}
                  </Typography>
                )}
              </Box>
            </Typography>
          }
        />
        
        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={t('inviteRequest.viewDetails')}>
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => {
                  setSelectedInvite(invite);
                  setDetailDialogOpen(true);
                }}
                sx={{ mr: 1 }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('inviteRequest.accept')}>
              <IconButton 
                size="small" 
                color="success"
                onClick={() => handleConfirmAction('accept', invite)}
                sx={{ mr: 1 }}
              >
                <AcceptIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('inviteRequest.reject')}>
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleConfirmAction('reject', invite)}
              >
                <RejectIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </ListItem>
    );
  };

  // Lista de convites ordenada de acordo com as preferências do usuário
  const sortedInvites = useMemo(() => {
    // Clone para evitar modificar o array original
    const sortableInvites = [...enrichedInvites];
    
    return sortableInvites.sort((a, b) => {
      // Se algum dos convites estiver em processamento, ele deve aparecer primeiro
      if (processingInviteId === a.id) return -1;
      if (processingInviteId === b.id) return 1;
      
      let result = 0;
      
      // Aplica a ordenação de acordo com o campo selecionado
      switch (sortBy) {
        case 'date':
          // Converte para timestamp para comparação
          // Os dados de createdAt vêm em formato Firestore ({_seconds, _nanoseconds})
          const getTimestamp = (date) => {
            if (date?._seconds) {
              return date._seconds * 1000 + (date._nanoseconds || 0) / 1000000;
            }
            return new Date(date || 0).getTime();
          };
          
          const dateA = getTimestamp(a.createdAt);
          const dateB = getTimestamp(b.createdAt);
          result = dateA - dateB;
          break;
          
        case 'name':
          const nameA = a.caixinhaNome || '';
          const nameB = b.caixinhaNome || '';
          result = nameA.localeCompare(nameB);
          break;
          
        case 'contribution':
          const contribA = a.contribuicaoMensal || 0;
          const contribB = b.contribuicaoMensal || 0;
          result = contribA - contribB;
          break;
          
        default:
          result = 0;
      }
      
      // Inverte a ordem se a direção for descendente
      return sortDirection === 'asc' ? result : -result;
    });
  }, [enrichedInvites, sortBy, sortDirection, processingInviteId]);

  // Se não há convites para exibir
  if (invites.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography color="text.secondary">
          {t('inviteRequest.noInvites')}
        </Typography>
      </Box>
    );
  }

  // Exibe indicador de carregamento enquanto os convites estão sendo enriquecidos
  if (enrichedInvites.length === 0 && invites.length > 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t('inviteRequest.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Controles de ordenação */}
      {sortedInvites.length > 1 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {t('inviteRequest.sortBy')}:
          </Typography>

          <Button
            size="small"
            variant={sortBy === 'date' ? 'contained' : 'outlined'}
            onClick={() => setSortBy('date')}
            sx={{ mr: 1 }}
          >
            {t('inviteRequest.date')}
          </Button>

          <Button
            size="small"
            variant={sortBy === 'name' ? 'contained' : 'outlined'}
            onClick={() => setSortBy('name')}
            sx={{ mr: 1 }}
          >
            {t('inviteRequest.name')}
          </Button>

          <Button
            size="small"
            variant={sortBy === 'contribution' ? 'contained' : 'outlined'}
            onClick={() => setSortBy('contribution')}
            sx={{ mr: 1 }}
          >
            {t('inviteRequest.contribution')}
          </Button>

          <Tooltip title={t('inviteRequest.toggleSortDirection')}>
            <IconButton onClick={toggleSortDirection} size="small">
              <SortIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Lista de convites */}
      <List disablePadding>
        {sortedInvites.map((invite) => (
          <React.Fragment key={invite.id}>
            {renderInviteItem(invite)}
          </React.Fragment>
        ))}
      </List>

      {/* Diálogo de detalhes */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('inviteRequest.inviteDetails')}
        </DialogTitle>

        <DialogContent>
          {selectedInvite && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedInvite.caixinhaNome || t('inviteRequest.unknownCaixinha')}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" paragraph>
                <strong>{t('inviteRequest.from')}:</strong> {selectedInvite.senderName || selectedInvite.from || t('inviteRequest.unknownSender')}
              </Typography>

              <Typography variant="body2" paragraph>
                <strong>{t('inviteRequest.message')}:</strong> {selectedInvite.message || t('inviteRequest.noMessage')}
              </Typography>

              <Typography variant="body2" paragraph>
                <strong>{t('inviteRequest.contribuicao')}:</strong> {formatCurrency(selectedInvite.contribuicaoMensal || 0)}
              </Typography>

              {selectedInvite.caixinhaDetails?.descricao && (
                <Typography variant="body2" paragraph>
                  <strong>{t('inviteRequest.description')}:</strong> {selectedInvite.caixinhaDetails.descricao}
                </Typography>
              )}

              <Typography variant="body2">
                <strong>{t('inviteRequest.date')}:</strong> {new Date(selectedInvite.createdAt || selectedInvite.timestamp || Date.now()).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            {t('common.close')}
          </Button>
          <Button
            color="success"
            variant="contained"
            onClick={() => {
              setDetailDialogOpen(false);
              handleConfirmAction('accept', selectedInvite);
            }}
          >
            {t('inviteRequest.accept')}
          </Button>
          <Button
            color="error"
            variant="outlined"
            onClick={() => {
              setDetailDialogOpen(false);
              handleConfirmAction('reject', selectedInvite);
            }}
          >
            {t('inviteRequest.reject')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>
          {confirmAction === 'accept'
            ? t('inviteRequest.confirmAccept')
            : t('inviteRequest.confirmReject')}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {confirmAction === 'accept'
              ? t('inviteRequest.confirmAcceptMessage', {
                  caixinha: selectedInvite?.caixinhaNome || t('inviteRequest.thisCaixinha')
                })
              : t('inviteRequest.confirmRejectMessage')}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={confirmAction === 'accept' ? handleAcceptInvite : handleRejectInvite}
            color={confirmAction === 'accept' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {confirmAction === 'accept' ? t('inviteRequest.accept') : t('inviteRequest.reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaixinhaInviteRequest;