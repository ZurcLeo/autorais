// src/components/Layout/Sidebar.js - Versão adaptada ao novo sistema de temas
import React, { useState, useCallback, useEffect } from 'react';
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
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import { useTranslation } from 'react-i18next';
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
  const { isAuthenticated, currentUser } = useAuth();
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState({
    social: false,
    financial: false
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Expandir automaticamente a seção baseada na rota atual
  useEffect(() => {
    const path = location.pathname;
    setOpenSections({
      social: ['/posts', '/connections', '/messages', '/gift'].some(route => path.includes(route)),
      financial: ['/caixinha', '/contribuir'].some(route => path.includes(route))
    });

    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation changed', {
      path,
      user: currentUser?.uid,
      sidebarOpen: open
    });
  }, [location.pathname, currentUser, open]);

  const handleSectionToggle = useCallback((section) => {
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
  }, [open, isMobile, toggleSidebar, openSections]); 

  const getSectionToggleHandler = useCallback((id) => {
    return () => handleSectionToggle(id);
  }, [handleSectionToggle]);
  
  const handleNavigation = useCallback((path) => {
    navigate(path);
    
    if (isMobile) {
      toggleSidebar();
    }
    
    coreLogger.logEvent(MODULE_NAME, LOG_LEVELS.STATE, 'Navigation initiated', {
      from: location.pathname,
      to: path
    });
  }, [navigate, location.pathname, isMobile, toggleSidebar]);

  if (!isAuthenticated) {
    return null;
  }

  const drawerWidth = isMobile ? sidebarWidth : (open ? sidebarWidth : collapsedWidth);

  const renderMenuItem = (item, isSubMenuOpen, onToggleSubMenu) => (
    <Tooltip 
      title={!open && t(item.textKey)} 
      placement="right" 
      arrow={!open}
      key={item.id || `tooltip-${item.path}`}
    >
      <ListItem
        button
        onClick={() => item.path ? handleNavigation(item.path) : onToggleSubMenu && onToggleSubMenu()}
        selected={item.path && location.pathname === item.path}
        sx={{
          minHeight: 48,
          justifyContent: open ? 'initial' : 'center',
          px: 2.5,
          '&.Mui-selected': {
            bgcolor: 'action.selected',
            borderLeft: 2,
            borderColor: 'primary.main',
          },
          '&:hover': {
            bgcolor: 'action.hover',
          },
          transition: 'all 0.2s'
        }}
      >
        <ListItemIcon sx={{ 
          minWidth: 0, 
          mr: open ? 2 : 'auto', 
          justifyContent: 'center',
          color: location.pathname === item.path ? 'primary.main' : 'text.secondary'
        }}>
          {item.icon}
        </ListItemIcon>
        
        {open && (
          <>
            <ListItemText 
              primary={t(item.textKey)} 
              primaryTypographyProps={{
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                variant: 'body2',
                fontWeight: location.pathname === item.path ? 'bold' : 'medium'
              }}
            />
            {item.items && (isSubMenuOpen ? <ExpandLess color="inherit" /> : <ExpandMore color="inherit" />)}
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
          p: 1,
          minHeight: 56
        }}
      >
        {!isMobile && (
          <IconButton onClick={toggleSidebar}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ 
        overflow: 'auto', 
        height: 'calc(100% - 56px)'
      }}>
        <List>
          {sidebarMenu.map((item) => (
            <React.Fragment key={item.id}>
              {renderMenuItem(
                item, 
                openSections[item.id], 
                getSectionToggleHandler(item.id)
              )}
              
              {open && item.items && (
                <Collapse in={openSections[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.items.map(subItem => (
                      <ListItem
                        key={subItem.path}
                        button
                        onClick={() => handleNavigation(subItem.path)}
                        selected={location.pathname === subItem.path}
                        sx={{
                          pl: 4,
                          minHeight: 40,
                          '&.Mui-selected': {
                            bgcolor: 'action.selected',
                            borderLeft: 2,
                            borderColor: 'primary.main',
                          },
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: 36,
                          color: location.pathname === subItem.path ? 'primary.main' : 'text.secondary'
                        }}>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={t(subItem.textKey)} 
                          primaryTypographyProps={{
                            color: location.pathname === subItem.path ? 'primary.main' : 'text.primary',
                            variant: 'body2',
                            fontSize: 14
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
              
              <Divider sx={{ my: 0.5 }} />
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
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={isMobile ? toggleSidebar : undefined}
        ModalProps={isMobile ? { keepMounted: true } : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            overflowX: 'hidden',
            transition: 'width 0.2s ease',
            boxShadow: 1,
            width: isMobile ? 
              (open ? drawerWidth : 0) : 
              (open ? drawerWidth : collapsedWidth)
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;