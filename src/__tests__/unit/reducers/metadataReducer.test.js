import { metadataReducer, SERVICE_METADATA } from '../../../reducers/metadata/metadataReducer';
import { METADATA_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

// Estado com um serviço de teste para os casos que requerem serviço existente
const stateWithService = {
  auth: {
    description: 'Auth service',
    criticalPath: true,
    dependencies: [],
    timeout: 5000,
    phase: 'CORE',
    order: 1,
  },
  store: {
    description: 'Store service',
    criticalPath: true,
    dependencies: ['auth'],
    timeout: 8000,
    phase: 'CORE',
    order: 2,
  },
};

describe('metadataReducer', () => {
  it('retorna estado inicial ({}) quando chamado sem ação', () => {
    // initialState.metadata é {}
    const state = metadataReducer(undefined, { type: '@@INIT' });
    expect(typeof state).toBe('object');
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...stateWithService };
    expect(metadataReducer(state, { type: 'X' })).toBe(state);
  });

  it('RESET_METADATA retorna SERVICE_METADATA', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.RESET_METADATA,
    });
    expect(result).toEqual(SERVICE_METADATA);
  });

  it('UPDATE_SERVICE_TIMEOUT atualiza timeout de serviço existente', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.UPDATE_SERVICE_TIMEOUT,
      payload: { serviceName: 'auth', timeout: 9999 },
    });
    expect(result.auth.timeout).toBe(9999);
  });

  it('UPDATE_SERVICE_TIMEOUT com timeout negativo mantém estado (erro em non-dev)', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.UPDATE_SERVICE_TIMEOUT,
      payload: { serviceName: 'auth', timeout: -1 },
    });
    // Em env test (não development), o catch retorna state
    expect(result).toBe(stateWithService);
  });

  it('UPDATE_SERVICE_TIMEOUT com serviço inexistente mantém estado', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.UPDATE_SERVICE_TIMEOUT,
      payload: { serviceName: 'naoExiste', timeout: 1000 },
    });
    expect(result).toBe(stateWithService);
  });

  it('UPDATE_SERVICE_CRITICAL_PATH atualiza criticalPath de serviço existente', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.UPDATE_SERVICE_CRITICAL_PATH,
      payload: { serviceName: 'auth', criticalPath: false },
    });
    expect(result.auth.criticalPath).toBe(false);
  });

  it('UPDATE_SERVICE_DEPENDENCIES atualiza dependências válidas', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.UPDATE_SERVICE_DEPENDENCIES,
      payload: { serviceName: 'store', dependencies: [] },
    });
    expect(result.store.dependencies).toEqual([]);
  });

  it('UPDATE_SERVICE_DEPENDENCIES com dependência inválida mantém estado', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.UPDATE_SERVICE_DEPENDENCIES,
      payload: { serviceName: 'auth', dependencies: ['naoExiste'] },
    });
    expect(result).toBe(stateWithService);
  });

  it('ADD_SERVICE adiciona novo serviço com configuração válida', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.ADD_SERVICE,
      payload: {
        serviceName: 'newService',
        serviceConfig: { description: 'New', criticalPath: false, dependencies: [] },
      },
    });
    expect(result.newService).toBeDefined();
    expect(result.newService.description).toBe('New');
    expect(result.newService.criticalPath).toBe(false);
  });

  it('ADD_SERVICE com serviço já existente mantém estado (erro capturado)', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.ADD_SERVICE,
      payload: {
        serviceName: 'auth',
        serviceConfig: { description: 'Dup', criticalPath: true },
      },
    });
    expect(result).toBe(stateWithService);
  });

  it('REMOVE_SERVICE remove serviço sem dependentes', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.REMOVE_SERVICE,
      payload: { serviceName: 'store' },
    });
    expect(result.store).toBeUndefined();
    expect(result.auth).toBeDefined();
  });

  it('REMOVE_SERVICE com serviço que tem dependentes mantém estado', () => {
    // store depende de auth, então remover auth deve falhar
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.REMOVE_SERVICE,
      payload: { serviceName: 'auth' },
    });
    expect(result).toBe(stateWithService);
  });

  it('UPDATE_LOG_CONFIG mescla config no estado', () => {
    const result = metadataReducer(stateWithService, {
      type: METADATA_ACTIONS.UPDATE_LOG_CONFIG,
      payload: { config: { enableConsoleLogging: false } },
    });
    expect(result.LOG_CONFIG.enableConsoleLogging).toBe(false);
  });
});
