import React from 'react';
import {
    Typography,
    Box,
    Paper,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { SystemDiagram } from '../components/SystemDiagram.tsx'; // Verifique o caminho correto para SystemDiagram

// Dados dos nós para o diagrama de resiliência
const resilienceNodesData = {
    'RetryManager': {
        label: 'RetryManager',
        status: 'stable',
        color: '#4caf50',
        description: 'Gerenciamento de retentativas com backoff exponencial',
        details: {
            status: 'Estável',
            responsável: 'Equipe Core',
            estratégia: 'Backoff exponencial com jitter',
            maxRetries: 'Configurável por serviço'
        }
    },
    'CircuitBreaker': {
        label: 'CircuitBreaker',
        status: 'stable',
        color: '#4caf50',
        description: 'Proteção contra falhas em cascata',
        details: {
            status: 'Estável',
            responsável: 'Equipe Core',
            estados: 'CLOSED, OPEN, HALF_OPEN',
            threshold: '50% de falhas'
        }
    },
    'ErrorHandling': {
        label: 'ErrorHandling',
        status: 'stable',
        color: '#4caf50',
        description: 'Sistema centralizado de tratamento de erros',
        details: {
            status: 'Estável',
            responsável: 'Equipe Core',
            categorias: 'Timeout, Network, Authorization, Validation'
        }
    },
    'RateLimiter': {
        label: 'RateLimiter',
        status: 'planned',
        color: '#2196f3',
        description: 'Limitação de taxa de requisições',
        details: {
            status: 'Planejado',
            responsável: 'Equipe Core',
            prioridade: 'Média',
            implementação: 'Token Bucket Algorithm'
        }
    },
    'LoadBalancer': {
        label: 'LoadBalancer',
        status: 'planned',
        color: '#2196f3',
        description: 'Balanceamento de carga entre serviços',
        details: {
            status: 'Planejado',
            responsável: 'Equipe DevOps',
            prioridade: 'Baixa'
        }
    },
    'RetryStrategy': {
        label: 'RetryStrategy',
        status: 'stable',
        color: '#4caf50',
        description: 'Implementações de estratégias de retry',
        details: {
            status: 'Estável',
            estratégias: 'Exponential, Linear, Custom'
        }
    },
    'FailureCounter': {
        label: 'FailureCounter',
        status: 'stable',
        color: '#4caf50',
        description: 'Contador de falhas para CircuitBreaker',
        details: {
            status: 'Estável',
            janelaDeTempo: '60 segundos'
        }
    },
    'StateManager': {
        label: 'StateManager',
        status: 'stable',
        color: '#4caf50',
        description: 'Gerenciador de estados do CircuitBreaker',
        details: {
            status: 'Estável',
            transições: 'Controladas por tempo e sucesso'
        }
    },
    'ErrorClassifier': {
        label: 'ErrorClassifier',
        status: 'stable',
        color: '#4caf50',
        description: 'Classificador de tipos de erro',
        details: {
            status: 'Estável'
        }
    },
    'ErrorReporter': {
        label: 'ErrorReporter',
        status: 'stable',
        color: '#4caf50',
        description: 'Sistema de relatório de erros',
        details: {
            status: 'Estável',
            integração: 'CoreLogger'
        }
    },
    'Client': {
        label: 'Client',
        description: 'Aplicação cliente',
        details: {
            tipo: 'Consumidor do sistema de resiliência'
        }
    },
    'Service': {
        label: 'Service',
        description: 'Serviço alvo',
        details: {
            tipo: 'Endpoint protegido pelo sistema de resiliência'
        }
    }
};

// Definições de diagrama para diferentes níveis de detalhe
const resilienceDiagramDefinition = `
    Client --> RetryManager
    RetryManager --> CircuitBreaker
    CircuitBreaker --> ErrorHandling
    ErrorHandling --> Service

    %% Estilização dos nós
    style Client fill:#e0e0e0,stroke:#333,stroke-width:2px
    style RetryManager fill:#4caf50,stroke:#333,stroke-width:2px
    style CircuitBreaker fill:#4caf50,stroke:#333,stroke-width:2px
    style ErrorHandling fill:#4caf50,stroke:#333,stroke-width:2px
    style Service fill:#e0e0e0,stroke:#333,stroke-width:2px
`;

const resilienceDetailedDiagramDefinition = `
    Client --> RetryManager
    RetryManager --> CircuitBreaker
    CircuitBreaker --> ErrorHandling
    ErrorHandling --> Service

    RetryManager --> RateLimiter
    RateLimiter --> LoadBalancer
    LoadBalancer --> Service

    RetryManager --> RetryStrategy
    CircuitBreaker --> FailureCounter
    CircuitBreaker --> StateManager
    ErrorHandling --> ErrorClassifier
    ErrorHandling --> ErrorReporter

    %% Estilização dos nós
    style Client fill:#e0e0e0,stroke:#333,stroke-width:2px
    style RetryManager fill:#4caf50,stroke:#333,stroke-width:2px
    style CircuitBreaker fill:#4caf50,stroke:#333,stroke-width:2px
    style ErrorHandling fill:#4caf50,stroke:#333,stroke-width:2px
    style Service fill:#e0e0e0,stroke:#333,stroke-width:2px
    style RateLimiter fill:#2196f3,stroke:#333,stroke-width:2px
    style LoadBalancer fill:#2196f3,stroke:#333,stroke-width:2px
    style RetryStrategy fill:#4caf50,stroke:#333,stroke-width:2px
    style FailureCounter fill:#4caf50,stroke:#333,stroke-width:2px
    style StateManager fill:#4caf50,stroke:#333,stroke-width:2px
    style ErrorClassifier fill:#4caf50,stroke:#333,stroke-width:2px
    style ErrorReporter fill:#4caf50,stroke:#333,stroke-width:2px
`;

const resilienceSimpleDiagramDefinition = `
    Client --> ResilienceSystem
    ResilienceSystem --> Service

    %% Estilização dos nós
    style Client fill:#e0e0e0,stroke:#333,stroke-width:2px
    style ResilienceSystem fill:#4caf50,stroke:#333,stroke-width:2px
    style Service fill:#e0e0e0,stroke:#333,stroke-width:2px
`;

// Diagrama de estado do CircuitBreaker
const circuitBreakerStateDiagramDefinition = `
    CLOSED --> OPEN: Falhas > threshold
    OPEN --> HALF_OPEN: Após cooldown
    HALF_OPEN --> CLOSED: Sucesso
    HALF_OPEN --> OPEN: Falha

    %% Estilização dos nós
    style CLOSED fill:#4caf50,stroke:#333,stroke-width:2px
    style OPEN fill:#f44336,stroke:#333,stroke-width:2px
    style HALF_OPEN fill:#ff9800,stroke:#333,stroke-width:2px
`;


const ResilienceSystemDoc: React.FC = () => {
    const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
    const [detailLevel, setDetailLevel] = React.useState<'simple' | 'standard' | 'detailed'>('standard');

    // Função para selecionar a definição do diagrama com base no nível de detalhe
    const getDiagramDefinition = () => {
        switch (detailLevel) {
            case 'simple':
                return resilienceSimpleDiagramDefinition;
            case 'detailed':
                return resilienceDetailedDiagramDefinition;
            case 'standard':
            default:
                return resilienceDiagramDefinition;
        }
    };

    // Handler para seleção de nó
    const handleNodeSelect = (nodeId: string) => {
        setSelectedNode(nodeId);
    };


    return (
        <Box sx={{
            maxWidth: '800px',
            margin: 'auto',
            padding: theme => theme.spacing(4)
        }}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    marginBottom: theme => theme.spacing(4),
                    textAlign: 'center'
                }}
            >
                Sistema de Resiliência: RetryManager e CircuitBreaker
            </Typography>

            <Typography
                variant="body1"
                paragraph
                sx={{
                    marginBottom: theme => theme.spacing(4),
                    lineHeight: 1.6
                }}
            >
                O sistema de resiliência do ElosCloud concentra-se em dois componentes principais que
                trabalham em conjunto para aumentar a robustez e a autogestão da aplicação frente a falhas transitórias e sobrecargas:
                o <Typography component="span" sx={{ fontWeight: 'bold' }}>RetryManager</Typography> e o <Typography component="span" sx={{ fontWeight: 'bold' }}>CircuitBreaker</Typography>.
                Este sistema é crucial para manter a estabilidade e a confiabilidade da aplicação, especialmente durante a inicialização e em operações críticas.
            </Typography>

            {/* Integração do SystemDiagram */}
            <Box sx={{ mb: 6 }}>
                <SystemDiagram
                    mode="light"
                    detailLevel={detailLevel}
                    interactive={true}
                    layout="LR"
                    diagramType="flowchart"
                    definition={getDiagramDefinition()}
                    onNodeSelect={handleNodeSelect}
                    nodesData={resilienceNodesData}
                    title="Arquitetura do Sistema de Resiliência"
                    description="Visualização dos componentes do sistema de resiliência e suas relações"
                />

                {/* Exibição de detalhes adicionais para o nó selecionado */}
                {selectedNode && resilienceNodesData[selectedNode] && (
                    <Paper sx={{ p: 3, mt: 3, bgcolor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom>
                            {resilienceNodesData[selectedNode].label}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {resilienceNodesData[selectedNode].description}
                        </Typography>

                        {selectedNode === 'RetryManager' && (
                            <>
                                <Typography variant="body2" paragraph>
                                    O RetryManager implementa uma estratégia de backoff exponencial que aumenta o tempo entre tentativas
                                    de forma progressiva, além de aplicar jitter (variação aleatória) para evitar o efeito de "thundering herd".
                                </Typography>
                                <Box component="pre" sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, overflow: 'auto' }}>
                                    {`// Exemplo de configuração do RetryManager
{
    retry: {
        baseDelay: 1000,         // Tempo inicial de espera entre retries (ms)
        maxDelay: 30000,         // Limite máximo de espera entre retries (ms)
        backoffMultiplier: 2,     // Fator de multiplicação exponencial do delay
        maxRetries: {
            critical: 5,         // Máximo de tentativas para serviços críticos
            normal: 3             // Máximo de tentativas para serviços normais
        },
        jitter: 0.1             // Variação aleatória de 10% no tempo de espera
    }
}`}
                                </Box>
                            </>
                        )}

                        {selectedNode === 'CircuitBreaker' && (
                            <>
                                <Typography variant="body2" paragraph>
                                    O CircuitBreaker opera como um disjuntor que protege o sistema contra falhas em cascata,
                                    transitando entre três estados principais: CLOSED (fechado/normal), OPEN (aberto/bloqueando chamadas)
                                    e HALF_OPEN (semi-aberto/testando recuperação).
                                </Typography>

                                {/* Diagrama de estado do CircuitBreaker */}
                                <Box sx={{ mt: 2, mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Estados do CircuitBreaker
                                    </Typography>
                                    <SystemDiagram
                                        mode="light"
                                        interactive={false}
                                        diagramType="stateDiagram"
                                        definition={circuitBreakerStateDiagramDefinition}
                                        title=""
                                        description=""
                                    />
                                </Box>

                                <Box component="pre" sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, overflow: 'auto' }}>
                                    {`// Configuração do Circuit Breaker
{
    circuitBreaker: {
        failureThreshold: 0.5,    // Percentual de falhas para abrir o circuito
        cooldownPeriod: 15000,     // Tempo de espera com circuito aberto (ms)
        halfOpenTimeout: 5000,     // Tempo máximo no estado HALF_OPEN (ms)
        minimumRequests: 10,      // Número mínimo de requisições para ativar circuit breaker
        successThreshold: 3         // Número de requisições bem-sucedidas para fechar o circuito
    }
}`}
                                </Box>
                            </>
                        )}
                    </Paper>
                )}
            </Box>

            <Paper
                elevation={1}
                sx={{
                    padding: theme => theme.spacing(3),
                    marginBottom: theme => theme.spacing(4),
                    backgroundColor: theme => theme.palette.background.paper
                }}
            >
                <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    sx={{ marginBottom: theme => theme.spacing(2) }}
                >
                    1. RetryManager
                </Typography>
                <Typography
                    variant="body1"
                    paragraph
                    sx={{ lineHeight: 1.6 }}
                >
                    O <Typography
                        component="code"
                        sx={{
                            backgroundColor: theme => theme.palette.background.default,
                            padding: '2px 4px',
                            borderRadius: theme => theme.shape.borderRadius,
                            fontFamily: 'monospace'
                        }}
                    >
                        RetryManager
                    </Typography> é responsável por gerenciar e orquestrar novas tentativas de operações que falharam.
                    Ele implementa uma estratégia de <Typography component="span" sx={{ fontWeight: 'bold' }}>backoff exponencial</Typography>, que aumenta o tempo de espera entre as tentativas
                    de forma exponencial, evitando sobrecarregar o sistema em recuperação. Adicionalmente, utiliza <Typography component="span" sx={{ fontWeight: 'bold' }}>jitter</Typography> para introduzir
                    uma variação aleatória nos tempos de espera, o que ajuda a evitar o "thundering herd" (efeito manada) onde múltiplos clientes
                    tentam repetir operações simultaneamente após um período de falha.
                </Typography>
                <Typography
                    variant="body1"
                    paragraph
                    sx={{ lineHeight: 1.6 }}
                >
                    O RetryManager é configurável com limites de tempo (<Typography component="span" sx={{ fontWeight: 'bold' }}>timeout absoluto</Typography>) para evitar esperas indefinidas e
                    limites no número de retentativas (<Typography component="span" sx={{ fontWeight: 'bold' }}>maxRetries</Typography>), que são diferenciados para serviços críticos e não críticos,
                    permitindo uma gestão mais granular da resiliência conforme a importância do serviço.
                </Typography>

                <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    sx={{
                        marginTop: theme => theme.spacing(3),
                        marginBottom: theme => theme.spacing(2)
                    }}
                >
                    2. CircuitBreaker
                </Typography>
                <Typography
                    variant="body1"
                    paragraph
                    sx={{ lineHeight: 1.6 }}
                >
                    O <Typography
                        component="code"
                        sx={{
                            backgroundColor: theme => theme.palette.background.default,
                            padding: '2px 4px',
                            borderRadius: theme => theme.shape.borderRadius,
                            fontFamily: 'monospace'
                        }}
                    >
                        CircuitBreaker
                    </Typography> atua como um disjuntor, protegendo o sistema contra falhas em cascata e sobrecarga.
                    Ele opera em três estados principais, definidos no enum <Typography
                        component="code"
                        sx={{
                            backgroundColor: theme => theme.palette.background.default,
                            padding: '2px 4px',
                            borderRadius: theme => theme.shape.borderRadius,
                            fontFamily: 'monospace'
                        }}
                    >
                        CircuitState
                    </Typography>:
                </Typography>
                <List dense>
                    {[
                        {
                            primary: 'CLOSED',
                            secondary: 'Estado normal de operação. As requisições passam normalmente pelo serviço, e o CircuitBreaker monitora a taxa de falhas de forma contínua.'
                        },
                        {
                            primary: 'OPEN',
                            secondary: 'Quando a taxa de falhas excede o limite definido (failureThreshold), o CircuitBreaker abre o circuito, bloqueando novas requisições para prevenir sobrecarga adicional do serviço.'
                        },
                        {
                            primary: 'HALF_OPEN',
                            secondary: 'Estado de recuperação onde um número limitado de requisições é permitido para testar se o serviço está operacional. Com base no desempenho dessas requisições de teste, o circuito pode retornar ao estado CLOSED ou permanecer OPEN.'
                        }
                    ].map((item, index) => (
                        <ListItem key={item.primary}>
                            <ListItemText
                                primary={
                                    <Typography
                                        component="span"
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {item.primary}
                                    </Typography>
                                }
                                secondary={item.secondary}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                    marginTop: theme => theme.spacing(4),
                    marginBottom: theme => theme.spacing(2)
                }}
            >
                Tipos de Erros e Estados
            </Typography>
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
                O sistema de resiliência define tipos específicos de erros para melhor compreensão e tratamento de falhas:
            </Typography>
            <Box component="ul" sx={{ ml: 2, marginBottom: theme => theme.spacing(4) }}>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">CIRCUIT_OPEN:</Typography> Indica que o circuit breaker está aberto e bloqueando novas requisições.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">MAX_RETRIES:</Typography> Sinaliza que o número máximo de tentativas de retry foi alcançado.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">TIMEOUT:</Typography> Representa uma falha por tempo de espera excedido.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">DEPENDENCY_FAILURE:</Typography> Indica falha em um serviço dependente.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">INFINITE_LOOP:</Typography> Detecta potenciais loops de inicialização ou processamento.
                </Typography>
            </Box>

            <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                    marginTop: theme => theme.spacing(4),
                    marginBottom: theme => theme.spacing(2)
                }}
            >
                Configurações Detalhadas
            </Typography>

            <Box sx={{ marginBottom: theme => theme.spacing(4) }}>
                <Typography variant="h6" gutterBottom sx={{ marginBottom: theme => theme.spacing(2) }}>
                    Configuração de Retry
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: theme => theme.palette.background.paper, marginBottom: theme => theme.spacing(3) }}>
                    <pre style={{ margin: 0 }}>
                        {`{
    retry: {
        baseDelay: 1000,          // Tempo inicial de espera entre retries (ms)
        maxDelay: 30000,          // Limite máximo de espera entre retries (ms)
        backoffMultiplier: 2,      // Fator de multiplicação exponencial do delay
        maxRetries: {
            critical: 5,          // Máximo de tentativas para serviços críticos
            normal: 3              // Máximo de tentativas para serviços normais
        },
        jitter: 0.1              // Variação aleatória de 10% no tempo de espera
    }
}`}
                    </pre>
                </Paper>

                <Typography variant="h6" gutterBottom sx={{ marginBottom: theme => theme.spacing(2) }}>
                    Configuração do Circuit Breaker
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: theme => theme.palette.background.paper }}>
                    <pre style={{ margin: 0 }}>
                        {`{
    circuitBreaker: {
        failureThreshold: 0.5,     // Percentual de falhas para abrir o circuito
        cooldownPeriod: 15000,     // Tempo de espera com circuito aberto (ms)
        halfOpenTimeout: 5000,     // Tempo máximo no estado HALF_OPEN (ms)
        minimumRequests: 10,       // Número mínimo de requisições para ativar circuit breaker
        successThreshold: 3          // Número de requisições bem-sucedidas para fechar o circuito
    }
}`}
                    </pre>
                </Paper>
            </Box>

            <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                    marginTop: theme => theme.spacing(4),
                    marginBottom: theme => theme.spacing(2)
                }}
            >
                Monitoramento e Métricas Avançadas
            </Typography>

            <Typography variant="body1" paragraph sx={{ marginBottom: theme => theme.spacing(4), lineHeight: 1.6 }}>
                O sistema de monitoramento fornece insights detalhados sobre o desempenho e a saúde do sistema de resiliência:
            </Typography>

            <Box component="ul" sx={{ ml: 2, marginBottom: theme => theme.spacing(4) }}>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Estado do Sistema:</Typography> Categorizado como saudável, em alerta ou degradado, baseado em métricas agregadas.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Métricas Globais:</Typography>
                    <Box component="ul" sx={{ ml: 2 }}>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Tentativas de Retry: Número total de tentativas realizadas</Typography>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Retries Bem-Sucedidos: Número de operações recuperadas via retry</Typography>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Retries Falhados: Número de tentativas que não conseguiram recuperar a operação</Typography>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Taxa de Sucesso: Percentual de operações bem-sucedidas após retries</Typography>
                    </Box>
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Métricas por Serviço:</Typography>
                    <Box component="ul" sx={{ ml: 2 }}>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Estado do Circuito: CLOSED, OPEN ou HALF_OPEN</Typography>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Número de Tentativas</Typography>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Tentativas Rápidas Detectadas</Typography>
                        <Typography component="li" sx={{ lineHeight: 1.6 }}>Timestamp da Última Tentativa</Typography>
                    </Box>
                </Typography>
            </Box>

            <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                    marginTop: theme => theme.spacing(4),
                    marginBottom: theme => theme.spacing(2)
                }}
            >
                Problemas Conhecidos e Estratégias de Mitigação
            </Typography>

            <Box component="ul" sx={{ ml: 2, marginBottom: theme => theme.spacing(4) }}>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Vazamento de Memória:</Typography> Implementado um sistema de garbage collection que limpa periodicamente dados de serviços com circuit breaker aberto, prevenindo crescimento indefinido de memória.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Detecção de Loops de Inicialização:</Typography> Mecanismo para identificar e interromper tentativas de inicialização repetidas e infrutíferas, protegendo o sistema contra ciclos de retry intermináveis.
                </Typography>
            </Box>

            <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{
                    marginTop: theme => theme.spacing(4),
                    marginBottom: theme => theme.spacing(2)
                }}
            >
                Próximos Passos e Melhorias Contínuas
            </Typography>

            <Box component="ul" sx={{ ml: 2 }}>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Configuração Dinâmica:</Typography> Desenvolver mecanismos para ajuste automático de parâmetros de resiliência baseados em condições de carga e desempenho do sistema.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Telemetria Avançada:</Typography> Expandir métricas para incluir tempo médio de recuperação, distribuição de tempos de retry, e padrões de falha por serviço.
                </Typography>
                <Typography component="li" sx={{ lineHeight: 1.6 }}>
                    <Typography component="strong">Chaos Engineering:</Typography> Implementar testes de resiliência mais abrangentes para validar comportamento do sistema em condições adversas.
                </Typography>
            </Box>
        </Box>
    );
};

export default ResilienceSystemDoc;