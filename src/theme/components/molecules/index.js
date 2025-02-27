// theme/components/molecules/index.js
import { createButtonGroupStyles } from './buttonGroup';

export const createMolecularComponents = (tokens, semanticColors, baseStyles) => ({
  ...createButtonGroupStyles(tokens, semanticColors, baseStyles),
  // Adicione outras moléculas aqui
});