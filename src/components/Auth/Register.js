// src/components/Auth/Register.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  TextField,
  Paper,
  Avatar,
  FormControlLabel,
  Switch,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PhotoCamera,
  Add,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  GitHub as GithubIcon,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useInvites } from '../../providers/InviteProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useUser } from '../../providers/UserProvider';
import { useToast } from '../../providers/ToastProvider';
import { serviceLocator } from '../../core/services/BaseService';

// Passos do stepper - Alterada a ordem: Perfil vem antes da Autenticação
const steps = ['Validar Convite', 'Completar Perfil', 'Método de Autenticação', 'Confirmação'];

// Mock foto de perfil padrão
const mockFoto = process.env.REACT_APP_CLAUD_PROFILE_IMG;

const Register = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const { checkInvite, validateInvite, inviteData, inviteError, checkingInvite } = useInvites();
  const { register, registerWithProvider } = useAuth();
  const { addUser, uploadProfilePicture } = useUser();

  // Estado para controlar o passo atual do stepper
  const [activeStep, setActiveStep] = useState(0);
  
  // Estado para controlar carregamentos
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar erros
  const [error, setError] = useState(null);
  
  // Estado para o preview da imagem
  const [previewImage, setPreviewImage] = useState(mockFoto);
  const [fotoAlterada, setFotoAlterada] = useState(false);
  const [fotoFile, setFotoFile] = useState(null);
  
  // Estado para controle de interesses
  const [activeCategory, setActiveCategory] = useState('lazer');
  const [novoInteresse, setNovoInteresse] = useState('');

  // Obter os dados de interesses do store
  const interestData = serviceLocator.get('store').getState()?.interests?.availableInterests || [];

  // Estado unificado do formulário
  const [formData, setFormData] = useState({
    // Dados do convite
    email: '',
    nome: '',
    
    // Dados de autenticação
    password: '',
    confirmPassword: '',
    
    // Dados do perfil
    telefone: '',
    descricao: '',
    perfilPublico: false,
    tipoDeConta: 'Cliente',
    fotoDoPerfil: mockFoto,
    interesses: {},
    
    // Dados de controle
    inviteId: inviteId,
    validated: false,
    registeredUid: null,
    profileComplete: false, // Novo estado para controlar se o perfil foi preenchido
  });

  // Inicializar estrutura de interesses
  useEffect(() => {
    try {
      // Garante que interestData é um array antes de mapear
      const categorias = Array.isArray(interestData) 
        ? interestData.map(cat => cat.name) 
        : [];
      
      // Atualiza o formData para garantir que todas as categorias existam
      setFormData(prevData => {
        const interessesAtualizados = { ...prevData.interesses };
        
        // Adiciona categorias que não existem em formData.interesses
        categorias.forEach(categoria => {
          if (!interessesAtualizados[categoria]) {
            interessesAtualizados[categoria] = [];
          }
        });
        
        return {
          ...prevData,
          interesses: interessesAtualizados
        };
      });
    } catch (error) {
      console.error("Erro ao inicializar interesses:", error);
      // Inicializa com objeto vazio em caso de erro
      setFormData(prev => ({
        ...prev,
        interesses: {}
      }));
    }
  }, [interestData]);

  // Verificar o convite ao carregar o componente
  useEffect(() => {
    if (inviteId) {
      checkInvite(inviteId);
      setFormData(prev => ({ ...prev, inviteId }));
    }
  }, [inviteId, checkInvite]);

  // Preencher o email quando os dados do convite estiverem disponíveis
  useEffect(() => {
    if (inviteData && inviteData.email) {
      setFormData(prev => ({ ...prev, email: inviteData.email }));
    }
  }, [inviteData]);

  // Função para controlar os passos do stepper
  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // Funções para manipulação do formulário
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'perfilPublico') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
        setFotoAlterada(true);
        setFotoFile(file);
        setFormData(prev => ({
          ...prev,
          fotoDoPerfil: event.target.result
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Funções para manipulação de interesses
  const handleAddInteresse = (categoria, interesse) => {
    if (!interesse.trim()) return;
    
    // Verifica se o interesse já existe na categoria de forma segura
    if (isInterestSelected(categoria, interesse.trim())) {
      showToast('Este interesse já foi adicionado', { type: 'warning' });
      return;
    }
    
    // Atualiza interesses de forma segura
    setFormData(prev => {
      const categoriaInteresses = prev.interesses[categoria] || [];
      
      return {
        ...prev,
        interesses: {
          ...prev.interesses,
          [categoria]: [...categoriaInteresses, interesse.trim()]
        }
      };
    });
    
    setNovoInteresse('');
  };

  const handleToggleInteresse = (categoria, interesse) => {
    setFormData(prev => {
      const categoriaInteresses = prev.interesses[categoria] || [];
      
      // Se já está selecionado, remove
      if (categoriaInteresses.includes(interesse)) {
        return {
          ...prev,
          interesses: {
            ...prev.interesses,
            [categoria]: categoriaInteresses.filter(item => item !== interesse)
          }
        };
      } 
      // Caso contrário, adiciona
      else {
        return {
          ...prev,
          interesses: {
            ...prev.interesses,
            [categoria]: [...categoriaInteresses, interesse]
          }
        };
      }
    });
  };

  const handleCategoriaChange = (event) => {
    setActiveCategory(event.target.value);
  };

  // Verifica se um interesse já foi selecionado
  const isInterestSelected = (categoryName, interestLabel) => {
    const categoryInterests = formData.interesses[categoryName];
    return categoryInterests && categoryInterests.includes(interestLabel);
  };

  // Função para obter interesses de uma categoria de forma segura
  const getCategoryInterests = (categoryName) => {
    try {
      if (!Array.isArray(interestData)) return [];
      const category = interestData.find(cat => cat.name === categoryName);
      return category?.interests || [];
    } catch (error) {
      console.error("Erro ao obter interesses da categoria:", error);
      return [];
    }
  };

  // Função para validar dados em cada etapa
  const validateStepData = (step) => {
    setError(null);
    switch (step) {
      case 0: // Validação do convite
        if (!formData.nome.trim()) {
          setError('Por favor, informe seu nome.');
          return false;
        }
        return true;
        
      case 1: // Perfil completo (agora é o passo 1, não mais o 2)
        if (!formData.nome.trim()) {
          setError('Nome é obrigatório.');
          return false;
        }
        return true;

      case 2: // Método de autenticação (agora é o passo 2, não mais o 1)
        if (formData.password) {
          if (formData.password.length < 8) {
            setError('A senha deve ter no mínimo 8 caracteres.');
            return false;
          }
          if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return false;
          }
        }
        return true;
        
      default:
        return true;
    }
  };

  // Handlers específicos para cada etapa
  const handleValidateInvite = async () => {
    if (!validateStepData(0)) return;
    
    setLoading(true);
    try {
      await validateInvite(inviteId, formData.email, formData.nome);
      setFormData(prev => ({ ...prev, validated: true }));
      handleNext();
    } catch (error) {
      console.error('Erro ao validar convite:', error);
      setError(error.message || 'Erro ao validar convite. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Agora o perfil é salvo no passo 1 (antes de criar a autenticação)
  const handleProfileSubmit = async () => {
    if (!validateStepData(1)) return;
    
    setLoading(true);
    try {
      // Apenas preparar os dados do perfil neste ponto (sem salvar ainda no backend)
      const profileData = {
        nome: formData.nome,
        telefone: formData.telefone,
        descricao: formData.descricao,
        perfilPublico: formData.perfilPublico,
        tipoDeConta: formData.tipoDeConta,
        interesses: formData.interesses,
        email: formData.email,
        fotoDoPerfil: formData.fotoDoPerfil,
        dataCriacao: Date.now()
      };
      
      // Marcar o perfil como completo e avançar para o próximo passo
      setFormData(prev => ({
        ...prev,
        ...profileData,
        profileComplete: true
      }));
      
      handleNext();
    } catch (error) {
      console.error('Erro ao preparar perfil:', error);
      setError(error.message || 'Erro ao preparar dados do perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

const handleRegisterWithPassword = async () => {
  if (!validateStepData(2)) return;
  
  setLoading(true);
  try {
    // Enviar todos os dados em uma única chamada
    const result = await register(
      formData.email,
      formData.password,
      {
        nome: formData.nome,
        telefone: formData.telefone,
        descricao: formData.descricao,
        perfilPublico: formData.perfilPublico,
        tipoDeConta: formData.tipoDeConta,
        interesses: formData.interesses,
        fotoDoPerfil: formData.fotoDoPerfil
      },
      formData.inviteId
    );
    
    // Se tiver foto para upload, enviar separadamente
    if (fotoAlterada && fotoFile) {
      const profilePicture = new FormData();
      profilePicture.append('fotoDePerfil', fotoFile);
      await uploadProfilePicture(result.user.uid, profilePicture);
    }
    
    setFormData(prev => ({
      ...prev,
      registeredUid: result.user.uid
    }));
    
    handleNext();
  } catch (error) {
    console.error('Erro ao registrar:', error);
    setError(error.message || 'Erro ao criar conta. Tente novamente.');
  } finally {
    setLoading(false);
  }
};

const handleRegisterWithProvider = async (provider) => {
  setLoading(true);
  try {
    // Enviar todos os dados em uma única chamada
    const result = await registerWithProvider(
      provider,
      {
        nome: formData.nome,
        telefone: formData.telefone,
        descricao: formData.descricao,
        perfilPublico: formData.perfilPublico,
        tipoDeConta: formData.tipoDeConta,
        interesses: formData.interesses,
        email: formData.email,
        fotoDoPerfil: formData.fotoDoPerfil
      },
      formData.inviteId
    );
    
    // Se tiver foto para upload, enviar separadamente
    if (fotoAlterada && fotoFile) {
      const profilePicture = new FormData();
      profilePicture.append('fotoDePerfil', fotoFile);
      await uploadProfilePicture(result.user.uid, profilePicture);
    }
    
    setFormData(prev => ({
      ...prev,
      registeredUid: result.user.uid
    }));
    
    handleNext();
  } catch (error) {
    console.error(`Erro ao registrar com ${provider}:`, error);
    setError(error.message || `Erro ao autenticar com ${provider}. Tente novamente.`);
  } finally {
    setLoading(false);
  }
};

  const handleCompletion = () => {
    showToast('Registro concluído com sucesso!', { type: 'success' });
    navigate('/dashboard');
  };

  // Renderização durante o carregamento inicial do convite
  if (activeStep === 0 && checkingInvite) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography ml={2}>Verificando o convite...</Typography>
      </Box>
    );
  }

  // Renderização em caso de erro no convite
  if (activeStep === 0 && inviteError) {
    return (
     <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
        <Alert severity="error">{inviteError}</Alert>
       <Button 
         variant="contained" 
         fullWidth 
         sx={{ mt: 2 }}
         onClick={() => navigate('/login')}
       >
         Ir para a página de login
       </Button>
     </Box>
    );
  }

  // Renderização principal do componente
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: 3
    }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        maxWidth: {xs: '95%', sm: 600, md: 800}, 
        width: '100%'
      }}>
        {/* Cabeçalho */}
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold" color="primary">
          {activeStep === 0 ? 'Validação de Convite' : 
           activeStep === 1 ? 'Complete seu Perfil' :
           activeStep === 2 ? 'Método de Autenticação' : 
           'Registro Concluído'}
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Conteúdo baseado no passo atual */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Etapa 1: Validação do Convite */}
        {activeStep === 0 && (
          <Box sx={{ mt: 2 }}>
            {inviteData && inviteData.senderName && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                Você foi convidado por {inviteData.senderName} para se juntar à plataforma.
              </Typography>
            )}

            <TextField
              label="Email"
              fullWidth
              value={formData.email}
              disabled={!!inviteData?.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Nome"
              fullWidth
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              sx={{ mb: 3 }}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              {/* <Button 
                onClick={() => navigate('/login')}
                color="primary"
              >
                Já tenho uma conta
              </Button> */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleValidateInvite}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar e Continuar'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Etapa 2: Completar Perfil (agora é o segundo passo, antes era o terceiro) */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="body1" paragraph align="center" color="text.secondary" mb={3}>
              Complete seu perfil para personalizar sua experiência e conectar-se com pessoas de interesses semelhantes.
            </Typography>

            <Grid container spacing={4}>
              {/* Foto de perfil */}
              <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  src={previewImage} 
                  sx={{ width: 150, height: 150, mb: 2, border: '3px solid #f0f0f0' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current.click()}
                  sx={{ mb: 1 }}
                >
                  Alterar foto
                </Button>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={formData.perfilPublico} 
                      onChange={handleChange} 
                      name="perfilPublico" 
                      color="primary"
                    />
                  }
                  label="Perfil público"
                />
              </Grid>
              
              {/* Informações básicas */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome completo"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      variant="outlined"
                      placeholder="(00) 00000-0000"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Tipo de conta</InputLabel>
                      <Select
                        name="tipoDeConta"
                        value={formData.tipoDeConta}
                        onChange={handleChange}
                        label="Tipo de conta"
                      >
                        <MenuItem value="Cliente">Cliente</MenuItem>
                        <MenuItem value="Profissional">Profissional</MenuItem>
                        <MenuItem value="Empresa">Empresa</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Sobre você"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      variant="outlined"
                      placeholder="Conte um pouco sobre você, sua experiência e interesses..."
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Interesses */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  Seus interesses
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel>Categoria</InputLabel>
                      <Select
                        value={activeCategory}
                        onChange={handleCategoriaChange}
                        label="Categoria"
                      >
                        {interestData.map(cat => (
                          <MenuItem key={cat.id} value={cat.name}>
                            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Novo interesse..."
                        value={novoInteresse}
                        onChange={(e) => setNovoInteresse(e.target.value)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                size="small"
                                onClick={() => handleAddInteresse(activeCategory, novoInteresse)}
                                disabled={!novoInteresse.trim()}
                              >
                                <Add />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInteresse(activeCategory, novoInteresse);
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Sugestões:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {getCategoryInterests(activeCategory).map((interesse) => (
                        <Chip
                          key={interesse.id}
                          label={interesse.label}
                          size="small"
                          variant={isInterestSelected(activeCategory, interesse.label) ? "filled" : "outlined"}
                          onClick={() => handleToggleInteresse(activeCategory, interesse.label)}
                          color={isInterestSelected(activeCategory, interesse.label) ? "primary" : "default"}
                        />
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      p: 2, 
                      minHeight: 200,
                      backgroundColor: '#fafafa'
                    }}>
                      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Seus interesses selecionados:
                      </Typography>
                      
                      {Object.keys(formData.interesses || {}).map((categoria) => {
                        const interessesCategoria = formData.interesses[categoria] || [];
                        return interessesCategoria.length > 0 && (
                          <Box key={categoria} sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                              {categoria.charAt(0).toUpperCase() + categoria.slice(1)}:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {interessesCategoria.map((interesse) => (
                                <Chip
                                  key={`${categoria}-${interesse}`}
                                  label={interesse}
                                  onDelete={() => handleToggleInteresse(categoria, interesse)}
                                  color="primary"
                                  size="small"
                                />
                              ))}
                            </Box>
                          </Box>
                        );
                      })}
                      
                      {!formData.interesses || Object.values(formData.interesses).every(arr => !arr || arr.length === 0) ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', mt: 4 }}>
                          Você ainda não selecionou nenhum interesse.
                        </Typography>
                      ) : null}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={loading}
                startIcon={<ChevronLeft />}
              >
                Voltar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleProfileSubmit}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ChevronRight />}
              >
                {loading ? 'Salvando...' : 'Continuar'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Etapa 3: Método de Autenticação (agora é o terceiro passo, antes era o segundo) */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="body1" paragraph align="center" color="text.secondary" mb={3}>
              Escolha como deseja criar sua conta:
            </Typography>

            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                disabled
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Mail fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              
              <TextField
                label="Senha"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Lock fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              
              <TextField
                label="Confirmar Senha"
                type="password"
                fullWidth
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <Lock fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleRegisterWithPassword}
                disabled={loading}
                sx={{ mb: 3, height: 48 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar com Email e Senha'}
              </Button>

              <Divider sx={{ my: 3 }}>ou continue com</Divider>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  onClick={() => handleRegisterWithProvider('google')}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GithubIcon />}
                  onClick={() => handleRegisterWithProvider('github')}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Github
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FacebookIcon />}
                  onClick={() => handleRegisterWithProvider('microsoft')}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Microsoft
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={loading}
                startIcon={<ChevronLeft />}
              >
                Voltar
              </Button>
            </Box>
          </Box>
        )}

        {/* Etapa 4: Confirmação */}
        {activeStep === 3 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom color="primary">
              Registro concluído com sucesso!
            </Typography>
            <Typography variant="body1" paragraph>
              Obrigado por se juntar à nossa plataforma. Seu perfil foi criado e você já pode começar a usar todos os recursos.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCompletion}
                sx={{ minWidth: 200 }}
              >
                Ir para o Dashboard
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Register;