import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Grid,
  Avatar,
  Button,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Divider,
  Badge,
  Collapse,
  Fade,
  Paper,
  SwipeableDrawer,
  Fab
} from '@mui/material';
import {
  Done as DoneIcon,
  ClearAll as ClearAllIcon, 
  Search as SearchIcon,
  NotificationsOff as EmptyIcon,
  ErrorOutline as ErrorIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { formatDistance, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationSkeleton from './NotificationSkeleton';
import NotificationActions from './NotificationActions';
import EmptyState from './EmptyState';
import CustomSnackbar from './CustomSnackbar';
import { useNotifications } from '../../providers/NotificationProvider';
import { styled } from '@mui/material/styles';

// Estilos personalizados
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 0,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

const mockFoto = process.env.REACT_APP_CLAUD_PROFILE_IMG;

// Componente para agrupar notificações por data
const NotificationGroup = ({ title, children, count }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ 
          py: 1, 
          px: 2, 
          borderRadius: 1,
          bgcolor: 'background.paper',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          mb: 1
        }}
      >
        <Box display="flex" alignItems="center">
          <Typography variant="subtitle1" fontWeight="medium">
            {title}
          </Typography>
          <Chip 
            label={count} 
            size="small" 
            sx={{ ml: 1 }}
          />
        </Box>
        <IconButton size="small">
          <ExpandMoreIcon sx={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </IconButton>
      </Box>
      
      <Collapse in={isOpen}>
        {children}
      </Collapse>
    </Box>
  );
};

// Filtro avançado para notificações
const NotificationFilters = ({ onClose, onApplyFilters, currentFilters }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(currentFilters || {
    type: 'all',
    readStatus: 'all',
    dateRange: 'all'
  });

  const handleFilterChange = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Box sx={{ p: 2, width: 320, maxWidth: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {t('notification.advanced_filters')}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('notification.filter_by_type')}
        </Typography>
        <Grid container spacing={1}>
          {['all', 'convite', 'alerta', 'mensagem'].map(type => (
            <Grid item key={type}>
              <Chip
                label={t(`common.${type}`)}
                onClick={() => handleFilterChange('type', type)}
                color={filters.type === type ? 'primary' : 'default'}
                variant={filters.type === type ? 'filled' : 'outlined'}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('notification.filter_by_status')}
        </Typography>
        <Grid container spacing={1}>
          {[
            { id: 'all', label: 'all_status' },
            { id: 'read', label: 'read_only' },
            { id: 'unread', label: 'unread_only' }
          ].map(status => (
            <Grid item key={status.id}>
              <Chip
                label={t(`notification.${status.label}`)}
                onClick={() => handleFilterChange('readStatus', status.id)}
                color={filters.readStatus === status.id ? 'primary' : 'default'}
                variant={filters.readStatus === status.id ? 'filled' : 'outlined'}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('notification.filter_by_date')}
        </Typography>
        <Grid container spacing={1}>
          {[
            { id: 'all', label: 'all_time' },
            { id: 'today', label: 'today' },
            { id: 'week', label: 'this_week' },
            { id: 'month', label: 'this_month' }
          ].map(period => (
            <Grid item key={period.id}>
              <Chip
                label={t(`time.${period.label}`)}
                onClick={() => handleFilterChange('dateRange', period.id)}
                color={filters.dateRange === period.id ? 'primary' : 'default'}
                variant={filters.dateRange === period.id ? 'filled' : 'outlined'}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Box display="flex" justifyContent="flex-end" gap={1}>
        <Button variant="outlined" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={handleApply}>
          {t('common.apply')}
        </Button>
      </Box>
    </Box>
  );
};

const NotificationCard = React.memo(({ notification, onAction, onMarkAsRead, index, isMobile }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [exiting, setExiting] = useState(false);
  
  // Referência para o elemento do cartão
  const cardRef = useRef(null);
  
  // Animação de entrada
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        delay: index * 0.05, // Atraso escalonado com base no índice
      }
    },
    exit: {
      opacity: 0,
      x: "-100%",
      transition: { duration: 0.2 }
    }
  };

  // Converte o timestamp do Firestore para um objeto Date
  const notificationDate = new Date(notification.createdAt?._seconds * 1000);
  
  // Formata a data com base em quando ocorreu
  const getFormattedDate = (date) => {
    if (isToday(date)) return t('time.today');
    if (isYesterday(date)) return t('time.yesterday');
    if (isThisWeek(date)) return t('time.this_week');
    if (isThisMonth(date)) return t('time.this_month');
    return formatDistance(date, new Date(), { addSuffix: true, locale: ptBR });
  };

  const handleMarkAsRead = () => {
    setExiting(true);
    // Aguarda a animação finalizar antes de remover
    setTimeout(() => {
      onMarkAsRead(notification.id);
    }, 200);
  };

  const handleDelete = () => {
    setExiting(true);
    // Aguarda a animação finalizar antes de remover
    setTimeout(() => {
      onAction(notification.id, 'delete');
    }, 200);
  };

  const handleAction = (action) => {
    onAction(notification.id, action);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Versão para dispositivos móveis
  if (isMobile) {
    return (
      <Grid item xs={12}>
        <motion.div
          initial="hidden"
          animate={exiting ? "exit" : "visible"}
          variants={cardVariants}
          ref={cardRef}
        >
          <Card 
            variant="outlined"
            sx={{
              position: 'relative',
              opacity: notification.read ? 0.85 : 1,
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-2px)' },
              border: notification.read ? '1px solid' : '1px solid',
              borderColor: notification.read ? 'divider' : 'primary.main',
              boxShadow: notification.read ? 0 : 1
            }}
          >
            {!notification.read && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0, 
                  bottom: 0, 
                  width: 4, 
                  bgcolor: 'primary.main' 
                }} 
              />
            )}
            <CardContent>
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    !notification.read && (
                      <Box
                        sx={{
                          bgcolor: 'primary.main',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'background.paper'
                        }}
                      />
                    )
                  }
                >
                  <Avatar 
                    src={notification.fotoDoPerfil || mockFoto} 
                    sx={{ width: 50, height: 50 }}
                  />
                </Badge>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                    <Typography 
                      variant="subtitle1" 
                      component="div"
                      sx={{ 
                        fontWeight: notification.read ? 400 : 600,
                        mb: 0.5 
                      }}
                    >
                      {notification.title || notification.content.split(' ').slice(0, 6).join(' ') + '...'}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ minWidth: 80, textAlign: 'right' }}
                    >
                      {getFormattedDate(notificationDate)}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: expanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {notification.content}
                  </Typography>
                  
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={1}
                    justifyContent="space-between"
                    mt={1}
                  >
                    <Chip
                      size="small"
                      label={t(`notification.types.${notification.type}`)}
                      variant="outlined"
                      color={notification.read ? "default" : "primary"}
                    />
                    
                    {notification.content.length > 120 && (
                      <Button 
                        size="small" 
                        color="primary" 
                        onClick={toggleExpand}
                        endIcon={expanded ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
                      >
                        {expanded ? t('common.show_less') : t('common.show_more')}
                      </Button>
                    )}
                  </Box>
                  
                  <Collapse in={expanded}>
                    {notification.actions && (
                      <Box mt={2}>
                        <NotificationActions 
                          actions={notification.actions}
                          onAction={handleAction}
                          isMobile={true}
                        />
                      </Box>
                    )}
                  </Collapse>
                  
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <Button
                      size="small"
                      startIcon={<DoneIcon />}
                      onClick={handleMarkAsRead}
                      disabled={notification.read}
                    >
                      {t('notification.mark_read')}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                    >
                      {t('common.delete')}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    );
  }
  
  // Versão para desktop
  return (
    <Grid item xs={12}>
      <motion.div
        initial="hidden"
        animate={exiting ? "exit" : "visible"}
        variants={cardVariants}
        ref={cardRef}
      >
        <Card 
          variant="outlined"
          sx={{
            position: 'relative',
            opacity: notification.read ? 0.9 : 1,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[3] },
            border: notification.read ? '1px solid' : '1px solid',
            borderColor: notification.read ? 'divider' : 'primary.main',
            boxShadow: notification.read ? 0 : 2
          }}
        >
          {!notification.read && (
            <Box 
              sx={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                bottom: 0, 
                width: 4, 
                bgcolor: 'primary.main' 
              }} 
            />
          )}
          <CardContent>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  !notification.read && (
                    <Tooltip title={t('notification.unread')}>
                      <Box
                        sx={{
                          bgcolor: 'primary.main',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: 'background.paper'
                        }}
                      />
                    </Tooltip>
                  )
                }
              >
                <Avatar 
                  src={notification.fotoDoPerfil || mockFoto} 
                  sx={{ width: 56, height: 56 }}
                />
              </Badge>
              
              <Box flex={1}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      component="div"
                      sx={{ 
                        fontWeight: notification.read ? 400 : 600,
                        mb: 0.5 
                      }}
                    >
                      {notification.title || notification.content.split(' ').slice(0, 10).join(' ') + '...'}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Chip
                        size="small"
                        label={t(`notification.types.${notification.type}`)}
                        variant="outlined"
                        color={notification.read ? "default" : "primary"}
                      />
                      
                      <Typography variant="caption" color="textSecondary">
                        {getFormattedDate(notificationDate)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Tooltip title={notification.read ? t('notification.already_read') : t('notification.mark_read')}>
                      <IconButton 
                        size="small"
                        onClick={handleMarkAsRead}
                        color={notification.read ? "default" : "primary"}
                        sx={{ opacity: notification.read ? 0.5 : 1 }}
                        disabled={notification.read}
                      >
                        {notification.read ? <CheckCircleIcon fontSize="small" /> : <CircleIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={t('common.delete')}>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={handleDelete}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: expanded ? 'unset' : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {notification.content}
                </Typography>
                
                {notification.content.length > 150 && (
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={toggleExpand}
                    endIcon={expanded ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
                  >
                    {expanded ? t('common.show_less') : t('common.show_more')}
                  </Button>
                )}
                
                <Collapse in={expanded || notification.content.length <= 150}>
                  {notification.actions && (
                    <Box mt={2}>
                      <NotificationActions 
                        actions={notification.actions}
                        onAction={handleAction}
                        isMobile={false}
                      />
                    </Box>
                  )}
                </Collapse>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Grid>
  );
});

const NotificationHistory = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [hasMore, setHasMore] = useState(true);
  
  // Filtros avançados
  const [advancedFilters, setAdvancedFilters] = useState({
    type: 'all',
    readStatus: 'all',
    dateRange: 'all'
  });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Ref para observar o último item para implementar infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  
  // Use o context do NotificationProvider
  const {
    notifications = [],
    notifLoading,
    error,
    markAsRead,
    refreshNotifications,
    clearAllNotifications,
    unreadCount = 0
  } = useNotifications();

  // Função para carregar mais notificações
  useEffect(() => {
    if (inView && hasMore && !notifLoading && !isRefreshing) {
      // Incrementar página para carregar mais
      setPage(prevPage => prevPage + 1);
    }
  }, [inView, hasMore, notifLoading, isRefreshing]);

  // Atualizar filteredNotifications quando os filtros mudam
  useEffect(() => {
    filterAndSortNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, activeTab, sortOrder, searchQuery, advancedFilters, page]);

  // Monitorar scroll para mostrar botão "voltar ao topo"
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowScrollTop(contentRef.current.scrollTop > 500);
      }
    };
    
    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Função para filtrar e ordenar notificações
  const filterAndSortNotifications = useCallback(() => {
    if (!Array.isArray(notifications)) {
      console.warn("Notifications is not an array in filterNotifications");
      setFilteredNotifications([]);
      setHasMore(false);
      return;
    }

    // Aplicar filtro de abas
    let filtered = [...notifications];
    
    // Filtro básico por tipo
    if (activeTab !== 'all') {
      filtered = filtered.filter(notification => notification.type === activeTab);
    }
    
    // Aplicar pesquisa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(notification => 
        (notification.content && notification.content.toLowerCase().includes(query)) ||
        (notification.title && notification.title.toLowerCase().includes(query)) ||
        (notification.type && t(`notification.types.${notification.type}`).toLowerCase().includes(query))
      );
    }
    
    // Aplicar filtros avançados
    if (advancedFilters.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === advancedFilters.type);
    }
    
    if (advancedFilters.readStatus !== 'all') {
      filtered = filtered.filter(notification => {
        if (advancedFilters.readStatus === 'read') return notification.read;
        if (advancedFilters.readStatus === 'unread') return !notification.read;
        return true;
      });
    }
    
    if (advancedFilters.dateRange !== 'all') {
      filtered = filtered.filter(notification => {
        const date = new Date(notification.createdAt?._seconds * 1000);
        if (advancedFilters.dateRange === 'today') return isToday(date);
        if (advancedFilters.dateRange === 'week') return isThisWeek(date);
        if (advancedFilters.dateRange === 'month') return isThisMonth(date);
        return true;
      });
    }
    
    // Ordenar notificações
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt?._seconds * 1000);
      const dateB = new Date(b.createdAt?._seconds * 1000);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredNotifications(filtered);
    setHasMore(filtered.length > page * ITEMS_PER_PAGE);
  }, [notifications, activeTab, sortOrder, searchQuery, advancedFilters, page, t]);

  // Agrupar notificações por data
  const groupNotificationsByDate = (notifications) => {
    const groups = {
      'today': [],
      'yesterday': [],
      'this_week': [],
      'this_month': [],
      'older': []
    };
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt?._seconds * 1000);
      
      if (isToday(date)) {
        groups.today.push(notification);
      } else if (isYesterday(date)) {
        groups.yesterday.push(notification);
      } else if (isThisWeek(date)) {
        groups.this_week.push(notification);
      } else if (isThisMonth(date)) {
        groups.this_month.push(notification);
      } else {
        groups.older.push(notification);
      }
    });
    
    // Filtrar grupos vazios
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([key, items]) => ({
        key,
        title: t(`time.${key}`),
        items
      }));
  };

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Resetar para a primeira página
  };
  
  const toggleSortOrder = () => {
    setSortOrder(prevSort => prevSort === 'desc' ? 'asc' : 'desc');
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);
    
    try {
      await refreshNotifications();
      setPage(1); // Resetar para a primeira página ao atualizar
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error);
      setRefreshError(t('notification.refresh_error'));
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1); // Resetar para a primeira página ao pesquisar
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  const handleApplyAdvancedFilters = (filters) => {
    setAdvancedFilters(filters);
    setPage(1); // Resetar para a primeira página ao aplicar filtros
  };
  
  const toggleFilterDrawer = (open) => () => {
    setFilterDrawerOpen(open);
  };
  
  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      setRefreshError(t('notification.clear_error'));
    }
  };
  
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const handleAction = (notificationId, action) => {
    if (action === 'delete') {
      // Implementação para excluir notificação (pode ser integrada no futuro)
      console.log(`Excluir notificação ${notificationId}`);
      // Por enquanto, apenas marcamos como lida
      handleMarkAsRead(notificationId);
    } else {
      handleMarkAsRead(notificationId);
    }
  };

  // Limitar a quantidade de notificações exibidas por página
  const paginatedNotifications = filteredNotifications.slice(0, page * ITEMS_PER_PAGE);
  
  // Agrupar notificações por data para uma melhor visualização
  const groupedNotifications = groupNotificationsByDate(paginatedNotifications);
  
  if (error) return <EmptyState type="error" message={error} />;

  return (
    <Box
      ref={contentRef}
      sx={{ p: isMobile ? 1 : 3, height: '80vh', overflow: 'auto' }}
      onScroll={(e) => {
        // Detecta quando o usuário rolou para baixo para mostrar o botão de ir para o topo
        setShowScrollTop(e.target.scrollTop > 500);
      }}
    >
      {/* Cabeçalho fixo com filtros e controles */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          pt: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems={isMobile ? "flex-start" : "center"}
          gap={2}
          mb={2}
        >
          <Typography variant="h5" component="h1">
            {t('notification.history_title')}
          </Typography>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={isRefreshing || notifLoading}
            >
              {isRefreshing ? t('common.refreshing') : t('common.refresh')}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearAllIcon />}
              onClick={handleClearAll}
              disabled={isRefreshing || notifLoading || filteredNotifications.length === 0}
            >
              {t('notification.clear_all')}
            </Button>
          </Box>
        </Box>

        {/* Barra de pesquisa */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('common.search')}
          size="small"
          margin="normal"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  {t('common.all')}
                  {unreadCount > 0 && (
                    <StyledBadge badgeContent={unreadCount} color="primary" sx={{ ml: 1 }} />
                  )}
                </Box>
              }
              value="all"
            />
            <Tab label={t('common.invites')} value="convite" />
            <Tab label={t('common.alerts')} value="alerta" />
            <Tab label={t('common.messages')} value="mensagem" />
          </Tabs>
          
          <Box display="flex" alignItems="center">
            <Tooltip title={t(sortOrder === 'desc' ? 'common.newest_first' : 'common.oldest_first')}>
              <IconButton onClick={toggleSortOrder} size="small">
                {sortOrder === 'desc' ? <TimeIcon /> : <TimeIcon sx={{ transform: 'rotate(180deg)' }} />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('notification.advanced_filters')}>
              <IconButton onClick={toggleFilterDrawer(true)} size="small" color={
                advancedFilters.type !== 'all' || 
                advancedFilters.readStatus !== 'all' || 
                advancedFilters.dateRange !== 'all' ? 'primary' : 'default'
              }>
                <FilterIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Drawer para filtros avançados em dispositivos móveis */}
      <SwipeableDrawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
        onOpen={toggleFilterDrawer(true)}
      >
        <NotificationFilters
          onClose={toggleFilterDrawer(false)}
          onApplyFilters={handleApplyAdvancedFilters}
          currentFilters={advancedFilters}
        />
      </SwipeableDrawer>

      {/* Lista de notificações */}
      <Box sx={{ mt: 2 }}>
        {(notifLoading || isRefreshing) && filteredNotifications.length === 0 ? (
          <Grid container spacing={2}>
            {Array.from({ length: 5 }).map((_, index) => (
              <NotificationSkeleton key={index} />
            ))}
          </Grid>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            type="info"
            message={t('notification.no_notifications')}
            icon={<EmptyIcon fontSize="large" />}
          />
        ) : (
          <>
            {/* Notificações agrupadas por data */}
            {groupedNotifications.map((group) => (
              <NotificationGroup 
                key={group.key} 
                title={group.title} 
                count={group.items.length}
              >
                <Grid container spacing={2}>
                  <AnimatePresence>
                    {group.items.map((notification, index) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onAction={handleAction}
                        onMarkAsRead={handleMarkAsRead}
                        index={index}
                        isMobile={isMobile}
                      />
                    ))}
                  </AnimatePresence>
                </Grid>
              </NotificationGroup>
            ))}
            
            {/* Elemento observável para infinite scroll */}
            {hasMore && !isRefreshing && !notifLoading && (
              <Box ref={loadMoreRef} display="flex" justifyContent="center" my={3}>
                <CircularProgress size={30} />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Botão para voltar ao topo */}
      <Fade in={showScrollTop}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 2,
          }}
        >
          <ArrowUpIcon />
        </Fab>
      </Fade>
      
      {/* Exibe erros de atualização ou outros */}
      <CustomSnackbar 
        open={!!refreshError} 
        message={refreshError} 
        severity="error" 
      />
    </Box>
     );
    };
    
    export default NotificationHistory;