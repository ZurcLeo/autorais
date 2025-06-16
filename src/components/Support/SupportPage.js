import React, { useState, useEffect } from 'react';
import { Box, Container, Button, Switch, FormControlLabel, Alert, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupport } from '../../providers/SupportProvider';
import UserTicketList from './UserTicketList';
import SupportDashboard from './SupportDashboard';
import EnhancedSupportDashboard from './EnhancedSupportDashboard';
import EnhancedTicketDetail from './EnhancedTicketDetail';

const SupportPage = ({ ticketDetailMode = false }) => {
  const { hasPermissions, pendingTickets, myTickets, fetchTicketById } = useSupport();
  const [useEnhancedDashboard, setUseEnhancedDashboard] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const { ticketId } = useParams();
  const navigate = useNavigate();

  // Efeito para carregar ticket específico quando em modo de detalhes
  useEffect(() => {
    if (ticketDetailMode && ticketId) {
      // Primeiro tentar encontrar o ticket nas listas já carregadas
      const allTickets = [...(pendingTickets || []), ...(myTickets || [])];
      const foundTicket = allTickets.find(ticket => ticket.id === ticketId);
      
      if (foundTicket) {
        setSelectedTicket(foundTicket);
        setTicketDetailOpen(true);
      } else if (fetchTicketById) {
        // Se não encontrou, tentar buscar pelo ID
        fetchTicketById(ticketId)
          .then(ticket => {
            if (ticket) {
              setSelectedTicket(ticket);
              setTicketDetailOpen(true);
            } else {
              navigate('/support');
            }
          })
          .catch(error => {
            navigate('/support');
          });
      } else {
        navigate('/support');
      }
    }
  }, [ticketDetailMode, ticketId, pendingTickets, myTickets, fetchTicketById, navigate]);


  const handleTicketDetailClose = () => {
    setTicketDetailOpen(false);
    setSelectedTicket(null);
    if (ticketDetailMode) {
      navigate('/support');
    }
  };

  const renderContent = () => {
    if (!hasPermissions) {
      return <UserTicketList />;
    }

    if (useEnhancedDashboard) {
      return <EnhancedSupportDashboard />;
    }

    return (
      <>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            🚀 <strong>Novo Dashboard Aprimorado Disponível!</strong> 
            <br />
            Teste a nova interface com recursos avançados, analytics detalhados e contexto completo do usuário.
          </Alert>
          <FormControlLabel
            control={
              <Switch
                checked={useEnhancedDashboard}
                onChange={(e) => setUseEnhancedDashboard(e.target.checked)}
                color="primary"
              />
            }
            label="Usar Dashboard Aprimorado (Beta)"
          />
        </Paper>
        <SupportDashboard />
      </>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: hasPermissions && !useEnhancedDashboard ? 3 : 0 }}>
      {useEnhancedDashboard ? (
        <>
          <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
            <Button
              variant="outlined"
              onClick={() => setUseEnhancedDashboard(false)}
              size="small"
            >
              Voltar ao Dashboard Clássico
            </Button>
          </Box>
          {renderContent()}
        </>
      ) : (
        <Box py={useEnhancedDashboard ? 0 : 3}>
          {renderContent()}
        </Box>
      )}
      
      {/* Modal de detalhes do ticket */}
      <EnhancedTicketDetail
        ticket={selectedTicket}
        open={ticketDetailOpen}
        onClose={handleTicketDetailClose}
        onUpdate={(updatedTicket) => {
          // Ticket updated successfully
          // Aqui você pode adicionar lógica para atualizar o ticket na lista
        }}
      />
    </Container>
  );
};

export default SupportPage;