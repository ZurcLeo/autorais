import React, { useEffect, useMemo } from 'react';
import { Box, Paper, Container, Drawer, List, ListItem, ListItemText, Typography, Breadcrumbs, Link, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; // Example icon, you can choose a better one
import { useTheme } from '../../themeContext.js';
import { ThemeControls } from '../../ThemeControls.js';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ProjectInfoPanel } from '../components/ProjectInfoPanel.tsx';
import {InitializationDiagram} from '../components/InitializationDiagram.tsx';
import { docSections } from '../types/index.ts';
import { useDocTracking } from '../hooks/useDocTracking.ts';

const DRAWER_WIDTH = 280;

const DocViewer: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { trackView } = useDocTracking({ section: location.pathname });
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Calcula a rota atual para breadcrumbs
  const currentPath = location.pathname.split('/').filter(Boolean);
  const currentSection = currentPath[1];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Função auxiliar para converter status em cor - Memoized for performance if statuses don't change frequently
  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'stable': return theme.palette.success.main;
      case 'attention': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      case 'planned': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  }, [theme.palette]); // Depend on theme.palette to update if theme changes colors

  // Function to find item by ID - Memoized for potential performance improvements if docSections is large
  const findItemById = useMemo(() => (id) => {
    for (const section of docSections) {
      if (section.id === id) return section;
      for (const item of section.items) { // More efficient item search
        if (item.id === id) return item;
      }
    }
    return null;
  }, []); // docSections dependency if it changes dynamically

  useEffect(() => {
    trackView();
  }, [location, trackView]);

  // Extract Breadcrumbs rendering to a separate memoized function for better organization
  const renderBreadcrumbs = useMemo(() => () => {
    const crumbs = [
      <Link
        key="home"
        color="inherit"
        onClick={(e) => { e.preventDefault(); navigate('/docs'); }}
        href="/docs"
      >
        Documentação
      </Link>
    ];

    if (currentSection) {
      const item = findItemById(currentSection);

      if (item) {
        const parentSection = docSections.find(section =>
          section.items.some(i => i.id === item.id)
        );

        if (parentSection) {
          crumbs.push(
            <Link
              key="section"
              color="inherit"
              onClick={() => navigate(`/docs/${parentSection.id}`)}
            >
              {parentSection.title}
            </Link>
          );
        }

        crumbs.push(
          <Typography key="current" color="textPrimary">
            {item.title}
            {item.status === 'attention' && (
              <span style={{ color: theme.palette.warning.main }}>
                ⚠️
              </span>
            )}
          </Typography>
        );
      }
    }

    return (
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        {crumbs}
      </Breadcrumbs>
    );
  }, [currentSection, findItemById, navigate, theme, docSections]); // Dependencies for memoization


  const drawer = (
    <Box>
      <Toolbar sx={{ justifyContent: 'center' }}> {/* Center the Typography in Toolbar */}
        <Typography variant="h6" color="primary" >
          Documentação
        </Typography>
      </Toolbar>
      {/* <InitializationDiagram
        mode="dark"
        interactive={true}
      /> */}
      <List component="nav">
        {docSections.map((section) => (
          <Box key={section.id}>
            <ListItem disablePadding> {/* Remove default padding for custom ListItemText alignment */}
              <ListItemText
                primary={section.title}
                primaryTypographyProps={{
                  variant: 'overline',
                  color: 'textSecondary',
                  sx: { pl: 2 } // Add padding to align with nested items
                }}
              />
            </ListItem>
            <List component="div" disablePadding>
              {section.items.map((item) => (
                <ListItem
                  key={item.id}
                  button
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{ pl: 4 }}
                >
                  {/* Status Indicator */}
                  {item.status && (
                    <Box
                      component="span"
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        mr: 1,
                        bgcolor: getStatusColor(item.status)
                      }}
                    />
                  )}
                  <ListItemText
                    primary={item.title}
                    secondary={item.priority === 'high' ? 'Prioritário' : undefined}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar for mobile menu */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          display: { sm: 'none' }, // Hide on small screens and up
        }}
      >
        <ThemeControls />
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Documentação
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer for sidebar navigation */}
      <Drawer
        variant="permanent" // Hidden on mobile, always visible on larger screens
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' }, // Hide on extra-small, show on small and up
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {drawer}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better for performance on mobile.
        }}
        sx={{
          display: { sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>


      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', sm: `calc(100% - ${DRAWER_WIDTH}px)` }, // Adjust width based on drawer
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ display: { sm: 'none' } }} /> {/* Spacer for fixed mobile AppBar */}
        {renderBreadcrumbs()}
        <Container maxWidth="xl"> {/* Use Container for max width control */}
          <Paper
            elevation={1} // Reduced elevation for a cleaner look
            sx={{
              p: 4,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              minHeight: '70vh',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: (theme) => theme.shadows[2] // Slightly stronger shadow on hover
              }
            }}
          >
            <Box
              sx={{
                '& > *': { mb: 2 },
                '& code': {
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: 'background.default'
                }
              }}
            >
              <Outlet />
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default DocViewer;