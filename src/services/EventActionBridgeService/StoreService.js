// src/services/StoreService.js
import { BaseService, serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { LOG_LEVELS } from '../../core/logging';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { servicesReducer } from '../../reducers/serviceCore/servicesReducer';
import { setupAuthMappings } from './authMappings';
import { setupConnectionMappings } from './connectionMappings';
import { setupInviteMappings } from './inviteMappings';
import { setupMessageMappings } from './messageMappings';
import { setupUserMappings } from './userMappings';
import { setupInterestsMappings } from './interestsMappings';
import { setupUserPrefsMappings } from './userPrefsMappings';
import { authReducer } from '../../reducers/auth/authReducer';
import { setupCaixinhaMappings } from './caixinhaMappings';
import { setupNotificationMappings } from './notificationMappings';
import { caixinhaReducer } from '../../reducers/caixinha/caixinhaReducer';
import { connectionReducer } from '../../reducers/connection/connectionReducer';
import { interestsReducer } from '../../reducers/interests/interestsReducer';
import { messageReducer } from '../../reducers/messages/messageReducer';
import { metadataReducer } from '../../reducers/metadata/metadataReducer';
import { notificationReducer } from '../../reducers/notification/notificationReducer';
import { userReducer } from '../../reducers/user/userReducer';
import {userPrefsReducer} from '../../reducers/userPrefs/userPrefsReducer';
import { validationReducer } from '../../reducers/validation/validationReducer';
import { coreLogger } from '../../core/logging';
import {inviteReducer} from '../../reducers/invites/inviteReducer';
import { SERVICE_ACTIONS } from '../../core/constants/actions';
// import { setupAppMappings } from './actionMappings';

const MODULE_NAME = 'store';

class StoreService extends BaseService {
  constructor() {
    super(MODULE_NAME);

    this.instanceId = Math.random().toString(36).substring(2, 10);

    this._store = null;
    this._rootReducer = null;
    this._isInitialized = false;
    this._initPromise = null;
    this._metadata = {
      name: MODULE_NAME,
      phase: 'CORE',              // Fase de inicialização (CORE, ESSENTIAL, etc.)
      criticalPath: true,         // Indica se é um serviço crítico para a aplicação
      dependencies: ['eventActionBridge'], // Serviços que devem estar prontos antes deste
      category: 'initialization',       // Categoria do serviço
      description: 'Gerencia estado inicializacao e fluxo de dados da aplicacao' // Descrição
    };

    this._log(`📊 Nova instância de StoreService criada, instanceId: ${this.instanceId}`);
  }

  async initialize() {
    if (this.isInitialized) return this;

    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = new Promise(async (resolve, reject) => {
      try {
        this._log(MODULE_NAME, LOG_LEVELS.INITIALIZATION, 'StoreService initialization started');

        if (!this._rootReducer) {
          this._rootReducer = combineReducers({
            services: servicesReducer,
            auth: authReducer,
            caixinhas: caixinhaReducer,
            connections: connectionReducer,
            interests: interestsReducer,
            user: userReducer,
            invites: inviteReducer,
            userPreferences: userPrefsReducer,
            notifications: notificationReducer,
            messages: messageReducer,
            metadata: metadataReducer,
            validation: validationReducer,
          });
        }

        // const loadingMiddleware = store => next => action => {
        //   if (action.type.includes('_START') || action.type.includes('LOADING_')) {
        //     console.log(`🔄 Loading started: ${action.type}`, action.payload);
        //   } else if (action.type.includes('_SUCCESS') || action.type.includes('_FAILURE') || action.type.includes('_FINISHED')) {
        //     console.log(`✅ Loading finished: ${action.type}`, action.payload);
        //   }
        //   return next(action);
        // };

        const loggingMiddleware = store => next => action => {
          console.log('Ação sendo despachada:', action.type, action.payload);
          return next(action);
        };


        if (!this._store) {
          this._store = configureStore({
            reducer: this._rootReducer,
            middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware({
                serializableCheck: false
              }).concat(loggingMiddleware),
            devTools: {
              name: 'ElosCloudApp', // Nome personalizado
              trace: true, // Habilita stack traces para depuração
              traceLimit: 25 // Limite de stack trace
            }
          });

          this._log(MODULE_NAME, 'STATE', 'Store created', {
            reducers: Object.keys(this._store.getState())
          });
        }

        await this._initializeEventBridge();

        this._log(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'StoreService initialized successfully');
        resolve(true);

        this._isInitialized = true;

        // // Emite evento de serviço pronto
        // this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_READY, {
        //   serviceName: MODULE_NAME,
        //   timestamp: new Date().toISOString()
        // });

        // Log de sucesso com coreLogger
        // this._log(
        //   MODULE_NAME,
        //   LOG_LEVELS.INITIALIZATION,
        //   'StoreService initialized successfully'
        // );
        this._emitEvent(SERVICE_ACTIONS.SERVICE_READY, {
          serviceName: MODULE_NAME,
          timestamp: new Date().toISOString()
        });

        return this;
      } catch (error) {
        // this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'StoreService initialization failed', {
        //   error: error.message,
        //   stack: error.stack
        // });
        this._initPromise = null;
        reject(error);

        // Emite evento de serviço falhou
        // this._emitEvent('initialization', SERVICE_ACTIONS.SERVICE_ERROR, {
        //   serviceName: MODULE_NAME,
        //   error: error.message, // ou error.toString()
        //   timestamp: new Date().toISOString()
        // });

        // Log de falha com coreLogger
        this._log(
          MODULE_NAME,
          error,
          {
            message: 'StoreService initialization failed',
            timestamp: new Date().toISOString()
          }
        );

        throw error;
      }
    });

    return this._initPromise;
  }

  async _initializeEventBridge(eventBridgeService) {

    const eventActionBridgeService = eventBridgeService || 
    serviceLocator.get('eventActionBridge');
    // Garantir que o EventActionBridgeService tenha acesso à store
    if (eventActionBridgeService) {
      try {
        this._log(MODULE_NAME, LOG_LEVELS.STATE, 'Setting store to EventActionBridgeService');
        
        // Definir a store no serviço de bridge
        eventActionBridgeService.setStore(this._store);
        
        // Inicializar o serviço de bridge se ainda não foi feito
        if (!eventActionBridgeService.isInitialized) {
          await eventActionBridgeService.initialize().then(() => console.log('Inicializado com sucesso'));
        }
        
        // Configurar mapeamentos para diferentes domínios
        // setupAppMappings();
        setupAuthMappings(eventActionBridgeService);
        setupUserMappings(eventActionBridgeService);
        setupInterestsMappings(eventActionBridgeService);
        setupConnectionMappings(eventActionBridgeService);
        setupInviteMappings(eventActionBridgeService);
        setupNotificationMappings(eventActionBridgeService);
        setupMessageMappings(eventActionBridgeService);
        setupUserPrefsMappings(eventActionBridgeService);
        setupCaixinhaMappings(eventActionBridgeService);
        eventActionBridgeService._activateAllMappings();
        this._log("Mapeamentos registrados para usuário:", eventActionBridgeService.mappings);

        this._log(MODULE_NAME, LOG_LEVELS.STATE, 'EventActionBridge configured with mappings');
      } catch (error) {
        this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Failed to initialize EventActionBridge', {
          error: error.message
        });
        // Continuar mesmo com erro na inicialização do EventActionBridge
      }
    } else {
      this._log(MODULE_NAME, LOG_LEVELS.WARNING, 'EventActionBridgeService not available');
    }
  }

  async healthCheck() {
    if (!this._store) {
      return { 
        status: 'degraded', 
        reason: 'Store not initialized',
        timestamp: Date.now() 
      };
    }
    
    return { 
      status: 'healthy', 
      reducers: Object.keys(this._store.getState()),
      timestamp: Date.now()
    };
  }

  getStore() {
    if (!this._store) {
      if (!this._isInitialized) {
        throw new Error('StoreService not initialized. Call initialize() first.');
      }
      throw new Error('Store not available even though service is initialized.');
    }
    return this._store;
  }
  
  getState() {
    if (!this._store) {
      return {};
    }
    return this._store.getState();
  }
  
  dispatch(action) {
    if (!this._store) {
      this._log(MODULE_NAME, LOG_LEVELS.ERROR, 'Cannot dispatch action - store not initialized', {
        action
      });
      return;
    }
    return this._store.dispatch(action);
  }
}

export {StoreService}