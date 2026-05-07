/**
 * Mock de firebase/auth (node_module)
 *
 * Uso nos testes:
 *   jest.mock('firebase/auth')
 *
 * O mock é aplicado automaticamente quando o arquivo existe nesta pasta
 * e jest.mock() é chamado no teste.
 */

const mockUser = {
  uid: 'mock-uid',
  email: 'mock@example.com',
  displayName: 'Mock User',
  getIdToken: jest.fn().mockResolvedValue('mock-firebase-token'),
  getIdTokenResult: jest.fn().mockResolvedValue({
    token: 'mock-firebase-token',
    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
  }),
};

const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockUser);
    return jest.fn(); // unsubscribe
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
};

module.exports = {
  getAuth: jest.fn().mockReturnValue(mockAuth),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
  signOut: jest.fn().mockResolvedValue(undefined),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(mockUser);
    return jest.fn(); // unsubscribe
  }),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  OAuthProvider: jest.fn().mockImplementation(() => ({})),
  signInWithPopup: jest.fn().mockResolvedValue({ user: mockUser }),
  setPersistence: jest.fn().mockResolvedValue(undefined),
  browserLocalPersistence: 'LOCAL',
  // Helpers
  _mockUser: mockUser,
  _mockAuth: mockAuth,
};
