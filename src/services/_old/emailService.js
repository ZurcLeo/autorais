// //src/services/emailService.js
// // Importa um serviço de API (api) de outro arquivo (./apiService).
// // Cria um objeto emailService que contém uma função sendInvite.
// // A função sendInvite recebe três parâmetros:
// // to: o endereço de e-mail do destinatário.
// // subject: o assunto do e-mail.
// // message: o conteúdo do e-mail.
// // A função sendInvite faz uma solicitação POST para a rota /api/email/send-invite do serviço de API, passando os parâmetros to, subject e message como um objeto JSON no corpo da solicitação.
// // A função sendInvite aguarda a resposta da solicitação e retorna os dados da resposta (response.data).

// import {api} from './apiService';

// const emailService = {
//   sendInvite: async (to, subject, message) => {
//     // const response = await api.post('/api/email/send-invite', { to, subject, message });
//     // return response.data;
//   },
// };

// export default emailService;