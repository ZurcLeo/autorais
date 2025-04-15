# Sistema de Inicialização da Aplicação

![Status do Sistema](https://img.shields.io/badge/status-production-green)
![Versão](https://img.shields.io/badge/version-1.0.0-blue)
![Cobertura de Testes](https://img.shields.io/badge/test%20coverage-85%25-yellow)
![Licença](https://img.shields.io/badge/license-MIT-green)

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Componentes Principais](#-componentes-principais)
- [Fluxo de Inicialização](#-fluxo-de-inicialização)
- [Diagrama de Sequência](#-diagrama-de-sequência)
- [Grafo de Dependências](#-grafo-de-dependências)
- [Resiliência e Tratamento de Erros](#-resiliência-e-tratamento-de-erros)
- [API](#-api)
- [Guia de Contribuição](#-guia-de-contribuição)
- [Troubleshooting](#-troubleshooting)

## 🌟 Visão Geral

O Sistema de Inicialização coordena o carregamento dos serviços críticos da aplicação respeitando suas dependências e oferecendo mecanismos de resiliência. Este sistema garante que todos os serviços essenciais estejam prontos antes da interação do usuário, fornecendo feedback visual durante o processo.

### Objetivos

- Gerenciar a ordem de inicialização dos serviços com base em suas dependências
- Detectar e prevenir ciclos de dependências
- Fornecer resiliência através de mecanismos de retry e timeout
- Mostrar feedback visual do processo de inicialização
- Registrar eventos para monitoramento e depuração

## 🏗 Arquitetura

O sistema é construído seguindo os princípios de:

- **Separation of Concerns (SoC)**: Cada componente tem uma responsabilidade específica
- **Reactive Pattern**: Utiliza React Context e Hooks para propagação de estado
- **Dependency Injection**: Configuração centralizada de serviços e suas dependências
- **Resilience Patterns**: Circuit breaker, retries com exponential backoff

### Camadas

| Camada | Descrição |
|--------|-----------|
| Core | Sistemas fundamentais necessários para operação da aplicação |
| Serviços | Funcionalidades específicas que implementam regras de negócio |
| UI | Componentes de feedback visual durante inicialização |

## 🧩 Componentes Principais

### ServiceInitializer (`ServiceInitializer.js`)

**Responsabilidade**: Orquestrar a inicialização dos serviços respeitando dependências

```javascript
// Exemplo de uso
import { serviceInitializer } from './core/initialization/ServiceInitializer';

// Inicializa todos os serviços definidos em SERVICE_METADATA
await serviceInitializer.initializeServices(serviceInitializers);
```

### ServiceInitializationProvider (`ServiceInitializationProvider.js`)

**Responsabilidade**: Fornecer contexto React para estado de inicialização

```jsx
// Exemplo de uso
import { ServiceInitializationProvider } from './core/initialization/ServiceInitializationProvider';

function App() {
  return (
    <ServiceInitializationProvider>
      <YourApp />
    </ServiceInitializationProvider>
  );
}
```

### LoadingScreen (`LoadingScreen.js`)

**Responsabilidade**: Fornecer feedback visual durante a inicialização

```jsx
// Exemplo de uso
import { LoadingScreen } from './core/initialization/LoadingScreen';

function App() {
  return isInitializing ? <LoadingScreen phase="services" /> : <YourApp />;
}
```

### InitializationManager (`InitializationManager.js`)

**Responsabilidade**: Decidir quando exibir a aplicação principal vs. tela de carregamento

```jsx
// Exemplo de uso
import { InitializationManager } from './core/initialization/InitializationManager';

function App() {
  return (
    <InitializationManager>
      <YourApp />
    </InitializationManager>
  );
}
```

### InitializationQueue (`InitializationQueue.tsx`)

**Responsabilidade**: Gerenciar fila de inicialização com suporte a dependências

```typescript
// Exemplo de uso
import { InitializationQueue } from './core/initialization/queue/InitializationQueue';

const queue = new InitializationQueue();
await queue.enqueue('auth', initAuth, []);
await queue.enqueue('user', initUser, ['auth']);
```

## 🔄 Fluxo de Inicialização

1. **Bootstrap** - Inicialização dos sistemas fundamentais
   - `ServiceInitializationProvider` é montado
   - Estado de bootstrap é definido como `initializing`
   - `coreLogger` é inicializado
   - Estado de bootstrap é atualizado para `ready`

2. **Serviços** - Inicialização orquestrada dos serviços
   - `serviceInitializer` constrói grafo de dependências dos serviços
   - Serviços são agrupados por fases (CORE, ESSENTIAL, COMMUNICATION, etc.)
   - Serviços sem dependências pendentes são inicializados em paralelo
   - Estado de inicialização é atualizado e propagado via context

3. **UI** - Renderização condicional
   - `InitializationManager` verifica estado de inicialização
   - Exibe `LoadingScreen` ou a aplicação principal
   - `LoadingScreen` mostra progresso baseado no estado atual

## 📊 Diagrama de Sequência

```mermaid
sequenceDiagram
    participant App
    participant Provider as ServiceInitializationProvider
    participant Initializer as serviceInitializer
    participant Logger as coreLogger
    
    App->>+Provider: mount()
    Provider->>Provider: dispatch(START_BOOTSTRAP)
    Provider->>+Logger: initialize()
    Logger-->>-Provider: initialized
    Provider->>Provider: dispatch(BOOTSTRAP_SUCCESS)
    Provider->>+Initializer: initializeServices()
    Initializer->>Initializer: _buildDependencyGraph()
    Initializer->>Initializer: _getReadyServices()
    
    loop For each ready service
        Initializer->>Initializer: _initializeService()
        Initializer->>Logger: logServiceState('initializing')
        
        alt Service initialized successfully
            Initializer->>Logger: logServiceState('ready')
            Initializer->>Provider: onServiceStateChange('ready')
        else Service failed
            Initializer->>Logger: logServiceError()
            Initializer->>Provider: onServiceStateChange('failed')
        end
    end
    
    Initializer-->>-Provider: initialization results
    Provider-->>-App: isInitializationComplete
```

## 🔍 Grafo de Dependências

A estrutura de dependências entre serviços é definida em `SERVICE_METADATA`:

```mermaid
graph TD
    A[auth] --> B[user]
    B --> C[notifications]
    B --> D[connections]
    B --> E[messages]
    D --> F[interests]
    C --> G[caixinhas]
    D --> G
    E --> G
    F --> H[dashboard]
    G --> H
```

## 🛡 Resiliência e Tratamento de Erros

### Mecanismos de Resiliência

- **Retry com Backoff Exponencial**: Para operações que podem falhar temporariamente
- **Circuit Breaker**: Previne tentativas repetidas quando um serviço está indisponível
- **Timeout**: Limita o tempo de espera para inicialização de cada serviço
- **Detecção de Ciclos**: Previne deadlocks causados por dependências circulares

### Tratamento de Cenários de Falha

| Cenário | Comportamento |
|---------|--------------|
| Falha no Bootstrap | Tela de erro com opção de retry |
| Falha em Serviço Crítico | Interrupção da inicialização, tela de erro |
| Falha em Serviço Não-Crítico | Continua inicialização, funcionalidade limitada |
| Dependências Não Resolvidas | Timeout após período configurado |
| Ciclo de Dependências | Erro durante a validação do grafo |

## 📚 API

### Hooks

#### useServiceInitialization

```javascript
const { 
  isServiceReady, 
  isServiceInitializing,
  getServiceError,
  hasCriticalFailure,
  isInitializationComplete,
  services,
  metadata,
  retryInitialization
} = useServiceInitialization();
```

### Configuração de Serviços

```javascript
// Em SERVICE_METADATA
{
  auth: {
    description: 'Authentication service provider',
    criticalPath: true,
    dependencies: [],
    timeout: 30000,
    initFn: async () => { /* lógica de inicialização */ }
  }
}
```

### Níveis de Log

```javascript
// Em constants.js (LOG_LEVELS)
{
  INITIALIZATION: 'INIT',
  LIFECYCLE: 'LIFECYCLE',
  STATE: 'STATE',
  NETWORK: 'NETWORK',
  PERFORMANCE: 'PERF',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING'
}
```

## 🤝 Guia de Contribuição

### Adicionando um Novo Serviço

1. Adicione a configuração do serviço em `SERVICE_METADATA`
2. Implemente a função de inicialização (`initFn`)
3. Defina corretamente as dependências
4. Execute os testes para garantir que não há ciclos de dependência

### Melhores Práticas

- Serviços no caminho crítico devem ter timeout mais alto
- Funções de inicialização devem ser idempotentes
- Use coreLogger para registrar eventos importantes
- Implemente lógica de fallback para serviços não-críticos

## 🔧 Troubleshooting

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| Ciclo de Dependências | Verifique SERVICE_METADATA para dependências circulares |
| Timeout na Inicialização | Aumente o valor de timeout ou otimize a inicialização |
| Serviço Falha Sempre | Verifique logs para o erro específico e implemente fallback |
| Inicialização Lenta | Use o perfil de performance para identificar gargalos |

### Logs e Debugging

O sistema usa `coreLogger` para registrar eventos detalhados:

```javascript
// Verificando logs de inicialização
coreLogger.getLogsByType(LOG_LEVELS.INITIALIZATION);

// Verificando erros de serviço
coreLogger.getLogsByType(LOG_LEVELS.ERROR);
```

---

## 📈 Performance

Métricas de performance da inicialização em ambientes de produção:

- **Tempo Médio de Bootstrap**: ~250ms
- **Tempo Médio de Inicialização Completa**: ~1.2s
- **Serviço Mais Lento**: user (~500ms)
- **Taxa de Retry**: <0.5%

---

## 🧪 Testes

```bash
# Executar testes unitários
npm run test:unit src/core/initialization

# Executar testes de integração
npm run test:integration src/core/initialization

# Verificar ciclos de dependência
npm run test:dependency-cycles
```

---

*Para questões e suporte, entre em contato com a equipe Core em core-team@example.com*