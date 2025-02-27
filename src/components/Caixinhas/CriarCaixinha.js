//frontend/src/Caixinhas/CriarCaixinha.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCaixinha } from '../../contexts/CaixinhaContext';
import {
  Box,
  TextField,
  Button,
  Typography,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  MenuItem,
  Select,
  Slider,
  Divider
} from '@mui/material';

const CriarCaixinha = () => {
  const { currentUser } = useAuth();
  const { criarCaixinha } = useCaixinha();
  const [dadosCaixinha, setDadosCaixinha] = useState({
    nome: '',
    valorContribuicao: '',
    descricao: '',
    configuracoes: {
      duracaoMeses: 12,
      taxaJuros: 0,
      permiteEmprestimos: false,
      regrasEmprestimo: {
        limiteValor: 0,
        prazoMaximo: 3,
        taxaJuros: 0,
      },
      distribuicaoCotas: {
        tipo: 'sorteio',
        periodicidade: 'mensal',
      },
    },
    administrador: {
      dadosBancarios: {
        tipoConta: '',
        banco: '',
        agencia: '',
        conta: '',
        chavePix: '',
      },
    },
  });

  const handleChange = (field, value) => {
    setDadosCaixinha({ ...dadosCaixinha, [field]: value });
  };

  const handleConfigChange = (configField, value) => {
    setDadosCaixinha({
      ...dadosCaixinha,
      configuracoes: {
        ...dadosCaixinha.configuracoes,
        [configField]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await criarCaixinha(dadosCaixinha);
      // Redireciona para a página da caixinha
    } catch (error) {
      console.error('Erro ao criar caixinha:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Criar Nova Caixinha
      </Typography>

      {/* Nome da Caixinha */}
      <TextField
        fullWidth
        label="Nome da Caixinha"
        value={dadosCaixinha.nome}
        onChange={(e) => handleChange('nome', e.target.value)}
        margin="normal"
        required
      />

      {/* Valor de Contribuição */}
      <TextField
        fullWidth
        label="Valor de Contribuição Mensal (R$)"
        type="number"
        value={dadosCaixinha.valorContribuicao}
        onChange={(e) => handleChange('valorContribuicao', e.target.value)}
        margin="normal"
        required
      />

      {/* Descrição */}
      <TextField
        fullWidth
        label="Descrição (opcional)"
        multiline
        rows={4}
        value={dadosCaixinha.descricao}
        onChange={(e) => handleChange('descricao', e.target.value)}
        margin="normal"
      />

      <Divider sx={{ my: 2 }} />

      {/* Configurações da Caixinha */}
      <Typography variant="h6">Configurações</Typography>

      {/* Duração */}
      <FormControl fullWidth margin="normal">
        <FormLabel>Duração (meses)</FormLabel>
        <Slider
          value={dadosCaixinha.configuracoes.duracaoMeses}
          onChange={(e, value) => handleConfigChange('duracaoMeses', value)}
          step={1}
          marks
          min={1}
          max={24}
        />
        <FormHelperText>Escolha o número de meses de duração da caixinha.</FormHelperText>
      </FormControl>

      {/* Taxa de Juros */}
      <TextField
        fullWidth
        label="Taxa de Juros (%)"
        type="number"
        value={dadosCaixinha.configuracoes.taxaJuros}
        onChange={(e) => handleConfigChange('taxaJuros', e.target.value)}
        margin="normal"
      />

      {/* Permitir Empréstimos */}
      <FormControl fullWidth margin="normal">
        <FormLabel>Permitir Empréstimos</FormLabel>
        <Switch
          checked={dadosCaixinha.configuracoes.permiteEmprestimos}
          onChange={(e) => handleConfigChange('permiteEmprestimos', e.target.checked)}
        />
        <FormHelperText>Habilite para permitir empréstimos na caixinha.</FormHelperText>
      </FormControl>

      {/* Tipo de Distribuição */}
      <FormControl fullWidth margin="normal">
        <FormLabel>Tipo de Distribuição</FormLabel>
        <Select
          value={dadosCaixinha.configuracoes.distribuicaoCotas.tipo}
          onChange={(e) =>
            setDadosCaixinha({
              ...dadosCaixinha,
              configuracoes: {
                ...dadosCaixinha.configuracoes,
                distribuicaoCotas: {
                  ...dadosCaixinha.configuracoes.distribuicaoCotas,
                  tipo: e.target.value,
                },
              },
            })
          }
        >
          <MenuItem value="sorteio">Sorteio</MenuItem>
          <MenuItem value="ordem">Ordem</MenuItem>
        </Select>
      </FormControl>

      <Divider sx={{ my: 2 }} />

      {/* Dados Bancários do Administrador */}
      <Typography variant="h6">Dados Bancários do Administrador</Typography>

      <TextField
        fullWidth
        label="Tipo de Conta"
        value={dadosCaixinha.administrador.dadosBancarios.tipoConta}
        onChange={(e) =>
          setDadosCaixinha({
            ...dadosCaixinha,
            administrador: {
              ...dadosCaixinha.administrador,
              dadosBancarios: {
                ...dadosCaixinha.administrador.dadosBancarios,
                tipoConta: e.target.value,
              },
            },
          })
        }
        margin="normal"
      />

      <TextField
        fullWidth
        label="Banco"
        value={dadosCaixinha.administrador.dadosBancarios.banco}
        onChange={(e) =>
          setDadosCaixinha({
            ...dadosCaixinha,
            administrador: {
              ...dadosCaixinha.administrador,
              dadosBancarios: {
                ...dadosCaixinha.administrador.dadosBancarios,
                banco: e.target.value,
              },
            },
          })
        }
        margin="normal"
      />

      {/* Submit */}
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
        Criar Caixinha
      </Button>
    </Box>
  );
};

export default CriarCaixinha;