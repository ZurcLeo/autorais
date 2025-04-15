// hooks/useContextualNavigation.ts
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationContext {
    currentSection: string;
    relatedSections: string[];
    navigationHistory: string[];
  }
  
  export const useContextualNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Função para navegar mantendo o contexto
    const navigateWithContext = (targetId: string, context?: string) => {
      // Mapeamento de IDs de componentes para rotas de documentação
      const componentToDocMapping = {
        'LoggingConfig': '/docs/logging/settings',
        'CoreLogger': '/docs/logging/critical',
        'ProviderDiagnostics': '/docs/logging/stats',
        // ... outros mapeamentos
      };
  
      // Encontrar a rota correspondente
      const targetRoute = componentToDocMapping[targetId] || `/docs/${context}/${targetId}`;
      
      // Navegação com estado para manter o contexto
      navigate(targetRoute, {
        state: {
          previousContext: location.pathname,
          relatedSections: getRelatedSections(targetId)
        }
      });
    };
  
    return { navigateWithContext };
  };