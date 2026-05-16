// =====================================================
// AchievementModal — ElosCloud
// Modal celebratório para level up e novo selo.
// Usa Framer Motion para animação de partículas e reveal.
// Uso:
//   <AchievementModal
//     type="level_up" | "new_selo"
//     data={{ /* level ou selo */ }}
//     open={bool}
//     onClose={fn}
//   />
// =====================================================
import React, { useEffect } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Coins, X } from 'lucide-react';
import { getLevelInfo, TIER_CONFIG } from './constants';

const MotionBox = motion(Box);

// ── Partícula individual de confetti ─────────────────
const Particle = ({ color, delay, startX, startY }) => {
  const angle = Math.random() * 360;
  const distance = 80 + Math.random() * 120;
  const endX = startX + Math.cos((angle * Math.PI) / 180) * distance;
  const endY = startY + Math.sin((angle * Math.PI) / 180) * distance;

  return (
    <motion.div
      initial={{ x: startX, y: startY, opacity: 1, scale: 1 }}
      animate={{
        x: endX,
        y: endY,
        opacity: 0,
        scale: 0,
        rotate: Math.random() * 720,
      }}
      transition={{ duration: 0.9 + Math.random() * 0.5, delay, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: Math.random() > 0.5 ? '50%' : 2,
        background: color,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );
};

// ── Burst de partículas ───────────────────────────────
const ParticleBurst = ({ color, count = 16 }) => {
  const particles = Array.from({ length: count });
  return (
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 10 }}>
      {particles.map((_, i) => (
        <Particle
          key={i}
          color={i % 3 === 0 ? '#FFD700' : (i % 3 === 1 ? color : '#fff')}
          delay={i * 0.03}
          startX={0}
          startY={0}
        />
      ))}
    </Box>
  );
};

// ── Modal de Level Up ─────────────────────────────────
const LevelUpContent = ({ data, onClose }) => {
  const levelInfo = getLevelInfo(data.new_level);
  const prevLevel = getLevelInfo(data.old_level);
  const perks = data.perks || levelInfo.perks || {};

  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      <ParticleBurst color={levelInfo.color} count={20} />

      {/* Anel pulsante */}
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
        <motion.div
          animate={{
            boxShadow: [
              `0 0 20px ${levelInfo.color}44`,
              `0 0 50px ${levelInfo.color}88`,
              `0 0 20px ${levelInfo.color}44`,
            ],
          }}
          transition={{ duration: 1.5, repeat: 3, ease: 'easeInOut' }}
          style={{
            width: 120, height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${levelInfo.color}44, ${levelInfo.color}18)`,
            border: `3px solid ${levelInfo.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 52,
          }}
        >
          {levelInfo.icon}
        </motion.div>

        {/* Badge de nível */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 12 }}
          style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 36, height: 36, borderRadius: '50%',
            background: levelInfo.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #0f0f1a',
            boxShadow: `0 0 12px ${levelInfo.color}`,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {data.new_level}
          </Typography>
        </motion.div>
      </Box>

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Typography variant="caption" sx={{
          display: 'block', color: 'text.secondary',
          fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
          fontSize: 10, mb: 0.5,
        }}>
          Subiu de nível!
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ color: levelInfo.color, mb: 0.5, fontSize: 28 }}>
          {levelInfo.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          Antes: <span style={{ color: prevLevel.color }}>{prevLevel.name}</span>
          {' → '}
          <span style={{ color: levelInfo.color }}>{levelInfo.name}</span>
        </Typography>
      </motion.div>

      {/* Benefícios desbloqueados */}
      {Object.keys(perks).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Box sx={{
            mt: 2.5, p: 2, borderRadius: 3,
            background: `${levelInfo.color}10`,
            border: `1px solid ${levelInfo.color}30`,
            textAlign: 'left',
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: levelInfo.color, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Desbloqueado:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {perks.elo_coins_bonus && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Coins size={13} color="#F59E0B" />
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    +{perks.elo_coins_bonus} EloCoins de bônus
                  </Typography>
                </Box>
              )}
              {perks.content_boost && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Star size={13} color={levelInfo.color} />
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Conteúdo pode ser destacado pelo algoritmo
                  </Typography>
                </Box>
              )}
              {perks.dispute_vote_weight > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Zap size={13} color={levelInfo.color} />
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Voto com peso {perks.dispute_vote_weight}x em disputas
                  </Typography>
                </Box>
              )}
              {perks.badge_slots && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span style={{ fontSize: 12 }}>🏅</span>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Até {perks.badge_slots} selos no perfil
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <Button
          fullWidth variant="contained"
          onClick={onClose}
          sx={{
            mt: 3, borderRadius: 3, py: 1.25,
            background: `linear-gradient(90deg, ${levelInfo.color}cc, ${levelInfo.color})`,
            boxShadow: `0 4px 20px ${levelInfo.color}50`,
            fontWeight: 700, fontSize: 14,
            '&:hover': { background: levelInfo.color },
          }}
        >
          Incrível! Continuar 🚀
        </Button>
      </motion.div>
    </Box>
  );
};

// ── Modal de Novo Selo ────────────────────────────────
const NewSeloContent = ({ data, onClose }) => {
  const tier = TIER_CONFIG[data.tier] || TIER_CONFIG.bronze;

  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      <ParticleBurst color={tier.color} count={14} />

      {/* Selo com glow */}
      <motion.div
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
        style={{ display: 'inline-block', marginBottom: 24, position: 'relative' }}
      >
        <motion.div
          animate={{ boxShadow: [`0 0 20px ${tier.color}44`, `0 0 40px ${tier.color}88`, `0 0 20px ${tier.color}44`] }}
          transition={{ duration: 1.4, repeat: 2 }}
          style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${tier.color}44, ${tier.color}18)`,
            border: `3px solid ${tier.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44,
          }}
        >
          {data.icon_url
            ? <img src={data.icon_url} alt={data.name} style={{ width: '65%', height: '65%', objectFit: 'contain' }} />
            : '🏅'
          }
        </motion.div>

        {/* Tier badge */}
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          style={{
            position: 'absolute', bottom: -4, right: -4,
            px: 8, py: 2, borderRadius: 20,
            background: tier.color,
            padding: '2px 8px',
            border: '2px solid #0f0f1a',
          }}
        >
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#0f0f1a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {tier.label}
          </Typography>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Typography variant="caption" sx={{
          display: 'block', color: 'text.secondary',
          fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', fontSize: 10, mb: 0.5,
        }}>
          Novo Selo Conquistado!
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ color: tier.color, mb: 0.75, fontSize: 22 }}>
          {data.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mx: 2, lineHeight: 1.5 }}>
          {data.description}
        </Typography>
      </motion.div>

      {/* Bônus */}
      {(data.xp_bonus > 0 || data.coin_bonus > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Box sx={{
            mt: 2, display: 'flex', gap: 1, justifyContent: 'center',
          }}>
            {data.xp_bonus > 0 && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.4,
                px: 1.5, py: 0.6, borderRadius: 2,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
              }}>
                <Zap size={13} color="#6366F1" />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6366F1' }}>
                  +{data.xp_bonus} XP
                </Typography>
              </Box>
            )}
            {data.coin_bonus > 0 && (
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 0.4,
                px: 1.5, py: 0.6, borderRadius: 2,
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.3)',
              }}>
                <Coins size={13} color="#F59E0B" />
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>
                  +{data.coin_bonus} EloCoins
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>
      )}

      {data.grant_reason && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 1.5, fontSize: 11 }}>
            "{data.grant_reason}"
          </Typography>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <Button
          fullWidth variant="contained"
          onClick={onClose}
          sx={{
            mt: 3, borderRadius: 3, py: 1.25,
            background: `linear-gradient(90deg, ${tier.color}cc, ${tier.color})`,
            boxShadow: `0 4px 20px ${tier.color}50`,
            fontWeight: 700, fontSize: 14, color: '#0f0f1a',
            '&:hover': { background: tier.color },
          }}
        >
          Mostrar no perfil ⭐
        </Button>
      </motion.div>
    </Box>
  );
};

// ── Modal wrapper ─────────────────────────────────────
const AchievementModal = ({ open, onClose, type, data }) => {
  // Fecha com Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 1300,
            }}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1301,
              width: '90%', maxWidth: 360,
            }}
          >
            <Box sx={{
              background: 'linear-gradient(160deg, #0f0f1a 0%, #1a1028 100%)',
              borderRadius: 4,
              p: 3,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Botão fechar */}
              <Box
                component="button"
                onClick={onClose}
                sx={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none', borderRadius: '50%',
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#999',
                  '&:hover': { background: 'rgba(255,255,255,0.14)', color: '#fff' },
                }}
                aria-label="Fechar"
              >
                <X size={14} />
              </Box>

              {type === 'level_up' && <LevelUpContent data={data} onClose={onClose} />}
              {type === 'new_selo' && <NewSeloContent data={data} onClose={onClose} />}
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AchievementModal;
