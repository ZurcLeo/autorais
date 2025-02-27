// components/ProjectInfoPanel.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';

// Tipagem para garantir consistência
export interface ComponentStatus {
  status: 'stable' | 'attention' | 'error' | 'planned';
  label: string;
  description?: string;
  subComponents?: ComponentStatus[];
}

export interface ProjectInfoPanelProps {
  componentStatusData?: ComponentStatus[];
  context?: string;
  showDetails?: boolean;
  title?: string;
  subtitle?: string;
}

/**
 * Componente unificado para exibir status dos componentes do sistema
 */
export const ProjectInfoPanel: React.FC<ProjectInfoPanelProps> = ({
  componentStatusData = [], // Valor padrão para evitar undefined
  context = 'default',
  showDetails = true,
  title = "System Components Status",
  subtitle
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getStatusColor = (status: ComponentStatus['status']) => {
    switch (status) {
      case 'stable': return '#4caf50'; // verde
      case 'attention': return '#ff9800'; // laranja
      case 'error': return '#f44336'; // vermelho
      case 'planned': return '#2196f3'; // azul
      default: return '#9e9e9e'; // cinza
    }
  };

  // Verificação de segurança para evitar erros com dados undefined
  if (!componentStatusData || !Array.isArray(componentStatusData)) {
    console.warn('ProjectInfoPanel: componentStatusData is undefined or not an array');
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Typography>No component status data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title={title} 
        subheader={subtitle || (context !== 'default' ? `Context: ${context}` : undefined)}
      />
      <CardContent>
        <div>
          {componentStatusData.map((component) => (
            <div 
              key={component.label} 
              style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '4px', 
                padding: '12px',
                marginBottom: '8px' 
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: component.subComponents ? 'pointer' : 'default'
                }}
                onClick={() => component.subComponents && toggleExpand(component.label)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(component.status),
                      marginRight: '8px'
                    }} 
                  />
                  <span style={{ fontWeight: 500 }}>{component.label}</span>
                </div>
                {component.subComponents && (
                  <span>{expandedItems[component.label] ? '−' : '+'}</span>
                )}
              </div>
              
              {showDetails && component.description && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#666', 
                  marginTop: '4px' 
                }}>
                  {component.description}
                </p>
              )}
              
              {expandedItems[component.label] && component.subComponents && (
                <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                  {component.subComponents.map(sub => (
                    <div 
                      key={sub.label} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '4px' 
                      }}
                    >
                      <div 
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(sub.status),
                          marginRight: '8px'
                        }} 
                      />
                      <span style={{ fontSize: '0.875rem' }}>{sub.label}</span>
                      {showDetails && sub.description && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#666',
                          marginLeft: '8px'
                        }}>
                          - {sub.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoPanel;