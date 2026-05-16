// =====================================================
// Gamificação ElosCloud — Constantes compartilhadas
// Sincronizar com gamification_levels no Supabase
// =====================================================

export const LEVELS = [
  { num: 1,  name: 'Semente',    color: '#94A3B8', xp: 0,     icon: '🌱' },
  { num: 2,  name: 'Broto',      color: '#4ADE80', xp: 150,   icon: '🌿' },
  { num: 3,  name: 'Raiz',       color: '#22C55E', xp: 400,   icon: '🌳' },
  { num: 4,  name: 'Elo',        color: '#3B82F6', xp: 800,   icon: '🔗' },
  { num: 5,  name: 'Parceiro',   color: '#6366F1', xp: 1500,  icon: '🤝' },
  { num: 6,  name: 'Guardião',   color: '#8B5CF6', xp: 2500,  icon: '🛡️' },
  { num: 7,  name: 'Mentor',     color: '#EC4899', xp: 4000,  icon: '⭐' },
  { num: 8,  name: 'Liderança',  color: '#F59E0B', xp: 6000,  icon: '👑' },
  { num: 9,  name: 'Embaixador', color: '#EF4444', xp: 9000,  icon: '🏆' },
  { num: 10, name: 'Fundador',   color: '#F97316', xp: 13000, icon: '💎' },
];

export const TIER_CONFIG = {
  bronze:   { color: '#CD7F32', glow: '#CD7F3240', label: 'Bronze' },
  prata:    { color: '#C0C0C0', glow: '#C0C0C040', label: 'Prata' },
  ouro:     { color: '#FFD700', glow: '#FFD70040', label: 'Ouro' },
  diamante: { color: '#B9F2FF', glow: '#B9F2FF40', label: 'Diamante' },
};

export const CATEGORY_CONFIG = {
  identidade:  { label: 'Identidade',  color: '#6366F1', icon: '👤' },
  social:      { label: 'Social',      color: '#EC4899', icon: '👥' },
  financeiro:  { label: 'Financeiro',  color: '#22C55E', icon: '💰' },
  consistencia:{ label: 'Consistência',color: '#F59E0B', icon: '🔥' },
  comunidade:  { label: 'Comunidade',  color: '#3B82F6', icon: '🤝' },
  caixinha:    { label: 'Caixinha',    color: '#8B5CF6', icon: '🏦' },
};

export const BOOST_CONFIG = {
  featured:          { label: 'Em Destaque',           color: '#6366F1', icon: '🚀' },
  trending:          { label: 'Trending',               color: '#EC4899', icon: '📈' },
  community_pick:    { label: 'Escolha da Comunidade',  color: '#22C55E', icon: '💚' },
  platform_highlight:{ label: 'Destaque da Plataforma', color: '#F59E0B', icon: '⭐' },
};

export const getLevelInfo = (levelNum) =>
  LEVELS.find((l) => l.num === levelNum) || LEVELS[0];

export const getNextLevel = (levelNum) =>
  LEVELS.find((l) => l.num === levelNum + 1) || null;

export const calcXPProgress = (totalXP, currentLevel) => {
  const curr = getLevelInfo(currentLevel);
  const next = getNextLevel(currentLevel);
  if (!next) return 100;
  return Math.min(
    100,
    Math.round(((totalXP - curr.xp) / (next.xp - curr.xp)) * 100)
  );
};

// Mapeamento task_slug → selo_slug que ela desbloqueia
export const TASK_SELO_MAP = {
  'first_login':            'welcome',
  'complete_profile':       'profile_complete',
  'make_5_connections':     'connector_5',
  'invite_5_friends':       'invite_squad',
  'create_first_caixinha':  'caixinha_founder',
  'pay_on_time_3months':    'faithful_payer_3m',
  'pay_on_time_6months':    'faithful_payer_6m',
  'streak_7days':           'week_warrior',
  'streak_30days':          'month_champion',
  'streak_100days':         'centenarian',
};
