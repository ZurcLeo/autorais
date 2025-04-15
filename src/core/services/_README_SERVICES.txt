Manual de Instruções Técnicas para ServiceEventHub e BaseService
Este manual fornece instruções técnicas detalhadas para o uso dos componentes ServiceEventHub e BaseService apresentados no código fonte. Estes componentes são cruciais para a arquitetura de microsserviços, facilitando a comunicação entre serviços e fornecendo uma base robusta para a criação de serviços individuais.

1. ServiceEventHub
O ServiceEventHub é um sistema de eventos centralizado, implementado como um singleton, para permitir a comunicação assíncrona entre diferentes serviços dentro da aplicação. Ele utiliza o padrão de observador (Observer) para permitir que os serviços publiquem e se inscrevam em eventos sem acoplamento direto.

Propósito:

Facilitar a comunicação desacoplada entre serviços.
Permitir que múltiplos serviços reajam ao mesmo evento.
Centralizar o gerenciamento de eventos para melhor rastreamento e depuração.
Instanciação:

O ServiceEventHub é implementado como um singleton, o que significa que haverá apenas uma instância desta classe em toda a aplicação. Para obter a instância do ServiceEventHub, utilize a constante exportada serviceEventHub:

JavaScript

import { serviceEventHub } from './BaseService';

// Obtém a instância do ServiceEventHub
const eventHub = serviceEventHub;
Métodos:

on(serviceName, eventType, callback)
Registra um listener (função de callback) para um evento específico emitido por um serviço com o nome fornecido.

Parâmetros:

serviceName (string): O nome do serviço que emitirá o evento.
eventType (string): O tipo do evento ao qual o listener deve responder.
callback (Function): A função que será executada quando o evento for emitido. Esta função receberá um objeto contendo os dados do evento.
Retorno:

(Function): Uma função que, quando chamada, cancela a inscrição do listener.
Exemplo de Uso:

JavaScript

import { serviceEventHub } from './BaseService';

const unsubscribe = serviceEventHub.on('UserService', 'USER_CREATED', (eventData) => {
  console.log('Novo usuário criado:', eventData);
});

// Para cancelar a inscrição posteriormente:
// unsubscribe();
onAny(eventType, callback)
Registra um listener para um tipo de evento específico, independentemente do serviço que o emitiu.

Parâmetros:

eventType (string): O tipo do evento ao qual o listener deve responder.
callback (Function): A função que será executada quando o evento do tipo especificado for emitido por qualquer serviço. Esta função receberá o nome do serviço emissor, o tipo do evento e os dados do evento.
Retorno:

(Function): Uma função que, quando chamada, cancela a inscrição do listener global.
Exemplo de Uso:

JavaScript

import { serviceEventHub } from './BaseService';

const unsubscribeGlobal = serviceEventHub.onAny('USER_UPDATED', (serviceName, eventType, eventData) => {
  console.log(`Evento ${eventType} recebido de ${serviceName}:`, eventData);
});

// Para cancelar a inscrição global posteriormente:
// unsubscribeGlobal();
emit(serviceName, eventType, data = {})
Emite um evento para todos os listeners inscritos para o serviço e tipo de evento especificados, bem como para quaisquer listeners globais registrados para o tipo de evento.

Parâmetros:

serviceName (string): O nome do serviço que está emitindo o evento.
eventType (string): O tipo do evento que está sendo emitido.
data (Object, opcional): Um objeto contendo os dados a serem passados para os listeners. Por padrão, é um objeto vazio.
Exemplo de Uso:

JavaScript

import { serviceEventHub } from './BaseService';

serviceEventHub.emit('UserService', 'USER_CREATED', { userId: 123, username: 'john.doe' });
serviceEventHub.emit('OrderService', 'ORDER_PLACED', { orderId: 456, total: 99.99 });
Informações Adicionais sobre emit:

O método adiciona automaticamente metadados ao objeto de dados do evento, incluindo um traceId único para rastreamento, o serviceName e o timestamp da emissão.
Ele também armazena o evento em um buffer interno (eventBuffer) com um limite de 1000 eventos, útil para depuração e auditoria.
Se a variável global window._eventTracing existir (para fins de rastreamento), o evento também será adicionado a ela.
getBufferedEvents()
Retorna uma cópia do buffer de eventos armazenados no ServiceEventHub.

Retorno:

(Array): Um array de objetos, onde cada objeto representa um evento emitido recentemente.
Exemplo de Uso:

JavaScript

import { serviceEventHub } from './BaseService';

const bufferedEvents = serviceEventHub.getBufferedEvents();
console.log('Eventos em buffer:', bufferedEvents);
off(serviceName, eventType, callback)
Desregistra um listener específico para um evento específico de um serviço.

Parâmetros:

serviceName (string): O nome do serviço do qual o listener estava escutando.
eventType (string): O tipo do evento para o qual o listener estava registrado.
callback (Function): A função callback que foi originalmente registrada.
Exemplo de Uso:

JavaScript

import { serviceEventHub } from './BaseService';

const myCallback = (eventData) => {
  console.log('Este log será removido.');
};

serviceEventHub.on('UserService', 'USER_DELETED', myCallback);

// Para desregistrar o listener:
serviceEventHub.off('UserService', 'USER_DELETED', myCallback);
offAny(eventType, callback)
Desregistra um listener global específico para um tipo de evento.

Parâmetros:

eventType (string): O tipo do evento para o qual o listener global estava registrado.
callback (Function): A função callback que foi originalmente registrada como listener global.
Exemplo de Uso:

JavaScript

import { serviceEventHub } from './BaseService';

const myGlobalCallback = (serviceName, eventType, eventData) => {
  console.log('Este log global será removido.');
};

serviceEventHub.onAny('USER_AUTHENTICATED', myGlobalCallback);

// Para desregistrar o listener global:
serviceEventHub.offAny('USER_AUTHENTICATED', myGlobalCallback);
2. BaseService
A classe BaseService é uma classe abstrata que fornece funcionalidades comuns para todos os serviços da aplicação. Ela inclui gerenciamento de ciclo de vida (start, stop), health checks, retentativas, registro de listeners de eventos e logging.

Propósito:

Fornecer uma estrutura consistente para a criação de serviços.
Abstrair a lógica comum, como inicialização, shutdown e health checks.
Integrar-se com o ServiceEventHub para comunicação de eventos.
Implementar resiliência através do RetryManager.
Instanciação:

A classe BaseService é abstrata e não deve ser instanciada diretamente. Em vez disso, você deve criar classes que herdam de BaseService e implementam os métodos abstratos.

Exemplo de Criação de um Serviço:

JavaScript

import { BaseService, serviceEventHub } from './BaseService';

class MyCustomService extends BaseService {
  constructor() {
    super('MyCustomService'); // O nome do serviço é obrigatório
    this.data = null;
  }

  async initialize() {
    console.log('MyCustomService inicializando...');
    // Lógica de inicialização específica do serviço
    this.data = await this._fetchInitialData();
    console.log('MyCustomService inicializado com dados:', this.data);
  }

  async shutdown() {
    console.log('MyCustomService encerrando...');
    // Lógica de shutdown específica do serviço (opcional)
    this.data = null;
  }

  async healthCheck() {
    // Lógica de health check específica do serviço
    if (this.data) {
      return { status: 'UP', details: { dataSize: Object.keys(this.data).length } };
    } else {
      return { status: 'DOWN', details: { message: 'Dados não carregados' } };
    }
  }

  async _fetchInitialData() {
    // Simulação de busca de dados
    return new Promise(resolve => setTimeout(() => resolve({ key: 'value' }), 1000));
  }

  // Exemplo de uso do ServiceEventHub dentro do serviço
  startProcessing() {
    this._startLoading();
    setTimeout(() => {
      this._emitEvent('PROCESSING_COMPLETED', { result: 'success' });
      this._stopLoading();
    }, 2000);
  }

  handleUserCreatedEvent = (eventData) => {
    console.log('MyCustomService recebeu evento USER_CREATED:', eventData);
    // Lógica para lidar com o evento de criação de usuário
  };

  // Exemplo de registro de listener no construtor ou no método initialize
  async initialize() {
    await super.initialize(); // Chama a inicialização da classe pai

    this._userCreatedUnsubscribe = this._onServiceEvent('UserService', 'USER_CREATED', this.handleUserCreatedEvent);
  }

  async stop() {
    if (this._userCreatedUnsubscribe) {
      this._userCreatedUnsubscribe(); // Cancela a inscrição do listener ao parar o serviço
    }
    await super.stop(); // Chama o método stop da classe pai
  }
}

// Instanciação do serviço
const myService = new MyCustomService();

// Iniciar o serviço
myService.start().then(() => {
  myService.startProcessing();
});

// Para parar o serviço
// myService.stop();
Construtor:

O construtor de BaseService recebe um serviceName como argumento, que é obrigatório e deve ser único para cada serviço. Ele também inicializa metadados do serviço a partir de SERVICE_METADATA, configura um logger, verifica se o serviço já foi inicializado e valida a implementação dos métodos obrigatórios.

Propriedades:

_serviceName (string): O nome do serviço.
_metadata (Object): Metadados do serviço definidos em SERVICE_METADATA.
_isInitialized (boolean): Indica se o serviço foi inicializado com sucesso.
_healthCheckInterval (number | null): O ID do intervalo para health checks.
_loadingCount (number): Contador para rastrear operações de carregamento em andamento.
_registeredListeners (Array<Function>): Array para armazenar as funções de unsubscribe dos listeners de eventos registrados.
Métodos Públicos:

async start()
Inicia o serviço. Este método executa as seguintes etapas:

Emite um evento SERVICE_STARTING.
Valida as dependências do serviço.
Chama o método initialize() (com retentativas em caso de falha).
Inicia o health check periódico.
Emite um evento SERVICE_READY.
Retorno:

(Promise<boolean>): Uma Promise que resolve para true se o serviço for iniciado com sucesso, ou rejeita com um erro em caso de falha.
async stop()
Para o serviço. Este método executa as seguintes etapas:

Emite um evento SERVICE_STOPPING.
Para o health check periódico.
Chama o método shutdown().
Define _isInitialized para false.
Desregistra todos os listeners de eventos registrados.
Emite um evento SERVICE_STOPPED.
Retorno:

(Promise<void>): Uma Promise que resolve quando o serviço é parado com sucesso, ou rejeita com um erro em caso de falha.
Métodos Abstratos (a serem implementados nas classes filhas):

async initialize()
Este método deve conter a lógica de inicialização específica do serviço. Ele é chamado pelo método start() e pode incluir tarefas como conectar-se a bancos de dados, carregar configurações iniciais, etc.

async shutdown()
Este método (opcional) deve conter a lógica de encerramento específica do serviço, como liberar recursos, desconectar de sistemas externos, etc.

async healthCheck()
Este método deve retornar um objeto que descreve a saúde do serviço. Geralmente, ele retorna um status ('UP' ou 'DOWN') e detalhes adicionais sobre o estado do serviço.

Métodos Protegidos (para uso nas classes filhas):

_startLoading()
Incrementa o contador de carregamento do serviço e emite um evento LOADING_STARTED.

_stopLoading()
Decrementa o contador de carregamento do serviço e, se o contador chegar a zero, emite um evento LOADING_FINISHED.

_emitEvent(eventType, data = {})
Emite um evento específico do serviço usando o ServiceEventHub. O eventType é automaticamente prefixado com o nome do serviço.

Parâmetros:

eventType (string): O tipo do evento a ser emitido.
data (Object, opcional): Os dados a serem incluídos no evento.
_onServiceEvent(serviceName, eventType, callback)
Registra um listener para um evento específico de outro serviço usando o ServiceEventHub. A função de unsubscribe é armazenada internamente para ser chamada durante o stop() do serviço.

Parâmetros:

serviceName (string): O nome do serviço a ser observado.
eventType (string): O tipo do evento a ser escutado.
callback (Function): A função a ser executada quando o evento ocorrer.
Retorno:

(Function): Uma função para cancelar a inscrição do listener.
_onAnyServiceEvent(eventType, callback)
Registra um listener global para um tipo de evento específico usando o ServiceEventHub. A função de unsubscribe é armazenada internamente.

Parâmetros:

eventType (string): O tipo do evento global a ser escutado.
callback (Function): A função a ser executada quando o evento ocorrer.
Retorno:

(Function): Uma função para cancelar a inscrição do listener global.
_unregisterAllListeners()
Cancela o registro de todos os listeners de eventos que foram registrados usando _onServiceEvent e _onAnyServiceEvent. Este método é chamado durante o stop() do serviço.

async _executeWithRetry(operation, context)
Executa uma operação assíncrona com retentativas usando o RetryManager.

Parâmetros:

operation (Function): A função assíncrona a ser executada.
context (string): Uma string que descreve o contexto da operação para fins de logging.
Retorno:

(Promise<any>): Uma Promise que resolve com o resultado da operação se for bem-sucedida dentro do número máximo de tentativas, ou rejeita com o último erro.
Métodos Privados (para uso interno da classe BaseService):

async _initializeWithRetry(): Chama o método initialize() com retentativas.
async _validateDependencies(): Valida se as dependências do serviço estão prontas usando o ServiceInitializer.
_validateImplementation(): Verifica se a classe filha implementou os métodos obrigatórios (initialize e healthCheck).
_startHealthCheck(): Inicia o intervalo para executar o método healthCheck() periodicamente.
_stopHealthCheck(): Limpa o intervalo de health check.
_log(state, metadata = {}): Registra um log de estado do serviço.
_logError(error, context, duration = null): Registra um erro específico do serviço.
_logPerformance(operation, duration, metadata = {}): Registra informações de performance de uma operação.
_logEnv(): Retorna o ambiente da aplicação (a partir de process.env.NODE_ENV).
Getters Públicos:

isInitialized: Retorna um booleano indicando se o serviço foi inicializado.
metadata: Retorna o objeto de metadados do serviço.
serviceName: Retorna o nome do serviço.
3. Fluxo de Uso Típico
Defina os metadados do serviço: No arquivo metadataReducer.js, configure os metadados para o seu serviço, incluindo seu nome e quaisquer dependências.
Crie uma classe de serviço: Estenda a classe BaseService e implemente os métodos abstratos initialize() e healthCheck(). Implemente shutdown() se necessário.
Registre listeners de eventos (opcional): No método initialize() ou no construtor do seu serviço, utilize os métodos _onServiceEvent() ou _onAnyServiceEvent() para se inscrever em eventos de outros serviços ou em eventos globais.
Emita eventos (opcional): Utilize o método _emitEvent() para notificar outros serviços sobre eventos que ocorrem no seu serviço.
Inicie e pare o serviço: Utilize os métodos start() e stop() para gerenciar o ciclo de vida do seu serviço. O método start() cuidará da inicialização, validação de dependências e início do health check. O método stop() cuidará do shutdown e da limpeza de recursos.
4. Melhores Práticas e Considerações
Nomes de eventos: Utilize uma convenção de nomenclatura clara e consistente para os eventos (ex: SERVICE_NAME:EVENT_TYPE).
Dados do evento: Mantenha os dados do evento o mais simples e relevantes possível.
Tratamento de erros: Implemente um tratamento de erros robusto nos seus listeners de eventos.
Desacoplamento: O ServiceEventHub ajuda a desacoplar os serviços. Evite depender de conhecimento interno de outros serviços e comunique-se principalmente através de eventos.
Health Checks: Implemente health checks detalhados para monitorar a saúde e o estado do seu serviço.
Logging: Utilize os métodos de logging fornecidos pela BaseService (_log, _logError, _logPerformance) para registrar informações relevantes sobre o seu serviço.
Metadados: Utilize os metadados do serviço para configurar informações importantes, como intervalos de health check e dependências.
Este manual deve fornecer uma compreensão abrangente de como utilizar os componentes ServiceEventHub e BaseService. Ao seguir estas diretrizes, você poderá construir uma arquitetura de microsserviços robusta e escalável.