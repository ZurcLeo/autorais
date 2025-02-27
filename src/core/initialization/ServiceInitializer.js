import { LOG_LEVELS, SERVICE_METADATA } from '../../reducers/metadata/metadataReducer'; // Importa SERVICE_METADATA, que define metadados e dependências dos serviços
import { ResilienceError } from '../resilience/types';
import { coreLogger } from '../logging/CoreLogger'; // Importa o CoreLogger para logs centralizados
import { retryManager } from '../resilience';; // Importa o RetryManager para lidar com retentativas em operações de serviço

// Utiliza um grafo de dependências para garantir a ordem correta de inicialização e RetryManager para resiliência.
class ServiceInitializer {
    constructor() {
        // initializationStatus: Um Map para rastrear o status de inicialização de cada serviço.
        // A chave é o nome do serviço e o valor é um objeto com o status ('initializing', 'ready', 'failed'), duração e timestamp.
        this.initializationStatus = new Map();
        // serviceMetadata: Armazena os metadados dos serviços, incluindo suas dependências e se estão no caminho crítico de inicialização.
        this.serviceMetadata = SERVICE_METADATA;
        // dependencyGraph: Um Map que representa o grafo de dependências entre os serviços.
        // Construído em _buildDependencyGraph(). Chave é o nome do serviço, valor é um objeto com 'dependencies' e 'dependents'.
        this.dependencyGraph = this._buildDependencyGraph();
        this.initializingServices = new Set(); // Adicionar este conjunto para rastrear inicializações em andamento
        coreLogger.log('ServiceInitializer created', LOG_LEVELS.INITIALIZATION); // Loga a criação da instância de ServiceInitializer
    }

    // _buildDependencyGraph: Método privado para construir o grafo de dependências dos serviços.
    // Este grafo é usado para determinar a ordem correta de inicialização, respeitando as dependências entre os serviços.
    _buildDependencyGraph() {
        const graph = new Map(); // Inicializa um novo Map para o grafo

        // Itera sobre os metadados de cada serviço definidos em SERVICE_METADATA.
        Object.entries(this.serviceMetadata).forEach(([serviceName, metadata]) => {
            // Para cada serviço, cria um nó no grafo.
            // Inicialmente, define as dependências do serviço (obtidas de metadata.dependencies ou array vazio se não houver) e um array vazio para 'dependents'.
            graph.set(serviceName, {
                dependencies: metadata.dependencies || [],
                dependents: []
            });
        });

        // Preenche a lista de 'dependentes' para cada serviço no grafo.
        // Itera sobre cada nó (serviço) no grafo.
        graph.forEach((node, serviceName) => {
            // Para cada dependência declarada pelo serviço atual (node.dependencies).
            node.dependencies.forEach(dep => {
                // Obtém o nó da dependência no grafo.
                const depNode = graph.get(dep);
                // Se o nó da dependência existir (deve existir, se a configuração for válida).
                if (depNode) {
                    // Adiciona o serviço atual à lista de 'dependentes' da sua dependência.
                    // Isso constrói as relações inversas no grafo: quem depende de quem.
                    depNode.dependents.push(serviceName);
                }
            });
        });

        return graph; // Retorna o grafo de dependências construído (um Map).
    }

    // _areDependenciesReady: Método privado para verificar se todas as dependências de um dado serviço estão prontas.
    _areDependenciesReady(serviceName) {
        const node = this.dependencyGraph.get(serviceName); // Obtém o nó do serviço no grafo
        if (!node) return true; // Se o serviço não está no grafo (o que seria inesperado), assume que não tem dependências e retorna true

        // Verifica se TODAS as dependências do serviço estão com status 'ready' em initializationStatus.
        return node.dependencies.every(dep =>
            this.initializationStatus.get(dep)?.status === 'ready'
        );
    }

    // _getReadyServices: Método privado para obter uma lista de serviços que estão prontos para serem inicializados.
    // Um serviço está pronto para inicializar se ele ainda não foi inicializado E todas as suas dependências estão prontas.
    _getReadyServices() {
        // Converte as chaves do grafo de dependências (nomes dos serviços) em um Array.
        return Array.from(this.dependencyGraph.keys())
            // Filtra os serviços para manter apenas aqueles que estão prontos para inicializar.
            .filter(serviceName => {
                const status = this.initializationStatus.get(serviceName); // Obtém o status de inicialização do serviço
                // Retorna true se o serviço ainda não foi inicializado (status é undefined) E suas dependências estão prontas (_areDependenciesReady).
                return !status && this._areDependenciesReady(serviceName);
            });
    }

    setStateChangeHandler(handler) {
        this.onServiceStateChange = handler;
    }

    async _initializeService(serviceName, initFn) {
        const startTime = performance.now();
        const metadata = this.serviceMetadata[serviceName];
    
        console.log(`[ServiceInitializer] Starting initialization of service: ${serviceName}`);
        
        try {
            coreLogger.logServiceState(serviceName, 'initializing', {
                dependencies: metadata?.dependencies,
                criticalPath: metadata?.criticalPath,
                timestamp: new Date().toISOString()
            });
    
            // Uso do retryManager para inicialização resiliente
            // Passamos opções específicas para este serviço
            await retryManager.retryWithBackoff(
                serviceName, 
                async () => {
                    console.log(`[ServiceInitializer] Executing initialization function for ${serviceName}`);
                    
                    // Medimos o tempo de execução da função de inicialização
                    const fnStartTime = performance.now();
                    try {
                        const result = await initFn();
                        const fnDuration = performance.now() - fnStartTime;
                        
                        coreLogger.logServicePerformance(serviceName, 'initialization', fnDuration, {
                            timestamp: new Date().toISOString()
                        });
                        
                        return result;
                    } catch (error) {
                        const fnDuration = performance.now() - fnStartTime;
                        
                        coreLogger.logServiceError(serviceName, error, {
                            duration: fnDuration,
                            phase: 'initialization-function',
                            timestamp: new Date().toISOString()
                        });
                        
                        throw error;
                    }
                },
                {
                    // Opções específicas para o retryWithBackoff
                    maxRetries: metadata?.criticalPath ? 5 : 3,
                    baseDelay: 1000,
                    maxDelay: 15000,
                    // Podemos incluir propriedades específicas do serviço
                    servicePriority: metadata?.criticalPath ? 'critical' : 'normal',
                    serviceCategory: metadata?.category || 'general',
                    // Incluir informações das dependências
                    dependencies: metadata?.dependencies || []
                }
            );
    
            const duration = performance.now() - startTime;
            
            console.log(`[ServiceInitializer] Service ${serviceName} initialized successfully in ${duration.toFixed(2)}ms`);
    
            // Atualizar status
            this.initializationStatus.set(serviceName, {
                status: 'ready',
                duration,
                timestamp: new Date().toISOString()
            });
    
            if (this.onServiceStateChange) {
                this.onServiceStateChange(serviceName, 'ready');
            }
            
            // Registrar estado do serviço
            coreLogger.logServiceState(serviceName, 'ready', {
                duration,
                timestamp: new Date().toISOString()
            });
    
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            let status = 'failed';
            let errorMessage = error.message;
            
            console.error(`[ServiceInitializer] Failed to initialize service ${serviceName}:`, error);
    
            // Tratamento específico por tipo de erro
            switch (error.code) {
                case ResilienceError.INFINITE_LOOP:
                    status = 'blocked';
                    errorMessage = `Service initialization blocked due to infinite loop: ${error.message}`;
                    
                    coreLogger.logServiceError(serviceName, error, {
                        duration,
                        phase: 'initialization',
                        type: 'INFINITE_LOOP',
                        metadata: error.metadata || {}
                    });
                    break;
                    
                case ResilienceError.CIRCUIT_OPEN:
                    status = 'blocked';
                    errorMessage = `Service blocked by circuit breaker: ${error.message}`;
                    
                    coreLogger.logServiceError(serviceName, error, {
                        duration,
                        phase: 'initialization',
                        type: 'CIRCUIT_OPEN',
                        metadata: error.metadata || {}
                    });
                    break;
                    
                case ResilienceError.TIMEOUT:
                    status = 'timeout';
                    errorMessage = `Service initialization timed out: ${error.message}`;
                    
                    coreLogger.logServiceError(serviceName, error, {
                        duration,
                        phase: 'initialization',
                        type: 'TIMEOUT',
                        metadata: error.metadata || {}
                    });
                    break;
                    
                case ResilienceError.MAX_RETRIES:
                    status = 'failed';
                    errorMessage = `Service initialization failed after maximum retry attempts: ${error.message}`;
                    
                    // Registrar o erro original que causou as tentativas
                    const originalError = error.originalError || error;
                    coreLogger.logServiceError(serviceName, originalError, {
                        duration,
                        phase: 'initialization',
                        type: 'MAX_RETRIES',
                        retries: metadata?.criticalPath ? 5 : 3
                    });
                    break;
                    
                default:
                    coreLogger.logServiceError(serviceName, error, {
                        duration,
                        phase: 'initialization',
                        type: 'UNKNOWN'
                    });
            }
    
            // Atualizar status do serviço
            this.initializationStatus.set(serviceName, {
                status,
                error: errorMessage,
                duration,
                timestamp: new Date().toISOString()
            });

            if (this.onServiceStateChange) {
                this.onServiceStateChange(serviceName, status);
            }
    
            // Se for um serviço crítico e o erro não é de bloqueio, relança
            if (metadata?.criticalPath && status !== 'blocked') {
                throw error;
            }
    
            return false;
        }
    }

    // initializeServices: Método principal e assíncrono para inicializar múltiplos serviços.
    // Orquestra a inicialização de todos os serviços definidos, respeitando as dependências e utilizando a função _initializeService.
    async initializeServices(serviceInitializers) {
        const startTime = performance.now(); // Marca o tempo de início da inicialização geral
        const results = new Map(); // Inicializa um Map para armazenar os resultados da inicialização de cada serviço

        try {
            // Loop principal: continua até que não haja mais serviços prontos para inicializar (_getReadyServices retorna um array vazio).
            while (this._getReadyServices().length > 0) {
                const readyServices = this._getReadyServices(); // Obtém a lista de serviços prontos para inicializar no momento

                // Inicializa todos os serviços prontos em paralelo usando Promise.all.
                await Promise.all(
                    readyServices.map(async serviceName => {
                        const initFn = serviceInitializers[serviceName]; // Obtém a função de inicialização específica do serviço do objeto serviceInitializers

                        // Verifica se a função de inicialização foi fornecida para o serviço.
                        if (!initFn) {
                            coreLogger.logServiceError(serviceName,
                                new Error('Initializer function not provided')); // Loga um erro se a função de inicialização estiver faltando
                            return; // Aborta a inicialização deste serviço em particular (mas não interrompe a inicialização dos outros serviços em paralelo)
                        }

                        const success = await this._initializeService(serviceName, initFn); // Chama _initializeService para inicializar o serviço
                        results.set(serviceName, success); // Armazena o resultado (true/false) no Map de resultados
                    })
                );
            }

            const duration = performance.now() - startTime; // Calcula a duração total da inicialização de todos os serviços
            coreLogger.log('Services initialization complete', 'INITIALIZATION', { // Loga o sucesso da inicialização geral
                duration,
                results: Object.fromEntries(results) // Converte o Map de resultados para um objeto simples para facilitar a visualização no log
            });

            return results; // Retorna o Map de resultados da inicialização de todos os serviços.
        } catch (error) {
            coreLogger.log('Services initialization failed', 'ERROR', { // Loga a falha na inicialização geral
                error: error.message,
                duration: performance.now() - startTime
            });
            throw error; // Relança o erro para que possa ser capturado e tratado em um nível superior (ex: ErrorBoundary)
        }
    }

    // getInitializationState: Método para obter o estado atual da inicialização de todos os serviços.
    // Útil para depuração, monitoramento ou para componentes que precisam saber o status da inicialização.
    getInitializationState() {
        return {
            status: Object.fromEntries(this.initializationStatus), // Converte o Map initializationStatus para um objeto simples
            graph: Object.fromEntries(this.dependencyGraph), // Converte o Map dependencyGraph para um objeto simples
            metadata: this.serviceMetadata // Retorna os metadados dos serviços
        };
    }

    // reset: Método para resetar o estado do ServiceInitializer, limpando o status de inicialização.
    // Usado para permitir a reinicialização dos serviços, se necessário (ex: em testes ou recuperação de erros).
    reset() {
        this.initializationStatus.clear(); // Limpa o Map initializationStatus, removendo todos os status de inicialização
        coreLogger.log('ServiceInitializer reset', 'INITIALIZATION'); // Loga o reset do ServiceInitializer
    }
}

// serviceInitializer: Cria e exporta uma INSTÂNCIA SINGLETON de ServiceInitializer.
// Singleton garante que haverá apenas uma instância de ServiceInitializer em toda a aplicação,
// o que é apropriado para um gerenciador central de inicialização de serviços.
export const serviceInitializer = new ServiceInitializer();

// O que este código faz:
// - Define a classe `ServiceInitializer` responsável por orquestrar a inicialização de serviços na aplicação.
// - Constrói um grafo de dependências entre os serviços para garantir a ordem correta de inicialização.
// - Utiliza o `RetryManager` para adicionar resiliência ao processo de inicialização, com retentativas e backoff.
// - Rastreia o status de inicialização de cada serviço (inicializando, pronto, falha) e disponibiliza um estado geral da inicialização.
// - Exporta uma instância singleton `serviceInitializer` da classe `ServiceInitializer` para uso em toda a aplicação.

// Como usar o ServiceInitializer para inicializar serviços:
// 1. Importe a instância singleton `serviceInitializer`:
//    import { serviceInitializer } from './path/to/ServiceInitializer';

// 2. Crie um objeto `serviceInitializers` que mapeia nomes de serviços para suas funções de inicialização (`initFn`).
//    Cada `initFn` deve ser uma função assíncrona que contém a lógica de inicialização específica para aquele serviço.
//    Exemplo:
//    const serviceInitializers = {
//      authService: async () => {
//        // Lógica para inicializar o serviço de autenticação
//        console.log('Inicializando AuthService...');
//        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula inicialização assíncrona
//        console.log('AuthService inicializado.');
//      },
//      databaseService: async () => {
//        // Lógica para inicializar o serviço de banco de dados
//        console.log('Inicializando DatabaseService...');
//        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula inicialização assíncrona
//        console.log('DatabaseService inicializado.');
//      },
//      // ... adicione initFn para outros serviços ...
//    };

// 3. Chame o método `serviceInitializer.initializeServices(serviceInitializers)` para iniciar o processo de inicialização.
//    Este método é assíncrono e retorna uma Promise que resolve quando todos os serviços (ou serviços críticos) forem inicializados, ou rejeita em caso de erro crítico.
//    Exemplo de uso dentro de uma função assíncrona:
//    async function startAppInitialization() {
//      try {
//        await serviceInitializer.initializeServices(serviceInitializers);
//        console.log('Todos os serviços inicializados com sucesso!');
//        // Continuar com a inicialização da aplicação principal (ex: renderizar a UI)
//      } catch (error) {
//        console.error('Falha na inicialização de serviços críticos:', error);
//        // Lidar com a falha na inicialização (ex: exibir mensagem de erro para o usuário)
//      }
//    }
//    startAppInitialization();

// Como obter o estado atual da inicialização:
// 1. Chame o método `serviceInitializer.getInitializationState()` para obter um objeto contendo o estado de inicialização.
//    const initializationState = serviceInitializer.getInitializationState();
//    console.log('Estado da Inicialização:', initializationState);
//    O objeto `initializationState` terá a seguinte estrutura:
//    {
//      status: { // Objeto com o status de cada serviço
//        serviceName1: { status: 'ready' | 'initializing' | 'failed', duration: number, timestamp: string, error?: string },
//        serviceName2: { status: 'ready' | 'initializing' | 'failed', duration: number, timestamp: string, error?: string },
//        // ... outros serviços ...
//      },
//      graph: { // Objeto representando o grafo de dependências (para fins de análise/debug)
//        serviceName1: { dependencies: string[], dependents: string[] },
//        serviceName2: { dependencies: string[], dependents: string[] },
//        // ... outros serviços ...
//      },
//      metadata: { // Cópia dos metadados dos serviços (SERVICE_METADATA)
//        serviceName1: { dependencies: string[], criticalPath: boolean, ... },
//        serviceName2: { dependencies: string[], criticalPath: boolean, ... },
//        // ... outros serviços ...
//      }
//    }

// Como resetar o ServiceInitializer para uma nova inicialização (ex: em testes ou recuperação de erros):
// 1. Chame o método `serviceInitializer.reset()`:
//    serviceInitializer.reset();
//    console.log('ServiceInitializer resetado.');
//    Isso limpa o estado de `initializationStatus`, permitindo que você execute `initializeServices` novamente.

// Recursos disponibilizados pela instância singleton `serviceInitializer`:
// - `serviceInitializer.initializeServices(serviceInitializers)`:
//   - Método principal para iniciar a orquestração da inicialização dos serviços.
//   - Recebe um objeto `serviceInitializers` como argumento, contendo as funções de inicialização para cada serviço.
//   - Retorna uma Promise que resolve ou rejeita dependendo do sucesso da inicialização (especialmente de serviços críticos).

// - `serviceInitializer.getInitializationState()`:
//   - Método para obter o estado atual do processo de inicialização.
//   - Retorna um objeto com informações detalhadas sobre o status de cada serviço, o grafo de dependências e os metadados dos serviços.
//   - Útil para monitoramento, depuração ou para adaptar a UI com base no estado da inicialização.

// - `serviceInitializer.reset()`:
//   - Método para resetar o estado interno do `ServiceInitializer`.
//   - Limpa o registro de status de inicialização, permitindo que a inicialização seja reiniciada.
//   - Pode ser usado em cenários como testes unitários ou lógicas de recuperação de falhas.