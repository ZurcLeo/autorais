/**
 * Testes de regressão: AuthService — modo degradado
 *
 * Invariantes cobertos:
 *  1. ERR_NETWORK em _exchangeToken → emite AUTH_SESSION_VALID (não AUTH_ERROR)
 *  2. ECONNABORTED → mesmo comportamento do ERR_NETWORK
 *  3. !navigator.onLine → mesmo comportamento do ERR_NETWORK
 *  4. Modo degradado → _currentUser setado com dados do Firebase (não null)
 *  5. AUTH_ERROR NÃO emitido quando o erro é de rede (regressão da dupla emissão)
 *  6. Erro não-rede → AUTH_ERROR emitido (e NOT AUTH_SESSION_VALID)
 *  7. Backend online (happy path) → AUTH_SESSION_VALID emitido exatamente uma vez
 *  8. Usuário já autenticado com mesmo uid → token exchange é pulado
 *  9. Firebase user null + usuário anterior → USER_SIGNED_OUT emitido
 * 10. Firebase user null + sem usuário anterior → nenhum evento emitido
 */

// ─── Mocks (hoistados pelo babel antes dos imports) ─────────────────────────

jest.mock('../../../core/services/BaseService', () => {
  // Map compartilhado entre o mock e os testes
  const registeredServices = new Map();

  const serviceEventHub = {
    emit: jest.fn(),
    on: jest.fn().mockReturnValue(jest.fn()),
    off: jest.fn(),
    onAny: jest.fn().mockReturnValue(jest.fn()),
    offAny: jest.fn(),
  };

  const serviceLocator = {
    register: jest.fn((name, service) => registeredServices.set(name, service)),
    get: jest.fn(),
    _registeredServices: registeredServices,
  };

  class BaseService {
    constructor(serviceName) {
      this._serviceName = serviceName;
      this._metadata = {};
      this._isInitialized = false;
      this._registeredListeners = [];
      serviceLocator.register(serviceName, this);
    }

    _emitEvent(eventType, data = {}) {
      if (!eventType) return;
      const payload = {
        ...data,
        _metadata: { timestamp: Date.now(), sourceService: this._serviceName },
      };
      serviceEventHub.emit(this._serviceName, String(eventType), payload);
    }

    // Stubs suficientes para o AuthService funcionar
    _log() {}
    _logError() {}
    _executeWithRetry(fn) { return fn(); }
    get isInitialized() { return this._isInitialized; }
    get serviceName() { return this._serviceName; }
  }

  return { BaseService, serviceLocator, serviceEventHub };
});

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn().mockResolvedValue(undefined),
  onAuthStateChanged: jest.fn().mockReturnValue(jest.fn()),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  OAuthProvider: jest.fn().mockImplementation(() => ({
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
}));

jest.mock('../../../firebaseConfig', () => ({
  auth: { currentUser: null },
}));

// ─── Imports (após os mocks) ─────────────────────────────────────────────────

import { AUTH_EVENTS } from '../../../core/constants/events';
import { serviceEventHub, serviceLocator } from '../../../core/services/BaseService';
import { AuthService } from '../../../services/AuthService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retorna todos os eventTypes emitidos via serviceEventHub.emit */
const emittedEventTypes = () =>
  serviceEventHub.emit.mock.calls.map(([, eventType]) => eventType);

/** Retorna os dados do primeiro evento emitido com o eventType dado */
const firstEventData = (eventType) => {
  const call = serviceEventHub.emit.mock.calls.find(([, et]) => et === eventType);
  return call ? call[2] : undefined;
};

const makeNetworkError = (code) =>
  Object.assign(new Error('Network Error'), { code });

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockFirebaseUser = Object.freeze({
  uid: 'firebase-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
});

// ─── Setup ───────────────────────────────────────────────────────────────────

describe('AuthService — modo degradado (regressão)', () => {
  let authService;
  let mockApiService;
  let mockAuthTokenService;
  let firebaseUserWithToken;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Restaurar navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    // Limpar serviços registrados entre testes
    serviceLocator._registeredServices.clear();

    // Firebase user com getIdToken resolvendo normalmente
    firebaseUserWithToken = {
      ...mockFirebaseUser,
      getIdToken: jest.fn().mockResolvedValue('mock-firebase-token'),
    };

    // Mock dos serviços dependentes
    mockApiService = {
      post: jest.fn(),
      get: jest.fn(),
      isInitialized: true,
    };
    mockAuthTokenService = {
      setTokens: jest.fn(),
      isInitialized: true,
    };

    // Configurar serviceLocator.get antes de instanciar AuthService
    serviceLocator.get.mockImplementation((name) => {
      const services = {
        apiService: mockApiService,
        authToken: mockAuthTokenService,
      };
      return services[name] ?? null;
    });

    authService = new AuthService();
  });

  // ─── 1. Modo degradado: ERR_NETWORK ────────────────────────────────────────

  describe('quando backend retorna ERR_NETWORK', () => {
    beforeEach(() => {
      mockApiService.post.mockRejectedValue(makeNetworkError('ERR_NETWORK'));
    });

    it('deve emitir AUTH_SESSION_VALID', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).toContain(AUTH_EVENTS.AUTH_SESSION_VALID);
    });

    it('NÃO deve emitir AUTH_ERROR (regressão da dupla emissão)', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.AUTH_ERROR);
    });

    it('deve setar _currentUser com dados do Firebase (não null)', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(authService._currentUser).not.toBeNull();
      expect(authService._currentUser.uid).toBe(mockFirebaseUser.uid);
      expect(authService._currentUser.email).toBe(mockFirebaseUser.email);
    });

    it('AUTH_SESSION_VALID deve conter isAuthenticated: true', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      const data = firstEventData(AUTH_EVENTS.AUTH_SESSION_VALID);
      expect(data.isAuthenticated).toBe(true);
    });

    it('AUTH_SESSION_VALID deve conter userId do Firebase', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      const data = firstEventData(AUTH_EVENTS.AUTH_SESSION_VALID);
      expect(data.userId).toBe(mockFirebaseUser.uid);
    });
  });

  // ─── 2. Modo degradado: ECONNABORTED ───────────────────────────────────────

  describe('quando backend retorna ECONNABORTED', () => {
    beforeEach(() => {
      mockApiService.post.mockRejectedValue(makeNetworkError('ECONNABORTED'));
    });

    it('deve emitir AUTH_SESSION_VALID', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).toContain(AUTH_EVENTS.AUTH_SESSION_VALID);
    });

    it('NÃO deve emitir AUTH_ERROR', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.AUTH_ERROR);
    });

    it('deve setar _currentUser com dados do Firebase', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(authService._currentUser?.uid).toBe(mockFirebaseUser.uid);
    });
  });

  // ─── 3. Modo degradado: navigator.onLine = false ───────────────────────────

  describe('quando navigator.onLine é false', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      // Qualquer erro é suficiente — isNetworkError é true por !navigator.onLine
      mockApiService.post.mockRejectedValue(new Error('fetch failed'));
    });

    it('deve emitir AUTH_SESSION_VALID', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).toContain(AUTH_EVENTS.AUTH_SESSION_VALID);
    });

    it('NÃO deve emitir AUTH_ERROR', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.AUTH_ERROR);
    });
  });

  // ─── 4. Erro não-rede ───────────────────────────────────────────────────────

  describe('quando backend retorna erro não-rede (ex: 500)', () => {
    beforeEach(() => {
      mockApiService.post.mockRejectedValue(new Error('Internal Server Error'));
    });

    it('deve emitir AUTH_ERROR', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).toContain(AUTH_EVENTS.AUTH_ERROR);
    });

    it('NÃO deve emitir AUTH_SESSION_VALID', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.AUTH_SESSION_VALID);
    });

    it('AUTH_ERROR deve ser emitido exatamente uma vez (regressão da dupla emissão)', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      const authErrors = emittedEventTypes().filter(
        (et) => et === AUTH_EVENTS.AUTH_ERROR
      );
      expect(authErrors).toHaveLength(1);
    });

    it('deve manter _currentUser sem valor de usuário autenticado', async () => {
      // _currentUser começa como undefined (não inicializado no constructor).
      // O code path de erro não-rede não o seta explicitamente — toBeFalsy cobre null e undefined.
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(authService._currentUser).toBeFalsy();
    });
  });

  // ─── 5. Happy path: backend online ─────────────────────────────────────────

  describe('quando backend responde com sucesso', () => {
    beforeEach(() => {
      mockApiService.post.mockResolvedValue({
        data: {
          isAuthenticated: true,
          tokens: { accessToken: 'acc-token', refreshToken: 'ref-token', expiresIn: 3600 },
          user: {
            uid: 'backend-uid-456',
            email: 'test@example.com',
            nome: 'Test User',
          },
        },
      });
    });

    it('deve emitir AUTH_SESSION_VALID', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).toContain(AUTH_EVENTS.AUTH_SESSION_VALID);
    });

    it('AUTH_SESSION_VALID deve ser emitido exatamente uma vez', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      const count = emittedEventTypes().filter(
        (et) => et === AUTH_EVENTS.AUTH_SESSION_VALID
      ).length;
      expect(count).toBe(1);
    });

    it('NÃO deve emitir AUTH_ERROR', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.AUTH_ERROR);
    });

    it('deve setar _currentUser com uid retornado pelo backend', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(authService._currentUser?.uid).toBe('backend-uid-456');
    });

    it('deve armazenar tokens via AuthTokenService', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(mockAuthTokenService.setTokens).toHaveBeenCalledWith(
        'acc-token',
        'ref-token',
        3600
      );
    });
  });

  // ─── 6. Usuário já autenticado (mesmo uid) ──────────────────────────────────

  describe('quando _currentUser já tem o mesmo uid do Firebase user', () => {
    beforeEach(() => {
      authService._currentUser = { uid: mockFirebaseUser.uid };
    });

    it('deve pular o token exchange (apiService.post não é chamado)', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(mockApiService.post).not.toHaveBeenCalled();
    });

    it('não deve emitir AUTH_SESSION_VALID nem AUTH_ERROR', async () => {
      await authService._onAuthStateChanged(firebaseUserWithToken);
      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.AUTH_SESSION_VALID);
      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.AUTH_ERROR);
    });
  });

  // ─── 7. Firebase user null ──────────────────────────────────────────────────

  describe('quando Firebase user é null (logout)', () => {
    it('deve emitir USER_SIGNED_OUT quando havia usuário anterior', async () => {
      authService._currentUser = { uid: 'previous-uid' };
      mockApiService.post.mockResolvedValue({}); // backend logout (best-effort)

      await authService._onAuthStateChanged(null);

      expect(emittedEventTypes()).toContain(AUTH_EVENTS.USER_SIGNED_OUT);
    });

    it('USER_SIGNED_OUT deve conter previousUserId', async () => {
      authService._currentUser = { uid: 'previous-uid' };
      mockApiService.post.mockResolvedValue({});

      await authService._onAuthStateChanged(null);

      const data = firstEventData(AUTH_EVENTS.USER_SIGNED_OUT);
      expect(data.previousUserId).toBe('previous-uid');
      expect(data.isAuthenticated).toBe(false);
    });

    it('deve limpar _currentUser após logout', async () => {
      authService._currentUser = { uid: 'previous-uid' };
      mockApiService.post.mockResolvedValue({});

      await authService._onAuthStateChanged(null);

      expect(authService._currentUser).toBeNull();
    });

    it('NÃO deve emitir USER_SIGNED_OUT se não havia usuário anterior', async () => {
      authService._currentUser = null;

      await authService._onAuthStateChanged(null);

      expect(emittedEventTypes()).not.toContain(AUTH_EVENTS.USER_SIGNED_OUT);
    });

    it('deve emitir USER_SIGNED_OUT mesmo que o backend logout falhe', async () => {
      authService._currentUser = { uid: 'previous-uid' };
      mockApiService.post.mockRejectedValue(new Error('Backend offline'));

      await authService._onAuthStateChanged(null);

      expect(emittedEventTypes()).toContain(AUTH_EVENTS.USER_SIGNED_OUT);
    });
  });
});
