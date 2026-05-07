import { LOAN_EVENTS } from '../../../core/constants/events';

// Mocking BaseService components
jest.mock('../../../core/services/BaseService', () => {
  const registeredServices = new Map();
  const hub = {
    emit: jest.fn(),
    on: jest.fn(),
  };
  const locator = {
    register: jest.fn((name, service) => {
      registeredServices.set(name, service);
    }),
    get: jest.fn((name) => {
      return registeredServices.get(name);
    }),
    _registeredServices: registeredServices
  };
  return {
    serviceEventHub: hub,
    serviceLocator: locator,
    BaseService: class {
      constructor(name) {
        this._serviceName = name;
        this._isInitialized = false;
        locator.register(name, this);
      }
      _emitEvent(event, data) {
        hub.emit(this._serviceName, event, data);
      }
      _log() {}
      _logError() {}
      _logPerformance() {}
      async _executeWithRetry(fn) { return await fn(); }
      get isInitialized() { return this._isInitialized; }
    }
  };
});

describe('LoanService Integration', () => {
  let LoanService;
  let serviceEventHub;
  let serviceLocator;
  let loanService;
  let mockApiService;
  let mockAuthService;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    // Importar dinamicamente para garantir que usem os mocks
    const baseModule = require('../../../core/services/BaseService');
    serviceEventHub = baseModule.serviceEventHub;
    serviceLocator = baseModule.serviceLocator;
    
    const loanModule = require('../../../services/LoanService');
    LoanService = loanModule.LoanService;

    serviceLocator._registeredServices.clear();

    mockApiService = {
      get: jest.fn(),
      post: jest.fn()
    };

    mockAuthService = {
      getCurrentUser: jest.fn().mockReturnValue({ uid: 'user-123' })
    };

    serviceLocator.register('apiService', mockApiService);
    serviceLocator.register('auth', mockAuthService);

    if (typeof global.performance === 'undefined') {
      global.performance = { now: jest.fn().mockReturnValue(Date.now()) };
    }

    loanService = new LoanService();
  });

  it('deve buscar empréstimos e emitir LOANS_FETCHED', async () => {
    const loans = [{ id: 'l1' }];
    mockApiService.get.mockResolvedValue({ data: loans });

    const result = await loanService.getLoans('cx1');

    expect(result).toEqual(loans);
    expect(mockApiService.get).toHaveBeenCalledWith('/api/caixinha/cx1/emprestimos');
    expect(serviceEventHub.emit).toHaveBeenCalledWith(
      'loans',
      LOAN_EVENTS.LOANS_FETCHED,
      expect.objectContaining({ caixinhaId: 'cx1', loans })
    );
  });

  it('deve solicitar empréstimo e emitir LOAN_CREATED', async () => {
    const loanData = { valor: 500 };
    const responseData = { id: 'l2', ...loanData, requiresDispute: false };
    mockApiService.post.mockResolvedValue({ data: responseData });

    const result = await loanService.requestLoan('cx1', loanData);

    expect(result).toEqual(responseData);
    expect(mockApiService.post).toHaveBeenCalledWith('/api/caixinha/cx1/emprestimos', loanData);
    expect(serviceEventHub.emit).toHaveBeenCalledWith(
      'loans',
      LOAN_EVENTS.LOAN_CREATED,
      expect.objectContaining({ caixinhaId: 'cx1', loan: responseData })
    );
  });

  it('deve registrar pagamento e emitir LOAN_PAYMENT_MADE', async () => {
    const paymentData = { valor: 100 };
    const responseData = { success: true, payment: { id: 'p1', valor: 100 } };
    mockApiService.post.mockResolvedValue({ data: responseData });

    const result = await loanService.makePayment('cx1', 'l1', paymentData);

    expect(result).toEqual(responseData);
    expect(mockApiService.post).toHaveBeenCalledWith(
      '/api/caixinha/cx1/emprestimos/l1/pagamento',
      paymentData
    );
    expect(serviceEventHub.emit).toHaveBeenCalledWith(
      'loans',
      LOAN_EVENTS.LOAN_PAYMENT_MADE,
      expect.objectContaining({ caixinhaId: 'cx1', loanId: 'l1', payment: responseData })
    );
  });

  it('deve aprovar empréstimo e emitir LOAN_APPROVED', async () => {
    const responseData = { id: 'l1', status: 'aprovado' };
    mockApiService.post.mockResolvedValue({ data: responseData });

    const result = await loanService.approveLoan('cx1', 'l1');

    expect(result).toEqual(responseData);
    expect(mockApiService.post).toHaveBeenCalledWith('/api/caixinha/cx1/emprestimos/l1/aprovar');
    expect(serviceEventHub.emit).toHaveBeenCalledWith(
      'loans',
      LOAN_EVENTS.LOAN_APPROVED,
      expect.objectContaining({ caixinhaId: 'cx1', loanId: 'l1', loan: responseData })
    );
  });

  it('deve rejeitar empréstimo e emitir LOAN_REJECTED', async () => {
    const responseData = { id: 'l1', status: 'rejeitado' };
    mockApiService.post.mockResolvedValue({ data: responseData });

    const result = await loanService.rejectLoan('cx1', 'l1', 'Motivo');

    expect(result).toEqual(responseData);
    expect(mockApiService.post).toHaveBeenCalledWith(
      '/api/caixinha/cx1/emprestimos/l1/rejeitar',
      { reason: 'Motivo' }
    );
    expect(serviceEventHub.emit).toHaveBeenCalledWith(
      'loans',
      LOAN_EVENTS.LOAN_REJECTED,
      expect.objectContaining({ caixinhaId: 'cx1', loanId: 'l1', reason: 'Motivo', loan: responseData })
    );
  });
});
