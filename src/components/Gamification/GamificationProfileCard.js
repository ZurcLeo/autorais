// =====================================================
// GamificationProfileCard — ElosCloud
// Exibe: avatar com anel de nível, XP bar, EloCoins,
// streak, grid de selos pinned + drawer completo.
// =====================================================
import React, { useState } from 'react';
import {
  Box, Typography, Avatar, LinearProgress, Chip,
  IconButton, Tooltip, Skeleton, useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Flame, Coins, ChevronRight, Lock } from 'lucide-react';
import { getLevelInfo, getNextLevel, calcXPProgress, TIER_CONFIG } from './constants';
import SelosDrawer from './SelosDrawer';

const MotionBox = motion(Box);

// ── Anel animado de nível ao redor do avatar ──────────
const LevelRing = ({ color, size = 80 }) => {
  const theme = useTheme();
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}
        initial={{ rotate: -90 }}
      >
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={alpha(theme.palette.common.white, 0.08)}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring — nível atual sempre cheio como "aura" */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </motion.svg>
    </Box>
  );
};

// ── Contador animado de XP ────────────────────────────
const AnimatedNumber = ({ value }) => {
  const spring = useSpring(0, { stiffness: 60, damping: 15 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString('pt-BR'));

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

// ── Chip de selo individual ───────────────────────────
const SeloChip = ({ selo, size = 44, locked = false }) => {
  const tier = TIER_CONFIG[selo?.tier] || TIER_CONFIG.bronze;
  const tooltipTitle = locked
    ? `${selo?.name} · Bloqueado`
    : `${selo?.name} · ${tier.label}`;

  return (
    <Tooltip title={tooltipTitle} placement="top" arrow>
      <MotionBox
        whileHover={locked ? {} : { scale: 1.12, y: -2 }}
        whileTap={locked ? {} : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        sx={{
          width: size, height: size,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          ...(locked ? {
            background: alpha('#888', 0.08),
            border: `2px solid ${alpha('#888', 0.2)}`,
            filter: 'grayscale(1)',
            opacity: 0.35,
            cursor: 'default',
          } : {
            background: `radial-gradient(circle at 35% 35%, ${alpha(tier.color, 0.133)}, ${alpha(tier.color, 0.031)})`,
            border: `2px solid ${tier.color}`,
            boxShadow: `0 0 10px ${tier.glow}, inset 0 0 6px ${alpha(tier.color, 0.082)}`,
            cursor: 'pointer',
          }),
          fontSize: size * 0.44,
          userSelect: 'none',
        }}
      >
        {selo?.icon_url
          ? <img src={selo.icon_url} alt={selo.name} style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
          : <span role="img" aria-label={selo?.name}>🏅</span>
        }
        {locked && (
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
          }}>
            <Lock size={size * 0.32} color="#888" />
          </Box>
        )}
      </MotionBox>
    </Tooltip>
  );
};

// ── XP Bar com animação de preenchimento ──────────────
const XPBar = ({ progress, color, nextXP, totalXP }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', mt: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
          <AnimatedNumber value={totalXP} /> XP
        </Typography>
        {nextXP && (
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
            {nextXP.toLocaleString('pt-BR')} XP
          </Typography>
        )}
      </Box>
      <Box sx={{
        height: 8, borderRadius: 4,
        background: alpha(theme.palette.common.white, 0.07),
        overflow: 'hidden', position: 'relative',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.5 }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: `linear-gradient(90deg, ${alpha(color, 0.667)}, ${color})`,
            boxShadow: `0 0 10px ${alpha(color, 0.533)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: 1.5 }}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '40%', height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.35)}, transparent)`,
            }}
          />
        </motion.div>
      </Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, mt: 0.25, display: 'block', textAlign: 'right' }}>
        {100 - progress}% para o próximo nível
      </Typography>
    </Box>
  );
};

// ── Componente principal ──────────────────────────────
const GamificationProfileCard = ({
  user,
  gamification,
  selos = [],
  selosCatalog = [],
  loading = false,
  onViewAllSelos,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [selosOpen, setSelosOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ p: 3, borderRadius: 3, background: theme.palette.background.paper }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={16} sx={{ mt: 1 }} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  const levelNum = gamification?.current_level ?? 1;
  const levelInfo = getLevelInfo(levelNum);
  const nextLevel = getNextLevel(levelNum);
  const progress = calcXPProgress(gamification?.total_xp ?? 0, levelNum);
  const totalSelos = selos.length;

  // Monta grid de até 6 selos: earned pinned > earned unpinned > locked do catálogo
  const earnedSlugs = new Set(selos.map((s) => s.slug));
  const pinnedEarned = selos.filter((s) => s.is_pinned);
  const unpinnedEarned = selos.filter((s) => !s.is_pinned);
  const lockedSelos = selosCatalog
    .filter((s) => !earnedSlugs.has(s.slug))
    .map((s) => ({ ...s, locked: true }));
  const displaySelos = [
    ...pinnedEarned,
    ...unpinnedEarned,
    ...lockedSelos,
  ].slice(0, 6);
  const hasDisplaySelos = displaySelos.length > 0;

  const hasStreak = (gamification?.streak_days ?? 0) > 0;

  const cardBg = `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, isDark ? 0.12 : 0.04)} 100%)`;

  return (
    <>
      <MotionBox
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        sx={{
          p: 3,
          borderRadius: 4,
          background: cardBg,
          border: `1px solid ${alpha(levelInfo.color, 0.145)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}, 0 0 0 1px ${alpha(levelInfo.color, 0.082)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow de fundo do nível */}
        <Box sx={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(levelInfo.color, 0.094)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* ─── Linha superior: Avatar + Info + Moedas/Streak ─── */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Avatar com anel */}
          <Box sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <LevelRing color={levelInfo.color} size={80} />
            <Avatar
              src={user?.avatar_url}
              alt={user?.full_name}
              sx={{
                width: 66, height: 66,
                position: 'absolute',
                top: 7, left: 7,
                border: `2px solid ${alpha(levelInfo.color, 0.25)}`,
                fontSize: 28,
              }}
            >
              {user?.full_name?.[0] ?? '?'}
            </Avatar>
            {/* Badge do nível */}
            <Tooltip title={`Nível ${levelNum}: ${levelInfo.name}`} arrow>
              <Box sx={{
                position: 'absolute', bottom: -2, right: -2,
                width: 24, height: 24, borderRadius: '50%',
                background: levelInfo.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, border: '2px solid',
                borderColor: theme.palette.background.default,
                boxShadow: `0 0 8px ${levelInfo.color}`,
                zIndex: 1,
              }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: theme.palette.common.white, lineHeight: 1 }}>
                  {levelNum}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* Nome + nível */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{ color: 'text.primary', fontSize: 16 }}
            >
              {user?.full_name ?? 'Usuário'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Typography sx={{ fontSize: 12, color: levelInfo.color, fontWeight: 600 }}>
                {levelInfo.icon} {levelInfo.name}
              </Typography>
              {levelNum === 10 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: 12 }}
                >✨</motion.span>
              )}
            </Box>
          </Box>

          {/* EloCoins + Streak (coluna direita) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
            {/* EloCoins */}
            <Tooltip title="EloCoins — use para turbinar seu conteúdo" arrow>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1.5, py: 0.5, borderRadius: 2,
                background: `linear-gradient(90deg, ${alpha(theme.palette.warning.main, 0.094)}, ${alpha(theme.palette.warning.main, 0.031)})`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.188)}`,
                cursor: 'default',
              }}>
                <Coins size={14} color={theme.palette.warning.main} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: theme.palette.warning.main }}>
                  <AnimatedNumber value={gamification?.elo_coins ?? 0} />
                </Typography>
              </Box>
            </Tooltip>

            {/* Streak */}
            <Tooltip title={`${gamification?.streak_days ?? 0} dias seguidos${gamification?.longest_streak ? ` · Recorde: ${gamification.longest_streak}d` : ''}`} arrow>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                px: 1.5, py: 0.5, borderRadius: 2,
                background: hasStreak
                  ? `linear-gradient(90deg, ${alpha(theme.palette.error.main, 0.094)}, ${alpha(theme.palette.error.main, 0.031)})`
                  : alpha(theme.palette.common.white, 0.04),
                border: `1px solid ${hasStreak ? alpha(theme.palette.error.main, 0.188) : alpha(theme.palette.common.white, 0.08)}`,
                cursor: 'default',
              }}>
                <motion.div
                  animate={hasStreak ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame size={14} color={hasStreak ? theme.palette.error.main : theme.palette.text.secondary} />
                </motion.div>
                <Typography sx={{
                  fontSize: 13, fontWeight: 700,
                  color: hasStreak ? theme.palette.error.main : 'text.disabled',
                }}>
                  {gamification?.streak_days ?? 0}d
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* ─── XP Progress Bar ─── */}
        <Box sx={{ mt: 2.5 }}>
          <XPBar
            progress={progress}
            color={levelInfo.color}
            nextXP={nextLevel?.xp ?? null}
            totalXP={gamification?.total_xp ?? 0}
          />
        </Box>

        {/* ─── Selos ─── */}
        {hasDisplaySelos && (
          <Box sx={{ mt: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 10 }}>
                Selos {totalSelos > 0 && `· ${totalSelos}`}
              </Typography>
              {totalSelos > 0 && (
                <Box
                  component="button"
                  onClick={() => setSelosOpen(true)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.25,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: levelInfo.color, fontSize: 11, fontWeight: 600, p: 0,
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  Ver tudo <ChevronRight size={12} />
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <AnimatePresence>
                {displaySelos.map((selo, i) => (
                  <motion.div
                    key={selo.id || selo.slug}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                  >
                    <SeloChip selo={selo} locked={!!selo.locked} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>
          </Box>
        )}
      </MotionBox>

      <SelosDrawer
        open={selosOpen}
        onClose={() => setSelosOpen(false)}
        selos={selos}
        levelColor={levelInfo.color}
      />
    </>
  );
};

export default GamificationProfileCard;
