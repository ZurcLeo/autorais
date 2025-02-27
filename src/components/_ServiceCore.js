// import { useReducer, useState, useContext, useCallback, useEffect } from 'react';
// import { ServiceCoreContext } from '../../context/ServiceCoreContext'; // Importa o Contexto ServiceCoreContext que será usado para fornecer e consumir os valores
// import metadataReducer from '../../reducers/metadata/metadataReducer'; // Importa o reducer metadataReducer, responsável por gerenciar o estado de metadados do serviço
// import { initialState } from '../../reducers/serviceCore/initialState'; // Importa o estado inicial para o reducer
// import {retryManager} from '../resilience/index'; // Importa o retryManager, provavelmente para lidar com retentativas em operações de serviço
// import { coreLogger } from '../logging'; // Importa o coreLogger para logs centralizados
// import { LOG_LEVELS } from '../logging'; // Importa níveis de log

// const MODULE_NAME = 'ServiceCore'; // Define o nome do módulo para fins de log
// const SERVICE_METADATA = metadataReducer(); // Inicializa o reducer de metadados do serviço (parece redundante aqui, pois o reducer já é passado para useReducer)

// // ServiceCoreProvider é um Provider de Contexto React que gerencia o estado central dos serviços da aplicação
// export const ServiceCoreProvider = ({ children }) => {
//   // useReducer é usado para gerenciar o estado complexo dos serviços.
//   // metadataReducer é a função reducer que define como o estado é atualizado.
//   // initialState é o estado inicial dos serviços.
//   const [state, dispatch] = useReducer(metadataReducer, initialState);
//   // coreReady é um estado local para rastrear se todos os serviços essenciais foram inicializados.
//   const [coreReady, setCoreReady] = useState(false);

//   // areDependenciesReady: Callback para verificar se as dependências de um serviço estão prontas.
//   // useCallback é usado para memoizar a função, evitando recriações desnecessárias em cada renderização.
//   const areDependenciesReady = useCallback((serviceName) => {
//     // Busca as dependências configuradas para o serviço (definidas no initialState ou ao inicializar o serviço).
//     const dependencies = state.dependencies[serviceName] || [];
//     // Verifica se todos os serviços listados como dependências têm status 'ready' no estado global de serviços.
//     const readyStatus = dependencies.every(dep =>
//       state.services[dep]?.status === 'ready'
//     );

//     // Loga o estado de verificação de dependências para fins de monitoramento e debugging.
//     coreLogger.logServiceState(serviceName, {
//       status: 'checking_dependencies',
//       dependencies,
//       ready: readyStatus
//     });

//     // Retorna um booleano indicando se todas as dependências estão prontas.
//     return readyStatus;
//   }, [state.services, state.dependencies]); // Dependências do useCallback: state.services e state.dependencies (quando mudam, a função é recriada)

//   // initializeService: Callback assíncrono para inicializar um serviço específico.
//   // useCallback também é usado aqui para memoização.
//   const initializeService = useCallback(async (serviceName, initFn, dependencies = []) => {
//     // initializationOperation: Função interna assíncrona que encapsula a lógica de inicialização, incluindo retentativas e tratamento de erros.
//     const initializationOperation = async () => {
//       coreLogger.logServiceInitStart(serviceName); // Loga o início da inicialização do serviço

//       const startTime = performance.now(); // Marca o tempo de início para medir a performance

//       // dispatch(SERVICE_INIT): Dispara uma ação para o reducer, indicando que a inicialização do serviço começou.
//       // Isso atualiza o estado global, registrando que o serviço está em processo de inicialização e suas dependências.
//       dispatch({
//         type: 'SERVICE_INIT',
//         service: serviceName,
//         dependencies
//       });

//       // Verifica se as dependências do serviço estão prontas antes de prosseguir com a inicialização.
//       if (!areDependenciesReady(serviceName)) {
//         const error = new Error(`Dependencies not ready for: ${serviceName}`);
//         coreLogger.logServiceError(serviceName, error, { dependencies }); // Loga o erro de dependências não prontas
//         throw error; // Lança um erro para interromper a inicialização se as dependências não estiverem prontas
//       }

//       try {
//         // retryManager.retryWithBackoff: Tenta executar a função de inicialização (initFn) com retentativas e backoff.
//         // Isso aumenta a resiliência da inicialização do serviço, lidando com falhas temporárias.
//         const result = await retryManager.retryWithBackoff(
//           serviceName,
//           async () => {
//             await initFn(); // Executa a função de inicialização do serviço (passada como argumento)
//             return true; // Retorna true se initFn for bem-sucedida
//           }
//         );

//         const duration = performance.now() - startTime; // Calcula a duração da inicialização

//         if (result) {
//           // dispatch(SERVICE_READY): Se a inicialização for bem-sucedida, dispara uma ação para o reducer,
//           // indicando que o serviço está pronto. Isso atualiza o status do serviço no estado global para 'ready'.
//           dispatch({
//             type: 'SERVICE_READY',
//             service: serviceName
//           });

//           coreLogger.logServiceInitComplete(serviceName, duration); // Loga o sucesso da inicialização e a duração
//         }

//         return result; // Retorna o resultado da operação (true em caso de sucesso)
//       } catch (error) {
//         const duration = performance.now() - startTime; // Calcula a duração mesmo em caso de erro

//         coreLogger.logServiceInitError(serviceName, error); // Loga o erro de inicialização

//         // dispatch(SERVICE_ERROR): Se ocorrer um erro durante a inicialização ou retentativas, dispara uma ação
//         // para o reducer, indicando que o serviço falhou na inicialização. Atualiza o status para 'error' e registra o erro.
//         dispatch({
//           type: 'SERVICE_ERROR',
//           service: serviceName,
//           error: {
//             message: error.message,
//             isMaxRetriesError: error.message.includes('Maximum retry attempts') // Indica se o erro foi devido a retentativas máximas excedidas
//           }
//         });

//         return false; // Retorna false para indicar falha na inicialização
//       }
//     };

//     try {
//       return await initializationOperation(); // Executa a operação de inicialização e retorna o resultado
//     } catch (error) {
//       coreLogger.logServiceError(serviceName, error, { // Loga erros que ocorrem fora do bloco retryManager
//         phase: 'initialization',
//         dependencies
//       });
//       return false; // Retorna false em caso de erro na operação de inicialização
//     }
//   }, [state.services, areDependenciesReady]); // Dependências do useCallback: state.services e areDependenciesReady

//   // useEffect para monitorar mudanças no estado dos serviços e definir coreReady quando todos os serviços estiverem prontos.
//   useEffect(() => {
//     // Obtém todos os nomes de serviço definidos no estado.
//     const allServices = Object.keys(state.services);
//     // Filtra os serviços que possuem status 'ready'.
//     const readyServices = allServices.filter(service =>
//       state.services[service].status === 'ready'
//     );

//     // Se houver serviços definidos E o número de serviços prontos for igual ao número total de serviços,
//     // significa que todos os serviços foram inicializados com sucesso.
//     if (allServices.length > 0 && allServices.length === readyServices.length) {
//       dispatch({ type: 'CORE_READY' }); // Dispara uma ação para o reducer indicando que o core está pronto (pode ser usado para um estado global 'app ready')
//       setCoreReady(true); // Atualiza o estado local coreReady para true, sinalizando que o ServiceCoreProvider está pronto.

//       coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.SUCCESS, 'All services ready', { // Loga o evento de sucesso
//         totalServices: allServices.length,
//         initializationOrder: state.initializationOrder // Loga a ordem de inicialização dos serviços
//       });
//     }
//   }, [state.services, state.initializationOrder]); // Dependências do useEffect: state.services e state.initializationOrder

//   // useEffect para logar o ciclo de vida do Provider (montagem e desmontagem).
//   useEffect(() => {
//     coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'ServiceCore provider mounted', { // Loga quando o provider é montado
//       servicesCount: Object.keys(SERVICE_METADATA).length // Loga o número de serviços definidos (parece usar metadataReducer() novamente, pode ser redundante)
//     });

//     return () => {
//       coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'ServiceCore provider unmounting'); // Loga quando o provider é desmontado (cleanup function)
//     };
//   }, []); // Sem dependências, executa apenas na montagem e desmontagem do componente

//   // useEffect para monitorar erros críticos no estado.
//   useEffect(() => {
//     if (state.error) { // Se houver um erro no estado global (gerenciado pelo reducer)
//       coreLogger.logServiceError(MODULE_NAME, state.error, { // Loga o erro como crítico
//         criticalError: true,
//         affectedServices: Object.keys(state.services).filter( // Identifica quais serviços estão em estado de erro
//           service => state.services[service].status === 'error'
//         )
//       });
//     }
//   }, [state.error]); // Dependência do useEffect: state.error. Executa quando o estado de erro muda.

//   // contextValue: Objeto que será fornecido como valor do contexto ServiceCoreContext.Provider.
//   // Componentes filhos de ServiceCoreProvider podem consumir esses valores usando useServiceCore hook.
//   const contextValue = {
//     state, // Estado atual gerenciado pelo reducer (contém informações sobre serviços, status, dependências, etc.)
//     coreReady, // Booleano indicando se todos os serviços foram inicializados e o core está pronto.
//     initializeService, // Função para iniciar a inicialização de um serviço específico.
//     areDependenciesReady // Função para verificar se as dependências de um serviço estão prontas.
//   };

//   // ServiceCoreContext.Provider: Componente Provider do Contexto.
//   // value={contextValue}: Define o valor que será fornecido para todos os componentes consumidores dentro deste Provider.
//   // {children}: Renderiza os componentes filhos que serão "envolvidos" por este Provider, permitindo que eles consumam o contexto.
//   return (
//     <ServiceCoreContext.Provider value={contextValue}>
//       {children}
//     </ServiceCoreContext.Provider>
//   );
// };

// // useServiceCore: Hook customizado para consumir o contexto ServiceCoreContext.
// // Componentes que precisam acessar o estado e as funções do ServiceCoreProvider usam este hook.
// export const useServiceCore = () => {
//   // useContext(ServiceCoreContext): Hook React para acessar o valor do contexto ServiceCoreContext.
//   const context = useContext(ServiceCoreContext);
//   // Garante que useServiceCore seja chamado dentro de um ServiceCoreProvider.
//   if (!context) {
//     throw new Error('useServiceCore must be used within ServiceCoreProvider'); // Lança um erro se o hook for usado fora do Provider
//   }
//   return context; // Retorna o valor do contexto (contextValue), que contém o estado e as funções.
// };

// // Como um componente deve consumir o ServiceCoreProvider:
// // 1. Importe useServiceCore: import { useServiceCore } from './path/to/ServiceCore';
// // 2. Chame o hook dentro do componente funcional: const { state, coreReady, initializeService, areDependenciesReady } = useServiceCore();
// // 3. Use os valores e funções retornados para acessar o estado dos serviços, verificar se o core está pronto, inicializar serviços, etc.

// // Recursos disponibilizados pelo ServiceCoreProvider através do useServiceCore hook:
// // - state: O estado completo gerenciado pelo reducer, contendo informações detalhadas sobre os serviços.
// // - coreReady: Um booleano que indica se todos os serviços foram inicializados com sucesso. Útil para renderizar a aplicação principal somente quando o core estiver pronto.
// // - initializeService(serviceName, initFn, dependencies): Uma função assíncrona para iniciar a inicialização de um serviço.
// //   - serviceName: Nome do serviço a ser inicializado.
// //   - initFn: Uma função assíncrona que contém a lógica de inicialização específica do serviço.
// //   - dependencies: Um array de nomes de serviços dos quais este serviço depende.
// // - areDependenciesReady(serviceName): Uma função para verificar se todas as dependências de um serviço específico estão prontas.