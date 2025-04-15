// import {api} from './apiService';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../firebaseConfig';

// const authService = {
//   register: async (email, password, inviteCode) => {
//     console.info('[AuthService] Registering new user');
//     const startTime = performance.now();
//     try {
//       const response = await api.post('/api/auth/register', { email, password, inviteCode });
//       console.debug(`[AuthService] Registration successful in ${performance.now() - startTime}ms`);
//       return response.data;
//     } catch (error) {
//       console.error('[AuthService] Registration failed:', error);
//       throw new Error(`Erro ao registrar usuário: ${error.response ? error.response.data : error.message}`);
//     }
//   },

//   login: async (email, password) => {
//     console.info('[AuthService] Logging in user');
//     const startTime = performance.now();
//     try {
//       const response = await api.post('/api/auth/login', { email, password });
//       console.debug(`[AuthService] Login successful in ${performance.now() - startTime}ms`);
//       return response.data;
//     } catch (error) {
//       console.error('[AuthService] Login failed:', error);
//       throw new Error(`Erro ao fazer login: ${error.response ? error.response.data : error.message}`);
//     }
//   },

//   logout: async () => {
//     console.info('[AuthService] Logging out user');
//     const startTime = performance.now();
//     try {
//       const response = await api.post('/api/auth/logout');
//       console.debug(`[AuthService] Logout successful in ${performance.now() - startTime}ms`);
//       return response.data;
//     } catch (error) {
//       console.error('[AuthService] Logout failed:', error);
//       throw new Error(`Erro ao fazer logout: ${error.response ? error.response.data : error.message}`);
//     }
//   },

//   loginWithProvider: async (provider) => {
//     console.info(`[AuthService] Logging in with provider: ${provider}`);
//     try {
//       const response = await api.post('/api/auth/login-with-provider');
//       return response;
//     } catch (error) {
//       console.error('[AuthService] Provider login failed:', error);
//       throw error;
//     }
//   },

//   getCurrentUser: async () => {
//     console.info('[AuthService] Fetching current user');
//     return new Promise((resolve, reject) => {
//       onAuthStateChanged(auth, async (user) => {
//         if (user) {
//           try {
//             const startTime = performance.now();
//             const backendUser = await api.get(`/api/auth/me`);
//             console.debug(`[AuthService] User fetched in ${performance.now() - startTime}ms`);
//             resolve(backendUser.data);
//           } catch (error) {
//             console.error('[AuthService] Error fetching user:', error);
//             reject(error);
//           }
//         } else {
//           resolve(null);
//         }
//       });
//     });
//   },

//   getToken: async () => {
//     console.info('[AuthService] Retrieving user token');
//     try {
//       const user = auth.currentUser;
//       if (!user) return null;
//       const firebaseToken = await user.getIdToken(true);
//       const backendToken = await api.post('/api/auth/token', {
//         credentials: 'include'
//       });
//       return backendToken.ok;
//     } catch (error) {
//       console.error('[AuthService] Error getting token:', error);
//       throw error;
//     }
//   },

//   refreshToken: async () => {
//     console.info('[AuthService] Refreshing user token');
//     const startTime = performance.now();
//     try {
//       const user = auth.currentUser;
//       if (!user) throw new Error('No user authenticated');
//       const response = await api.post('/api/auth/refresh-token', {
//         credentials: 'include'
//       });
//       console.debug(`[AuthService] Token refreshed in ${performance.now() - startTime}ms`);
//       return response.data.accessToken;
//     } catch (error) {
//       console.error('[AuthService] Error refreshing token:', error);
//       throw error;
//     }
//   }
// };

// export default authService;