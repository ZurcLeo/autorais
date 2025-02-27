// // src/context/MessageContext.js
// import React, { createContext, useContext, useMemo, useCallback } from 'react';
// import { useAuth } from './AuthContext';
// import { useRootState } from '../core/states/RootStateProvider';
// import { useMessageState } from '../hooks/messages/useMessageState';
// import { useMessagePolling } from '../hooks/messages/useMessagePolling';
// import { useMessageOperations } from '../hooks/messages/useMessageOperations';
// // import loggerSystem from '../utils/loggerSystem';

// const MessageContext = createContext();
// const MODULE_NAME = 'MessageProvider';

// const CACHE_CONFIG = {
//   NOTIFICATIONS_KEY: 'user:messages',
//   CACHE_TIME: 5 * 60 * 1000, // 5 minutes
//   STALE_TIME: 30 * 1000,     // 30 seconds
//   POLLING_INTERVAL: 30 * 1000 // 30 seconds
// };

// export const MessageProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   // const { syncStateUpdate, invalidateCache, markReady } = useRootState();
//   const [state, dispatch] = useMessageState();
  
//   const userId = currentUser?.uid;

//   // Message processing utility
//   const processMessage = useCallback((message) => {
//     if (message.mensagem || message.conteudo) {
//       return {
//         id: message.id || message._id,
//         content: message.mensagem || message.conteudo,
//         senderId: message.userId || message.uidRemetente,
//         receiverId: message.uidDestinatario,
//         timestamp: message.timestamp,
//         read: message.lido || false,
//         nome: message.nome,
//         foto: message.foto
//       };
//     }
    
//     if (message._fieldsProto) {
//       const fields = message._fieldsProto;
//       return {
//         id: message._ref?._path?.segments?.slice(-1)[0],
//         content: fields.mensagem?.stringValue,
//         senderId: fields.userId?.stringValue,
//         receiverId: fields.uidDestinatario?.stringValue,
//         timestamp: new Date(message._createTime._seconds * 1000).toISOString(),
//         read: fields.lido?.booleanValue || false,
//         nome: fields.nome?.stringValue,
//         foto: fields.foto?.stringValue
//       };
//     }
  
//     return message;
//   }, []);

//   // Use custom hooks
//   useMessagePolling(userId, dispatch, processMessage);

//   const { markMessageAsRead } = useMessageOperations(
//     userId,
//     state,
//     dispatch,
//     syncStateUpdate,
//     processMessage,
//     markReady
//   );

//   // Get chat messages
//   const getChatMessages = useCallback((otherUserId) => {
//     return state.messages.filter(msg => 
//       (msg.senderId === userId && msg.receiverId === otherUserId) ||
//       (msg.senderId === otherUserId && msg.receiverId === userId)
//     ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
//   }, [state.messages, userId]);

//   // Context value
//   const value = useMemo(() => ({
//     messages: state.messages,
//     unreadCount: state.unreadCount,
//     latestMessage: state.latestMessage,
//     activeChats: state.activeChats,
//     loading: state.loading,
//     error: state.error,
//     markMessageAsRead,
//     getChatMessages
//   }), [
//     state,
//     markMessageAsRead,
//     getChatMessages
//   ]);

//   return (
//     <MessageContext.Provider value={value}>
//       {children}
//     </MessageContext.Provider>
//   );
// };

// export const useMessages = () => {
//   const context = useContext(MessageContext);
//   if (context === undefined) {
//     throw new Error('useMessages must be used within a MessageProvider');
//   }
//   return context;
// };