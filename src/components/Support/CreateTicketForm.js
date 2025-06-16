import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Send as SendIcon } from '@mui/icons-material';
import { useSupport } from '../../providers/SupportProvider';
import { useAuth } from '../../providers/AuthProvider';

const SUPPORT_CATEGORIES = {
  financial: {
    label: 'Financeiro',
    icon: '💰',
    modules: {
      payment: 'Pagamentos',
      wallet: 'Carteira',
      transaction: 'Transações',
      pix: 'PIX',
      banking: 'Bancário'
    },
    issueTypes: {
      payment_failed: 'Pagamento falhou',
      payment_pending: 'Pagamento pendente',
      wrong_amount: 'Valor incorreto',
      refund_request: 'Solicitação de reembolso',
      balance_error: 'Erro no saldo',
      pix_error: 'Erro no PIX'
    }
  },
  caixinha: {
    label: 'Caixinha',
    icon: '🏦',
    modules: {
      contribution: 'Contribuições',
      withdrawal: 'Saques',
      management: 'Gerenciamento',
      member: 'Membros'
    },
    issueTypes: {
      cant_contribute: 'Não consigo contribuir',
      cant_withdraw: 'Não consigo sacar',
      wrong_calculation: 'Cálculo incorreto',
      member_issue: 'Problema com membro',
      access_denied: 'Acesso negado'
    }
  },
  loan: {
    label: 'Empréstimos',
    icon: '💳',
    modules: {
      request: 'Solicitação',
      payment: 'Pagamento',
      status: 'Status'
    },
    issueTypes: {
      loan_denied: 'Empréstimo negado',
      payment_issue: 'Problema no pagamento',
      status_error: 'Erro no status',
      interest_question: 'Dúvida sobre juros'
    }
  },
  account: {
    label: 'Conta',
    icon: '👤',
    modules: {
      profile: 'Perfil',
      settings: 'Configurações',
      verification: 'Verificação'
    },
    issueTypes: {
      cant_login: 'Não consigo fazer login',
      profile_error: 'Erro no perfil',
      verification_failed: 'Verificação falhou',
      settings_not_saving: 'Configurações não salvam'
    }
  },
  technical: {
    label: 'Técnico',
    icon: '🔧',
    modules: {
      app: 'Aplicativo',
      website: 'Site',
      performance: 'Performance'
    },
    issueTypes: {
      app_crash: 'App travou',
      slow_loading: 'Carregamento lento',
      feature_not_working: 'Funcionalidade não funciona',
      sync_error: 'Erro de sincronização'
    }
  },
  security: {
    label: 'Segurança',
    icon: '🔒',
    modules: {
      account: 'Conta',
      suspicious: 'Atividade suspeita',
      data: 'Dados'
    },
    issueTypes: {
      suspicious_activity: 'Atividade suspeita',
      account_compromised: 'Conta comprometida',
      data_concern: 'Preocupação com dados',
      unauthorized_access: 'Acesso não autorizado'
    }
  },
  general: {
    label: 'Geral',
    icon: '💬',
    modules: {
      question: 'Dúvida',
      suggestion: 'Sugestão',
      complaint: 'Reclamação'
    },
    issueTypes: {
      general_question: 'Dúvida geral',
      feature_request: 'Solicitação de funcionalidade',
      feedback: 'Feedback',
      other: 'Outro'
    }
  }
};

const CreateTicketForm = ({ open, onClose, initialCategory, initialContext }) => {
  const { createTicket, isLoading, error, clearError } = useSupport();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    category: initialCategory || '',
    module: '',
    issueType: '',
    title: '',
    description: '',
    context: initialContext || {},
    deviceInfo: {}
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (open && initialCategory) {
      setFormData(prev => ({
        ...prev,
        category: initialCategory,
        context: initialContext || {}
      }));
    }
  }, [open, initialCategory, initialContext]);

  useEffect(() => {
    if (open) {
      collectDeviceInfo();
      clearError();
    }
  }, [open, clearError]);

  const collectDeviceInfo = () => {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      deviceInfo
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.category) {
      errors.category = 'Categoria é obrigatória';
    }

    if (!formData.title || formData.title.trim().length < 5) {
      errors.title = 'Título deve ter pelo menos 5 caracteres';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Descrição deve ter pelo menos 10 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        module: '',
        issueType: ''
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const ticketData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      await createTicket(ticketData);
      
      onClose();
      
      setFormData({
        category: '',
        module: '',
        issueType: '',
        title: '',
        description: '',
        context: {},
        deviceInfo: {}
      });
      setValidationErrors({});
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setFormData({
        category: '',
        module: '',
        issueType: '',
        title: '',
        description: '',
        context: {},
        deviceInfo: {}
      });
      setValidationErrors({});
      clearError();
    }
  };

  const selectedCategory = SUPPORT_CATEGORIES[formData.category];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6">
            Criar Ticket de Suporte
          </Typography>
          {selectedCategory && (
            <Chip 
              label={selectedCategory.label}
              color="primary"
              size="small"
              icon={<span>{selectedCategory.icon}</span>}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!validationErrors.category}>
              <InputLabel>Categoria *</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                label="Categoria *"
              >
                {Object.entries(SUPPORT_CATEGORIES).map(([key, category]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.category && (
                <Typography variant="caption" color="error">
                  {validationErrors.category}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {selectedCategory && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Módulo</InputLabel>
                  <Select
                    value={formData.module}
                    onChange={(e) => handleInputChange('module', e.target.value)}
                    label="Módulo"
                  >
                    {Object.entries(selectedCategory.modules).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo do Problema</InputLabel>
                  <Select
                    value={formData.issueType}
                    onChange={(e) => handleInputChange('issueType', e.target.value)}
                    label="Tipo do Problema"
                  >
                    {Object.entries(selectedCategory.issueTypes).map(([key, label]) => (
                      <MenuItem key={key} value={key}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Título *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={!!validationErrors.title}
              helperText={validationErrors.title || 'Descreva o problema em poucas palavras'}
              inputProps={{ maxLength: 100 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrição *"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!validationErrors.description}
              helperText={validationErrors.description || 'Descreva detalhadamente o problema que você está enfrentando'}
              inputProps={{ maxLength: 1000 }}
            />
          </Grid>

          {(formData.context && Object.keys(formData.context).length > 0) && (
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">
                    Contexto Adicional
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(formData.context, null, 2)}
                    </pre>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          <Grid item xs={12}>
            <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">
                  Informações Técnicas
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="textSecondary" paragraph>
                    Essas informações são coletadas automaticamente para ajudar no diagnóstico:
                  </Typography>
                  <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(formData.deviceInfo, null, 2)}
                  </pre>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !formData.category || !formData.title || !formData.description}
          startIcon={<SendIcon />}
        >
          {isLoading ? 'Criando...' : 'Criar Ticket'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicketForm;