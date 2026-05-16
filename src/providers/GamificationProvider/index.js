// src/providers/GamificationProvider/index.js
import React, {
  createContext, useContext, useReducer,
  useEffect, useCallback, useState, useRef,
} from 'react';
import { serviceLocator, serviceEventHub } from '../../core/services/BaseService';
import { AUTH_EVENTS } from '../../core/constants/events';
import {
  gamificationReducer,
  initialGamificationState,
  GAMIFICATION_ACTIONS,
} from '../../reducers/gamification/gamificationReducer';
import { getLevelInfo } from '../../components/Gamification/constants';
import AchievementModal from '../../components/Gamification/AchievementModal';

const GamificationContext = createContext(null);
const MODULE_NAME = 'gamification';

export const GamificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gamificationReducer, initialGamificationState);
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitializedRef = useRef(false);
  const [selosCatalog, setSelosCatalog] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const streakUpdatedRef = useRef(false);

  // Obtém serviços
  const getService = useCallback(() => {
    try {
      return serviceLocator.get(MODULE_NAME);
    } catch {
      return null;
    }
  }, []);

  const getAuthState = useCallback(() => {
    try {
      return serviceLocator.get('store').getState()?.auth || {};
    } catch {
      return {};
    }
  }, []);

  // ── Carregamento inicial ──────────────────────────

  const loadGamification = useCallback(async () => {
    const svc = getService();
    if (!svc) return;

    dispatch({ type: GAMIFICATION_ACTIONS.SET_LOADING, payload: true });

    try {
      const [result, catalogResult] = await Promise.all([
        svc.getMe(),
        svc.getAllSelos().catch(() => null),
      ]);
      if (result.success) {
        dispatch({ type: GAMIFICATION_ACTIONS.SET_STATE, payload: result.gamification });
        dispatch({ type: GAMIFICATION_ACTIONS.SET_SELOS, payload: result.selos || [] });
        dispatch({ type: GAMIFICATION_ACTIONS.SET_TASKS, payload: result.tasks || [] });
      }
      if (catalogResult?.selos) {
        setSelosCatalog(catalogResult.selos);
      }
    } catch (err) {
      dispatch({ type: GAMIFICATION_ACTIONS.SET_ERROR, payload: err.message });
    }
  }, [getService]);

  const loadTasks = useCallback(async () => {
    const svc = getService();
    if (!svc) return;

    try {
      const result = await svc.getTasks();
      if (result.success) {
        dispatch({ type: GAMIFICATION_ACTIONS.SET_TASKS, payload: result.tasks });
      }
    } catch {
      // silent fail
    }
  }, [getService]);

  // ── Streak diário (uma vez por sessão) ───────────

  const triggerDailyStreak = useCallback(async () => {
    if (streakUpdatedRef.current) return;
    const svc = getService();
    if (!svc) return;

    streakUpdatedRef.current = true;
    try {
      const result = await svc.updateStreak();
      if (result.success) {
        dispatch({
          type: GAMIFICATION_ACTIONS.STREAK_UPDATED,
          payload: { streakDays: result.streakDays, longestStreak: result.longestStreak },
        });

        // Celebração se atingiu marco de streak
        if (result.streakDays && [7, 30, 100, 365].includes(result.streakDays)) {
          // Dispara tarefa de streak correspondente
          await svc.triggerEvent('daily_access').catch(() => {});
        }
      }
    } catch {
      streakUpdatedRef.current = false; // permite retry
    }
  }, [getService]);

  // ── Completar tarefa ──────────────────────────────

  const completeTask = useCallback(async (taskSlug) => {
    const svc = getService();
    if (!svc) return null;

    try {
      const result = await svc.completeTask(taskSlug);

      if (result.success) {
        dispatch({
          type: GAMIFICATION_ACTIONS.TASK_COMPLETED,
          payload: { taskSlug, xpGranted: result.xpGranted, coinsGranted: result.coinsGranted },
        });

        // Level up → fila de celebração
        if (result.leveledUp) {
          const levelInfo = getLevelInfo(result.newLevel);
          const prevLevelInfo = getLevelInfo(result.newLevel - 1);
          dispatch({
            type: GAMIFICATION_ACTIONS.LEVEL_UP,
            payload: {
              newLevel: result.newLevel,
              levelName: levelInfo.name,
              levelColor: levelInfo.color,
            },
          });
          dispatch({
            type: GAMIFICATION_ACTIONS.QUEUE_ACHIEVEMENT,
            payload: {
              type: 'level_up',
              data: {
                old_level: result.newLevel - 1,
                new_level: result.newLevel,
                perks: levelInfo.perks || {},
              },
            },
          });
        }
      }

      return result;
    } catch (err) {
      return { success: false, message: err.message };
    }
  }, [getService]);

  // ── Pin de selo ───────────────────────────────────

  const toggleSeloPin = useCallback(async (userSeloId, isPinned) => {
    const svc = getService();
    if (!svc) return;

    try {
      await svc.toggleSeloPin(userSeloId, isPinned);
      dispatch({
        type: GAMIFICATION_ACTIONS.SELO_PIN_TOGGLED,
        payload: { userSeloId, isPinned },
      });
    } catch {
      // silent fail
    }
  }, [getService]);

  // ── Disparar evento de domínio ────────────────────

  const triggerEvent = useCallback(async (event, metadata = {}) => {
    const svc = getService();
    if (!svc) return;

    try {
      const results = await svc.triggerEvent(event, metadata);

      // Verifica se houve level up nos resultados
      (results?.results || []).forEach(r => {
        if (r.leveledUp) {
          const levelInfo = getLevelInfo(r.newLevel);
          dispatch({
            type: GAMIFICATION_ACTIONS.QUEUE_ACHIEVEMENT,
            payload: {
              type: 'level_up',
              data: { old_level: r.newLevel - 1, new_level: r.newLevel, perks: levelInfo.perks || {} },
            },
          });
        }
      });

      // Recarrega estado após evento
      await loadGamification();
    } catch {
      // silent fail
    }
  }, [getService, loadGamification]);

  // ── Escutar eventos do service via EventHub ───────

  useEffect(() => {
    const unsubSelo = serviceEventHub.on(MODULE_NAME, 'SELO_GRANTED', (data) => {
      dispatch({ type: GAMIFICATION_ACTIONS.SELO_GRANTED, payload: data });
      dispatch({
        type: GAMIFICATION_ACTIONS.QUEUE_ACHIEVEMENT,
        payload: { type: 'new_selo', data },
      });
    });

    return () => {
      if (typeof unsubSelo === 'function') unsubSelo();
    };
  }, []);

  // ── Gerenciar fila de celebrações ─────────────────

  useEffect(() => {
    if (state.achievementQueue.length > 0 && !modalOpen) {
      setModalOpen(true);
    }
  }, [state.achievementQueue, modalOpen]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    // Aguarda animação de saída antes de remover da fila
    setTimeout(() => {
      dispatch({ type: GAMIFICATION_ACTIONS.DEQUEUE_ACHIEVEMENT });
    }, 300);
  }, []);

  // ── Inicialização ─────────────────────────────────

  useEffect(() => {
    const { isAuthenticated, currentUser } = getAuthState();
    if (isAuthenticated && currentUser && !isInitializedRef.current) {
      isInitializedRef.current = true;
      setIsInitialized(true);
      loadGamification();
      triggerDailyStreak();
    }
  }, [getAuthState, isInitialized, loadGamification, triggerDailyStreak]);

  // ── Re-inicializar quando auth ficar pronto após o mount ──
  useEffect(() => {
    const handleAuthReady = () => {
      if (!isInitializedRef.current) {
        isInitializedRef.current = true;
        setIsInitialized(true);
        loadGamification();
        triggerDailyStreak();
      }
    };

    const unsubValid = serviceEventHub.on('auth', AUTH_EVENTS.AUTH_SESSION_VALID, handleAuthReady);
    const unsubSignIn = serviceEventHub.on('auth', AUTH_EVENTS.USER_SIGNED_IN, handleAuthReady);

    return () => {
      if (typeof unsubValid === 'function') unsubValid();
      if (typeof unsubSignIn === 'function') unsubSignIn();
    };
  }, [loadGamification, triggerDailyStreak]);

  // ── Valor do contexto ─────────────────────────────

  const currentAchievement = state.achievementQueue[0] || null;

  const value = {
    // Estado
    gamification: state.gamification,
    tasks: state.tasks,
    selos: state.selos,
    selosCatalog,
    loading: state.loading,
    error: state.error,

    // Computed
    currentLevel: state.gamification?.current_level ?? 1,
    totalXP: state.gamification?.total_xp ?? 0,
    eloCoins: state.gamification?.elo_coins ?? 0,
    streakDays: state.gamification?.streak_days ?? 0,
    longestStreak: state.gamification?.longest_streak ?? 0,
    pinnedSelos: (state.selos || []).filter(s => s.is_pinned).slice(0, 6),

    // Ações
    loadGamification,
    loadTasks,
    completeTask,
    toggleSeloPin,
    triggerEvent,
    triggerDailyStreak,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}

      {/* Modal de celebração — gerenciado pelo provider */}
      {currentAchievement && (
        <AchievementModal
          open={modalOpen}
          onClose={handleModalClose}
          type={currentAchievement.type}
          data={currentAchievement.data}
        />
      )}
    </GamificationContext.Provider>
  );
};

// Hook de consumo
export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification deve ser usado dentro de <GamificationProvider>');
  }
  return ctx;
};

export default GamificationProvider;
