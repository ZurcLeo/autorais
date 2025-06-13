import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Gavel as GavelIcon,
  HowToVote as VoteIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispute } from '../../providers/DisputeProvider';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DisputeManagement = ({ caixinha }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDispute, setSelectedDispute] = useState(null);
  
  const {
    disputes,
    activeDisputes,
    resolvedDisputes,
    loanDisputes,
    loading,
    error,
    getDisputes,
    voteOnDispute,
    serviceReady
  } = useDispute();

  useEffect(() => {
    if (caixinha?.id && serviceReady) {
      getDisputes(caixinha.id, 'all');
    }
  }, [caixinha, serviceReady, getDisputes]);

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

  const getDisputeStatusIcon = (status) => {
    const statusIcons = {
      'OPEN': <PendingIcon />,
      'APPROVED': <ApprovedIcon />,
      'REJECTED': <RejectedIcon />,
      'CANCELLED': <Cancel />,
      'EXPIRED': <Schedule />
    };
    return statusIcons[status] || <Schedule />;
  };

  const getDisputeTypeLabel = (type) => {
    const typeLabels = {
      'LOAN_APPROVAL': 'Aprovação de Empréstimo',
      'RULE_CHANGE': 'Alteração de Regras',
      'MEMBER_REMOVAL': 'Remoção de Membro',
      'FUND_ALLOCATION': 'Alocação de Fundos'
    };
    return typeLabels[type] || type;
  };

  const calculateVoteProgress = (dispute) => {
    if (!dispute.votes || !caixinha.membros) return 0;
    const totalMembers = caixinha.membros.length;
    const totalVotes = dispute.votes.length;
    return (totalVotes / totalMembers) * 100;
  };

  const hasUserVoted = (dispute, userId) => {
    return dispute.votes?.some(vote => vote.userId === userId);
  };

  const DisputeCard = ({ dispute }) => {
    const voteProgress = calculateVoteProgress(dispute);
    const userVoted = hasUserVoted(dispute, caixinha.currentUserId);
    
    return (
      <Card 
        sx={{ 
          mb: 2, 
          borderLeft: `4px solid`,
          borderLeftColor: theme => theme.palette[getDisputeStatusColor(dispute.status)]?.main || theme.palette.grey[400]
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {dispute.title || `Disputa #${dispute.id?.substring(0, 8)}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {dispute.description}
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
                  color={getDisputeStatusColor(dispute.status)}
                  icon={getDisputeStatusIcon(dispute.status)}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Criada {formatDistanceToNow(new Date(dispute.createdAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Tooltip title="Ver detalhes">
                <IconButton 
                  onClick={() => setSelectedDispute(dispute)}
                  size="small"
                >
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              
              {dispute.status === 'OPEN' && !userVoted && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<VoteIcon />}
                  onClick={() => setSelectedDispute(dispute)}
                  sx={{ minWidth: 80 }}
                >
                  Votar
                </Button>
              )}
              
              {userVoted && (
                <Chip 
                  size="small" 
                  label="Votado" 
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {dispute.status === 'OPEN' && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Progresso da Votação
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dispute.votes?.length || 0} de {caixinha.membros?.length || 0} votos
                </Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6 }}>
                <Box
                  sx={{
                    width: `${voteProgress}%`,
                    bgcolor: 'primary.main',
                    height: '100%',
                    borderRadius: 1,
                    transition: 'width 0.3s ease'
                  }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const getFilteredDisputes = () => {
    switch (activeTab) {
      case 0: return activeDisputes || [];
      case 1: return loanDisputes || [];
      case 2: return resolvedDisputes || [];
      default: return disputes || [];
    }
  };

  if (!caixinha.permiteEmprestimos && activeTab === 1) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Alert severity="info">
          <Typography variant="h6">
            Disputas de Empréstimo Não Habilitadas
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Esta caixinha não permite empréstimos, portanto não há disputas de aprovação de empréstimo.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <GavelIcon sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h5">
          Gerenciamento de Disputas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ px: 3, pt: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'medium',
                minWidth: 120,
              }
            }}
          >
            <Tab 
              icon={<PendingIcon />} 
              label={`Ativas (${activeDisputes?.length || 0})`}
              iconPosition="start"
            />
            <Tab 
              icon={<VoteIcon />} 
              label={`Empréstimos (${loanDisputes?.length || 0})`}
              iconPosition="start"
            />
            <Tab 
              icon={<ApprovedIcon />} 
              label={`Resolvidas (${resolvedDisputes?.length || 0})`}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {getFilteredDisputes().length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <GavelIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {activeTab === 0 && 'Nenhuma disputa ativa'}
                    {activeTab === 1 && 'Nenhuma disputa de empréstimo'}
                    {activeTab === 2 && 'Nenhuma disputa resolvida'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {activeTab === 0 && 'Quando houver disputas pendentes, elas aparecerão aqui'}
                    {activeTab === 1 && 'Disputas de aprovação de empréstimo aparecerão aqui'}
                    {activeTab === 2 && 'Disputas concluídas aparecerão aqui'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={0}>
                  {getFilteredDisputes().map((dispute) => (
                    <Grid item xs={12} key={dispute.id}>
                      <DisputeCard dispute={dispute} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default DisputeManagement;