// =====================================================
// ContentBoostBadge — ElosCloud
// Indicador visual no card de post quando tem
// content boost ativo (algoritmo da plataforma).
// Uso:
//   <ContentBoostBadge boost={boostObject} compact />
// =====================================================
import React, { useState } from 'react';
import { Box, Typography, Tooltip, Popover, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp, Heart, Star } from 'lucide-react';
import { BOOST_CONFIG } from './constants';

const BOOST_ICONS = {
  featured: Rocket,
  trending: TrendingUp,
  community_pick: Heart,
  platform_highlight: Star,
};

// ── Badge compacto (para card de feed) ───────────────
const ContentBoostBadge = ({ boost, compact = true, showPopover = true }) => {
  const [anchor, setAnchor] = useState(null);

  if (!boost || !boost.is_active) return null;

  const config = BOOST_CONFIG[boost.boost_type] || BOOST_CONFIG.featured;
  const Icon = BOOST_ICONS[boost.boost_type] || Rocket;
  const isExpired = boost.expires_at && new Date(boost.expires_at) < new Date();
  if (isExpired) return null;

  const badge = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 16 }}
    >
      <Box
        onClick={showPopover ? (e) => setAnchor(e.currentTarget) : undefined}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: compact ? 0.4 : 0.6,
          px: compact ? 0.9 : 1.25, py: compact ? 0.3 : 0.5,
          borderRadius: compact ? 1.5 : 2,
          background: `linear-gradient(90deg, ${config.color}18, ${config.color}08)`,
          border: `1px solid ${config.color}35`,
          cursor: showPopover ? 'pointer' : 'default',
          position: 'relative', overflow: 'hidden',
          userSelect: 'none',
          '&:hover': showPopover ? {
            background: `${config.color}22`,
            borderColor: `${config.color}55`,
          } : {},
          transition: 'all 0.15s',
        }}
        role={showPopover ? 'button' : undefined}
        aria-label={`Conteúdo ${config.label}`}
      >
        {/* Shimmer animado */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '40%', height: '100%',
            background: `linear-gradient(90deg, transparent, ${config.color}30, transparent)`,
            pointerEvents: 'none',
          }}
        />

        {/* Ícone com pulso sutil */}
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={compact ? 10 : 13} color={config.color} />
        </motion.div>

        <Typography sx={{
          fontSize: compact ? 10 : 11,
          fontWeight: 700,
          color: config.color,
          lineHeight: 1,
        }}>
          {config.label}
        </Typography>
      </Box>
    </motion.div>
  );

  if (!showPopover) return badge;

  return (
    <>
      <Tooltip title="Ver detalhes do boost" placement="top" arrow>
        {badge}
      </Tooltip>

      {/* Popover com detalhes */}
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            p: 0, borderRadius: 3, mt: 0.75,
            background: '#0f0f1a',
            border: `1px solid ${config.color}30`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${config.color}20`,
            minWidth: 220, maxWidth: 280,
            overflow: 'hidden',
          },
        }}
      >
        {/* Header colorido */}
        <Box sx={{
          px: 2, py: 1.5,
          background: `linear-gradient(90deg, ${config.color}18, ${config.color}05)`,
          borderBottom: `1px solid ${config.color}20`,
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <Icon size={16} color={config.color} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: config.color }}>
            {config.label}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, display: 'block' }}>
            {boost.reason || 'Este conteúdo foi selecionado pelo algoritmo da ElosCloud por seu alto engajamento.'}
          </Typography>

          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: 10, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Alcance
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: config.color }}>
                {boost.boost_factor ? `${boost.boost_factor}× mais` : 'Aumentado'}
              </Typography>
            </Box>
            {boost.expires_at && (
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 10, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Expira em
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                  {new Date(boost.expires_at).toLocaleDateString('pt-BR')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

// ── Versão em linha (para usar dentro de cards de post) ─
export const PostBoostIndicator = ({ boost }) => {
  if (!boost || !boost.is_active) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <AnimatePresence>
        <ContentBoostBadge boost={boost} compact />
      </AnimatePresence>
    </Box>
  );
};

export default ContentBoostBadge;
