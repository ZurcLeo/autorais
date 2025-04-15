## Documento Técnico: Sistema de Tratamento de Erros da Aplicação (`src/core/error`)

Este documento descreve com precisão o sistema de tratamento de erros implementado na aplicação, abordando componentes, interações, dependências e fluxos reais de funcionamento.

### 1. Visão Geral da Arquitetura

O sistema de tratamento de erros da aplicação é composto por múltiplas camadas que trabalham em conjunto para:
- Capturar erros durante a renderização de componentes React (ErrorBoundary)
- Proporcionar um mecanismo de contextualização e propagação de erros (ErrorBoundaryContext)
- Implementar políticas de resiliência com retentativas (ErrorBoundaryProvider)
- Apresentar feedback visual ao usuário (ErrorAlert)
- Capturar erros não tratados a nível global
- Facilitar o diagnóstico e teste de erros durante o desenvolvimento (ErrorDiagnostics)

#### 1.1. Diagrama de Arquitetura (ASCII)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ErrorBoundaryProvider                          │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │                        ErrorBoundary                           │   │
│ │ ┌─────────────────────────────┐ ┌─────────────────────────┐   │   │
│ │ │      React Components       │ │ Global Error Listeners  │   │   │
│ │ └─────────────────────────────┘ └─────────────────────────┘   │   │
│ └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                           ▲                   │
          │                           │                   │
          ▼                           │                   ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌────────────────┐
│    ErrorAlert       │    │ useErrorBoundary    │    │ captureError   │
│   (Visualização)    │    │     (Hook)          │    │  (Utilitário)  │
└─────────────────────┘    └─────────────────────┘    └────────────────┘
                                     │
                                     ▼
                           ┌─────────────────────┐
                           │  ErrorDiagnostics   │
                           │ (Apenas em Dev)     │
                           └─────────────────────┘
```

#### 1.2. Posicionamento na Hierarquia da Aplicação

```
├── index.js 
│   ├── ErrorBoundaryProvider       # Primeiro nível na hierarquia da app
│   │   ├── ErrorBoundary           # Segundo nível, engloba toda a aplicação
│   │   │   ├── BrowserRouter       # Roteamento
│   │   │   │   ├── CoreLoggerProvider
│   │   │   │   │   ├── ServiceInitializationProvider
│   │   │   │   │   │   ├── ThemeContextProvider
│   │   │   │   │   │   │   ├── ... (Outros providers)
│   │   │   │   │   │   │   │   ├── App
```

### 2. Componentes e suas Responsabilidades

#### 2.1. ErrorAlert.js
**Responsabilidade**: Interface visual para apresentação de alertas ao usuário.

**Características**:
- Suporte para múltiplos tipos de alerta: success, error, warning, info
- Configuração visual específica para cada tipo (ícones e cores)
- Posicionamento flexível: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
- Animações de entrada e saída
- Fechamento automático configurável (tempo e ativação)
- Possibilidade de apresentar título e mensagem
- Suporte a ações (retry, ver detalhes)
- Exibição de detalhes técnicos expandíveis para depuração

**Dependências**:
- React, Hooks (useState, useEffect, useCallback)
- lucide-react para ícones (AlertCircle, Info, CheckCircle, XCircle, X, RefreshCw, ExternalLink)

**Parâmetros configuráveis**:
```javascript
{
  type = 'error',      // Tipo do alerta: 'success', 'error', 'warning', 'info'
  title,               // Título opcional do alerta
  message,             // Mensagem principal do alerta
  autoClose = true,    // Fechamento automático
  position = 'top-right', // Posição na tela
  duration = 5000,     // Duração em ms até fechamento automático
  onClose,             // Callback ao fechar
  onRetry,             // Callback para tentar novamente (opcional)
  hasDetails = false,  // Se deve exibir opção de detalhes
  errorDetails,        // Detalhes técnicos do erro (opcional)
  className = ''       // Classes CSS adicionais
}
```

#### 2.2. ErrorBoundary.js
**Responsabilidade**: Capturar erros durante a renderização dos componentes React filhos.

**Características**:
- Implementa o lifecycle de tratamento de erros do React
- Registra informações detalhadas do erro (incluindo contexto da aplicação)
- Suporta callback customizado para tratamento de erro (onError)
- Permite um componente fallback personalizado
- Implementa funcionalidade de reload da aplicação

**Fluxo de funcionamento**:
1. Inicializa com estado { hasError: false, error: null }
2. Quando ocorre erro em um filho, getDerivedStateFromError atualiza o estado
3. componentDidCatch captura detalhes e contexto adicional
4. Se fornecido, executa callback onError
5. Renderiza fallback customizado ou ErrorAlert se hasError=true

**Exemplo de uso**:
```jsx
<ErrorBoundary
  fallback={<ErrorAlert 
    type="error" 
    title="Erro na Renderização" 
    message="Ocorreu um erro ao renderizar este componente."
    autoClose={false}
  />}
  onError={(error, info) => {
    // Lógica customizada de tratamento
    reportErrorToAnalyticsService(error, info);
  }}
>
  <ComponenteComRiscoDeFalha />
</ErrorBoundary>
```

#### 2.3. ErrorBoundaryContext.js
**Responsabilidade**: Fornecer contexto de erro compartilhado entre componentes.

**Características**:
- Define um contexto React com:
  - setError: função para definir erro
  - error: objeto de erro atual
  - clearError: função para limpar erro atual

#### 2.4. ErrorBoundaryProvider.js
**Responsabilidade**: Gerenciar erros de forma centralizada com políticas de resiliência.

**Características**:
- Mantém estado de erro global e contador de tentativas de recuperação
- Implementa tratamento específico para erros de tipo INFINITE_LOOP
- Utiliza retryManager para tentar operações com falha usando backoff exponencial
- Captura erros não tratados a nível de window (error e unhandledrejection)
- Interage com sistema de logging (coreLogger)
- Limita número de retentativas para evitar loops infinitos

**Dependências**:
- React, Hooks (useState, useCallback, useEffect)
- Módulos do sistema de resiliência (retryManager)
- Sistema de logging (coreLogger)
- Constantes do sistema (LOG_LEVELS)

**Fluxo de tratamento de erros**:
1. Recebe erro via handleError ou de listeners globais
2. Para erros de tipo INFINITE_LOOP ou após exceder MAX_RETRY_COUNT:
   - Registra e define no estado (sem retry)
3. Para outros erros com função de recuperação:
   - Tenta executar a operação original com retentativas via retryManager
   - Em caso de sucesso, limpa o erro e reseta o contador
   - Em caso de falha persistente, incrementa o contador e define o erro no estado

#### 2.5. useErrorBoundary.js
**Responsabilidade**: Hook para acessar o sistema de erros em componentes funcionais.

**Características**:
- Acessa o contexto ErrorBoundaryContext
- Fornece acesso aos componentes ErrorBoundary e ErrorAlert
- Oferece função auxiliar captureError para tratar erros assíncronos
- Simplifica a integração de componentes funcionais com o sistema de erros

**Exemplo de uso**:
```jsx
function MeuComponente() {
  const { captureError, setError, ErrorAlert } = useErrorBoundary();
  
  const handleAsyncOperation = async () => {
    try {
      await captureError(
        () => apiClient.fetchData(), 
        { 
          serviceName: 'MeuComponente',
          retryOperation: () => apiClient.fetchData(),
          onError: (err) => console.warn('Falha na operação:', err)
        }
      );
    } catch (error) {
      // Tratamento específico adicional se necessário
    }
  };
  
  // Restante do componente
}
```

#### 2.6. ErrorDiagnostics.js
**Responsabilidade**: Ferramenta para diagnóstico e teste do sistema de erros em desenvolvimento.

**Características**:
- Permite simular diferentes tipos de erro (renderização, assíncrono, promessa, manual)
- Fornece interface para limpar erros ativos
- Exibe informações detalhadas sobre erros atuais
- Deve ser usado apenas em ambiente de desenvolvimento

#### 2.7. captureError (Função Utilitária)
**Responsabilidade**: Função auxiliar para capturar erros fora do ciclo de vida do React.

**Características**:
- Registra erros nos sistemas de logging e monitoramento
- Facilita a captura de erros em código não-React
- Permite passar contexto adicional para melhor diagnóstico

### 3. Fluxos de Tratamento de Erros

#### 3.1. Captura de Erros de Renderização

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│  Componente com   │ erro │ ErrorBoundary.get │ atualiza │   render()       │
│    erro de        │─────►│DerivedStateFrom   │─────────►│  com hasError    │
│   renderização    │      │     Error()       │      │     = true        │
│                   │      │                   │      │                   │
└───────────────────┘      └───────────────────┘      └────────┬──────────┘
                                      │                         │
                                      │                         │
                                      ▼                         ▼
                           ┌───────────────────┐      ┌───────────────────┐
                           │                   │      │                   │
                           │ componentDidCatch │      │    Renderiza      │
                           │    (registro)     │      │    fallback ou    │
                           │                   │      │    ErrorAlert     │
                           └───────────────────┘      │                   │
                                                      └───────────────────┘
```

#### 3.2. Tratamento com Retry via Provider

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│   Erro capturado  │─────►│   handleError     │─────►│    Verificar      │
│                   │      │                   │      │  tipo de erro     │
└───────────────────┘      └───────────────────┘      └────────┬──────────┘
                                                                │
                                                                ▼
                           ┌───────────────────┐      ┌───────────────────┐
                           │                   │ Sim  │                   │
                           │ Erro crítico ou   │─────►│ setErrorState     │
                           │ MAX_RETRY atingido│      │                   │
                           │                   │      └───────────────────┘
                           └────────┬──────────┘
                                    │ Não
                                    ▼
                           ┌───────────────────┐      ┌───────────────────┐
                           │                   │ Sim  │                   │
                           │   operation       │─────►│ retryWithBackoff  │
                           │   fornecida?      │      │                   │
                           │                   │      └────────┬──────────┘
                           └────────┬──────────┘               │
                                    │ Não                      │
                                    ▼                          ▼
                           ┌───────────────────┐      ┌───────────────────┐
                           │                   │      │                   │
                           │   setErrorState   │◄─────┤  Sucesso?         │
                           │                   │ Não  │                   │
                           └───────────────────┘      └────────┬──────────┘
                                                               │ Sim
                                                               ▼
                                                      ┌───────────────────┐
                                                      │                   │
                                                      │  clearError       │
                                                      │                   │
                                                      └───────────────────┘
```

#### 3.3. Captura de Erros Não Tratados

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│   Erro não        │─────►│  window listeners │─────►│   handleError     │
│    tratado        │      │ error/unhandled   │      │                   │
│                   │      │   rejection       │      │                   │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

#### 3.4. Uso do Hook useErrorBoundary

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│                   │      │                   │      │                   │
│  Componente       │─────►│ useErrorBoundary  │─────►│  captureError     │
│  Funcional        │      │                   │      │                   │
│                   │      └───────────────────┘      └────────┬──────────┘
└───────────────────┘                                          │
                                                               ▼
                                                      ┌───────────────────┐
                                                      │                   │
                                                      │   try/catch       │
                                                      │                   │
                                                      └────────┬──────────┘
                                                               │
                                                               ▼
                                                      ┌───────────────────┐
                                                      │                   │
                                                      │  setError         │
                                                      │                   │
                                                      └───────────────────┘
```

### 4. Interações com outros Sistemas

#### 4.1. Sistema de Logging
- ErrorBoundary envia informações detalhadas de erro para coreLogger
- ErrorBoundaryProvider registra eventos de erro, tentativas de recuperação e resultados
- Existe integração bidirecional:
  1. O sistema de erros envia eventos para o logger
  2. O logger pode acionar o sistema de erros em caso de falhas críticas

#### 4.2. Sistema de Resiliência
- ErrorBoundaryProvider utiliza retryManager.retryWithBackoff para implementar políticas de retry
- Tratamento especial para erros do tipo ResilienceError.INFINITE_LOOP
- O contador de retentativas previne loops infinitos de recuperação
- Integração com backoff exponencial para tentativas espaçadas

#### 4.3. Navegação/UI
- ErrorAlert fornece feedback visual aos usuários
- Suporte para diferentes posições na tela e tipos de alerta
- Animações de entrada e saída para melhor UX
- Opções para exibir detalhes técnicos (apenas em desenvolvimento)

#### 4.4. Sistema de Inicialização
- ErrorBoundary é posicionado nos níveis superiores da hierarquia de componentes
- Captura erros durante a inicialização da aplicação
- Função displayCriticalError em index.js fornece fallback para erros pré-React

### 5. Correções e Melhorias Implementadas

#### 5.1. Correção da Interface Entre ErrorBoundary e ErrorAlert
- Adaptação da interface do ErrorBoundary para passar parâmetros corretos ao ErrorAlert
- Padronização das propriedades em todo o sistema

#### 5.2. Implementação Completa do Hook useErrorBoundary
- Adição de função auxiliar captureError para operações assíncronas
- Exposição consistente de componentes e funcionalidades

#### 5.3. Adição do ErrorDiagnostics
- Novo componente para facilitar o teste e diagnóstico do sistema de erros
- Interface visual para simular diferentes tipos de erro
- Visibilidade apenas em ambiente de desenvolvimento

#### 5.4. Melhoria da UX no ErrorAlert
- Adição de botões de ação (retry, ver detalhes)
- Suporte para exibição de detalhes técnicos expandíveis
- Melhoria na acessibilidade e feedback visual

#### 5.5. Limite de Retentativas no ErrorBoundaryProvider
- Implementação de contador de retentativas
- Prevenção de loops infinitos de recuperação
- Log detalhado do processo de recuperação

### 6. Casos de Uso e Exemplos

#### 6.1. Captura de Erros de Renderização
```jsx
// Na raiz da aplicação
<ErrorBoundaryProvider>
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
</ErrorBoundaryProvider>

// Em componentes específicos com maior risco
function ComponenteComplexa() {
  return (
    <ErrorBoundary 
      fallback={<ErrorAlert 
        type="error" 
        title="Erro na Visualização" 
        message="Ocorreu um erro ao renderizar este módulo." 
      />}
    >
      <ConteudoComplexa />
    </ErrorBoundary>
  );
}
```

#### 6.2. Captura de Erros Assíncronos em Componentes Funcionais
```jsx
function ListaDados() {
  const { captureError } = useErrorBoundary();
  const [dados, setDados] = useState([]);
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resultado = await captureError(
          () => apiClient.fetchData(),
          {
            serviceName: 'ListaDados',
            retryOperation: () => apiClient.fetchData()
          }
        );
        setDados(resultado);
      } catch (error) {
        setDados([]);
      }
    };
    
    carregarDados();
  }, [captureError]);
  
  return (/* renderização */);
}
```

#### 6.3. Tratamento Manual de Erros com Feedback Visual
```jsx
function FormularioEnvio() {
  const { ErrorAlert, setError, clearError, error } = useErrorBoundary();
  const [enviando, setEnviando] = useState(false);
  
  const handleSubmit = async (values) => {
    setEnviando(true);
    try {
      await apiClient.enviarDados(values);
      // Sucesso...
    } catch (error) {
      setError(error, {
        serviceName: 'FormularioEnvio',
        retryOperation: () => apiClient.enviarDados(values)
      });
    } finally {
      setEnviando(false);
    }
  };
  
  return (
    <div>
      {error && (
        <ErrorAlert
          type="error"
          title="Erro ao Enviar"
          message={error.message}
          onRetry={() => handleSubmit(formValues)}
          onClose={clearError}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        {/* formulário */}
      </form>
    </div>
  );
}
```

#### 6.4. Diagnóstico em Desenvolvimento
```jsx
// Apenas em desenvolvimento
function App() {
  return (
    <>
      {/* Aplicação normal */}
      <MainApp />
      
      {/* Componente de diagnóstico em ambiente dev */}
      {process.env.NODE_ENV === 'development' && (
        <ErrorDiagnostics initiallyOpen={false} />
      )}
    </>
  );
}
```

### 7. Considerações de Segurança e Performance

#### 7.1. Segurança
- Sanitização de informações sensíveis nos logs de erro
  ```javascript
  // Exemplo de sanitização antes de log
  const sanitizedData = {
    ...errorData,
    auth: errorData.auth ? { isAuthenticated: !!errorData.auth.token } : null,
    user: errorData.user ? { hasUser: !!errorData.user } : null
  };
  coreLogger.logServiceError('Service', error, sanitizedData);
  ```

- Exibição de detalhes técnicos apenas em modo de desenvolvimento
  ```javascript
  const shouldShowDetails = process.env.NODE_ENV !== 'production';
  
  return (
    <ErrorAlert
      // ...
      hasDetails={shouldShowDetails}
      errorDetails={shouldShowDetails ? error.stack : null}
    />
  );
  ```

- Prevenção de exposição de detalhes de implementação em mensagens de erro para usuários finais
  ```javascript
  // Em produção, mensagens genéricas
  const userFriendlyMessage = process.env.NODE_ENV === 'production'
    ? 'Ocorreu um erro ao processar sua solicitação'
    : error.message;
  ```

#### 7.2. Performance
- Uso criterioso de ErrorBoundaries para evitar re-renderizações desnecessárias
  ```jsx
  // Preferir:
  <ErrorBoundary>
    <ComponenteGrande>
      <MuitosSubComponentes />
    </ComponenteGrande>
  </ErrorBoundary>
  
  // Evitar (a menos que necessário):
  <ComponenteGrande>
    {muitosItens.map(item => (
      <ErrorBoundary key={item.id}>
        <SubComponente item={item} />
      </ErrorBoundary>
    ))}
  </ComponenteGrande>
  ```

- Limitação de retentativas automáticas para evitar sobrecarga
  ```javascript
  // No ErrorBoundaryProvider
  const MAX_RETRY_COUNT = 3; // Limite razoável
  ```

- Cleanup adequado de listeners para evitar memory leaks
  ```javascript
  useEffect(() => {
    window.addEventListener('error', globalErrorListener);
    window.addEventListener('unhandledrejection', globalErrorListener);
    
    return () => {
      window.removeEventListener('error', globalErrorListener);
      window.removeEventListener('unhandledrejection', globalErrorListener);
    };
  }, [globalErrorListener]);
  ```

### 8. Testes e Depuração

#### 8.1. Testes Automatizados
```javascript
// Exemplo de teste para ErrorBoundary
test('ErrorBoundary captura erros e renderiza fallback', () => {
  const ErrorComponent = () => {
    throw new Error('Erro de teste');
    return null;
  };
  
  const wrapper = mount(
    <ErrorBoundary fallback={<div data-testid="error-fallback">Erro</div>}>
      <ErrorComponent />
    </ErrorBoundary>
  );
  
  expect(wrapper.find('[data-testid="error-fallback"]')).toExist();
});

// Exemplo de teste para useErrorBoundary
test('useErrorBoundary.captureError captura e processa erros', async () => {
  const TestComponent = () => {
    const { captureError } = useErrorBoundary();
    const [error, setErrorState] = useState(null);
    
    const triggerError = async () => {
      try {
        await captureError(() => Promise.reject(new Error('Erro de teste')));
      } catch (err) {
        setErrorState(err);
      }
    };
    
    return (
      <div>
        <button onClick={triggerError}>Trigger</button>
        {error && <div data-testid="error-caught">{error.message}</div>}
      </div>
    );
  };
  
  const wrapper = mount(
    <ErrorBoundaryProvider>
      <TestComponent />
    </ErrorBoundaryProvider>
  );
  
  wrapper.find('button').simulate('click');
  await waitFor(() => {
    expect(wrapper.find('[data-testid="error-caught"]')).toExist();
  });
});
```

#### 8.2. Depuração
Para facilitar a depuração de problemas no sistema de erro:

1. Use o componente ErrorDiagnostics em ambiente de desenvolvimento
2. Ative logs detalhados com:
   ```javascript
   localStorage.setItem('debug', 'error:*');
   ```
3. Acompanhe eventos do sistema de erro no console com:
   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     window.__ERROR_SYSTEM_DEBUG__ = {
       subscribe: (callback) => {
         const handler = (event) => {
           if (event.detail?.type?.startsWith('error:')) {
             callback(event.detail);
           }
         };
         window.addEventListener('app-event', handler);
         return () => window.removeEventListener('app-event', handler);
       }
     };
     
     // Uso:
     const unsubscribe = window.__ERROR_SYSTEM_DEBUG__.subscribe(console.log);
   }
   ```

### 9. Evolução Futura

#### 9.1. Integração com Serviços de Monitoramento
- Implementar provedores para serviços como Sentry, LogRocket ou Datadog
- Centralizar a captura e análise de erros em produção

#### 9.2. Categorização Avançada de Erros
- Implementar sistema de categorização de erros por domínio, severidade e ação necessária
- Permitir tratamentos específicos por categoria

#### 9.3. Recuperação Avançada
- Desenvolver estratégias de recuperação mais sofisticadas
- Implementar recuperação guiada pelo usuário para erros não recuperáveis automaticamente

#### 9.4. Framework de Testes
- Criar utilitários para testar sistematicamente o tratamento de erro em vários cenários
- Simular condições de falha de rede, timeout e outros erros comuns

---

Esta documentação reflete a implementação atual do sistema de tratamento de erros da aplicação, incluindo as melhorias recentes implementadas. É recomendada a revisão periódica à medida que o sistema evolui.

Última atualização: 7 de março de 2025