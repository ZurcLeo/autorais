// src/components/Auth/CompleteProfile.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Paper, Grid,
  Avatar, IconButton, Switch, FormControlLabel,
  Chip, Divider, InputAdornment, CircularProgress,
  MenuItem, Select, FormControl, InputLabel, Alert
} from '@mui/material';
import { PhotoCamera, Add } from '@mui/icons-material';
import { serviceLocator } from '../../core/services/BaseService';
import { useToast } from '../../providers/ToastProvider';
import { useUser } from '../../providers/UserProvider';
import { useLocation } from 'react-router-dom';
import { useServiceInitialization } from '../../core/initialization/ServiceInitializationProvider';

const mockFoto = process.env.REACT_APP_CLAUD_PROFILE_IMG;

const CompleteProfile = () => {
  const serviceStore = serviceLocator.get('store').getState()?.auth;
  const interestData = serviceLocator.get('store').getState()?.interests?.availableInterests || [];
  const { currentUser } = serviceStore;
  const { updateUser, uploadProfilePicture } = useUser();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { email } = location.state || {};
  
  // Estado para controle de inicialização e disponibilidade dos serviços
  const { 
    isServiceReady, 
    getServiceError
  } = useServiceInitialization();

  // Verificação dos serviços necessários
  const storeServiceReady = isServiceReady('store');
  const apiServiceReady = isServiceReady('apiService');
  const authServiceReady = isServiceReady('auth');
  const userServiceReady = isServiceReady('users');
 
  // Verificação de erros nos serviços
  const storeError = getServiceError('store');
  const apiError = getServiceError('apiService');
  const authError = getServiceError('auth');
  const userError = getServiceError('users');

  const [servicesReady, setServicesReady] = useState(false);
  const [serviceErrors, setServiceErrors] = useState([]);

  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('lazer');
  const [novoInteresse, setNovoInteresse] = useState('');

  // Inicializa o formData com valores padrão seguros
  const [formData, setFormData] = useState({
    nome: currentUser?.nome || '',
    telefone: currentUser?.telefone || '',
    descricao: currentUser?.descricao || '',
    perfilPublico: currentUser?.perfilPublico || false,
    tipoDeConta: currentUser?.tipoDeConta || 'Cliente',
    fotoDoPerfil: currentUser?.fotoDoPerfil || mockFoto,
    interesses: currentUser?.interesses || {},
    email: currentUser?.email || email
  });

  const [previewImage, setPreviewImage] = useState(formData.fotoDoPerfil || mockFoto);
  const [fotoAlterada, setFotoAlterada] = useState(false);
  const [fotoFile, setFotoFile] = useState(null);

  // Efeito para verificar a disponibilidade dos serviços
  useEffect(() => {
    console.log("Location state:", location.state);
    console.log("Current user from store:", currentUser);
    
    // Lista dos serviços necessários para este componente
    const requiredServices = [
      { name: 'store', ready: storeServiceReady, error: storeError },
      { name: 'auth', ready: authServiceReady, error: authError },
      { name: 'users', ready: userServiceReady, error: userError },
      { name: 'apiService', ready: apiServiceReady, error: apiError }
    ];

    // Verificar se todos os serviços estão prontos
    const allReady = requiredServices.every(service => service.ready);
    setServicesReady(allReady);
    
    // Coletar erros de serviços
    const errors = requiredServices
      .filter(service => service.error)
      .map(service => ({ 
        service: service.name, 
        error: service.error 
      }));
    
    setServiceErrors(errors);

    // Log para depuração
    console.log('Estado dos serviços necessários:', 
      requiredServices.map(s => `${s.name}: ${s.ready ? 'Pronto' : 'Não pronto'}${s.error ? ` (Erro: ${s.error})` : ''}`).join(', ')
    );
  }, [
    authServiceReady, storeServiceReady, userServiceReady, apiServiceReady,
    authError, userError, storeError, apiError, location.state, currentUser
  ]);

  // Efeito para atualizar formData quando location.state mudar
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email,
        nome: location.state.nome || prev.nome
      }));
    }
  }, [location.state]);

  // Certifica-se de que formData.interesses tenha todas as categorias necessárias
  // Isso evita o erro "undefined is not an object"
  useMemo(() => {
    // Obtém todas as categorias de interesse disponíveis
    const categorias = interestData?.map(cat => cat.name) || [];
    
    // Atualiza o formData para garantir que todas as categorias existam
    setFormData(prevData => {
      const interessesAtualizados = { ...prevData.interesses };
      
      // Adiciona categorias que não existem em formData.interesses
      categorias?.forEach(categoria => {
        if (!interessesAtualizados[categoria]) {
          interessesAtualizados[categoria] = [];
        }
      });
      
      return {
        ...prevData,
        interesses: interessesAtualizados
      };
    });
  }, [interestData]);

  // Função para obter interesses de uma categoria de forma segura
  const getCategoryInterests = useCallback((categoryName) => {
    const category = interestData.find(cat => cat.name === categoryName);
    return category?.interests || [];
  }, [interestData]);

  // Verifica se um interesse já foi selecionado
  const isInterestSelected = useCallback((categoryName, interestLabel) => {
    const categoryInterests = formData.interesses[categoryName];
    return categoryInterests && categoryInterests.includes(interestLabel);
  }, [formData.interesses]);

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
      };
      
      reader.readAsDataURL(file);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificação adicional de disponibilidade de serviços
    if (!servicesReady) {
      showToast('Nem todos os serviços necessários estão disponíveis. Aguarde ou recarregue a página.', { type: 'error' });
      return;
    }
    
    // Verificar se temos email disponível
    if (!formData.email) {
      showToast('Email é obrigatório para criação do perfil.', { type: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar dados iniciais do usuário (incluindo o uid do Firebase)
      const dadosIniciais = {
        ...formData,
        uid: currentUser?.uid, // Importante: enviar o uid do Firebase
        email: formData.email || currentUser?.email || email || location.state?.email, // Garantir que temos um email
        fotoDoPerfil: formData.fotoDoPerfil || mockFoto, // Usa foto existente ou string vazia
        dataCriacao: Date.now() // Adicionar data de criação
      };
      
      console.log('Dados sendo enviados para o servidor:', formData);
      
      // Primeiro: criar/adicionar o usuário no backend
      await updateUser(dadosIniciais);
      
      // Segundo: se houver foto para upload, fazer o upload usando o ID do usuário recém-criado
      if (fotoAlterada && fotoFile) {
        const profilePicture = new FormData();
        profilePicture.append('fotoDePerfil', fotoFile);
        
        // Usa o UID recebido do auth service
        const fotoUrl = await uploadProfilePicture(currentUser?.uid, profilePicture);
        
        // Atualiza localmente o formData com a URL da foto (não é necessário atualizar no backend novamente)
        setFormData(prev => ({
          ...prev,
          fotoDoPerfil: fotoUrl
        }));
      }
      
      showToast('Perfil criado com sucesso!', { type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      showToast(`Erro ao criar perfil: ${error.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Renderização de alerta de serviços não disponíveis
  const renderServiceAlert = () => {
    if (!servicesReady) {
      return (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aguardando inicialização dos serviços necessários...
          {serviceErrors.length > 0 && (
            <ul>
              {serviceErrors.map((error, index) => (
                <li key={index}>
                  Erro no serviço {error.service}: {error.error}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      );
    }
    return null;
  };

  // Filtra as categorias disponíveis
  const availableCategories = useMemo(() => {
    return interestData.map(category => ({
      id: category.id,
      name: category.name,
      displayName: category.name.charAt(0).toUpperCase() + category.name.slice(1)  // Capitaliza o nome
    }));
  }, [interestData]);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: '100vh',
      padding: 3,
      backgroundColor: '#f5f5f5'
    }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold" color="primary">
          Complete seu perfil
        </Typography>
        <Typography variant="body1" paragraph align="center" color="text.secondary" sx={{ mb: 4 }}>
          Estas informações ajudarão a personalizar sua experiência e conectar você com pessoas de interesses semelhantes.
        </Typography>
        
        {/* Alerta de serviços não disponíveis */}
        {renderServiceAlert()}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Seção de foto de perfil */}
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
            
            {/* Seção de informações básicas */}
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
                    rows={4}
                    variant="outlined"
                    placeholder="Conte um pouco sobre você, sua experiência e interesses..."
                  />
                </Grid>
              </Grid>
            </Grid>
            
            {/* Seção de interesses */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom color="primary">
                Seus interesses
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Selecione ou adicione interesses para melhorar suas conexões e recomendações.
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
                      {availableCategories.map(cat => (
                        <MenuItem key={cat.id} value={cat.name}>
                          {cat.displayName}
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
                        sx={{ 
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }
                        }}
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
            
            {/* Botões de ação */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Pular por agora
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading || !servicesReady}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? 'Salvando...' : 'Salvar e continuar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CompleteProfile;