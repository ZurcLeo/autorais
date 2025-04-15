// // src/services/paymentService.js
// import {api} from './apiService';

// const createPixPayment = async (paymentData) => {
//   try {
//     console.log('Sending payment request with data:', paymentData);
//     const response = await api.post('/api/payments/pix', paymentData);
//     return response.data;
//   } catch (error) {
//     console.error('Full error response:', error.response?.data);
//     throw new Error('Failed to create PIX payment. Please try again.');
//   }
// };

// const getPixPaymentStatus = async (paymentIntentId) => {
//   try {
//     const response = await api.get(`/api/payments/status/${paymentIntentId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching PIX payment status:', error.message);
//     throw new Error('Failed to fetch PIX payment status. Please try again.');
//   }
// };

// export default {
//   createPixPayment,
//   getPixPaymentStatus,
// };