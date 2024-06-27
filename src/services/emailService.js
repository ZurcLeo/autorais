import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const emailService = {
  sendInvite: async (to, subject, message) => {
    const response = await axios.post(`${API_URL}/api/email/send-invite`, { to, subject, message });
    return response.data;
  },
};

export default emailService;