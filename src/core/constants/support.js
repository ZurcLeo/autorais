// src/core/constants/support.js
import React from 'react';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Computer as ComputerIcon,
  AccountBalance as LoanIcon,
  AccessTime,
  Assignment,
  Done,
  Security as SecurityIcon,
  Chat as ChatIcon,
  AccountBalance
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Configurações de Status de Tickets
export const TICKET_STATUS_CONFIG = {
  pending: { 
    label: 'Pendente', 
    color: 'warning', 
    icon: <ScheduleIcon />,
    mui_color: 'warning'
  },
  assigned: { 
    label: 'Em Atendimento', 
    color: 'info', 
    icon: <PersonIcon />,
    mui_color: 'info'
  },
  resolved: { 
    label: 'Resolvido', 
    color: 'success', 
    icon: <CheckCircleIcon />,
    mui_color: 'success'
  },
  closed: { 
    label: 'Fechado', 
    color: 'default', 
    icon: <CheckCircleIcon />,
    mui_color: 'default'
  }
};

// Configurações de Prioridade
export const PRIORITY_CONFIG = {
  low: { 
    label: 'Baixa', 
    color: 'success', 
    icon: <InfoIcon />,
    mui_color: '#4caf50'
  },
  medium: { 
    label: 'Média', 
    color: 'warning', 
    icon: <WarningIcon />,
    mui_color: '#ff9800'
  },
  high: { 
    label: 'Alta', 
    color: 'error', 
    icon: <ErrorIcon />,
    mui_color: '#f44336'
  },
  urgent: { 
    label: 'Urgente', 
    color: 'error', 
    icon: <ErrorIcon />,
    mui_color: '#d32f2f'
  }
};

// Configurações de Categorias
export const CATEGORY_CONFIG = {
  financial: { 
    label: 'Financeiro', 
    icon: '💰', 
    mui_icon: <TrendingUpIcon />,
    color: 'secondary',
    description: 'Questões relacionadas a transações, saldos e movimentações financeiras'
  },
  caixinha: { 
    label: 'Caixinha', 
    icon: '🏦', 
    mui_icon: <AccountBalance />,
    color: 'primary',
    description: 'Assuntos relacionados ao sistema de caixinhas'
  },
  loan: { 
    label: 'Empréstimos', 
    icon: '💳', 
    mui_icon: <LoanIcon />,
    color: 'primary',
    description: 'Questões sobre empréstimos, pagamentos e condições'
  },
  account: { 
    label: 'Conta', 
    icon: '👤', 
    mui_icon: <PersonIcon />,
    color: 'warning',
    description: 'Problemas com perfil, dados pessoais e configurações de conta'
  },
  technical: { 
    label: 'Técnico', 
    icon: '🔧', 
    mui_icon: <ComputerIcon />,
    color: 'info',
    description: 'Problemas técnicos, bugs e funcionalidades do sistema'
  },
  security: { 
    label: 'Segurança', 
    icon: '🔒', 
    mui_icon: <SecurityIcon />,
    color: 'error',
    description: 'Questões de segurança, acessos e autenticação'
  },
  general: { 
    label: 'Geral', 
    icon: '💬', 
    mui_icon: <ChatIcon />,
    color: 'default',
    description: 'Outras questões não categorizadas'
  }
};

// Estrutura completa de categorias para criação de tickets
export const SUPPORT_CATEGORIES = {
  financial: {
    label: 'Financeiro',
    icon: '💰',
    modules: {
      transactions: {
        label: 'Transações',
        issueTypes: [
          { value: 'failed_transaction', label: 'Transação não processada' },
          { value: 'wrong_amount', label: 'Valor incorreto' },
          { value: 'duplicate_transaction', label: 'Transação duplicada' },
          { value: 'refund_request', label: 'Solicitação de estorno' }
        ]
      },
      balance: {
        label: 'Saldo',
        issueTypes: [
          { value: 'incorrect_balance', label: 'Saldo incorreto' },
          { value: 'missing_deposit', label: 'Depósito não creditado' },
          { value: 'unauthorized_withdrawal', label: 'Saque não autorizado' }
        ]
      }
    }
  },
  caixinha: {
    label: 'Caixinha',
    icon: '🏦',
    modules: {
      participation: {
        label: 'Participação',
        issueTypes: [
          { value: 'join_group', label: 'Não consigo entrar no grupo' },
          { value: 'leave_group', label: 'Não consigo sair do grupo' },
          { value: 'payment_issue', label: 'Problema com pagamento' }
        ]
      },
      management: {
        label: 'Gestão',
        issueTypes: [
          { value: 'create_group', label: 'Erro ao criar grupo' },
          { value: 'member_management', label: 'Problema com membros' },
          { value: 'payout_issue', label: 'Problema com sorteio/pagamento' }
        ]
      }
    }
  },
  loan: {
    label: 'Empréstimos',
    icon: '💳',
    modules: {
      application: {
        label: 'Solicitação',
        issueTypes: [
          { value: 'application_rejected', label: 'Solicitação rejeitada' },
          { value: 'application_pending', label: 'Solicitação pendente há muito tempo' },
          { value: 'documentation_issue', label: 'Problema com documentação' }
        ]
      },
      payment: {
        label: 'Pagamento',
        issueTypes: [
          { value: 'payment_failed', label: 'Falha no pagamento' },
          { value: 'payment_schedule', label: 'Alteração de cronograma' },
          { value: 'early_payment', label: 'Pagamento antecipado' }
        ]
      }
    }
  },
  account: {
    label: 'Conta',
    icon: '👤',
    modules: {
      profile: {
        label: 'Perfil',
        issueTypes: [
          { value: 'update_info', label: 'Atualizar informações' },
          { value: 'verify_identity', label: 'Verificação de identidade' },
          { value: 'change_phone', label: 'Alterar telefone' }
        ]
      },
      access: {
        label: 'Acesso',
        issueTypes: [
          { value: 'forgot_password', label: 'Esqueci a senha' },
          { value: 'account_blocked', label: 'Conta bloqueada' },
          { value: 'login_issue', label: 'Problema para entrar' }
        ]
      }
    }
  },
  technical: {
    label: 'Técnico',
    icon: '🔧',
    modules: {
      app: {
        label: 'Aplicativo',
        issueTypes: [
          { value: 'app_crash', label: 'App fechando sozinho' },
          { value: 'slow_performance', label: 'App lento' },
          { value: 'feature_not_working', label: 'Funcionalidade não funciona' }
        ]
      },
      web: {
        label: 'Site',
        issueTypes: [
          { value: 'page_not_loading', label: 'Página não carrega' },
          { value: 'display_issue', label: 'Problema de exibição' },
          { value: 'browser_compatibility', label: 'Incompatibilidade do navegador' }
        ]
      }
    }
  },
  security: {
    label: 'Segurança',
    icon: '🔒',
    modules: {
      suspicious: {
        label: 'Atividade Suspeita',
        issueTypes: [
          { value: 'unauthorized_access', label: 'Acesso não autorizado' },
          { value: 'suspicious_transaction', label: 'Transação suspeita' },
          { value: 'phishing', label: 'Tentativa de golpe/phishing' }
        ]
      },
      privacy: {
        label: 'Privacidade',
        issueTypes: [
          { value: 'data_deletion', label: 'Excluir meus dados' },
          { value: 'privacy_settings', label: 'Configurações de privacidade' },
          { value: 'data_breach', label: 'Possível vazamento de dados' }
        ]
      }
    }
  },
  general: {
    label: 'Geral',
    icon: '💬',
    modules: {
      feedback: {
        label: 'Feedback',
        issueTypes: [
          { value: 'suggestion', label: 'Sugestão de melhoria' },
          { value: 'complaint', label: 'Reclamação' },
          { value: 'compliment', label: 'Elogio' }
        ]
      },
      other: {
        label: 'Outros',
        issueTypes: [
          { value: 'information', label: 'Solicitar informações' },
          { value: 'partnership', label: 'Proposta de parceria' },
          { value: 'other_issue', label: 'Outro assunto' }
        ]
      }
    }
  }
};

// Funções utilitárias para obter configurações com tema
export const getStatusConfig = (status, theme) => {
  const config = TICKET_STATUS_CONFIG[status] || TICKET_STATUS_CONFIG.pending;
  return {
    ...config,
    backgroundColor: theme ? alpha(theme.palette[config.color]?.main || '#666', 0.1) : undefined,
    textColor: theme ? theme.palette[config.color]?.main || '#666' : undefined
  };
};

export const getPriorityConfig = (priority, theme) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return {
    ...config,
    backgroundColor: theme ? alpha(config.mui_color, 0.1) : undefined,
    textColor: theme ? config.mui_color : undefined
  };
};

export const getCategoryConfig = (category) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
};

// Funções utilitárias para formatação
export const formatTicketId = (id) => {
  return `#${id.substring(0, 8).toUpperCase()}`;
};

export const formatDate = (date) => {
  if (!date) return 'Data não disponível';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Data inválida';
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (error) {
    return 'Erro ao formatar data';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return 'Data não disponível';
  
  try {
    const now = new Date();
    const targetDate = new Date(date);
    const diff = now - targetDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    return 'Agora mesmo';
  } catch (error) {
    return 'Erro ao calcular tempo';
  }
};

// Estados de dashboard/filtros
export const FILTER_OPTIONS = {
  status: [
    { value: 'all', label: 'Todos os Status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'assigned', label: 'Em Atendimento' },
    { value: 'resolved', label: 'Resolvido' },
    { value: 'closed', label: 'Fechado' }
  ],
  priority: [
    { value: 'all', label: 'Todas as Prioridades' },
    { value: 'urgent', label: 'Urgente' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' }
  ],
  category: [
    { value: 'all', label: 'Todas as Categorias' },
    ...Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      value: key,
      label: config.label
    }))
  ]
};

