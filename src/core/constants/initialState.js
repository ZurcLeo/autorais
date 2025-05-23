//src/core/constants/initialState.js
/**
 * @fileoverview Define constantes e configurações globais utilizadas na aplicação.
 */

import { PREFERENCE_CATEGORIES } from "./config";
/**
 * Estados iniciais para todos os serviços e módulos da aplicação.
 * Este arquivo centraliza a definição do estado inicial que será usado pelos reducers.
 * 
 * Cada objeto representa o estado inicial de um módulo ou serviço específico.
 * 
 * @module initialState
 */

/**
 * Estado inicial para o gerenciador de serviços.
 * Usado principalmente pelo serviço de inicialização.
 * 
 * @namespace initialState
 * @type {Object}
 * @property {Object} services - Mapa de serviços registrados e seus estados
 * @property {Object} metadata - Metadados da aplicação
 * @property {boolean} loading - Indica se há alguma operação de carregamento global
 * @property {Object|null} error - Informações de erro global
 * @property {Object} bootstrap - Informações sobre o processo de inicialização
 * @property {string} bootstrap.status - Status atual da inicialização ('pending', 'initializing', etc.)
 * @property {Object|null} bootstrap.error - Erro de inicialização, se houver
 * @property {number|null} bootstrap.startTime - Timestamp de início da inicialização
 * @property {number|null} bootstrap.initializationTime - Duração do processo de inicialização em ms
 */
export const initialState = {
  services: {},
  metadata: {},
  loading: false,
  error: null,
  bootstrap: {
    status: 'pending',
    error: null,
    startTime: null,
    initializationTime: null
  }
};

/**
 * Estado inicial para controle de carregamento da aplicação.
 * 
 * @namespace initialAppState
 * @type {Object}
 * @property {boolean} appLoading - Indica se a aplicação está em estado de carregamento
 */
export const initialAppState = {
  appLoading: false
};

/**
 * Enumeração dos possíveis estados do processo de inicialização.
 * Usado pelos serviços de inicialização para controlar o fluxo.
 * @namespace InitializationState
 * @enum {string}
 * @readonly
 */
export const InitializationState = {
  PENDING: 'pending',        // Estado inicial, antes de qualquer inicialização
  INITIALIZING: 'initializing', // Em processo de inicialização
  READY: 'ready',            // Inicialização concluída com sucesso
  FAILED: 'failed',          // Falha na inicialização
  BLOCKED: 'blocked',        // Bloqueado por alguma dependência
  RETRYING: 'retrying',      // Tentando inicializar novamente após falha
  TIMEOUT: 'timeout'         // Tempo limite excedido durante inicialização
};

// Estado inicial
export const initialRifaState = {
  rifas: [],
  selectedRifa: null,
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Estado inicial do serviço de Caixinhas (CaixinhasService).
 * @namespace initialCaixinhaState
 * @type {Object}
 * @property {Array} caixinhas - Lista de caixinhas do usuário
 * @property {Object|null} currentCaixinha - Caixinha atualmente selecionada
 * @property {Array} membros - Lista de membros da caixinha atual
 * @property {Array} emprestimos - Lista de empréstimos da caixinha atual
 * @property {Array} contribuicoes - Lista de contribuições para a caixinha atual
 * @property {Array} transacoes - Lista de transações da caixinha atual
 * @property {Object} relatorios - Objeto contendo relatórios da caixinha atual
 * @property {Object|null} error - Informações de erro, se houver
 * @property {boolean} loading - Indica se o serviço está carregando dados
 * @property {string|null} lastUpdated - Timestamp da última atualização
 */
export const initialCaixinhaState = {
  // Lista de todas as caixinhas do usuário
  caixinhas: [],
  
  // Caixinha selecionada atualmente
  currentCaixinha: null,
  
  // Dados relacionados à caixinha selecionada
  members: [],
  emprestimos: [],
  contributions: [],
  transacoes: [],
  
  // Relatórios da caixinha
  relatorios: {
    geral: null,
    contribuicoes: null,
    participacao: null,
    transacoes: null
  },
  
  // Status e metadados
  loading: false,
  error: null,
  lastUpdated: null,
  
  // Flags de status para operações
  creating: false,
  updating: false,
  
  // Paginação para listas grandes
  pagination: {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    totalPages: 1
  }
};

// Adicionar ao arquivo core/constants/initialState.js
export const initialCaixinhaInviteState = {
  // Lista de convites
  pendingInvites: [],
  sentInvites: [],
  
  // Estado atual da operação
  loading: false,
  error: null,
  
  // Metadados
  lastUpdated: null,
  
  // Filtros e paginação
  filters: {
    status: 'all', // 'all', 'pending', 'accepted', 'rejected'
    type: 'all'     // 'all', 'caixinha_invite', 'caixinha_email_invite'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
    totalItems: 0
  }
};

/**
 * Estado inicial do serviço Bancário (BankingService) - Versão Completa.
 * @namespace initialBankingState
 * @type {Object}
 * @property {Object|null} bankingInfo - Informações bancárias da caixinha selecionada.
 * @property {Array} bankingHistory - Histórico de transações bancárias da caixinha selecionada.
 * @property {Object|null} transactionDetails - Detalhes da transação atualmente selecionada.
 * @property {Object} transactionStatuses - Mapa de status de transações por ID.
 * @property {Object} balances - Mapa de saldos por conta.
 * @property {Array} transactionErrors - Lista de erros de transação.
 * @property {Array} notifications - Lista de notificações bancárias.
 * @property {boolean} loading - Indica se o serviço está realizando uma operação de carregamento.
 * @property {Object|null} error - Informações de erro, se houver.
 * @property {string|null} lastUpdated - Timestamp da última atualização do estado.
 */
export const initialBankingState = {
  bankingInfo: null,
  bankingHistory: [],
  transactionDetails: null,
  transactionStatuses: {},
  balances: {},
  transactionErrors: [],
  notifications: [],
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Estado inicial do serviço de Autenticação (AuthService).
 * @namespace initialAuthState
 * @type {Object}
 * @property {Object} currentUser - Objeto representando o usuário autenticado. Inicialmente vazio.
 * @property {boolean} isLoading - Indica se o serviço está realizando uma operação de carregamento.
 * @property {boolean} isAuthenticated - Indica se o usuário está autenticado.
 * @property {string} error - Mensagem de erro, caso ocorra algum problema na autenticação.
 * @property {string} lastUpdated - Timestamp da última atualização do estado.
 * @example
 * // Exemplo de uso no reducer:
 * case AUTH_EVENTS.USER_SIGNED_IN:
 * return { ...state, currentUser: action.payload, isAuthenticated: true, isLoading: false, lastUpdated: new Date().toISOString() };
 */
export const initialAuthState = {
  isAuthenticated: false,
  currentUser: null,
  authLoading: false,  // Usado para controlar o estado de carregamento
  error: null,
  needsProfileUpdate: false,
  isFirstAccess: false,
  lastUpdated: null,
  profileUpdateReason: null,
};

/**
 * Estado inicial do serviço de Convites (InviteService).
 * 
 * @namespace initialInviteState
 * @type {Object}
 * @property {Array} invitations - Lista de todos os convites
 * @property {Array} sentInvitations - Lista de convites enviados pelo usuário
 * @property {Array} receivedInvitations - Lista de convites recebidos pelo usuário
 * @property {boolean} isLoading - Indica se o serviço está carregando dados
 * @property {Object|null} error - Informações de erro, se houver
 */
export const initialInviteState = {
  invitations: [],
  sentInvitations: [],
  receivedInvitations: [],
  pendingInvitations: [],
  isLoading: false,
  error: null
};

/**
 * Estado inicial do serviço de Mensagens (MessageService).
 * Representa o ponto de partida para o sistema de gerenciamento de mensagens.
 * 
 * @namespace initialMessageState
 * @type {Object}
 * @property {Array} messages - Lista de todas as mensagens
 * @property {number} unreadCount - Número de mensagens não lidas
 * @property {Object|null} latestMessage - Mensagem mais recente
 * @property {Set} activeChats - Conjunto de IDs de usuários em chats ativos
 * @property {boolean} loading - Indica se o serviço está carregando dados
 * @property {Object|null} error - Informações de erro, se houver
 * @property {string|null} lastUpdated - Timestamp da última atualização
 */
export const initialMessageState = // Estrutura de estado otimizada
{
  messages: [],
  conversations: [],
  activeChat: null,
  unreadCounts: {},
  latestMessages: {},
  isLoading: false,
  error: null
}

export const initialLoanState = {
  loans: [],
  activeLoans: [],
  pendingLoans: [],
  completedLoans: [],
  userLoans: {},
  loanDetails: null,
  loanStatistics: {
    totalActive: 0,
    totalAmount: 0,
    availableFunds: 0
  },
  loading: false,
  error: null,
  lastUpdated: null
};

export const initialDisputeState = {
  disputes: [],
  activeDisputes: [],
  resolvedDisputes: [],
  loanDisputes: [],
  currentDispute: null,
  disputeStats: {
    pendingCount: 0,
    approvalRate: 0
  },
  loading: false,
  error: null,
  lastUpdated: null
};

/**
 * Estado inicial do serviço de Interesses (InterestsService).
 * @namespace initialInterestsState
 * @type {Object}
 * @property {Array} userInterests - Lista de interesses do usuário.
 * @property {Array|null} availableInterests - Lista de todos os interesses disponíveis, ou null se ainda não carregados.
 * @property {boolean} loadingUser - Indica se os interesses do usuário estão sendo carregados.
 * @property {boolean} loadingCategories - Indica se as categorias de interesses estão sendo carregadas.
 * @property {boolean} updating - Indica se os interesses do usuário estão sendo atualizados.
 * @property {string} error - Mensagem de erro, caso ocorra algum problema.
 * @property {Array} selectedInterests - Lista de interesses selecionados durante a edição.
 * @property {string} lastUpdated - Timestamp da última atualização do estado.
 * @example
 * // Exemplo de uso no reducer:
 * case INTERESTS_EVENTS.INTERESTS_FETCHED:
 * return { ...state, userInterests: action.payload, loadingUser: false, lastUpdated: new Date().toISOString() };
 */
export const initialInterestsState = {
  userInterests: {},
  availableInterests: {},
  selectedInterests: [],
  loading: {
    userInterests: false,
    availableInterests: false,
    updateInterests: false
  },
  errors: {
    userInterests: null,
    availableInterests: null,
    updateInterests: null
  },
  lastUpdated: null
};

/**
 * Estado inicial do serviço de Preferências do Usuário (UserPreferencesService).
 * Contém as configurações padrão para todas as categorias de preferências.
 * 
 * @namespace initialUserPrefsReducerState
 * @type {Object}
 * @property {boolean} initialized - Indica se o serviço foi inicializado
 * @property {boolean} loading - Indica se o serviço está carregando dados
 * @property {Object|null} error - Informações de erro, se houver
 * @property {Object} preferences - Mapa de preferências por categoria
 * @property {Object} preferences.theme - Preferências de tema (modo, cor, fonte)
 * @property {Object} preferences.privacy - Preferências de privacidade
 * @property {Object} preferences.notifications - Preferências de notificações
 * @property {Object} preferences.accessibility - Preferências de acessibilidade
 * @property {Object} preferences.display - Preferências de exibição
 * @property {Object} preferences.language - Preferências de idioma
 * @property {Object} preferences.cookies - Preferências de cookies
 * @property {Object} cookieConsent - Informações sobre consentimento de cookies
 */
export const initialUserPrefsReducerState = {
  initialized: false,
  loading: false,
  error: null,
  preferences: {
    // Valores padrão para cada categoria de preferências
    [PREFERENCE_CATEGORIES.THEME]: {
      mode: 'system',
      primaryColor: 'default',
      fontSize: 'medium',
      enableAnimations: true
    },
    [PREFERENCE_CATEGORIES.PRIVACY]: {
      shareAnalytics: false,
      saveHistory: true
    },
    [PREFERENCE_CATEGORIES.NOTIFICATIONS]: {
      email: true,
      push: true,
      inApp: true,
      marketingEmails: false
    },
    [PREFERENCE_CATEGORIES.ACCESSIBILITY]: {
      reduceMotion: false,
      highContrast: false,
      screenReader: false,
      enableShortcuts: true
    },
    [PREFERENCE_CATEGORIES.DISPLAY]: {
      density: 'normal',
      sidebarCollapsed: false,
      dashboardLayout: 'default'
    },
    [PREFERENCE_CATEGORIES.LANGUAGE]: {
      locale: 'pt-BR',
      timezone: 'auto'
    },
    [PREFERENCE_CATEGORIES.COOKIES]: {
      necessary: true,
      functional: true,
      analytics: false,
      marketing: false,
      thirdParty: false,
      consentTimestamp: null
    }
  },
  cookieConsent: {
    given: false,
    timestamp: null
  }
};

/**
 * Estado inicial do serviço de Usuário (UserService).
 * @namespace initialUserState
 * @type {Object}
 * @property {Object} currentUser - Objeto representando o usuário atual.
 * @property {Object} usersById - Mapa de usuários por ID.
 * @property {Array} usersList - Lista de todos os usuários.
 * @property {boolean} isLoading - Indica se o serviço está realizando uma operação de carregamento.
 * @property {string} error - Mensagem de erro, caso ocorra algum problema.
 * @property {string} lastUpdated - Timestamp da última atualização do estado.
 * @example
 * // Exemplo de uso no reducer:
 * case USER_EVENTS.PROFILE_FETCHED:
 * return { ...state, currentUser: action.payload, isLoading: false, lastUpdated: new Date().toISOString() };
 */
export const initialUserState = {
  user: null,     // Perfil do usuário atual
  userLoading: false,    // Estado de carregamento do perfil
  usersById: {},         // Cache de perfis por ID
  usersList: [],         // Lista de usuários para visualização
  error: null,
  lastUpdated: null
};

/**
 * Estado inicial do serviço de Conexões (ConnectionService).
 * @namespace initialConnectionState
 * @type {Object}
 * @property {Array} friends - Lista de amigos do usuário.
 * @property {Array} bestFriends - Lista de melhores amigos do usuário.
 * @property {Array} invitations - Lista de convites de conexão recebidos.
 * @property {Array} searchResults - Resultados da busca por usuários.
 * @property {boolean} loading - Indica se o serviço está realizando uma operação de carregamento.
 * @property {boolean} searching - Indica se o serviço está realizando uma busca.
 * @property {string} error - Mensagem de erro, caso ocorra algum problema.
 * @property {string} lastUpdated - Timestamp da última atualização do estado.
 * @example
 * // Exemplo de uso no reducer:
 * case CONNECTION_EVENTS.CONNECTIONS_FETCHED:
 * return { ...state, friends: action.payload, loading: false, lastUpdated: new Date().toISOString() };
 */
export const initialConnectionState = {
  // Listas principais de conexões
  friends: [],
  bestFriends: [],
  
  // Solicitações pendentes
  pendingRequests: {
    received: [],      // Solicitações recebidas aguardando aceitação
    sent: []           // Solicitações enviadas aguardando resposta
  },
  
  // Histórico de interações
  connectionHistory: {
    acceptedAt: {},    // Map de connectionId -> timestamp de aceitação 
    rejectedAt: {},    // Map de connectionId -> timestamp de rejeição
    blockedUsers: []   // Lista de usuários bloqueados
  },
  
  // Estado de pesquisa (já bem estruturado)
  search: {
    query: '',
    results: [],
    recentSearches: [],
    suggestedQueries: [],
    categories: {
      exactMatches: [],
      byInterests: [], 
      byLocation: []
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasMore: false
    },
    status: 'idle', // 'idle', 'loading', 'success', 'error'
    error: null,
    lastUpdated: null
  },
  
  // Estados de controle
  loading: false,
  error: null,
  lastUpdated: null,
  
  // Metadados para sincronização
  cacheStatus: {
    isSynced: false,
    lastSyncedAt: null
  }
};

/**
 * Estado inicial do serviço de Validação (ValidationService).
 * @namespace initialValidationState
 * @type {Object}
 * @property {Map} errors - Mapa de erros de validação por campo.
 * @property {Set} dirtyFields - Conjunto de campos que foram modificados.
 * @property {boolean} isValidating - Indica se o serviço está realizando uma validação.
 * @property {string} lastUpdated - Timestamp da última atualização do estado.
 * @example
 * // Exemplo de uso no reducer:
 * case VALIDATION_EVENTS.VALIDATION_ERROR:
 * return { ...state, errors: action.payload, isValidating: false, lastUpdated: new Date().toISOString() };
 */
export const initialValidationState = {
  errors: new Map(),
  dirtyFields: new Set(),
  isValidating: false,
  lastUpdated: ""
};

/**
 * Estado inicial do serviço de Notificações (NotificationService).
 * @namespace initialNotificationState
 * @type {Object}
 * @property {Array} notifications - Lista de notificações do usuário.
 * @property {number} unreadCount - Número de notificações não lidas.
 * @property {boolean} loading - Indica se o serviço está realizando uma operação de carregamento.
 * @property {string} error - Mensagem de erro, caso ocorra algum problema.
 * @property {string} lastUpdated - Timestamp da última atualização do estado.
 * @example
 * // Exemplo de uso no reducer:
 * case NOTIFICATION_EVENTS.NOTIFICATIONS_FETCHED:
 * return { ...state, notifications: action.payload, loading: false, unreadCount: action.payload.filter(n => !n.read).length, lastUpdated: new Date().toISOString() };
 */
export const initialNotificationState = {
  notifications: [],
  unreadCount: 0,
  notifLoading: false,
  error: "",
  lastUpdated: ""
};

/**
 * Estado inicial do serviço de Dashboard (DashboardService).
 * @namespace initialDashboardState
 * @type {Object}
 * @property {Array} messages - Lista de mensagens do dashboard.
 * @property {Array} notifications - Lista de notificações do dashboard.
 * @property {Object} connections - Objeto contendo listas de amigos e melhores amigos.
 * @property {Array} caixinhas - Lista de caixinhas do usuário.
 * @property {boolean} loading - Indica se o serviço está realizando uma operação de carregamento.
 * @property {string} error - Mensagem de erro, caso ocorra algum problema.
 * @property {string} lastUpdated - Timestamp da última atualização do estado.
 * @example
 * // Exemplo de uso no reducer:
 * case DASHBOARD_EVENTS.DASHBOARD_DATA_FETCHED:
 * return { ...state, messages: action.payload.messages, notifications: action.payload.notifications, connections: action.payload.connections, caixinhas: action.payload.caixinhas, loading: false, lastUpdated: new Date().toISOString() };
 */
export const initialDashboardState = {
  messages: [],
  notifications: [],
  connections: {
    friends: [],
    bestFriends: []
  },
  caixinhas: [],
  loading: false,
  error: "",
  lastUpdated: ""
};