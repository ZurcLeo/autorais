// =====================================================
// SelosDrawer — Gaveta lateral com todos os selos
// Agrupa por categoria com filtro visual
// =====================================================
import React, { useState, useMemo } from 'react';
import {
  Drawer, Box, Typography, IconButton, Chip,
  Tooltip, useTheme, Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TIER_CONFIG } from './constants';

const CATEGORY_LABELS = {
  conquista: 'Conquistas',
  plataforma: 'Plataforma',
  especial: 'Especiais',
  caixinha: 'Caixinha',
  social: 'Social',
};

const SeloCard = ({ selo, index }) => {
  const theme = useTheme();
  const tier = TIER_CONFIG[selo?.tier] || TIER_CONFIG.bronze;
  const isLocked = !selo?.earned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Tooltip
        title={
          <Box>
            <Typography variant="caption" display="block" fontWeight={700}>{selo.name}</Typography>
            <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {isLocked ? 'Não conquistado ainda' : (selo.grant_reason || selo.description)}
            </Typography>
            {!isLocked && selo.granted_at && (
              <Typography variant="caption" display="block" sx={{ color: 'text.disabled', mt: 0.25 }}>
                Conquistado em {new Date(selo.granted_at).toLocaleDateString('pt-BR')}
              </Typography>
            )}
          </Box>
        }
        placement="top"
        arrow
      >
        <Box
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
            p: 1.5, borderRadius: 3,
            background: isLocked
              ? alpha(theme.palette.common.white, 0.02)
              : `radial-gradient(circle at 30% 30%, ${alpha(tier.color, 0.094)}, ${alpha(tier.color, 0.02)})`,
            border: `1px solid ${isLocked ? alpha(theme.palette.common.white, 0.06) : alpha(tier.color, 0.25)}`,
            boxShadow: isLocked ? 'none' : `0 0 12px ${tier.glow}`,
            opacity: isLocked ? 0.4 : 1,
            cursor: 'default',
            transition: 'all 0.2s',
            '&:hover': { transform: isLocked ? 'none' : 'translateY(-2px)' },
          }}
        >
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isLocked ? alpha(theme.palette.common.white, 0.05) : alpha(tier.color, 0.094),
            fontSize: 24,
            filter: isLocked ? 'grayscale(1)' : 'none',
          }}>
            {isLocked ? '🔒' : (
              selo.icon_url
                ? <img src={selo.icon_url} alt={selo.name} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                : '🏅'
            )}
          </Box>
          <Typography sx={{
            fontSize: 10, fontWeight: 600,
            color: isLocked ? 'text.disabled' : 'text.secondary',
            textAlign: 'center', lineHeight: 1.2,
            maxWidth: 64,
          }}>
            {selo.name}
          </Typography>
          {!isLocked && (
            <Box sx={{
              px: 0.75, py: 0.1, borderRadius: 1,
              background: alpha(tier.color, 0.125),
              border: `1px solid ${alpha(tier.color, 0.25)}`,
            }}>
              <Typography sx={{ fontSize: 8, color: tier.color, fontWeight: 700, textTransform: 'uppercase' }}>
                {tier.label}
              </Typography>
            </Box>
          )}
        </Box>
      </Tooltip>
    </motion.div>
  );
};

const SelosDrawer = ({ open, onClose, selos = [], levelColor = '#6366F1' }) => {
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');

  const grouped = useMemo(() => {
    const all = activeFilter === 'all' ? selos : selos.filter(s => s.category === activeFilter);
    return all.reduce((acc, selo) => {
      const cat = selo.category || 'conquista';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(selo);
      return acc;
    }, {});
  }, [selos, activeFilter]);

  const categories = useMemo(() => {
    const cats = [...new Set(selos.map(s => s.category))];
    return cats;
  }, [selos]);

  const earned = selos.filter(s => s.earned).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 360 },
          background: theme.palette.background.paper,
          borderLeft: `1px solid ${alpha(levelColor, 0.145)}`,
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2.5, pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: 18 }}>
            Seus Selos
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {earned} de {selos.length} conquistados
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <X size={18} />
        </IconButton>
      </Box>

      {/* Barra de progresso geral */}
      <Box sx={{ px: 2.5, pt: 1.5, pb: 1 }}>
        <Box sx={{
          height: 6, borderRadius: 3,
          background: alpha(theme.palette.divider, 0.5), overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: selos.length > 0 ? `${Math.round((earned / selos.length) * 100)}%` : '0%' }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${alpha(levelColor, 0.53)}, ${levelColor})`,
              borderRadius: 3,
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 10, mt: 0.25, display: 'block', textAlign: 'right' }}>
          {selos.length > 0 ? Math.round((earned / selos.length) * 100) : 0}% completo
        </Typography>
      </Box>

      {/* Filtros de categoria */}
      <Box sx={{ px: 2.5, pb: 1.5, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        <Chip
          label="Todos"
          size="small"
          onClick={() => setActiveFilter('all')}
          sx={{
            fontSize: 11,
            background: activeFilter === 'all' ? levelColor : alpha(theme.palette.common.white, 0.06),
            color: activeFilter === 'all' ? theme.palette.common.white : 'text.secondary',
            border: `1px solid ${activeFilter === 'all' ? levelColor : 'transparent'}`,
            cursor: 'pointer',
          }}
        />
        {categories.map(cat => (
          <Chip
            key={cat}
            label={CATEGORY_LABELS[cat] || cat}
            size="small"
            onClick={() => setActiveFilter(activeFilter === cat ? 'all' : cat)}
            sx={{
              fontSize: 11,
              background: activeFilter === cat ? alpha(levelColor, 0.8) : alpha(theme.palette.common.white, 0.06),
              color: activeFilter === cat ? theme.palette.common.white : 'text.secondary',
              border: `1px solid ${activeFilter === cat ? levelColor : 'transparent'}`,
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* Lista de selos por categoria */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        <AnimatePresence>
          {Object.entries(grouped).map(([category, categorySelosList]) => (
            <motion.div key={category}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <Typography sx={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: 1, color: 'text.disabled', mb: 1.5, mt: 1,
              }}>
                {CATEGORY_LABELS[category] || category}
              </Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 1, mb: 3,
              }}>
                {categorySelosList.map((selo, idx) => (
                  <SeloCard key={selo.id || idx} selo={selo} index={idx} />
                ))}
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {selos.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ fontSize: 32, mb: 1 }}>🏅</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Complete missões para ganhar seus primeiros selos
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default SelosDrawer;
