import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  CardGiftcard as PrizeIcon,
  Cancel as CancelIcon,
  Celebration as CelebrationIcon,
  ConfirmationNumber as TicketIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import CreateRifaForm from './CreateRifaForm';
import BuyTicketForm from './BuyTicketForm';
import RifaDetailsDialog from './RifaDetailsDialog';
import { useRifa } from '../../providers/RifaProvider';

const RifasManagement = ({ caixinha }) => {
  const { t } = useTranslation();
  const { getRifasByCaixinha, loading, rifas } = useRifa();
  const [selectedTab, setSelectedTab] = useState('active');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [buyTicketDialog, setBuyTicketDialog] = useState({ open: false, rifaId: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, rifaId: null });

  useEffect(() => {
    if (caixinha?.id) {
      getRifasByCaixinha(caixinha.id);
    }
  }, [caixinha?.id]);

  const handleCreateRifa = () => {
    setCreateDialogOpen(true);
  };

  const handleBuyTicket = (rifaId) => {
    setBuyTicketDialog({ open: true, rifaId });
  };

  const handleViewDetails = (rifaId) => {
    setDetailsDialog({ open: true, rifaId });
  };

  const activeRifas = rifas?.filter(rifa => rifa.status === 'ABERTA') || [];
  const finalizedRifas = rifas?.filter(rifa => rifa.status === 'FINALIZADA') || [];
  const canceledRifas = rifas?.filter(rifa => rifa.status === 'CANCELADA') || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderRifasList = (rifasList) => {
    if (rifasList.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {selectedTab === 'active' 
              ? t('rifas.noActiveRifas')
              : selectedTab === 'finalized'
              ? t('rifas.noFinalizedRifas')
              : t('rifas.noCanceledRifas')}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('rifas.name')}</TableCell>
              <TableCell>{t('rifas.ticketPrice')}</TableCell>
              <TableCell>{t('rifas.soldTickets')}</TableCell>
              <TableCell>{t('rifas.endDate')}</TableCell>
              <TableCell>{t('rifas.prize')}</TableCell>
              <TableCell>{t('rifas.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rifasList.map((rifa) => (
              <TableRow key={rifa.id}>
                <TableCell>{rifa.nome}</TableCell>
                <TableCell>{formatCurrency(rifa.valorBilhete)}</TableCell>
                <TableCell>
                  {rifa.bilhetesVendidos?.length || 0}/{rifa.quantidadeBilhetes}
                </TableCell>
                <TableCell>{formatDate(rifa.dataFim)}</TableCell>
                <TableCell>{rifa.premio}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(rifa.id)}>
                    <VisibilityIcon />
                  </IconButton>
                  {selectedTab === 'active' && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<TicketIcon />}
                      onClick={() => handleBuyTicket(rifa.id)}
                      sx={{ ml: 1 }}
                    >
                      {t('rifas.buyTicket')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">{t('rifas.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRifa}
          >
            {t('rifas.createRifa')}
          </Button>
        </Box>

        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab 
            value="active" 
            label={t('rifas.activeRifas')} 
            icon={<TicketIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="finalized" 
            label={t('rifas.finalizedRifas')} 
            icon={<CelebrationIcon />} 
            iconPosition="start"
          />
          <Tab 
            value="canceled" 
            label={t('rifas.canceledRifas')} 
            icon={<CancelIcon />} 
            iconPosition="start"
          />
        </Tabs>

        {selectedTab === 'active' && renderRifasList(activeRifas)}
        {selectedTab === 'finalized' && renderRifasList(finalizedRifas)}
        {selectedTab === 'canceled' && renderRifasList(canceledRifas)}
      </CardContent>

      {/* Create Rifa Dialog */}
      <CreateRifaForm 
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        caixinhaId={caixinha?.id}
      />

      {/* Buy Ticket Dialog */}
      <BuyTicketForm
        open={buyTicketDialog.open}
        onClose={() => setBuyTicketDialog({ open: false, rifaId: null })}
        caixinhaId={caixinha.id}
        rifaId={buyTicketDialog.rifaId}
      />

      {/* Rifa Details Dialog */}
      <RifaDetailsDialog
        open={detailsDialog.open}
        caixinhaId={caixinha.id}
        onClose={() => setDetailsDialog({ open: false, rifaId: null })}
        rifaId={detailsDialog.rifaId}
      />
    </Card>
  );
};

export default RifasManagement;