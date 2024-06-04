// enviarMensagem.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { toast } from 'react-toastify';

export async function enviarMensagem(uidRemetente, uidDestinatario, conteudo, tipo) {
  const idsOrdenados = [uidRemetente, uidDestinatario].sort();
  const conversaId = `${idsOrdenados[0]}_${idsOrdenados[1]}`;
  const caminhoConversa = `mensagens/${conversaId}/msgs`;

  try {
    await addDoc(collection(db, caminhoConversa), {
      uidRemetente,
      uidDestinatario,
      conteudo,
      tipo,
      timestamp: serverTimestamp(),
      lido: false
    });
    toast.success('Mensagem enviada com sucesso.');
  } catch (error) {
    console.error('Erro ao enviar a mensagem:', error);
    throw new Error('Falha ao enviar mensagem.');
  }
}
