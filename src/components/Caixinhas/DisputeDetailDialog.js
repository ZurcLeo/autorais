import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Gavel as GavelIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispute } from '../../providers/DisputeProvider';
import { useUser } from '../../providers/UserProvider';
import { useToast } from '../../providers/ToastProvider';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DisputeDetailDialog = ({ 
  open, 
  onClose, 
  dispute, 
  caixinha,
  currentUserId 
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { voteOnDispute, getDisputeById, loading } = useDispute();
  const { getUserById } = useUser();
  
  const [voteValue, setVoteValue] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [detailedDispute, setDetailedDispute] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [voterProfiles, setVoterProfiles] = useState({});

  useEffect(() => {
    if (open && dispute && caixinha?.id) {
      loadDisputeDetails();
    }
  }, [open, dispute, caixinha]);

  const loadDisputeDetails = async () => {
    try {
      const details = await getDisputeById(caixinha.id, dispute.id);
      setDetailedDispute(details);
    } catch (error) {
      console.error('Error loading dispute details:', error);
      setDetailedDispute(dispute);
    }
  };

  const currentDispute = detailedDispute || dispute;

  // Buscar perfil do criador da disputa
  useEffect(() => {
    if (currentDispute?.proposedBy && open) {
      loadCreatorProfile(currentDispute.proposedBy);
    }
  }, [currentDispute?.proposedBy, open]);

  // Buscar perfis dos votantes
  useEffect(() => {
    if (currentDispute?.votes && open) {
      loadVoterProfiles(currentDispute.votes);
    }
  }, [currentDispute?.votes, open]);

  const loadCreatorProfile = async (userId) => {
    try {
      const profile = await getUserById(userId);
      setCreatorProfile(profile);
    } catch (error) {
      console.error('Error loading creator profile:', error);
      setCreatorProfile(null);
    }
  };

  const loadVoterProfiles = async (votes) => {
    try {
      const profiles = {};
      await Promise.all(
        votes.map(async (vote) => {
          if (vote.userId && !voterProfiles[vote.userId]) {
            try {
              const profile = await getUserById(vote.userId);
              profiles[vote.userId] = profile;
            } catch (error) {
              console.error(`Error loading voter profile for ${vote.userId}:`, error);
              profiles[vote.userId] = {
                nome: vote.userName || `Usuário ${vote.userId.substring(0, 8)}`,
                fotoPerfil: null
              };
            }
          }
        })
      );
      setVoterProfiles(prev => ({ ...prev, ...profiles }));
    } catch (error) {
      console.error('Error loading voter profiles:', error);
    }
  };

  const handleVote = async () => {
    if (!voteValue || !currentDispute) {
      showToast('Selecione uma opção de voto', { type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      await voteOnDispute(
        caixinha.id, 
        currentDispute.id, 
        voteValue === 'approve', 
        comment.trim()
      );
      
      showToast('Voto registrado com sucesso!', { type: 'success' });
      setVoteValue('');
      setComment('');
      loadDisputeDetails(); // Reload to get updated vote counts
    } catch (error) {
      console.error('Error voting on dispute:', error);
      showToast('Erro ao registrar voto', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getDisputeStatusColor = (status) => {
    const statusColors = {
      'OPEN': 'primary',
      'APPROVED': 'success',
      'REJECTED': 'error',
      'CANCELLED': 'warning',
      'EXPIRED': 'default'
    };
    return statusColors[status] || 'default';
  };

  const calculateVoteStats = () => {
    if (!currentDispute?.votes) {
      return { totalVotes: 0, approvals: 0, rejections: 0, progress: 0, quorumMet: false, totalMembers: 0, eligibleVoters: 0, pending: 0 };
    }

    const votes = currentDispute.votes;
    const totalVotes = votes.length;
    const approvals = votes.filter(vote => vote.vote === true).length;
    const rejections = votes.filter(vote => vote.vote === false).length;
    
    // Calcular total de membros - usar diferentes fontes disponíveis
    let allMembers = 0;
    if (caixinha?.membros?.length) {
      allMembers = caixinha.membros.length;
    } else if (caixinha?.totalMembros) {
      allMembers = caixinha.totalMembros;
    } else if (caixinha?.numeroMembros) {
      allMembers = caixinha.numeroMembros;
    } else {
      // Fallback: assumir que há pelo menos os votantes + o solicitante
      const uniqueVoters = new Set(votes.map(vote => vote.userId));
      if (currentDispute.proposedBy) {
        uniqueVoters.add(currentDispute.proposedBy);
      }
      allMembers = Math.max(uniqueVoters.size, 2); // Mínimo de 2 membros
    }
    
    // Para disputas de empréstimo, o solicitante não pode votar
    const proposedBy = currentDispute.proposedBy;
    const eligibleVoters = currentDispute.type === 'LOAN_APPROVAL' && proposedBy 
      ? Math.max(1, allMembers - 1)  // Excluir o solicitante, mínimo 1
      : allMembers;
    
    const progress = eligibleVoters > 0 ? (totalVotes / eligibleVoters) * 100 : 0;
    const pending = Math.max(0, eligibleVoters - totalVotes);
    
    // Regra de maioria simples - pode ser configurada baseada nas regras da caixinha
    const quorumRequired = Math.ceil(eligibleVoters * 0.6); // 60% quorum
    const quorumMet = totalVotes >= quorumRequired;

    return { totalVotes, approvals, rejections, progress, quorumMet, totalMembers: allMembers, eligibleVoters, pending };
  };

  const hasUserVoted = () => {
    return currentDispute?.votes?.some(vote => vote.userId === currentUserId);
  };

  const getUserVote = () => {
    return currentDispute?.votes?.find(vote => vote.userId === currentUserId);
  };

  const renderLoanDetails = () => {
    if (currentDispute?.type !== 'LOAN_APPROVAL' || !currentDispute?.proposedChanges?.loan) {
      return null;
    }

    const loan = currentDispute.proposedChanges.loan;
    
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Detalhes do Empréstimo Solicitado
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Valor Solicitado
              </Typography>
              <Typography variant="h6">
                R$ {loan.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Parcelas
              </Typography>
              <Typography variant="h6">
                {loan.parcelas}x
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Motivo
              </Typography>
              <Typography variant="body1">
                {loan.motivo}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Solicitado por
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={creatorProfile?.fotoDoPerfil || creatorProfile?.fotoPerfil || creatorProfile?.photoURL}
                  alt={creatorProfile?.nome || 'Solicitante'}
                  sx={{ width: 40, height: 40 }}
                >
                  {(creatorProfile?.nome || loan.solicitadoPor?.nome || 'U').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {creatorProfile?.nome || loan.solicitadoPor?.nome || 'Nome não disponível'}
                  </Typography>
                  {creatorProfile?.email && (
                    <Typography variant="caption" color="text.secondary">
                      {creatorProfile.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderVoteHistory = () => {
    if (!currentDispute?.votes || currentDispute.votes.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Nenhum voto registrado ainda
        </Typography>
      );
    }

    return (
      <List dense>
        {currentDispute.votes.map((vote, index) => {
          const voterProfile = voterProfiles[vote.userId];
          const voterName = voterProfile?.nome || vote.userName || `Usuário ${vote.userId?.substring(0, 8)}`;
          const voterPhoto = voterProfile?.fotoDoPerfil || voterProfile?.fotoPerfil || voterProfile?.photoURL;
          
          return (
            <ListItem key={index}>
              <ListItemAvatar>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar 
                    src={voterPhoto}
                    alt={voterName}
                    sx={{ width: 40, height: 40 }}
                  >
                    {voterName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Avatar 
                    sx={{ 
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 20,
                      height: 20,
                      bgcolor: vote.vote ? 'success.main' : 'error.main',
                      border: '2px solid white'
                    }}
                  >
                    {vote.vote ? <ApproveIcon sx={{ fontSize: 12 }} /> : <RejectIcon sx={{ fontSize: 12 }} />}
                  </Avatar>
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {voterName}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={vote.vote ? 'Aprovou' : 'Rejeitou'}
                      color={vote.vote ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {voterProfile?.email && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {voterProfile.email}
                      </Typography>
                    )}
                    {vote.comment && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        "{vote.comment}"
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(vote.timestamp), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  const renderVotingInterface = () => {
    // Verificar se a disputa está aberta e se o usuário ainda não votou
    if (currentDispute?.status !== 'OPEN' || hasUserVoted()) {
      return null;
    }

    // IMPORTANTE: O solicitante não pode votar na própria disputa (conflito de interesse)
    if (currentDispute?.proposedBy === currentUserId) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="subtitle2">
            Você não pode votar na própria solicitação
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Como solicitante desta disputa, você não tem direito a voto para evitar conflito de interesse. 
            Aguarde a decisão dos demais membros da caixinha.
          </Typography>
        </Alert>
      );
    }

    return (
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <GavelIcon sx={{ mr: 1 }} />
            Registrar Voto
          </Typography>
          
          <RadioGroup
            value={voteValue}
            onChange={(e) => setVoteValue(e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel 
              value="approve" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ApproveIcon sx={{ mr: 1, color: 'success.main' }} />
                  Aprovar
                </Box>
              }
            />
            <FormControlLabel 
              value="reject" 
              control={<Radio />} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RejectIcon sx={{ mr: 1, color: 'error.main' }} />
                  Rejeitar
                </Box>
              }
            />
          </RadioGroup>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explique o motivo do seu voto..."
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleVote}
            disabled={!voteValue || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <GavelIcon />}
          >
            {submitting ? 'Registrando Voto...' : 'Confirmar Voto'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const voteStats = calculateVoteStats();
  const userVote = getUserVote();

  if (!currentDispute) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box component="span">
          {currentDispute.title || `Disputa #${currentDispute.id?.substring(0, 8)}`}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loading && !detailedDispute && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {currentDispute && (
          <Box>
            {/* Status and Basic Info */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={currentDispute.type?.replace('_', ' ') || 'Disputa'}
                  color="primary" 
                  variant="outlined"
                />
                <Chip
                  label={currentDispute.status}
                  color={getDisputeStatusColor(currentDispute.status)}
                />
                {currentDispute.createdAt && (
                  <Chip
                    icon={<ScheduleIcon />}
                    label={format(new Date(currentDispute.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {currentDispute.description}
              </Typography>

              {/* Creator Info */}
              {currentDispute.proposedBy && (
                <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.default' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                      Criado por
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={creatorProfile?.fotoDoPerfil || creatorProfile?.fotoPerfil || creatorProfile?.photoURL}
                        alt={creatorProfile?.nome || 'Criador'}
                        sx={{ width: 36, height: 36 }}
                      >
                        {(creatorProfile?.nome || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {creatorProfile?.nome || 'Carregando...'}
                        </Typography>
                        {creatorProfile?.email && (
                          <Typography variant="caption" color="text.secondary">
                            {creatorProfile.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>

            {/* Loan Details for Loan Approval Disputes */}
            {renderLoanDetails()}

            {/* Vote Progress */}
            {currentDispute.status === 'OPEN' && (
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Progresso da Votação
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {voteStats.totalVotes} de {voteStats.eligibleVoters} votos
                      </Typography>
                      <Typography variant="body2">
                        {Math.round(voteStats.progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={voteStats.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {voteStats.approvals}
                        </Typography>
                        <Typography variant="caption">
                          Aprovações
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="error.main">
                          {voteStats.rejections}
                        </Typography>
                        <Typography variant="caption">
                          Rejeições
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="text.secondary">
                          {voteStats.pending}
                        </Typography>
                        <Typography variant="caption">
                          Pendentes
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {voteStats.quorumMet && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Quórum atingido! A votação pode ser encerrada.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User's Vote Status */}
            {userVote && (
              <Alert 
                severity={userVote.vote ? 'success' : 'error'} 
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  Você {userVote.vote ? 'aprovou' : 'rejeitou'} esta disputa
                </Typography>
                {userVote.comment && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Comentário: "{userVote.comment}"
                  </Typography>
                )}
              </Alert>
            )}

            {/* Voting Interface */}
            {renderVotingInterface()}

            {/* Vote History */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Histórico de Votos
              </Typography>
              <Card variant="outlined">
                <CardContent sx={{ p: 0 }}>
                  {renderVoteHistory()}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisputeDetailDialog;