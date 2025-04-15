// // src/services/bankingService.js
// import {api} from './apiService';

// const bankingService = {
//   getBankingInfo: async (caixinhaId) => {
//     const response = await api.get(`/api/banking/${caixinhaId}`);
//     return response.data;
//   },

//   registerBankAccount: async (caixinhaId, accountData) => {
//     const response = await api.post(`/api/banking/${caixinhaId}/register`, accountData);
//     return response.data;
//   },

//   validateBankAccount: async (transactionData) => {
//     const accountId = transactionData.accountId;
//     const response = await api.post(`/api/banking/${accountId}/validate`, transactionData);
//     return response.data;
//   },

//   getBankingHistory: async (caixinhaId) => {
//     if (!caixinhaId) {
//       return;
//     }
//     const response = await api.get(`/api/banking/${caixinhaId}/history`);
//     console.log(response.data)
//     return response.data;
//   },
// };

// export default bankingService;