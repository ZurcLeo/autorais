// components/NotificationCard.js
import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Badge, 
  Chip, 
  Button, 
  IconButton, 
  Tooltip, 
  Collapse, 
  Grid,
  useTheme
} from '@mui/material';
import { 
  Done as DoneIcon, 
  Delete as DeleteIcon, 
  ArrowUpward as ArrowUpIcon, 
  ArrowDownward as ArrowDownIcon, 
  CheckCircle as CheckCircleIcon, 
  Circle as CircleIcon 
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDistance, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import NotificationActions from './NotificationActions';

const mockFoto = process.env.REACT_APP_CLAUD_PROFILE_IMG;

const NotificationCard = React.memo(({ 
  notification, 
  onAction, 
  onMarkAsRead, 
  index, 
  isMobile 
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [exiting, setExiting] = useState(false);
  const theme = useTheme()
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
                  bgcolor: theme.palette.primary.main,
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
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
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

export default NotificationCard;