// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, Typography, IconButton, Box, Grid, Avatar, Button, Select, MenuItem, Link, Snackbar } from '@mui/material';
// import { Done as DoneIcon, Event as EventIcon, Info as InfoIcon, Mail as MailIcon } from '@mui/icons-material';
// import { useNotifications } from '../../context/NotificationContext';
// import { useAuth } from '../../context/AuthContext';
// import { formatDistance } from 'date-fns';
// import { ptBR } from 'date-fns/locale';
// import io from 'socket.io-client';
// import { useTranslation } from 'react-i18next';

// const socket = io(process.env.REACT_APP_BACKEND_URL);
// const fotoPadrao = process.env.REACT_APP_PLACE_HOLDER_IMG || '/path/to/default/image.png';

// // Função para mapear tipos de notificações a ícones
// const getIconByType = (type) => {
//   switch (type) {
//     case 'convite':
//       return <EventIcon color="primary" />;
//     case 'alerta':
//       return <InfoIcon color="secondary" />;
//     case 'mensagem':
//       return <MailIcon color="action" />;
//     default:
//       return <InfoIcon color="disabled" />;
//   }
// };

// const NotificationCard = React.memo(({ notification, markAsRead, openEvent }) => {
//   const { t } = useTranslation();

//   return (
//     <Grid item xs={12} sm={6} md={4} key={notification.id}>
//       <Card variant="outlined" sx={{ backgroundColor: notification.lida ? '#f0f0f0' : '#fff' }}>
//         <CardContent>
//           {/* Cabeçalho da Notificação */}
//           <Box display="flex" alignItems="center" mb={2}>
//             <Avatar src={notification.fotoDoPerfil || fotoPadrao} alt="Foto de perfil" sx={{ mr: 2 }} />
//             <Box>
//               <Typography variant="body1" component="p">
//                 {notification.content}
//               </Typography>
//               <Typography variant="caption" color="textSecondary">
//                 {notification.createdAt?._seconds 
//                   ? formatDistance(new Date(notification.createdAt._seconds * 1000), new Date(), { addSuffix: true, locale: ptBR })
//                   : t('common.unknown_time')}
//               </Typography>
//             </Box>
//           </Box>

//           {/* Ícone e Ações */}
//           <Box display="flex" justifyContent="space-between" alignItems="center">
//             {getIconByType(notification.tipo)}
//             <Box>
//               {!notification.lida && (
//                 <IconButton
//                   aria-label={t('notification_card.mark_as_read')}
//                   size="small"
//                   color="primary"
//                   onClick={() => markAsRead(notification.id, notification.tipo)}
//                 >
//                   <DoneIcon />
//                 </IconButton>
//               )}
//               {notification.tipo === 'convite' && (
//                 <Box mt={1} display="flex" gap={1}>
//                   <Button variant="contained" color="primary" size="small" aria-label={t('notification_card.accept_invite')}>
//                     {t('notification_card.accept_invite')}
//                   </Button>
//                   <Button variant="outlined" color="secondary" size="small" aria-label={t('notification_card.decline_invite')}>
//                     {t('notification_card.decline_invite')}
//                   </Button>
//                 </Box>
//               )}
//               {notification.eventoId && (
//                 <IconButton
//                   aria-label={t('notification_card.open_event')}
//                   size="small"
//                   color="secondary"
//                   onClick={() => openEvent(notification.eventoId)}
//                 >
//                   <EventIcon />
//                 </IconButton>
//               )}
//               <Link href={notification.url} target="_blank" rel="noopener noreferrer" sx={{ ml: 1 }}>
//                 {t('notification_card.view_details')}
//               </Link>
//             </Box>
//           </Box>
//         </CardContent>
//       </Card>
//     </Grid>
//   );
// });

// const NotificationHistory = () => {
//   const { currentUser } = useAuth();
//   const { notifications, setNotifications, markAsRead } = useNotifications();
//   const { t } = useTranslation();

//   const [filter, setFilter] = useState('all');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [page, setPage] = useState(1);
//   const [actionFeedback, setActionFeedback] = useState(null);

//   useEffect(() => {
//     if (!currentUser?.uid) {
//       return;
//     }

//     socket.on('userUpdated', (data) => {
//       if (data.userId === currentUser?.uid) {
//         //console.log('User updated:', data);
//       }
//     });

//     socket.on('newNotification', (newNotif) => {
//       if (newNotif.userId === currentUser?.uid) {
//         setNotifications((prev) => [newNotif, ...prev]);
//       }
//     });

//     socket.on('error', (error) => {
//       console.error('Socket error:', error);
//       setActionFeedback({ message: t('common.error_server_communication'), type: 'error' });
//     });

//     return () => {
//       socket.off('userUpdated');
//       socket.off('newNotification');
//       socket.off('error');
//     };
//   }, [currentUser, setNotifications, t]);

//   const openEvent = (eventId) => {
//     //console.log(`Open event with ID: ${eventId}`);
//   };

//   const sortedNotifications = [...notifications].sort((a, b) => {
//     const aTime = a.createdAt?._seconds || 0;
//     const bTime = b.createdAt?._seconds || 0;
//     return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
//   });

//   const groupedNotifications = sortedNotifications.reduce((acc, notif) => {
//     if (!acc[notif.tipo]) acc[notif.tipo] = [];
//     acc[notif.tipo].push(notif);
//     return acc;
//   }, {});

//   return (
//     <Box p={3}>
//       <Typography variant="h4" component="h2" gutterBottom>
//         {t('common.notification_history')}
//       </Typography>

//       <Box mb={2}>
//         <Typography variant="h6">{t('common.filter_by')}</Typography>
//         <Button onClick={() => setFilter('all')}>{t('common.all')}</Button>
//         <Button onClick={() => setFilter('convite')}>{t('common.invites')}</Button>
//       </Box>

//       <Box mb={2}>
//         <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
//           <MenuItem value="desc">{t('common.sort_desc')}</MenuItem>
//           <MenuItem value="asc">{t('common.sort_asc')}</MenuItem>
//         </Select>
//       </Box>

//       {Object.entries(groupedNotifications).map(([tipo, notifs]) => (
//         <Box key={tipo} mb={3}>
//           <Typography variant="h6">{tipo.charAt(0).toUpperCase() + tipo.slice(1)}s</Typography>
//           <Grid container spacing={3}>
//             {notifs.slice(0, page * 10).map((notification) => (
//               <NotificationCard
//                 key={notification.id}
//                 notification={notification}
//                 markAsRead={markAsRead}
//                 openEvent={openEvent}
//               />
//             ))}
//           </Grid>
//         </Box>
//       ))}

//       <Button
//         onClick={() => setPage((prev) => prev + 1)}
//         disabled={sortedNotifications.length <= page * 10}
//       >
//         {t('common.load_more')}
//       </Button>

//       {actionFeedback && (
//         <Snackbar
//           open={Boolean(actionFeedback)}
//           autoHideDuration={3000}
//           onClose={() => setActionFeedback(null)}
//           message={actionFeedback.message}
//         />
//       )}
//     </Box>
//   );
// };

// export default NotificationHistory;

const NotificationHistory = () => {
  <div>NOTIFICATION HISTORY</div>
}

export default NotificationHistory;