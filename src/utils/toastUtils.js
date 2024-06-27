// src/utils/toastUtils.js
import { toast } from 'react-toastify';

const messages = [
  "Encontrando dados do seu amigo...",
  "Enviando a informação de Aprovação...",
  "Garantindo que vocês estejam conectados...",
  "Criando vínculos para envio de mensagens...",
  "Agora sim! Vocês estão conectados!"
];

export const showPromiseToast = (promise) => {
  const id = toast.loading("Processando...");

  promise.then(() => {
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    toast.update(id, { render: randomMessage, type: "success", isLoading: false, autoClose: 3000 });
  }).catch((error) => {
    toast.update(id, { render: `Erro: ${error.message}`, type: "error", isLoading: false, autoClose: 3000 });
  });
};