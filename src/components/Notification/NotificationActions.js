import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NotificationActions = ({ actions, onAction, isMobile }) => {
  const { t } = useTranslation();

  if (!actions || actions.length === 0) return null;

  return (
    <ButtonGroup
      variant="contained"
      size="small"
      fullWidth={isMobile}
      sx={{ mt: 1 }}
    >
      {actions.map(({ label, action, color }) => (
        <Button key={action} color={color || 'primary'} onClick={() => onAction(action)}>
          {t(label)}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default NotificationActions;