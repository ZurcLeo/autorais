// // src/context/AuthContext.js
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { auth } from '../firebaseConfig';
// import {useAuthState} from '../providers/core/AuthProvider/useAuthState';
// // import { useAuthInitialization } from '../providers/core/AuthProvider/useAuthInitialization';
// import { useAuthActions } from '../providers/core/AuthProvider/useAuthActions';
// import { useServiceCore } from '../providers/ServiceCore';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const { initializeService, markServiceReady } = useServiceCore();
//   const { state, dispatchWithLogging } = useAuthState('AuthProvider');
//   const [isReady, setIsReady] = useState(false);
//   const navigate = useNavigate();
  
//   // useAuthInitialization(dispatchWithLogging, markReady);
//   const { signInWithProvider, logoutUser } = useAuthActions(state, dispatchWithLogging, navigate, () => {});

//   useEffect(() => {
//     const initAuth = async () => {
//       await initializeService('auth', async () => {
//         // Lógica de inicialização do auth
//         const user = await auth.userCredential.user();
//         if (user) {
//           // Setup do usuário
//         }
//         markServiceReady('auth');
//         setIsReady(true); 
//       });
//     };

//     initAuth();
//   }, [initializeService, markServiceReady]);

//   return (
//     <AuthContext.Provider value={{
//       currentUser: state.currentUser,
//       isLoading: state.isLoading,
//       isAuthenticated: state.isAuthenticated,
//       error: state.error,
//       isReady,
//       signInWithProvider,
//       logoutUser
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };