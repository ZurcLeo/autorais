import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Gavel as GavelIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispute } from '../../providers/DisputeProvider';
import { useToast } from '../../providers/ToastProvider';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DisputeVotingCard = ({ 
  dispute, 
  caixinha, 
  currentUserId, 
  onViewDetails,
  compact = false 
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { voteOnDispute } = useDispute();
  
  const [expanded, setExpanded] = useState(false);
  const [voting, setVoting] = useState(false);

  const handleQuickVote = async (approve) => {
    setVoting(true);
    try {
      await voteOnDispute(
        caixinha.id, 
        dispute.id, 
        approve, 
        '' // Quick vote without comment
      );
      
      showToast(
        approve ? 'Voto de aprovação registrado!' : 'Voto de rejeição registrado!', 
        { type: 'success' }
      );
    } catch (error) {
      console.error('Error voting:', error);
      showToast('Erro ao registrar voto', { type: 'error' });
    } finally {
      setVoting(false);
    }
  };

  const calculateVoteStats = () => {
    if (!dispute.votes || !caixinha.membros) {
      return { progress: 0, approvals: 0, rejections: 0, total: 0, totalMembers: 0, eligibleVoters: 0, pending: 0 };
    }

    const allMembers = caixinha.membros.length;
    const votes = dispute.votes;
    const approvals = votes.filter(vote => vote.vote === true).length;
    const rejections = votes.filter(vote => vote.vote === false).length;
    
    // Para disputas de empréstimo, o solicitante não pode votar
    const proposedBy = dispute.proposedBy;
    const eligibleVoters = dispute.type === 'LOAN_APPROVAL' && proposedBy 
      ? allMembers - 1  // Excluir o solicitante
      : allMembers;
    
    const progress = eligibleVoters > 0 ? (votes.length / eligibleVoters) * 100 : 0;
    const pending = Math.max(0, eligibleVoters - votes.length);

    return { 
      progress, 
      approvals, 
      rejections, 
      total: votes.length, 
      totalMembers: allMembers,
      eligibleVoters,
      pending
    };
  };

  const hasUserVoted = () => {
    return dispute.votes?.some(vote => vote.userId === currentUserId);
  };

  const getUserVote = () => {
    return dispute.votes?.find(vote => vote.userId === currentUserId);
  };

  const getDisputeTypeLabel = (type) => {
    const typeLabels = {
      'LOAN_APPROVAL': 'Empréstimo',
      'RULE_CHANGE': 'Regras',
      'MEMBER_REMOVAL': 'Membro',
      'FUND_ALLOCATION': 'Fundos'
    };
    return typeLabels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'primary',
      'APPROVED': 'success',
      'REJECTED': 'error',
      'CANCELLED': 'warning',
      'EXPIRED': 'default'
    };
    return colors[status] || 'default';
  };

  const voteStats = calculateVoteStats();
  const userVoted = hasUserVoted();
  const userVote = getUserVote();

  if (compact) {
    return (
      <Card 
        sx={{ 
          mb: 1, 
          borderLeft: '3px solid',
          borderLeftColor: theme => theme.palette[getStatusColor(dispute.status)]?.main || theme.palette.grey[400]
        }}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                <Chip 
                  size="small" 
                  label={getDisputeTypeLabel(dispute.type)}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={dispute.status}
                  color={getStatusColor(dispute.status)}
                />
              </Box>
              <Typography variant="body2" noWrap>
                {dispute.title || `Disputa #${dispute.id?.substring(0, 8)}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {voteStats.total} de {voteStats.eligibleVoters} votos • {Math.round(voteStats.progress)}%
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {dispute.status === 'OPEN' && !userVoted && dispute.proposedBy !== currentUserId && (
                <ButtonGroup size="small" variant="outlined">
                  <Button
                    onClick={() => handleQuickVote(true)}
                    disabled={voting}
                    sx={{ minWidth: 32, px: 1 }}
                  >
                    {voting ? <CircularProgress size={16} /> : <ApproveIcon fontSize="small" />}
                  </Button>
                  <Button
                    onClick={() => handleQuickVote(false)}
                    disabled={voting}
                    sx={{ minWidth: 32, px: 1 }}
                  >
                    {voting ? <CircularProgress size={16} /> : <RejectIcon fontSize="small" />}
                  </Button>
                </ButtonGroup>
              )}
              
              <IconButton 
                size="small" 
                onClick={() => onViewDetails?.(dispute)}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {userVoted && (
            <Alert 
              severity={userVote?.vote ? 'success' : 'error'} 
              sx={{ mt: 1, py: 0 }}
            >
              <Typography variant="caption">
                Você {userVote?.vote ? 'aprovou' : 'rejeitou'} esta disputa
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: '4px solid',
        borderLeftColor: theme => theme.palette[getStatusColor(dispute.status)]?.main || theme.palette.grey[400]
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {dispute.title || `Disputa #${dispute.id?.substring(0, 8)}`}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip 
                size="small" 
                label={getDisputeTypeLabel(dispute.type)}
                color="primary"
                variant="outlined"
              />
              <Chip
                size="small"
                label={dispute.status}
                color={getStatusColor(dispute.status)}
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              Criada {formatDistanceToNow(new Date(dispute.createdAt), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ViewIcon />}
              onClick={() => onViewDetails?.(dispute)}
            >
              Detalhes
            </Button>
            
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Vote Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Progresso da Votação
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {voteStats.total} de {voteStats.eligibleVoters} votos ({Math.round(voteStats.progress)}%)
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={voteStats.progress} 
            sx={{ height: 6, borderRadius: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="success.main">
              ✓ {voteStats.approvals} aprovações
            </Typography>
            <Typography variant="caption" color="error.main">
              ✗ {voteStats.rejections} rejeições
            </Typography>
          </Box>
        </Box>

        {/* User Vote Status or Quick Vote */}
        {userVoted ? (
          <Alert 
            severity={userVote?.vote ? 'success' : 'error'} 
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2">
              Você {userVote?.vote ? 'aprovou' : 'rejeitou'} esta disputa
            </Typography>
            {userVote?.comment && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Comentário: "{userVote.comment}"
              </Typography>
            )}
          </Alert>
        ) : dispute.status === 'OPEN' && dispute.proposedBy !== currentUserId ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <GavelIcon sx={{ mr: 1, fontSize: 20 }} />
              Votação Rápida
            </Typography>
            
            <ButtonGroup fullWidth variant="contained" disabled={voting}>
              <Button
                color="success"
                startIcon={voting ? <CircularProgress size={20} /> : <ApproveIcon />}
                onClick={() => handleQuickVote(true)}
                disabled={voting}
              >
                Aprovar
              </Button>
              <Button
                color="error"
                startIcon={voting ? <CircularProgress size={20} /> : <RejectIcon />}
                onClick={() => handleQuickVote(false)}
                disabled={voting}
              >
                Rejeitar
              </Button>
            </ButtonGroup>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              Clique em "Detalhes" para adicionar comentários ao seu voto
            </Typography>
          </Box>
        ) : dispute.status === 'OPEN' && dispute.proposedBy === currentUserId ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              Você é o solicitante desta disputa
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Você não pode votar na própria solicitação para evitar conflito de interesse.
            </Typography>
          </Alert>
        ) : null}

        {/* Expandable Content */}
        <Collapse in={expanded}>
          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {dispute.description}
            </Typography>
            
            {dispute.type === 'LOAN_APPROVAL' && dispute.proposedChanges?.loan && (
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Detalhes do Empréstimo:
                </Typography>
                <Typography variant="body2">
                  <strong>Valor:</strong> R$ {dispute.proposedChanges.loan.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2">
                  <strong>Parcelas:</strong> {dispute.proposedChanges.loan.parcelas}x
                </Typography>
                <Typography variant="body2">
                  <strong>Motivo:</strong> {dispute.proposedChanges.loan.motivo}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default DisputeVotingCard;