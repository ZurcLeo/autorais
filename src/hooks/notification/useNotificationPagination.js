// hooks/useNotificationPagination.js
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function useNotificationPagination(notifications, isLoading) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [hasMore, setHasMore] = useState(true);
  const [paginatedNotifications, setPaginatedNotifications] = useState([]);
  
  // Ref para observar o último item para implementar infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Atualizar paginatedNotifications quando as notificações mudam
  useEffect(() => {
    setPaginatedNotifications(notifications.slice(0, page * ITEMS_PER_PAGE));
    setHasMore(notifications.length > page * ITEMS_PER_PAGE);
  }, [notifications, page]);

  // Efeito para carregar mais notificações quando o usuário rola para o final
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [inView, hasMore, isLoading]);

  return {
    page,
    setPage,
    hasMore,
    paginatedNotifications,
    loadMoreRef,
  };
}