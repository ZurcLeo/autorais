// //src/context/ServiceCoreContext.js
import { createContext } from 'react'; // Importa a função createContext do React, que é usada para criar Contextos.

// ServiceCoreContext.js

// Cria um Contexto React chamado ServiceCoreContext.
// createContext(null) inicializa o contexto com um valor padrão de 'null'.
// Este valor padrão é usado apenas se um componente tentar consumir o contexto *fora* de um Provider.
// No caso do ServiceCoreContext, espera-se que ele SEMPRE seja usado dentro de um ServiceCoreProvider,
// que irá *fornecer* um valor real para este contexto, sobrescrevendo o valor padrão 'null'.
export const ServiceCoreContext = createContext(null);

// Em resumo:

// O que este código faz:
// - Cria um Contexto React chamado `ServiceCoreContext`.
// - Este contexto serve como um "container" para passar dados (estado e funções)
//   do `ServiceCoreProvider` para componentes consumidores na árvore de componentes React.
// - O valor inicial do contexto é definido como `null`, mas será *sobrescrito* pelo `ServiceCoreProvider`.

// Como um componente *provider* (fornecedor) (ServiceCoreProvider neste caso) usa este contexto:
// 1. Importe o Contexto: import { ServiceCoreContext } from './ServiceCoreContext';
// 2. Use o componente Provider do Contexto: <ServiceCoreContext.Provider value={/* valores a serem fornecidos */}>
//    {/* Componentes filhos que podem consumir o contexto */}
//    </ServiceCoreContext.Provider>
// 3. Defina o `value` prop do Provider para o objeto que você deseja disponibilizar para os consumidores.

// Como um componente *consumidor* usa este contexto:
// 1. Importe o Contexto: import { ServiceCoreContext } from './ServiceCoreContext';
// 2. Use o hook useContext para acessar o valor do contexto: const contextValue = useContext(ServiceCoreContext);
// 3. O `contextValue` conterá o `value` que foi passado para o `ServiceCoreContext.Provider` mais próximo acima na árvore de componentes.

// Recursos disponibilizados por este código:
// - ServiceCoreContext: O Contexto React em si. É usado pelo Provider para *fornecer* um valor e pelos Consumers para *consumir* esse valor.
//   Em si, este arquivo *apenas cria o "canal" de comunicação* (o Contexto). O valor real é fornecido e consumido em outros arquivos
//   (principalmente em `ServiceCoreProvider.js` e componentes que usam `useServiceCore`).
