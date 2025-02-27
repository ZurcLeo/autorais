import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import TopNavBar from './TopNavBar';
import Sidebar from './Sidebar';
import Box from '@mui/material/Box';
import { coreLogger } from '../../core/logging/CoreLogger'
import { LOG_LEVELS } from '../../reducers/metadata/metadataReducer';
import { withAuthGuard } from './withAuthGuard';

const MODULE_NAME = 'Layout';

const Layout = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();

  const shouldShowNav = location.pathname !== '/login' && location.pathname !== '/register';

  React.useEffect(() => {
    coreLogger(MODULE_NAME, LOG_LEVELS.LIFECYCLE, 'Layout mounting', {
      pathname: location.pathname,
    });
  }, [location.pathname]);
  
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh' 
    }}>
      {shouldShowNav && <TopNavBar />}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {shouldShowNav && <Sidebar />}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            p: 3,
            mt: shouldShowNav ? 8 : 0,
            ml: shouldShowNav ? '240px' : 0,
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

// Exportamos o Layout envolvido com o AuthGuard
export default withAuthGuard(Layout);