// theme/index.js
import { createBaseStyles } from './styles/baseStyles';
import { createAtomicComponents } from './components/atoms';
import { createMolecularComponents } from './components/molecules';
import { createOrganismComponents } from './components/organisms';

export const createComponents = (mode, tokens, semanticColors) => {
  // Primeiro criamos os estilos base
  const baseStyles = createBaseStyles(tokens, semanticColors);
  
  // Então criamos cada nível de componentes, passando os estilos base
  const atoms = createAtomicComponents(tokens, semanticColors, baseStyles);
  const molecules = createMolecularComponents(tokens, semanticColors, baseStyles);
  const organisms = createOrganismComponents(tokens, semanticColors, baseStyles);
  
  return {
    ...atoms,
    ...molecules,
    ...organisms,
  };
};