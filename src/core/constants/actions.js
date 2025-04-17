/**
 * @fileoverview Define constantes e configurações globais utilizadas na aplicação.
 */
/**
 * Ações emitidas pelo ServiceInitializer para gerenciar o processo de inicialização da aplicação.
 * @namespace INIT_ACTIONS
 * @enum {string}
 * @property {string} START_BOOTSTRAP - Disparada quando o processo de bootstrap da aplicação é iniciado.
 * @property {string} BOOTSTRAP_SUCCESS - Disparada quando o processo de bootstrap da aplicação é bem-sucedido.
 * @property {string} BOOTSTRAP_ERROR - Disparada quando o processo de bootstrap da aplicação falha.
 * @property {string} UPDATE_SERVICE_STATUS - Disparada para atualizar o status de inicialização de um serviço específico.
 * @property {string} SERVICE_INIT_START - Disparada quando a inicialização de um serviço específico é iniciada.
 * @property {string} SERVICE_INIT_SUCCESS - Disparada quando a inicialização de um serviço específico é bem-sucedida.
 * @property {string} SERVICE_INIT_ERROR - Disparada quando a inicialização de um serviço específico falha.
 * @property {string} RESET_INITIALIZATION - Disparada para redefinir o estado de inicialização da aplicação.
 * @property {string} FORCE_INITIALIZATION_COMPLETE - Disparada para forçar a conclusão do processo de inicialização da aplicação.
 */
export const INIT_ACTIONS = {
  // Ações de bootstrap
  START_BOOTSTRAP: 'init/START_BOOTSTRAP',
  BOOTSTRAP_SUCCESS: 'init/BOOTSTRAP_SUCCESS',
  BOOTSTRAP_ERROR: 'init/BOOTSTRAP_ERROR',
  // Ações de serviço
  UPDATE_SERVICE_STATUS: 'init/UPDATE_SERVICE_STATUS',
  SERVICE_INIT_START: 'init/SERVICE_INIT_START',
  SERVICE_INIT_SUCCESS: 'init/SERVICE_INIT_SUCCESS',
  SERVICE_INIT_ERROR: 'init/SERVICE_INIT_ERROR',
  // Ações gerais
  RESET_INITIALIZATION: 'init/RESET_INITIALIZATION',
  FORCE_INITIALIZATION_COMPLETE: 'init/FORCE_INITIALIZATION_COMPLETE'
};

/**
 * Ações emitidas pelo BankingService para gerenciar o sistema bancário
 * @namespace BANKING_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando inicia a busca de dados bancários.
 * @property {string} FETCH_SUCCESS - Disparada quando os dados bancários são obtidos com sucesso.
 * @property {string} FETCH_FAILURE - Disparada quando ocorre uma falha na obtenção dos dados bancários.
 * @property {string} UPDATE_BANKING_INFO - Disparada para atualizar as informações bancárias de uma caixinha.
 * @property {string} UPDATE_BANKING_HISTORY - Disparada para atualizar o histórico bancário de uma caixinha.
 * @property {string} REGISTER_START - Disparada quando inicia o registro de uma conta bancária.
 * @property {string} REGISTER_SUCCESS - Disparada quando uma conta bancária é registrada com sucesso.
 * @property {string} REGISTER_FAILURE - Disparada quando ocorre uma falha no registro de uma conta bancária.
 * @property {string} VALIDATE_START - Disparada quando inicia a validação de uma conta bancária.
 * @property {string} VALIDATE_SUCCESS - Disparada quando uma conta bancária é validada com sucesso.
 * @property {string} VALIDATE_FAILURE - Disparada quando ocorre uma falha na validação de uma conta bancária.
 * @property {string} TRANSFER_START - Disparada quando inicia uma transferência de fundos.
 * @property {string} TRANSFER_SUCCESS - Disparada quando uma transferência de fundos é realizada com sucesso.
 * @property {string} TRANSFER_FAILURE - Disparada quando ocorre uma falha na transferência de fundos.
 * @property {string} CANCEL_START - Disparada quando inicia o cancelamento de uma transação.
 * @property {string} CANCEL_SUCCESS - Disparada quando uma transação é cancelada com sucesso.
 * @property {string} CANCEL_FAILURE - Disparada quando ocorre uma falha no cancelamento de uma transação.
 * @property {string} SET_ERROR - Disparada para definir um estado de erro no serviço bancário.
 * @property {string} CLEAR_ERROR - Disparada para limpar o estado de erro no serviço bancário.
 * @property {string} CLEAR_STATE - Disparada para limpar todos os dados bancários do estado da aplicação.
 */
export const BANKING_ACTIONS = {
  FETCH_START: 'banking/FETCH_START',
  FETCH_SUCCESS: 'banking/FETCH_SUCCESS',
  FETCH_FAILURE: 'banking/FETCH_FAILURE',
  
  UPDATE_BANKING_INFO: 'banking/UPDATE_BANKING_INFO',
  UPDATE_BANKING_HISTORY: 'banking/UPDATE_BANKING_HISTORY',
  
  REGISTER_START: 'banking/REGISTER_START',
  REGISTER_SUCCESS: 'banking/REGISTER_SUCCESS',
  REGISTER_FAILURE: 'banking/REGISTER_FAILURE',
  
  VALIDATE_START: 'banking/VALIDATE_START',
  VALIDATE_SUCCESS: 'banking/VALIDATE_SUCCESS',
  VALIDATE_FAILURE: 'banking/VALIDATE_FAILURE',
  
  TRANSFER_START: 'banking/TRANSFER_START',
  TRANSFER_SUCCESS: 'banking/TRANSFER_SUCCESS',
  TRANSFER_FAILURE: 'banking/TRANSFER_FAILURE',
  
  CANCEL_START: 'banking/CANCEL_START',
  CANCEL_SUCCESS: 'banking/CANCEL_SUCCESS',
  CANCEL_FAILURE: 'banking/CANCEL_FAILURE',
  
  SET_ERROR: 'banking/SET_ERROR',
  CLEAR_ERROR: 'banking/CLEAR_ERROR',
  CLEAR_STATE: 'banking/CLEAR_STATE',

  TRANSACTION_DETAILS_FETCHED: 'banking/TRANSACTION_DETAILS_FETCHED',
  TRANSACTION_STATUS_UPDATED: 'banking/TRANSACTION_STATUS_UPDATED',
  BALANCE_UPDATED: 'banking/BALANCE_UPDATED',
  TRANSACTION_ERROR: 'banking/TRANSACTION_ERROR',
  NOTIFICATION_RECEIVED: 'banking/NOTIFICATION_RECEIVED'
};

/**
 * Ações emitidas pelo InvitesService para gerenciar o sistema de convites da aplicação.
 * @namespace INVITATION_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando a busca por convites é iniciada.
 * @property {string} FETCH_SUCCESS - Disparada quando a busca por convites é bem-sucedida.
 * @property {string} FETCH_FAILURE - Disparada quando a busca por convites falha.
 * @property {string} SEND_START - Disparada quando o envio de um convite é iniciado.
 * @property {string} SEND_SUCCESS - Disparada quando o envio de um convite é bem-sucedido.
 * @property {string} SEND_FAILURE - Disparada quando o envio de um convite falha.
 * @property {string} UPDATE_INVITATION - Disparada para atualizar os dados de um convite.
 * @property {string} REMOVE_INVITATION - Disparada para remover um convite.
 * @property {string} CLEAR_STATE - Disparada para limpar o estado do serviço de convites.
 */
export const INVITATION_ACTIONS = {
  FETCH_START: 'invites/FETCH_START',
  FETCH_SUCCESS: 'invites/FETCH_SUCCESS',
  FETCH_FAILURE: 'invites/FETCH_FAILURE',
  SEND_START: 'invites/SEND_START',
  SEND_SUCCESS: 'invites/SEND_SUCCESS',
  SEND_FAILURE: 'invites/SEND_FAILURE',
  UPDATE_INVITATION: 'invites/UPDATE_INVITATION',
  REMOVE_INVITATION: 'invites/REMOVE_INVITATION',
  CLEAR_STATE: 'invites/CLEAR_STATE'
};

// /**
//  * Ações emitidas para controlar o estado geral da aplicação.
//  * @namespace APP_ACTIONS
//  * @enum {string}
//  * @property {string} LOADING_STARTED - Disparada quando um processo de carregamento na aplicação é iniciado.
//  * @property {string} LOADING_FINISHED - Disparada quando um processo de carregamento na aplicação é concluído.
//  */
// export const APP_ACTIONS = {
//   LOADING_STARTED: 'app/LOADING_STARTED',
//   LOADING_FINISHED: 'app/LOADING_FINISHED',
// };

/**
 * Ações emitidas para gerenciar as preferências do usuário na aplicação.
 * @namespace USER_PREFS_ACTIONS
 * @enum {string}
 * @property {string} INITIALIZE_SUCCESS - Disparada quando a inicialização das preferências do usuário é bem-sucedida.
 * @property {string} LOAD_SUCCESS - Disparada quando o carregamento das preferências do usuário é bem-sucedido.
 * @property {string} UPDATE_SUCCESS - Disparada quando a atualização das preferências do usuário é bem-sucedida.
 * @property {string} RESET_SUCCESS - Disparada quando a redefinição das preferências do usuário é bem-sucedida.
 * @property {string} IMPORT_SUCCESS - Disparada quando a importação das preferências do usuário é bem-sucedida.
 * @property {string} OPERATION_FAILURE - Disparada quando uma operação relacionada às preferências do usuário falha.
 * @property {string} COOKIE_CONSENT_SET - Disparada quando o consentimento de cookies do usuário é definido.
 * @property {string} THEME_CHANGED - Disparada quando o tema da aplicação é alterado pelo usuário.
 * @property {string} LANGUAGE_CHANGED - Disparada quando o idioma da aplicação é alterado pelo usuário.
 * @property {string} ACCESSIBILITY_CHANGED - Disparada quando as configurações de acessibilidade da aplicação são alteradas pelo usuário.
 */
export const USER_PREFS_ACTIONS = {
  INITIALIZE_SUCCESS: 'userPrefs/INITIALIZE_SUCCESS',
  LOAD_SUCCESS: 'userPrefs/LOAD_SUCCESS',
  UPDATE_SUCCESS: 'userPrefs/UPDATE_SUCCESS',
  RESET_SUCCESS: 'userPrefs/RESET_SUCCESS',
  IMPORT_SUCCESS: 'userPrefs/IMPORT_SUCCESS',
  OPERATION_FAILURE: 'userPrefs/OPERATION_FAILURE',
  COOKIE_CONSENT_SET: 'userPrefs/COOKIE_CONSENT_SET',
  THEME_CHANGED: 'userPrefs/THEME_CHANGED',
  LANGUAGE_CHANGED: 'userPrefs/LANGUAGE_CHANGED',
  ACCESSIBILITY_CHANGED: 'userPrefs/ACCESSIBILITY_CHANGED'
};

/**
 * Ações emitidas pelo AuthService para gerenciar o fluxo de autenticação
 * @namespace AUTH_ACTIONS
 * @enum {string}
 * @property {string} LOGIN_START - Disparada quando o processo de login é iniciado.
 * @property {string} LOGIN_SUCCESS - Disparada quando o login é bem-sucedido.
 * @property {string} LOGIN_FAILURE - Disparada quando o login falha.
 * @property {string} LOGIN_EXPIRED - Disparada quando a sessão do usuário expira.
 * @property {string} LOGOUT - Disparada quando o usuário faz logout.
 * @property {string} SET_AUTH_LOADING - Disparada para indicar que o serviço de autenticação está processando uma operação.
 */
export const AUTH_ACTIONS = {
  LOGIN_START: 'auth/LOGIN_START',
  LOGIN_SUCCESS: 'auth/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'auth/LOGIN_FAILURE',
  LOGIN_EXPIRED: 'auth/LOGIN_EXPIRED',
  LOGOUT: 'auth/LOGOUT',
  SET_AUTH_LOADING: 'auth/SET_AUTH_LOADING',
  SET_FIRST_ACCESS: 'auth/SET_FIRST_ACCESS',
  SET_PROFILE_UPDATE_NEEDED: 'auth/SET_PROFILE_UPDATE_NEEDED',
  PROFILE_UPDATED: 'auth/PROFILE_UPDATED',
  REGISTER_START: 'auth/REGISTER_START',
  REGISTER_SUCCESS: 'auth/REGISTER_SUCCESS',
  REGISTER_FAILURE: 'auth/REGISTER_FAILURE'
};

/**
 * Ações emitidas pelo ServiceInitializer para gerenciar metadados dos serviços da aplicação
 * @namespace METADATA_ACTIONS
 * @enum {string}
 * @property {string} UPDATE_SERVICE_TIMEOUT - Disparada para atualizar o tempo limite de um serviço.
 * @property {string} UPDATE_SERVICE_DEPENDENCIES - Disparada para atualizar as dependências de um serviço.
 * @property {string} UPDATE_SERVICE_CRITICAL_PATH - Disparada para atualizar o caminho crítico de inicialização de serviços.
 * @property {string} ADD_SERVICE - Disparada quando um novo serviço é registrado no sistema.
 * @property {string} REMOVE_SERVICE - Disparada quando um serviço é removido do sistema.
 * @property {string} UPDATE_SEVERITY_LEVEL - Disparada para atualizar o nível de severidade de um serviço.
 * @property {string} UPDATE_LOG_CONFIG - Disparada para atualizar as configurações de log de um serviço.
 * @property {string} RESET_METADATA - Disparada para redefinir todos os metadados para o estado inicial.
 */
export const METADATA_ACTIONS = {
  UPDATE_SERVICE_TIMEOUT: 'metadata/UPDATE_SERVICE_TIMEOUT',
  UPDATE_SERVICE_DEPENDENCIES: 'metadata/UPDATE_SERVICE_DEPENDENCIES',
  UPDATE_SERVICE_CRITICAL_PATH: 'metadata/UPDATE_SERVICE_CRITICAL_PATH',
  ADD_SERVICE: 'metadata/ADD_SERVICE',
  REMOVE_SERVICE: 'metadata/REMOVE_SERVICE',
  UPDATE_SEVERITY_LEVEL: 'metadata/UPDATE_SEVERITY_LEVEL',
  UPDATE_LOG_CONFIG: 'metadata/UPDATE_LOG_CONFIG',
  RESET_METADATA: 'metadata/RESET_METADATA',
};

/**
 * Ações emitidas pelo ServiceInitializer para gerenciar o ciclo de vida dos serviços
 * @namespace SERVICE_ACTIONS
 * @enum {string}
 * @property {string} INIT - Disparada quando um serviço inicia seu processo de inicialização.
 * @property {string} READY - Disparada quando um serviço completou sua inicialização e está pronto para uso.
 * @property {string} ERROR - Disparada quando ocorre um erro durante a inicialização de um serviço.
 * @property {string} CORE_READY - Disparada quando os serviços essenciais (core) estão prontos.
 * @property {string} DEPENDENCY_CHECK - Disparada para verificar se todas as dependências de um serviço estão disponíveis.
 */
export const SERVICE_ACTIONS = {
  SERVICE_INIT: 'service/SERVICE_INIT',
  SERVICE_READY: 'service/SERVICE_READY',
  SERVICE_ERROR: 'service/SERVICE_ERROR',
  SERVICE_STOPPED: 'service/SERVICE_STOPPED',
  DEPENDENCY_CHECK: 'service/DEPENDENCY_CHECK',
  UPDATE_DEPENDENCIES: 'service/UPDATE_DEPENDENCIES',
  CORE_READY: 'service/CORE_READY',
  RESET_SERVICE: 'service/RESET_SERVICE',
  CRITICAL_FAILURE: 'service/CRITICAL_FAILURE',
  UPDATE_INITIALIZATION_STATE: 'service/UPDATE_INITIALIZATION_STATE',
  ADD_SERVICE: 'service/ADD_SERVICE',
  REMOVE_SERVICE: 'service/REMOVE_SERVICE',
  UPDATE_METADATA: 'service/UPDATE_METADATA',
  RESET_ALL: 'service/RESET_ALL'
};

/**
 * Ações emitidas pelo UserService para gerenciar dados do usuário
 * @namespace USER_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando inicia a busca de dados do usuário.
 * @property {string} FETCH_SUCCESS - Disparada quando os dados do usuário são obtidos com sucesso.
 * @property {string} FETCH_FAILURE - Disparada quando ocorre uma falha na obtenção dos dados do usuário.
 * @property {string} UPDATE_USER - Disparada para atualizar informações específicas do usuário.
 * @property {string} SET_ERROR - Disparada para definir um estado de erro no serviço de usuário.
 * @property {string} SET_LOADING - Disparada para indicar que o serviço de usuário está processando uma operação.
 * @property {string} CLEAR_USER - Disparada para limpar os dados do usuário do estado da aplicação.
 */
export const USER_ACTIONS = {
  FETCH_START: 'user/FETCH_START',
  FETCH_SUCCESS: 'user/FETCH_SUCCESS',
  FETCH_FAILURE: 'user/FETCH_FAILURE',
  UPDATE_SUCCESS: 'user/UPDATE_SUCCESS',
  USER_PROFILE_COMPLETE: 'user/USER_PROFILE_COMPLETE',
  USER_PROFILE_INCOMPLETE: 'user/USER_PROFILE_INCOMPLETE',
  SET_ERROR: 'user/SET_ERROR',
  DELETE_SUCCESS: 'user/DELETE_SUCCESS',
  CLEAR_USER: 'user/CLEAR_USER',
  SET_PROFILE_UPDATE_NEEDED: 'user/SET_PROFILE_UPDATE_NEEDED',
  
};

/**
 * Ações emitidas pelo CaixinhaService para gerenciar grupos de pagamento coletivo
 * @namespace CAIXINHA_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando inicia a busca de dados das caixinhas.
 * @property {string} FETCH_SUCCESS - Disparada quando os dados das caixinhas são obtidos com sucesso.
 * @property {string} FETCH_FAILURE - Disparada quando ocorre uma falha na obtenção dos dados das caixinhas.
 * @property {string} UPDATE_CAIXINHAS - Disparada para atualizar a lista completa de caixinhas.
 * @property {string} UPDATE_SINGLE_CAIXINHA - Disparada para atualizar dados de uma caixinha específica.
 * @property {string} UPDATE_CONTRIBUTIONS - Disparada para atualizar as contribuições feitas em uma caixinha.
 * @property {string} SET_ERROR - Disparada para definir um estado de erro no serviço de caixinhas.
 * @property {string} SET_LOADING - Disparada para indicar que o serviço de caixinhas está processando uma operação.
 * @property {string} CLEAR_STATE - Disparada para limpar todos os dados de caixinhas do estado da aplicação.
 */
export const CAIXINHA_ACTIONS = {
  FETCH_START: 'caixinhas/FETCH_START',
  FETCH_SUCCESS: 'caixinhas/FETCH_SUCCESS',
  FETCH_FAILURE: 'caixinhas/FETCH_FAILURE',
  UPDATE_CAIXINHAS: 'caixinhas/UPDATE_CAIXINHAS',
  UPDATE_SINGLE_CAIXINHA: 'caixinhas/UPDATE_SINGLE_CAIXINHA',
  UPDATE_CONTRIBUTIONS: 'caixinhas/UPDATE_CONTRIBUTIONS',
  SET_ERROR: 'caixinhas/SET_ERROR',
  SET_LOADING: 'caixinhas/SET_LOADING',
  CLEAR_STATE: 'caixinhas/CLEAR_STATE',
};

/**
 * Ações emitidas pelo ConnectionService para gerenciar relações sociais entre usuários
 * @namespace CONNECTION_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando inicia a busca de dados de conexões do usuário.
 * @property {string} FETCH_SUCCESS - Disparada quando os dados de conexões são obtidos com sucesso.
 * @property {string} FETCH_FAILURE - Disparada quando ocorre uma falha na obtenção dos dados de conexões.
 * @property {string} UPDATE_FRIENDS - Disparada para atualizar a lista de amigos do usuário (após aceitar/recusar/desfazer amizades).
 * @property {string} UPDATE_BEST_FRIENDS - Disparada para atualizar a lista de melhores amigos (que têm acesso a informações privadas).
 * @property {string} UPDATE_INVITATIONS - Disparada para atualizar os convites de amizade pendentes e enviados.
 * @property {string} SET_ERROR - Disparada para definir um estado de erro no serviço de conexões.
 * @property {string} SET_LOADING - Disparada para indicar que o serviço de conexões está processando uma operação.
 * @property {string} CLEAR_STATE - Disparada para limpar todos os dados de conexões do estado da aplicação.
 * @property {string} SET_SEARCH_RESULTS - Disparada para atualizar os resultados de busca de usuários.
 * @property {string} CLEAR_SEARCH_RESULTS - Disparada para limpar os resultados de uma busca anterior.
 */
export const CONNECTION_ACTIONS = {
  FETCH_START: 'connections/FETCH_START',
  FETCH_SUCCESS: 'connections/FETCH_SUCCESS',
  FETCH_FAILURE: 'connections/FETCH_FAILURE',
  UPDATE_FRIENDS: 'connections/UPDATE_FRIENDS',
  UPDATE_BEST_FRIENDS: 'connections/UPDATE_BEST_FRIENDS',
  UPDATE_CONNECTIONS: 'connections/UPDATE_CONNECTIONS',
  REMOVE_CONNECTION: 'connections/REMOVE_CONNECTION',
  SET_ERROR: 'connections/SET_ERROR',
  SET_LOADING: 'connections/SET_LOADING',
  CLEAR_STATE: 'connections/CLEAR_STATE',
  SET_SEARCH_RESULTS: 'connections/SET_SEARCH_RESULTS',
  CLEAR_SEARCH_RESULTS: 'connections/CLEAR_SEARCH_RESULTS',
  SEARCH_START: 'connections/SEARCH_START',
  SEARCH_ERROR: 'connections/SEARCH_ERROR',
};

/**
 * Ações emitidas pelo InterestsService para gerenciar o sistema de interesses da ElosCloud
 * @namespace INTERESTS_ACTIONS
 * @enum {string}
 * @property {string} FETCH_USER_INTERESTS_START - Disparada quando inicia a busca dos interesses selecionados pelo usuário.
 * @property {string} FETCH_USER_INTERESTS_SUCCESS - Disparada quando os interesses do usuário são obtidos com sucesso.
 * @property {string} FETCH_USER_INTERESTS_FAILURE - Disparada quando ocorre uma falha na obtenção dos interesses do usuário.
 * @property {string} FETCH_CATEGORIES_START - Disparada quando inicia a busca das categorias de interesses disponíveis.
 * @property {string} FETCH_CATEGORIES_SUCCESS - Disparada quando as categorias são obtidas com sucesso.
 * @property {string} FETCH_CATEGORIES_FAILURE - Disparada quando ocorre uma falha na obtenção das categorias.
 * @property {string} UPDATE_INTERESTS_START - Disparada quando inicia o processo de atualização dos interesses (adicionar/remover).
 * @property {string} UPDATE_INTERESTS_SUCCESS - Disparada quando os interesses são atualizados com sucesso.
 * @property {string} UPDATE_INTERESTS_FAILURE - Disparada quando ocorre uma falha na atualização dos interesses.
 * @property {string} UPDATE_SELECTED_INTERESTS - Disparada para atualizar localmente os interesses selecionados pelo usuário.
 * @property {string} SET_AVAILABLE_INTERESTS - Disparada para definir a lista completa de interesses disponíveis no sistema.
 */
export const INTERESTS_ACTIONS = {
  FETCH_USER_INTERESTS_START: 'interests/FETCH_USER_INTERESTS_START',
  FETCH_USER_INTERESTS_SUCCESS: 'interests/FETCH_USER_INTERESTS_SUCCESS',
  FETCH_USER_INTERESTS_FAILURE: 'interests/FETCH_USER_INTERESTS_FAILURE',
  FETCH_CATEGORIES_SUCCESS: 'interests/FETCH_CATEGORIES_SUCCESS',
  FETCH_CATEGORIES_FAILURE: 'interests/FETCH_CATEGORIES_FAILURE',
  UPDATE_INTERESTS_START: 'interests/UPDATE_INTERESTS_START',
  UPDATE_INTERESTS_SUCCESS: 'interests/UPDATE_INTERESTS_SUCCESS',
  UPDATE_INTERESTS_FAILURE: 'interests/UPDATE_INTERESTS_FAILURE',
  UPDATE_SELECTED_INTERESTS: 'interests/UPDATE_SELECTED_INTERESTS',
  SET_AVAILABLE_INTERESTS: 'interests/SET_AVAILABLE_INTERESTS',
};

/**
 * Ações emitidas pelo MessageService para gerenciar o sistema de mensagens entre usuários
 * @namespace MESSAGE_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando inicia a busca de mensagens do usuário.
 * @property {string} FETCH_SUCCESS - Disparada quando as mensagens são obtidas com sucesso.
 * @property {string} FETCH_FAILURE - Disparada quando ocorre uma falha na obtenção das mensagens.
 * @property {string} UPDATE_MESSAGES - Disparada para atualizar a lista de mensagens em uma conversa específica.
 * @property {string} UPDATE_UNREAD_COUNT - Disparada para atualizar o contador de mensagens não lidas.
 * @property {string} UPDATE_LATEST_MESSAGE - Disparada para atualizar a mensagem mais recente em uma conversa.
 * @property {string} UPDATE_ACTIVE_CHATS - Disparada para atualizar a lista de conversas ativas do usuário.
 * @property {string} SET_ERROR - Disparada para definir um estado de erro no serviço de mensagens.
 * @property {string} SET_LOADING - Disparada para indicar que o serviço de mensagens está processando uma operação.
 * @property {string} CLEAR_STATE - Disparada para limpar todos os dados de mensagens do estado da aplicação.
 */
// Ações para diferentes operações de mensagens
export const MESSAGE_ACTIONS = {
  FETCH_START: 'messages/FETCH_START',
  FETCH_SUCCESS: 'messages/FETCH_SUCCESS',
  FETCH_FAILURE: 'messages/FETCH_FAILURE',
  
  // Ações específicas para operações unitárias vs. em lote
  ADD_MESSAGE: 'messages/ADD_MESSAGE',
  UPDATE_MESSAGE: 'messages/UPDATE_MESSAGE',
  DELETE_MESSAGE: 'messages/DELETE_MESSAGE',
  
  // Ação para atualizar um conjunto inteiro de mensagens
  SET_CONVERSATION_MESSAGES: 'messages/SET_CONVERSATION_MESSAGES',
  UPDATE_MESSAGES: 'messages/UPDATE_MESSAGES',
  UPDATE_CONVERSATION_MESSAGES: 'messages/UPDATE_CONVERSATION_MESSAGES',
  UPDATE_MESSAGE_STATUS: 'messages/UPDATE_MESSAGE_STATUS',
  UPDATE_TYPING_STATUS: 'messages/UPDATE_TYPING_STATUS',
  UPDATE_MESSAGE_DATA_LEITURA: 'messages/UPDATE_MESSAGE_DATA_LEITURA',

  UPDATE_ACTIVE_CHATS: 'messages/UPDATE_ACTIVE_CHATS',
  SET_ACTIVE_CHAT: 'messages/SET_ACTIVE_CHAT',
  
  // Outras ações existentes
  UPDATE_UNREAD_COUNT: 'messages/UPDATE_UNREAD_COUNT',
  UPDATE_LATEST_MESSAGE: 'messages/UPDATE_LATEST_MESSAGE',
  CLEAR_STATE: 'messages/CLEAR_STATE',
  CLEAR_ERROR: 'messages/CLEAR_ERROR',

  //ID's temporarios e conciliacao
  RECONCILE_MESSAGE: 'messages/RECONCILE_MESSAGE',
  MESSAGE_SEND_FAILED: 'messages/MESSAGE_SEND_FAILED'
};

/**
 * Ações emitidas pelo NotificationService para gerenciar o sistema de notificações da aplicação
 * @namespace NOTIFICATION_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando inicia a busca de notificações do usuário.
 * @property {string} FETCH_SUCCESS - Disparada quando as notificações são obtidas com sucesso.
 * @property {string} FETCH_FAILURE - Disparada quando ocorre uma falha na obtenção das notificações.
 * @property {string} UPDATE_NOTIFICATIONS - Disparada para atualizar a lista de notificações do usuário.
 * @property {string} UPDATE_UNREAD_COUNT - Disparada para atualizar o contador de notificações não lidas.
 * @property {string} SET_ERROR - Disparada para definir um estado de erro no serviço de notificações.
 * @property {string} SET_LOADING - Disparada para indicar que o serviço de notificações está processando uma operação.
 * @property {string} CLEAR_STATE - Disparada para limpar todos os dados de notificações do estado da aplicação.
 */
export const NOTIFICATION_ACTIONS = {
  FETCH_START: 'notifications/FETCH_START',
  FETCH_SUCCESS: 'notifications/FETCH_SUCCESS',
  FETCH_FAILURE: 'notifications/FETCH_FAILURE',
  UPDATE_NOTIFICATIONS: 'notifications/UPDATE_NOTIFICATIONS',
  UPDATE_UNREAD_COUNT: 'notifications/UPDATE_UNREAD_COUNT',
  SET_ERROR: 'notifications/SET_ERROR',
  SET_LOADING: 'notifications/SET_LOADING',
  CLEAR_STATE: 'notifications/CLEAR_STATE',
};

/**
 * Ações emitidas pelo ValidationService para gerenciar a validação de formulários e campos na aplicação
 * @namespace VALIDATION_ACTIONS
 * @enum {string}
 * @property {string} SET_ERRORS - Disparada para definir os erros de validação encontrados nos campos.
 * @property {string} SET_DIRTY_FIELDS - Disparada para marcar campos que foram modificados pelo usuário.
 * @property {string} SET_IS_VALIDATING - Disparada para indicar que uma validação está em andamento.
 * @property {string} RESET_VALIDATION - Disparada para limpar todos os estados de validação (erros, campos modificados, etc.).
 */
export const VALIDATION_ACTIONS = {
  SET_ERRORS: 'validation/SET_ERRORS',
  SET_DIRTY_FIELDS: 'validation/SET_DIRTY_FIELDS',
  SET_IS_VALIDATING: 'validation/SET_IS_VALIDATING',
  RESET_VALIDATION: 'validation/RESET_VALIDATION',
};

/**
 * Ações emitidas pelo DashboardService para gerenciar a exibição centralizada de dados na página inicial
 * @namespace DASHBOARD_ACTIONS
 * @enum {string}
 * @property {string} FETCH_START - Disparada quando inicia a busca de dados agregados para o dashboard.
 * @property {string} FETCH_SUCCESS - Disparada quando os dados do dashboard são obtidos com sucesso.
 * @property {string} FETCH_FAILURE - Disparada quando ocorre uma falha na obtenção dos dados do dashboard.
 * @property {string} UPDATE_MESSAGES - Disparada para atualizar o resumo de mensagens exibido no dashboard.
 * @property {string} UPDATE_NOTIFICATIONS - Disparada para atualizar o resumo de notificações exibido no dashboard.
 * @property {string} UPDATE_CONNECTIONS - Disparada para atualizar o resumo de conexões exibido no dashboard.
 * @property {string} UPDATE_CAIXINHAS - Disparada para atualizar o resumo de caixinhas exibido no dashboard.
 * @property {string} CLEAR_STATE - Disparada para limpar todos os dados do dashboard do estado da aplicação.
 */
export const DASHBOARD_ACTIONS = {
  FETCH_START: 'dashboard/FETCH_START',
  FETCH_SUCCESS: 'dashboard/FETCH_SUCCESS',
  FETCH_FAILURE: 'dashboard/FETCH_FAILURE',
  UPDATE_MESSAGES: 'dashboard/UPDATE_MESSAGES',
  UPDATE_NOTIFICATIONS: 'dashboard/UPDATE_NOTIFICATIONS',
  UPDATE_CONNECTIONS: 'dashboard/UPDATE_CONNECTIONS',
  UPDATE_CAIXINHAS: 'dashboard/UPDATE_CAIXINHAS',
  CLEAR_STATE: 'dashboard/CLEAR_STATE'
};