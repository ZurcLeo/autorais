import React, { useMemo } from 'react';
import { AppBar, Toolbar, Box, useTheme, Tooltip, IconButton } from '@mui/material';
import { GiLockedChest, GiThreeFriends, GiConversation, GiShoppingCart } from "react-icons/gi";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../providers/AuthProvider';
import LanguageSwitcher from '../../LanguageSwitcher';
import UserProfileDropdown from './UserProfileDropdown';
import { withAuthGuard } from './withAuthGuard';

const MODULE_NAME = 'TopNavBar';

const TopNavBar = () => {
  const { t } = useTranslation();
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Componentes para navegação autenticada
  const AuthenticatedNav = useMemo(() => () => (
    <>
      <Tooltip title={t('topnavbar.messages')}>
        <IconButton
          aria-label={t('topnavbar.messages')}
          onClick={() => navigate('/chat')}
        >
          <GiConversation />
        </IconButton>
      </Tooltip>
      {/* ... outros botões ... */}
      <UserProfileDropdown />
    </>
  ), [navigate, t]);

  const UnauthenticatedNav = () => (
    <Tooltip title={t('topnavbar.login')}>
      <IconButton
        aria-label={t('topnavbar.login')}
        onClick={() => navigate('/login')}
      >
        <span>{t('topnavbar.login')}</span>
      </IconButton>
    </Tooltip>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        padding: '0.5rem',
        [theme.breakpoints.down('sm')]: { padding: '0.5rem' },
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Tooltip title={t('topnavbar.home')}>
            <IconButton
              onClick={() => navigate(user ? '/dashboard' : '/')}
              aria-label={t('topnavbar.home')}
            >
              {/* Considere usar um componente Image otimizado aqui */}
              <img 
                src={process.env.REACT_APP_PLACE_HOLDER_IMG} 
                alt="Logo" 
                style={{ height: '80px', margin: '-15px' }} 
              />
            </IconButton>
          </Tooltip>
        </Box>

        {user ? <AuthenticatedNav /> : <UnauthenticatedNav />}
        <LanguageSwitcher />
      </Toolbar>
    </AppBar>
  );
};

// Exportamos o TopNavBar envolvido com o AuthGuard
export default withAuthGuard(TopNavBar);