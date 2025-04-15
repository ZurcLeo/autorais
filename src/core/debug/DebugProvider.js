// src/core/debug/DebugProvider.js
import React, { useEffect } from 'react';
import { serviceLocator } from '../services/BaseService';
/**
 * Provedor de ferramentas de depuração para a aplicação
 * Deve ser usado apenas em ambientes de desenvolvimento
 */
export const DebugProviderBridge = (eventBridgeService, { children }) => {
  console.log(`Usando serviceLocator com ID: ${serviceLocator.id} em [DebugProviderBridge - DebugProvider]`);

  // const eventActionBridgeService = eventBridgeService || 
  // serviceLocator.get('eventActionBridge');
  const eventActionBridgeService = serviceLocator.get('eventActionBridge');


  useEffect(() => {
    // Inicializar rastreamento de eventos apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log('🛠️ Inicializando ambiente de debug');
      
      // Inicializar array de rastreamento se não existir
      if (typeof window !== 'undefined' && !window._eventTracing) {
        window._eventTracing = [];
        console.log('📊 Sistema de rastreamento de eventos inicializado');
      }
      
      // Verificar e exportar ferramentas de diagnóstico
      if (eventActionBridgeService) {
        try {
          const debugTools = eventActionBridgeService.exportDebugTools();
          console.log('🔧 Ferramentas de diagnóstico exportadas:', debugTools ? 'OK' : 'Falha');
        } catch (error) {
          console.error('❌ Erro ao exportar ferramentas de diagnóstico:', error);
        }
      } else {
        console.warn('⚠️ eventActionBridgeService não disponível');
      }
    }
    
    return () => {
      // Limpeza ao desmontar (opcional)
    };
  }, []);
  
  // Renderizar apenas os filhos, este componente não adiciona nada visualmente
  return children;
};