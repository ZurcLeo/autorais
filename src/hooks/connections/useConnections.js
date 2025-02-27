import { useContext } from 'react';
import { ConnectionContext } from '../context/ConnectionContext';

export function useConnections() {
  const context = useContext(ConnectionContext);
  
  if (context === undefined) {
    throw new Error('useConnections must be used within a ConnectionProvider');
  }
  
  return context;
}