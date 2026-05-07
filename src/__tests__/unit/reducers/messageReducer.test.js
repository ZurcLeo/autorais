import { messageReducer } from '../../../reducers/messages/messageReducer';
import { initialMessageState } from '../../../core/constants/initialState';
import { MESSAGE_ACTIONS } from '../../../core/constants/actions';

beforeAll(() => { jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterAll(() => { jest.restoreAllMocks(); });

describe('messageReducer', () => {
  it('retorna estado inicial quando chamado sem ação', () => {
    expect(messageReducer(undefined, { type: '@@INIT' })).toEqual(initialMessageState);
  });

  it('ação desconhecida retorna o estado atual sem mutação', () => {
    const state = { ...initialMessageState };
    expect(messageReducer(state, { type: 'X' })).toBe(state);
  });

  it('FETCH_START seta isLoading: true e limpa error', () => {
    const state = { ...initialMessageState, error: 'err' };
    const result = messageReducer(state, { type: MESSAGE_ACTIONS.FETCH_START });
    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  it('FETCH_MESSAGE_SUCCESS popula messages e seta isLoading: false', () => {
    const messages = [{ id: 'm1' }, { id: 'm2' }];
    const result = messageReducer(
      { ...initialMessageState, isLoading: true },
      { type: MESSAGE_ACTIONS.FETCH_MESSAGE_SUCCESS, payload: { messages, conversationId: 'c1' } }
    );
    expect(result.messages).toEqual(messages);
    expect(result.isLoading).toBe(false);
    expect(result.activeChat).toBe('c1');
  });

  it('FETCH_FAILURE seta isLoading: false e error', () => {
    const result = messageReducer(
      { ...initialMessageState, isLoading: true },
      { type: MESSAGE_ACTIONS.FETCH_FAILURE, payload: { error: 'falha' } }
    );
    expect(result.isLoading).toBe(false);
    expect(result.error).toBe('falha');
  });

  it('RECONCILE_MESSAGE substitui mensagem temporária pela permanente', () => {
    const tempMsg = { id: 'temp-1', sending: true };
    const permanentMsg = { id: 'perm-1', content: 'oi' };
    const state = { ...initialMessageState, messages: [tempMsg] };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.RECONCILE_MESSAGE,
      payload: { temporaryId: 'temp-1', permanentMessage: permanentMsg },
    });
    expect(result.messages[0]).toMatchObject({ ...permanentMsg, sending: false, temporaryId: undefined });
    expect(result.messages[0].id).toBe('perm-1');
  });

  it('MESSAGE_SEND_FAILED marca mensagem com error: true', () => {
    const msg = { id: 'm1', sending: true };
    const state = { ...initialMessageState, messages: [msg] };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.MESSAGE_SEND_FAILED,
      payload: { messageId: 'm1', error: 'timeout' },
    });
    expect(result.messages[0].sending).toBe(false);
    expect(result.messages[0].error).toBe(true);
    expect(result.messages[0].errorMessage).toBe('timeout');
  });

  it('UPDATE_MESSAGES adiciona mensagem nova quando não existe na lista', () => {
    const newMsg = { id: 'new1', uidRemetente: 'u1', uidDestinatario: 'u2' };
    const result = messageReducer(initialMessageState, {
      type: MESSAGE_ACTIONS.UPDATE_MESSAGES,
      payload: { message: newMsg },
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].id).toBe('new1');
  });

  it('UPDATE_MESSAGES não duplica mensagem existente (atualiza status)', () => {
    const msg = { id: 'dup', uidRemetente: 'u1', uidDestinatario: 'u2', lido: false };
    const state = { ...initialMessageState, messages: [msg] };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.UPDATE_MESSAGES,
      payload: { message: { ...msg, lido: true } },
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].lido).toBe(true);
  });

  it('UPDATE_MESSAGES com deleted: true remove mensagem', () => {
    const state = { ...initialMessageState, messages: [{ id: 'm1' }, { id: 'm2' }] };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.UPDATE_MESSAGES,
      payload: { deleted: true, messageId: 'm1' },
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].id).toBe('m2');
  });

  it('UPDATE_CONVERSATION_MESSAGES substitui mensagens da conversa e atualiza latestMessages', () => {
    const existingMsg = { id: 'old', uidRemetente: 'u1', uidDestinatario: 'u2' };
    const newMsg = { id: 'new', uidRemetente: 'u1', uidDestinatario: 'u2' };
    const state = { ...initialMessageState, messages: [existingMsg] };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.UPDATE_CONVERSATION_MESSAGES,
      payload: {
        conversationId: 'u1_u2',
        messages: [newMsg],
        userIds: ['u1', 'u2'],
      },
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].id).toBe('new');
    expect(result.latestMessages['u1_u2']).toEqual(newMsg);
  });

  it('UPDATE_LATEST_MESSAGE atualiza latestMessages pelo conversationId', () => {
    const msg = { id: 'm1' };
    const result = messageReducer(initialMessageState, {
      type: MESSAGE_ACTIONS.UPDATE_LATEST_MESSAGE,
      payload: { conversationId: 'c1', message: msg },
    });
    expect(result.latestMessages['c1']).toEqual(msg);
  });

  it('UPDATE_UNREAD_COUNT atualiza unreadCounts pelo conversationId', () => {
    const result = messageReducer(initialMessageState, {
      type: MESSAGE_ACTIONS.UPDATE_UNREAD_COUNT,
      payload: { conversationId: 'c1', count: 5 },
    });
    expect(result.unreadCounts['c1']).toBe(5);
  });

  it('UPDATE_MESSAGE_STATUS atualiza status da mensagem para "visto"', () => {
    const msg = { id: 'm1', enviado: false, entregue: false, lido: false, visto: false };
    const state = { ...initialMessageState, messages: [msg] };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.UPDATE_MESSAGE_STATUS,
      payload: { messageId: 'm1', status: 'visto' },
    });
    expect(result.messages[0].visto).toBe(true);
    expect(result.messages[0].lido).toBe(true);
    expect(result.messages[0].entregue).toBe(true);
  });

  it('UPDATE_ACTIVE_CHATS substitui conversations', () => {
    const convs = [{ id: 'c1' }];
    const result = messageReducer(initialMessageState, {
      type: MESSAGE_ACTIONS.UPDATE_ACTIVE_CHATS,
      payload: { conversations: convs },
    });
    expect(result.conversations).toEqual(convs);
  });

  it('UPDATE_TYPING_STATUS atualiza typingStatus por conversa e usuário', () => {
    const state = { ...initialMessageState, typingStatus: {} };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.UPDATE_TYPING_STATUS,
      payload: { conversationId: 'c1', userId: 'u1', isTyping: true },
    });
    expect(result.typingStatus['c1']['u1']).toBe(true);
  });

  it('UPDATE_MESSAGE_DATA_LEITURA seta lido: true e dataLeitura', () => {
    const msg = { id: 'm1', lido: false };
    const state = { ...initialMessageState, messages: [msg] };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.UPDATE_MESSAGE_DATA_LEITURA,
      payload: { messageId: 'm1', dataLeitura: '2024-01-01' },
    });
    expect(result.messages[0].lido).toBe(true);
    expect(result.messages[0].visto).toBe(true);
    expect(result.messages[0].dataLeitura).toBe('2024-01-01');
  });

  it('SET_ACTIVE_CHAT atualiza activeChat com conversationId', () => {
    const result = messageReducer(initialMessageState, {
      type: MESSAGE_ACTIONS.SET_ACTIVE_CHAT,
      payload: { conversationId: 'chat123' },
    });
    expect(result.activeChat).toBe('chat123');
  });

  it('SET_ACTIVE_CHAT com payload inválido retorna estado sem mudança', () => {
    const state = { ...initialMessageState };
    const result = messageReducer(state, {
      type: MESSAGE_ACTIONS.SET_ACTIVE_CHAT,
      payload: null,
    });
    expect(result).toBe(state);
  });

  it('CLEAR_STATE retorna ao estado inicial', () => {
    const dirty = {
      ...initialMessageState,
      messages: [{ id: 'm1' }],
      isLoading: true,
    };
    const result = messageReducer(dirty, { type: MESSAGE_ACTIONS.CLEAR_STATE });
    expect(result).toEqual(initialMessageState);
  });
});
