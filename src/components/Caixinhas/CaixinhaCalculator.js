import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormGroup,
  Alert,
  useTheme,
  InputAdornment,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CalculateOutlined,
  PieChartOutlined,
  TimelineOutlined,
  MonetizationOnOutlined,
  CheckCircleOutline,
  ErrorOutline,
  BarChartOutlined,
  ShowChartOutlined
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CaixinhaSimulatorDialog = ({ onClose }) => {
  const theme = useTheme();

  // Estados para os inputs do usuário
  const [participantes, setParticipantes] = useState(10);
  const [duracaoMeses, setDuracaoMeses] = useState(12);
  const [contribuicaoMensal, setContribuicaoMensal] = useState(150);
  const [taxaRendimento, setTaxaRendimento] = useState(0.5);
  const [valorFinalPorParticipante, setValorFinalPorParticipante] = useState(1500);

  // Estados para funcionalidades adicionais
  const [incluirRifas, setIncluirRifas] = useState(false);
  const [rifasPorMes, setRifasPorMes] = useState(1);
  const [valorBilhete, setValorBilhete] = useState(10);
  const [bilhetesPorMembro, setBilhetesPorMembro] = useState(2);

  const [incluirEmprestimos, setIncluirEmprestimos] = useState(false);
  const [taxaJurosEmprestimos, setTaxaJurosEmprestimos] = useState(2.0);
  const [percentualSaldoEmprestado, setPercentualSaldoEmprestado] = useState(30);

  const [incluirMultas, setIncluirMultas] = useState(false);
  const [taxaMultaPorAtraso, setTaxaMultaPorAtraso] = useState(5);
  const [percentualAtrasos, setPercentualAtrasos] = useState(10);

  // Estados para os resultados calculados
  const [resultados, setResultados] = useState(null);
  const [dadosMensais, setDadosMensais] = useState([]);
  const [tipoGrafico, setTipoGrafico] = useState('linha');

  // Estado para controle do modo de cálculo
  const [modoCalculo, setModoCalculo] = useState('contribuicao');

  // Formatação de valores monetários
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Cálculo da receita mensal de rifas
  const calcularReceitaRifas = () => {
    if (!incluirRifas) return 0;

    // Total de bilhetes vendidos por mês
    const bilhetesVendidos = participantes * bilhetesPorMembro * rifasPorMes;
    return bilhetesVendidos * valorBilhete;
  };

  // Cálculo da receita de juros de empréstimos
  const calcularReceitaJurosEmprestimos = (saldoAtual) => {
    if (!incluirEmprestimos) return 0;

    // Valor emprestado = percentual do saldo atual
    const valorEmprestado = saldoAtual * (percentualSaldoEmprestado / 100);
    // Juros mensais sobre o valor emprestado
    return valorEmprestado * (taxaJurosEmprestimos / 100);
  };

  // Cálculo da receita de multas por atraso
  const calcularReceitaMultas = () => {
    if (!incluirMultas) return 0;

    // Número de participantes com atraso
    const participantesComAtraso = Math.round(participantes * (percentualAtrasos / 100));
    // Valor da multa por atraso (baseado na contribuição mensal)
    return participantesComAtraso * contribuicaoMensal * (taxaMultaPorAtraso / 100);
  };

  // Cálculo da contribuição necessária para atingir o valor final desejado
  const calcularContribuicaoNecessaria = () => {
    // Valor total que queremos atingir
    const valorTotalFinal = valorFinalPorParticipante * participantes;

    // Taxa mensal de rendimento
    const taxaMensal = taxaRendimento / 100;

    // Estimativa inicial de receitas adicionais (sem considerar juros compostos)
    let receitasAdicionaisMensais = 0;
    if (incluirRifas) {
      receitasAdicionaisMensais += calcularReceitaRifas();
    }
    if (incluirMultas) {
      receitasAdicionaisMensais += calcularReceitaMultas();
    }

    // Total aproximado de receitas adicionais (sem juros compostos)
    const receitasAdicionaisTotal = receitasAdicionaisMensais * duracaoMeses;

    // Valor que precisamos acumular através de contribuições e rendimentos
    const valorNecessario = valorTotalFinal - receitasAdicionaisTotal;

    // Fator de juros compostos
    // Para uma anuidade: FV = PMT * ((1 + r)^n - 1) / r * (1 + r)
    // Onde: FV = valor futuro, r = taxa mensal, n = número de períodos (meses)
    // Rearranjando: PMT = FV / (((1 + r)^n - 1) / r * (1 + r))

    const fatorJurosCompostos = ((Math.pow(1 + taxaMensal, duracaoMeses) - 1) / taxaMensal) * (1 + taxaMensal);

    // Contribuição mensal total para o grupo
    const contribuicaoTotalMensal = valorNecessario / fatorJurosCompostos;

    // Contribuição individual
    return Math.max(1, Math.ceil(contribuicaoTotalMensal / participantes));
  };

  // Simulação da evolução mensal da caixinha
  const simularEvolucaoCaixinha = () => {
    const contribuicaoTotal = contribuicaoMensal * participantes;
    let saldo = 0;
    const dados = [];

    // Para cada mês, calcular o saldo e outras métricas
    for (let mes = 1; mes <= duracaoMeses; mes++) {
      // Adicionar contribuições
      saldo += contribuicaoTotal;

      // Receita de rifas do mês
      const receitaRifas = calcularReceitaRifas();
      saldo += receitaRifas;

      // Receita de multas do mês
      const receitaMultas = calcularReceitaMultas();
      saldo += receitaMultas;

      // Receita de juros de empréstimos do mês (baseado no saldo atual)
      const receitaJurosEmprestimos = calcularReceitaJurosEmprestimos(saldo);
      saldo += receitaJurosEmprestimos;

      // Rendimento do saldo do mês
      const rendimentoMensal = saldo * (taxaRendimento / 100);
      saldo += rendimentoMensal;

      // Registrar os dados do mês
      dados.push({
        mes,
        saldo: Math.round(saldo),
        contribuicoes: contribuicaoTotal * mes,
        rifas: receitaRifas > 0 ? receitaRifas * mes : 0,
        jurosEmprestimos: receitaJurosEmprestimos > 0 ? Math.round(receitaJurosEmprestimos) : 0,
        multas: receitaMultas > 0 ? receitaMultas * mes : 0,
        rendimento: Math.round(rendimentoMensal)
      });
    }

    return dados;
  };

  // Calcular resultados com base nos inputs
  const calcularResultados = () => {
    // Se estivermos no modo de cálculo automático de contribuição
    if (modoCalculo === 'contribuicao') {
      setContribuicaoMensal(calcularContribuicaoNecessaria());
    }

    // Simular evolução mensal com os valores atuais
    const dadosMensais = simularEvolucaoCaixinha();
    setDadosMensais(dadosMensais);

    // Extrair dados do último mês para os resultados finais
    const dadosFinais = dadosMensais[dadosMensais.length - 1];

    // Calcular valor por participante
    const valorPorParticipante = Math.floor(dadosFinais.saldo / participantes);

    // Preparar fontes de receita para o gráfico de pizza
    const fontesReceita = [
      { nome: 'Contribuições', valor: dadosFinais.contribuicoes },
      { nome: 'Rendimentos', valor: dadosFinais.saldo - dadosFinais.contribuicoes - (dadosFinais.rifas || 0) - (dadosFinais.multas || 0) }
    ];

    // Adicionar fontes opcionais de receita
    if (incluirRifas) {
      fontesReceita.push({ nome: 'Rifas', valor: dadosFinais.rifas });
    }
    if (incluirEmprestimos) {
      fontesReceita.push({ nome: 'Juros de Empréstimos', valor: dadosFinais.jurosEmprestimos * duracaoMeses });
    }
    if (incluirMultas) {
      fontesReceita.push({ nome: 'Multas', valor: dadosFinais.multas });
    }

    // Preparar resultados finais
    setResultados({
      saldoFinal: dadosFinais.saldo,
      valorPorParticipante,
      fontesReceita,
      metaAtingida: valorPorParticipante >= valorFinalPorParticipante,
      diferenca: valorPorParticipante - valorFinalPorParticipante
    });

    // Se estamos no modo de valor-alvo, atualizar o valor por participante
    if (modoCalculo === 'valor-alvo') {
      setValorFinalPorParticipante(valorPorParticipante);
    }
  };

  // Recalcular quando os inputs mudam
  useEffect(() => {
    calcularResultados();
  }, [
    participantes,
    duracaoMeses,
    contribuicaoMensal,
    taxaRendimento,
    incluirRifas,
    rifasPorMes,
    valorBilhete,
    bilhetesPorMembro,
    incluirEmprestimos,
    taxaJurosEmprestimos,
    percentualSaldoEmprestado,
    incluirMultas,
    taxaMultaPorAtraso,
    percentualAtrasos,
    modoCalculo
  ]);

  // Alterar o modo de cálculo
  const alternarModoCalculo = () => {
    setModoCalculo(modoCalculo === 'contribuicao' ? 'valor-alvo' : 'contribuicao');
  };

  // Renderizar gráfico de evolução (linha ou pizza)
  const renderizarGrafico = () => {
    if (tipoGrafico === 'linha') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={dadosMensais}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" label={{ value: 'Mês', position: 'insideBottomRight', offset: -5 }} />
            <YAxis tickFormatter={(valor) => `R$${valor/1000}k`} />
            <Tooltip formatter={(valor) => formatarMoeda(valor)} />
            <Legend />
            <Line type="monotone" dataKey="saldo" name="Saldo" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="contribuicoes" name="Contribuições" stroke={theme.palette.secondary.main} />
            {incluirRifas && <Line type="monotone" dataKey="rifas" name="Rifas" stroke={theme.palette.success.main} />}
            {incluirEmprestimos && <Line type="monotone" dataKey="jurosEmprestimos" name="Juros de Empréstimos" stroke={theme.palette.warning.main} />}
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={resultados.fontesReceita}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill={theme.palette.primary.main}
              dataKey="valor"
              nameKey="nome"
              label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
            >
              {resultados.fontesReceita.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(valor) => formatarMoeda(valor)} />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: theme.palette.primary.main }}>
        <CalculateOutlined sx={{ mr: 1 }} />
        Simulador de Caixinha
      </Typography>

      <Grid container spacing={3}>
        {/* Formulário de inputs */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 2,
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <MonetizationOnOutlined sx={{ mr: 1 }} />
              Dados da Simulação
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Participantes"
                  type="number"
                  fullWidth
                  value={participantes}
                  onChange={(e) => setParticipantes(Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{ inputProps: { min: 1 } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duração (Meses)"
                  type="number"
                  fullWidth
                  value={duracaoMeses}
                  onChange={(e) => setDuracaoMeses(Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{ inputProps: { min: 1, max: 60 } }}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taxa de Rendimento Mensal"
                  type="number"
                  fullWidth
                  value={taxaRendimento}
                  onChange={(e) => setTaxaRendimento(parseFloat(e.target.value) || 0)}
                  InputProps={{ inputProps: { min: 0, step: 0.1 }, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Modo de Cálculo</InputLabel>
                  <Select
                    value={modoCalculo}
                    label="Modo de Cálculo"
                    onChange={(e) => setModoCalculo(e.target.value)}
                  >
                    <MenuItem value="contribuicao">Calcular Contribuição</MenuItem>
                    <MenuItem value="valor-alvo">Definir Contribuição</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                {modoCalculo === 'contribuicao' ? (
                  <TextField
                    label="Valor Final por Participante"
                    type="number"
                    fullWidth
                    value={valorFinalPorParticipante}
                    onChange={(e) => setValorFinalPorParticipante(Math.max(0, parseFloat(e.target.value) || 0))}
                    InputProps={{ inputProps: { min: 0 }, startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <TextField
                    label="Contribuição Mensal"
                    type="number"
                    fullWidth
                    value={contribuicaoMensal}
                    onChange={(e) => setContribuicaoMensal(Math.max(1, parseFloat(e.target.value) || 1))}
                    InputProps={{ inputProps: { min: 1 }, startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
              Receitas Adicionais
            </Typography>

            {/* Opção de Rifas */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={incluirRifas}
                    onChange={(e) => setIncluirRifas(e.target.checked)}
                    color="primary"
                  />
                }
                label="Incluir Rifas"
              />

              {incluirRifas && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Rifas por Mês"
                        type="number"
                        fullWidth
                        value={rifasPorMes}
                        onChange={(e) => setRifasPorMes(Math.max(0, parseInt(e.target.value) || 0))}
                        InputProps={{ inputProps: { min: 0 } }}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Valor do Bilhete"
                        type="number"
                        fullWidth
                        value={valorBilhete}
                        onChange={(e) => setValorBilhete(Math.max(0, parseFloat(e.target.value) || 0))}
                        InputProps={{ inputProps: { min: 0 }, startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Bilhetes por Membro"
                        type="number"
                        fullWidth
                        value={bilhetesPorMembro}
                        onChange={(e) => setBilhetesPorMembro(Math.max(0, parseInt(e.target.value) || 0))}
                        InputProps={{ inputProps: { min: 0 } }}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>

            {/* Opção de Empréstimos */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={incluirEmprestimos}
                    onChange={(e) => setIncluirEmprestimos(e.target.checked)}
                    color="primary"
                  />
                }
                label="Incluir Empréstimos"
              />

              {incluirEmprestimos && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Taxa de Juros Mensal"
                        type="number"
                        fullWidth
                        value={taxaJurosEmprestimos}
                        onChange={(e) => setTaxaJurosEmprestimos(Math.max(0, parseFloat(e.target.value) || 0))}
                        InputProps={{ inputProps: { min: 0, step: 0.1 }, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="% do Saldo Emprestado"
                        type="number"
                        fullWidth
                        value={percentualSaldoEmprestado}
                        onChange={(e) => setPercentualSaldoEmprestado(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        InputProps={{ inputProps: { min: 0, max: 100 }, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>

            {/* Opção de Multas */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={incluirMultas}
                    onChange={(e) => setIncluirMultas(e.target.checked)}
                    color="primary"
                  />
                }
                label="Incluir Multas por Atraso"
              />

              {incluirMultas && (
                <Box sx={{ mt: 2, pl: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Taxa de Multa"
                        type="number"
                        fullWidth
                        value={taxaMultaPorAtraso}
                        onChange={(e) => setTaxaMultaPorAtraso(Math.max(0, parseFloat(e.target.value) || 0))}
                        InputProps={{ inputProps: { min: 0, step: 0.5 }, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        size="small"
                        helperText="Percentual da contribuição mensal"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="% de Atrasos"
                        type="number"
                        fullWidth
                        value={percentualAtrasos}
                        onChange={(e) => setPercentualAtrasos(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        InputProps={{ inputProps: { min: 0, max: 100 }, endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                        size="small"
                        helperText="Percentual dos participantes"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Paper>
        </Grid>

        {/* Resultados */}
        <Grid item xs={12} md={7}>
          {resultados && (
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <BarChartOutlined sx={{ mr: 1 }} />
                Resultados da Simulação
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      Contribuição Mensal
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {formatarMoeda(contribuicaoMensal)}
                    </Typography>
                    <Typography variant="caption">
                      por participante
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: theme.palette.success.light,
                      color: theme.palette.success.contrastText,
                      borderRadius: 2,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      Valor Final Estimado
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {formatarMoeda(resultados.valorPorParticipante)}
                    </Typography>
                    <Typography variant="caption">
                      por participante
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {modoCalculo === 'contribuicao' && (
                <Alert
                  severity={resultados.metaAtingida ? "success" : "warning"}
                  icon={resultados.metaAtingida ? <CheckCircleOutline /> : <ErrorOutline />}
                  sx={{ mb: 3 }}
                >
                  {resultados.metaAtingida
                    ? `Meta atingida! Cada participante receberá ${formatarMoeda(resultados.valorPorParticipante)}`
                    : `Meta não atingida. Faltam ${formatarMoeda(Math.abs(resultados.diferenca))} por participante.`}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShowChartOutlined sx={{ mr: 1 }} />
                    Evolução da Caixinha
                  </Typography>
                  <Box>
                    <Button
                      variant={tipoGrafico === 'linha' ? "contained" : "outlined"}
                      color="primary"
                      size="small"
                      startIcon={<TimelineOutlined />}
                      onClick={() => setTipoGrafico('linha')}
                      sx={{ mr: 1 }}
                    >
                      Linha
                    </Button>
                    <Button
                      variant={tipoGrafico === 'pizza' ? "contained" : "outlined"}
                      color="primary"
                      size="small"
                      startIcon={<PieChartOutlined />}
                      onClick={() => setTipoGrafico('pizza')}
                    >
                      Composição
                    </Button>
                  </Box>
                </Box>
                {renderizarGrafico()}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Detalhes do Resultado
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Saldo Final Estimado
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        {formatarMoeda(resultados.saldoFinal)}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total de Contribuições
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>
                        {formatarMoeda(contribuicaoMensal * participantes * duracaoMeses)}
                      </Typography>
                    </Paper>
                  </Grid>

                  {incluirRifas && (
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total de Receita com Rifas
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                          {formatarMoeda(calcularReceitaRifas() * duracaoMeses)}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {incluirEmprestimos && (
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Estimativa de Juros de Empréstimos
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                          {formatarMoeda(
                            dadosMensais.reduce((total, mes) => total + mes.jurosEmprestimos, 0)
                          )}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {incluirMultas && (
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total de Multas por Atraso
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>
                          {formatarMoeda(calcularReceitaMultas() * duracaoMeses)}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Rendimento Total Estimado
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.main }}>
                        {formatarMoeda(
                          resultados.saldoFinal -
                          (contribuicaoMensal * participantes * duracaoMeses) -
                          (incluirRifas ? calcularReceitaRifas() * duracaoMeses : 0) -
                          (incluirMultas ? calcularReceitaMultas() * duracaoMeses : 0) -
                          (incluirEmprestimos ? dadosMensais.reduce((total, mes) => total + mes.jurosEmprestimos, 0) : 0)
                        )}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaixinhaSimulatorDialog;