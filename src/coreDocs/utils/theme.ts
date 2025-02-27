// src/coreDocs/utils/theme.ts
import { Theme } from '@mui/material';

export const getDocTheme = (theme: Theme) => ({
  primaryColor: theme.palette.primary.main,
  secondaryColor: theme.palette.secondary.main,
  backgroundColor: theme.palette.background.default,
  textColor: theme.palette.text.primary
});