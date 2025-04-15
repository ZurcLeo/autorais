## Documentação da Rota `/src/core/states/`

Este diretório contém o gerenciamento de estado centralizado para o aplicativo, fornecendo uma solução robusta para lidar com o status dos serviços e suas dependências.

**Componentes principais:**

* **`CoreStateManager.js`:**
    * Define o provedor de estado principal (`CoreStateProvider`) e o hook (`useCoreState`) para acessar e interagir com o estado centralizado.
    * Gerencia o estado dos serviços, incluindo status (inicializando, pronto, erro, etc.) e dependências entre serviços.
    * Permite despachar ações para atualizar o estado dos serviços.
* **`index.js`:**
    * Exporta as funcionalidades do `CoreStateManager`.
    * Define constantes para status de serviço (`ServiceStatus`), tipos de ações (`StateActions`) e funções auxiliares para criar ações e verificar o status dos serviços.

**Fluxos de trabalho:**

1. **Inicialização do serviço:**
    * Quando um serviço é inicializado, seu status é definido como `initializing`.
    * O `CoreStateManager` verifica as dependências do serviço.
    * Se todas as dependências estiverem prontas, o serviço é iniciado.
    * Após a inicialização bem-sucedida, o status do serviço é atualizado para `ready`.
    * Se ocorrer um erro durante a inicialização, o status é definido como `error` ou `failed`.
2. **Monitoramento do status do serviço:**
    * O `CoreStateManager` monitora continuamente o status dos serviços.
    * Se um serviço falhar ou for bloqueado, o estado é atualizado e as dependências afetadas são notificadas.
3. **Acesso ao estado e despacho de ações:**
    * Os componentes podem acessar o estado centralizado usando o hook `useCoreState`.
    * As ações podem ser despachadas para atualizar o estado dos serviços, como `SERVICE_INIT`, `SERVICE_READY` e `SERVICE_ERROR`.

**Observações:**

* O gerenciamento de estado centralizado garante que os serviços sejam inicializados na ordem correta, dependendo de suas dependências.
* O monitoramento contínuo do status do serviço permite que o aplicativo responda a falhas e bloqueios de maneira eficaz.
* As funções auxiliares fornecidas facilitam a criação de ações e verificação do status do serviço.

**Exemplo de uso:**

```javascript
import { useCoreState, StateActions, createStateAction } from './src/core/states';

function MyComponent() {
  const coreState = useCoreState();
  const { services } = coreState;

  // Verificar se o serviço 'authService' está pronto
  const isAuthReady = services.authService.status === 'ready';

  // Despachar uma ação para atualizar o status do serviço 'paymentService'
  const dispatch = useCoreDispatch();
  dispatch(createStateAction(StateActions.SERVICE_READY, { serviceName: 'paymentService' }));

  return (
    <div>
      {isAuthReady ? <p>Serviço de autenticação pronto!</p> : <p>Autenticando...</p>}
    </div>
  );
}
```

Este exemplo demonstra como acessar o estado do serviço e despachar ações usando o `CoreStateManager`.

Lembre-se de consultar o código-fonte para obter detalhes completos sobre a implementação e uso do gerenciamento de estado centralizado.