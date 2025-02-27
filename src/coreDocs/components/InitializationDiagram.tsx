// components/InitializationDiagram.tsx

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Divider,
  Alert,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import mermaid from 'mermaid';
import { useServiceInitialization } from '../../hooks/initialization/useServiceInitialization';

// TypeScript interfaces
export interface InitializationDiagramProps {
  /**
   * Define o modo do diagrama
   * @default 'dark'
   */
  mode?: 'dark' | 'light';
  
  /**
   * Define o nível de detalhe do diagrama
   * @default 'standard'
   */
  detailLevel?: 'simple' | 'standard' | 'detailed';
  
  /**
   * Mostra métricas em tempo real se true
   * @default true
   */
  showMetrics?: boolean;
  
  /**
   * Permite interação e seleção de nós no diagrama
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Estado personalizado para uso em desenvolvimento/testes
   */
  customState?: Record<string, any>;
}

/**
 * Tema de cores para o diagrama baseado no modo atual
 */
interface ThemeColors {
  background: string;
  text: string;
  border: string;
  nodeStroke: string;
  controlBackground: string;
  cardBackground: string;
  divider: string;
}

/**
 * Interface para dados de métricas do serviço
 */
interface ServiceMetrics {
  initTime: number;  // Tempo de inicialização em ms
  retryCount: number; // Número de tentativas de reinicialização
  memoryUsage?: number; // Uso de memória em KB (opcional)
  dependencyCount?: number; // Número de dependências (opcional)
  startTimestamp?: number; // Timestamp de início
  endTimestamp?: number; // Timestamp de conclusão
  logEntries?: {level: string, message: string, timestamp: number}[]; // Entradas de log
}

/**
 * Componente avançado de visualização do fluxo de inicialização da aplicação
 * Utiliza Mermaid.js para renderizar o fluxo de forma visual com dados em tempo real
 */
export const InitializationDiagram: React.FC<InitializationDiagramProps> = ({ 
  mode = 'dark',
  detailLevel = 'standard',
  showMetrics = true,
  interactive = false,
  customState
}) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'phases' | 'dependencies'>('hierarchy');
  const [showTiming, setShowTiming] = useState<boolean>(showMetrics);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mermaidInitialized, setMermaidInitialized] = useState<boolean>(false);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState<boolean>(false);
  const [currentDetailLevel, setCurrentDetailLevel] = useState<'simple' | 'standard' | 'detailed'>(detailLevel);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Hook para acessar o estado de inicialização
  const { 
    services, 
    isInitializationComplete,
    isServiceReady,
    getServiceError
  } = useServiceInitialization();

  // Cores do tema baseadas no modo atual
  const themeColors = useMemo((): ThemeColors => {
    return {
      background: mode === 'dark' ? '#1a1a1a' : '#ffffff',
      text: mode === 'dark' ? '#ffffff' : '#000000',
      border: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      nodeStroke: '#333',
      controlBackground: mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
      cardBackground: mode === 'dark' ? '#2d2d2d' : '#f8f8f8',
      divider: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
    };
  }, [mode]);

  // Mock para as métricas de serviço (simulação)
  const getServiceMetrics = useCallback((serviceName: string): ServiceMetrics => {
    // Na implementação real, isso viria do estado ou de uma API
    const now = Date.now();
    const initTime = Math.floor(Math.random() * 1000) + 500; // Entre 500 e 1500ms
    
    return {
      initTime,
      retryCount: Math.floor(Math.random() * 3), // Entre 0 e 2 retentativas
      memoryUsage: Math.floor(Math.random() * 5000) + 1000, // Entre 1000 e 6000 KB
      dependencyCount: Math.floor(Math.random() * 5) + 1, // Entre 1 e 5 dependências
      startTimestamp: now - initTime - 2000,
      endTimestamp: services[serviceName]?.status === 'ready' ? now - 2000 : undefined,
      logEntries: [
        {
          level: 'info',
          message: `Inicializando serviço ${serviceName}`,
          timestamp: now - initTime - 2000
        },
        {
          level: 'debug',
          message: `Verificando dependências de ${serviceName}`,
          timestamp: now - initTime - 1500
        },
        {
          level: services[serviceName]?.status === 'failed' ? 'error' : 'info',
          message: services[serviceName]?.status === 'failed' 
            ? `Falha na inicialização de ${serviceName}`
            : `Serviço ${serviceName} inicializado com sucesso`,
          timestamp: now - (services[serviceName]?.status === 'ready' ? 2000 : 1000)
        }
      ]
    };
  }, [services]);

  // Define as cores de status para os nós do diagrama
  const getStatusColor = useCallback((serviceName: string) => {
    if (!services[serviceName]) return mode === 'dark' ? '#555' : '#ddd';
    
    const status = services[serviceName]?.status;
    switch (status) {
      case 'ready':
        return '#4caf50';  // Verde para serviços prontos
      case 'initializing':
        return '#2196f3';  // Azul para serviços em inicialização
      case 'failed':
        return '#f44336';  // Vermelho para falhas
      case 'retrying':
        return '#ff9800';  // Laranja para retrying
      case 'blocked':
        return '#9c27b0';  // Roxo para bloqueados
      case 'timeout':
        return '#795548';  // Marrom para timeout
      default:
        return mode === 'dark' ? '#555' : '#ddd';  // Cinza para pendentes
    }
  }, [services, mode]);

  // Inicializa o Mermaid.js
  useEffect(() => {
    const initializeMermaid = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false, // Evitar conflito com nossa lógica de renderização manual
          theme: mode === 'dark' ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'monospace',
          themeCSS: `.node rect { fill: ${mode === 'dark' ? '#fff' : '#000'} }`,
          flowchart: {
            htmlLabels: true,
            curve: 'basis'
          }
        });
        setMermaidInitialized(true);
      } catch (error) {
        console.error('Mermaid initialization error:', error);
      }
    };

    initializeMermaid();
  }, [mode]);

  // Filtra serviços com base na pesquisa e no filtro de status
  const filteredServices = useMemo(() => {
    return Object.entries(services)
      .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(([_, data]) => !statusFilter || data.status === statusFilter)
      .reduce((acc, [name, data]) => ({ ...acc, [name]: data }), {});
  }, [services, searchTerm, statusFilter]);

  // ========= Refatoração das funções geradoras de diagrama com suporte a detailLevel =========

  /**
   * Gera a definição do diagrama para o modo de visualização de hierarquia
   * com base no nível de detalhe selecionado
   */
  const generateHierarchyDiagram = useCallback(() => {
    // Diagrama simplificado para detailLevel = 'simple'
    if (currentDetailLevel === 'simple') {
      return `
        graph TD
          A[Core Providers] --> D[Initialization]
          D --> J[Auth & UI]
          
          %% Estilização dos nós
          style A fill:${getStatusColor('coreLogger')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style D fill:${getStatusColor('serviceInitialization')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style J fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
          
          %% Marcação para nó selecionado
          ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
      `;
    }
    
    // Diagrama detalhado para detailLevel = 'detailed'
    if (currentDetailLevel === 'detailed') {
      return `
        graph TD
          A[ErrorBoundaryProvider] --> B[CoreLoggerProvider]
          B --> C[BootstrapProvider]
          C --> D[ServiceInitializationProvider]
          D --> E[ThemeContextProvider]
          E --> F[BrowserRouter]
          F --> G[ErrorBoundary]
          G --> H[InitializationManager]
          H --> I[LoadingScreen]
          I --> J[AuthProvider]
          J --> K[UserContextProvider]
          K --> L[PermissionsProvider]
          L --> M[NotificationsProvider]
          M --> N[AnalyticsProvider]
          N --> O[MainAppLayout]
          
          %% Conexões de dependência adicional
          D -.-> H
          J -.-> L
          J -.-> M
          
          %% Estilização dos nós
          style A fill:${getStatusColor('errorBoundary')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style B fill:${getStatusColor('coreLogger')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style C fill:${getStatusColor('bootstrap')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style D fill:${getStatusColor('serviceInitialization')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style E fill:${getStatusColor('theme')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style F fill:${getStatusColor('router')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style G fill:${getStatusColor('errorBoundary')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style H fill:${getStatusColor('initManager')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style I fill:${getStatusColor('loadingScreen')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style J fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style K fill:${getStatusColor('user')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style L fill:${getStatusColor('permissions')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style M fill:${getStatusColor('notifications')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style N fill:${getStatusColor('analytics')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style O fill:${getStatusColor('mainLayout')},stroke:${themeColors.nodeStroke},stroke-width:2px
          
          %% Marcação para nó selecionado
          ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
          
          %% Tempos de inicialização
          ${showTiming ? 'classDef withTime width:200px;' : ''}
          ${showTiming ? Object.keys(filteredServices).map(svc => `class ${svc.charAt(0).toUpperCase()} withTime`).join('\n') : ''}
      `;
    }
    
    // Diagrama padrão (detailLevel = 'standard')
    return `
      graph TD
        A[ErrorBoundaryProvider] --> B[CoreLoggerProvider]
        B --> C[BootstrapProvider]
        C --> D[ServiceInitializationProvider]
        D --> E[ThemeContextProvider]
        E --> F[BrowserRouter]
        F --> G[ErrorBoundary]
        G --> H[InitializationManager]
        H --> I[LoadingScreen]
        I --> J[AuthProvider]
        
        %% Estilização dos nós
        style A fill:${getStatusColor('errorBoundary')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style B fill:${getStatusColor('coreLogger')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style C fill:${getStatusColor('bootstrap')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style D fill:${getStatusColor('serviceInitialization')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style J fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
        
        %% Marcação para nó selecionado
        ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
        
        %% Tempos de inicialização
        ${showTiming ? 'classDef withTime width:180px;' : ''}
        ${showTiming && filteredServices['auth'] ? `class J withTime` : ''}
    `;
  }, [getStatusColor, filteredServices, selectedNode, showTiming, themeColors.nodeStroke, currentDetailLevel]);

  /**
   * Gera a definição do diagrama para o modo de visualização de fases
   * com base no nível de detalhe selecionado
   */
  const generatePhasesDiagram = useCallback(() => {
    // Diagrama simplificado para detailLevel = 'simple'
    if (currentDetailLevel === 'simple') {
      return `
        graph TD
          subgraph CORE
            core[Core Services]
          end
          
          subgraph ESSENTIAL
            essential[Essential Services]
          end
          
          subgraph UI
            ui[UI Services]
          end
          
          CORE --> ESSENTIAL
          ESSENTIAL --> UI
          
          %% Estilização dos nós
          style core fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style essential fill:${getStatusColor('user')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style ui fill:${getStatusColor('notifications')},stroke:${themeColors.nodeStroke},stroke-width:2px
          
          %% Marcação para nó selecionado
          ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
      `;
    }
    
    // Diagrama detalhado para detailLevel = 'detailed'
    if (currentDetailLevel === 'detailed') {
      return `
        graph TD
          subgraph CORE ["CORE (Fase 1)"]
            auth[Auth]
            logging[Logging]
            config[Config]
          end
          
          subgraph ESSENTIAL ["ESSENTIAL (Fase 2)"]
            user[User]
            permissions[Permissions]
            preferences[Preferences]
          end
          
          subgraph COMMUNICATION ["COMMUNICATION (Fase 3)"]
            notifications[Notifications]
            messages[Messages]
            emails[Emails]
          end
          
          subgraph UI ["UI (Fase 4)"]
            dashboard[Dashboard]
            widgets[Widgets]
            navigation[Navigation]
          end
          
          CORE --> ESSENTIAL
          ESSENTIAL --> COMMUNICATION
          COMMUNICATION --> UI
          
          %% Conexões específicas
          auth --> user
          user --> permissions
          permissions --> dashboard
          notifications --> widgets
          
          %% Estilização dos nós
          style auth fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style logging fill:${getStatusColor('logging')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style config fill:${getStatusColor('config')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style user fill:${getStatusColor('user')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style permissions fill:${getStatusColor('permissions')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style preferences fill:${getStatusColor('preferences')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style notifications fill:${getStatusColor('notifications')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style messages fill:${getStatusColor('messages')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style emails fill:${getStatusColor('emails')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style dashboard fill:${getStatusColor('dashboard')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style widgets fill:${getStatusColor('widgets')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style navigation fill:${getStatusColor('navigation')},stroke:${themeColors.nodeStroke},stroke-width:2px
          
          %% Marcação para nó selecionado
          ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
          
          %% Tempos de inicialização
          ${showTiming ? 'classDef withTime width:180px;' : ''}
          ${showTiming ? Object.keys(filteredServices).map(svc => `class ${svc} withTime`).join('\n') : ''}
      `;
    }
    
    // Diagrama padrão (detailLevel = 'standard')
    return `
      graph TD
        subgraph CORE
          auth[Auth]
        end
        
        subgraph ESSENTIAL
          user[User]
        end
        
        subgraph COMMUNICATION
          notifications[Notifications]
          messages[Messages]
        end
        
        CORE --> ESSENTIAL
        ESSENTIAL --> COMMUNICATION
        
        %% Estilização dos nós
        style auth fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style user fill:${getStatusColor('user')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style notifications fill:${getStatusColor('notifications')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style messages fill:${getStatusColor('messages')},stroke:${themeColors.nodeStroke},stroke-width:2px
        
        %% Marcação para nó selecionado
        ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
    `;
  }, [getStatusColor, selectedNode, themeColors.nodeStroke, currentDetailLevel, showTiming, filteredServices]);

  /**
   * Gera a definição do diagrama para o modo de visualização de dependências
   * com base no nível de detalhe selecionado
   */
  const generateDependenciesDiagram = useCallback(() => {
    // Diagrama simplificado para detailLevel = 'simple'
    if (currentDetailLevel === 'simple') {
      return `
        graph LR
          auth --> user
          user --> ui
          
          %% Estilização dos nós
          style auth fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style user fill:${getStatusColor('user')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style ui fill:${getStatusColor('dashboard')},stroke:${themeColors.nodeStroke},stroke-width:2px
          
          %% Marcação para nó selecionado
          ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
      `;
    }
    
    // Diagrama detalhado para detailLevel = 'detailed'
    if (currentDetailLevel === 'detailed') {
      return `
        graph LR
          %% Serviços Core
          errorBoundary --> coreLogger
          coreLogger --> bootstrap
          bootstrap --> serviceInit
          serviceInit --> theme
          
          %% Serviços de Autenticação
          bootstrap --> auth
          auth --> user
          auth --> permissions
          
          %% Serviços de Comunicação
          user --> notifications
          user --> messages
          permissions --> notifications
          
          %% Serviços de UI
          serviceInit --> router
          router --> dashboard
          user --> dashboard
          notifications --> dashboard
          messages --> dashboard
          theme --> dashboard
          
          %% Estilização dos nós
          style errorBoundary fill:${getStatusColor('errorBoundary')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style coreLogger fill:${getStatusColor('coreLogger')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style bootstrap fill:${getStatusColor('bootstrap')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style serviceInit fill:${getStatusColor('serviceInitialization')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style theme fill:${getStatusColor('theme')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style auth fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style user fill:${getStatusColor('user')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style permissions fill:${getStatusColor('permissions')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style notifications fill:${getStatusColor('notifications')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style messages fill:${getStatusColor('messages')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style router fill:${getStatusColor('router')},stroke:${themeColors.nodeStroke},stroke-width:2px
          style dashboard fill:${getStatusColor('dashboard')},stroke:${themeColors.nodeStroke},stroke-width:2px
          
          %% Marcação para nó selecionado
          ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
          
          %% Tempos de inicialização
          ${showTiming ? 'classDef withTime width:140px;' : ''}
          ${showTiming ? Object.keys(filteredServices).map(svc => `class ${svc} withTime`).join('\n') : ''}
      `;
    }
    
    // Diagrama padrão (detailLevel = 'standard')
    return `
      graph LR
        auth --> user
        user --> notifications
        user --> interests
        notifications --> dashboard
        
        %% Estilização dos nós
        style auth fill:${getStatusColor('auth')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style user fill:${getStatusColor('user')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style notifications fill:${getStatusColor('notifications')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style interests fill:${getStatusColor('interests')},stroke:${themeColors.nodeStroke},stroke-width:2px
        style dashboard fill:${getStatusColor('dashboard')},stroke:${themeColors.nodeStroke},stroke-width:2px
        
        %% Marcação para nó selecionado
        ${selectedNode ? `style ${selectedNode} stroke:#ff0000,stroke-width:4px` : ''}
    `;
  }, [getStatusColor, selectedNode, themeColors.nodeStroke, currentDetailLevel, showTiming, filteredServices]);

  // Centraliza a lógica de escolha do diagrama com base no viewMode
  const generateDiagramDefinition = useMemo(() => {
    if (viewMode === 'hierarchy') return generateHierarchyDiagram();
    if (viewMode === 'phases') return generatePhasesDiagram(); 
    if (viewMode === 'dependencies') return generateDependenciesDiagram();
    return '';
  }, [viewMode, generateHierarchyDiagram, generatePhasesDiagram, generateDependenciesDiagram]);

  /**
   * Renderiza o diagrama atual usando Mermaid.js
   */
  const renderDiagram = useCallback(async () => {
    if (!diagramRef.current || !mermaidInitialized) return;

    try {
      // Limpa o diagrama anterior
      diagramRef.current.innerHTML = '';
      
      // Renderiza o diagrama
      const { svg } = await mermaid.render(
        'initialization-diagram', 
        generateDiagramDefinition
      );
      
      diagramRef.current.innerHTML = svg;
      
      // Adiciona interatividade se necessário
      if (interactive && diagramRef.current) {
        const svgElement = diagramRef.current.querySelector('svg');
        if (svgElement) {
          const nodes = svgElement.querySelectorAll('.node');
          nodes.forEach(node => {
            node.setAttribute('role', 'button');
            node.setAttribute('tabindex', '0');
            node.setAttribute('aria-label', `Serviço ${node.id.split('-')[1]}`);
            
            node.style.cursor = 'pointer';
            node.style.transition = 'all 0.3s ease';
            
            // Eventos do mouse
            node.addEventListener('click', () => {
              const nodeId = node.id.split('-')[1];
              setSelectedNode(nodeId);
            });
            
            // Acessibilidade - suporte para teclado
            node.addEventListener('keydown', (e: any) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const nodeId = node.id.split('-')[1];
                setSelectedNode(nodeId);
                e.preventDefault();
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Mermaid render error:', error);
      if (diagramRef.current) {
        diagramRef.current.innerHTML = `
          <div style="color: ${mode === 'dark' ? '#ff6b6b' : '#d32f2f'}; padding: 1rem;">
            <strong>Erro ao renderizar diagrama:</strong> ${error instanceof Error ? error.message : 'Erro desconhecido'}
          </div>
        `;
      }
    }
  }, [generateDiagramDefinition, interactive, mode, mermaidInitialized]);

  // Renderiza o diagrama quando a definição muda
  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  // ========= Otimização das atualizações em tempo real =========

  useEffect(() => {
    if (!isInitializationComplete() && diagramRef.current && mermaidInitialized) {
      // Determina um intervalo dinâmico baseado no progresso da inicialização
      const calculateUpdateInterval = () => {
        const readyServicesCount = Object.values(services).filter(s => s.status === 'ready').length;
        const totalServices = Object.keys(services).length;
        const progress = totalServices > 0 ? readyServicesCount / totalServices : 0;
        
        // Ajusta frequência: mais frequente no início (500ms), menos frequente conforme progride (até 3000ms)
        return Math.max(500, Math.min(3000, Math.floor(500 + progress * 2500)));
      };

      const updateInterval = calculateUpdateInterval();
      
      // Configura o intervalo para atualização dinâmica
      const interval = setInterval(() => {
        renderDiagram();
      }, updateInterval);
      
      return () => clearInterval(interval);
    }
  }, [isInitializationComplete, renderDiagram, services, mermaidInitialized]);

  // Handler para mudança de modo de visualização
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'hierarchy' | 'phases' | 'dependencies' | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setSelectedNode(null); // Reseta o nó selecionado ao mudar de modo
    }
  };

  // Handler para mudança do nível de detalhes
  const handleDetailLevelChange = (
    event: React.MouseEvent<HTMLElement>,
    newLevel: 'simple' | 'standard' | 'detailed' | null,
  ) => {
    if (newLevel !== null) {
      setCurrentDetailLevel(newLevel);
      // Reset node selection when changing detail level
      setSelectedNode(null);
    }
  };

  // Handler para filtro de status
  const handleStatusFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newFilter: string | null,
  ) => {
    setStatusFilter(newFilter);
  };

  // Handler para reset dos filtros
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
  };

  /**
   * Formata um timestamp para exibição amigável
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  /**
   * Renderiza uma barra de progresso com o valor percentual
   */
  const renderProgressBar = (value: number, max: number, color = 'primary') => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            color={color as 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(percentage)}%`}</Typography>
        </Box>
      </Box>
    );
  };

  /**
   * Renderiza um indicador de status para o serviço
   */
  const renderStatusIndicator = (serviceName: string) => {
    if (!services[serviceName]) return null;
    
    const status = services[serviceName].status;
    const statusColor = getStatusColor(serviceName);
    
    return (
      <Chip 
        label={status}
        size="small"
        sx={{ 
          bgcolor: statusColor, 
          color: status === 'ready' || status === 'initializing' ? '#fff' : '#000',
          fontWeight: 'bold',
          '& .MuiChip-label': { px: 1 }
        }}
      />
    );
  };

  // Exibe informações detalhadas sobre o nó selecionado
  const renderNodeDetails = () => {
    if (!selectedNode) return null;
    
    const serviceData = services[selectedNode] || { 
      status: 'unknown', 
      error: null
    };
    
    // Obter métricas para o serviço selecionado
    const metrics = getServiceMetrics(selectedNode);
    
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mt: 2, 
          bgcolor: mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          color: mode === 'dark' ? 'white' : 'black',
          border: `1px solid ${getStatusColor(selectedNode)}` 
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">{selectedNode}</Typography>
          {renderStatusIndicator(selectedNode)}
        </Box>
        
        <Divider sx={{ my: 1.5, borderColor: themeColors.divider }} />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Métricas básicas - sempre visíveis */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Métricas Básicas</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              <Typography variant="body2">
                Tempo de inicialização: {metrics.initTime}ms
              </Typography>
              {metrics.retryCount > 0 && (
                <Typography variant="body2">
                  Tentativas de retry: {metrics.retryCount}
                </Typography>
              )}
              {metrics.dependencyCount !== undefined && (
                <Typography variant="body2">
                  Dependências: {metrics.dependencyCount}
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Erros - se existirem */}
          {getServiceError(selectedNode) && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2">
                {getServiceError(selectedNode)}
              </Typography>
            </Alert>
          )}
          
          {/* Métricas detalhadas - visíveis apenas se showDetailedMetrics for true */}
          {showDetailedMetrics && (
            <>
              <Divider sx={{ my: 1, borderColor: themeColors.divider }} />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>Timestamps</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                  <Typography variant="body2">
                    Início: {metrics.startTimestamp ? formatTimestamp(metrics.startTimestamp) : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Finalização: {metrics.endTimestamp ? formatTimestamp(metrics.endTimestamp) : 'Em andamento...'}
                  </Typography>
                </Box>
              </Box>
              
              {metrics.memoryUsage !== undefined && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Uso de Memória</Typography>
                  {renderProgressBar(metrics.memoryUsage, 10000, 'info')}
                  <Typography variant="caption" sx={{ pl: 1 }}>
                    {metrics.memoryUsage.toLocaleString()} KB utilizados
                  </Typography>
                </Box>
              )}
              
              {metrics.logEntries && metrics.logEntries.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Log de Inicialização</Typography>
                  <Card variant="outlined" sx={{ maxHeight: 150, overflow: 'auto', bgcolor: themeColors.cardBackground }}>
                    <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                      {metrics.logEntries.map((entry, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            display: 'flex', 
                            gap: 1, 
                            alignItems: 'flex-start',
                            mb: 0.5,
                            opacity: entry.level === 'debug' ? 0.7 : 1
                          }}
                        >
                          <Chip 
                            label={entry.level}
                            size="small"
                            color={
                              entry.level === 'error' ? 'error' : 
                              entry.level === 'warn' ? 'warning' : 
                              entry.level === 'info' ? 'info' : 
                              'default'
                            }
                            sx={{ height: 20, '& .MuiChip-label': { px: 0.5, py: 0 } }}
                          />
                          <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                            {formatTimestamp(entry.timestamp)}:
                          </Typography>
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {entry.message}
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    );
  };

  // Componente de legenda memoizado para evitar re-renders desnecessários
  const DiagramLegend = React.memo(() => (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: 2,
        bgcolor: themeColors.controlBackground
      }}
    >
      <Typography variant="subtitle2" sx={{ mr: 1, width: '100%' }}>Legenda:</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: '4px' }} />
          <Typography variant="caption">Pronto</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#2196f3', borderRadius: '4px' }} />
          <Typography variant="caption">Inicializando</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: '4px' }} />
          <Typography variant="caption">Falha</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: '4px' }} />
          <Typography variant="caption">Retrying</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#9c27b0', borderRadius: '4px' }} />
          <Typography variant="caption">Bloqueado</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#795548', borderRadius: '4px' }} />
          <Typography variant="caption">Timeout</Typography>
        </Box>
      </Box>
      
      <Box sx={{ width: '100%', mt: 1 }}>
        <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7, fontSize: '0.8rem' }}>
          {currentDetailLevel === 'simple' ? 'Visualização simplificada - mostrando apenas módulos principais.' : 
           currentDetailLevel === 'detailed' ? 'Visualização detalhada - mostrando todos os serviços e dependências.' : 
           'Visualização padrão - mostrando serviços principais.'}
        </Typography>
      </Box>
    </Paper>
  ));

  // Se o Mermaid não foi inicializado, mostrar indicador de carregamento
  if (!mermaidInitialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Carregando visualizador de diagramas...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Barra de Ferramentas de Controle */}
      <Paper elevation={3} sx={{ 
        padding: 2, 
        backgroundColor: themeColors.controlBackground,
        border: `1px solid ${themeColors.border}`
      }}>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" flexWrap="wrap">
          <Box>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="Modo de Visualização"
              size="small"
            >
              <ToggleButton value="hierarchy" aria-label="Hierarquia">Hierarquia</ToggleButton>
              <ToggleButton value="phases" aria-label="Fases">Fases</ToggleButton>
              <ToggleButton value="dependencies" aria-label="Dependências">Dependências</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
              value={currentDetailLevel}
              exclusive
              onChange={handleDetailLevelChange}
              aria-label="Nível de Detalhe"
              sx={{ marginLeft: 2 }}
              size="small"
            >
              <ToggleButton value="simple" aria-label="Simples">Simples</ToggleButton>
              <ToggleButton value="standard" aria-label="Padrão">Padrão</ToggleButton>
              <ToggleButton value="detailed" aria-label="Detalhado">Detalhado</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box display="flex" alignItems="center">
            <FormControlLabel
              control={<Switch checked={showTiming} onChange={(e) => setShowTiming(e.target.checked)} />}
              label="Mostrar Tempos"
            />
            <FormControlLabel
              control={<Switch checked={showDetailedMetrics} onChange={(e) => setShowDetailedMetrics(e.target.checked)} />}
              label="Métricas Detalhadas"
              sx={{ marginLeft: 1 }}
              disabled={!showTiming}
            />
          </Box>
        </Stack>

        <Divider sx={{ marginY: 2, borderColor: themeColors.divider }} />

        {/* Filtros e Ações */}
        <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between" flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Pesquisar serviço..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 300, marginRight: 2 }}
          />

          <ToggleButtonGroup
            exclusive
            value={statusFilter}
            onChange={handleStatusFilterChange}
            aria-label="Filtro de Status"
            size="small"
          >
            <Tooltip title="Mostrar todos os status">
              <ToggleButton value="started" aria-label="Todos">
                Todos
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Mostrar somente serviços com status 'Pronto'">
              <ToggleButton value="ready" aria-label="Pronto">
                <Chip label="Pronto" size="small" color="success" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Mostrar somente serviços com status 'Inicializando'">
              <ToggleButton value="initializing" aria-label="Inicializando">
                <Chip label="Init" size="small" color="primary" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title="Mostrar somente serviços com status 'Falha'">
              <ToggleButton value="failed" aria-label="Falha">
                <Chip label="Falha" size="small" color="error" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>

          <Button
            onClick={handleResetFilters}
            variant="outlined"
            size="small"
          >
            Resetar Filtros
          </Button>
        </Stack>
      </Paper>

      {/* Diagrama principal */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          bgcolor: themeColors.background,
          color: themeColors.text,
          border: '1px solid',
          borderColor: themeColors.border
        }}
      >
        {/* Informações resumidas sobre o progresso de inicialização */}
        {!isInitializationComplete() && (
          <Box sx={{ mb: 2, p: 1, borderRadius: 1, bgcolor: mode === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">
                Progresso de Inicialização
              </Typography>
              <Typography variant="body2">
                {Object.values(services).filter(s => s.status === 'ready').length} / {Object.keys(services).length} serviços prontos
              </Typography>
            </Box>
            {renderProgressBar(
              Object.values(services).filter(s => s.status === 'ready').length,
              Object.keys(services).length,
              'primary'
            )}
          </Box>
        )}
        
        <Box sx={{ position: 'relative' }}>
          {/* Área principal do diagrama */}
          <div 
            ref={diagramRef} 
            className="initialization-diagram"
            style={{
              padding: '1rem',
              borderRadius: '8px',
              overflow: 'auto',
              minHeight: '300px',
              cursor: interactive ? 'pointer' : 'default'
            }}
          />
          
          {/* Dica de interatividade - exibida apenas se interactive for true */}
          {interactive && !selectedNode && (
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 16, 
                p: 1, 
                borderRadius: 1,
                bgcolor: mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
                boxShadow: 2
              }}
            >
              <Typography variant="caption">
                Clique em um serviço para ver os detalhes
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Detalhes do nó selecionado */}
        {interactive && selectedNode && renderNodeDetails()}
      </Paper>
      
      {/* Legenda */}
      <DiagramLegend />

      {/* Mensagens de Erro Global */}
      {!isInitializationComplete() && Object.keys(filteredServices).map(serviceName => {
        const error = getServiceError(serviceName);
        if (error) {
          return (
            <Alert
              key={serviceName}
              severity="error"
              sx={{ marginTop: 1 }}
            >
              Falha na inicialização do serviço <strong>{serviceName}</strong>: {error instanceof Error ? error.message : String(error)}
            </Alert>
          );
        }
        return null;
      })}
      {isInitializationComplete() && (
        <Alert severity="success" sx={{ marginTop: 2 }}>
          <strong>Inicialização Completa!</strong> Todos os serviços foram inicializados com sucesso.
        </Alert>
      )}
    </Box>
  );
};