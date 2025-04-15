// src/reducers/messages/messageReducer.js

import {MESSAGE_ACTIONS} from '../../core/constants/actions';
import {initialMessageState} from '../../core/constants/initialState';

export const messageReducer = (state = initialMessageState, action) => {
    switch (action.type) {
            // Ações de busca
        case MESSAGE_ACTIONS.FETCH_START:
            return {
                ...state,
                isLoading: true,
                error: null
            };

            case MESSAGE_ACTIONS.FETCH_SUCCESS:
                return {
                  ...state,
                  messages: action.payload.messages || [],
                  // Opcional: armazenar conversationId se necessário
                  activeChat: action.payload.conversationId || state.activeChat,
                  isLoading: false
                };

        case MESSAGE_ACTIONS.FETCH_FAILURE:
            return {
                ...state,
                isLoading: false,
                error: action.payload.error
            };

        case MESSAGE_ACTIONS.RECONCILE_MESSAGE:
            const {temporaryId, permanentMessage} = action.payload;

            return {
                ...state,
                messages: state
                    .messages
                    .map(
                        msg => msg.id === temporaryId
                            ? {
                                ...permanentMessage,
                                sending: false,
                                temporaryId: undefined
                            }
                            : msg
                    ),
                // Também atualizar nas últimas mensagens se necessário
                latestMessages: Object
                    .entries(state.latestMessages)
                    .reduce((acc, [convId, lastMsg]) => {
                        if (lastMsg.id === temporaryId) {
                            acc[convId] = {
                                ...permanentMessage,
                                sending: false,
                                temporaryId: undefined
                            };
                        } else {
                            acc[convId] = lastMsg;
                        }
                        return acc;
                    }, {})
            };

        case MESSAGE_ACTIONS.MESSAGE_SEND_FAILED:
            return {
                ...state,
                messages: state
                    .messages
                    .map(
                        msg => msg.id === action.payload.messageId
                            ? {
                                ...msg,
                                sending: false,
                                error: true,
                                errorMessage: action.payload.error
                            }
                            : msg
                    )
            };

        case MESSAGE_ACTIONS.UPDATE_CONVERSATION_MESSAGES:
            const {conversationId, messages, userIds} = action.payload;

            // Garantindo que userIds existe
            const [userId1, userId2] = userIds || conversationId.split('_');

            return {
                ...state,
                messages: [
                    // Filtrar mensagens que não pertencem a esta conversa
                    ...state
                        .messages
                        .filter(
                            msg => !(msg.uidRemetente === userId1 && msg.uidDestinatario === userId2) && !(msg.uidRemetente === userId2 && msg.uidDestinatario === userId1)
                        ),
                    // Adicionar as novas mensagens
                    ...messages
                ],
                latestMessages: messages.length > 0
                    ? {
                        ...state.latestMessages,
                        [conversationId]: messages[messages.length - 1]
                    }
                    : state.latestMessages
            };

        case MESSAGE_ACTIONS.UPDATE_MESSAGES:
            if (action.payload.message) {
                const newMessage = action.payload.message;
                const conversationId = action.payload.conversationId || [newMessage.uidRemetente, newMessage.uidDestinatario]
                    .sort()
                    .join('_');

                // Verificar se a mensagem já existe
                const messageExists = Array.isArray(state.messages) && state
                    .messages
                    .some(msg => msg.id === newMessage.id);

                if (!messageExists) {
                    // Adicionar mensagem nova
                    const updatedMessages = [
                        ...state.messages,
                        newMessage
                    ];

                    // Atualizar a conversa correspondente (se existir)
                    let updatedConversations = [...state.conversations];
                    const conversationIndex = updatedConversations.findIndex(
                        c => c.id === conversationId
                    );

                    if (conversationIndex >= 0) {
                        // Se a conversa existir, atualizar a última mensagem
                        updatedConversations[conversationIndex] = {
                            ...updatedConversations[conversationIndex],
                            lastMessage: newMessage,
                            // Incrementar contador apenas se for uma mensagem recebida não lida Usando o
                            // destinatário da mensagem atual como referência, não state.currentUserId
                            unreadCount: action.payload.isIncoming && !newMessage.lido
                                ? (updatedConversations[conversationIndex].unreadCount || 0) + 1
                                : updatedConversations[conversationIndex].unreadCount
                        };
                    }

                    return {
                        ...state,
                        messages: updatedMessages,
                        conversations: updatedConversations,
                        latestMessages: {
                            ...state.latestMessages,
                            [conversationId]: newMessage
                        }
                    };
                }

                // Atualização de status de mensagem existente
                return {
                    ...state,
                    messages: state
                        .messages
                        .map(
                            msg => msg.id === newMessage.id
                                ? {
                                    ...msg,
                                    ...newMessage
                                }
                                : msg
                        )
                };
            }

            // Caso de exclusão de mensagem
            if (action.payload.deleted) {
                return {
                    ...state,
                    messages: state
                        .messages
                        .filter(msg => msg.id !== action.payload.messageId)
                };
            }

            return state;

        case MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE:
            return {
                ...state,
                latestMessages: {
                    ...state.latestMessages,
                    [action.payload.conversationId]: action.payload.message
                }
            };

        case MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT:
            return {
                ...state,
                unreadCounts: {
                    ...state.unreadCounts,
                    [action.payload.conversationId]: action.payload.count
                }
            };

        case MESSAGE_ACTIONS.UPDATE_MESSAGE_STATUS:
            return {
                ...state,
                messages: state
                    .messages
                    .map(
                        msg => msg.id === action.payload.messageId
                            ? updateMessageStatus(msg, action.payload.status)
                            : msg
                    )
            };

        case MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS:
            return {
                ...state,
                conversations: action.payload.conversations || []
            };

        case MESSAGE_ACTIONS.UPDATE_TYPING_STATUS:
            { // Adicionei as chaves para delimitar o bloco
                const {conversationId, userId, isTyping} = action.payload;
                return {
                    ...state,
                    typingStatus: {
                        ...state.typingStatus,
                        [conversationId]: {
                            ...(state.typingStatus[conversationId] || {}),
                            [userId]: isTyping
                        }
                    }
                }
            };

        case MESSAGE_ACTIONS.UPDATE_MESSAGE_DATA_LEITURA:
            return {
                ...state,
                messages: state
                    .messages
                    .map(
                        msg => msg.id === action.payload.messageId
                            ? {
                                ...msg,
                                dataLeitura: action.payload.dataLeitura,
                                lido: true,
                                visto: true
                            }
                            : msg
                    )
            };

            case MESSAGE_ACTIONS.SET_ACTIVE_CHAT:
                const newActiveChat = action.payload?.conversationId || action.payload;
                
                console.log('messageReducer - SET_ACTIVE_CHAT:', newActiveChat);
                
                if (!newActiveChat) {
                  console.warn('messageReducer - SET_ACTIVE_CHAT recebeu payload inválido:', action.payload);
                  return state;
                }
                
                return {
                  ...state,
                  activeChat: newActiveChat
                };

        case MESSAGE_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: action.payload.error
            };

        case MESSAGE_ACTIONS.CLEAR_STATE:
            return initialMessageState;

        default:
            return state;
    }
};

// Funções auxiliares
const isMessageInConversation = (message, conversationId) => {
    if (!message || !conversationId) 
        return false;
    
    const userIds = conversationId.split('_');
    return (
        message.uidRemetente === userIds[0] && message.uidDestinatario === userIds[1]
    ) || (
        message.uidRemetente === userIds[1] && message.uidDestinatario === userIds[0]
    );
};

const updateMessageStatus = (message, status) => {
    const now = new Date().toISOString();

    switch (status) {
        case 'enviado':
            return {
                ...message,
                enviado: true
            };

        case 'entregue':
            return {
                ...message,
                enviado: true,
                entregue: true
            };

        case 'visto':
            return {
                ...message,
                enviado: true,
                entregue: true,
                lido: true,
                visto: true,
                dataLeitura: message.dataLeitura || now // Só atualiza se ainda não tiver data de leitura
            };

        case 'lido':
            return {
                ...message,
                lido: true,
                dataLeitura: message.dataLeitura || now // Só atualiza se ainda não tiver data de leitura
            };

        default:
            return message;
    }
};