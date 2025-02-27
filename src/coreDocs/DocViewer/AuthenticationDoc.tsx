import React from 'react';
import { Typography, Box, Paper, Alert, Divider } from '@mui/material';
import { SystemDiagram } from '../components/SystemDiagram.tsx'; // Certifique-se de que o caminho para SystemDiagram está correto

// Dados dos nós para o diagrama de autenticação
const authNodesData = {
    'ErrorBoundary': {
        label: 'ErrorBoundaryProvider',
        status: 'stable',
        color: '#4caf50',
        description: 'Garante a captura global de erros inesperados',
        details: {
            status: 'Estável',
            responsável: 'Equipe Core',
            ultimaAtualização: '2025-01-15'
        }
    },
    'CoreLogger': {
        label: 'CoreLoggerProvider',
        status: 'stable',
        color: '#4caf50',
        description: 'Inicializa o sistema de logging centralizado',
        details: {
            status: 'Estável',
            responsável: 'Equipe Core',
            ultimaAtualização: '2025-01-20'
        }
    },
    'Bootstrap': {
        label: 'BootstrapProvider',
        status: 'stable',
        color: '#4caf50',
        description: 'Arranque dos sistemas e serviços essenciais',
        details: {
            status: 'Estável',
            responsável: 'Equipe Core',
            ultimaAtualização: '2025-01-25'
        }
    },
    'Auth': {
        label: 'AuthProvider',
        status: 'attention',
        color: '#ff9800',
        description: '[PROBLEMA CRÍTICO] Timing incorreto na inicialização!',
        details: {
            status: 'Atenção',
            responsável: 'Equipe de Segurança',
            ultimaAtualização: '2025-02-10',
            problema: 'Race condition na inicialização'
        }
    },
    'TokenManager': {
        label: 'TokenManager',
        status: 'attention',
        color: '#ff9800',
        description: 'Gerenciamento de tokens de autenticação (JWT)',
        details: {
            status: 'Atenção',
            responsável: 'Equipe de Segurança',
            ultimaAtualização: '2025-02-05',
            problema: 'Vazamento de memória na gestão de tokens'
        }
    },
    'AuthService': {
        label: 'AuthService',
        status: 'attention',
        color: '#ff9800',
        description: 'Serviço dedicado à autenticação de usuários',
        details: {
            status: 'Atenção',
            responsável: 'Equipe de Segurança',
            ultimaAtualização: '2025-02-08',
            problema: 'Dependências circulares'
        }
    }
};

// Definição do diagrama de autenticação em sintaxe Mermaid
const authDiagramDefinition = `
    ErrorBoundary --> CoreLogger
    CoreLogger --> Bootstrap
    Bootstrap --> Auth
    Auth --> TokenManager
    Auth --> AuthService

    %% Estilização dos nós
    style ErrorBoundary fill:#4caf50,stroke:#333,stroke-width:2px
    style CoreLogger fill:#4caf50,stroke:#333,stroke-width:2px
    style Bootstrap fill:#4caf50,stroke:#333,stroke-width:2px
    style Auth fill:#ff9800,stroke:#333,stroke-width:2px
    style TokenManager fill:#ff9800,stroke:#333,stroke-width:2px
    style AuthService fill:#ff9800,stroke:#333,stroke-width:2px
`;

// Diagrama detalhado em sintaxe Mermaid
const authDetailedDiagramDefinition = `
    ErrorBoundary --> CoreLogger
    CoreLogger --> Bootstrap
    Bootstrap --> Auth
    Auth --> TokenManager
    Auth --> AuthService
    TokenManager --> CookieStore
    TokenManager --> JwtValidator
    AuthService --> ApiClient
    AuthService --> OAuthManager

    %% Estilização dos nós
    style ErrorBoundary fill:#4caf50,stroke:#333,stroke-width:2px
    style CoreLogger fill:#4caf50,stroke:#333,stroke-width:2px
    style Bootstrap fill:#4caf50,stroke:#333,stroke-width:2px
    style Auth fill:#ff9800,stroke:#333,stroke-width:2px
    style TokenManager fill:#ff9800,stroke:#333,stroke-width:2px
    style AuthService fill:#ff9800,stroke:#333,stroke-width:2px
    style CookieStore fill:#2196f3,stroke:#333,stroke-width:2px
    style JwtValidator fill:#2196f3,stroke:#333,stroke-width:2px
    style ApiClient fill:#2196f3,stroke:#333,stroke-width:2px
    style OAuthManager fill:#2196f3,stroke:#333,stroke-width:2px
`;

// Diagrama simplificado em sintaxe Mermaid
const authSimpleDiagramDefinition = `
    CoreSystem --> Auth
    Auth --> Services

    %% Estilização dos nós
    style CoreSystem fill:#4caf50,stroke:#333,stroke-width:2px
    style Auth fill:#ff9800,stroke:#333,stroke-width:2px
    style Services fill:#2196f3,stroke:#333,stroke-width:2px
`;

/**
 * **Documentação do Sistema de Autenticação**
 *
 * Este documento detalha a implementação e o fluxo do sistema de autenticação,
 * abrangendo a inicialização, a gestão de estado e o tratamento de erros.
 *
 * ---
 */
const AuthenticationDoc: React.FC = () => {
    const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
    const [detailLevel, setDetailLevel] = React.useState<'simple' | 'standard' | 'detailed'>('standard');

    // Função para selecionar a definição do diagrama com base no nível de detalhe
    const getDiagramDefinition = () => {
        switch (detailLevel) {
            case 'simple':
                return authSimpleDiagramDefinition;
            case 'detailed':
                return authDetailedDiagramDefinition;
            case 'standard':
            default:
                return authDiagramDefinition;
        }
    };

    // Handler para seleção de nó
    const handleNodeSelect = (nodeId: string) => {
        setSelectedNode(nodeId);
        // Aqui você poderia implementar lógica adicional, como scroll para a seção
        // correspondente ou exibir informações específicas
    };


    return (
        <Box component="article">
            <Typography variant="h1" gutterBottom component="h1">
                Documentação do Sistema de Autenticação
            </Typography>

            <Box className="section">
                <Alert severity="warning">
                    <Typography variant="h6" gutterBottom component="h6">
                        Atenção: Problemas Críticos de Timing na Inicialização
                    </Typography>
                    <div>
                        Foram identificados problemas críticos de timing durante o processo de inicialização.
                        Consulte a seção "<strong>Problemas Conhecidos</strong>" para obter detalhes e entender o impacto.
                    </div>
                </Alert>
            </Box>

            {/* Integração do SystemDiagram */}
            <Box className="section" sx={{ my: 4 }}>
                <Typography variant="h2" gutterBottom component="h2">
                    Fluxo de Inicialização do Sistema
                </Typography>

                <SystemDiagram
                    mode="light"
                    detailLevel={detailLevel}
                    interactive={true}
                    layout="TD"
                    diagramType="flowchart"
                    definition={getDiagramDefinition()}
                    onNodeSelect={handleNodeSelect}
                    nodesData={authNodesData}
                    title="Diagrama de Inicialização do Sistema de Autenticação"
                    description="Visualização do fluxo de inicialização dos componentes de autenticação e suas dependências"
                />

                {/* Seção que mostra mais detalhes sobre o nó selecionado */}
                {selectedNode && authNodesData[selectedNode] && (
                    <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
                        <Typography variant="h5" gutterBottom>
                            Detalhes: {authNodesData[selectedNode].label}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {authNodesData[selectedNode].description}
                        </Typography>

                        {selectedNode === 'Auth' && (
                            <Alert severity="warning">
                                O AuthProvider apresenta um problema crítico de timing durante a inicialização,
                                tentando acessar dependências antes delas estarem completamente inicializadas.
                                Isso resulta em comportamento inconsistente e potenciais falhas.
                            </Alert>
                        )}

                        {selectedNode === 'TokenManager' && (
                            <Alert severity="warning">
                                O TokenManager não está realizando a limpeza adequada de tokens expirados,
                                causando um potencial vazamento de memória ao longo do tempo.
                            </Alert>
                        )}
                    </Paper>
                )}
            </Box>


            <Box className="section">
                <Typography variant="h2" gutterBottom component="h2">
                    🔍 Problemas Conhecidos e Impactos
                </Typography>

                <Paper className="error" sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>

                    <Box className="subsection">
                        <Typography variant="h3" gutterBottom component="h3">
                            1. 🚨 Condição de Corrida (Race Condition) na Inicialização do AuthProvider
                        </Typography>
                        <Box className="subsection" >
                            O <code>AuthProvider</code> está prematuramente tentando acessar outros serviços e dependências <strong>antes</strong> que eles sejam totalmente inicializados.
                            <br />
                            <strong>Evidências concretas extraídas dos logs do sistema:</strong>
                            <Typography component="pre">
                                {
                                    `[ServiceInitializer] Starting initialization of service: auth
                [RetryManager] Starting service: user
                // ⚠️ User service (dependência) iniciada ANTES do AuthProvider ser pronto!`
                                }
                            </Typography>
                            <Alert severity="warning" variant="outlined">
                                <div>
                                    <strong>Impacto Imediato:</strong> Falhas intermitentes na autenticação durante a inicialização.
                                    <br />
                                    <strong>Risco Futuro:</strong> Instabilidade e comportamentos inesperados, especialmente em ambientes com alta carga ou reinicializações frequentes.
                                </div>
                            </Alert>
                        </Box>
                        <Divider />
                    </Box>

                    <Box className="subsection">
                        <Typography variant="h3" gutterBottom component="h3">
                            2. 🕳️ Vazamento de Memória no <code>TokenManager</code>
                        </Typography>
                        <div>
                            O <code>TokenManager</code> não está realizando a limpeza (garbage collection) de tokens expirados de forma eficiente. Isso leva a um <strong>acúmulo gradual de memória</strong>,
                            podendo degradar a performance da aplicação ao longo do tempo, especialmente em sessões longas ou com muitos usuários.
                            <Alert severity="warning" variant="outlined">
                                <div>
                                    <strong>Impacto Imediato:</strong> Nenhum crítico no momento, mas...
                                    <br />
                                    <strong>Risco Futuro:</strong>  <strong>Degradação de performance</strong> e potencial <strong>estabilidade comprometida</strong> em longo prazo devido ao consumo excessivo de memória.
                                </div>
                            </Alert>
                        </div>
                    </Box>
                </Paper>
            </Box>

            <Box className="section">
                <Typography variant="h2" gutterBottom component="h2">
                    🛠️ Soluções Propostas e Implementações
                </Typography>

                <Box className="subsection">
                    <Typography variant="h3" gutterBottom component="h3">
                        1. ⚙️ Implementação de um Sistema de Fila para Inicialização Sequencial
                    </Typography>
                    <Paper className="codeSection">
                        <Typography component="pre" variant="body2">
                            {`
// Proposta de implementação: AuthInitQueue para orquestrar a inicialização

class AuthInitQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing: boolean = false;

  async enqueue(operation: () => Promise<void>) {
    this.queue.push(operation);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        await operation();
      }
    }
    this.isProcessing = false;
  }
}
`}
                        </Typography>
                    </Paper>
                </Box>

                <Box className="subsection">
                    <Typography variant="h3" gutterBottom component="h3">
                        2. 🧹 Estratégia de Limpeza Automática (Garbage Collection) de Tokens Expirados
                    </Typography>
                    <Alert severity="warning" >
                        Implementar um processo de "garbage collection" no <code>TokenManager</code> para remover tokens expirados em intervalos regulares.
                    </ Alert>
                    <Paper className="codeSection">
                        <Typography component="pre" variant="body2">
                            {`
// Estratégia de limpeza de tokens (exemplo)

class TokenManager {
  private cleanupInterval: number = 5 * 60 * 1000; // Intervalo de 5 minutos (configurável)

  constructor() {
    this.startCleanupInterval(); // Inicia o processo de limpeza ao instanciar
  }

  startCleanupInterval() {
    setInterval(() => {
      this.removeExpiredTokens();
    }, this.cleanupInterval);
  }

  private removeExpiredTokens() {
    // ... Implementação da lógica para identificar e remover tokens expirados ...
    console.log('TokenManager: Limpeza de tokens expirados executada.');
  }
}
`}
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            <Box className="section">
                <Typography variant="h2" gutterBottom component="h2">
                    🔄 Fluxo de Retry (Repetição) e Recuperação do AuthService
                </Typography>

                <Paper className="codeSection">
                    <Typography component="pre" variant="body2">
                        {`// Estratégia de retry (exemplo) para o AuthService

export const authRetryStrategy = {
  maxAttempts: 3,                 // Máximo de tentativas antes de falhar
  backoffMultiplier: 1.5,         // Multiplicador para backoff exponencial
  initialDelay: 1000,            // Delay inicial de 1 segundo
  timeout: 15000,               // Timeout total de 15 segundos por operação

  onRetry: (attempt: number, error: Error) => {
    coreLogger.logEvent(         // Log de cada tentativa de retry
      'AuthService',
      LOG_LEVELS.WARNING,
      'Auth retry attempt',
      { attempt, error }
    );
  }
};
`}
                    </Typography>
                </Paper>
            </Box>

            <Box className="section">
                <Typography variant="h2" gutterBottom component="h2">
                    🚀 Próximos Passos e Ações Recomendadas
                </Typography>

                <Box component="ul" sx={{ ml: 2 }}>
                    <Typography component="li" >
                        <strong>Implementar Sistema de Fila de Inicialização:</strong> Priorizar a criação e integração da <code>AuthInitQueue</code> para garantir a inicialização sequencial e correta dos serviços.
                    </Typography>
                    <Typography component="li" >
                        <strong>Adicionar Garbage Collection ao <code>TokenManager</code>:</strong> Desenvolver e testar o mecanismo de limpeza automática de tokens para mitigar o vazamento de memória.
                    </Typography>
                    <Typography component="li" >
                        <strong>Revisar Dependências Circulares:</strong> Investigar e resolver possíveis dependências circulares no processo de inicialização para simplificar o fluxo e reduzir riscos de timing.
                    </Typography>
                    <Typography component="li" >
                        <strong>Aprimorar Logging de Erros de Autenticação:</strong> Refinar o sistema de logging para erros relacionados à autenticação, facilitando o diagnóstico e a resolução de problemas futuros.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default AuthenticationDoc;