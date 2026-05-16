// src/reducers/gamification/gamificationReducer.js
export const GAMIFICATION_ACTIONS = {
  SET_STATE:          'GAMIFICATION/SET_STATE',
  SET_TASKS:          'GAMIFICATION/SET_TASKS',
  SET_SELOS:          'GAMIFICATION/SET_SELOS',
  SET_LOADING:        'GAMIFICATION/SET_LOADING',
  SET_ERROR:          'GAMIFICATION/SET_ERROR',
  TASK_COMPLETED:     'GAMIFICATION/TASK_COMPLETED',
  LEVEL_UP:           'GAMIFICATION/LEVEL_UP',
  STREAK_UPDATED:     'GAMIFICATION/STREAK_UPDATED',
  SELO_GRANTED:       'GAMIFICATION/SELO_GRANTED',
  SELO_PIN_TOGGLED:   'GAMIFICATION/SELO_PIN_TOGGLED',
  XP_ADDED:           'GAMIFICATION/XP_ADDED',
  QUEUE_ACHIEVEMENT:  'GAMIFICATION/QUEUE_ACHIEVEMENT',
  DEQUEUE_ACHIEVEMENT:'GAMIFICATION/DEQUEUE_ACHIEVEMENT',
  RESET:              'GAMIFICATION/RESET',
};

export const initialGamificationState = {
  gamification: null,   // v_user_gamification row
  tasks: [],
  selos: [],
  loading: false,
  error: null,
  // Fila de celebrações (level ups e selos novos)
  achievementQueue: [], // [{ type: 'level_up'|'new_selo', data: {} }]
};

export function gamificationReducer(state = initialGamificationState, action) {
  switch (action.type) {

    case GAMIFICATION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case GAMIFICATION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case GAMIFICATION_ACTIONS.SET_STATE:
      return {
        ...state,
        gamification: action.payload,
        loading: false,
        error: null,
      };

    case GAMIFICATION_ACTIONS.SET_TASKS:
      return { ...state, tasks: action.payload };

    case GAMIFICATION_ACTIONS.SET_SELOS:
      return { ...state, selos: action.payload };

    case GAMIFICATION_ACTIONS.TASK_COMPLETED: {
      // Atualiza o status da tarefa na lista
      const updatedTasks = state.tasks.map(t =>
        t.slug === action.payload.taskSlug
          ? { ...t, status: 'completed', progress: t.target_count }
          : t
      );
      // Atualiza XP e coins no estado de gamificação
      const g = state.gamification;
      const updatedGamification = g ? {
        ...g,
        total_xp: g.total_xp + (action.payload.xpGranted || 0),
        elo_coins: g.elo_coins + (action.payload.coinsGranted || 0),
        tasks_completed: (g.tasks_completed || 0) + 1,
      } : g;
      return { ...state, tasks: updatedTasks, gamification: updatedGamification };
    }

    case GAMIFICATION_ACTIONS.LEVEL_UP:
      return {
        ...state,
        gamification: state.gamification ? {
          ...state.gamification,
          current_level: action.payload.newLevel,
          level_name: action.payload.levelName,
          level_color: action.payload.levelColor,
        } : state.gamification,
      };

    case GAMIFICATION_ACTIONS.STREAK_UPDATED:
      return {
        ...state,
        gamification: state.gamification ? {
          ...state.gamification,
          streak_days: action.payload.streakDays,
          longest_streak: action.payload.longestStreak,
        } : state.gamification,
      };

    case GAMIFICATION_ACTIONS.SELO_GRANTED:
      // Adiciona o selo à lista se ainda não existe
      if (state.selos.find(s => s.slug === action.payload.slug)) return state;
      return {
        ...state,
        selos: [{ ...action.payload, earned: true, granted_at: new Date().toISOString() }, ...state.selos],
        gamification: state.gamification ? {
          ...state.gamification,
          selos_earned: (state.gamification.selos_earned || 0) + 1,
        } : state.gamification,
      };

    case GAMIFICATION_ACTIONS.SELO_PIN_TOGGLED:
      return {
        ...state,
        selos: state.selos.map(s =>
          s.user_selo_id === action.payload.userSeloId
            ? { ...s, is_pinned: action.payload.isPinned }
            : s
        ),
      };

    case GAMIFICATION_ACTIONS.XP_ADDED:
      return {
        ...state,
        gamification: state.gamification ? {
          ...state.gamification,
          total_xp: state.gamification.total_xp + action.payload.xp,
          elo_coins: state.gamification.elo_coins + (action.payload.coins || 0),
        } : state.gamification,
      };

    case GAMIFICATION_ACTIONS.QUEUE_ACHIEVEMENT:
      return {
        ...state,
        achievementQueue: [...state.achievementQueue, action.payload],
      };

    case GAMIFICATION_ACTIONS.DEQUEUE_ACHIEVEMENT:
      return {
        ...state,
        achievementQueue: state.achievementQueue.slice(1),
      };

    case GAMIFICATION_ACTIONS.RESET:
      return initialGamificationState;

    default:
      return state;
  }
}
