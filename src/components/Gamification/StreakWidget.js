// =====================================================
// StreakWidget — ElosCloud
// Mini-widget de streak para header/sidebar.
// Mostra fogo + dias + próximo marco.
// Variante: compact (header) | full (sidebar/card)
// =====================================================
import React from 'react';
import { Box, Typography, Tooltip, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

const STREAK_MILESTONES = [7, 30, 100, 365];

const getNextMilestone = (days) => {
  return STREAK_MILESTONES.find((m) => m > days) || null;
};

const getStreakColor = (days) => {
  if (days === 0) return '#666';
  if (days < 7) return '#F59E0B';
  if (days < 30) return '#EF4444';
  if (days < 100) return '#EC4899';
  return '#F97316';
};

const getStreakMessage = (days) => {
  if (days === 0) return 'Faça login hoje para iniciar um streak!';
  if (days === 1) return 'Começo de jornada! Volte amanhã 🌱';
  if (days < 7) return `${days} dias seguidos — vai chegando!`;
  if (days < 30) return `${days} dias! Semana perfeita conquistada 🔥`;
  if (days < 100) return `${days} dias seguidos — isso é dedicação! 💪`;
  if (days < 365) return `${days} dias! Liderança na consistência 👑`;
  return `${days} dias seguidos! Só as Lendas 🏆`;
};

// ── Variante compacta (header/topbar) ────────────────
export const StreakWidgetCompact = ({ streakDays = 0, longestStreak = 0 }) => {
  const color = getStreakColor(streakDays);
  const active = streakDays > 0;

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="caption" display="block" fontWeight={700} sx={{ mb: 0.25 }}>
            {getStreakMessage(streakDays)}
          </Typography>
          {longestStreak > 0 && (
            <Typography variant="caption" display="block" sx={{ color: 'text.disabled' }}>
              Recorde pessoal: {longestStreak} dias
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="bottom"
    >
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 0.4,
          px: 1.25, py: 0.5, borderRadius: 2,
          background: active ? `${color}14` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${active ? color + '30' : 'rgba(255,255,255,0.08)'}`,
          cursor: 'default',
          transition: 'all 0.2s',
        }}
        role="status"
        aria-label={`Streak: ${streakDays} dias`}
      >
        <motion.div
          animate={active ? { scale: [1, 1.18, 1] } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame size={14} color={active ? color : '#555'} />
        </motion.div>
        <Typography sx={{
          fontSize: 13, fontWeight: 700, lineHeight: 1,
          color: active ? color : 'text.disabled',
        }}>
          {streakDays}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ── Variante full (sidebar / card) ───────────────────
const StreakWidget = ({ streakDays = 0, longestStreak = 0, variant = 'full' }) => {
  if (variant === 'compact') {
    return <StreakWidgetCompact streakDays={streakDays} longestStreak={longestStreak} />;
  }

  const color = getStreakColor(streakDays);
  const active = streakDays > 0;
  const nextMilestone = getNextMilestone(streakDays);
  const progress = nextMilestone
    ? Math.min(100, Math.round((streakDays / nextMilestone) * 100))
    : 100;
  const prevMilestone = STREAK_MILESTONES.slice().reverse().find(m => m <= streakDays) || 0;

  return (
    <Box sx={{
      p: 2, borderRadius: 3,
      background: active
        ? `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`
        : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? color + '25' : 'rgba(255,255,255,0.06)'}`,
    }}>
      {/* Linha principal: chama + número */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <motion.div
            animate={active ? {
              scale: [1, 1.15, 1],
              filter: [
                `drop-shadow(0 0 4px ${color}00)`,
                `drop-shadow(0 0 8px ${color}99)`,
                `drop-shadow(0 0 4px ${color}00)`,
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame size={28} color={active ? color : '#444'} />
          </motion.div>
          <Box>
            <Typography sx={{
              fontSize: 28, fontWeight: 800, lineHeight: 1,
              color: active ? color : 'text.disabled',
            }}>
              {streakDays}
            </Typography>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', lineHeight: 1 }}>
              {streakDays === 1 ? 'dia' : 'dias'}
            </Typography>
          </Box>
        </Box>

        {longestStreak > 0 && (
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 10, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Recorde
            </Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.secondary' }}>
              🏆 {longestStreak}d
            </Typography>
          </Box>
        )}
      </Box>

      {/* Mensagem motivacional */}
      <Typography variant="caption" sx={{
        color: active ? 'text.secondary' : 'text.disabled',
        display: 'block', mb: 1.5, lineHeight: 1.4, fontSize: 11,
      }}>
        {getStreakMessage(streakDays)}
      </Typography>

      {/* Barra de progresso até próximo marco */}
      {nextMilestone && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
              Próximo marco: {nextMilestone} dias
            </Typography>
            <Typography sx={{ fontSize: 10, color: active ? color : 'text.disabled', fontWeight: 600 }}>
              faltam {nextMilestone - streakDays}d
            </Typography>
          </Box>
          <Box sx={{
            height: 5, borderRadius: 3,
            background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${color}88, ${color})`,
                borderRadius: 3,
                boxShadow: active ? `0 0 6px ${color}88` : 'none',
              }}
            />
          </Box>
        </Box>
      )}

      {/* Marcos atingidos */}
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
        {STREAK_MILESTONES.map((milestone) => {
          const reached = streakDays >= milestone;
          return (
            <Tooltip key={milestone} title={`${milestone} dias${reached ? ' ✓' : ''}`} arrow>
              <Box sx={{
                px: 0.9, py: 0.3, borderRadius: 1.5,
                background: reached ? `${color}20` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${reached ? color + '40' : 'rgba(255,255,255,0.06)'}`,
                opacity: reached ? 1 : 0.5,
              }}>
                <Typography sx={{
                  fontSize: 10, fontWeight: 600,
                  color: reached ? color : 'text.disabled',
                }}>
                  {reached ? '✓' : ''} {milestone}d
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
};

export default StreakWidget;
