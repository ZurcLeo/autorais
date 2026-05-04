// src/demo/DemoProvider.js
// Re-provê todos os contextos da aplicação com dados seed fictícios.
// Funciona pela propriedade fundamental do React Context: o provider mais
// próximo na árvore de componentes vence. Componentes reais dentro do
// DemoProvider leem dados demo sem nenhuma modificação.
// Zero chamadas ao backend. Zero dados reais. Zero risco de segurança.

import React from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { CaixinhaContext } from '../providers/CaixinhaProvider';
import { MessageContext } from '../providers/MessageProvider';
import { NotificationContext } from '../providers/NotificationProvider';
import { ConnectionContext } from '../providers/ConnectionProvider';
import { DashboardContext } from '../context/DashboardContext';
import {
  demoUser,
  demoCaixinha,
  demoMembers,
  demoContributions,
  demoTransactions,
  demoLoans,
  demoFriends,
  demoMessages,
  demoConversations,
  demoNotifications,
} from './demoSeedData';

// Função noop reutilizada para todas as operações de escrita
const noop = () => Promise.resolve();

// ─── Auth ────────────────────────────────────────────────────────────────────

const demoAuthValue = {
  isAuthenticated: true,
  userId: demoUser.uid,
  currentUser: demoUser,
  authLoading: false,
  isInitialized: true,
  serviceReady: true,
  error: null,
  isFirstAccess: false,
  needsProfileUpdate: false,
  login: noop,
  register: noop,
  registerWithProvider: noop,
  loginWithGoogle: noop,
  loginWithMicrosoft: noop,
  logout: noop,
  switchAccount: noop,
};

// ─── Caixinha ─────────────────────────────────────────────────────────────────

const demoCaixinhaValue = {
  caixinhas: { caixinhas: [demoCaixinha] },
  currentCaixinha: demoCaixinha,
  contributions: demoContributions,
  members: demoMembers,
  emprestimos: demoLoans,
  transacoes: demoTransactions,
  relatorios: { geral: null, contribuicoes: null, participacao: null, transacoes: null },
  loading: false,
  error: null,
  creating: false,
  updating: false,
  lastUpdated: Date.now(),
  serviceReady: demoUser,
  createCaixinha: noop,
  getMembers: () => Promise.resolve(demoMembers),
  updateCaixinha: noop,
  deleteCaixinha: noop,
  getCaixinha: () => Promise.resolve(demoCaixinha),
  getCaixinhas: () => Promise.resolve({ caixinhas: [demoCaixinha] }),
  joinCaixinha: noop,
  leaveCaixinha: noop,
  addContribution: noop,
  getContributions: () => Promise.resolve(demoContributions),
  inviteMember: noop,
  processCaixinhaData: (x) => x,
};

// ─── Messages ────────────────────────────────────────────────────────────────

const demoMessageValue = {
  messages: demoMessages,
  conversations: demoConversations,
  activeChat: null,
  unreadCounts: { 'demo-user-3': 1 },
  latestMessages: {},
  isLoading: false,
  isInitialized: true,
  error: null,
  fetchMessages: noop,
  createMessage: noop,
  sendMessage: noop,
  markMessagesAsRead: noop,
  updateMessageStatus: noop,
  deleteMessage: noop,
  setActiveChat: noop,
  updateTypingStatus: noop,
  joinChatRoom: noop,
  leaveChatRoom: noop,
};

// ─── Notifications ───────────────────────────────────────────────────────────

const demoNotificationValue = {
  notifications: demoNotifications,
  unreadCount: demoNotifications.filter((n) => !n.read).length,
  notifLoading: false,
  error: null,
  lastUpdated: Date.now(),
  nextFetchTime: null,
  cacheExpiration: null,
  isNotificationsInitialized: true,
  markAsRead: noop,
  clearAllNotifications: noop,
  refreshNotifications: noop,
};

// ─── Connections ─────────────────────────────────────────────────────────────

const demoConnectionState = {
  friends: demoFriends,
  bestFriends: [demoFriends[0]],
  connections: demoFriends,
  pendingRequests: [],
  loading: false,
};

const demoConnectionValue = {
  ...demoConnectionState,
  isInitialized: true,
  isConnected: false,
  state: demoConnectionState,
  addBestFriend: noop,
  removeBestFriend: noop,
  deleteConnection: noop,
  getPendingRequests: () => Promise.resolve([]),
  getPendingRequestsAsSender: () => Promise.resolve([]),
  createConnectionRequest: noop,
  acceptConnectionRequest: noop,
  rejectConnectionRequest: noop,
  blockUser: noop,
  searchUsers: () => Promise.resolve([]),
  smartSearchUsers: () => Promise.resolve([]),
  refreshConnections: noop,
  getConnectionsFromCache: () => demoFriends,
  refreshConnectionCache: noop,
};

// ─── Dashboard ───────────────────────────────────────────────────────────────

const demoDashboardValue = {
  messages: demoMessages,
  notifications: demoNotifications,
  connections: { friends: demoFriends, bestFriends: [demoFriends[0]] },
  caixinhas: [demoCaixinha],
  loading: false,
  error: null,
  lastUpdated: Date.now(),
  fetchDashboardData: noop,
  refreshDashboard: noop,
  updateMessages: noop,
  updateNotifications: noop,
  updateConnections: noop,
  updateCaixinhas: noop,
};

// ─── Provider composto ───────────────────────────────────────────────────────

const DemoProvider = ({ children }) => (
  <AuthContext.Provider value={demoAuthValue}>
    <NotificationContext.Provider value={demoNotificationValue}>
      <ConnectionContext.Provider value={demoConnectionValue}>
        <MessageContext.Provider value={demoMessageValue}>
          <CaixinhaContext.Provider value={demoCaixinhaValue}>
            <DashboardContext.Provider value={demoDashboardValue}>
              {children}
            </DashboardContext.Provider>
          </CaixinhaContext.Provider>
        </MessageContext.Provider>
      </ConnectionContext.Provider>
    </NotificationContext.Provider>
  </AuthContext.Provider>
);

export default DemoProvider;
