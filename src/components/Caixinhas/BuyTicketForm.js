import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  ConfirmationNumber as TicketIcon, 
  Close as CloseIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRifa } from '../../providers/RifaProvider';
import TicketSelectionGrid from './TicketSelectionGrid';

const BuyTicketForm = ({ open, onClose, caixinhaId, rifaId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { getRifaById, buyTicket, loading, error } = useRifa();
  const [rifa, setRifa] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [availableTickets, setAvailableTickets] = useState([]);
  const [processingPurchase, setProcessingPurchase] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (open && rifaId && caixinhaId) {
      const fetchRifa = async () => {
        try {
          const rifaData = await getRifaById(caixinhaId, rifaId);
          setRifa(rifaData);
          
          // Gerar bilhetes disponíveis
          const soldTickets = rifaData.bilhetesVendidos?.map(b => b.numero) || [];
          const available = [];
          
          for (let i = 1; i <= rifaData.quantidadeBilhetes; i++) {
            if (!soldTickets.includes(i)) {
              available.push(i);
            }
          }
          
          setAvailableTickets(available);
          setSelectedTicket('');
          setSuccessMessage('');
        } catch (err) {
          console.error('Erro ao buscar detalhes da rifa:', err);
        }
      };
      
      fetchRifa();
    }
  }, [rifaId, caixinhaId, open]);

  const handleBuyTicket = async () => {
    setProcessingPurchase(true);
    try {
      await buyTicket(caixinhaId, rifaId, parseInt(selectedTicket));
      setSuccessMessage(t('rifas.purchaseSuccess', { number: selectedTicket }));
      
      // Atualizar lista de bilhetes disponíveis
      setAvailableTickets(prev => prev.filter(num => num !== parseInt(selectedTicket)));
      
      // Limpar seleção após alguns segundos
      setTimeout(() => {
        setSelectedTicket('');
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao comprar bilhete:', err);
    } finally {
      setProcessingPurchase(false);
    }
  };

  if (!rifa && open) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TicketIcon />
          <Typography variant="h6" component="div">
            {t('rifas.buyTicket')}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        
        {rifa && (
          <Box>
            <Box sx={{ 
              mb: 3, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              p: 2,
              bgcolor: theme.palette.background.paper,
              borderRadius: 1,
              boxShadow: 1
            }}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
                {rifa.nome}
              </Typography>
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('rifas.ticketPrice')}:
                  </Typography>
                  <Typography variant="h6" fontWeight="medium" color="success.main">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(rifa.valorBilhete)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('rifas.soldTickets')}:
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {rifa.bilhetesVendidos?.length || 0}/{rifa.quantidadeBilhetes}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('rifas.drawDate')}:
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {new Date(rifa.sorteioData).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 3,
                p: 2,
                bgcolor: theme.palette.background.default,
                borderRadius: 1,
                width: '100%'
              }}>
                <TrophyIcon sx={{ fontSize: 32, color: theme.palette.warning.main, mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('rifas.prize')}:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {rifa.premio}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {/* Componente de seleção de bilhetes */}
            <TicketSelectionGrid
              rifa={rifa}
              availableTickets={availableTickets}
              selectedTicket={selectedTicket ? parseInt(selectedTicket) : null}
              setSelectedTicket={setSelectedTicket}
              loading={loading}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          disabled={processingPurchase}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleBuyTicket}
          disabled={!selectedTicket || processingPurchase || availableTickets.length === 0}
          startIcon={processingPurchase ? <CircularProgress size={20} color="inherit" /> : <TicketIcon />}
        >
          {processingPurchase ? t('rifas.processing') : t('rifas.buyTicket')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyTicketForm;