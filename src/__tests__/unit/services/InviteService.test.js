/**
 * @fileoverview Testes unitários para InviteService
 *
 * Bugs documentados:
 *
 * [BUG-001] POST /api/invite/generate → 400 quando displayName é null
 *   Local: frontend/src/services/InviteService/index.js
 *   Trecho problemático:
 *     senderName: invitationData.senderName || currentUser.displayName  // null quando não setado
 *     senderEmail: invitationData.senderEmail || currentUser.email      // null em phone auth
 *   O backend schema (Joi.string().optional()) rejeita null com 400.
 *   Fix: usar `|| undefined` para converter null → undefined antes de enviar.
 *
 * [BUG-002] resendInvitation envia { body: { userId } } em vez de { userId }
 *   Local: frontend/src/services/InviteService/index.js
 *   Axios não usa a chave "body" — o dado deve ser passado diretamente.
 */

// ---------------------------------------------------------------------------
// Mocks de módulos externos (necessário para instanciar InviteService)
// ---------------------------------------------------------------------------

jest.mock('../../../core/services/BaseService', () => ({
  BaseService: class MockBaseService {
    constructor(name) {
      this.serviceName = name;
      // Stubs necessários para o constructor de InviteService rodar sem erro
      this._log          = jest.fn();
      this._logError     = jest.fn();
      this._emitEvent    = jest.fn();
      this._executeWithRetry = jest.fn().mockImplementation(async (fn) => fn());
    }
  },
  serviceLocator: { get: jest.fn(() => null) },
  serviceEventHub: { emit: jest.fn(), on: jest.fn(), off: jest.fn() }
}));

jest.mock('../../../core/constants/actions', () => ({
  INVITATION_ACTIONS: {
    FETCH_START:   'FETCH_START',
    SEND_START:    'SEND_START',
    SEND_SUCCESS:  'SEND_SUCCESS',
    SEND_FAILURE:  'SEND_FAILURE'
  },
  SERVICE_ACTIONS: { SERVICE_READY: 'SERVICE_READY' }
}));

jest.mock('../../../core/constants/events', () => ({
  INVITATION_EVENTS: {
    INVITATIONS_FETCHED:    'INVITATIONS_FETCHED',
    INVITATIONS_CLEARED:    'INVITATIONS_CLEARED',
    INVITATION_CANCELED:    'INVITATION_CANCELED',
    INVITATION_INVALIDATED: 'INVITATION_INVALIDATED',
    INVITATION_RESENT:      'INVITATION_RESENT',
    INVITATION_VALIDATED:   'INVITATION_VALIDATED'
  }
}));

jest.mock('../../../core/constants/config', () => ({
  LOG_LEVELS: { LIFECYCLE: 'lifecycle', INITIALIZATION: 'init', WARNING: 'warning' }
}));

jest.mock('../../../core/logging', () => ({
  coreLogger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }
}));

// ---------------------------------------------------------------------------

const { InviteService } = require('../../../services/InviteService/index');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeCurrentUser = (overrides = {}) => ({
  uid: 'uid-remetente',
  displayName: 'Remetente Teste',
  email: 'remetente@eloscloud.com',
  ...overrides
});

const baseInvitationData = {
  email: 'amigo@eloscloud.com',
  friendName: 'Amigo Teste'
};

/**
 * Cria uma instância de InviteService com dependências injetadas diretamente.
 * Esse padrão contorna variações no comportamento de jest.mock entre versões do CRA.
 */
function makeService() {
  const mockPost = jest.fn();
  const mockGet  = jest.fn();
  const mockPut  = jest.fn();
  const mockGetCurrentUser = jest.fn();
  const mockEmitEvent      = jest.fn();
  const mockExecuteRetry   = jest.fn().mockImplementation(async (fn) => fn());
  const mockLogError       = jest.fn();

  const svc = new InviteService();

  // Injetar dependências diretamente na instância
  svc.apiService   = { post: mockPost, get: mockGet, put: mockPut };
  svc.authService  = { getCurrentUser: mockGetCurrentUser };
  svc._emitEvent        = mockEmitEvent;
  svc._executeWithRetry = mockExecuteRetry;
  svc._logError         = mockLogError;
  svc._log              = jest.fn();

  return {
    svc,
    mockPost, mockGet, mockPut,
    mockGetCurrentUser,
    mockEmitEvent,
    mockExecuteRetry,
    mockLogError
  };
}

// ---------------------------------------------------------------------------

describe('InviteService', () => {
  describe('sendInvitation', () => {
    it('deve lançar erro quando usuário não está autenticado', async () => {
      const { svc, mockPost, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(null);

      await expect(svc.sendInvitation(baseInvitationData))
        .rejects.toThrow(/não autenticado/i);

      expect(mockPost).not.toHaveBeenCalled();
    });

    it('deve enviar email e friendName corretos para a API', async () => {
      const { svc, mockPost, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser());
      mockPost.mockResolvedValue({ data: { id: 'invite-001' } });

      await svc.sendInvitation(baseInvitationData);

      const [url, body] = mockPost.mock.calls[0];
      expect(url).toBe('/api/invite/generate');
      expect(body.email).toBe('amigo@eloscloud.com');
      expect(body.friendName).toBe('Amigo Teste');
    });

    it('deve incluir userId, senderName e senderEmail no payload', async () => {
      const { svc, mockPost, mockGetCurrentUser } = makeService();
      const user = makeCurrentUser();
      mockGetCurrentUser.mockReturnValue(user);
      mockPost.mockResolvedValue({ data: { id: 'invite-001' } });

      await svc.sendInvitation(baseInvitationData);

      const [, body] = mockPost.mock.calls[0];
      expect(body.userId).toBe(user.uid);
      expect(body.senderName).toBe(user.displayName);
      expect(body.senderEmail).toBe(user.email);
    });

    it('não envia senderName quando currentUser.displayName é null (BUG-001 corrigido)', async () => {
      const { svc, mockPost, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser({ displayName: null }));
      mockPost.mockResolvedValue({ data: { id: 'invite-001' } });

      await svc.sendInvitation(baseInvitationData);

      const [, body] = mockPost.mock.calls[0];
      expect(body.senderName).toBeUndefined();
    });

    it('não envia senderEmail quando currentUser.email é null — phone auth (BUG-001 corrigido)', async () => {
      const { svc, mockPost, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser({ email: null }));
      mockPost.mockResolvedValue({ data: { id: 'invite-001' } });

      await svc.sendInvitation(baseInvitationData);

      const [, body] = mockPost.mock.calls[0];
      expect(body.senderEmail).toBeUndefined();
    });

    it('deve emitir SEND_START antes da requisição', async () => {
      const { svc, mockPost, mockGetCurrentUser, mockEmitEvent } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser());
      mockPost.mockResolvedValue({ data: { id: 'invite-001' } });

      await svc.sendInvitation(baseInvitationData);

      expect(mockEmitEvent).toHaveBeenCalledWith(
        expect.stringMatching(/SEND_START/i)
      );
    });

    it('deve emitir SEND_SUCCESS com invitation no payload após sucesso', async () => {
      const { svc, mockPost, mockGetCurrentUser, mockEmitEvent } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser());
      const invitation = { id: 'invite-001', email: 'amigo@eloscloud.com' };
      mockPost.mockResolvedValue({ data: invitation });

      await svc.sendInvitation(baseInvitationData);

      expect(mockEmitEvent).toHaveBeenCalledWith(
        expect.stringMatching(/SEND_SUCCESS/i),
        expect.objectContaining({ invitation })
      );
    });

    it('deve emitir SEND_FAILURE e relançar erro quando API retorna erro', async () => {
      const { svc, mockGetCurrentUser, mockEmitEvent, mockExecuteRetry } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser());
      const apiError = new Error('400 Bad Request');
      mockExecuteRetry.mockRejectedValue(apiError);

      await expect(svc.sendInvitation(baseInvitationData)).rejects.toThrow(apiError);

      expect(mockEmitEvent).toHaveBeenCalledWith(
        expect.stringMatching(/SEND_FAILURE/i),
        expect.objectContaining({ error: apiError.message })
      );
    });
  });

  // =========================================================================
  describe('resendInvitation', () => {
    it('deve lançar erro quando usuário não está autenticado', async () => {
      const { svc, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(null);

      await expect(svc.resendInvitation('invite-001'))
        .rejects.toThrow(/não autenticado/i);
    });

    // ----- BUG-002 -----
    it('[BUG-002] envia payload aninhado em body:{ } em vez do userId diretamente', async () => {
      const { svc, mockPost, mockGetCurrentUser } = makeService();
      const user = makeCurrentUser();
      mockGetCurrentUser.mockReturnValue(user);
      mockPost.mockResolvedValue({ data: {} });

      await svc.resendInvitation('invite-001');

      const [url, body] = mockPost.mock.calls[0];
      expect(url).toBe('/api/invite/resend/invite-001');

      // Documenta o bug: userId está dentro de body.body, não direto.
      // Após fix: expect(body.userId).toBe(user.uid) e expect(body.body).toBeUndefined()
      expect(body.body).toEqual({ userId: user.uid });
      expect(body.userId).toBeUndefined();
    });
  });

  // =========================================================================
  describe('cancelInvitation', () => {
    it('deve lançar erro quando usuário não está autenticado', async () => {
      const { svc, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(null);

      await expect(svc.cancelInvitation('invite-001'))
        .rejects.toThrow(/não autenticado/i);
    });

    it('deve chamar PUT /api/invite/cancel/:id', async () => {
      const { svc, mockPut, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser());
      mockPut.mockResolvedValue({ data: { success: true } });

      await svc.cancelInvitation('invite-001');

      expect(mockPut).toHaveBeenCalledWith('/api/invite/cancel/invite-001', {});
    });

    it('deve emitir INVITATION_CANCELED após sucesso', async () => {
      const { svc, mockPut, mockGetCurrentUser, mockEmitEvent } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser());
      mockPut.mockResolvedValue({ data: { success: true } });

      await svc.cancelInvitation('invite-001');

      expect(mockEmitEvent).toHaveBeenCalledWith(
        expect.stringMatching(/INVITATION_CANCELED/i),
        expect.objectContaining({ inviteId: 'invite-001' })
      );
    });
  });

  // =========================================================================
  describe('getSentInvitations', () => {
    it('deve retornar lista vazia quando usuário não está autenticado', async () => {
      const { svc, mockGet, mockGetCurrentUser } = makeService();
      mockGetCurrentUser.mockReturnValue(null);

      const result = await svc.getSentInvitations();

      expect(result).toEqual([]);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('deve buscar /api/invite/sent/:userId com uid correto', async () => {
      const { svc, mockGet, mockGetCurrentUser } = makeService();
      const user = makeCurrentUser();
      mockGetCurrentUser.mockReturnValue(user);
      mockGet.mockResolvedValue({ data: { invitations: [{ id: 'i1' }] } });

      await svc.getSentInvitations();

      expect(mockGet).toHaveBeenCalledWith(`/api/invite/sent/${user.uid}`);
    });

    it('deve retornar lista vazia em caso de erro de rede', async () => {
      const { svc, mockGetCurrentUser, mockExecuteRetry } = makeService();
      mockGetCurrentUser.mockReturnValue(makeCurrentUser());
      mockExecuteRetry.mockRejectedValue(new Error('Network Error'));

      const result = await svc.getSentInvitations();

      expect(result).toEqual([]);
    });
  });
});
