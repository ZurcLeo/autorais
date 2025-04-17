// src/components/Layout/Sidebar.js - Versão Refatorada
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Collapse, 
  Divider, 
  Tooltip, 
  IconButton 
} from '@mui/material';
import { 
  ExpandLess, 
  ExpandMore, 
  ChevronLeft, 
  ChevronRight 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { serviceLocator } from '../../core/services/BaseService';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import { useTranslation } from 'react-i18next';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { sidebarMenu } from './config/sidebarMenu';
import { useAuth } from '../../providers/AuthProvider';

const MODULE_NAME = 'Sidebar';

const Sidebar = ({ 
  open, 
  toggleSidebar, 
  isMobile, 
  sidebarWidth = 280, 
  collapsedWidth = 80 
}) => {
      const { isAuthenticated, currentUser } = useAuth()
  const { t } = useTranslation();
  const muiTheme = useMuiTheme();
  const [openSections, setOpenSections] = useState({
    social: false,
    financeiro: false
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  // Expandir automaticamente a seção baseada na rota atual
  useEffect(() => {
    const path = location.pathname;

    // Expandir ou colapsar conforme a rota
    setOpenSections({
      social: ['/posts', '/connections', '/messages', '/gift'].includes(path),
      financeiro: ['/caixinha', '/contribuir', '/caixinha/create'].includes(path)
    });

    // Log de navegação
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation changed', {
      path,
      user: currentUser.uid,
      sidebarOpen: open
    });
  }, [location.pathname, currentUser, open]);

  const handleSectionToggle = (section) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section]
    }));

    if (!open && !isMobile) {
      toggleSidebar();
    }

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, `${section} section toggled`, {
      isOpen: !openSections[section]
    });
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation initiated', {
      from: location.pathname,
      to: path
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const drawerWidth = isMobile ? sidebarWidth : (open ? sidebarWidth : collapsedWidth);

  const renderMenuItem = (item, isSubMenuOpen, onToggleSubMenu) => (
    <Tooltip 
    title={!open && t(item.textKey)} 
    placement="right" 
    arrow={!open}
    key={item.id || `tooltip-${item.path}`} // Adicionar uma key única aqui
  >
    <ListItem
      button
      onClick={() => item.path ? handleNavigation(item.path) : onToggleSubMenu && onToggleSubMenu()}
      selected={item.path && location.pathname === item.path}
      sx={{
        minHeight: 48,
        justifyContent: open ? 'initial' : 'center',
        px: 2.5,
        pl: item.level > 0 ? 4 : 2.5, // Indentação para submenus
      }}
    >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 3 : 'auto',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        {open && (
          <>
            <ListItemText primary={t(item.textKey)} />
            {item.items && (isSubMenuOpen ? <ExpandLess /> : <ExpandMore />)}
          </>
        )}
      </ListItem>
    </Tooltip>
  );

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-end' : 'center',
          padding: open ? 1 : 0,
          minHeight: 64,
        }}
      >
        {!isMobile && (
          <IconButton onClick={toggleSidebar}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', height: 'calc(100% - 64px)' }}>
        <List>
          {sidebarMenu.map((item) => (
            <React.Fragment key={item.id}>
              {renderMenuItem(item, openSections[item.id], () => handleSectionToggle(item.id))}
              {open && item.items && (
                <Collapse in={openSections[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.items.map(subItem => renderMenuItem(subItem, openSections[subItem.id]))}
                  </List>
                </Collapse>
              )}
              {item.id !== 'home' && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { sm: drawerWidth }, 
        flexShrink: { sm: 0 } 
      }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={toggleSidebar}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: open ? sidebarWidth : collapsedWidth, 
              transition: muiTheme.transitions.create('width', {
                easing: muiTheme.transitions.easing.sharp,
                duration: muiTheme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open={open}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
