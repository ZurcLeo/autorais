// // src/components/Invites/InvitationValidation.js
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
// import { useInvites } from '../../providers/InviteProvider';

// const InvitationValidation = () => {
//   const [email, setEmail] = useState('');
//   const [nome, setNome] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [validationError, setValidationError] = useState(null);

//   const navigate = useNavigate();
//   const { inviteId } = useParams();
//   const { 
//     checkInvite, 
//     validateInvite, 
//     checkingInvite, 
//     inviteData, 
//     inviteError 
//   } = useInvites();

//   // Usar o provider para verificar o convite
//   useEffect(() => {
//     if (inviteId) {
//       checkInvite(inviteId);
//     }
//   }, [inviteId, checkInvite]);

//   // Efeito para preencher o email quando os dados do convite estiverem disponíveis
//   useEffect(() => {
//     if (inviteData && inviteData.email) {
//       setEmail(inviteData.email);
//     }
//   }, [inviteData]);

//   const handleValidateInvite = async () => {
//     setValidationError(null);
//     setLoading(true);

//     try {
//       if (!email || !nome || !inviteId) {
//         setValidationError('Por favor, preencha todos os campos.');
//         return;
//       }
//       const response = await validateInvite(inviteId, email, nome);
      
//       // Após validação bem-sucedida, redirecionar para página de registro
//       navigate('/register', { 
//         state: { 
//           inviteId, 
//           email, 
//           nome, 
//           validated: true,
//           senderInfo: response.inviter
//         } 
//       });
//     } catch (error) {
//       let errorMessage = 'Erro ao validar convite. Verifique os dados inseridos.';
      
//       // Extrair mensagens específicas de erro
//       if (error.message.includes('invalid-email')) {
//         errorMessage = 'O email informado não corresponde ao convite.';
//       } else if (error.message.includes('invalid-name')) {
//         errorMessage = 'O nome informado não corresponde ao convite.';
//       } else if (error.message.includes('invalid-expired')) {
//         errorMessage = 'Este convite expirou.';
//       } else if (error.message.includes('invalid-status')) {
//         errorMessage = 'Este convite já foi utilizado.';
//       }
      
//       setValidationError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Renderização durante o carregamento inicial
//   if (checkingInvite) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress />
//         <Typography ml={2}>Verificando o convite...</Typography>
//       </Box>
//     );
//   }

//   // Renderização em caso de erro no convite
//   if (inviteError) {
//     return (
//      <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
//         <Alert severity="error">{inviteError}</Alert>
//        <Button 
//          variant="contained" 
//          fullWidth 
//          sx={{ mt: 2 }}
//          onClick={() => navigate('/login')}
//        >
//          Ir para a página de login
//        </Button>
//      </Box>
//     );
//   }

//   // Formulário de validação
//   return (
//     <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4, p: 2 }}>
//       <Typography variant="h5" sx={{ mb: 3 }}>
//         Validação de Convite
//       </Typography>

//       {inviteData && inviteData.senderName && (
//         <Typography variant="body2" color="text.secondary" mb={2}>
//           Você foi convidado por {inviteData.senderName} para se juntar à plataforma.
//         </Typography>
//       )}

//       <TextField
//         label="Email"
//         fullWidth
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         sx={{ mb: 2 }}
//         disabled={!!inviteData?.email}
//       />
//       <TextField
//         label="Nome"
//         fullWidth
//         value={nome}
//         onChange={(e) => setNome(e.target.value)}
//         sx={{ mb: 2 }}
//       />

//       {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}

//       <Button
//         variant="contained"
//         color="primary"
//         onClick={handleValidateInvite}
//         fullWidth
//         disabled={loading}
//         sx={{ mb: 2 }}
//       >
//         {loading ? <CircularProgress size={24} color="inherit" /> : 'Validar Convite'}
//       </Button>

//       <Button
//         variant="text"
//         color="primary"
//         onClick={() => navigate('/login')}
//         fullWidth
//       >
//         Já tenho uma conta
//       </Button>
//     </Box>
//   );
// };

// export default InvitationValidation;