// src/demo/demoSeedData.js
// Dados realistas para o modo de demonstração.
// Nenhum dado real é acessado — tudo aqui é fictício e gerado localmente.

const DEMO_USER_ID = 'demo-user';
const DEMO_CAIXINHA_ID = 'demo-caixinha-1';

const now = Date.now();
const h = 3600000;   // ms em 1 hora
const d = 86400000;  // ms em 1 dia

// ─── Usuário demo ───────────────────────────────────────────────────────────

export const demoUser = {
  uid: DEMO_USER_ID,
  email: 'joao.silva@exemplo.com',
  displayName: 'João Silva',
  name: 'João Silva',
  photoURL: null,
  isDemo: true,
  isOwnerOrAdmin: false,
  roles: ['client'],
  role: 'client',
  permissions: [],
  isAdmin: false,
  phone: '(11) 9 8765-4321',
  createdAt: new Date(now - 30 * d).toISOString(),
};

// ─── Membros da caixinha ─────────────────────────────────────────────────────

export const demoMembers = [
  {
    uid: DEMO_USER_ID,
    displayName: 'João Silva',
    email: 'joao.silva@exemplo.com',
    role: 'caixinhaManager',
    isAdmin: true,
    joinedAt: new Date(now - 30 * d).toISOString(),
    avatar: null,
  },
  {
    uid: 'demo-user-2',
    displayName: 'Maria Oliveira',
    email: 'maria.oliveira@exemplo.com',
    role: 'caixinhaMember',
    isAdmin: false,
    joinedAt: new Date(now - 30 * d).toISOString(),
    avatar: null,
  },
  {
    uid: 'demo-user-3',
    displayName: 'Carlos Mendes',
    email: 'carlos.mendes@exemplo.com',
    role: 'caixinhaMember',
    isAdmin: false,
    joinedAt: new Date(now - 30 * d).toISOString(),
    avatar: null,
  },
  {
    uid: 'demo-user-4',
    displayName: 'Ana Lima',
    email: 'ana.lima@exemplo.com',
    role: 'caixinhaMember',
    isAdmin: false,
    joinedAt: new Date(now - 28 * d).toISOString(),
    avatar: null,
  },
  {
    uid: 'demo-user-5',
    displayName: 'Pedro Costa',
    email: 'pedro.costa@exemplo.com',
    role: 'caixinhaMember',
    isAdmin: false,
    joinedAt: new Date(now - 25 * d).toISOString(),
    avatar: null,
  },
];

// ─── Caixinha ────────────────────────────────────────────────────────────────

export const demoCaixinha = {
  id: DEMO_CAIXINHA_ID,
  name: 'Caixinha da Família',
  description: 'Fundo coletivo para despesas e emergências familiares',
  adminId: DEMO_USER_ID,
  balance: 3400,
  totalContributions: 5000,
  contributionAmount: 200,
  frequency: 'monthly',
  memberCount: demoMembers.length,
  members: demoMembers,
  createdAt: new Date(now - 30 * d).toISOString(),
  status: 'active',
  pixKey: null,
};

// ─── Contribuições ───────────────────────────────────────────────────────────

export const demoContributions = [
  { id: 'c1', caixinhaId: DEMO_CAIXINHA_ID, userId: DEMO_USER_ID,      userName: 'João Silva',    amount: 200, status: 'confirmed', createdAt: new Date(now - 5 * d).toISOString() },
  { id: 'c2', caixinhaId: DEMO_CAIXINHA_ID, userId: 'demo-user-2',     userName: 'Maria Oliveira', amount: 200, status: 'confirmed', createdAt: new Date(now - 5 * d).toISOString() },
  { id: 'c3', caixinhaId: DEMO_CAIXINHA_ID, userId: 'demo-user-3',     userName: 'Carlos Mendes', amount: 200, status: 'confirmed', createdAt: new Date(now - 5 * d).toISOString() },
  { id: 'c4', caixinhaId: DEMO_CAIXINHA_ID, userId: 'demo-user-4',     userName: 'Ana Lima',      amount: 200, status: 'pending',   createdAt: new Date(now - 2 * d).toISOString() },
  { id: 'c5', caixinhaId: DEMO_CAIXINHA_ID, userId: 'demo-user-5',     userName: 'Pedro Costa',   amount: 200, status: 'pending',   createdAt: new Date(now - 1 * d).toISOString() },
];

// ─── Empréstimos ─────────────────────────────────────────────────────────────

export const demoLoans = [
  {
    id: 'l1',
    caixinhaId: DEMO_CAIXINHA_ID,
    userId: 'demo-user-2',
    userName: 'Maria Oliveira',
    amount: 500,
    remainingAmount: 300,
    status: 'active',
    dueDate: new Date(now + 20 * d).toISOString(),
    createdAt: new Date(now - 10 * d).toISOString(),
  },
  {
    id: 'l2',
    caixinhaId: DEMO_CAIXINHA_ID,
    userId: 'demo-user-3',
    userName: 'Carlos Mendes',
    amount: 800,
    remainingAmount: 800,
    status: 'pending',
    dueDate: new Date(now + 30 * d).toISOString(),
    createdAt: new Date(now - 1 * d).toISOString(),
  },
];

// ─── Transações ──────────────────────────────────────────────────────────────

export const demoTransactions = [
  { id: 't1', type: 'contribution', userName: 'João Silva',    amount:  200, createdAt: new Date(now - 5 * d).toISOString(), status: 'confirmed' },
  { id: 't2', type: 'contribution', userName: 'Maria Oliveira', amount:  200, createdAt: new Date(now - 5 * d).toISOString(), status: 'confirmed' },
  { id: 't3', type: 'contribution', userName: 'Carlos Mendes', amount:  200, createdAt: new Date(now - 5 * d).toISOString(), status: 'confirmed' },
  { id: 't4', type: 'loan',         userName: 'Maria Oliveira', amount: -500, createdAt: new Date(now - 10 * d).toISOString(), status: 'confirmed' },
  { id: 't5', type: 'loan_payment', userName: 'Maria Oliveira', amount:  200, createdAt: new Date(now - 3 * d).toISOString(), status: 'confirmed' },
];

// ─── Conexões ────────────────────────────────────────────────────────────────

export const demoFriends = [
  { uid: 'demo-user-2', displayName: 'Maria Oliveira', email: 'maria.oliveira@exemplo.com', connectionType: 'friend', connectedAt: new Date(now - 30 * d).toISOString(), avatar: null },
  { uid: 'demo-user-3', displayName: 'Carlos Mendes',  email: 'carlos.mendes@exemplo.com',  connectionType: 'friend', connectedAt: new Date(now - 28 * d).toISOString(), avatar: null },
  { uid: 'demo-user-4', displayName: 'Ana Lima',       email: 'ana.lima@exemplo.com',        connectionType: 'friend', connectedAt: new Date(now - 25 * d).toISOString(), avatar: null },
  { uid: 'demo-user-5', displayName: 'Pedro Costa',    email: 'pedro.costa@exemplo.com',     connectionType: 'friend', connectedAt: new Date(now - 20 * d).toISOString(), avatar: null },
];

// ─── Mensagens ───────────────────────────────────────────────────────────────

export const demoMessages = [
  { id: 'm1', senderId: 'demo-user-2', receiverId: DEMO_USER_ID, text: 'Oi João! Já vi que minha contribuição caiu na caixinha 😊',        createdAt: new Date(now - 3 * h).toISOString(), read: true,  senderName: 'Maria Oliveira' },
  { id: 'm2', senderId: DEMO_USER_ID,  receiverId: 'demo-user-2', text: 'Ótimo Maria! A gente está perto da meta do mês.',                 createdAt: new Date(now - 2 * h).toISOString(), read: true,  senderName: 'João Silva' },
  { id: 'm3', senderId: 'demo-user-3', receiverId: DEMO_USER_ID, text: 'João, posso solicitar empréstimo esta semana?',                     createdAt: new Date(now - 1 * h).toISOString(), read: false, senderName: 'Carlos Mendes' },
];

export const demoConversations = [
  {
    id: 'conv-1',
    participants: [DEMO_USER_ID, 'demo-user-2'],
    lastMessage: demoMessages[1],
    unreadCount: 0,
    participantName: 'Maria Oliveira',
    participantAvatar: null,
  },
  {
    id: 'conv-2',
    participants: [DEMO_USER_ID, 'demo-user-3'],
    lastMessage: demoMessages[2],
    unreadCount: 1,
    participantName: 'Carlos Mendes',
    participantAvatar: null,
  },
];

// ─── Notificações ────────────────────────────────────────────────────────────

export const demoNotifications = [
  {
    id: 'n1',
    type: 'contribution',
    title: 'Contribuição confirmada',
    message: 'Maria Oliveira contribuiu R$ 200 na Caixinha da Família',
    read: false,
    createdAt: new Date(now - 3 * h).toISOString(),
  },
  {
    id: 'n2',
    type: 'loan_request',
    title: 'Solicitação de empréstimo',
    message: 'Carlos Mendes solicitou empréstimo de R$ 800',
    read: false,
    createdAt: new Date(now - 1 * h).toISOString(),
  },
  {
    id: 'n3',
    type: 'reminder',
    title: 'Contribuição próxima',
    message: 'Sua contribuição de R$ 200 vence em 3 dias',
    read: true,
    createdAt: new Date(now - 2 * d).toISOString(),
  },
];
