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
  IconButton,
  Typography,
  Avatar,
  Badge,
  Paper,
  useTheme,
  alpha,
  Fade,
  Zoom,
  InputBase
} from '@mui/material';
import { 
  ExpandLess, 
  ExpandMore, 
  ChevronLeft, 
  ChevronRight,
  Search as SearchIcon,
  Brightness4,
  Brightness7,
  Settings as SettingsIcon,
  KeyboardArrowDown
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { coreLogger } from '../../core/logging';
import { LOG_LEVELS } from '../../core/constants/config';
import { useTranslation } from 'react-i18next';
import { sidebarMenu } from './config/sidebarMenu';
import { useAuth } from '../../providers/AuthProvider';

const MODULE_NAME = 'ModernSidebar';

// Componente de Profile Card moderno
const ProfileCard = ({ currentUser, open, onProfileClick }) => {
  const theme = useTheme();
  
  if (!open) {
    return (
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title={currentUser?.nome || 'Perfil'} placement="right">
          <Avatar
            src={currentUser?.fotoDoPerfil}
            onClick={onProfileClick}
            sx={{
              width: 40,
              height: 40,
              cursor: 'pointer',
              border: `2px solid ${theme?.palette?.primary?.main || '#1976d2'}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: theme?.shadows?.[4] || '0px 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            {(currentUser?.nome || 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        m: 1,
        background: `linear-gradient(135deg, ${theme?.palette?.primary?.main || '#1976d2'} 0%, ${theme?.palette?.primary?.dark || '#1565c0'} 100%)`,
        color: 'white',
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme?.shadows?.[8] || '0px 8px 16px rgba(0,0,0,0.3)'
        }
      }}
      onClick={onProfileClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                border: '2px solid white'
              }}
            />
          }
        >
          <Avatar
            src={currentUser?.fotoDoPerfil}
            sx={{
              width: 48,
              height: 48,
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            {(currentUser?.nome || 'U').charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
        
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight="bold"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {currentUser?.nome || 'Usuário'}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Online • Ver perfil
          </Typography>
        </Box>
        
        <KeyboardArrowDown sx={{ opacity: 0.7 }} />
      </Box>
    </Paper>
  );
};

// Componente de Search moderno
const SidebarSearch = ({ open, onSearch }) => {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  if (!open) return null;

  return (
    <Box sx={{ p: 1 }}>
      <Paper
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          bgcolor: alpha(theme?.palette?.action?.hover || 'rgba(0,0,0,0.04)', 0.5),
          border: `1px solid ${alpha(theme?.palette?.divider || 'rgba(0,0,0,0.12)', 0.5)}`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:focus-within': {
            bgcolor: theme?.palette?.background?.paper || '#fff',
            borderColor: theme?.palette?.primary?.main || '#1976d2',
            boxShadow: `0 0 0 2px ${alpha(theme?.palette?.primary?.main || '#1976d2', 0.2)}`
          }
        }}
      >
        <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Buscar no menu..."
          value={searchValue}
          onChange={handleSearch}
          inputProps={{ 'aria-label': 'buscar no menu' }}
        />
      </Paper>
    </Box>
  );
};

// Componente de Menu Item modernizado
const ModernMenuItem = ({ 
  item, 
  isOpen, 
  onToggle, 
  location, 
  onNavigate, 
  sidebarOpen,
  isSubItem = false,
  hasNotification = false
}) => {
  const theme = useTheme();
  const isActive = item.path && location.pathname === item.path;
  const hasSubItems = item.items && item.items.length > 0;

  const handleClick = () => {
    if (item.path) {
      onNavigate(item.path);
    } else if (hasSubItems) {
      onToggle?.();
    }
  };

  const menuItem = (
    <ListItem
      button
      onClick={handleClick}
      sx={{
        minHeight: isSubItem ? 40 : 48,
        pl: isSubItem ? 4 : 2,
        pr: 2,
        mx: 1,
        mb: 0.5,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Estado normal
        bgcolor: isActive ? alpha(theme?.palette?.primary?.main || '#1976d2', 0.15) : 'transparent',
        
        // Hover state
        '&:hover': {
          bgcolor: isActive 
            ? alpha(theme?.palette?.primary?.main || '#1976d2', 0.25)
            : alpha(theme?.palette?.action?.hover || 'rgba(0,0,0,0.04)', 0.8),
          transform: 'translateX(4px)',
          '&::before': {
            opacity: 1,
            transform: 'scaleY(1)'
          }
        },

        // Barra lateral indicadora
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: theme?.palette?.primary?.main || '#1976d2',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
          transformOrigin: 'center',
          transition: 'all 0.3s ease',
          borderRadius: '0 4px 4px 0'
        }
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: 0, 
          mr: sidebarOpen ? 2 : 'auto', 
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          color: isActive 
            ? theme?.palette?.primary?.main || '#1976d2'
            : theme?.palette?.text?.secondary || 'rgba(0,0,0,0.6)',
          '&:hover': {
            transform: 'scale(1.1)'
          }
        }}
      >
        <Badge 
          color="error" 
          variant="dot" 
          invisible={!hasNotification}
          sx={{
            '& .MuiBadge-badge': {
              animation: hasNotification ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                '100%': { transform: 'scale(1)', opacity: 1 }
              }
            }
          }}
        >
          {item.icon}
        </Badge>
      </ListItemIcon>
      
      {sidebarOpen && (
        <Fade in={sidebarOpen} timeout={300}>
          <ListItemText 
            primary={item.textKey} // Usar diretamente o textKey para agora
            primaryTypographyProps={{
              variant: isSubItem ? 'body2' : 'body1',
              fontWeight: isActive ? 600 : 500,
              fontSize: isSubItem ? 14 : 16,
              color: isActive 
                ? theme?.palette?.primary?.main || '#1976d2'
                : theme?.palette?.text?.primary || 'rgba(0,0,0,0.87)',
              transition: 'color 0.3s ease'
            }}
          />
        </Fade>
      )}
      
      {sidebarOpen && hasSubItems && (
        <Zoom in={sidebarOpen} timeout={300}>
          <Box
            sx={{
              transition: 'transform 0.3s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: theme?.palette?.text?.secondary || 'rgba(0,0,0,0.6)'
            }}
          >
            <ExpandMore />
          </Box>
        </Zoom>
      )}
    </ListItem>
  );

  if (!sidebarOpen && hasSubItems) {
    return (
      <Tooltip title={item.textKey} placement="right" arrow>
        {menuItem}
      </Tooltip>
    );
  }

  return menuItem;
};

const ModernSidebar = ({ 
  open, 
  toggleSidebar, 
  isMobile, 
  sidebarWidth = 280, 
  collapsedWidth = 80 
}) => {
  const { isAuthenticated, currentUser } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [openSections, setOpenSections] = useState({
    social: false,
    financial: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-expand sections baseado na rota atual
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
  }, [open, isMobile, toggleSidebar]);
  
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

  const handleProfileClick = () => {
    if (currentUser?.uid) {
      handleNavigation(`/profile/${currentUser.uid}`);
    }
  };

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Filtrar itens baseado na busca
  const filteredMenu = searchTerm 
    ? sidebarMenu.filter(item => 
        item.textKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.items && item.items.some(subItem => 
          subItem.textKey.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    : sidebarMenu;

  if (!isAuthenticated) {
    return null;
  }

  const drawerWidth = isMobile ? sidebarWidth : (open ? sidebarWidth : collapsedWidth);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header com Profile */}
      <Box sx={{ p: 1 }}>
        <ProfileCard 
          currentUser={currentUser} 
          open={open} 
          onProfileClick={handleProfileClick}
        />
      </Box>

      {/* Search */}
      <SidebarSearch open={open} onSearch={handleSearch} />

      <Divider sx={{ mx: 1 }} />

      {/* Toggle Button */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 1 }}>
          <IconButton 
            onClick={toggleSidebar}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: alpha(theme?.palette?.action?.hover || 'rgba(0,0,0,0.04)', 0.8),
                transform: 'scale(1.1)'
              }
            }}
          >
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      )}

      {/* Menu Items */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: 6,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme?.palette?.action?.hover || 'rgba(0,0,0,0.04)', 0.5),
          borderRadius: 3,
        }
      }}>
        <List sx={{ p: 1 }}>
          {filteredMenu.map((item) => (
            <React.Fragment key={item.id}>
              <ModernMenuItem
                item={item}
                isOpen={openSections[item.id]}
                onToggle={() => handleSectionToggle(item.id)}
                location={location}
                onNavigate={handleNavigation}
                sidebarOpen={open}
                hasNotification={item.id === 'social'} // Exemplo de notificação
              />
              
              {open && item.items && (
                <Collapse in={openSections[item.id]} timeout={300} unmountOnExit>
                  <List component="div" disablePadding>
                    {item.items.map(subItem => (
                      <ModernMenuItem
                        key={subItem.path}
                        item={subItem}
                        location={location}
                        onNavigate={handleNavigation}
                        sidebarOpen={open}
                        isSubItem={true}
                      />
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Footer com Settings */}
      {open && (
        <Box sx={{ p: 1, borderTop: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}` }}>
          <ModernMenuItem
            item={{
              icon: <SettingsIcon />,
              textKey: 'Configurações',
              path: `/profile/${currentUser?.uid}`
            }}
            location={location}
            onNavigate={handleNavigation}
            sidebarOpen={open}
          />
        </Box>
      )}
    </Box>
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
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: theme?.palette?.background?.paper || '#fff',
            borderRight: `1px solid ${theme?.palette?.divider || 'rgba(0,0,0,0.12)'}`,
            overflowX: 'hidden',
            transition: theme?.transitions?.create(['width'], {
              easing: theme?.transitions?.easing?.sharp,
              duration: theme?.transitions?.duration?.standard,
            }) || 'width 0.3s ease',
            boxShadow: theme?.shadows?.[2] || '0px 3px 6px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            background: `linear-gradient(180deg, ${theme?.palette?.background?.paper || '#fff'} 0%, ${alpha(theme?.palette?.background?.paper || '#fff', 0.95)} 100%)`
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default ModernSidebar;