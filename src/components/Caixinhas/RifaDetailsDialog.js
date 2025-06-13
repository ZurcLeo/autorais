import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Slide,
  Zoom,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion'; 
import {
  ConfirmationNumber as TicketIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Gavel as DrawIcon,
  Verified as VerifiedIcon,
  EmojiEvents as PrizeIcon,
  Groups as MembersIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRifa } from '../../providers/RifaProvider';
import { useCaixinha } from '../../providers/CaixinhaProvider';

const RifaDetailsDialog = ({ open, onClose, caixinhaId, rifaId }) => {
  const { t } = useTranslation();
  const { 
    getRifaById, 
    verifyAuthenticity, 
    performDraw,
    loading, 
    error 
  } = useRifa();
  
  // Obter os membros da caixinha usando o CaixinhaProvider
  const { getMembers, members, loading: membersLoading } = useCaixinha();
  
  const [rifa, setRifa] = useState(null);
  const [authenticity, setAuthenticity] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
    // Novos estados para a animação de sorteio e celebração
    const [isDrawing, setIsDrawing] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [drawComplete, setDrawComplete] = useState(false);
    const [winningNumber, setWinningNumber] = useState(null); // Para guardar o número vencedor e animar
  
    useEffect(() => {
      if (open && rifaId) {
        const fetchRifa = async () => {
          try {
            const rifaData = await getRifaById(caixinhaId, rifaId);
            setRifa(rifaData);
            // Se a rifa já foi sorteada, define drawComplete como true
            if (rifaData?.sorteioResultado?.numeroSorteado) {
              setDrawComplete(true);
              setWinningNumber(rifaData.sorteioResultado.numeroSorteado);
            } else {
              setDrawComplete(false);
              setWinningNumber(null);
            }
          } catch (err) {
            console.error('Erro ao buscar detalhes da rifa:', err);
          }
        };
  
        fetchRifa();
        getMembers(caixinhaId);
      }
    }, [rifaId, caixinhaId, open, getMembers, getRifaById]); // Adicione getRifaById às dependências
  
    const membersMap = useMemo(() => {
      if (!members) return {};
  
      return members.reduce((acc, member) => {
        const memberId = member.userId || member.id;
        acc[memberId] = {
          id: memberId,
          nome: member.nome || member.name,
          email: member.email,
          isAdmin: Boolean(member.isAdmin || member.role === 'admin'),
          fotoPerfil: member.fotoDoPerfil || member.fotoPerfil || member.photoURL
        };
        return acc;
      }, {});
    }, [members]);
  
    const memberStats = useMemo(() => {
      if (!rifa?.bilhetesVendidos) return [];
  
      const statsByMember = {};
      rifa.bilhetesVendidos.forEach(bilhete => {
        if (!statsByMember[bilhete.membroId]) {
          statsByMember[bilhete.membroId] = {
            membroId: bilhete.membroId,
            quantidadeBilhetes: 0,
            bilhetes: []
          };
        }
        statsByMember[bilhete.membroId].quantidadeBilhetes += 1;
        statsByMember[bilhete.membroId].bilhetes.push(bilhete.numero);
      });
  
      return Object.values(statsByMember)
        .sort((a, b) => b.quantidadeBilhetes - a.quantidadeBilhetes);
    }, [rifa?.bilhetesVendidos]);
  
    const handleVerifyAuthenticity = async () => {
      try {
        const result = await verifyAuthenticity(caixinhaId, rifaId);
        setAuthenticity(result);
        setShowVerification(true);
      } catch (err) {
        console.error('Erro ao verificar autenticidade:', err);
      }
    };
  
    const handlePerformDraw = async () => {
      try {
        // 1. Iniciar animação de sorteio
        setIsDrawing(true);
        setDrawComplete(false);
        setShowCelebration(false);
        setWinningNumber(null); // Reseta o número vencedor antes de sortear
  
        const metodo = rifa.sorteioMetodo;
        const referencia = rifa.sorteioReferencia;
  
        // 2. Executar o sorteio (com delay para animação)
        // O performDraw do hook simula um delay, então não precisa de setTimeout aqui
        await performDraw(caixinhaId, rifaId, metodo, referencia);
  
        // 3. Recarregar a rifa para mostrar o resultado
        const updatedRifa = await getRifaById(caixinhaId, rifaId);
        setRifa(updatedRifa);
  
        // 4. Revelar o número vencedor com animação após um pequeno delay
        setTimeout(() => {
          setWinningNumber(updatedRifa.sorteioResultado?.numeroSorteado);
          setIsDrawing(false);
          setDrawComplete(true);
        }, 1000); // Delay para mostrar o número girando antes de parar
  
        // 5. Mostrar celebração após um pequeno delay adicional
        setTimeout(() => {
          setShowCelebration(true);
        }, 2000); // Delay maior para a celebração aparecer após o número ser revelado
  
      } catch (err) {
        console.error('Erro ao realizar sorteio:', err);
        setIsDrawing(false);
      }
    };

  const drawButtonVariants = {
    idle: { scale: 1, boxShadow: "0px 4px 8px rgba(0,0,0,0.2)" },
    hover: { scale: 1.05, boxShadow: "0px 6px 12px rgba(0,0,0,0.3)" },
    tap: { scale: 0.95 },
    drawing: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { repeat: Infinity, duration: 0.5 }
    }
  };

  const numberRevealVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      rotate: -180
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
        duration: 0.8
      }
    },
    celebration: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        repeat: 3,
        duration: 0.6
      }
    }
  };

  const celebrationOverlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };

  const confettiVariants = {
    hidden: { y: -100, opacity: 0, rotate: 0 },
    visible: (i) => ({
      y: window.innerHeight + 100,
      opacity: [0, 1, 1, 0],
      rotate: 360 * 3,
      transition: {
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 0.5,
        ease: "easeOut"
      }
    })
  };

  const winnerCardVariants = {
    hidden: {
      y: 50,
      opacity: 0,
      scale: 0.8
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        delay: 0.3
      }
    }
  };

  // Componente de Confetes Animados (usará o Dialog para o overlay)
  const AnimatedConfetti = () => (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={confettiVariants}
          initial="hidden"
          animate="visible"
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            fontSize: '2rem',
          }}
        >
          {['🎉', '🎊', '⭐', '✨', '🎁', '🏆'][Math.floor(Math.random() * 6)]}
        </motion.div>
      ))}
    </Box>
  );

  // Componente de Números Girando (Loading)
  const SpinningNumbers = () => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      fontSize: '3rem',
      fontWeight: 'bold',
      color: 'primary.main' // Usando cor do tema MUI
    }}>
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotateX: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1
          }}
        >
          {Math.floor(Math.random() * 10)}
        </motion.div>
      ))}
    </Box>
  );

  // Renderizar bilhete com informações aprimoradas do membro
  const renderBilhete = (bilhete) => {
    const membro = membersMap[bilhete.membroId] || {};
    const isWinner = rifa.sorteioResultado?.numeroSorteado === bilhete.numero;
    
    return (
      <ListItem 
        key={bilhete.numero}
        sx={{
          bgcolor: isWinner ? 'success.light' : 'inherit',
          borderRadius: 1,
          mb: 1,
          border: '1px solid',
          borderColor: isWinner ? 'success.main' : 'divider'
        }}
      >
        <ListItemAvatar>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isWinner ? (
                <Tooltip title={t('rifas.winner')}>
                  <PrizeIcon color="warning" fontSize="small" />
                </Tooltip>
              ) : null
            }
          >
            <Avatar 
              src={membro.fotoPerfil} 
              sx={{ 
                bgcolor: membro.fotoPerfil ? 'transparent' : 'primary.main',
                border: isWinner ? '2px solid' : 'none',
                borderColor: 'warning.main'
              }}
            >
              {!membro.fotoPerfil && <PersonIcon />}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                icon={<TicketIcon />} 
                label={`#${bilhete.numero}`}
                color={isWinner ? "success" : "primary"}
                size="small"
                sx={{ mr: 1 }}
              />
              <Typography variant="subtitle2">
                {membro.nome || bilhete.membroId}
              </Typography>
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <TimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {new Date(bilhete.dataCompra).toLocaleString('pt-BR')}
              </Typography>
            </Box>
          }
        />
      </ListItem>
    );
  };

  if (!rifa && open) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {rifa?.nome}
            </Typography>
            <Chip 
              label={t(`rifas.status.${rifa?.status.toLowerCase()}`)}
              color={
                rifa?.status === 'ABERTA' ? 'success' : 
                rifa?.status === 'FINALIZADA' ? 'primary' : 'error'
              }
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
          <Chip 
            icon={<TicketIcon />}
            label={t('rifas.ticketsInfo', { 
              sold: rifa?.bilhetesVendidos?.length || 0, 
              total: rifa?.quantidadeBilhetes 
            })}
            variant="outlined"
            color="primary"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {rifa && (
          <Box>
            <Typography variant="body1" paragraph>
              {rifa.descricao}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('rifas.details')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.ticketPrice')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(rifa.valorBilhete)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.totalValue')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(rifa.valorBilhete * (rifa.bilhetesVendidos?.length || 0))}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.endDate')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(rifa.dataFim).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.drawDate')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(rifa.sorteioData).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.prize')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {rifa.premio}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        {t('rifas.drawMethod')}:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {t(`rifas.drawMethod.${rifa.sorteioMetodo.toLowerCase()}`)}
                        {rifa.sorteioReferencia && ` (${rifa.sorteioReferencia})`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                {rifa.status === 'FINALIZADA' && rifa.sorteioResultado && (
  <Paper sx={{ p: 2, mt: 2 }}>
    <Typography variant="h6" gutterBottom>
      {t('rifas.drawResult')}
    </Typography>

    <AnimatePresence>
      {drawComplete && winningNumber && (
        <motion.div
          variants={numberRevealVariants}
          initial="hidden"
          // Animação de "celebration" no número após o sorteio
          animate={showCelebration ? "celebration" : "visible"}
          style={{ marginTop: '1rem' }}
        >
          <Typography variant="h4" gutterBottom>🎊 {t('rifas.winningNumber')}:</Typography>
          <motion.div
            style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#ffd700', // Dourado
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '1rem 0'
            }}
          >
            {winningNumber}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <Divider sx={{ my: 2 }} />

    {/* Card do Vencedor (se houver) */}
    <AnimatePresence>
      {drawComplete && rifa.sorteioResultado?.bilheteVencedor && (
        <motion.div
          variants={winnerCardVariants}
          initial="hidden"
          animate="visible"
          style={{
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '1.5rem',
            border: '2px solid #4caf50'
          }}
        >
          <Typography variant="h5" sx={{ color: 'success.main', mb: 1 }}>
            🏆 {t('rifas.winnerTitle')}
          </Typography>
          {membersMap[rifa.sorteioResultado.bilheteVencedor.membroId] ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar
                src={membersMap[rifa.sorteioResultado.bilheteVencedor.membroId].fotoPerfil}
                sx={{ bgcolor: 'success.main', mr: 1, width: 56, height: 56 }}
              >
                {!membersMap[rifa.sorteioResultado.bilheteVencedor.membroId].fotoPerfil && <PersonIcon sx={{ fontSize: 32 }} />}
              </Avatar>
              <Typography variant="h6">
                {membersMap[rifa.sorteioResultado.bilheteVencedor.membroId].nome}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 1, width: 56, height: 56 }}>
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6">
                {rifa.sorteioResultado.bilheteVencedor.membroId}
              </Typography>
            </Box>
          )}
          <Typography variant="body1" sx={{ mt: 1 }}>
            {t('rifas.winningTicket')}: #{winningNumber}
          </Typography>
        </motion.div>
      )}
    </AnimatePresence>

    <Box sx={{ mt: 2 }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleVerifyAuthenticity}
        startIcon={<VerifiedIcon />}
        fullWidth
      >
        {t('rifas.verifyAuthenticity')}
      </Button>
    </Box>
  </Paper>
)}
               {rifa.status === 'ABERTA' && new Date() >= new Date(rifa.sorteioData) && (
<Paper sx={{ p: 2, mt: 2 }}>
  <Typography variant="h6" gutterBottom>
    {t('rifas.performDraw')}
  </Typography>

  <Alert severity="info" sx={{ mb: 2 }}>
    {t('rifas.drawInfo')}
  </Alert>

  <motion.button
    variants={drawButtonVariants} // Use as variantes definidas
    initial="idle"
    whileHover={!isDrawing ? "hover" : ""}
    whileTap={!isDrawing ? "tap" : ""}
    animate={isDrawing ? "drawing" : "idle"}
    onClick={handlePerformDraw}
    disabled={isDrawing || loading}
    // Estilos para parecer um botão do Material-UI, mas permitindo motion
    style={{
      padding: '1rem 2rem',
      fontSize: '1.2rem',
      backgroundColor: isDrawing ? '#ff9800' : drawComplete ? '#4caf50' : '#1976d2', // Cores do Material-UI
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      cursor: isDrawing || drawComplete ? 'not-allowed' : 'pointer',
      marginTop: '1rem',
      transition: 'background-color 0.3s ease',
      width: '100%' // Ajuste de largura para preencher o Paper
    }}
  >
    {isDrawing ? t('rifas.drawing') : drawComplete ? t('rifas.drawCompleted') : t('rifas.performDrawButton')}
  </motion.button>

  {/* Animação de Loading (SpinningNumbers) */}
  <AnimatePresence>
    {isDrawing && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        style={{ marginTop: '2rem' }}
      >
        <Typography variant="body1" sx={{ mb: 1 }}>{t('rifas.generatingRandomNumber')}</Typography>
        <SpinningNumbers />
      </motion.div>
    )}
  </AnimatePresence>
</Paper>
                )}
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TicketIcon sx={{ mr: 1 }} />
                    {t('rifas.soldTicketsList')}
                  </Typography>
                  
                  {rifa.bilhetesVendidos?.length === 0 ? (
                    <Alert severity="info">
                      {t('rifas.noSoldTickets')}
                    </Alert>
                  ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {rifa.bilhetesVendidos.sort((a, b) => a.numero - b.numero).map(renderBilhete)}
                    </List>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <MembersIcon sx={{ mr: 1 }} />
                    {t('rifas.participantsStats')}
                  </Typography>
                  
                  {memberStats.length === 0 ? (
                    <Alert severity="info">
                      {t('rifas.noParticipants')}
                    </Alert>
                  ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {memberStats.map(stat => {
                        const membro = membersMap[stat.membroId] || {};
                        
                        return (
                          <ListItem key={stat.membroId} sx={{ mb: 1 }}>
                            <ListItemAvatar>
                              <Avatar 
                                src={membro.fotoPerfil}
                                sx={{ bgcolor: membro.fotoPerfil ? 'transparent' : 'primary.main' }}
                              >
                                {!membro.fotoPerfil && <PersonIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2">
                                  {membro.nome || stat.membroId}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" component="span">
                                    {t('rifas.ticketsCount', { count: stat.quantidadeBilhetes })}
                                  </Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    {stat.bilhetes.sort((a, b) => a - b).map(numero => (
                                      <Chip
                                        key={numero}
                                        label={numero}
                                        size="small"
                                        color={rifa.sorteioResultado?.numeroSorteado === numero ? "success" : "default"}
                                        sx={{ mr: 0.5, mb: 0.5 }}
                                      />
                                    ))}
                                  </Box>
                                </>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Paper>
                
                {showVerification && authenticity && (
                  <Paper sx={{ p: 2, mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {t('rifas.authenticityVerification')}
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('rifas.integrityCheck')}:
                        </Typography>
                        <Chip
                          icon={authenticity.integridadeOk ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={authenticity.integridadeOk ? t('rifas.passed') : t('rifas.failed')}
                          color={authenticity.integridadeOk ? 'success' : 'error'}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          {t('rifas.externalSourceCheck')}:
                        </Typography>
                        <Chip
                          icon={authenticity.fonteExternaOk ? <CheckCircleIcon /> : <ErrorIcon />}
                          label={authenticity.fonteExternaOk ? t('rifas.passed') : t('rifas.failed')}
                          color={authenticity.fonteExternaOk ? 'success' : 'error'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          {t('rifas.verificationDate')}:
                        </Typography>
                        <Typography variant="body1">
                          {new Date(authenticity.dataVerificacao).toLocaleString('pt-BR')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Box>
        )}
        <AnimatePresence>
  {showCelebration && (
    <Dialog
      open={showCelebration}
      onClose={() => setShowCelebration(false)}
      TransitionComponent={Slide} // Adiciona animação de transição do MUI
      TransitionProps={{ direction: "up" }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        component: motion.div, // Permite Framer Motion no Paper
        variants: celebrationOverlayVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
        sx: {
          borderRadius: '24px',
          backgroundColor: 'white',
          color: '#333',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: 24 // Elevação do MUI
        }
      }}
      onClick={() => setShowCelebration(false)} // Fechar ao clicar fora ou no overlay
      sx={{
        '& .MuiDialog-container': {
          background: 'rgba(0,0,0,0.3)', // Overlay escurecido
        }
      }}
    >
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 2
          }}
          style={{ fontSize: '4rem', marginBottom: '1rem' }}
        >
          🎉
        </motion.div>
        <Typography variant="h4" color="primary" sx={{ margin: '1rem 0' }}>
          {t('rifas.congratulations')}!
        </Typography>
        <Typography variant="body1" paragraph>
          {t('rifas.drawSuccessMessage')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowCelebration(false)}
          sx={{ mt: 2 }}
          component={motion.button} // Permite Framer Motion no botão
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('common.close')}
        </Button>
      </DialogContent>
      <AnimatedConfetti /> {/* Confetes sempre no topo */}
    </Dialog>
  )}
</AnimatePresence>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RifaDetailsDialog;