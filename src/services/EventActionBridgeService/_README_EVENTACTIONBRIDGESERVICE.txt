Manual de Instruções Técnicas para o Componente EventActionBridgeService

Este manual detalha o uso do componente EventActionBridgeService, responsável por criar uma ponte entre os eventos emitidos pelo ServiceEventHub e as ações despachadas para a store do Redux.

1. Propósito
O EventActionBridgeService atua como um middleware, permitindo que eventos que ocorrem em diferentes partes da aplicação (e são comunicados através do ServiceEventHub) disparem ações específicas no Redux store. Isso facilita a atualização do estado da aplicação em resposta a eventos do sistema, mantendo os componentes da interface do usuário e outras partes da aplicação sincronizados com o estado mais recente.

2. Instanciação
Assim como o ServiceEventHub, o EventActionBridgeService é implementado como um singleton. Para obter a instância única deste serviço, utilize a constante exportada eventActionBridgeService:

JavaScript

import { eventActionBridgeService } from './index';

const eventBridge = eventActionBridgeService;
3. Métodos
3.1. Métodos Herdados de BaseService
O EventActionBridgeService herda os métodos de ciclo de vida (start, stop, healthCheck) e outros utilitários da classe BaseService. Consulte o manual do BaseService para obter detalhes sobre esses métodos.

3.2. setStore(store)
Este método é utilizado para injetar a instância da store do Redux no EventActionBridgeService. É crucial chamar este método antes de registrar qualquer mapeamento, pois sem a store, as ações não poderão ser despachadas.

Parâmetros:

store (Object): A instância da store do Redux. Este objeto deve ter uma função dispatch.
Retorno:

(boolean): Retorna true se a store foi definida com sucesso, false caso contrário (por exemplo, se a store fornecida for inválida).
Exemplo de Uso:

JavaScript

import { eventActionBridgeService } from './index';
import { storeService } from '../StoreService'; // Assumindo que StoreService exporta a store

storeService.initialize().then(() => {
  const store = storeService.getStore();
  eventActionBridgeService.setStore(store);
});
3.3. registerMapping(serviceName, eventType, actionType, transformer = data => data)
Este método registra um mapeamento entre um evento específico emitido por um serviço e uma ação do Redux.

Parâmetros:

serviceName (string): O nome do serviço que emite o evento a ser mapeado.
eventType (string): O tipo do evento a ser mapeado.
actionType (string): O tipo da ação do Redux que será despachada quando o evento ocorrer.
transformer (Function, opcional): Uma função que recebe os dados do evento como entrada e retorna os dados transformados que serão incluídos no payload da ação do Redux. Por padrão, retorna os dados originais do evento sem modificação.
Retorno:

(string | null): Retorna o ID único do mapeamento registrado (formato: ${serviceName}:${eventType}->${actionType}), ou null se o registro falhar devido a parâmetros inválidos.
Exemplo de Uso:

JavaScript

import { eventActionBridgeService } from './index';

eventActionBridgeService.registerMapping(
  'UserService',
  'USER_LOGGED_IN',
  'AUTH_LOGIN_SUCCESS',
  (userData) => ({ userId: userData.id, token: userData.authToken })
);

eventActionBridgeService.registerMapping(
  'OrderService',
  'ORDER_CREATED',
  'NEW_ORDER_NOTIFICATION'
);
3.4. registerMappings(mappingsArray)
Este método permite registrar múltiplos mapeamentos de uma vez, recebendo um array de objetos de configuração de mapeamento.

Parâmetros:

mappingsArray (Array<Object>): Um array de objetos, onde cada objeto deve conter as propriedades: serviceName, eventType, actionType, e opcionalmente transformer.
Retorno:

(number): O número de mapeamentos registrados com sucesso.
Exemplo de Uso:

JavaScript

import { eventActionBridgeService } from './index';

const mappings = [
  { serviceName: 'ProductService', eventType: 'PRODUCT_UPDATED', actionType: 'UPDATE_PRODUCT_INFO' },
  { serviceName: 'CartService', eventType: 'ITEM_ADDED', actionType: 'ADD_CART_ITEM' },
  { serviceName: 'PaymentService', eventType: 'PAYMENT_SUCCESSFUL', actionType: 'PROCESS_PAYMENT_SUCCESS' },
];

const registeredCount = eventActionBridgeService.registerMappings(mappings);
console.log(`${registeredCount} mapeamentos registrados.`);
3.5. unregisterMapping(mappingId)
Este método remove um mapeamento previamente registrado, identificado pelo seu ID.

Parâmetros:

mappingId (string): O ID do mapeamento a ser removido (o mesmo ID retornado por registerMapping).
Retorno:

(boolean): Retorna true se o mapeamento foi removido com sucesso, false se o mapeamento não foi encontrado.
Exemplo de Uso:

JavaScript

import { eventActionBridgeService } from './index';

const mappingId = eventActionBridgeService.registerMapping('ChatService', 'NEW_MESSAGE', 'RECEIVE_MESSAGE');
// ... algum tempo depois ...
eventActionBridgeService.unregisterMapping(mappingId);
3.6. debugMappings()
Este método é fornecido para fins de depuração e exibe informações sobre os mapeamentos registrados e as subscriptions ativas no console.

Retorno:

(Object): Um objeto contendo informações de diagnóstico, incluindo a contagem de mapeamentos registrados, subscriptions ativas, disponibilidade da store e status de inicialização do serviço.
Exemplo de Uso:

JavaScript

import { eventActionBridgeService } from './index';

eventActionBridgeService.debugMappings();
3.7. exportDebugTools()
Este método exporta um conjunto de ferramentas de diagnóstico para o objeto global window (apenas em ambientes de desenvolvimento). Essas ferramentas permitem inspecionar o sistema de eventos e testar a emissão de eventos diretamente do console do navegador.

Retorno:

(Object | null): Retorna um objeto contendo as ferramentas de diagnóstico em ambientes de desenvolvimento, ou null em produção. As ferramentas incluem:
debugEventSystem(): Exibe informações sobre o ServiceEventHub e o EventActionBridgeService.
testEventEmission(serviceName, eventType, data): Emite um evento de teste através do ServiceEventHub.
listTracedEvents(): Lista os eventos rastreados (se o rastreamento estiver ativo).
Exemplo de Uso (no console do navegador em ambiente de desenvolvimento):

JavaScript

window.eventDiagnostics.debugEventSystem();
window.eventDiagnostics.testEventEmission('MyService', 'MY_EVENT', { message: 'Hello from console!' });
window.eventDiagnostics.listTracedEvents();
4. Interação com Outros Componentes
ServiceEventHub: O EventActionBridgeService se inscreve no ServiceEventHub para escutar eventos específicos de determinados serviços. Quando um evento correspondente a um mapeamento registrado é emitido, o EventActionBridgeService captura esse evento.
Redux Store: Após capturar um evento, o EventActionBridgeService utiliza a função transformer (se fornecida) para processar os dados do evento e, em seguida, despacha uma ação do Redux com o tipo e payload configurados no mapeamento.
5. Fluxo de Operação Típico
O StoreService é inicializado e cria a store do Redux.
O StoreService injeta a store no EventActionBridgeService chamando eventActionBridgeService.setStore(store).
Em diferentes partes da aplicação, os serviços (ou outros componentes) utilizam eventActionBridgeService.registerMapping() ou eventActionBridgeService.registerMappings() para definir quais eventos devem ser mapeados para quais ações do Redux.
Quando um serviço emite um evento através de serviceEventHub.emit(), o EventActionBridgeService verifica se existe algum mapeamento registrado para esse serviceName e eventType.
Se um mapeamento for encontrado, a função transformer (se definida) é aplicada aos dados do evento.
Uma ação do Redux com o actionType especificado e os dados (transformados ou originais) é despachada para a store.
Os reducers do Redux processam a ação e atualizam o estado da aplicação conforme necessário.
6. Considerações e Boas Práticas
Certifique-se de que a store do Redux seja injetada no EventActionBridgeService o mais cedo possível no ciclo de vida da aplicação.
Utilize a função transformer para adaptar os dados do evento ao formato esperado pelo payload da ação do Redux.
Mantenha os mapeamentos claros e bem definidos para facilitar a compreensão do fluxo de dados na aplicação.
Use os métodos de debug (debugMappings, exportDebugTools) para auxiliar na identificação e resolução de problemas relacionados ao mapeamento de eventos para ações.
Evite criar mapeamentos excessivamente complexos. Se a lógica de transformação for muito elaborada, considere movê-la para um serviço dedicado ou para a própria action creator do Redux.
Ao remover um mapeamento com unregisterMapping, certifique-se de que não há mais dependências nesse mapeamento em outras partes da aplicação.
Este manual fornece as informações necessárias para utilizar e entender o componente EventActionBridgeService. Ao integrar este serviço na sua arquitetura, você poderá criar um sistema de comunicação reativo e eficiente entre diferentes partes da sua aplicação.