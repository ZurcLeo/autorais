// theme/components/atoms/index.js
import { createButtonStyles } from './button';
import { createSwitchStyles } from './switch';

export const createAtomicComponents = (tokens, semanticColors, baseStyles) => ({
  ...createButtonStyles(tokens, semanticColors, baseStyles),
  ...createSwitchStyles(tokens, semanticColors, baseStyles),
  // Adicione outros componentes atômicos aqui
});