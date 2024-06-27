  //eloswebapp/src/components/resources/ConnectionService.js
  import React, { createContext, useContext, useState } from 'react';
  import { doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
  import { db } from '../../firebase.config';
  import { useAuth } from '../resources/AuthService';
  import { useStatus } from './StatusContext'; // Certifique-se de importar useStatus
  import { useNotifications } from './NotificationService';

  const ConnectionContext = createContext();

  export const useConnection = () => useContext(ConnectionContext);

  export const ConnectionProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { updateStatus } = useStatus(); // Utiliza o hook useStatus
    const [loading, setLoading] = useState(false);


    const enviarSolicitacao = async (receptorId, solicitacao) => {
      if (!currentUser) {
        updateStatus({ color: 'vermelho', message: 'É necessário estar autenticado para enviar solicitações.' });
        return;
      }
      setLoading(true);
      try {
        const solicitacaoRef = doc(db, `conexoes/${receptorId}/solicitadas`, currentUser.uid);
        await setDoc(solicitacaoRef, {
          ...solicitacao,
          dataSolicitacao: serverTimestamp(),
          status: 'pendente',
        });
        updateStatus({ color: 'verde', message: 'Solicitação de conexão enviada com sucesso.' });
      } catch (error) {
        updateStatus({ color: 'vermelho', message: `Erro ao enviar solicitação de amizade: ${error}` });
      } finally {
        setLoading(false);
      }

    };

    const aceitarSolicitacao = async (solicitanteId) => {
      if (!currentUser) {
        updateStatus({ color: 'vermelho', message: 'É necessário estar autenticado para aceitar solicitações.' });
        return;
      }
      setLoading(true);
      try {
        await updateDoc(doc(db, `conexoes/${currentUser.uid}/solicitadas`, solicitanteId), {
          status: "aprovada",
          dataDoAceite: serverTimestamp(),
        });
        updateStatus({ color: 'verde', message: 'Solicitação de conexão aceita com sucesso.' });
      } catch (error) {
        updateStatus({ color: 'vermelho', message: `Erro ao aceitar solicitação de amizade: ${error}` });
      } finally {
        setLoading(false);
      }
    };

    const rejeitarSolicitacao = async (solicitanteId) => {
      if (!currentUser) {
        updateStatus({ color: 'vermelho', message: 'É necessário estar autenticado para rejeitar solicitações.' });
        return;
      }
      setLoading(true);
      try {
        await deleteDoc(doc(db, `conexoes/${currentUser.uid}/solicitadas`, solicitanteId));
        updateStatus({ color: 'verde', message: 'Solicitação de conexão rejeitada com sucesso.' });
      } catch (error) {
        updateStatus({ color: 'vermelho', message: `Erro ao rejeitar solicitação de amizade: ${error}` });
      } finally {
        setLoading(false);
      }
    };
    
    const atualizarListaDeAmigos = async () => {
      if (!currentUser) {
        updateStatus({ color: 'vermelho', message: 'É necessário estar autenticado para visualizar a lista de amigos.' });
        return;
      }
      setLoading(true);
    
    };

    const value = {
      enviarSolicitacao,
      aceitarSolicitacao,
      rejeitarSolicitacao,
      atualizarListaDeAmigos,
      loading,
    };

    return (
      <ConnectionContext.Provider value={value}>
        {children}
      </ConnectionContext.Provider>
    );
  };

  export default ConnectionProvider;
