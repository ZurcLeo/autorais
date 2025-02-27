// components/SystemDiagram.tsx
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
  Chip
} from '@mui/material';
import mermaid from 'mermaid';

// TypeScript interfaces
export interface SystemDiagramProps {
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
   * Permite interação e seleção de nós no diagrama
   * @default false
   */
  interactive?: boolean;

  /**
   * Define o layout do diagrama
   * @default 'TD'
   */
  layout?: 'TD' | 'LR' | 'RL' | 'BT';
  
  /**
   * Define o tipo do diagrama
   * @default 'flowchart'
   */
  diagramType?: 'flowchart' | 'stateDiagram' | 'classDiagram' | 'sequenceDiagram';
  
  /**
   * Definição do diagrama em sintaxe Mermaid
   * @required
   */
  definition: string;
  
  /**
   * Função chamada quando um nó é selecionado
   */
  onNodeSelect?: (nodeId: string) => void;
  
  /**
   * Dados de nós para exibir detalhes quando selecionados
   */
  nodesData?: Record<string, any>;
  
  /**
   * Título do diagrama
   */
  title?: string;
  
  /**
   * Descrição do diagrama
   */
  description?: string;
}

/**
 * Componente genérico para visualização de diagramas usando Mermaid.js
 */
export const SystemDiagram: React.FC<SystemDiagramProps> = ({ 
  mode = 'dark',
  detailLevel = 'standard',
  interactive = false,
  layout = 'TD',
  diagramType = 'flowchart',
  definition,
  onNodeSelect,
  nodesData = {},
  title,
  description
}) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mermaidInitialized, setMermaidInitialized] = useState<boolean>(false);
  const [currentDetailLevel, setCurrentDetailLevel] = useState<'simple' | 'standard' | 'detailed'>(detailLevel);
  
  // Cores do tema baseadas no modo atual
  const themeColors = useMemo(() => {
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

  // Inicializa o Mermaid.js
  useEffect(() => {
    const initializeMermaid = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
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

  // Processa a definição do diagrama com base no nível de detalhe
  const processedDefinition = useMemo(() => {
    // Poderia ter lógica para processar a definição com base no nível de detalhe
    // Por simplicidade, retornamos a definição como está
    const prefix = diagramType === 'flowchart' 
      ? `${diagramType} ${layout}\n` 
      : `${diagramType}\n`;
      
    return prefix + definition;
  }, [definition, diagramType, layout, currentDetailLevel]);

  // Renderiza o diagrama
  const renderDiagram = useCallback(async () => {
    if (!diagramRef.current || !mermaidInitialized) return;

    try {
      // Limpa o diagrama anterior
      diagramRef.current.innerHTML = '';
      
      // Renderiza o diagrama
      const { svg } = await mermaid.render(
        'system-diagram', 
        processedDefinition
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
            
            // Eventos do mouse
            node.addEventListener('click', () => {
              const nodeId = node.id.split('-')[1];
              setSelectedNode(nodeId);
              if (onNodeSelect) onNodeSelect(nodeId);
            });
            
            // Acessibilidade - suporte para teclado
            node.addEventListener('keydown', (e: any) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const nodeId = node.id.split('-')[1];
                setSelectedNode(nodeId);
                if (onNodeSelect) onNodeSelect(nodeId);
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
  }, [processedDefinition, interactive, mode, mermaidInitialized, onNodeSelect]);

  // Renderiza o diagrama quando a definição muda
  useEffect(() => {
    renderDiagram();
  }, [renderDiagram]);

  // Handler para mudança do nível de detalhes
  const handleDetailLevelChange = (
    event: React.MouseEvent<HTMLElement>,
    newLevel: 'simple' | 'standard' | 'detailed' | null,
  ) => {
    if (newLevel !== null) {
      setCurrentDetailLevel(newLevel);
      setSelectedNode(null);
    }
  };

  // Exibe informações detalhadas sobre o nó selecionado
  const renderNodeDetails = () => {
    if (!selectedNode || !nodesData[selectedNode]) return null;
    
    const nodeData = nodesData[selectedNode];
    
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mt: 2, 
          bgcolor: mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          color: mode === 'dark' ? 'white' : 'black',
          border: `1px solid ${nodeData.color || '#666'}` 
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">{nodeData.label || selectedNode}</Typography>
          {nodeData.status && (
            <Chip 
              label={nodeData.status}
              size="small"
              sx={{ 
                bgcolor: nodeData.color || '#666', 
                color: '#fff',
                fontWeight: 'bold',
                '& .MuiChip-label': { px: 1 }
              }}
            />
          )}
        </Box>
        
        {nodeData.description && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {nodeData.description}
          </Typography>
        )}
        
        {nodeData.details && (
          <Box sx={{ mt: 2 }}>
            {Object.entries(nodeData.details).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', mt: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                  {key}:
                </Typography>
                <Typography variant="caption">
                  {String(value)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    );
  };

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
      {/* Controles de nível de detalhe */}
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      
      {description && (
        <Typography variant="body2" gutterBottom>
          {description}
        </Typography>
      )}
      
      <Paper elevation={3} sx={{ 
        padding: 2, 
        backgroundColor: themeColors.controlBackground,
        border: `1px solid ${themeColors.border}`
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <ToggleButtonGroup
            value={currentDetailLevel}
            exclusive
            onChange={handleDetailLevelChange}
            aria-label="Nível de Detalhe"
            size="small"
          >
            <ToggleButton value="simple" aria-label="Simples">Simples</ToggleButton>
            <ToggleButton value="standard" aria-label="Padrão">Padrão</ToggleButton>
            <ToggleButton value="detailed" aria-label="Detalhado">Detalhado</ToggleButton>
          </ToggleButtonGroup>
          
          {interactive && (
            <FormControlLabel
              control={<Switch checked={interactive} disabled />}
              label="Interativo"
            />
          )}
        </Box>
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
        <Box sx={{ position: 'relative' }}>
          {/* Área principal do diagrama */}
          <div 
            ref={diagramRef} 
            className="system-diagram"
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
                Clique em um componente para ver os detalhes
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Detalhes do nó selecionado */}
        {interactive && selectedNode && renderNodeDetails()}
      </Paper>
    </Box>
  );
};

export default SystemDiagram;