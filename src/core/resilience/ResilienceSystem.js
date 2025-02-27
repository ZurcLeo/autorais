// core/resilience/ResilienceSystem.js
import { coreLogger } from '../logging/CoreLogger';
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';
import initializationQueue from '../initialization/InitializationQueue';

export class ResilienceSystem {
  constructor(config = {}) {
    this.config = {
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 15000,
        backoffMultiplier: 2,
        jitter: 0.1
      },
      circuitBreaker: {
        failureThreshold: 0.5,
        cooldownPeriod: 15000,
        halfOpenTimeout: 5000,
        minimumRequests: 10,
        successThreshold: 3
      },
      ...config
    };
    
    this.circuits = new Map();
    this.metrics = {
      retries: {},
      failures: {},
      successes: {}
    };
  }
  
  async initialize() {
    return initializationQueue.enqueue("resilience", async () => {
      coreLogger.logEvent('ResilienceSystem', LOG_LEVELS.INITIALIZATION, 
        'Initializing resilience system');
      
      // Configurar limpeza automática
      this.setupGarbageCollection();
      
      return true;
    }, ["coreLogger"]); // Dependência do logger
  }
  
  async retryWithBackoff(operationName, operation, options = {}) {
    const config = {
      ...this.config.retry,
      ...options
    };
    
    let attempts = 0;
    let lastError;
    
    while (attempts < config.maxRetries) {
      try {
        // Verificar estado do circuito
        if (this.isCircuitOpen(operationName)) {
          throw new Error(`Circuit is open for operation: ${operationName}`);
        }
        
        const result = await operation();
        
        // Registrar sucesso
        this.recordSuccess(operationName);
        
        return result;
      } catch (error) {
        lastError = error;
        attempts++;
        
        // Registrar falha
        this.recordFailure(operationName, error);
        
        if (attempts >= config.maxRetries) {
          break;
        }
        
        // Calcular tempo de espera com backoff exponencial e jitter
        const baseDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempts);
        const jitter = config.jitter * baseDelay * (Math.random() - 0.5);
        const delay = Math.min(baseDelay + jitter, config.maxDelay);
        
        coreLogger.logEvent('ResilienceSystem', LOG_LEVELS.WARNING, 
          `Retry attempt ${attempts} for ${operationName}`, {
            delay,
            error: error.message
          });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
  
  recordSuccess(operationName) {
    const circuit = this.getCircuit(operationName);
    circuit.successes++;
    
    if (circuit.state === 'HALF_OPEN' && 
        circuit.successes >= this.config.circuitBreaker.successThreshold) {
      circuit.state = 'CLOSED';
      circuit.lastTransition = Date.now();
      
      coreLogger.logEvent('ResilienceSystem', LOG_LEVELS.INFO, 
        `Circuit closed for ${operationName}`);
    }
    
    // Atualizar métricas
    this.metrics.successes[operationName] = 
      (this.metrics.successes[operationName] || 0) + 1;
  }
  
  recordFailure(operationName, error) {
    const circuit = this.getCircuit(operationName);
    circuit.failures++;
    
    // Calcular taxa de falha
    const totalRequests = circuit.successes + circuit.failures;
    const failureRate = circuit.failures / totalRequests;
    
    // Verificar se deve abrir o circuito
    if (totalRequests >= this.config.circuitBreaker.minimumRequests && 
        failureRate >= this.config.circuitBreaker.failureThreshold) {
      circuit.state = 'OPEN';
      circuit.lastTransition = Date.now();
      
      coreLogger.logEvent('ResilienceSystem', LOG_LEVELS.WARNING, 
        `Circuit opened for ${operationName}`, {
          failureRate,
          totalRequests
        });
    }
    
    // Atualizar métricas
    this.metrics.failures[operationName] = 
      (this.metrics.failures[operationName] || 0) + 1;
  }
  
  isCircuitOpen(operationName) {
    const circuit = this.getCircuit(operationName);
    
    if (circuit.state === 'CLOSED') {
      return false;
    }
    
    if (circuit.state === 'OPEN') {
      const now = Date.now();
      const elapsed = now - circuit.lastTransition;
      
      // Verificar se o tempo de cooldown passou
      if (elapsed >= this.config.circuitBreaker.cooldownPeriod) {
        circuit.state = 'HALF_OPEN';
        circuit.lastTransition = now;
        circuit.successes = 0;
        circuit.failures = 0;
        
        coreLogger.logEvent('ResilienceSystem', LOG_LEVELS.INFO, 
          `Circuit half-opened for ${operationName}`);
          
        return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  getCircuit(operationName) {
    if (!this.circuits.has(operationName)) {
      this.circuits.set(operationName, {
        state: 'CLOSED',
        lastTransition: Date.now(),
        successes: 0,
        failures: 0
      });
    }
    
    return this.circuits.get(operationName);
  }
  
  setupGarbageCollection() {
    setInterval(() => {
      const now = Date.now();
      
      // Limpar circuitos não utilizados
      this.circuits.forEach((circuit, operationName) => {
        const elapsed = now - circuit.lastTransition;
        
        // Se não foi usado por mais de 1 hora, remover
        if (elapsed > 3600000) {
          this.circuits.delete(operationName);
          
          coreLogger.logEvent('ResilienceSystem', LOG_LEVELS.INFO, 
            `Cleaned up idle circuit for ${operationName}`);
        }
      });
    }, 30 * 60 * 1000); // A cada 30 minutos
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}

export default new ResilienceSystem();