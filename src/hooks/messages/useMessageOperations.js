// src/hooks/messages/useMessageOperations.js
import { useCallback } from 'react';
import messageService from '../../services/messageService';
import { MESSAGE_ACTIONS } from '../../reducers/messages/messageReducer';
import { showPromiseToast } from '../../utils/toastUtils';
import {coreLogger as CoreLogger} from '../../core/logging/CoreLogger';

export const useMessageOperations = (
  userId, 
  state, 
  dispatch, 
  syncStateUpdate, 
  processMessage,
  markReady
) => {
  const markMessageAsRead = useCallback(async (messageId) => {
    const startTime = performance.now();
    
    CoreLogger.logLifecycle('MessageOperations', 'StartingMarkMessageAsRead', {
      messageId,
      userId
    });
    
    return syncStateUpdate(async () => {
      try {
        const updatedMessages = state.messages.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        );
        
        const targetMessage = state.messages.find(msg => msg.id === messageId);
        
        if (!targetMessage) {
          const error = new Error(`Message ${messageId} not found`);
          CoreLogger.logError('MessageOperations', error);
          markReady('messages');
          throw error;
        }
        
        dispatch({
          type: MESSAGE_ACTIONS.UPDATE_MESSAGES,
          payload: updatedMessages
        });
        
        if (!targetMessage.read && targetMessage.receiverId === userId) {
          dispatch({
            type: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT,
            payload: state.unreadCount > 0 ? state.unreadCount - 1 : 0
          });
        }
        
        await messageService.markMessageAsRead(messageId);
        
        CoreLogger.logLifecycle('MessageOperations', 'MessageMarkedAsRead', {
          messageId,
          duration: performance.now() - startTime
        });
        
        markReady('messages');
        
      } catch (error) {
        CoreLogger.logError('MessageOperations', error, {
          phase: 'markMessageAsRead',
          messageId,
          userId
        });
        
        const messages = await messageService.fetchAllMessages(userId);
        dispatch({
          type: MESSAGE_ACTIONS.UPDATE_MESSAGES,
          payload: messages.map(processMessage)
        });
        
        markReady('messages');
        throw error;
      }
    }, { id: `mark-message-read-${messageId}` });
  }, [userId, state.messages, state.unreadCount, syncStateUpdate, processMessage, markReady]);

  return {
    markMessageAsRead
  };
};