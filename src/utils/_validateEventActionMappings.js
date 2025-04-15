// src/utils/eventActionValidation.js
import { AUTH_ACTIONS, CAIXINHA_ACTIONS, CONNECTION_ACTIONS, INTERESTS_ACTIONS, 
  INVITATION_ACTIONS, MESSAGE_ACTIONS, NOTIFICATION_ACTIONS, USER_ACTIONS, 
  USER_PREFS_ACTIONS } from "../core/constants/actions";
import { AUTH_EVENTS, CAIXINHA_EVENTS, CONNECTION_EVENTS, INTERESTS_EVENTS, 
  INVITATION_EVENTS, MESSAGE_EVENTS, NOTIFICATION_EVENTS, USER_EVENTS, 
  USER_PREFS_EVENTS } from "../core/constants/events";
import { serviceLocator } from "../core/services/BaseService";
  
/**
 * Validação avançada de mapeamentos evento-ação
 * Sistema completo para diagnóstico, análise e melhoria de mapeamentos
 */
export const validateEventActionMappings = (options = { 
  verbose: true, 
  includeSuggestions: true,
  includeImpactAnalysis: true
}) => {
  console.group('🔍 Validação de Mapeamentos Evento-Ação');
  const eventActionBridgeService = serviceLocator.get('eventActionBridge')
  
  // Obter todos os tipos de eventos disponíveis
  const allEventTypes = Object.values({
    
    ...AUTH_EVENTS,
    ...CONNECTION_EVENTS,
    ...MESSAGE_EVENTS,
    ...INVITATION_EVENTS,
    ...NOTIFICATION_EVENTS,
    ...INTERESTS_EVENTS,
    ...USER_EVENTS,
    ...CAIXINHA_EVENTS,
    ...USER_PREFS_EVENTS
  });
  
  // Obter todos os tipos de ações disponíveis
  const allActionTypes = Object.values({
    ...AUTH_ACTIONS,
    ...CONNECTION_ACTIONS,
    ...MESSAGE_ACTIONS,
    ...INVITATION_ACTIONS,
    ...NOTIFICATION_ACTIONS,
    ...INTERESTS_ACTIONS,
    ...USER_ACTIONS,
    ...CAIXINHA_ACTIONS,
    ...USER_PREFS_ACTIONS
  });
  
  // Mapear constantes para seus namespaces originais
  const eventToNamespaceMap = {};
  const actionToNamespaceMap = {};
  
  // Popular mapas para eventos
  Object.entries({
    AUTH_EVENTS, CONNECTION_EVENTS, MESSAGE_EVENTS, INVITATION_EVENTS,
    NOTIFICATION_EVENTS, INTERESTS_EVENTS, USER_EVENTS, CAIXINHA_EVENTS,
    USER_PREFS_EVENTS
  }).forEach(([namespaceName, namespace]) => {
    Object.values(namespace).forEach(value => {
      eventToNamespaceMap[value] = {
        namespace: namespaceName,
        constantName: Object.entries(namespace).find(([_, v]) => v === value)?.[0] || 'UNKNOWN'
      };
    });
  });
  
  // Popular mapas para ações
  Object.entries({
    AUTH_ACTIONS, CONNECTION_ACTIONS, MESSAGE_ACTIONS, INVITATION_ACTIONS,
    NOTIFICATION_ACTIONS, INTERESTS_ACTIONS, USER_ACTIONS, CAIXINHA_ACTIONS,
    USER_PREFS_ACTIONS
  }).forEach(([namespaceName, namespace]) => {
    Object.values(namespace).forEach(value => {
      actionToNamespaceMap[value] = {
        namespace: namespaceName,
        constantName: Object.entries(namespace).find(([_, v]) => v === value)?.[0] || 'UNKNOWN'
      };
    });
  });
  
  // Extrair os mapeamentos atuais
  const mappedEvents = [...new Set(Array.from(eventActionBridgeService.mappings.values()).map(m => m.eventType))];
  const mappedActions = [...new Set(Array.from(eventActionBridgeService.mappings.values()).map(m => m.actionType))];
  
  // =========================================================================
  // Funções Utilitárias
  // =========================================================================
  
  // Extrair o serviço de um tipo de evento
  const getServiceNameFromEvent = (eventType) => {
    const mapping = Array.from(eventActionBridgeService.mappings.values())
      .find(m => m.eventType === eventType);
    return mapping?.serviceName || eventType.split('_')[0].toLowerCase();
  };
  
  // Extrair o módulo de uma ação
  const getModuleFromAction = (actionType) => {
    return actionType.split('/')[0];
  };
  
  // Obter nome constante do evento para código
  const getEventConstantName = (eventType) => {
    const info = eventToNamespaceMap[eventType];
    return info ? `${info.namespace}.${info.constantName}` : `'${eventType}'`;
  };
  
  // Obter nome constante da ação para código
  const getActionConstantName = (actionType) => {
    const info = actionToNamespaceMap[actionType];
    return info ? `${info.namespace}.${info.constantName}` : `'${actionType}'`;
  };
  
  // Agrupar itens por módulo
  const groupByModule = (items) => {
    return items.reduce((acc, item) => {
      let module;
      
      if (item.includes('/')) {
        // Ações no formato "module/ACTION_TYPE"
        module = item.split('/')[0];
      } else {
        // Eventos, tentar determinar módulo a partir do nome
        const firstPart = item.split('_')[0].toLowerCase();
        
        // Mapeamento simples de prefixos para módulos
        const moduleMap = {
          'auth': 'auth',
          'users': 'users',
          'messages': 'messages',
          'notifications': 'notifications',
          'invitation': 'invites',
          'caixinhas': 'caixinhas',
          'connections': 'connections',
          'interests': 'interests',
          'pref': 'userPreferences'
        };
        
        module = moduleMap[firstPart] || 'outros';
      }
      
      if (!acc[module]) acc[module] = [];
      acc[module].push(item);
      return acc;
    }, {});
  };
  
  // Verificar similaridade entre strings (para sugestões)
  const stringSimilarity = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    // Algoritmo de distância de Levenshtein simplificado
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    const pairs1 = new Set();
    const pairs2 = new Set();
    
    for (let i = 0; i < s1.length - 1; i++) {
      pairs1.add(s1.substring(i, i + 2));
    }
    
    for (let i = 0; i < s2.length - 1; i++) {
      pairs2.add(s2.substring(i, i + 2));
    }
    
    const intersection = new Set([...pairs1].filter(x => pairs2.has(x)));
    const union = new Set([...pairs1, ...pairs2]);
    
    return intersection.size / union.size;
  };
  
  // Encontrar ação sugerida para evento
  const findSuggestedAction = (eventType, unusedActions) => {
    // Extrair partes significativas do nome do evento
    const eventParts = eventType.split('_');
    const eventPrefix = eventParts[0].toLowerCase();
    const eventVerb = eventParts.length > 1 ? eventParts[1].toLowerCase() : '';
    
    // Tentar encontrar correspondência direta
    const modulePrefix = eventType.split('_')[0].toLowerCase();
    
    // Mapeamento de módulos
    const moduleMap = {
      'auth': 'auth',
      'users': 'users', 
      'messages': 'messages',
      'notifications': 'notifications',
      'invitation': 'invites',
      'caixinhas': 'caixinhas',
      'connections': 'connections',
      'interests': 'interests',
      'pref': 'userPreferences'
    };
    
    const moduleActions = unusedActions.filter(action => {
      const actionModule = action.split('/')[0];
      return actionModule === moduleMap[modulePrefix];
    });
    
    // Se encontramos ações do mesmo módulo, procurar a mais similar
    if (moduleActions.length > 0) {
      const actionScores = moduleActions.map(action => {
        const actionType = action.split('/')[1] || '';
        const score = stringSimilarity(eventType, actionType);
        return { action, score };
      });
      
      // Ordenar por maior similaridade
      actionScores.sort((a, b) => b.score - a.score);
      
      // Retornar a ação mais similar se a pontuação for adequada
      if (actionScores[0].score > 0.3) {
        return actionScores[0].action;
      }
    }
    
    // Sem sugestão adequada
    return null;
  };
  
  // =========================================================================
  // Validação Principal
  // =========================================================================
  
  // Verificar eventos não mapeados
  const unmappedEvents = allEventTypes.filter(e => !mappedEvents.includes(e));
  
  // Verificar ações não utilizadas
  const unusedActions = allActionTypes.filter(a => !mappedActions.includes(a));
  
  // Verificar mapeamentos multidirecionais
  const checkForOverlaps = () => {
    const eventToActions = new Map();
    const actionToEvents = new Map();
    
    eventActionBridgeService.mappings.forEach(mapping => {
      // Mapeamento evento → ações
      if (!eventToActions.has(mapping.eventType)) {
        eventToActions.set(mapping.eventType, []);
      }
      eventToActions.get(mapping.eventType).push(mapping.actionType);
      
      // Mapeamento ação → eventos
      if (!actionToEvents.has(mapping.actionType)) {
        actionToEvents.set(mapping.actionType, []);
      }
      actionToEvents.get(mapping.actionType).push(mapping.eventType);
    });
    
    // Encontrar eventos que disparam múltiplas ações
    const eventsWithMultipleActions = [...eventToActions.entries()]
      .filter(([_, actions]) => actions.length > 1);
    
    // Encontrar ações disparadas por múltiplos eventos
    const actionsWithMultipleEvents = [...actionToEvents.entries()]
      .filter(([_, events]) => events.length > 1);
    
    return {
      eventToActions,
      actionToEvents,
      eventsWithMultipleActions,
      actionsWithMultipleEvents
    };
  };
  
  // Verificar existência
  const validateExistence = () => {
    const invalidEvents = mappedEvents.filter(
      event => !allEventTypes.includes(event)
    );
    
    const invalidActions = mappedActions.filter(
      action => !allActionTypes.includes(action)
    );
    
    return { invalidEvents, invalidActions };
  };
  
  // Executar verificações
  const { eventToActions, actionToEvents, eventsWithMultipleActions, actionsWithMultipleEvents } = checkForOverlaps();
  const { invalidEvents, invalidActions } = validateExistence();
  
  // Agrupar resultados por módulo
  const groupedUnmapped = groupByModule(unmappedEvents);
  const groupedUnused = groupByModule(unusedActions);
  const groupedMappedEvents = groupByModule(mappedEvents);
  const groupedMappedActions = groupByModule(mappedActions);
  
  // =========================================================================
  // Geração de Sugestões
  // =========================================================================
  
  const suggestFixes = () => {
    if (!options.includeSuggestions) return [];
    
    const suggestions = [];
    
    // Sugerir mapeamentos para eventos não mapeados
    unmappedEvents.forEach(eventType => {
      const suggestedAction = findSuggestedAction(eventType, unusedActions);
      
      if (suggestedAction) {
        const serviceName = getServiceNameFromEvent(eventType);
        
        suggestions.push({
          type: 'ADD_MAPPING',
          event: eventType,
          action: suggestedAction,
          serviceName,
          confidence: 'medium',
          code: `eventActionBridgeService.registerMapping(
  '${serviceName}',
  ${getEventConstantName(eventType)},
  ${getActionConstantName(suggestedAction)},
  (eventData) => ({
    ...eventData,
    timestamp: eventData.timestamp || Date.now()
  })
);`
        });
      }
    });
    
    // Sugerir consolidação para eventos com múltiplas ações
    eventsWithMultipleActions.forEach(([event, actions]) => {
      suggestions.push({
        type: 'CONSOLIDATE_ACTIONS',
        event,
        actions,
        confidence: 'high',
        description: `O evento ${event} dispara múltiplas ações (${actions.join(', ')}). Considere consolidar em uma única ação composta ou usar um middleware.`,
        code: `// Exemplo de consolidação via middleware
const eventMiddleware = store => next => action => {
  // Para ações consolidadas
  if (action.type === '${actions[0]}' && action.meta?.source === '${event}') {
    // Despachar ações secundárias
    ${actions.slice(1).map(a => `store.dispatch({ type: '${a}', payload: action.payload });`).join('\n    ')}
  }
  return next(action);
}`
      });
    });
    
    // Sugerir mapeamentos padrão para ações comuns
    unusedActions.forEach(action => {
      // Tentar inferir evento correspondente com base em convenções comuns
      const actionParts = action.split('/');
      if (actionParts.length !== 2) return;
      
      const [module, actionType] = actionParts;
      
      // Mapear padrões comuns
      const commonPatterns = {
        'FETCH_SUCCESS': '_FETCHED',
        'UPDATE_SUCCESS': '_UPDATED',
        'DELETE_SUCCESS': '_DELETED',
        'CREATE_SUCCESS': '_CREATED'
      };
      
      Object.entries(commonPatterns).forEach(([actionPattern, eventSuffix]) => {
        if (actionType.includes(actionPattern)) {
          const baseEventName = module.toUpperCase();
          const potentialEvent = `${baseEventName}${eventSuffix}`;
          
          if (unmappedEvents.includes(potentialEvent)) {
            suggestions.push({
              type: 'ADD_MAPPING_CONVENTION',
              event: potentialEvent,
              action,
              serviceName: module,
              confidence: 'medium',
              description: `Baseado em convenções, ${potentialEvent} deveria mapear para ${action}`,
              code: `eventActionBridgeService.registerMapping(
  '${module}',
  ${getEventConstantName(potentialEvent)},
  ${getActionConstantName(action)},
  (eventData) => ({
    ...eventData,
    timestamp: eventData.timestamp || Date.now()
  })
);`
            });
          }
        }
      });
    });
    
    return suggestions;
  };
  
  // =========================================================================
  // Análise de Impacto
  // =========================================================================
  
  const analyzeImpact = () => {
    if (!options.includeImpactAnalysis) return null;
    
    // Determinar a severidade de um problema de mapeamento
    const determineSeverity = (eventType, issue) => {
      // Critérios para definir severidade
      const criticalEventPrefixes = ['AUTH_', 'USER_', 'INIT_'];
      const isCriticalEvent = criticalEventPrefixes.some(prefix => eventType.startsWith(prefix));
      
      switch (issue) {
        case 'unmapped':
          return isCriticalEvent ? 'high' : 'medium';
        case 'multiAction':
          // Múltiplas ações podem ser intencionais, mas merecem revisão
          return 'medium';
        case 'invalid':
          // Inválido representa um risco direto
          return 'high';
        default:
          return 'low';
      }
    };
    
    // Identificar componentes e fluxos afetados
    const impactAnalysis = {
      criticalIssues: [],
      affectedModules: new Set(),
      severity: {
        high: 0,
        medium: 0,
        low: 0
      }
    };
    
    // Analisar eventos não mapeados
    unmappedEvents.forEach(event => {
      const severity = determineSeverity(event, 'unmapped');
      impactAnalysis.severity[severity]++;
      
      if (severity === 'high') {
        impactAnalysis.criticalIssues.push({
          type: 'unmapped_event',
          item: event,
          reason: 'Evento crítico sem mapeamento de ação'
        });
      }
      
      // Determinar módulo afetado
      const moduleName = eventToNamespaceMap[event]?.namespace?.replace('_EVENTS', '') || 'desconhecido';
      impactAnalysis.affectedModules.add(moduleName);
    });
    
    // Analisar ações inválidas
    invalidActions.forEach(action => {
      impactAnalysis.severity.high++;
      
      impactAnalysis.criticalIssues.push({
        type: 'invalid_action',
        item: action,
        reason: 'Ação inválida no mapeamento'
      });
      
      const moduleName = getModuleFromAction(action);
      impactAnalysis.affectedModules.add(moduleName);
    });
    
    // Analisar eventos inválidos
    invalidEvents.forEach(event => {
      impactAnalysis.severity.high++;
      
      impactAnalysis.criticalIssues.push({
        type: 'invalid_event',
        item: event,
        reason: 'Evento inválido no mapeamento'
      });
    });
    
    // Analisar eventos com múltiplas ações
    eventsWithMultipleActions.forEach(([event, actions]) => {
      const severity = determineSeverity(event, 'multiAction');
      impactAnalysis.severity[severity]++;
      
      if (severity === 'high') {
        impactAnalysis.criticalIssues.push({
          type: 'multiple_actions',
          item: event,
          actions,
          reason: 'Evento dispara múltiplas ações, possível inconsistência'
        });
      }
      
      const moduleName = eventToNamespaceMap[event]?.namespace?.replace('_EVENTS', '') || 'desconhecido';
      impactAnalysis.affectedModules.add(moduleName);
    });
    
    // Resumo do impacto
    return {
      ...impactAnalysis,
      totalCriticalIssues: impactAnalysis.criticalIssues.length,
      totalAffectedModules: impactAnalysis.affectedModules.size,
      affectedModules: Array.from(impactAnalysis.affectedModules),
      riskLevel: impactAnalysis.severity.high > 0 
        ? 'alto' 
        : (impactAnalysis.severity.medium > 0 ? 'médio' : 'baixo')
    };
  };
  
  // =========================================================================
  // Análise de Padrões e Convenções
  // =========================================================================
  
  const analyzeNamingConventions = () => {
    const eventPrefixes = {};
    const actionPrefixes = {};
    const serviceToEventMap = {};
    
    // Analisar padrões em eventos
    mappedEvents.forEach(eventType => {
      const parts = eventType.split('_');
      const prefix = parts[0];
      const verb = parts.length > 1 ? parts[1] : '';
      
      eventPrefixes[prefix] = (eventPrefixes[prefix] || 0) + 1;
      
      // Mapear serviço para evento
      const mapping = Array.from(eventActionBridgeService.mappings.values())
        .find(m => m.eventType === eventType);
      
      if (mapping) {
        if (!serviceToEventMap[mapping.serviceName]) {
          serviceToEventMap[mapping.serviceName] = new Set();
        }
        serviceToEventMap[mapping.serviceName].add(eventType);
      }
    });
    
    // Analisar padrões em ações
    mappedActions.forEach(actionType => {
      const parts = actionType.split('/');
      if (parts.length !== 2) return;
      
      const [module, action] = parts;
      actionPrefixes[module] = (actionPrefixes[module] || 0) + 1;
      
      const actionVerbs = action.split('_');
      if (actionVerbs.length > 0) {
        const verb = actionVerbs[0];
        actionPrefixes[verb] = (actionPrefixes[verb] || 0) + 1;
      }
    });
    
    // Analisar consistência
    const consistencyReport = {
      eventPrefixConsistency: Object.keys(eventPrefixes).length <= 10,
      actionPrefixConsistency: Object.keys(actionPrefixes).length <= 15,
      serviceEventConsistency: Object.values(serviceToEventMap).every(events => 
        events.size > 0 && [...events].every(event => event.startsWith(events.values().next().value.split('_')[0]))
      ),
      commonEventPrefixes: Object.entries(eventPrefixes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([prefix, count]) => `${prefix} (${count})`),
      commonActionModules: Object.entries(actionPrefixes)
        .filter(([key]) => key.length > 2 && !key.includes('_'))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([prefix, count]) => `${prefix} (${count})`),
      recommendations: []
    };
    
    // Gerar recomendações
    if (!consistencyReport.eventPrefixConsistency) {
      consistencyReport.recommendations.push(
        'Muitos prefixos diferentes em eventos. Considere padronizar os prefixos de eventos para melhor consistência.'
      );
    }
    
    if (!consistencyReport.serviceEventConsistency) {
      consistencyReport.recommendations.push(
        'Alguns serviços emitem eventos com prefixos inconsistentes. Cada serviço deve usar um prefixo consistente para seus eventos.'
      );
    }
    
    // Analisar convenções específicas para mapeamentos
    const conventionAnalysis = {
      hasConsistentNaming: true,
      details: []
    };
    
    // Verificar convenções de eventos → ações
    eventActionBridgeService.mappings.forEach(mapping => {
      const eventParts = mapping.eventType.split('_');
      const actionParts = mapping.actionType.split('/')[1]?.split('_') || [];
      
      // Convenções comuns
      const conventions = [
        { 
          pattern: eventParts.includes('CREATED'), 
          expected: actionParts.includes('CREATE_SUCCESS') || actionParts.includes('ADD_SUCCESS'),
          message: `Evento ${mapping.eventType} → ação ${mapping.actionType}: eventos CREATED tipicamente mapeiam para ações CREATE_SUCCESS`
        },
        { 
          pattern: eventParts.includes('UPDATED'), 
          expected: actionParts.includes('UPDATE_SUCCESS'),
          message: `Evento ${mapping.eventType} → ação ${mapping.actionType}: eventos UPDATED tipicamente mapeiam para ações UPDATE_SUCCESS`
        },
        { 
          pattern: eventParts.includes('DELETED'), 
          expected: actionParts.includes('DELETE_SUCCESS') || actionParts.includes('REMOVE_SUCCESS'),
          message: `Evento ${mapping.eventType} → ação ${mapping.actionType}: eventos DELETED tipicamente mapeiam para ações DELETE_SUCCESS`
        },
        { 
          pattern: eventParts.includes('FETCHED'), 
          expected: actionParts.includes('FETCH_SUCCESS') || actionParts.includes('LOAD_SUCCESS'),
          message: `Evento ${mapping.eventType} → ação ${mapping.actionType}: eventos FETCHED tipicamente mapeiam para ações FETCH_SUCCESS`
        }
      ];
      
      conventions.forEach(convention => {
        if (convention.pattern && !convention.expected) {
          conventionAnalysis.hasConsistentNaming = false;
          conventionAnalysis.details.push(convention.message);
        }
      });
    });
    
    if (!conventionAnalysis.hasConsistentNaming) {
      consistencyReport.recommendations.push(
        'Existem inconsistências nas convenções de nomeação entre eventos e ações. Considere padronizar.'
      );
      
      // Adicionar detalhes
      conventionAnalysis.details.forEach(detail => {
        consistencyReport.recommendations.push(`  - ${detail}`);
      });
    }
    
    return consistencyReport;
  };
  
  // =========================================================================
  // Visualização do Fluxo
  // =========================================================================
  
  const visualizeEventActionFlow = () => {
    const nodes = [];
    const edges = [];
    
    // Criar nós para eventos e ações
    eventActionBridgeService.mappings.forEach(mapping => {
      const eventNode = {
        id: `event:${mapping.eventType}`,
        label: mapping.eventType,
        type: 'event',
        group: getServiceNameFromEvent(mapping.eventType)
      };
      
      const actionNode = {
        id: `action:${mapping.actionType}`,
        label: mapping.actionType,
        type: 'action',
        group: getModuleFromAction(mapping.actionType)
      };
      
      // Adicionar apenas nós únicos
      if (!nodes.some(n => n.id === eventNode.id)) {
        nodes.push(eventNode);
      }
      
      if (!nodes.some(n => n.id === actionNode.id)) {
        nodes.push(actionNode);
      }
      
      // Adicionar aresta
      edges.push({
        from: eventNode.id,
        to: actionNode.id,
        service: mapping.serviceName
      });
    });
    
 
    return {
      nodes,
      edges
    };
  };
  
  const flow = visualizeEventActionFlow();

  // =========================================================================
  // Saída para Console (Visualização para Desenvolvimento)
  // =========================================================================
  
  if (options.verbose) {
    // Formatação melhorada para console
    const printResults = () => {
      const printFormatted = (title, items, isError = false) => {
        console.log(`${isError ? '❌' : '✅'} ${title}`);
        if (items.length === 0) {
          console.log(`  Nenhum item encontrado.`);
        } else {
          items.forEach(item => console.log(`  - ${item}`));
        }
      };
      
      console.group('📊 Estatísticas');
      console.log(`Total de Eventos Definidos: ${allEventTypes.length}`);
      console.log(`Total de Ações Definidas: ${allActionTypes.length}`);
      console.log(`Eventos Mapeados: ${mappedEvents.length} (${((mappedEvents.length / allEventTypes.length) * 100).toFixed(1)}%)`);
      console.log(`Ações Utilizadas: ${mappedActions.length} (${((mappedActions.length / allActionTypes.length) * 100).toFixed(1)}%)`);
      console.log(`Total de Mapeamentos: ${eventActionBridgeService.mappings.size}`);
      console.groupEnd();
      
      console.group('⚠️ Problemas Encontrados');
      printFormatted(`Eventos não mapeados (${unmappedEvents.length})`, unmappedEvents, true);
      printFormatted(`Ações não utilizadas (${unusedActions.length})`, unusedActions, true);
      
      if (invalidEvents.length) {
        printFormatted(`Eventos inválidos (${invalidEvents.length})`, invalidEvents, true);
      }
      
      if (invalidActions.length) {
        printFormatted(`Ações inválidas (${invalidActions.length})`, invalidActions, true);
      }
      
      if (eventsWithMultipleActions.length) {
        console.log(`⚠️ Eventos com múltiplas ações (${eventsWithMultipleActions.length})`);
        eventsWithMultipleActions.forEach(([event, actions]) => {
          console.log(`  - ${event} → ${actions.join(', ')}`);
        });
      }
      
      if (actionsWithMultipleEvents.length) {
        console.log(`⚠️ Ações disparadas por múltiplos eventos (${actionsWithMultipleEvents.length})`);
        actionsWithMultipleEvents.forEach(([action, events]) => {
          console.log(`  - ${action} ← ${events.join(', ')}`);
        });
      }
      console.groupEnd();
      
      // Exibir resultados agrupados por módulo
      console.group('📦 Resultados Agrupados por Módulo');
      console.log('Eventos Não Mapeados:');
      Object.entries(groupedUnmapped).forEach(([module, items]) => {
        console.log(`  ${module}: ${items.length} eventos`);
      });
      
      console.log('\nAções Não Utilizadas:');
      Object.entries(groupedUnused).forEach(([module, items]) => {
        console.log(`  ${module}: ${items.length} ações`);
      });
      console.groupEnd();
    };
    
    printResults();
    
    // =========================================================================
    // Sugestões Automáticas
    // =========================================================================
    
    if (options.includeSuggestions) {
      const suggestions = suggestFixes();
      
      console.group('💡 Sugestões Automáticas');
      if (suggestions.length === 0) {
        console.log('Nenhuma sugestão automática gerada.');
      } else {
        console.log(`Total de Sugestões: ${suggestions.length}`);
        
        suggestions.forEach((suggestion, index) => {
          console.group(`Sugestão #${index + 1} (${suggestion.type})`);
          console.log(`Evento: ${suggestion.event}`);
          
          if (suggestion.action) {
            console.log(`Ação: ${suggestion.action}`);
          }
          
          if (suggestion.serviceName) {
            console.log(`Serviço: ${suggestion.serviceName}`);
          }
          
          console.log(`Confiança: ${suggestion.confidence}`);
          
          if (suggestion.description) {
            console.log(`Descrição: ${suggestion.description}`);
          }
          
          console.log('Código:');
          console.log(suggestion.code);
          console.groupEnd();
        });
      }
      console.groupEnd();
    }
    
    // =========================================================================
    // Análise de Impacto
    // =========================================================================
    
    if (options.includeImpactAnalysis) {
      const impact = analyzeImpact();
      
      console.group('📈 Análise de Impacto');
      console.log(`Nível de Risco: ${impact.riskLevel}`);
      console.log(`Problemas Críticos: ${impact.totalCriticalIssues}`);
      console.log(`Módulos Afetados: ${impact.totalAffectedModules}`);
      console.log(`Severidade:`);
      console.log(`  - Alta: ${impact.severity.high}`);
      console.log(`  - Média: ${impact.severity.medium}`);
      console.log(`  - Baixa: ${impact.severity.low}`);
      
      if (impact.criticalIssues.length > 0) {
        console.group('🚨 Problemas Críticos');
        impact.criticalIssues.forEach(issue => {
          console.log(`[${issue.type.toUpperCase()}] ${issue.item}`);
          console.log(`  Motivo: ${issue.reason}`);
          if (issue.actions) {
            console.log(`  Ações: ${issue.actions.join(', ')}`);
          }
        });
        console.groupEnd();
      }
      
      console.log('Módulos Afetados:');
      impact.affectedModules.forEach(module => {
        console.log(`  - ${module}`);
      });
      console.groupEnd();
    }
    
    // =========================================================================
    // Análise de Padrões e Convenções
    // =========================================================================
    
    const conventions = analyzeNamingConventions();
    
    console.group('🔤 Análise de Padrões e Convenções');
    console.log('Consistência de Prefixos de Eventos:', conventions.eventPrefixConsistency ? '✅ Boa' : '❌ Precisa melhorar');
    console.log('Consistência de Módulos de Ações:', conventions.actionPrefixConsistency ? '✅ Boa' : '❌ Precisa melhorar');
    console.log('Consistência Serviço-Evento:', conventions.serviceEventConsistency ? '✅ Boa' : '❌ Precisa melhorar');
    
    console.log('\nPrefixos de Eventos Mais Comuns:');
    conventions.commonEventPrefixes.forEach(prefix => console.log(`  - ${prefix}`));
    
    console.log('\nMódulos de Ações Mais Comuns:');
    conventions.commonActionModules.forEach(module => console.log(`  - ${module}`));
    
    if (conventions.recommendations.length > 0) {
      console.group('\n📌 Recomendações');
      conventions.recommendations.forEach(rec => console.log(`- ${rec}`));
      console.groupEnd();
    }
    console.groupEnd();
    
    // =========================================================================
    // Visualização do Fluxo (simulada)
    // =========================================================================
    
    console.group('🔄 Visualização do Fluxo Evento-Ação (Componente React)');
    console.log('Dados para o componente FlowDiagram:');
    console.log('Nodes:', flow.nodes);
    console.log('Edges:', flow.edges);
    console.log('Para renderizar, use o componente FlowDiagram com esses dados.');
    console.log('<FlowDiagram nodes={flow.nodes} edges={flow.edges} />');
    console.groupEnd();
  }
  
  // =========================================================================
  // Exportação de Relatórios
  // =========================================================================
  
  const generateReport = () => {
    return {
      summary: {
        totalEvents: allEventTypes.length,
        totalActions: allActionTypes.length,
        mappedEvents: mappedEvents.length,
        mappedActions: mappedActions.length,
        mappingCoverage: {
          events: ((mappedEvents.length / allEventTypes.length) * 100).toFixed(1) + '%',
          actions: ((mappedActions.length / allActionTypes.length) * 100).toFixed(1) + '%'
        },
        totalMappings: eventActionBridgeService.mappings.size
      },
      issues: {
        unmappedEvents,
        unusedActions,
        invalidEvents,
        invalidActions,
        eventsWithMultipleActions,
        actionsWithMultipleEvents
      },
      groupedResults: {
        unmappedByModule: groupedUnmapped,
        unusedByModule: groupedUnused,
        mappedEventsByModule: groupedMappedEvents,
        mappedActionsByModule: groupedMappedActions
      },
      suggestions: options.includeSuggestions ? suggestFixes() : [],
      impactAnalysis: options.includeImpactAnalysis ? analyzeImpact() : null,
      namingConventions: analyzeNamingConventions(),
      flowVisualization: visualizeEventActionFlow(),
      timestamp: new Date().toISOString()
    };
  };
  
  // =========================================================================
  // Função Utilitária para Documentação
  // =========================================================================
  
  const generateDocumentation = () => {
    const doc = {
      introduction: "Documentação dos Mapeamentos Evento-Ação",
      overview: "Este documento descreve todos os mapeamentos entre eventos e ações no sistema.",
      mappings: []
    };
    
    eventActionBridgeService.mappings.forEach(mapping => {
      doc.mappings.push({
        service: mapping.serviceName,
        event: mapping.eventType,
        action: mapping.actionType,
        description: `Quando ${mapping.eventType} é emitido, ${mapping.actionType} é despachada`,
        eventOrigin: eventToNamespaceMap[mapping.eventType]?.namespace || 'desconhecido',
        actionModule: getModuleFromAction(mapping.actionType)
      });
    });
    
    return doc;
  };
  
  // =========================================================================
  // Finalização
  // =========================================================================
  
  console.groupEnd();
  
  return {
    getReport: generateReport,
    getDocumentation: generateDocumentation,
    unmappedEvents,
    unusedActions,
    invalidEvents,
    invalidActions,
    eventsWithMultipleActions,
    actionsWithMultipleEvents,
    suggestions: options.includeSuggestions ? suggestFixes() : [],
    impact: options.includeImpactAnalysis ? analyzeImpact() : null,
    conventions: analyzeNamingConventions(),
    flow: flow,
  };
};

// =========================================================================
// Comandos para Correção Automática
// =========================================================================

export const applyAutoFixes = (suggestions) => {
  const eventActionBridgeService = serviceLocator.get('eventActionBridge')

  const results = {
    applied: 0,
    skipped: 0,
    errors: 0,
    details: []
  };
  
  suggestions.forEach(suggestion => {
    try {
      if (suggestion.type === 'ADD_MAPPING' || suggestion.type === 'ADD_MAPPING_CONVENTION') {
        // Extrair parâmetros do código sugerido
        const match = suggestion.code.match(/registerMapping\(([^)]+)\)/);
        if (match) {
          const args = match[1].split(',').map(arg => arg.trim().replace(/^['"]|['"]$/g, ''));
          
          // Registrar o mapeamento
          eventActionBridgeService.registerMapping(
            args[0], // serviceName
            eval(args[1]), // eventType (avaliado para resolver constantes)
            eval(args[2]), // actionType
            eval(`(${args[3]})`) // transformer
          );
          
          results.applied++;
          results.details.push({
            type: suggestion.type,
            event: suggestion.event,
            action: suggestion.action,
            status: 'success'
          });
        } else {
          results.skipped++;
          results.details.push({
            type: suggestion.type,
            event: suggestion.event,
            action: suggestion.action,
            status: 'skipped',
            reason: 'Não foi possível extrair parâmetros do código'
          });
        }
      } else {
        results.skipped++;
        results.details.push({
          type: suggestion.type,
          status: 'skipped',
          reason: 'Tipo de sugestão não implementado para correção automática'
        });
      }
    } catch (error) {
      results.errors++;
      results.details.push({
        type: suggestion.type,
        event: suggestion.event,
        action: suggestion.action,
        status: 'error',
        error: error.message
      });
    }
  });
  
  return results;
};

// =========================================================================
// Monitoramento em Tempo Real
// =========================================================================

export const setupRealTimeMonitoring = (callback) => {
  const eventActionBridgeService = serviceLocator.get('eventActionBridge')

  const originalRegister = eventActionBridgeService.registerMapping;
  
  // Decorar o método registerMapping para capturar novos mapeamentos
  eventActionBridgeService.registerMapping = function(...args) {
    const result = originalRegister.apply(this, args);
    
    // Notificar o callback sobre o novo mapeamento
    if (callback) {
      callback({
        type: 'MAPPING_ADDED',
        serviceName: args[0],
        eventType: args[1],
        actionType: args[2],
        timestamp: new Date().toISOString()
      });
    }
    
    return result;
  };
  
  // Retornar função para limpeza
  return () => {
    eventActionBridgeService.registerMapping = originalRegister;
  };
};

// =========================================================================
// Integração com o Sistema de Testes
// =========================================================================

export const generateTestCases = () => {
  const eventActionBridgeService = serviceLocator.get('eventActionBridge')

  const testCases = [];
  
  // Gerar testes para cada mapeamento
  eventActionBridgeService.mappings.forEach(mapping => {
    testCases.push({
      description: `Deve despachar ${mapping.actionType} quando ${mapping.eventType} é emitido`,
      code: `it('${mapping.actionType} should be dispatched when ${mapping.eventType} is emitted', () => {
  const mockDispatch = jest.fn();
  const eventData = { /* dados de exemplo */ };
  
  // Simular emissão do evento
  eventActionBridgeService.emit('${mapping.eventType}', eventData);
  
  // Verificar se a ação foi despachada
  expect(mockDispatch).toHaveBeenCalledWith({
    type: '${mapping.actionType}',
    payload: expect.objectContaining(eventData)
  });
});`
    });
  });
  
  // Gerar testes para eventos não mapeados
  const unmappedEvents = Object.values({
    ...AUTH_EVENTS,
    ...CONNECTION_EVENTS,
    ...MESSAGE_EVENTS,
    ...INVITATION_EVENTS,
    ...NOTIFICATION_EVENTS,
    ...INTERESTS_EVENTS,
    ...USER_EVENTS,
    ...CAIXINHA_EVENTS,
    ...USER_PREFS_EVENTS
  }).filter(e => !Array.from(eventActionBridgeService.mappings.values()).some(m => m.eventType === e));
  
  unmappedEvents.forEach(event => {
    testCases.push({
      description: `Deve ter um mapeamento para o evento ${event}`,
      code: `it('should have a mapping for ${event} event', () => {
  const mapping = Array.from(eventActionBridgeService.mappings.values())
    .find(m => m.eventType === '${event}');
    
  expect(mapping).toBeDefined();
});`
    });
  });
  
  return testCases;
};

// =========================================================================
// Rastreamento Histórico
// =========================================================================

const mappingHistory = [];

export const trackMappingChanges = () => {
  const eventActionBridgeService = serviceLocator.get('eventActionBridge')

  const originalRegister = eventActionBridgeService.registerMapping;
  
  eventActionBridgeService.registerMapping = function(...args) {
    const result = originalRegister.apply(this, args);
    
    // Registrar no histórico
    mappingHistory.push({
      type: 'REGISTER',
      serviceName: args[0],
      eventType: args[1],
      actionType: args[2],
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack.split('\n').slice(2).join('\n')
    });
    
    return result;
  };
  
  const originalUnregister = eventActionBridgeService.unregisterMapping;
  
  eventActionBridgeService.unregisterMapping = function(...args) {
    const result = originalUnregister.apply(this, args);
    
    // Registrar no histórico
    mappingHistory.push({
      type: 'UNREGISTER',
      serviceName: args[0],
      eventType: args[1],
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack.split('\n').slice(2).join('\n')
    });
    
    return result;
  };
  
  // Retornar função para limpeza
  return () => {
    eventActionBridgeService.registerMapping = originalRegister;
    eventActionBridgeService.unregisterMapping = originalUnregister;
  };
};

export const getMappingHistory = (options = {}) => {

  const { limit = 50, filter } = options;
  let results = [...mappingHistory];
  
  if (filter) {
    results = results.filter(entry => {
      return Object.entries(filter).every(([key, value]) => {
        return entry[key] === value;
      });
    });
  }
  
  return results.slice(0, limit);
};