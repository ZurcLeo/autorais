/**
 * Mock de src/firebaseConfig.js
 *
 * Evita que o Firebase tente inicializar com env vars reais nos testes.
 * Uso: jest.mock('../../firebaseConfig') (caminho relativo ao test file)
 */

const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signOut: jest.fn().mockResolvedValue(undefined),
};

module.exports = {
  auth: mockAuth,
  app: {},
};
