import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import {
  ConfirmationNumber as TicketIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Gavel as DrawIcon,
  Verified as VerifiedIcon,
  EmojiEvents as PrizeIcon,
  Groups as MembersIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRifa } from '../../providers/RifaProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';

const RifaDetailsDialog = ({ open, onClose, caixinhaId, rifaId }) => {
  const { t } = useTranslation();
  const { 
    getRifaById, 
    verifyAuthenticity, 
    performDraw,
    loading, 
    error 
  } = useRifa();
  
  // Obter os membros da caixinha usando o CaixinhaProvider
  const { getMembers, members, loading: membersLoading } = useCaixinha();
  
  const [rifa, setRifa] = useState(null);
  const [authenticity, setAuthenticity] = useState(null);
  const [showVerification, setShowVerification] = useState(false);

  // Buscar rifa e membros ao abrir o diálogo
  useEffect(() => {
    if (open && rifaId) {
      // Buscar dados da rifa
      const fetchRifa = async () => {
        try {
          const rifaData = await getRifaById(caixinhaId, rifaId);
          setRifa(rifaData);
        } catch (err) {
          console.error('Erro ao buscar detalhes da rifa:', err);
        }
      };
      
      fetchRifa();
      
      // Buscar membros da caixinha
      getMembers(caixinhaId);
    }
  }, [rifaId, caixinhaId, open, getMembers]);

  // Processar membros para fácil acesso
  const membersMap = useMemo(() => {
    if (!members) return {};
    
    return members.reduce((acc, member) => {
      // O ID a ser usado como chave precisa corresponder ao membroId dos bilhetes
      // Como mostrado nos dados, userId é provavelmente a chave correta
      const memberId = member.userId || member.id;
      
      acc[memberId] = {
        id: memberId,
        nome: member.nome || member.name,
        email: member.email,
        isAdmin: Boolean(member.isAdmin || member.role === 'admin'),
        fotoPerfil: member.fotoDoPerfil || member.fotoPerfil || member.photoURL
      };
      return acc;
    }, {});
  }, [members]);

  // Função para obter estatísticas de membros com mais bilhetes
  const memberStats = useMemo(() => {
    if (!rifa?.bilhetesVendidos) return [];
    
    // Contar bilhetes por membro
    const statsByMember = {};
    rifa.bilhetesVendidos.forEach(bilhete => {
      if (!statsByMember[bilhete.membroId]) {
        statsByMember[bilhete.membroId] = {
          membroId: bilhete.membroId,
          quantidadeBilhetes: 0,
          bilhetes: []
        };
      }
      statsByMember[bilhete.membroId].quantidadeBilhetes += 1;
      statsByMember[bilhete.membroId].bilhetes.push(bilhete.numero);
    });
    
    // Converter para array e ordenar por quantidade
    return Object.values(statsByMember)
      .sort((a, b) => b.quantidadeBilhetes - a.quantidadeBilhetes);
  }, [rifa?.bilhetesVendidos]);

  const handleVerifyAuthenticity = async () => {
    try {
      const result = await verifyAuthenticity(caixinhaId, rifaId);
      setAuthenticity(result);
      setShowVerification(true);
    } catch (err) {
      console.error('Erro ao verificar autenticidade:', err);
    }
  };

  const handlePerformDraw = async () => {
    try {
      await performDraw(rifaId, rifa.sorteioMetodo, rifa.sorteioReferencia);
      // Recarregar a rifa para mostrar o resultado
      const updatedRifa = await getRifaById(caixinhaId, rifaId);
      setRifa(updatedRifa);
    } catch (err) {
      console.error('Erro ao realizar sorteio:', err);
    }
  };

  // Renderizar bilhete com informações aprimoradas do membro
  const renderBilhete = (bilhete) => {
    const membro = membersMap[bilhete.membroId] || {};
    const isWinner = rifa.sorteioResultado?.numeroSorteado === bilhete.numero;
    
    return (
      <ListItem 
        key={bilhete.numero}
        sx={{
          bgcolor: isWinner ? 'success.light' : 'inherit',
          borderRadius: 1,
          mb: 1,
          border: '1px solid',
          borderColor: isWinner ? 'success.main' : 'divider'
        }}
      >
        <ListItemAvatar>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isWinner ? (
                <Tooltip title={t('rifas.winner')}>
                  <PrizeIcon color="warning" fontSize="small" />
                </Tooltip>
              ) : null
            }
          >
            <Avatar 
              src={membro.fotoPerfil} 
              sx={{ 
                bgcolor: membro.fotoPerfil ? 'transparent' : 'primary.main',
                border: isWinner ? '2px solid' : 'none',
                borderColor: 'warning.main'
              }}
            >
              {!membro.fotoPerfil && <PersonIcon />}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                icon={<TicketIcon />} 
                label={`#${bilhete.numero}`}
                color={isWinner ? "success" : "primary"}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="subtitle2">
                {membro.nome || bilhete.membroId}
              </Typography>
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {new Date(bilhete.dataCompra).toLocaleString('pt-BR')}
              </Typography>
            </Box>
          }
        />
      </ListItem>
    );
  };

  if (!rifa && open) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {rifa?.nome}
            </Typography>
            <Chip 
              label={t(`rifas.status.${rifa?.status.toLowerCase()}`)}
              color={
                rifa?.status === 'ABERTA' ? 'success' : 
                rifa?.status === 'FINALIZADA' ? 'primary' : 'error'
              }
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
          <Chip 
            icon={<TicketIcon />}
            label={t('rifas.ticketsInfo', { 
              sold: rifa?.bilhetesVendidos?.length || 0, 
              total: rifa?.quantidadeBilhetes 
            })}
            variant="outlined"
            color="primary"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {rifa && (
          <Box>
            <Typography variant="body1" paragraph>
              {rifa.descricao}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('rifas.details')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.ticketPrice')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(rifa.valorBilhete)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.totalValue')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(rifa.valorBilhete * (rifa.bilhetesVendidos?.length || 0))}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.endDate')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(rifa.dataFim).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.drawDate')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(rifa.sorteioData).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.prize')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {rifa.premio}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.drawMethod')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {t(`rifas.drawMethod.${rifa.sorteioMetodo.toLowerCase()}`)}
                        {rifa.sorteioReferencia && ` (${rifa.sorteioReferencia})`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                {rifa.status === 'FINALIZADA' && rifa.sorteioResultado && (
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('rifas.drawResult')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                      <Typography variant="h2" color="primary" fontWeight="bold">
                        {rifa.sorteioResultado.numeroSorteado}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.winningNumber')}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {rifa.sorteioResultado.bilheteVencedor ? (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('rifas.winner')}:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {membersMap[rifa.sorteioResultado.bilheteVencedor.membroId] ? (
                            <>
                              <Avatar 
                                src={membersMap[rifa.sorteioResultado.bilheteVencedor.membroId].fotoPerfil}
                                sx={{ bgcolor: 'success.main', mr: 1 }}
                              >
                                {!membersMap[rifa.sorteioResultado.bilheteVencedor.membroId].fotoPerfil && <PersonIcon />}
                              </Avatar>
                              <Typography>
                                {membersMap[rifa.sorteioResultado.bilheteVencedor.membroId].nome}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                                <PersonIcon />
                              </Avatar>
                              <Typography>
                                {rifa.sorteioResultado.bilheteVencedor.membroId}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Alert severity="info">
                        {t('rifas.noWinner')}
                      </Alert>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleVerifyAuthenticity}
                        startIcon={<VerifiedIcon />}
                        fullWidth
                      >
                        {t('rifas.verifyAuthenticity')}
                      </Button>
                    </Box>
                  </Paper>
                )}
                
                {rifa.status === 'ABERTA' && new Date() >= new Date(rifa.sorteioData) && (
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('rifas.performDraw')}
                    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {t('rifas.drawInfo')}
                    </Alert>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePerformDraw}
                      startIcon={<DrawIcon />}
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? t('rifas.processing') : t('rifas.performDraw')}
                    </Button>
                  </Paper>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TicketIcon sx={{ mr: 1 }} />
                    {t('rifas.soldTicketsList')}
                  </Typography>
                  
                  {rifa.bilhetesVendidos?.length === 0 ? (
                    <Alert severity="info">
                      {t('rifas.noSoldTickets')}
                    </Alert>
                  ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {rifa.bilhetesVendidos.sort((a, b) => a.numero - b.numero).map(renderBilhete)}
                    </List>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <MembersIcon sx={{ mr: 1 }} />
                    {t('rifas.participantsStats')}
                  </Typography>
                  
                  {memberStats.length === 0 ? (
                    <Alert severity="info">
                      {t('rifas.noParticipants')}
                    </Alert>
                  ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {memberStats.map(stat => {
                        const membro = membersMap[stat.membroId] || {};
                        
                        return (
                          <ListItem key={stat.membroId} sx={{ mb: 1 }}>
                            <ListItemAvatar>
                              <Avatar 
                                src={membro.fotoPerfil}
                                sx={{ bgcolor: membro.fotoPerfil ? 'transparent' : 'primary.main' }}
                              >
                                {!membro.fotoPerfil && <PersonIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2">
                                  {membro.nome || stat.membroId}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" component="span">
                                    {t('rifas.ticketsCount', { count: stat.quantidadeBilhetes })}
                                  </Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    {stat.bilhetes.sort((a, b) => a - b).map(numero => (
                                      <Chip
                                        key={numero}
                                        label={numero}
                                        size="small"
                                        color={rifa.sorteioResultado?.numeroSorteado === numero ? "success" : "default"}
                                        sx={{ mr: 0.5, mb: 0.5 }}
                                      />
                                    ))}
                                  </Box>
                                </>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Paper>
                
                {showVerification && authenticity && (
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('rifas.authenticityVerification')}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('rifas.integrityCheck')}:
                        </Typography>
                        <Chip
                          icon={authenticity.integridadeOk ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={authenticity.integridadeOk ? t('rifas.passed') : t('rifas.failed')}
                          color={authenticity.integridadeOk ? 'success' : 'error'}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('rifas.externalSourceCheck')}:
                        </Typography>
                        <Chip
                          icon={authenticity.fonteExternaOk ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={authenticity.fonteExternaOk ? t('rifas.passed') : t('rifas.failed')}
                          color={authenticity.fonteExternaOk ? 'success' : 'error'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          {t('rifas.verificationDate')}:
                        </Typography>
                        <Typography variant="body1">
                          {new Date(authenticity.dataVerificacao).toLocaleString('pt-BR')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RifaDetailsDialog;