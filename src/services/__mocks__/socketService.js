/**
 * Mock de src/services/socketService.js
 *
 * Uso: jest.mock('../../services/socketService') (caminho relativo ao test file)
 *
 * Para verificar listener leaks nos testes de provider:
 *   const socket = require('../../services/socketService');
 *   expect(socket.on).toHaveBeenCalledWith('event-name', expect.any(Function));
 *   expect(socket.off).toHaveBeenCalledWith('event-name', expect.any(Function));
 */

const socketService = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  connected: true,
  connect: jest.fn(),
  disconnect: jest.fn(),
  // Helpers para simular eventos recebidos do servidor
  _simulateEvent: (event, data) => {
    const calls = socketService.on.mock.calls;
    const handler = calls.find(([e]) => e === event)?.[1];
    if (handler) handler(data);
  },
};

module.exports = socketService;
