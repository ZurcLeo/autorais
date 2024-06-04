import React, { createContext, useContext, useState, useEffect } from 'react';

const StatusContext = createContext();

export const useStatus = () => useContext(StatusContext);

export const StatusProvider = ({ children }) => {
  const [statusQueue, setStatusQueue] = useState([]);
  const [status, setStatus] = useState({ color: 'azul', message: 'Inicializando...', display: false });

  const displayNextStatus = () => {
    const [nextStatus, ...remainingQueue] = statusQueue;
    if (nextStatus) {
      setStatus({ ...nextStatus, display: true });
      setStatusQueue(remainingQueue);
      setTimeout(() => {
        setStatus(prev => ({ ...prev, display: false }));
        if (remainingQueue.length > 0) {
          displayNextStatus();
        }
      }, nextStatus.priority === 'urgent' ? 2000 : 5000);
    }
  };

  useEffect(() => {
    if (!status.display && statusQueue.length > 0) {
      displayNextStatus();
    }
  }, [status.display, statusQueue]);

  const enqueueStatus = (newStatus) => {
    setStatusQueue(prevQueue => [...prevQueue, newStatus]);
  };

  const updateStatus = (newStatus) => {
    setStatus({ ...newStatus, display: true });
    setTimeout(() => {
      setStatus(prev => ({ ...prev, display: false }));
      if (statusQueue.length > 0) {
        displayNextStatus();
      }
    }, newStatus.priority === 'urgent' ? 2000 : 5000);
  };

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
