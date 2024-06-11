import React, { useState } from 'react';
import {
  Container, Box, Grid, Card, CardContent, CardMedia, Typography, Badge, Button, TextField
} from '@mui/material';
import { FaChartBar, FaClipboardList, FaCogs, FaChartLine } from 'react-icons/fa';
import EnvioDeConvite from '../imgs/enviodeconvite.png';
import RecebimentoDeConvite from '../imgs/recebimentodeconvite.png';
import PrimeiroLogin from '../imgs/primeirologin.png';
import BoasVindas from '../imgs/boasvindas.png';
import { Link } from 'react-router-dom';

const steps = [
  {
    title: 'Enviar',
    subtitle: 'PASSO 1',
    description: 'O seu amigo pessoal ou parceiro de negócios que já está na plataforma é o responsável pelo envio de convite. Fique atento ao seu e-mail!',
    icon: <FaChartBar size={60} />,
    image: EnvioDeConvite,
    links: [],
  },
  {
    title: 'Validar',
    subtitle: 'PASSO 2',
    description: 'Você verifica sua caixa de entrada e abre o convite. Você clica em Aceitar Convite e é redirecionado para a plataforma.',
    icon: <FaClipboardList size={60} />,
    image: RecebimentoDeConvite,
    links: [],
  },
  {
    title: 'Entrar',
    subtitle: 'PASSO 3',
    description: 'Usando o e-mail que recebeu o convite, você cria a sua conta, realiza o primeiro acesso e preenche os dados do seu perfil.',
    icon: <FaCogs size={60} />,
    image: PrimeiroLogin,
    links: [],
  },
  {
    title: 'Aproveitar',
    subtitle: 'PASSO 4',
    description: 'Exclusivamente ate o fim de 2024, ao criar sua conta na ElosCloud você receberá 5.000 ElosCoin para usar como quiser!',
    icon: <FaChartLine size={60} />,
    image: BoasVindas,
    links: [],
  },
];

const ComoFunciona = () => {
  const [email, setEmail] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`E-mail enviado: ${email}`);
    setEmail('');
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Quer Entrar Para a Comunidade?
      </Typography>
      <Typography variant="body1" paragraph>
        Em alguns passos simples, você pode obter acesso a nossa plataforma.
        <br />
        Qualquer pessoa na comunidade pode te convidar, veja como:
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {steps.map((step, index) => (
          <Grid item key={index} xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                image={step.image}
                alt={step.title}
                sx={{ height: 160, objectFit: 'contain' }}
              />
              <CardContent>
                <Badge color="secondary" badgeContent={step.subtitle} />
                <Typography variant="h6" gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body2">
                  {step.description}
                </Typography>
                {step.links.map((link, linkIndex) => (
                  <Typography key={linkIndex} variant="body2">
                    <Link to={link.url}>{link.text}</Link>
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={{ mt: 5 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Como Entrar
          </Typography>
          <Typography variant="body2" paragraph>
            Quer entrar para a nossa comunidade? <br />
            Envie o seu e-mail e nós avisaremos assim que novos convites estiverem disponíveis.
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Digite seu e-mail"
              value={email}
              onChange={handleEmailChange}
              sx={{ mb: 2 }}
            />
            <Button type="submit" fullWidth variant="contained" color="primary">
              Entrar na Lista
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ComoFunciona;