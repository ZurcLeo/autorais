import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StatusContext = createContext();

export const useStatus = () => useContext(StatusContext);

export const StatusProvider = ({ children }) => {
  const [statusQueue, setStatusQueue] = useState([]);
  const [status, setStatus] = useState({ color: 'azul', message: 'Inicializando...', display: false });
  const [timeoutId, setTimeoutId] = useState(null);

  const displayNextStatus = useCallback(() => {
    const [nextStatus, ...remainingQueue] = statusQueue;
    if (nextStatus) {
      setStatus({ ...nextStatus, display: true });
      setStatusQueue(remainingQueue);
      const id = setTimeout(() => {
        setStatus(prev => ({ ...prev, display: false }));
      }, nextStatus.priority === 'urgent' ? 2000 : 5000);
      setTimeoutId(id);
    }
  }, [statusQueue]);

  useEffect(() => {
    if (!status.display && statusQueue.length > 0) {
      displayNextStatus();
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [status.display, statusQueue, displayNextStatus, timeoutId]);

  const enqueueStatus = useCallback((newStatus) => {
    setStatusQueue(prevQueue => [...prevQueue, newStatus]);
  }, []);

  const updateStatus = useCallback((newStatus) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setStatus({ ...newStatus, display: true });
    const id = setTimeout(() => {
      setStatus(prev => ({ ...prev, display: false }));
    }, newStatus.priority === 'urgent' ? 2000 : 5000);
    setTimeoutId(id);
  }, [timeoutId]);

  return (
    <StatusContext.Provider value={{
      status,
      enqueueStatus,
      updateStatus,
    }}>
      {children}
    </StatusContext.Provider>
  );
};

export default StatusProvider;
