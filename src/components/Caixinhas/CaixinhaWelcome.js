import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import {
  Group as GroupIcon,
  Security as SecurityIcon,
  MonetizationOn as MonetizationOnIcon,
  Payments as PaymentsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as AttachMoneyIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  People as PeopleIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import caixinha_back from '../../images/caixinha_back.png';
import { useTranslation } from 'react-i18next';
import CreateCaixinhaButton from './CreateCaixinhaButton';
import { useNavigate } from 'react-router-dom';
import { useCaixinha } from '../../providers/CaixinhaProvider';
import OpenSimulatorButton from './OpenSimulatorButton';

const caixinhaImg = caixinha_back;
// Componente de card para as caixinhas do usuário
export const CaixinhaCard = ({ caixinha, onClick }) => {
  const { t } = useTranslation();
  const theme = useTheme()

  // Calcula a data final formatada
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Formata valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Calcula o progresso da caixinha (exemplo: baseado no tempo decorrido)
  const calcularProgresso = (dataInicio, dataFim) => {
    const inicio = new Date(dataInicio).getTime();
    const fim = new Date(dataFim).getTime();
    const hoje = new Date().getTime();
    
    if (hoje >= fim) return 100;
    if (hoje <= inicio) return 0;
    
    return Math.floor(((hoje - inicio) / (fim - inicio)) * 100);
  };

  const progresso = caixinha.dataInicio && caixinha.dataFim 
    ? calcularProgresso(caixinha.dataInicio, caixinha.dataFim)
    : 50; // Valor padrão

  // Define cores de acordo com o progresso
  const getColorByProgress = (progress) => {
    if (progress < 30) return 'info.main';
    if (progress < 70) return 'warning.main';
    return 'success.main';
  };

  return (
    <Card 
      elevation={3}
      sx={{
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'relative',
          height: 120,
          borderRadius: '20px',
          bgcolor: theme.palette.background.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Typography variant="h5" component="h2" color={theme.palette.primary.main} align="center" fontWeight="bold">
          {caixinha.name}
        </Typography>
        <Avatar 
          sx={{ 
            position: 'absolute', 
            bottom: -20, 
            right: 20,
            width: 50, 
            height: 50,
            bgcolor: theme.palette.background.primary,
            border: '3px solid white'
          }}
        >
          {caixinha.name ? caixinha.name.charAt(0).toUpperCase() : "C"}
        </Avatar>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color={theme.palette.secondary.main} gutterBottom>
            {t('total')}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {formatCurrency(caixinha.saldoTotal)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <PeopleIcon fontSize="small" color={theme.palette.primary.main} />
          <Typography variant="body2">
            {caixinha.members?.length || 0} {t('members')}
          </Typography>
        </Box>
        
        {caixinha.dataFim && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <CalendarTodayIcon fontSize="small" color={theme.palette.primary.main} />
            <Typography variant="body2">
              {t('endDate')}: {formatarData(caixinha.dataFim)}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">{t('progress')}</Typography>
            <Typography variant="body2" fontWeight="medium">{progresso}%</Typography>
          </Box>
          <Box 
            sx={{ 
              width: '100%', 
              height: 6, 
              bgcolor: theme.palette.background.secondary, 
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                width: `${progresso}%`, 
                height: '100%', 
                bgcolor: getColorByProgress(progresso),
                transition: 'width 1s ease-in-out'
              }} 
            />
          </Box>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2, pt: 1.5, pb: 1.5 }}>
        <Button 
          fullWidth 
          variant="contained" 
          endIcon={<ArrowForwardIcon />}
          onClick={() => onClick(caixinha)}
        >
          {t('accessCaixinha')}
        </Button>
      </CardActions>
    </Card>
  );
};

// Componente para o Banner "Minhas Caixinhas"
const MyCaixinhasSection = ({ caixinhas, onCaixinhaSelect, loading }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (caixinhas.length === 0) {
    return null; // Não exibe a seção se não houver caixinhas
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          {t('myCaixinhas')}
        </Typography>
        <CreateCaixinhaButton variant="outlined" size={isMobile ? "small" : "medium"} />
        <OpenSimulatorButton />
      </Box>

      <Grid container spacing={3}>
        {caixinhas.map(caixinha => (
          <Grid
            item
            xs={12} // Em telas extra-pequenas (celular), ocupa 12 colunas (1 cartão por linha)
            sm={6}  // Em telas pequenas (tablet), ocupa 6 colunas (2 cartões por linha)
            md={4}  // Em telas médias (desktop), ocupa 4 colunas (3 cartões por linha)
            lg={4}  // Em telas grandes (desktop), ocupa 4 colunas (3 cartões por linha)
            xl={4}  // Em telas extra-grandes (desktop), ocupa 4 colunas (3 cartões por linha)
            key={caixinha.id}
          >            
          <CaixinhaCard 
              caixinha={caixinha} 
              onClick={onCaixinhaSelect} 
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

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
      primary={
        <Typography variant="subtitle2" fontWeight='bold' color="primary">
          {title}
        </Typography>
      }
      secondary={description}
      primaryTypographyProps={{ fontWeight: 'bold' }}
    />
  </ListItem>
);

const CaixinhaWelcome = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const caixinhaContext = useCaixinha();
  const [loading, setLoading] = useState(true);
  console.log('testew: ', caixinhaContext)

  // Obter as caixinhas do usuário
  const caixinhasArray = caixinhaContext.caixinhas?.caixinhas || [];  
  
  useEffect(() => {
    // Simulando carregamento de dados
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCaixinhaSelect = (caixinha) => {
    // Navegar para o CaixinhaOverview com a caixinha selecionada
    // Supondo que a rota seja algo como '/caixinha/:id'
    navigate(`/caixinha/${caixinha.id}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Exemplo de dados para gráfico
  const sampleBalanceData = [
    { month: 'Jan', amount: 1000 },
    { month: 'Fev', amount: 2000 },
    { month: 'Mar', amount: 3000 },
    { month: 'Abr', amount: 4000 },
    { month: 'Mai', amount: 5000 },
    { month: 'Jun', amount: 6000 },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Seção de Caixinhas existentes */}
      <MyCaixinhasSection 
        caixinhas={caixinhasArray}
        onCaixinhaSelect={handleCaixinhaSelect}
        loading={loading}
      />

      {/* Seção de Cabeçalho/Hero - Exibida apenas se não houver caixinhas */}
      {caixinhasArray.length === 0 && !loading && (
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
            <Grid item xs={12} md={6} >
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}>
                {t('caixinha.welcome.title', 'Comece sua Caixinha')}
              </Typography>
              <Typography variant="h6" color={theme.palette.primary.main} sx={{ mb: 3 }}>
                {t('caixinha.welcome.subtitle', 'Organize poupanças coletivas e empréstimos entre amigos de maneira simples e segura')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                {t('caixinha.welcome.description', 'Com a Caixinha, você pode criar e gerenciar fundos coletivos com facilidade. Contribuições mensais, distribuição por participação, empréstimos inteligentes e muito mais.')}
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
      )}

      {/* Seção de Benefícios */}
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
        {t('caixinha.welcome.benefits.title', 'Benefícios da Caixinha')}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<GroupIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.community.title', 'Comunidade')}
            description={t('caixinha.welcome.benefits.community.description', 'Organize poupanças com amigos, família ou colegas de trabalho com facilidade e transparência.')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<SecurityIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.security.title', 'Segurança')}
            description={t('caixinha.welcome.benefits.security.description', 'Transações seguras com sistema de empréstimos inteligente e proteção contra inadimplências.')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<MonetizationOnIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.flexibility.title', 'Flexibilidade')}
            description={t('caixinha.welcome.benefits.flexibility.description', 'Distribua recursos por participação, considere rifas e empréstimos para uma divisão mais justa.')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<PaymentsIcon fontSize="large" />}
            title={t('caixinha.welcome.benefits.payments.title', 'Pagamentos')}
            description={t('caixinha.welcome.benefits.payments.description', 'Integração com PIX e validação de conta bancária para transações seguras e eficientes.')}
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
                description={t('caixinha.welcome.howItWorks.step1.description', 'Defina o nome, valor das contribuições mensais e escolha o tipo de distribuição (por participação ou igualmente).')}
              />
              <TutorialStep
                number="2"
                title={t('caixinha.welcome.howItWorks.step2.title', 'Convide Participantes')}
                description={t('caixinha.welcome.howItWorks.step2.description', 'Adicione amigos, familiares ou conhecidos para participar da sua Caixinha através da lista de amigos ou por email.')}
              />
              <TutorialStep
                number="3"
                title={t('caixinha.welcome.howItWorks.step3.title', 'Configure Empréstimos')}
                description={t('caixinha.welcome.howItWorks.step3.description', 'Determine se a caixinha aceitará empréstimos e defina as regras, como taxa de juros e limite baseado em recebíveis futuros.')}
              />
              <TutorialStep
                number="4"
                title={t('caixinha.welcome.howItWorks.step4.title', 'Distribua os Recursos')}
                description={t('caixinha.welcome.howItWorks.step4.description', 'No fechamento da caixinha, os recursos são distribuídos conforme o modelo escolhido, considerando contribuições, rifas e juros pagos.')}
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
                      backgroundColor: theme.palette.background.primary,
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
            <Typography variant="caption" color={theme.palette.secondary.main} sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
              {t('caixinha.welcome.chartDescription', 'Exemplo de crescimento do saldo em uma Caixinha com 6 participantes e contribuição mensal de R$ 1.000')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção Distribuição por Participação */}
      <Paper elevation={2} sx={{ p: 3, mb: 6, borderRadius: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          {t('caixinha.welcome.participationDistribution.title', 'Distribuição por Participação')}
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="body1" paragraph>
              {t('caixinha.welcome.participationDistribution.description', 'Nossa fórmula aprimorada de distribuição recompensa os membros que mais contribuem para o crescimento da caixinha:')}
            </Typography>

            <Box sx={{ bgcolor: theme.palette.background.primary, p: 2, borderRadius: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                Participação Final (%) = (PC × PC_PESO) + (PR × PR_PESO) + (PJM × PJM_PESO)
              </Typography>
            </Box>

            <Typography variant="body2" paragraph>
              {t('caixinha.welcome.participationDistribution.explanation', 'Onde PC representa as contribuições regulares, PR as rifas adquiridas e PJM os juros e multas pagos por empréstimos. Os pesos de cada componente são configuráveis.')}
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
                <ListItemText
                  primary={
                  <Typography variant="subtitle2" color={theme.palette.primary.main}>
                    {t('caixinha.welcome.participationDistribution.benefit1', 'Valoriza contribuições regulares')}
                    </Typography>
                  }
                  secondary={
                    <Typography component="div">
                {t('caixinha.welcome.participationDistribution.benefit1.desc', 'Base sólida da distribuição de recursos')}

              </Typography> 
                  }
                  />

              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color={theme.palette.primary.main}>
                  {t('caixinha.welcome.participationDistribution.benefit2', 'Recompensa engajamento extra')}
                  </Typography>
                  }
                  secondary={
                    <Typography component="div">
                {t('caixinha.welcome.participationDistribution.benefit2.desc', 'Participação em rifas aumenta sua parcela')}
                </Typography> 
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color={theme.palette.primary.main}>
                    {t('caixinha.welcome.participationDistribution.benefit3', 'Considera juros e multas')}
                    </Typography>
                  }
                  secondary={
                    <Typography component="div">

                    {t('caixinha.welcome.participationDistribution.benefit3.desc', 'Reconhece quem contribui para o crescimento do fundo através de empréstimos')}
                    </Typography> 
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: theme.palette.background.primary,
                borderRadius: 2,
                height: '100%'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                {t('caixinha.welcome.participationDistribution.example.title', 'Exemplo Simplificado')}
              </Typography>

              <Typography variant="body2" paragraph>
                {t('caixinha.welcome.participationDistribution.example.setup', 'Três membros com contribuições idênticas de R$600, mas com participações diferentes:')}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                  Membro A:
                </Typography>
                <Typography variant="body2">
                  • Rifas: R$500 (50% do total)
                  <br />
                  • Juros pagos: R$40 (47% do total)
                  <br />
                  <strong>Participação final: 41,08%</strong>
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                  Membro B:
                </Typography>
                <Typography variant="body2">
                  • Rifas: R$300 (30% do total)
                  <br />
                  • Juros pagos: R$30 (35% do total)
                  <br />
                  <strong>Participação final: 32,73%</strong>
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                  Membro C:
                </Typography>
                <Typography variant="body2">
                  • Rifas: R$200 (20% do total)
                  <br />
                  • Juros pagos: R$15 (18% do total)
                  <br />
                  <strong>Participação final: 26,20%</strong>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Seção Sistema de Empréstimos */}
      <Paper elevation={2} sx={{ p: 3, mb: 6, borderRadius: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          {t('caixinha.welcome.loanSystem.title', 'Sistema de Empréstimos Inteligente')}
        </Typography>

        <Typography variant="body1" paragraph>
          {t('caixinha.welcome.loanSystem.description', 'O sistema de empréstimos da Caixinha é seguro e flexível, com limite baseado em recebíveis futuros:')}
        </Typography>

        <Box sx={{ bgcolor: theme.palette.background.primary, p: 2, borderRadius: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {t('caixinha.welcome.loanSystem.formula', 'Valor Máximo de Empréstimo = Valor Projetado a Receber × Fator de Segurança')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('caixinha.welcome.loanSystem.features.title', 'Características principais:')}
            </Typography>

            <List>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color={theme.palette.primary.main}>
                    {t('caixinha.welcome.loanSystem.features.feature1', 'Dois modos de gestão')}
                 </Typography>
                  }
                  secondary={
                    <Typography component="div">
                    {t('caixinha.welcome.loanSystem.features.feature1.desc', 'Controle Total (administrador aprova) ou Disputa em Grupo (votação coletiva)')}
               </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color={theme.palette.primary.main}>
                    {t('caixinha.welcome.loanSystem.features.feature2', 'Empréstimos progressivos')}
                 </Typography>
                  }
                  secondary={
                    <Typography component="div">
                    {t('caixinha.welcome.loanSystem.features.feature2.desc', 'Novos membros começam com limites menores que aumentam com o histórico positivo)')}
                </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color={theme.palette.primary.main}>

                    {t('caixinha.welcome.loanSystem.features.feature3', 'Fundo de reserva')}
                </Typography>
                  }
                  secondary={
                    <Typography component="div">
                    {t('caixinha.welcome.loanSystem.features.feature3.desc', 'Pequeno percentual de cada contribuição pode ser alocado para cobrir eventuais inadimplências)')}
               </Typography>
                  }
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('caixinha.welcome.loanSystem.protections.title', 'Camadas de proteção:')}
            </Typography>

            <List>
  <ListItem>
    <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
    <ListItemText
      primary={
        <Typography variant="subtitle2" color={theme.palette.primary.main}>
          {t('caixinha.welcome.loanSystem.protections.protection1', 'Sistema de score interno')}
        </Typography>
      }
      secondary={
        <Typography component="div">
          {t('caixinha.welcome.loanSystem.protections.protection1.desc', 'Pontuação baseada em histórico de pagamentos e participação)')}
        </Typography>
      }
    />
  </ListItem>
  <ListItem>
    <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
    <ListItemText
      primary={
        <Typography variant="subtitle2" color={theme.palette.primary.main}>
          {t('caixinha.welcome.loanSystem.protections.protection2', 'Garantias sociais')}
        </Typography>
      }
      secondary={
        <Typography component="div">
          {t('caixinha.welcome.loanSystem.protections.protection2.desc', 'Membros podem "apadrinhar" empréstimos, assumindo responsabilidade parcial)')}
        </Typography>
      }
    />
  </ListItem>
  <ListItem>
    <ListItemIcon><CheckCircleIcon color={theme.palette.primary.main} /></ListItemIcon>
    <ListItemText
      primary={
        <Typography variant="subtitle2" color={theme.palette.primary.main}>
          {t('caixinha.welcome.loanSystem.protections.protection3', 'Dedução automática')}
        </Typography>
      }
      secondary={
        <Typography component="div">
          {t('caixinha.welcome.loanSystem.protections.protection3.desc', 'Empréstimos pendentes são deduzidos do valor a receber no fechamento)')}
        </Typography>
      }
    />
  </ListItem>
</List>
          </Grid>
        </Grid>
      </Paper>

      {/* FAQ Section - Atualizado */}
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
              {t('caixinha.welcome.faq.answer1', 'Criar e organizar suas caixinhas é totalmente gratuito! Ao final de cada ciclo, aplicamos uma taxa de comissão de 5% sobre o valor total da caixinha. Essa é a nossa única cobrança.')}
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
              {t('caixinha.welcome.faq.answer2', `Legal! Ao criar sua caixinha, você escolhe o modelo de distribuição dos recursos, e essa opção é definitiva, ok? Temos duas formas:
Por Participação: Quem contribui mais para o crescimento da caixinha recebe uma fatia maior do valor final.
Igualmente: O valor final é dividido de forma igual entre todos os participantes, independentemente da contribuição individual.
Fique de olho! Toda caixinha tem um prazo de início e fim. A distribuição dos recursos acontece sempre na data de fechamento que você definir ao criar a caixinha.`)}
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
              {t('caixinha.welcome.faq.answer3', `Ao criar uma caixinha, o administrador tem a opção de permitir empréstimos e definir as condições, como taxas de juros e multa por atraso. Ele também escolhe como os empréstimos serão gerenciados:

Controle Total: O administrador analisa e decide individualmente sobre cada pedido de empréstimo.
Disputa em Grupo: A decisão de aprovar ou rejeitar empréstimos é compartilhada com o grupo. Nesse caso, o administrador define um quórum mínimo para as decisões e o valor máximo que pode ser emprestado.
Importante: Se um participante tiver um empréstimo pendente na data de fechamento da caixinha, o valor total devido será automaticamente descontado do valor que ele tem a receber.`)}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question4', 'O que é a Caixinha?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer4', `A Caixinha da ElosCloud vai além da simples união de recursos. Ela também incentiva o acesso a microcrédito dentro do próprio grupo, seguindo as regras definidas pelo administrador. Nossa visão é fortalecer a economia local, permitindo que o dinheiro circule entre comunidades e grupos, além de oferecer vantagens exclusivas através de parcerias comerciais em nossa plataforma.

Imagine a Julia, dona de uma loja de roupas no Jacarezinho, Rio de Janeiro. Para impulsionar seu negócio e a comunidade, ela cria uma Caixinha e convida seus clientes e fornecedores. Estes, ao verem o QR Code na loja, também aderem. Ao ativar seu perfil comercial na plataforma, Julia cria uma vitrine virtual de seus produtos, focada em vendas online com retirada na loja. Para seus clientes da Caixinha, ela oferece um desconto especial de 10%. Com seus fornecedores e funcionários, Julia planeja uma celebração de fim de ano utilizando parte dos fundos da Caixinha.

Este é apenas um exemplo de como a Caixinha pode fortalecer laços, impulsionar negócios locais e criar oportunidades dentro de uma comunidade.`)}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question9', 'Como obter mais dinheiro para a caixinha?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer9', `Para turbinar ainda mais os ganhos da caixinha e aumentar o engajamento, oferecemos a funcionalidade de **Rifas Programadas**. O administrador pode configurar rifas automáticas com periodicidade mensal, bimestral, trimestral, semestral ou em datas personalizadas.

A dinâmica é simples: cada membro fica responsável por um certo número de bilhetes. Quanto mais bilhetes um membro vende ou compra, maior o montante arrecadado para a caixinha. Além disso, essa participação ativa pode influenciar na distribuição final dos recursos, caso essa opção esteja configurada na caixinha, incentivando ainda mais o envolvimento de todos.`)}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question10', 'Como o cálculo é realizado quando a caixinha permite distribuição por participação?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer10', `Imagine que a gente vai dividir o dinheiro da caixinha no final. Para saber quanto cada um vai receber, a gente olha algumas coisas:

1.  **Quanto cada um guardou todo mês (Contribuições):** Quem guardou mais, tem uma parte maior.
2.  **Quem ajudou a juntar mais dinheiro com as rifas:** Se você comprou ou vendeu muita rifa, isso também conta pra você ganhar mais no final.
3.  **Quem pagou direitinho os juros e as multas dos empréstimos:** Se você pegou emprestado e pagou certinho os juros e as multas, isso também te dá uma vantagem na hora de receber. É como se você tivesse ajudado a caixinha a ter mais dinheiro.
4.  **Se alguém pegou dinheiro emprestado e não pagou até o final:** Se você pegou um empréstimo e ainda tá devendo quando a caixinha fechar, a gente vai tirar esse valor do que você tem pra receber.

A gente junta tudo isso pra ver a "força" de cada um na caixinha. Quem guardou mais, quem ajudou mais com a rifa e quem pagou certinho os empréstimos tem uma "força" maior.

Aí, a gente pega o total de dinheiro que tem na caixinha e divide de acordo com essa "força" de cada um. Quem tem mais "força", leva uma parte maior. Mas, se você estiver devendo algum empréstimo, a gente tira essa dívida do seu valor final.

É como se fosse um bolo: o tamanho do pedaço que cada um ganha depende de quanto cada um ajudou a fazer o bolo crescer e se alguém pegou um pedaço antes da hora. O administrador da caixinha pode até decidir se cada uma dessas "ajudas" (guardar dinheiro, rifa, pagar juros) vale mais ou menos na hora de dividir o bolo.`)}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question7', 'O que é a "Trava Bancária"?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer7', `Para deixar tudo seguro e funcionando direitinho, a caixinha só começa de verdade quando duas coisas acontecem:

A gente confirma a conta bancária da caixinha: Isso é como colocar uma trava de segurança no cofre da caixinha. Só vai poder sair dinheiro para aquela conta que já foi conferida antes. Assim, evitamos qualquer problema com o seu dinheiro.

A gente confirma os dados de quem está cuidando da caixinha (o administrador): Precisamos saber direitinho quem é a pessoa responsável por gerenciar tudo.

Enquanto essas duas confirmações não estiverem prontas, não dá para colocar dinheiro na caixinha, chamar mais gente para participar, nem fazer nenhuma movimentação. É uma medida de segurança para proteger o dinheiro de todos e garantir que tudo funcione da forma certa desde o início.

Depois que a trava bancária estiver ok e os dados do administrador confirmados, aí sim a caixinha estará ativa e pronta para ser usada por todos! Todas as vezes que o dinheiro for movimentado na caixinha, seja para pagar alguém, emprestar ou dividir o valor final, tudo passará por essa trava bancária de segurança.`)}
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t('caixinha.welcome.faq.question8', 'Como validar minha conta bancária?')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">
              {t('caixinha.welcome.faq.answer8', `Para confirmar que sua conta bancária está tudo certo para a caixinha, precisamos fazer uma pequena verificação. Você vai precisar nos informar os dados do seu banco, da conta que está no seu nome e que já tem uma chave Pix cadastrada.

O nosso sistema vai gerar uma cobrança bem pequenininha em Pix, um valor simbólico, tipo de 1 centavo a 10 centavos. Para validar a sua conta, basta fazer o pagamento dessa cobrança usando o Pix da conta que você cadastrou. Assim que o pagamento for feito, a gente confirma que os dados bancários estão corretos e prontos para serem usados na caixinha com toda a segurança. É um jeito simples e rápido de garantir que tudo esteja certo!`)}
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
          {t('caixinha.welcome.cta.description', 'Crie sua Caixinha agora mesmo e comece a aproveitar todos os benefícios de um sistema financeiro coletivo organizado e transparente.')}
        </Typography>
        <CreateCaixinhaButton />
      </Box>
    </Box>
  );
};

export default CaixinhaWelcome;