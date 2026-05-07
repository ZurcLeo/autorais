// Mock do BaseService para isolar o EventActionBridgeService
// O Map de listeners deve estar fora para ser acessado pelos mocks
const mockListeners = new Map();

jest.mock('../../../core/services/BaseService', () => {
  const hub = {
    on: jest.fn((service, event, callback) => {
      const key = `${service}:${event}`;
      if (!mockListeners.has(key)) mockListeners.set(key, []);
      mockListeners.get(key).push(callback);
      return () => {
        const list = mockListeners.get(key);
        const index = list.indexOf(callback);
        if (index > -1) list.splice(index, 1);
      };
    }),
    emit: jest.fn((service, event, data) => {
      const key = `${service}:${event}`;
      if (mockListeners.has(key)) {
        mockListeners.get(key).forEach(cb => cb(data));
      }
    })
  };
  return {
    serviceEventHub: hub,
    serviceLocator: { register: jest.fn(), get: jest.fn() },
    BaseService: class {
      constructor(name) { this._serviceName = name; this._isInitialized = false; }
      _emitEvent() {}
      _log() {}
      _logError() {}
      get isInitialized() { return this._isInitialized; }
    }
  };
});

describe('EventActionBridgeService Integration', () => {
  let EventActionBridgeService;
  let serviceEventHub;
  let bridgeService;
  let mockStore;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockListeners.clear();

    const baseModule = require('../../../core/services/BaseService');
    serviceEventHub = baseModule.serviceEventHub;
    
    const bridgeModule = require('../../../services/EventActionBridgeService');
    EventActionBridgeService = bridgeModule.EventActionBridgeService;

    mockStore = {
      dispatch: jest.fn()
    };
    bridgeService = new EventActionBridgeService();
  });

  it('deve registrar mapeamento e ativar após setStore', () => {
    bridgeService.registerMapping('testService', 'TEST_EVENT', 'TEST_ACTION');
    expect(bridgeService.mappings.size).toBe(1);
    
    bridgeService.setStore(mockStore);
    expect(serviceEventHub.on).toHaveBeenCalledWith('testService', 'TEST_EVENT', expect.any(Function));
  });

  it('deve despachar ação para o store quando evento é emitido', () => {
    bridgeService.registerMapping('testService', 'TEST_EVENT', 'TEST_ACTION');
    bridgeService.setStore(mockStore);

    const eventData = { foo: 'bar' };
    serviceEventHub.emit('testService', 'TEST_EVENT', eventData);

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: 'TEST_ACTION',
      payload: eventData
    });
  });

  it('deve aplicar transformador antes de despachar', () => {
    const transformer = data => ({ result: data.value * 2 });
    bridgeService.registerMapping('testService', 'TEST_EVENT', 'TEST_ACTION', transformer);
    bridgeService.setStore(mockStore);

    serviceEventHub.emit('testService', 'TEST_EVENT', { value: 10 });

    expect(mockStore.dispatch).toHaveBeenCalledWith({
      type: 'TEST_ACTION',
      payload: { result: 20 }
    });
  });

  it('não deve despachar se transformador retornar null', () => {
    const transformer = () => null;
    bridgeService.registerMapping('testService', 'TEST_EVENT', 'TEST_ACTION', transformer);
    bridgeService.setStore(mockStore);

    serviceEventHub.emit('testService', 'TEST_EVENT', { value: 10 });

    expect(mockStore.dispatch).not.toHaveBeenCalled();
  });
});
