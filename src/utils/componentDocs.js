// src/utils/componentDocs.js

/**
 * Sistema de documentação de componentes
 * Fornece uma estrutura para documentar aspectos importantes dos componentes
 */

/**
 * Documentação de dependências do componente
 * @param {string} componentName - Nome do componente
 * @param {Object} dependencies - Objeto descrevendo as dependências
 * @returns {string} Documentação formatada das dependências
 */
export const documentDependencies = (componentName, dependencies) => {
    return `
  Component: ${componentName}
  
  Dependencies:
  ${Object.entries(dependencies)
    .map(([dep, details]) => `- ${dep}: ${details.description || 'No description'}
      Required: ${details.required ? 'Yes' : 'No'}
      Version: ${details.version || 'Not specified'}
      Purpose: ${details.purpose || 'Not specified'}
    `)
    .join('\n')}
  `;
  };
  
  /**
   * Documentação das props do componente
   * @param {string} componentName - Nome do componente
   * @param {Object} props - Objeto descrevendo as props
   * @returns {string} Documentação formatada das props
   */
  export const documentProps = (componentName, props) => {
    return `
  Component: ${componentName}
  
  Props:
  ${Object.entries(props)
    .map(([prop, details]) => `- ${prop}:
      Type: ${details.type}
      Required: ${details.required ? 'Yes' : 'No'}
      Default: ${details.default || 'None'}
      Description: ${details.description || 'No description'}
      Validation: ${details.validation || 'None'}
    `)
    .join('\n')}
  `;
  };
  
  /**
   * Documentação dos estados do componente
   * @param {string} componentName - Nome do componente
   * @param {Object} states - Objeto descrevendo os estados
   * @returns {string} Documentação formatada dos estados
   */
  export const documentStates = (componentName, states) => {
    return `
  Component: ${componentName}
  
  States:
  ${Object.entries(states)
    .map(([state, details]) => `- ${state}:
      Type: ${details.type}
      Initial Value: ${details.initial}
      Purpose: ${details.purpose}
      Side Effects: ${details.sideEffects || 'None'}
      Dependencies: ${details.dependencies || 'None'}
    `)
    .join('\n')}
  `;
  };
  
  /**
   * Documentação dos efeitos do componente
   * @param {string} componentName - Nome do componente
   * @param {Object} effects - Objeto descrevendo os efeitos
   * @returns {string} Documentação formatada dos efeitos
   */
  export const documentEffects = (componentName, effects) => {
    return `
  Component: ${componentName}
  
  Effects:
  ${Object.entries(effects)
    .map(([effect, details]) => `- ${effect}:
      Dependencies: ${details.dependencies.join(', ')}
      Purpose: ${details.purpose}
      Cleanup: ${details.cleanup || 'None'}
      Performance Impact: ${details.performance || 'Low'}
    `)
    .join('\n')}
  `;
  };
  
  /**
   * Documentação dos métodos do componente
   * @param {string} componentName - Nome do componente
   * @param {Object} methods - Objeto descrevendo os métodos
   * @returns {string} Documentação formatada dos métodos
   */
  export const documentMethods = (componentName, methods) => {
    return `
  Component: ${componentName}
  
  Methods:
  ${Object.entries(methods)
    .map(([method, details]) => `- ${method}:
      Parameters: ${details.params.map(p => `${p.name} (${p.type})`).join(', ')}
      Returns: ${details.returns}
      Description: ${details.description}
      Side Effects: ${details.sideEffects || 'None'}
      Examples:
  ${details.examples ? details.examples.map(ex => `      ${ex}`).join('\n') : '      None'}
    `)
    .join('\n')}
  `;
  };
  
  /**
   * Documentação do fluxo de dados do componente
   * @param {string} componentName - Nome do componente
   * @param {Object} dataFlow - Objeto descrevendo o fluxo de dados
   * @returns {string} Documentação formatada do fluxo de dados
   */
  export const documentDataFlow = (componentName, dataFlow) => {
    return `
  Component: ${componentName}
  
  Data Flow:
  ${Object.entries(dataFlow)
    .map(([flow, details]) => `- ${flow}:
      Type: ${details.type}
      Source: ${details.source}
      Destination: ${details.destination}
      Transformation: ${details.transformation || 'None'}
      Triggers: ${details.triggers.join(', ')}
    `)
    .join('\n')}
  `;
  };
  
  /**
   * Geração de um documento completo do componente
   * @param {string} componentName - Nome do componente
   * @param {Object} documentation - Objeto com toda a documentação
   * @returns {string} Documentação completa formatada
   */
  export const generateFullDocumentation = (componentName, documentation) => {
    const sections = [
      documentDependencies(componentName, documentation.dependencies),
      documentProps(componentName, documentation.props),
      documentStates(componentName, documentation.states),
      documentEffects(componentName, documentation.effects),
      documentMethods(componentName, documentation.methods),
      documentDataFlow(componentName, documentation.dataFlow)
    ];
  
    return `
  ====================================
  ${componentName} Documentation
  ====================================
  
  ${sections.join('\n\n')}
  
  Generated: ${new Date().toISOString()}
  Version: ${documentation.version || '1.0.0'}
  Last Updated: ${documentation.lastUpdated || 'Not specified'}
  Author: ${documentation.author || 'Not specified'}
  `;
  };