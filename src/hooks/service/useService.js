// // src/hooks/useService.js

// import { useState, useEffect, useMemo } from 'react';
// import { serviceInitializer } from '../core/initialization/ServiceInitializer';
// import { useServiceInitialization } from './useServiceInitialization';

// /**
//  * Hook para acesso a serviços em componentes React
//  * @param {string} serviceName - Nome do serviço a ser obtido
//  * @param {Object} options - Opções de configuração
//  * @returns {Object} - { service, loading, error }
//  */
// export function useService(serviceName, options = {}) {
//   const [service, setService] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Usar o hook de inicialização existente para compatibilidade
//   const { isServiceReady, getServiceError } = useServiceInitialization();
  
//   // Verificar se o serviço já está inicializado
//   const isReady = useMemo(() => 
//     isServiceReady(serviceName), [isServiceReady, serviceName]);
  
//   // Carregar o serviço no efeito
//   useEffect(() => {
//     if (isReady) {
//       // Se o serviço já está inicializado no sistema principal, não precisamos inicializar novamente
//       const serviceData = serviceInitializer.registeredServices.get(serviceName);
//       if (serviceData && serviceData.instance) {
//         setService(serviceData.instance);
//         setLoading(false);
//         return;
//       }
//     }
    
//     let isMounted = true;
    
//     const loadService = async () => {
//       try {
//         setLoading(true);
//         const serviceInstance = await serviceInitializer.getService(serviceName);
        
//         if (isMounted) {
//           setService(serviceInstance);
//           setLoading(false);
//         }
//       } catch (err) {
//         if (isMounted) {
//           console.error(`Error loading service ${serviceName}:`, err);
//           setError(err);
//           setLoading(false);
//         }
//       }
//     };
    
//     loadService();
    
//     return () => {
//       isMounted = false;
//     };
//   }, [serviceName, isReady]);
  
//   // Tentar obter erro do sistema de inicialização existente
//   const serviceError = getServiceError(serviceName);
//   const finalError = error || serviceError;
  
//   return { 
//     service, 
//     loading, 
//     error: finalError, 
//     isReady
//   };
// }