# Sistema de Logging da Aplicação - Documentação Técnica

## 1. Visão Geral

O sistema de logging da aplicação fornece um mecanismo centralizado para registro, monitoramento e visualização de eventos, erros e informações de diagnóstico. Ele foi projetado para suportar diferentes níveis de severidade, filtragem dinâmica e visualização em tempo real, facilitando o diagnóstico de problemas e a monitoração do comportamento da aplicação.

## 2. Arquitetura e Componentes

### 2.1 Estrutura de Diretórios

```
src/core/logging/
├── CoreLogger.js          # Implementação principal do sistema de logging
├── CoreLoggerContext.js   # Contexto React para acesso ao logger
├── DiagnosticsView.js     # Interface de visualização dos logs
├── index.js               # Exports dos componentes principais
├── LoggingConfig.js       # Configurações do sistema de logging
└── ProviderDiagnostics.js # Componente para diagnóstico dos providers
```

### 2.2 Dependências Externas

- **constants.js** - Define `LOG_LEVELS`, `SEVERITY_LEVELS` e outras constantes
- **theme.js** - Sistema de temas da aplicação, usado pelo DiagnosticsView
- **React** - Estrutura de UI para os componentes visuais de logging

### 2.3 Componentes Principais

#### 2.3.1 CoreLogger.js

**Responsabilidade:** Implementa a lógica central de logging, incluindo o registro, filtragem e armazenamento de logs.

**Padrão de Design:** Singleton - Garante uma única instância em toda a aplicação.

**Características:**
- Implementa uma estratégia de batch logging para otimizar performance
- Mantém um buffer de logs em memória com tamanho limitado (MAX_LOGS)
- Suporta subscribers para notificação de novos logs
- Fornece métodos específicos para diferentes tipos de logs (evento, erro, performance)

**Métodos Principais:**
- `initialize()` - Inicializa o logger e registra logs iniciais
- `logEvent(component, level, message, data, metadata)` - Registra um evento com informações contextuais
- `logServiceError(serviceName, error, context)` - Registra erros de serviço
- `logServicePerformance(serviceName, operation, duration, metadata)` - Registra métricas de performance
- `subscribe(callback)` - Registra um subscriber para ser notificado sobre novos logs
- `batchLog(entries)` - Adiciona múltiplos logs ao batch em uma única operação

**Sequência de Inicialização:**
1. A instância é criada com o padrão singleton
2. O método `initialize()` é chamado para configurar o logger
3. Os logs iniciais são registrados

**Pontos de Atenção:**
- Não há um mecanismo explícito para limpar recursos quando a aplicação é descarregada
- A instância é criada tanto via `getInstance()` quanto diretamente com `new CoreLogger()`

#### 2.3.2 CoreLoggerContext.js

**Responsabilidade:** Fornece o contexto React para acesso ao CoreLogger em toda a aplicação.

**Componentes:**
- `CoreLoggerProvider` - Componente que fornece o contexto do logger
- `useCoreLogger` - Hook para acessar o logger do contexto

**Uso:**
```jsx
// Exemplo de uso do contexto de logging
import { useCoreLogger } from './core/logging/CoreLoggerContext';

function MyComponent() {
  const logger = useCoreLogger();
  
  const handleClick = () => {
    logger.logEvent('MyComponent', 'INFO', 'Button clicked', { timestamp: Date.now() });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

#### 2.3.3 DiagnosticsView.js

**Responsabilidade:** Fornece uma interface de usuário para visualizar, filtrar e pesquisar logs.

**Características:**
- Interface flutuante que pode ser expandida/recolhida
- Filtragem por nível de log, componente e intervalo de tempo
- Pesquisa por termo em logs
- Visualização virtualizada para lidar com grandes volumes de logs
- Recursos para pausar, limpar e baixar logs

**Otimizações:**
- Utiliza cache para melhorar a performance da filtragem
- Implementa debounce na pesquisa para reduzir chamadas desnecessárias
- Usa virtualização via componente Virtuoso para renderizar apenas logs visíveis

**Considerações de UX:**
- Fornece feedback visual para ações do usuário
- Suporta atalhos de teclado para operações comuns
- Animações para transições de estado da interface

#### 2.3.4 ProviderDiagnostics.js

**Responsabilidade:** Componente React que conecta o sistema de logging à interface do DiagnosticsView.

**Funcionalidades:**
- Gerencia o estado dos logs e filtros
- Implementa a lógica de filtragem de logs
- Controla a pausa/resumo da exibição de logs
- Fornece funções para operações como limpar logs e download

**Ciclo de Vida:**
1. Inicializa com os logs atuais do CoreLogger
2. Subscreve para atualizações de novos logs
3. Gerencia a limpeza de recursos quando desmontado

**Pontos de Atenção:**
- Há um potential memory leak se o unsubscribe não for chamado corretamente
- A lógica de filtragem é duplicada entre ProviderDiagnostics e DiagnosticsView

#### 2.3.5 LoggingConfig.js

**Responsabilidade:** Define configurações padrão e específicas por ambiente para o sistema de logging.

**Configurações:**
- Limites de armazenamento de logs
- Delay para batch processing
- Níveis mínimos de severidade por ambiente
- Handlers para diferentes tipos de logs

**Funções Utilitárias:**
- `validateLogConfig()` - Valida as configurações de logging

### 2.4 Constantes e Configurações (constants.js)

**LOG_LEVELS:** Define os diferentes níveis de log suportados:
- `INITIALIZATION` - Eventos de inicialização do sistema
- `LIFECYCLE` - Eventos de ciclo de vida de componentes
- `STATE` - Mudanças de estado
- `NETWORK` - Eventos de rede e comunicação
- `PERFORMANCE` - Métricas de performance
- `ERROR` - Erros e exceções
- `DEBUG` - Informações de debug
- `INFO` - Informações gerais
- `WARNING` - Avisos e alertas

**SEVERITY_LEVELS:** Mapeia cada LOG_LEVEL para um nível numérico de severidade:
- 0: Crítico (ERROR)
- 1: Alto (INITIALIZATION, NETWORK)
- 2: Médio (STATE, LIFECYCLE, PERFORMANCE)
- 3: Baixo (DEBUG, INFO)

**LOG_CONFIG:** Configurações globais de logging:
- `minSeverity` - Nível mínimo de severidade para registrar logs
- `enableConsoleLogging` - Flag para habilitar logging no console

## 3. Fluxo de Dados

### 3.1 Registro de Logs

```
Componente da Aplicação
   │
   ▼
coreLogger.logEvent()
   │
   ▼
Validação do Level e Severidade
   │
   ▼
Criação do Objeto de Log
   │
   ▼
Adição ao Batch de Logs
   │
   ▼
Debounce para Processamento
   │
   ├─► Console (se enableConsoleLogging=true)
   │
   └─► Buffer de Logs em Memória
```

### 3.2 Visualização de Logs

```
CoreLogger
   │
   ▼
Subscriptions Notificadas
   │
   ▼
ProviderDiagnostics Atualiza Estado
   │
   ▼
Filtragem de Logs
   │
   ▼
DiagnosticsView Renderiza Logs
   │
   ▼
Usuário Interage com a Interface
```

### 3.3 Integração com Sistema React

```
index.js (Aplicação)
   │
   ▼
CoreLoggerProvider
   │
   ▼
App.js e Outros Componentes
   │
   ▼
useCoreLogger() Hook
   │
   ▼
Chamadas de Logging
```

## 4. Casos de Uso

### 4.1 Inicialização da Aplicação

Durante a inicialização da aplicação, o sistema de logging registra eventos relacionados ao carregamento de componentes e serviços:

```javascript
// Exemplo de App.js
useEffect(() => {
  coreLogger.logServiceInitStart('App', LOG_LEVELS.LIFECYCLE, 'Routes initialization', {
    startTimestamp: new Date().toISOString(),
    initialPath: location.pathname
  });
  
  // Resto do código...
}, []);
```

### 4.2 Monitoramento de Performance

O sistema registra métricas de performance para identificar gargalos:

```javascript
// Exemplo em routes.js
const initialLoadTime = performance.now() - startTime;
coreLogger.logServicePerformance('AppRoutes', LOG_LEVELS.PERFORMANCE, 'Initial routes load', {
  duration: `${Math.round(initialLoadTime)}ms`,
  path: location.pathname
});
```

### 4.3 Tratamento de Erros

O sistema captura e registra erros para facilitar o diagnóstico:

```javascript
// Exemplo em routes.js
const handleRouteError = (error) => {
  coreLogger.logServiceError('AppRoutes', LOG_LEVELS.ERROR, 'Route error', {
    error: error.message,
    path: location.pathname,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

try {
  // Código que pode falhar
} catch (error) {
  handleRouteError(error);
  throw error;
}
```

## 5. Problemas Conhecidos e Limitações

### 5.1 Gestão de Memória

O sistema acumula logs em memória, limitados por MAX_LOGS. Em sessões longas com muitos logs, isso pode consumir memória significativa. Considere implementar:
- Persistência em localStorage para sessões longas
- Estratégias de rotação de logs mais agressivas em produção

### 5.2 Inconsistências no Padrão Singleton

O CoreLogger implementa um padrão singleton, mas há inconsistências na criação da instância:

```javascript
// Em CoreLogger.js
class CoreLogger {
  static getInstance() {
    if (!CoreLogger.instance) {
      CoreLogger.instance = new CoreLogger();
    }
    return CoreLogger.instance;
  }

  constructor() {
    if (CoreLogger.instance) {
      return CoreLogger.instance;
    }
    // ...
  }
}

// Mas no final do arquivo
export const coreLogger = new CoreLogger();
```

Isso pode levar a comportamentos inesperados se a instância for criada de maneiras diferentes.

### 5.3 Potencial Memory Leak em Subscriptions

O sistema de subscriptions não garante que todos os unsubscribes sejam chamados:

```javascript
// Em ProviderDiagnostics.js
useEffect(() => {
  let mounted = true;
  let unsubscribe;

  const initialize = async () => {
    try {
      await coreLogger.initialize();
      if (!mounted) return;

      // Configurar subscriber
      unsubscribe = coreLogger.subscribe((newLogs) => { /* ... */ });
    } catch (error) { /* ... */ }
  };

  initialize();

  return () => {
    mounted = false;
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [isPaused]);
```

Há um potencial problema se o método `initialize()` falhar antes de definir `unsubscribe`.

### 5.4 Validação de Logs Inconsistente

O sistema tem validação parcial para os objetos de log, podendo permitir logs mal formados em algumas situações.

```javascript
// Em CoreLogger.js
_consoleLog(logEntry) {
  if (!logEntry || typeof logEntry !== 'object') {
    console.warn('[Logger] Invalid log entry (not an object):', logEntry);
    return;
  }
  // ...
}
```

Mas outros métodos podem não validar adequadamente os parâmetros antes de criar logs.

## 6. Melhores Práticas e Recomendações

### 6.1 Performance em Produção

Em produção, é recomendado:
- Definir `minSeverity` para um nível mais restritivo (0 ou 1)
- Desativar `enableConsoleLogging` para evitar overhead desnecessário
- Considerar um backend de armazenamento para logs críticos

### 6.2 Debugging em Desenvolvimento

Para desenvolvimento, configure:
- `minSeverity` com valor mais permissivo (3)
- `enableConsoleLogging` como true
- Utilize o DiagnosticsView para análise interativa

### 6.3 Acoplamento com Componentes

Evite acoplar firmemente componentes da aplicação ao sistema de logging. Prefira:
- Injeção via contexto
- Wrappers/HOCs para logging automático
- Middlewares para logging estruturado

### 6.4 Extensões Recomendadas

O sistema pode ser estendido com:
- Integração com serviços externos de monitoramento
- Persistência de logs críticos
- Agregação e análise estatística de logs
- Alertas para condições específicas

## 7. Evolução e Manutenção

### 7.1 Adição de Novos Níveis de Log

Para adicionar um novo nível de log:

1. Adicione o nível em `LOG_LEVELS` em constants.js
2. Defina sua severidade em `SEVERITY_LEVELS`
3. Atualize o `SEVERITY_TO_LOG_LEVEL` se necessário
4. Implemente handlers específicos em `LoggingConfig.js` se aplicável

### 7.2 Integração com Novos Serviços

Para integrar novos serviços com o sistema de logging:

1. Importe o coreLogger no serviço
2. Utilize os métodos específicos de serviço (`logServiceState`, `logServiceError`, etc.)
3. Considere criar wrappers específicos para o domínio do serviço

## 8. Considerações Finais

O sistema de logging fornece uma infraestrutura robusta para diagnóstico e monitoramento, mas requer atenção aos potenciais problemas de memória e inconsistências de implementação. Seguindo as melhores práticas e recomendações, é possível maximizar seu valor enquanto minimiza os riscos potenciais.