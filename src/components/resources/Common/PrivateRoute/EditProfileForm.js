import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';
import { FaUpload } from 'react-icons/fa';
import AvatarEditor from 'react-avatar-editor';
import useImageUpload from './hooks/useImageUpload';
import useUserProfile from './hooks/useUserProfile';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const EditProfileForm = ({ currentUser }) => {
  const location = useLocation();
  const userData = location.state?.userData || {};
  const navigate = useNavigate();

  const {
    profileImage,
    isPhotoSelected,
    avatarEditorRef,
    handleImageChange,
    uploadSelectedImage,
  } = useImageUpload(currentUser);

  const { updateProfileData } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [safeUserData, setUserData] = useState({
    ...userData,
    interessesPessoais: Array.isArray(userData?.interessesPessoais)
      ? userData.interessesPessoais
      : [],
    interessesNegocios: Array.isArray(userData?.interessesNegocios)
      ? userData.interessesNegocios
      : [],
    descricao: userData?.descricao || '',
  });
  const personalInterests = [
    'Relacionamentos',
    'Encontros Casuais',
    'Passeios Românticos',
    'Sem Compromisso',
  ];
  const businessInterests = ['Venda de Produtos', 'Oferta de Serviços'];

  const handleCheckboxChange = (field, value) => {
    setUserData((prevState) => {
      const currentField = Array.isArray(prevState[field])
        ? prevState[field]
        : [];
      const updatedInterests = currentField.includes(value)
        ? currentField.filter((interest) => interest !== value)
        : [...currentField, value];
      return { ...prevState, [field]: updatedInterests };
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedData = { ...safeUserData };
      await updateProfileData(updatedData);
      toast.success('Dados do perfil atualizados com sucesso.');
      navigate(-1); // Go back to the previous page after save
    } catch (error) {
      console.error('Erro ao salvar o perfil:', error);
      toast.error('Erro ao atualizar o perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setUserData({ ...safeUserData, descricao: value });
    }
  };

  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <Container sx={{ bgcolor: 'background.paper' }}>
      <div style={{ backgroundColor: 'background.paper', padding: '16px', borderRadius: '8px' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Editando Perfil de {safeUserData.nome}
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'background.default' }}>
          <FormControl>
            <Typography variant="h6" align="center">
              Imagem de Perfil
            </Typography>
            <div style={{ textAlign: 'center' }}>
              {profileImage && (
                <AvatarEditor
                  ref={avatarEditorRef}
                  image={profileImage}
                  width={200}
                  height={200}
                  border={50}
                  borderRadius={100}
                  scale={1.2}
                  rotate={0}
                />
              )}
            </div>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              inputProps={{ 'aria-label': 'Upload Profile Image', autoComplete: 'off' }}
            />
            <Button
              variant="outlined"
              onClick={uploadSelectedImage}
              disabled={!isPhotoSelected}
              startIcon={<FaUpload />}
              sx={{ mt: 2 }}
            >
              Enviar Imagem
            </Button>
            <InputLabel htmlFor="profileImage" shrink>
              A imagem deve ser no formato JPEG ou PNG e ter até 1MB.
            </InputLabel>
            <hr />
          </FormControl>

          <TextField
            id="name"
            label="Nome"
            variant="outlined"
            fullWidth
            defaultValue={safeUserData.nome}
            onChange={(e) => setUserData({ ...safeUserData, nome: e.target.value })}
            inputProps={{ autoComplete: 'off' }}
          />

          <TextField
            id="email"
            label="E-mail"
            variant="outlined"
            fullWidth
            defaultValue={safeUserData.email}
            onChange={(e) => setUserData({ ...safeUserData, email: e.target.value })}
            inputProps={{ autoComplete: 'off' }}
          />

          <TextField
            id="description"
            label="Descrição"
            variant="outlined"
            multiline
            fullWidth
            maxRows={4}
            value={safeUserData.descricao}
            onChange={(e) => {
              handleDescriptionChange(e);
              adjustTextareaHeight(e);
            }}
            inputProps={{ 'aria-label': 'Profile Description', autoComplete: 'off' }}
            helperText={`${safeUserData.descricao.length}/500 caracteres`}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={safeUserData.perfilPublico}
                onChange={(e) => setUserData({ ...safeUserData, perfilPublico: e.target.checked })}
              />
            }
            label="Faça o meu perfil público"
          />
          <Typography variant="body2" sx={{ ml: 3 }}>
            Para que outros usuários possam encontrar você, esta opção deve estar selecionada. Ao selecionar a opção,
            você concorda em compartilhar seus dados com outros usuários registrados. Você pode alterar isso depois.
          </Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">Selecione o tipo de conta</FormLabel>
            <FormGroup>
              {['cliente', 'proprietario', 'suporte'].map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={safeUserData.tipoDeConta === type}
                      onChange={(e) => setUserData({ ...safeUserData, tipoDeConta: e.target.checked ? type : '' })}
                    />
                  }
                  label={type.toUpperCase()}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend">Interesses Pessoais</FormLabel>
            <FormGroup>
              {personalInterests.map((interest) => (
                <FormControlLabel
                  key={interest}
                  control={
                    <Checkbox
                      checked={safeUserData.interessesPessoais.includes(interest)}
                      onChange={() => handleCheckboxChange('interessesPessoais', interest)}
                    />
                  }
                  label={interest}
                />
              ))}
            </FormGroup>
          </FormControl>

          <FormControl component="fieldset">
            <FormLabel component="legend">Interesses de Negócios</FormLabel>
            <FormGroup>
              {businessInterests.map((interest) => (
                <FormControlLabel
                  key={interest}
                  control={
                    <Checkbox
                      checked={safeUserData.interessesNegocios.includes(interest)}
                      onChange={() => handleCheckboxChange('interessesNegocios', interest)}
                    />
                  }
                  label={interest}
                />
              ))}
            </FormGroup>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleSave} disabled={isLoading}>
                Salvar Alterações
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </Container>
  );
};

export default EditProfileForm;
