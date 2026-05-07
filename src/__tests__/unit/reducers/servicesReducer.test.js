import { servicesReducer } from '../../../reducers/serviceCore/servicesReducer';
import { SERVICE_ACTIONS } from '../../../core/constants/actions';

const initialServicesState = {
  services: {},
  coreReady: false,
  criticalFailure: false,
  error: null,
  initializationPhase: 'pending',
};

describe('servicesReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(servicesReducer(undefined, { type: '@@INIT' })).toEqual(initialServicesState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialServicesState };
    expect(servicesReducer(state, { type: 'X' })).toBe(state);
  });

  it('SERVICE_INIT seta status: initializing para o serviço', () => {
    const result = servicesReducer(initialServicesState, {
      type: SERVICE_ACTIONS.SERVICE_INIT,
      payload: { serviceName: 'auth' },
    });
    expect(result.services.auth.status).toBe('initializing');
  });

  it('SERVICE_READY seta status: ready para o serviço', () => {
    const state = {
      ...initialServicesState,
      services: { auth: { status: 'initializing' } },
    };
    const result = servicesReducer(state, {
      type: SERVICE_ACTIONS.SERVICE_READY,
      payload: { serviceName: 'auth' },
    });
    expect(result.services.auth.status).toBe('ready');
  });

  it('SERVICE_ERROR seta status: failed e registra error', () => {
    const result = servicesReducer(initialServicesState, {
      type: SERVICE_ACTIONS.SERVICE_ERROR,
      payload: { serviceName: 'auth', error: 'timeout', critical: false },
    });
    expect(result.services.auth.status).toBe('failed');
    expect(result.services.auth.error).toBe('timeout');
    expect(result.criticalFailure).toBe(false);
  });

  it('SERVICE_ERROR crítico seta criticalFailure: true', () => {
    const result = servicesReducer(initialServicesState, {
      type: SERVICE_ACTIONS.SERVICE_ERROR,
      payload: { serviceName: 'store', error: 'fatal', critical: true },
    });
    expect(result.criticalFailure).toBe(true);
    expect(result.error).toBe('fatal');
  });

  it('SERVICE_STOPPED seta status: stopped para o serviço', () => {
    const state = {
      ...initialServicesState,
      services: { auth: { status: 'ready' } },
    };
    const result = servicesReducer(state, {
      type: SERVICE_ACTIONS.SERVICE_STOPPED,
      payload: { serviceName: 'auth' },
    });
    expect(result.services.auth.status).toBe('stopped');
  });

  it('CORE_READY seta coreReady: true e initializationPhase: ready', () => {
    const result = servicesReducer(initialServicesState, {
      type: SERVICE_ACTIONS.CORE_READY,
    });
    expect(result.coreReady).toBe(true);
    expect(result.initializationPhase).toBe('ready');
  });

  it('CRITICAL_FAILURE seta criticalFailure: true e initializationPhase: failed', () => {
    const result = servicesReducer(initialServicesState, {
      type: SERVICE_ACTIONS.CRITICAL_FAILURE,
      payload: { error: 'falha crítica' },
    });
    expect(result.criticalFailure).toBe(true);
    expect(result.error).toBe('falha crítica');
    expect(result.initializationPhase).toBe('failed');
  });

  it('UPDATE_INITIALIZATION_STATE atualiza status e error do serviço', () => {
    const result = servicesReducer(initialServicesState, {
      type: SERVICE_ACTIONS.UPDATE_INITIALIZATION_STATE,
      payload: { serviceName: 'users', status: 'ready', error: null },
    });
    expect(result.services.users.status).toBe('ready');
    expect(result.services.users.error).toBeNull();
  });

  it('ADD_SERVICE adiciona serviço com status: pending', () => {
    const result = servicesReducer(initialServicesState, {
      type: SERVICE_ACTIONS.ADD_SERVICE,
      payload: { serviceName: 'newSvc', critical: true, dependencies: ['auth'], phase: 'CORE' },
    });
    expect(result.services.newSvc.status).toBe('pending');
    expect(result.services.newSvc.critical).toBe(true);
    expect(result.services.newSvc.dependencies).toEqual(['auth']);
  });

  it('REMOVE_SERVICE remove o serviço do estado', () => {
    const state = {
      ...initialServicesState,
      services: { auth: { status: 'ready' }, users: { status: 'ready' } },
    };
    const result = servicesReducer(state, {
      type: SERVICE_ACTIONS.REMOVE_SERVICE,
      payload: { serviceName: 'users' },
    });
    expect(result.services.users).toBeUndefined();
    expect(result.services.auth).toBeDefined();
  });

  it('RESET_SERVICE seta status: pending e limpa error', () => {
    const state = {
      ...initialServicesState,
      services: { auth: { status: 'failed', error: 'timeout' } },
    };
    const result = servicesReducer(state, {
      type: SERVICE_ACTIONS.RESET_SERVICE,
      payload: { serviceName: 'auth' },
    });
    expect(result.services.auth.status).toBe('pending');
    expect(result.services.auth.error).toBeNull();
  });

  it('RESET_ALL retorna ao estado inicial', () => {
    const dirty = {
      ...initialServicesState,
      services: { auth: { status: 'ready' } },
      coreReady: true,
      criticalFailure: true,
    };
    const result = servicesReducer(dirty, { type: SERVICE_ACTIONS.RESET_ALL });
    expect(result).toEqual(initialServicesState);
  });
});
