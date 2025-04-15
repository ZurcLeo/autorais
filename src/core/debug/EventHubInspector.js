// src/debug/EventHubInspector.js
import React, { useState, useEffect } from 'react';
import { serviceEventHub } from '../services/BaseService';
import { eventActionBridgeService } from '../../services/EventActionBridgeService';

export const EventHubInspector = ({ enabled = true }) => {
  const [events, setEvents] = useState([]);
  const [mappings, setMappings] = useState([]);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Cria um handler que captura todos os eventos
    const genericHandler = (serviceName, eventType, data) => {
      setEvents(prev => [
        {
          id: Date.now(),
          serviceName,
          eventType,
          data,
          timestamp: new Date().toISOString()
        },
        ...prev.slice(0, 99) // Mantém os últimos 100 eventos
      ]);
    };
    
    // Registra o handler para todos os serviços e eventos
    const unsubscribe = serviceEventHub.onAny('*', genericHandler);
    
    // Obtém os mapeamentos
    if (eventActionBridgeService) {
      setMappings(Array.from(eventActionBridgeService.mappings.entries())
        .map(([id, mapping]) => ({ id, ...mapping })));
    }
    
    return unsubscribe;
  }, [enabled]);
  
  if (!enabled) return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '400px',
      height: '300px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      overflow: 'auto',
      padding: '10px',
      zIndex: 9995,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3>Event Hub Inspector</h3>
      <div>
        <h4>Mappings ({mappings.length})</h4>
        <ul style={{maxHeight: '100px', overflow: 'auto'}}>
          {mappings.map(mapping => (
            <li key={mapping.id}>
              {mapping.serviceName}:{mapping.eventType} → {mapping.actionType}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Events ({events.length})</h4>
        <ul style={{maxHeight: '150px', overflow: 'auto'}}>
          {events.map(event => (
            <li key={event.id} style={{
              marginBottom: '5px',
              borderBottom: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div><strong>{event.serviceName}:{event.eventType}</strong></div>
              <div style={{fontSize: '10px'}}>{event.timestamp}</div>
              <div style={{
                maxHeight: '30px', 
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {JSON.stringify(event.data).substring(0, 100)}
                {JSON.stringify(event.data).length > 100 ? '...' : ''}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};