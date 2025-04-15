/**
 * @fileoverview Define constantes e configurações globais utilizadas na aplicação.
 */
/**
 * Eventos relacionados à autenticação do usuário.
 * @namespace AUTH_EVENTS
 * @enum {string}
 * @property {string} USER_SIGNED_IN - Indica que um usuário realizou login com sucesso.
 * Disparado após a autenticação bem-sucedida, carregando os dados do usuário na aplicação.
 * @property {string} USER_SIGNED_OUT - Indica que um usuário encerrou a sessão.
 * Disparado ao realizar logout, limpando os dados do usuário da aplicação.
 * @property {string} AUTH_ERROR - Indica que ocorreu um erro durante o processo de autenticação.
 * Disparado em falhas de login, registro ou ao obter dados de autenticação.
 */
export const AUTH_EVENTS = {
  // Eventos de inicialização e verificação
  AUTH_INITIALIZED: 'auth/AUTH_INITIALIZED',       // Serviço iniciado
  AUTH_SESSION_VALID: 'auth/AUTH_SESSION_VALID',   // Sessão válida encontrada
  AUTH_SESSION_INVALID: 'auth/AUTH_SESSION_INVALID', // Sessão inválida ou expirada
  SESSION_EXPIRED: 'auth/SESSION_EXPIRED',         // Sessão expirou durante uso
  PROFILE_UPDATE_NEEDED: 'auth/PROFILE_UPDATE_NEEDED', // Perfil do usuário precisa ser atualizado
  // Eventos de autenticação
  AUTH_LOGIN_START: 'auth/AUTH_LOGIN_START',       // Início do processo de login
  AUTH_LOGIN_COMPLETED: 'auth/AUTH_LOGIN_COMPLETED', // Login concluído (sucesso ou falha)
  USER_SIGNED_IN: 'auth/USER_SIGNED_IN',           // Usuário autenticado com sucesso
  
  // Eventos de logout
  AUTH_LOGOUT_START: 'auth/AUTH_LOGOUT_START',     // Início do processo de logout
  AUTH_LOGOUT_COMPLETED: 'auth/AUTH_LOGOUT_COMPLETED', // Logout concluído
  USER_SIGNED_OUT: 'auth/USER_SIGNED_OUT',         // Usuário desautenticado
  
  FIRST_ACCESS_NEEDED: 'auth/FIRST_ACCESS_NEEDED', // Primeira vez que o usuário acessa o sistema
  FIRST_ACCESS_DETECTED: 'auth/FIRST_ACCESS_DETECTED', // Primeira vez que o usuário acessa o sistema
  REGISTER_COMPLETED: 'auth/REGISTER_COMPLETED',
  // Eventos de erro
  AUTH_ERROR: 'auth/AUTH_ERROR'                    // Erro durante autenticação
};

/**
 * Eventos relacionados à autenticação do usuário.
 * @namespace USER_PREFS_EVENTS
 * @enum {string}
 */
export const USER_PREFS_EVENTS = {
  PREFS_INITIALIZED: 'userPrefs/PREFS_INITIALIZED',
  PREFS_LOADED: 'userPrefs/PREFS_LOADED',
  PREFS_UPDATED: 'userPrefs/PREFS_UPDATED',
  PREFS_RESET: 'userPrefs/PREFS_RESET',
  PREFS_IMPORTED: 'userPrefs/PREFS_IMPORTED',
  PREFS_ERROR: 'userPrefs/PREFS_ERROR',
  COOKIE_CONSENT_UPDATED: 'userPrefs/COOKIE_CONSENT_UPDATED',
  THEME_UPDATED: 'userPrefs/THEME_UPDATED',
  LANGUAGE_UPDATED: 'userPrefs/LANGUAGE_UPDATED',
  ACCESSIBILITY_UPDATED: 'userPrefs/ACCESSIBILITY_UPDATED'
};

/**
 * Eventos relacionados à autenticação do usuário.
 * @namespace INTERESTS_EVENTS
 * @enum {string}
 */
export const INTERESTS_EVENTS = {
  FETCH_USER_INTERESTS_SUCCESS: 'interests/FETCH_USER_INTERESTS_SUCCESS',
  FETCH_USER_INTERESTS_FAILURE: 'interests/FETCH_USER_INTERESTS_FAILURE',
  FETCH_USER_INTERESTS_START: 'interests/FETCH_USER_INTERESTS_START',
  UPDATE_SUCCESS: 'interests/UPDATE_INTERESTS_SUCCESS',
  UPDATE_FAILURE: 'interests/UPDATE_INTERESTS_FAILURE',
  USER_INTERESTS_UPDATED: 'interests/USER_INTERESTS_UPDATED',
  UPDATE_START: 'interests/UPDATE_START',
  FETCH_CATEGORIES_SUCCESS: 'interests/FETCH_CATEGORIES_SUCCESS',
  FETCH_CATEGORIES_FAILURE: 'interests/FETCH_CATEGORIES_FAILURE',
  FETCH_CATEGORIES_START: 'interests/FETCH_CATEGORIES_START',
  CATEGORIES_UPDATED: 'interests/CATEGORIES_UPDATED',
  INTERESTS_UPDATE_ERROR: 'interests/INTERESTS_UPDATE_ERROR',
};

/**
 * Eventos relacionados à autenticação do usuário.
 * @namespace INVITATION_EVENTS
 * @enum {string}
 */
export const INVITATION_EVENTS = {
  INVITATIONS_FETCHED: 'invites/INVITATIONS_FETCHED',
  INVITATION_SENT: 'invites/INVITATION_SENT',
  INVITATION_CANCELED: 'invites/INVITATION_CANCELED',
  INVITATION_INVALIDATED: 'invites/INVITATION_INVALIDATED',
  INVITATION_RESENT: 'invites/INVITATION_RESENT',
  INVITATION_VALIDATED: 'invites/INVITATION_VALIDATED',
  INVITATIONS_CLEARED: 'invites/INVITATIONS_CLEARED',
  FETCH_START: 'invites/FETCH_START',
  FETCH_FAILURE: 'invites/FETCH_FAILURE',
  SEND_START: 'invites/SEND_START',
  SEND_FAILURE: 'invites/SEND_FAILURE'
};

/**
 * Eventos relacionados ao gerenciamento de caixinhas (grupos de contribuição).
 * @namespace CAIXINHA_EVENTS
 * @enum {string}
 * @property {string} CAIXINHAS_FETCHED - Indica que a lista de caixinhas do usuário foi recuperada.
 * Disparado ao obter todas as caixinhas de um usuário.
 * @property {string} CAIXINHA_FETCHED - Indica que os dados de uma caixinha específica foram recuperados.
 * Disparado ao buscar os detalhes de uma única caixinha.
 * @property {string} CAIXINHA_CREATED - Indica que uma nova caixinha foi criada.
 * Disparado após a criação bem-sucedida de uma nova caixinha.
 * @property {string} CAIXINHA_UPDATED - Indica que os dados de uma caixinha foram atualizados.
 * Disparado ao modificar os detalhes de uma caixinha existente.
 * @property {string} CAIXINHA_DELETED - Indica que uma caixinha foi excluída.
 * Disparado após a remoção de uma caixinha da lista do usuário.
 * @property {string} CONTRIBUICAO_ADDED - Indica que uma nova contribuição foi adicionada a uma caixinha.
 * Disparado ao adicionar uma contribuição financeira ou de outro tipo à caixinha.
 * @property {string} CONTRIBUICOES_FETCHED - Indica que as contribuições de uma caixinha foram recuperadas.
 * Disparado ao buscar o histórico de contribuições de uma caixinha.
 * @property {string} MEMBER_INVITED - Indica que um novo membro foi convidado para a caixinha.
 * Disparado ao enviar um convite para um usuário participar da caixinha.
 * @property {string} MEMBER_LEFT - Indica que um membro saiu da caixinha.
 * Disparado quando um usuário remove a si mesmo ou é removido da caixinha.
 */
export const CAIXINHA_EVENTS = {
  CAIXINHAS_FETCHED: 'caixinhas/CAIXINHAS_FETCHED',
  CAIXINHA_FETCHED: 'caixinhas/CAIXINHA_FETCHED',
  CAIXINHA_CREATED: 'caixinhas/CAIXINHA_CREATED',
  CAIXINHA_UPDATED: 'caixinhas/CAIXINHA_UPDATED',
  CAIXINHA_DELETED: 'caixinhas/CAIXINHA_DELETED',
  CONTRIBUICAO_ADDED: 'caixinhas/CONTRIBUICAO_ADDED',
  CONTRIBUICOES_FETCHED: 'caixinhas/CONTRIBUICOES_FETCHED',
  MEMBER_INVITED: 'caixinhas/MEMBER_INVITED',
  MEMBER_LEFT: 'caixinhas/MEMBER_LEFT'
};

/**
 * Eventos relacionados ao gerenciamento de conexões (amigos/seguidores).
 * @namespace CONNECTION_EVENTS
 * @enum {string}
 * @property {string} CONNECTIONS_FETCHED - Indica que a lista de conexões do usuário foi recuperada.
 * Disparado ao buscar a lista de amigos/seguidores do usuário.
 * @property {string} CONNECTION_UPDATED - Indica que os dados de uma conexão foram atualizados.
 * Disparado ao modificar informações de uma conexão existente.
 * @property {string} BEST_FRIEND_ADDED - Indica que um usuário foi adicionado à lista de melhores amigos.
 * Disparado ao classificar um usuário como melhor amigo.
 * @property {string} BEST_FRIEND_REMOVED - Indica que um usuário foi removido da lista de melhores amigos.
 * Disparado ao remover um usuário da lista de melhores amigos.
 * @property {string} CONNECTION_DELETED - Indica que uma conexão foi removida.
 * Disparado ao desfazer a amizade/seguimento de um usuário.
 * @property {string} CONNECTION_REQUESTED - Indica que uma solicitação de conexão foi enviada.
 * Disparado ao solicitar amizade/seguimento de um usuário.
 * @property {string} USERS_SEARCH_COMPLETED - Indica que a busca por usuários foi concluída.
 * Disparado após o término de uma busca por usuários na plataforma.
 */
export const CONNECTION_EVENTS = {
  CONNECTIONS_FETCHED: 'connections/CONNECTIONS_FETCHED',
  CONNECTION_UPDATED: 'connections/CONNECTION_UPDATED',
  BEST_FRIEND_ADDED: 'connections/BEST_FRIEND_ADDED',
  BEST_FRIEND_REMOVED: 'connections/BEST_FRIEND_REMOVED',
  CONNECTION_DELETED: 'connections/CONNECTION_DELETED',
  CONNECTION_REQUESTED: 'connections/CONNECTION_REQUESTED',
  REQUESTED_CONNECTIONS_LOADED: 'connections/REQUESTED_CONNECTIONS_LOADED',
  CONNECTION_REQUEST_ACCEPTED: 'connections/CONNECTION_REQUEST_ACCEPTED',
  CONNECTION_REQUEST_REJECTED: 'connections/CONNECTION_REQUEST_REJECTED',
  SEARCH_COMPLETED: 'connections/SEARCH_COMPLETED',
  SENT_REQUESTS_LOADED: 'connections/SENT_REQUESTS_LOADED',
  USER_BLOCKED: 'connections/USER_BLOCKED',
  CLEAR_STATE: 'connections/CLEAR_STATE',
  SEARCH_STARTED: 'connections/SEARCH_STARTED',
  SEARCH_ERROR: 'connections/SEARCH_ERROR',
  FETCH_FAILURE: 'connections/FETCH_FAILURE',
  USERS_SEARCH_COMPLETED: 'connections/USERS_SEARCH_COMPLETED'
};

/**
 * Eventos relacionados ao gerenciamento de notificações.
 * @namespace NOTIFICATION_EVENTS
 * @enum {string}
 * @property {string} NOTIFICATIONS_FETCHED - Indica que a lista de notificações do usuário foi recuperada.
 * Disparado ao buscar todas as notificações do usuário.
 * @property {string} NOTIFICATION_CREATED - Indica que uma nova notificação foi gerada.
 * Disparado ao criar uma nova notificação para o usuário.
 * @property {string} NOTIFICATION_MARKED_READ - Indica que uma notificação foi marcada como lida.
 * Disparado ao alterar o status de uma notificação para lida.
 * @property {string} ALL_NOTIFICATIONS_CLEARED - Indica que todas as notificações foram apagadas.
 * Disparado ao remover todas as notificações do usuário.
 */
export const NOTIFICATION_EVENTS = {
  NOTIFICATIONS_FETCHED: 'notifications/NOTIFICATIONS_FETCHED',
  NOTIFICATION_CREATED: 'notifications/NOTIFICATION_CREATED',
  NOTIFICATION_MARKED_READ: 'notifications/NOTIFICATION_MARKED_READ',
  ALL_NOTIFICATIONS_CLEARED: 'notifications/ALL_NOTIFICATIONS_CLEARED',
  NEW_NOTIFICATION: 'notifications/NEW_NOTIFICATION',
  NOTIFICATION_READ: 'notifications/NOTIFICATION_READ',
  CLEAR_NOTIFICATIONS: 'notifications/CLEAR_NOTIFICATIONS',
};

/**
 * Eventos relacionados ao gerenciamento de perfis de usuário.
 * @namespace USER_EVENTS
 * @enum {string}
 * @property {string} PROFILE_FETCHED - Indica que os dados do perfil do usuário foram recuperados.
 * Disparado ao buscar os detalhes do perfil do usuário.
 * @property {string} PROFILE_UPDATED - Indica que o perfil do usuário foi atualizado.
 * Disparado ao modificar informações do perfil do usuário.
 * @property {string} PROFILE_PICTURE_UPDATED - Indica que a foto de perfil do usuário foi atualizada.
 * Disparado ao alterar a foto de perfil do usuário.
 * @property {string} USER_DELETED - Indica que o perfil do usuário foi excluído.
 * Disparado ao remover a conta do usuário da plataforma.
 * @property {string} USER_ADDED - Indica que um novo usuário foi adicionado.
 * Disparado ao criar um novo perfil de usuário.
 * @property {string} USERS_LIST_FETCHED - Indica que a lista de usuários foi recuperada.
 * Disparado ao buscar a lista completa de usuários da plataforma.
 */
export const USER_EVENTS = {
  // Eventos de inicialização
  SERVICE_INITIALIZED: 'user/SERVICE_INITIALIZED', // Serviço de usuário inicializado
  PROFILE_UPDATE_NEEDED: 'user/PROFILE_UPDATE_NEEDED', // Atualização do perfil do usuário necessária
  // Eventos de carregamento de dados
  FETCHING_USER: 'user/FETCHING_USER',             // Iniciando busca por usuário
  PROFILE_FETCHED: 'user/PROFILE_FETCHED',         // Perfil obtido com sucesso
  PROFILE_COMPLETED: 'user/PROFILE_COMPLETED',   // Perfil completo obtido com sucesso
  
  // Eventos de atualização
  PROFILE_UPDATED: 'user/PROFILE_UPDATED',         // Perfil foi atualizado
  PROFILE_PICTURE_UPDATED: 'user/PROFILE_PICTURE_UPDATED', // Foto do perfil atualizada
  
  // Eventos de gerenciamento de usuário
  USER_DELETED: 'user/USER_DELETED',               // Usuário excluído
  USER_SIGN_IN: 'user/USER_SIGN_IN',               // Usuário com perfil completo
  NEW_USER_SIGN_IN: 'user/NEW_USER_SIGN_IN',       // Novo usuário ou perfil incompleto
  USER_SESSION_READY: 'user/USER_SESSION_READY',   // Perfil carregado e pronto
  USERS_LIST_FETCHED: 'user/USERS_LIST_FETCHED',   // Lista de usuários obtida
  USER_ADDED: 'user/USER_ADDED',   
  USER_ERROR: 'user/USER_ERROR'                 // Novo usuário adicionado
};

/**
 * Eventos relacionados à autenticação do usuário.
 * @namespace MESSAGE_EVENTS
 * @enum {string}
 */
export const MESSAGE_EVENTS = {
  // Eventos de busca
  FETCH_START: 'messages/FETCH_START',
  FETCH_SUCCESS: 'messages/FETCH_SUCCESS',
  FETCH_FAILURE: 'messages/FETCH_FAILURE',
  
  // Eventos de atualização
  UPDATE_MESSAGES: 'messages/UPDATE_MESSAGES',
  UPDATE_LATEST_MESSAGE: 'messages/UPDATE_LATEST_MESSAGE',
  UPDATE_UNREAD_COUNT: 'messages/UPDATE_UNREAD_COUNT',
  UPDATE_MESSAGE_STATUS: 'messages/UPDATE_MESSAGE_STATUS',
  UPDATE_ACTIVE_CHATS: 'messages/UPDATE_ACTIVE_CHATS',
  
  // Eventos de tempo real
  NEW_MESSAGE_RECEIVED: 'messages/NEW_MESSAGE_RECEIVED',
  TYPING_STATUS_CHANGED: 'messages/TYPING_STATUS_CHANGED',
  RECONCILE_MESSAGE: 'messages/RECONCILE_MESSAGE',
  // Eventos de navegação
  ACTIVE_CHAT_CHANGED: 'messages/ACTIVE_CHAT_CHANGED',
  
  // Eventos de estado
  SET_ERROR: 'messages/SET_ERROR',
  MESSAGES_CLEARED: 'messages/MESSAGES_CLEARED',
  
  // Eventos de status
  MESSAGE_SENT: 'messages/MESSAGE_SENT',
  MESSAGE_DELIVERED: 'messages/MESSAGE_DELIVERED',
  MESSAGE_SEND_FAILED: 'messages/MESSAGE_SEND_FAILED',
  MESSAGE_READ: 'messages/MESSAGE_READ',
  MESSAGE_DELETED: 'messages/MESSAGE_DELETED'
};