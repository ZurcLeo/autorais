import React, { useState } from 'react';
import {
  Container,
  Grid,
  Badge,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../AuthService';
import useUnreadMessage from '../PrivateRoute/hooks/useUnreadMessage';
import useUnreadConnections from './hooks/useUnreadConnections';
import useUnreadComments from './hooks/useUnreadComments';
import { toast } from 'react-toastify';
import {
  IoSettingsOutline,
  IoGiftOutline,
  IoHomeOutline,
  IoExtensionPuzzleOutline,
  IoChatbubblesOutline,
  IoTrailSignOutline,
  IoPersonOutline,
  IoIdCardOutline,
  IoNewspaperOutline,
  IoAirplaneOutline,
  IoPeopleOutline,
  IoPaperPlane,
  IoAddCircleOutline,
  IoExitOutline,
  IoHelpCircleOutline,
  IoVideocamOutline,
} from 'react-icons/io5';
import { BsPersonVcard } from 'react-icons/bs';
import { GiPartyHat } from 'react-icons/gi';

const DashboardMenu = () => {
  const { currentUser, logout } = useAuth();
  const [isFooterMenuOpen, setIsFooterMenuOpen] = useState(false);
  const unreadMessagesCount = useUnreadMessage();
  const { newRequests } = useUnreadConnections();
  const unreadCommentsCount = useUnreadComments();

  const navigate = useNavigate();

  const ELO_EVENT = process.env.REACT_APP_ELO_EVENT_IMAGE_URL;
  const ELO_COIN = process.env.REACT_APP_ELO_COIN_IMAGE_URL;

  const handleLogout = async () => {
    if (!currentUser) {
      return;
    }

    try {
      await logout();
      navigate('/Login');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao tentar deslogar:', error);
      toast.error('Erro ao tentar deslogar!');
    }
  };

  return (
    <Container sx={{ mt: '100px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={3}>
          <List>
            <ListItemButton onClick={() => navigate('/homepage')}>
              <ListItemIcon>
                <IoHomeOutline />
              </ListItemIcon>
              <ListItemText primary="Principal" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/LivesOnline')}>
              <ListItemIcon>
                <IoVideocamOutline />
              </ListItemIcon>
              <ListItemText primary="Ao Vivo" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/UserProfileSettings')}>
              <ListItemIcon>
                <IoSettingsOutline />
              </ListItemIcon>
              <ListItemText primary="Configurações" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/Postagens')}>
              <ListItemIcon>
                <IoNewspaperOutline />
              </ListItemIcon>
              <ListItemText primary="Postagens" />
              {unreadCommentsCount > 0 && <Badge badgeContent={unreadCommentsCount} color="error" />}
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/Connections')}>
              <ListItemIcon>
                <IoExtensionPuzzleOutline />
              </ListItemIcon>
              <ListItemText primary="Amigos" />
              {newRequests > 0 && <Badge badgeContent={newRequests} color="error" />}
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/ConvidarAmigos')}>
              <ListItemIcon>
                <BsPersonVcard />
              </ListItemIcon>
              <ListItemText primary="Convidar" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/goChat')}>
              <ListItemIcon>
                <IoChatbubblesOutline />
              </ListItemIcon>
              <ListItemText primary="Conversas" />
              {unreadMessagesCount > 0 && <Badge badgeContent={unreadMessagesCount} color="error" />}
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/Hospedagens')}>
              <ListItemIcon>
                <IoTrailSignOutline />
              </ListItemIcon>
              <ListItemText primary="Viagens" />
            </ListItemButton>
            <ListItemButton disabled onClick={() => navigate('/HospedagensClientes')}>
              <ListItemIcon>
                <IoPersonOutline />
              </ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/HospedagensProprietarios')}>
              <ListItemIcon>
                <IoIdCardOutline />
              </ListItemIcon>
              <ListItemText primary="Proprietários" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/RegistrarPresente')}>
              <ListItemIcon>
                <IoGiftOutline />
              </ListItemIcon>
              <ListItemText primary="Presentes" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/faq')}>
              <ListItemIcon>
                <IoHelpCircleOutline />
              </ListItemIcon>
              <ListItemText primary="F.A.Q." />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <IoExitOutline />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </List>
        </Grid>

        <Grid item xs={12} lg={6}>
          <div style={{ padding: '16px' }}>
            <Outlet />
          </div>
        </Grid>

        <Grid item lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <div style={{ marginBottom: '16px', backgroundColor: 'background.paper', borderRadius: '8px', padding: '16px' }}>
            <Typography variant="h6">Compre ElosCoin ℰ</Typography>
            <img src={ELO_COIN} alt="Elos Moeda Virtual" style={{ width: '100%', borderRadius: '8px' }} />
            <Typography variant="body2" style={{ marginTop: '16px' }}>
              Junte-se à comunidade ElosCloud e obtenha elos para aproveitar todos os recursos exclusivos. Torne sua
              experiência ainda mais rica e conectada!
            </Typography>
            <Button href="/Payments" variant="outlined" startIcon={<GiPartyHat />} sx={{ mt: 1 }}>
              Veja
            </Button>
          </div>
          <div style={{ backgroundColor: 'background.paper', borderRadius: '8px', padding: '16px' }}>
            <Typography variant="h6" display="flex" alignItems="center">
              <GiPartyHat style={{ marginRight: '8px' }} />
              Eventos
            </Typography>
            <img src={ELO_EVENT} alt="Eventos" style={{ width: '100%', borderRadius: '8px' }} />
            <Typography variant="body2" style={{ marginTop: '16px' }}>
              Veja os eventos acontecendo na sua região e interaja com seus amigos de diversas formas!
            </Typography>
            <Button variant="outlined" startIcon={<GiPartyHat />} sx={{ mt: 1 }}>
              Veja
            </Button>
          </div>
        </Grid>
      </Grid>

      {/* Menu de rodapé para dispositivos menores */}
      <div className={`footer-menu ${isFooterMenuOpen ? 'opened' : ''}`} onClick={() => setIsFooterMenuOpen(!isFooterMenuOpen)} style={{ position: 'fixed', bottom: '0', width: '100%', backgroundColor: 'background.default', color: 'text.primary', textAlign: 'center', padding: '10px 0' }}>
        <IoAddCircleOutline className="footer-menu-icon" />
      </div>

      {isFooterMenuOpen && (
        <Grid container className="fixed-bottom footer-menu-content" sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
          <Grid item xs={3} className="text-center">
            <IoPaperPlane />
            <Typography variant="caption">Postar</Typography>
          </Grid>
          <Grid item xs={3} className="text-center">
            <IoChatbubblesOutline />
            <Typography variant="caption">Mensagens</Typography>
          </Grid>
          <Grid item xs={3} className="text-center">
            <IoPeopleOutline />
            <Typography variant="caption">Amigos</Typography>
          </Grid>
          <Grid item xs={3} className="text-center">
            <IoAirplaneOutline />
            <Typography variant="caption">Viagens</Typography>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DashboardMenu;
