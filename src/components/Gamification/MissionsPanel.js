// =====================================================
// MissionsPanel — ElosCloud
// Painel de tarefas/missões organizadas por categoria.
// Estados: disponível, em progresso, completo, cooldown.
// =====================================================
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, LinearProgress, Chip,
  Tabs, Tab, Tooltip, useTheme, Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Zap, Coins, Shield } from 'lucide-react';
import { CATEGORY_CONFIG, TIER_CONFIG, TASK_SELO_MAP } from './constants';

const MotionBox = motion(Box);

// ── Cálculo de cooldown legível ───────────────────────
const formatCooldown = (lastCompletedAt, intervalDays) => {
  if (!lastCompletedAt || !intervalDays) return null;
  const next = new Date(lastCompletedAt);
  next.setDate(next.getDate() + intervalDays);
  const diffMs = next - Date.now();
  if (diffMs <= 0) return null;
  const diffH = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffH < 24) return `${diffH}h`;
  return `${Math.ceil(diffH / 24)}d`;
};

// ── Badge de recompensa ───────────────────────────────
const RewardBadge = ({ xp, coins }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
      {xp > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.3,
          px: 1, py: 0.25, borderRadius: 1.5,
          background: alpha(theme.palette.info.main, 0.12),
          border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
        }}>
          <Zap size={10} color={theme.palette.info.main} />
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: theme.palette.info.main }}>
            +{xp} XP
          </Typography>
        </Box>
      )}
      {coins > 0 && (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 0.3,
          px: 1, py: 0.25, borderRadius: 1.5,
          background: alpha(theme.palette.warning.main, 0.12),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
        }}>
          <Coins size={10} color={theme.palette.warning.main} />
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: theme.palette.warning.main }}>
            +{coins}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ── Indicador de selo relacionado ────────────────────
const SeloReward = ({ selo }) => {
  const theme = useTheme();
  if (!selo) return null;
  const tier = TIER_CONFIG[selo.tier] || TIER_CONFIG.bronze;
  return (
    <Tooltip title={`Desbloqueia: ${selo.name} (${tier.label})`} placement="top" arrow>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.4,
        px: 1, py: 0.25, borderRadius: 1.5,
        background: `linear-gradient(90deg, ${alpha(tier.color, 0.12)}, ${alpha(tier.color, 0.06)})`,
        border: `1px solid ${alpha(tier.color, 0.3)}`,
        cursor: 'default', flexShrink: 0,
      }}>
        <Shield size={10} color={tier.color} />
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: tier.color, whiteSpace: 'nowrap' }}>
          {selo.icon_url
            ? <img src={selo.icon_url} alt="" style={{ width: 10, height: 10, objectFit: 'contain', verticalAlign: 'middle', marginRight: 2 }} />
            : null
          }
          {selo.name}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// ── Item de missão individual ─────────────────────────
const MissionItem = ({ task, index, relatedSelo }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const status = task.status || 'available';
  const catConfig = CATEGORY_CONFIG[task.category] || {};
  const catColor = catConfig.color || theme.palette.info.main;
  const cooldownLeft = formatCooldown(task.last_completed_at, task.repeat_interval_days);
  const isCooldown = !!cooldownLeft && status === 'completed' && task.is_repeatable;
  const isCompleted = status === 'completed' && !task.is_repeatable;
  const progress = task.progress ?? 0;
  const target = task.target_count ?? 1;
  const progressPct = target > 1 ? Math.min(100, Math.round((progress / target) * 100)) : (isCompleted ? 100 : 0);

  const getBorderColor = () => {
    if (isCompleted) return alpha(theme.palette.success.main, 0.25);
    if (isCooldown) return alpha(theme.palette.common.white, 0.08);
    if (status === 'in_progress') return alpha(catColor, 0.38);
    return alpha(theme.palette.common.white, 0.06);
  };

  const getBg = () => {
    if (isCompleted) return isDark ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.success.main, 0.04);
    if (isCooldown) return alpha(theme.palette.common.white, 0.02);
    if (status === 'in_progress') return alpha(catColor, 0.03);
    return isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.common.black, 0.02);
  };

  return (
    <MotionBox
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      sx={{
        p: 2, borderRadius: 3,
        background: getBg(),
        border: `1px solid ${getBorderColor()}`,
        opacity: isCooldown ? 0.55 : 1,
        mb: 1,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: isCompleted || isCooldown ? getBorderColor() : alpha(catColor, 0.5),
          transform: isCompleted || isCooldown ? 'none' : 'translateX(2px)',
        },
      }}
    >
      {/* Faixa lateral de categoria */}
      <Box sx={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 3,
        background: isCompleted ? theme.palette.success.main : catColor,
        borderRadius: '4px 0 0 4px',
        opacity: isCompleted ? 0.7 : (isCooldown ? 0.3 : 1),
      }} />

      <Box sx={{ pl: 0.5 }}>
        {/* Linha 1: Ícone + Nome + Status badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1 }}>
            <Typography sx={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>
              {task.icon_url ? (
                <img src={task.icon_url} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              ) : catConfig.icon}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color: isCompleted ? 'text.secondary' : 'text.primary',
                  textDecoration: isCompleted ? 'line-through' : 'none',
                  fontSize: 13,
                }}
              >
                {task.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11, display: 'block', mt: 0.1 }}>
                {task.description}
              </Typography>
            </Box>
          </Box>

          {/* Status icon */}
          <Box sx={{ flexShrink: 0 }}>
            {isCompleted && (
              <Tooltip title="Missão completa!">
                <CheckCircle2 size={18} color={theme.palette.success.main} />
              </Tooltip>
            )}
            {isCooldown && (
              <Tooltip title={`Disponível em ${cooldownLeft}`}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Clock size={14} color={theme.palette.text.secondary} />
                  <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>{cooldownLeft}</Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Linha 2: Progresso (para tarefas multi-etapa) */}
        {target > 1 && !isCompleted && (
          <Box sx={{ mt: 1.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
              <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>
                Progresso
              </Typography>
              <Typography sx={{ fontSize: 10, color: catColor, fontWeight: 600 }}>
                {progress}/{target}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPct}
              sx={{
                height: 5, borderRadius: 3,
                backgroundColor: alpha(theme.palette.action.disabledBackground, 0.5),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${alpha(catColor, 0.53)}, ${catColor})`,
                  borderRadius: 3,
                  boxShadow: `0 0 6px ${alpha(catColor, 0.4)}`,
                },
              }}
            />
          </Box>
        )}

        {/* Linha 3: Recompensas */}
        <Box sx={{ mt: 1.25, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <RewardBadge xp={task.xp_reward} coins={task.coin_reward} />
          <SeloReward selo={relatedSelo} />
        </Box>
      </Box>
    </MotionBox>
  );
};

// ── Componente principal ──────────────────────────────
const MissionsPanel = ({ tasks = [], selosCatalog = [], loading = false, onTaskAction }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all');

  const categories = useMemo(() => {
    const cats = [...new Set(tasks.map(t => t.category))];
    return cats;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const list = activeTab === 'all' ? tasks : tasks.filter(t => t.category === activeTab);
    // Ordem: in_progress > available > cooldown > completed
    return [...list].sort((a, b) => {
      const order = { in_progress: 0, available: 1, completed: 2 };
      return (order[a.status] ?? 1) - (order[b.status] ?? 1);
    });
  }, [tasks, activeTab]);

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.status === 'completed' && !t.is_repeatable).length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
  }), [tasks]);

  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} variant="rectangular" height={88} sx={{ borderRadius: 3, mb: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header com stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: 17 }}>
          Missões
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={`${stats.done}/${stats.total} completas`}
            size="small"
            sx={{
              fontSize: 10,
              background: alpha(theme.palette.success.main, 0.12),
              color: theme.palette.success.main,
              border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
            }}
          />
          {stats.inProgress > 0 && (
            <Chip
              label={`${stats.inProgress} em progresso`}
              size="small"
              sx={{
                fontSize: 10,
                background: alpha(theme.palette.info.main, 0.12),
                color: theme.palette.info.main,
                border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
              }}
            />
          )}
        </Box>
      </Box>

      {/* Tabs de categoria */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2, minHeight: 36,
          '& .MuiTabs-indicator': { height: 2, borderRadius: 1 },
          '& .MuiTab-root': {
            minHeight: 36, fontSize: 12, fontWeight: 600,
            textTransform: 'none', px: 1.5, py: 0.5,
            color: 'text.secondary',
            '&.Mui-selected': { color: 'text.primary' },
          },
        }}
      >
        <Tab label="Todas" value="all" />
        {categories.map(cat => {
          const cfg = CATEGORY_CONFIG[cat] || {};
          return (
            <Tab
              key={cat}
              label={`${cfg.icon || ''} ${cfg.label || cat}`}
              value={cat}
              sx={{ '&.Mui-selected': { color: `${cfg.color} !important` } }}
            />
          );
        })}
      </Tabs>

      {/* Lista de missões */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography sx={{ fontSize: 32, mb: 1 }}>🎯</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Nenhuma missão disponível nesta categoria
              </Typography>
            </Box>
          ) : (
            filteredTasks.map((task, i) => {
              const seloSlug = TASK_SELO_MAP[task.slug];
              const relatedSelo = seloSlug
                ? selosCatalog.find(s => s.slug === seloSlug)
                : null;
              return (
                <MissionItem
                  key={task.id || task.slug}
                  task={task}
                  index={i}
                  relatedSelo={relatedSelo}
                />
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default MissionsPanel;
