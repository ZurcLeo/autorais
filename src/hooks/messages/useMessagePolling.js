// src/hooks/messages/useMessagePolling.js
import { useEffect, useRef } from 'react';
import { PollingService } from '../../utils/pollingService';
import messageService from '../../services/messageService';
import { MESSAGE_ACTIONS } from '../../reducers/messages/messageReducer';
import { globalCache } from '../../utils/cache/cacheManager';
import {coreLogger as CoreLogger} from '../../core/logging/CoreLogger';

// Cache configuration for messages
const CACHE_CONFIG = {
  MESSAGES_KEY: 'messages:all',
  UNREAD_KEY: 'messages:unread',
  LATEST_KEY: 'messages:latest',
  ACTIVE_CHATS_KEY: 'messages:active-chats',
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  STALE_TIME: 30 * 1000,     // 30 seconds
  POLLING_INTERVAL: 10 * 1000 // 10 seconds
};

export const useMessagePolling = (userId, dispatch, processMessage) => {
  // Use ref to maintain single instance of PollingService
  const pollingServiceRef = useRef(null);
  
  useEffect(() => {
    if (!userId) return;

    // Initialize polling service if not already created
    if (!pollingServiceRef.current) {
      pollingServiceRef.current = new PollingService();
    }

    const pollMessages = async () => {
      try {
        dispatch({ type: MESSAGE_ACTIONS.FETCH_START });

        // Check cache first
        const cachedMessages = globalCache.getItem(CACHE_CONFIG.MESSAGES_KEY);
        
        if (cachedMessages && !globalCache.isStale(CACHE_CONFIG.MESSAGES_KEY)) {
          // Use cached data
          dispatch({
            type: MESSAGE_ACTIONS.FETCH_SUCCESS,
            payload: {
              messages: cachedMessages,
              unreadCount: globalCache.getItem(CACHE_CONFIG.UNREAD_KEY) || 0,
              latestMessage: globalCache.getItem(CACHE_CONFIG.LATEST_KEY),
              activeChats: globalCache.getItem(CACHE_CONFIG.ACTIVE_CHATS_KEY) || new Set()
            }
          });
          return;
        }

        // Fetch fresh data if cache is stale or missing
        const messages = await messageService.fetchAllMessages(userId);
        const processedMessages = Array.isArray(messages) 
          ? messages.map(processMessage)
          : [];

        const unreadCount = processedMessages.filter(msg => 
          !msg.read && msg.receiverId === userId
        ).length;

        const latestMessage = processedMessages.length > 0
          ? processedMessages.reduce((latest, current) => 
              latest.timestamp > current.timestamp ? latest : current
            )
          : null;

        const activeChats = new Set(
          processedMessages.map(msg => 
            msg.senderId === userId ? msg.receiverId : msg.senderId
          )
        );

        // Update cache with fresh data
        globalCache.setItem(CACHE_CONFIG.MESSAGES_KEY, processedMessages, {
          cacheTime: CACHE_CONFIG.CACHE_TIME,
          staleTime: CACHE_CONFIG.STALE_TIME
        });

        globalCache.setItem(CACHE_CONFIG.UNREAD_KEY, unreadCount, {
          cacheTime: CACHE_CONFIG.CACHE_TIME,
          staleTime: CACHE_CONFIG.STALE_TIME
        });

        globalCache.setItem(CACHE_CONFIG.LATEST_KEY, latestMessage, {
          cacheTime: CACHE_CONFIG.CACHE_TIME,
          staleTime: CACHE_CONFIG.STALE_TIME
        });

        globalCache.setItem(CACHE_CONFIG.ACTIVE_CHATS_KEY, activeChats, {
          cacheTime: CACHE_CONFIG.CACHE_TIME,
          staleTime: CACHE_CONFIG.STALE_TIME
        });

        dispatch({
          type: MESSAGE_ACTIONS.FETCH_SUCCESS,
          payload: {
            messages: processedMessages,
            unreadCount,
            latestMessage,
            activeChats
          }
        });

        CoreLogger.logPerformance('MessagePolling', 'PollComplete', null, {
          messageCount: processedMessages.length,
          unreadCount,
          activeChatsCount: activeChats.size
        });

      } catch (error) {
        CoreLogger.logError('MessagePolling', error, {
          userId,
          action: 'pollMessages'
        });
        
        dispatch({
          type: MESSAGE_ACTIONS.FETCH_FAILURE,
          payload: error.message
        });
      }
    };

    pollingServiceRef.current.addTask('pollMessages', pollMessages, CACHE_CONFIG.POLLING_INTERVAL);

    // Initial poll
    pollMessages();

    return () => {
      if (pollingServiceRef.current) {
        pollingServiceRef.current.removeTask('pollMessages');
      }
    };
  }, [userId, dispatch, processMessage]);
};