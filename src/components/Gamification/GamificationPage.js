// src/components/Gamification/GamificationPage.js
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../../providers/AuthProvider';
import { useGamification } from '../../providers/GamificationProvider';
import MissionsPanel from './MissionsPanel';
import GamificationProfileCard from './GamificationProfileCard';

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22, ease: 'easeOut' } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

const GamificationPage = () => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { gamification, tasks, selos, selosCatalog, loading } = useGamification();

  const user = {
    full_name: currentUser?.displayName || currentUser?.name || currentUser?.email,
    avatar_url: currentUser?.photoURL || currentUser?.avatar_url,
  };

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <motion.div variants={stagger} initial="initial" animate="animate">
        <motion.div variants={fadeUp}>
          <Box sx={{ mb: 3 }}>
            <Typography sx={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontWeight: 800,
              fontSize: { xs: 22, sm: 26 },
              color: theme.palette.text.primary,
              letterSpacing: -0.5,
              lineHeight: 1.15,
            }}>
              Sua jornada 🏆
            </Typography>
            <Typography sx={{ fontSize: 13, color: theme.palette.text.secondary, mt: 0.4, fontFamily: '"DM Sans", sans-serif' }}>
              Complete missões, suba de nível e conquiste selos
            </Typography>
          </Box>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <GamificationProfileCard
              user={user}
              gamification={gamification}
              selos={selos}
              selosCatalog={selosCatalog}
              loading={loading}
            />
            <MissionsPanel tasks={tasks} selosCatalog={selosCatalog} loading={loading} />
          </Box>
        </motion.div>
      </motion.div>
    </Box>
  );
};

export default GamificationPage;
