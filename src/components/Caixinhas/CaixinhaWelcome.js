import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Paper,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  PersonAdd as PersonAddIcon, 
  Payments as PaymentsIcon, 
  AccountBalance as AccountBalanceIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
  EventAvailable as EventAvailableIcon,
  Security as SecurityIcon,
  MonetizationOn as MonetizationOnIcon,
  ExpandMore as ExpandMoreIcon, 
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import { useTranslation } from 'react-i18next';
import CreateCaixinhaButton from './CreateCaixinhaButton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const caixinhaImg = process.env.REACT_APP_IMG_CAIXINHAS;
// Dados de exemplo para ilustração
const sampleBalanceData = [
  { month: 'Jan', amount: 1000 },
  { month: 'Fev', amount: 2000 },
  { month: 'Mar', amount: 3000 },
  { month: 'Abr', amount: 4000 },
  { month: 'Mai', amount: 5000 },
  { month: 'Jun', amount: 6000 },
];

// Componente para cartão de recurso/benefício
const FeatureCard = ({ icon, title, description }) => (
  <Paper 
    elevation={2} 
    sx={{ 
      p: 3, 
      height: '100%',
      borderRadius: 3,
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 6
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <Avatar 
        sx={{ 
          width: 56, 
          height: 56, 
          bgcolor: 'primary.light',
          color: 'primary.contrastText'
        }}
      >
        {icon}
      </Avatar>
    </Box>
    <Typography variant="h6" gutterBottom align="center">
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" align="center">
      {description}
    </Typography>
  </Paper>
);

// Componente para tutorial
const TutorialStep = ({ number, title, description }) => (
  <ListItem alignItems="flex-start">
    <ListItemIcon>
      <Avatar sx={{ bgcolor: 'primary.main' }}>
        {number}
      </Avatar>
    </ListItemIcon>
    <ListItemText
      primary={title}
      secondary={description}
      primaryTypographyProps={{ fontWeight: 'bold' }}
    />
  </ListItem>
);

// Componente para exemplo de retorno
const ReturnExample = ({ month, amount, name }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card sx={{ mb: 1, borderRadius: 2 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              {month}
            </Typography>
          </Grid>
          <Grid item xs>
            <Typography variant="body1" fontWeight="medium">
              {name}
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={formatCurrency(amount)} 
              color="success" 
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const CaixinhaWelcome = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeFeature, setActiveFeature] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Seção de Cabeçalho/Hero */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 4,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('caixinha.welcome.title', 'Comece sua Caixinha')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              {t('caixinha.welcome.subtitle', 'Organize consórcios entre amigos de maneira simples e segura')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {t('caixinha.welcome.description', 'Com a Caixinha, você pode criar e gerenciar consórcios com facilidade. Contribuições mensais, distribuição de valores, empréstimos e muito mais.')}
            </Typography>
            <CreateCaixinhaButton />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              component="img"
              src={caixinhaImg}
              alt="Ilustração de Caixinha"
              sx={{
                width: '100%',
                maxWidth: 400,
                display: 'block',
                mx: 'auto'
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Seção de Benefícios */}
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
        {t('caixinha.welcome.benefits.title', 'Benefícios da Caixinha')}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<GroupIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.community.title', 'Comunidade')}
            description={t('caixinha.welcome.benefits.community.description', 'Organize consórcios com amigos, família ou colegas de trabalho com facilidade.')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<SecurityIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.security.title', 'Segurança')}
            description={t('caixinha.welcome.benefits.security.description', 'Transações seguras e transparentes com histórico completo de atividades.')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<MonetizationOnIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.flexibility.title', 'Flexibilidade')}
            description={t('caixinha.welcome.benefits.flexibility.description', 'Defina suas próprias regras para contribuições, distribuições e empréstimos.')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<PaymentsIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.payments.title', 'Pagamentos')}
            description={t('caixinha.welcome.benefits.payments.description', 'Integração com PIX para contribuições e distribuições rápidas e sem taxas.')}
          />
        </Grid>
      </Grid>

      {/* Seção Como Funciona */}
      <Paper elevation={2} sx={{ p: 3, mb: 6, borderRadius: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          {t('caixinha.welcome.howItWorks.title', 'Como funciona a Caixinha')}
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <List>
              <TutorialStep
                number="1"
                title={t('caixinha.welcome.howItWorks.step1.title', 'Crie sua Caixinha')}
                description={t('caixinha.welcome.howItWorks.step1.description', 'Defina o nome, valor das contribuições mensais e outras configurações para sua Caixinha.')}
              />
              <TutorialStep
                number="2"
                title={t('caixinha.welcome.howItWorks.step2.title', 'Convide Participantes')}
                description={t('caixinha.welcome.howItWorks.step2.description', 'Adicione amigos, familiares ou conhecidos para participar da sua Caixinha.')}
              />
              <TutorialStep
                number="3"
                title={t('caixinha.welcome.howItWorks.step3.title', 'Faça Contribuições')}
                description={t('caixinha.welcome.howItWorks.step3.description', 'Todos contribuem mensalmente com o valor definido, formando um fundo comum.')}
              />
              <TutorialStep
                number="4"
                title={t('caixinha.welcome.howItWorks.step4.title', 'Distribua os Recursos')}
                description={t('caixinha.welcome.howItWorks.step4.description', 'Por sorteio ou ordem definida, cada participante recebe o valor acumulado em um determinado mês.')}
              />
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleBalanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: 8,
                      boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
                      border: 'none'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ r: 6, strokeWidth: 2 }}
                    activeDot={{ r: 8, strokeWidth: 2 }}
                    name={t('caixinha.welcome.saldoAcumulado', 'Saldo Acumulado')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
              {t('caixinha.welcome.chartDescription', 'Exemplo de crescimento do saldo em uma Caixinha com 6 participantes e contribuição mensal de R$ 1.000')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção Exemplo de Retorno */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {t('caixinha.welcome.distributionExample.title', 'Exemplo de Distribuição')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('caixinha.welcome.distributionExample.description', 'Com 6 participantes contribuindo R$ 1.000 por mês, cada um recebe R$ 6.000 no seu mês.')}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <ReturnExample month="Janeiro" amount={6000} name="Carlos Silva" />
              <ReturnExample month="Fevereiro" amount={6000} name="Ana Oliveira" />
              <ReturnExample month="Março" amount={6000} name="João Santos" />
              <ReturnExample month="Abril" amount={6000} name="Maria Costa" />
              <ReturnExample month="Maio" amount={6000} name="Pedro Souza" />
              <ReturnExample month="Junho" amount={6000} name="Lúcia Almeida" />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {t('caixinha.welcome.startNow.title', 'Comece Agora Mesmo')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {t('caixinha.welcome.startNow.description', 'Crie sua Caixinha em poucos minutos e comece a organizar seu consórcio com facilidade e segurança.')}
            </Typography>
            
            <List sx={{ mb: 3 }}>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary={t('caixinha.welcome.startNow.benefit1', 'Sem taxas de administração')} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary={t('caixinha.welcome.startNow.benefit2', 'Notificações automáticas')} />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                <ListItemText primary={t('caixinha.welcome.startNow.benefit3', 'Controle total e transparência')} />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 'auto', textAlign: 'center' }}>
              <CreateCaixinhaButton />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* FAQ Section - Opcional */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          {t('caixinha.welcome.faq.title', 'Perguntas Frequentes')}
        </Typography>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question1', 'Quanto custa criar uma Caixinha?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer1', 'Criar e gerenciar uma Caixinha é totalmente gratuito. Não cobramos taxas de administração ou mensalidades.')}
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question2', 'Como funciona a distribuição dos recursos?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer2', 'Você pode escolher entre distribuição por sorteio ou ordem definida. Os recursos são distribuídos mensalmente para um participante diferente.')}
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question3', 'É possível fazer empréstimos na Caixinha?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer3', 'Sim, você pode habilitar a função de empréstimos na sua Caixinha, definindo taxas de juros e regras específicas para o seu grupo.')}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Call to Action Final */}
      <Box sx={{ textAlign: 'center', my: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
          {t('caixinha.welcome.cta.title', 'Pronto para começar?')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {t('caixinha.welcome.cta.description', 'Crie sua Caixinha agora mesmo e comece a aproveitar todos os benefícios de um consórcio organizado e transparente.')}
        </Typography>
        <CreateCaixinhaButton />
      </Box>
    </Box>
  );
};

export default CaixinhaWelcome;