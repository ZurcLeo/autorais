// // src/components/Auth/AuthCallback.js
// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { signInWithCustomToken } from 'firebase/auth';
// import { auth } from '../../firebaseConfig';
// import { showToast } from '../../utils/toastUtils';
// import {api} from '../../services/apiService';

// const AuthCallback = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const processAuth = async () => {
//       try {
//         // Pega os tokens da URL
//         const params = new URLSearchParams(window.location.search);
//         const accessToken = localStorage.getItem('accessToken');
//         const refreshToken = localStorage.getItem('refreshToken');

//         if (!accessToken || !refreshToken) {
//           throw new Error('Tokens não encontrados');
//         }

//         // Faz login no Firebase
//         await signInWithCustomToken(auth, refreshToken);

//         // Armazena os tokens
//         localStorage.setItem('accessToken', accessToken);
        
//         // Configura o header de autorização
//         api.setAuthHeader(accessToken);

//         // Redireciona para o dashboard
//         navigate('/dashboard');
//         showToast('Login realizado com sucesso!', { type: 'success' });
//       } catch (error) {
//         console.error('Erro no callback:', error);
//         showToast('Erro ao completar autenticação', { type: 'error' });
//         navigate('/login');
//       }
//     };

//     processAuth();
//   }, [navigate]);

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold mb-2">Completando autenticação...</h2>
//         <p className="text-gray-600">Por favor, aguarde...</p>
//       </div>
//     </div>
//   );
// };

// export default AuthCallback;