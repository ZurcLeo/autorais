import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const caixinhaService = {
  getCaixinhas: async () => {
    const response = await axios.get(`${API_URL}/api/caixinha`);
    return response.data;
  },

  getCaixinhaById: async (id) => {
    const response = await axios.get(`${API_URL}/api/caixinha/${id}`);
    return response.data;
  },

  createCaixinha: async (data) => {
    const response = await axios.post(`${API_URL}/api/caixinha`, data);
    return response.data;
  },

  updateCaixinha: async (id, data) => {
    const response = await axios.put(`${API_URL}/api/caixinha/${id}`, data);
    return response.data;
  },

  deleteCaixinha: async (id) => {
    const response = await axios.delete(`${API_URL}/api/caixinha/${id}`);
    return response.data;
  },

  addContribuicao: async (data) => {
    const response = await axios.post(`${API_URL}/api/caixinha/contribuicao`, data);
    return response.data;
  },

  getContribuicoes: async (id) => {
    const response = await axios.get(`${API_URL}/api/caixinha/${id}/contribuicoes`);
    return response.data;
  },

  // Outros métodos de contribuição, empréstimo, atividades bônus, etc.
};

export default caixinhaService;