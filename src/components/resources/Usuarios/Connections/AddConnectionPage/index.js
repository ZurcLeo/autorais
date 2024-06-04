import React, { useState } from 'react';
import { useUserContext } from '../../../userContext';

export const AddConnectionPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { users, connections, searchUsers, addConnection, feedbackMessage } = useUserContext();

  const handleSearch = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await searchUsers(searchTerm);
      if (result && result.length === 0) {
        setErrorMessage('Nenhum usuário encontrado com esses dados de pesquisa');
      }
    } catch (error) {
      setErrorMessage('Erro ao buscar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>Adicionar Conexão</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar usuário..."
          style={{ marginRight: '5px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch} disabled={isLoading}>Buscar</button>
      </div>

      {isLoading && <p>Buscando...</p>}
      {!isLoading && errorMessage && <p>{errorMessage}</p>}
      {feedbackMessage && <p>{feedbackMessage}</p>}
      <div>
        {users && users.map((user) => (
          <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            {user.name}
            <button onClick={() => addConnection(user)}>Adicionar</button>
          </div>
        ))}
      </div>

      <h2>Minhas Conexões</h2>
      <div>
        {connections && connections.map((connection) => (
          <div key={connection.id} style={{ marginBottom: '10px' }}>
            {connection.name}
          </div>
        ))}
      </div>
    </div>
  );
};
