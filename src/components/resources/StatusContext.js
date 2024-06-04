import React, { createContext, useContext, useState, useEffect } from 'react';

const StatusContext = createContext();

export const useStatus = () => useContext(StatusContext);

export const StatusProvider = ({ children }) => {
  const [statusQueue, setStatusQueue] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [status, setStatus] = useState({ color: 'azul', message: 'Inicializando...' });

  const enqueueStatus = (newStatus) => {
    setStatusQueue(prevQueue => [...prevQueue, newStatus]);
    if (!isDisplaying) {
      displayNextStatus();
    }
  };

  const displayNextStatus = () => {
    if (statusQueue.length > 0 && !isDisplaying) {
      const nextStatus = statusQueue.shift();
      setStatus(nextStatus);
      setStatusHistory(prevHistory => [...prevHistory, nextStatus]);
      setIsDisplaying(true);
      setTimeout(() => {
        setIsDisplaying(false);
        if (statusQueue.length > 0) {
          displayNextStatus();
        }
      }, nextStatus.priority === 'urgent' ? 2000 : 5000);
    }
  };

  useEffect(() => {
    if (!isDisplaying && statusQueue.length > 0) {
      displayNextStatus();
    }
  }, [isDisplaying, statusQueue]);

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    setStatusHistory(prevHistory => [...prevHistory, newStatus]);
    setIsDisplaying(true);
    setTimeout(() => {
      setIsDisplaying(false);
      if (statusQueue.length > 0) {
        displayNextStatus();
      }
    }, newStatus.priority === 'urgent' ? 2000 : 5000);
  };

  const clearStatusHistory = () => {
    setStatusHistory([]);
  };

  return (
    <StatusContext.Provider value={{
      status,
      statusHistory,
      enqueueStatus,
      updateStatus, // Certifique-se de que estamos expondo updateStatus, não setStatus.
      clearStatusHistory
    }}>
      {children}
    </StatusContext.Provider>
  );
};

export default StatusProvider;
