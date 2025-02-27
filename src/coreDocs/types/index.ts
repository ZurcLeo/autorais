
export interface DocSection {
  id: string;
  title: string;
  description?: string;
  items: DocItem[];
  status?: 'stable' | 'attention' | 'error' | 'planned';
}
  
  export interface DocTheme {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  }

  // Types for documentation system
export interface DocItem {
  id: string;
  title: string;
  path: string;
  status?: 'stable' | 'attention' | 'error' | 'planned';
  label?: string;
  description?: string;
  lastUpdated?: string;
  maintainers?: string[];
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
}

export const docSections: DocSections = [
  {
    id: 'app',
    title: 'Aplicação',
    description: 'Componentes e sistemas principais da aplicação',
    status: 'stable',
    items: [
      {
        id: 'initialization',
        status: 'stable',
        label: 'Initialization System',
        description: 'Sistema de inicialização e bootstrapping da aplicação',
        title: 'Inicialização',
        path: '/docs/initialization',
        lastUpdated: '2025-02-20',
        priority: 'high'
      },
      {
        id: 'resilience',
        status: 'stable',
        label: 'System Resilience',
        description: 'Sistema de resiliência e recuperação de falhas',
        title: 'Resiliência',
        path: '/docs/resilience',
        lastUpdated: '2025-02-20',
        priority: 'high'
      },
      {
        id: 'auth',
        status: 'attention',
        label: 'Authentication System',
        description: 'Sistema de autenticação e autorização',
        title: 'Autenticação',
        path: '/docs/auth',
        lastUpdated: '2025-02-20',
        priority: 'high'
      }
    ]
  },
  {
    id: 'core',
    title: 'Core',
    description: 'Sistemas centrais e infraestrutura',
    status: 'stable',
    items: [
      {
        id: 'state',
        status: 'stable',
        label: 'State Management',
        description: 'Sistema centralizado de gerenciamento de estado',
        title: 'Gerenciamento de Estado',
        path: '/docs/state',
        priority: 'high'
      },
      {
        id: 'logging',
        status: 'stable',
        title: 'Sistema de Logging',
        path: '/docs/logging',
        priority: 'medium'
      },
      {
        id: 'cache',
        status: 'planned',
        title: 'Estratégias de Cache',
        description: 'Implementação e gerenciamento de cache',
        path: '/docs/cache',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'security',
    title: 'Segurança',
    description: 'Documentação de segurança e práticas',
    status: 'attention',
    items: [
      {
        id: 'security-policies',
        status: 'planned',
        title: 'Políticas de Segurança',
        description: 'Diretrizes e políticas de segurança',
        path: '/docs/security/policies',
        priority: 'high'
      },
      {
        id: 'auth-practices',
        status: 'attention',
        title: 'Práticas de Autenticação',
        description: 'Práticas seguras de autenticação',
        path: '/docs/security/auth-practices',
        priority: 'high'
      },
      {
        id: 'vulnerabilities',
        status: 'planned',
        title: 'Proteção contra Vulnerabilidades',
        description: 'Guia de proteção contra vulnerabilidades comuns',
        path: '/docs/security/vulnerabilities',
        priority: 'high'
      },
      {
        id: 'secrets',
        status: 'planned',
        title: 'Gestão de Secrets',
        description: 'Gerenciamento seguro de secrets e credenciais',
        path: '/docs/security/secrets',
        priority: 'high'
      }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps',
    description: 'Processos de desenvolvimento e operações',
    status: 'planned',
    items: [
      {
        id: 'deployment',
        status: 'planned',
        title: 'Processo de Deploy',
        description: 'Documentação do processo de deployment',
        path: '/docs/devops/deployment',
        priority: 'high'
      },
      {
        id: 'testing',
        status: 'planned',
        title: 'Estratégias de Teste',
        description: 'Estratégias e práticas de teste',
        path: '/docs/devops/testing',
        priority: 'high'
      },
      {
        id: 'monitoring',
        status: 'planned',
        title: 'Monitoramento em Produção',
        description: 'Sistema de monitoramento e alertas',
        path: '/docs/devops/monitoring',
        priority: 'high'
      },
      {
        id: 'metrics',
        status: 'planned',
        title: 'Métricas de Performance',
        description: 'Métricas e KPIs de performance',
        path: '/docs/devops/metrics',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'theme',
    title: 'Tema',
    description: 'Sistema de design e temas',
    status: 'stable',
    items: [
      {
        id: 'colors',
        status: 'stable',
        title: 'Paleta de Cores',
        path: '/docs/theme/colors',
        priority: 'medium'
      },
      {
        id: 'typography',
        status: 'stable',
        title: 'Tipografia',
        path: '/docs/theme/typography',
        priority: 'medium'
      },
      {
        id: 'layout',
        status: 'stable',
        title: 'Layout',
        path: '/docs/theme/layout',
        priority: 'medium'
      }
    ]
  },
  {
    id: 'logging',
    title: 'Logging',
    description: 'Sistema de logging e monitoramento',
    status: 'stable',
    items: [
      {
        id: 'log-stats',
        status: 'stable',
        title: 'Status de Log',
        path: '/docs/logging/stats',
        priority: 'medium'
      },
      {
        id: 'log-critical',
        status: 'attention',
        title: 'Problemas Críticos no Sistema de Log',
        path: '/docs/logging/critical',
        priority: 'high'
      },
      {
        id: 'log-settings',
        status: 'stable',
        title: 'Configurações Dinâmicas de Log',
        path: '/docs/logging/settings',
        priority: 'medium'
      },
      {
        id: 'log-architectural',
        status: 'stable',
        title: 'Arquitetura do Sistema de Log',
        path: '/docs/logging/arch',
        priority: 'medium'
      },
      {
        id: 'log-management',
        status: 'stable',
        title: 'Gerenciamento de Estado de Log Defensivo',
        path: '/docs/logging/management',
        priority: 'high'
      },
      {
        id: 'log-next',
        status: 'planned',
        title: 'Próximos Passos no Sistema de Log',
        path: '/docs/logging/next',
        priority: 'low'
      }
    ]
  },
  {
    id: 'error',
    title: 'Erro',
    description: 'Sistema de tratamento de erros',
    status: 'stable',
    items: [
      {
        id: 'error-handling',
        status: 'stable',
        title: 'Tratamento de Erro',
        path: '/docs/error/handling',
        priority: 'high'
      },
      {
        id: 'error-reporting',
        status: 'stable',
        title: 'Relatório de Erro',
        path: '/docs/error/reporting',
        priority: 'medium'
      },
      {
        id: 'error-logging',
        status: 'stable',
        title: 'Log de Erro',
        path: '/docs/error/logging',
        priority: 'medium'
      }
    ]
  }
];

export type DocSections = DocSection[];