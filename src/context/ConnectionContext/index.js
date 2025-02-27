import { createContext } from 'react';

// Criar o contexto com um valor inicial (facilitando o intellisense)
export const ConnectionContext = createContext({
  friends: [],
  bestFriends: [],
  invitations: [],
  searchResults: [],
  loading: true,
  searching: false,
  error: null,
  addBestFriend: () => Promise.resolve(),
  removeBestFriend: () => Promise.resolve(),
  deleteConnection: () => Promise.resolve(),
  createConnectionRequest: () => Promise.resolve(),
  searchUsers: () => Promise.resolve([]),
  refreshConnections: () => Promise.resolve()
});