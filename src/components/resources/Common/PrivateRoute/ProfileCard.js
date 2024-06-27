import React from "react";
import {
  Container,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Chip,
  List,
  ListItem,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import { FaFacebook, FaTwitter, FaInstagram, FaHeart, FaBriefcase } from 'react-icons/fa';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const colorMapping = {
  "sem compromisso": "warning",
  "relacionamentos": "error",
  "passeios românticos": "success",
  "encontros casuais": "primary",
  "venda de produtos": "dark",
  "oferta de serviços": "info"
};

const getBadgeColor = (interesse) => {
  return colorMapping[interesse.toLowerCase()] || "primary";
};

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  '&:hover': {
    cursor: 'pointer',
  },
}));

const ProfileCard = ({ userData, currentUser }) => {
  const navigate = useNavigate();
  const placeholder = process.env.REACT_APP_PLACE_HOLDER_IMG;

  const handleEditProfile = () => {
    navigate('/EditarPerfil', { state: { userData } });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        <Grid item md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            src={userData.fotoDoPerfil || placeholder}
            alt="Profile"
            sx={{ width: 100, height: 100, margin: 'auto' }}
          />
          <Typography variant="h5" mt={3}>{userData.nome}</Typography>
          <Typography variant="body1" mt={1}>{userData.tipoDeConta}</Typography>
          <Button variant="outlined" color="warning" onClick={handleEditProfile} startIcon={<EditIcon />}>
            Editar Perfil
          </Button>
        </Grid>
        <Grid item md={8}>
          <Typography variant="h6">Resumo</Typography>
          <List>
            <ListItem>
              <Typography component="pre">{userData.descricao}</Typography>
            </ListItem>
          </List>
          <Typography variant="h6" mt={4}>Interesses</Typography>
          <Accordion>
            <AccordionSummary expandIcon={<FaHeart style={{ transform: 'rotate(0)' }} />}>
              <Typography>Pessoais</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {userData.interessesPessoais && userData.interessesPessoais.length > 0 ? (
                userData.interessesPessoais.map((interesse, index) => (
                  <Tooltip key={index} title="Clique para mais informações">
                    <StyledChip
                      label={interesse}
                      color={getBadgeColor(interesse)}
                    />
                  </Tooltip>
                ))
              ) : (
                <Typography>Sem interesses pessoais</Typography>
              )}
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<FaBriefcase style={{ transform: 'rotate(0)' }} />}>
              <Typography>Negócios</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="error">
                <strong>IMPORTANTE:</strong> Para se habilitar a negociar na plataforma, valide seu cadastro comercial.
              </Typography>
              {userData.interessesNegocios && userData.interessesNegocios.length > 0 ? (
                userData.interessesNegocios.map((interesse, index) => (
                  <Tooltip key={index} title="Clique para mais informações">
                    <StyledChip
                      label={interesse}
                      color={getBadgeColor(interesse)}
                    />
                  </Tooltip>
                ))
              ) : (
                <Typography>Sem interesses de negócios</Typography>
              )}
            </AccordionDetails>
          </Accordion>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <IconButton color="primary">
              <FaFacebook />
            </IconButton>
            <IconButton color="primary">
              <FaTwitter />
            </IconButton>
            <IconButton color="primary">
              <FaInstagram />
            </IconButton>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileCard;
