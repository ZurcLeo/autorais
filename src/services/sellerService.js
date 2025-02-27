// services/sellerService.js
import {api} from './apiService';

export const sellerService = {
  async registerSeller(data) {
    return await api.post('/api/sellers/register', data);
  },

  async updateSellerProfile(sellerId, data) {
    return await api.put(`/api/sellers/${sellerId}`, data);
  },

  async getSellerStatus(sellerId) {
    return await api.get(`/api/sellers/${sellerId}/commission/status`);
  },
};