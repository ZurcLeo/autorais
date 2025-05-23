// hooks/useMembersProcessor.js
import { useMemo } from 'react';

export const useMembersProcessor = (caixinha) => {
  return useMemo(() => {
    if (!caixinha || !caixinha.members) {
      return { ...caixinha, members: [] };
    }

    // A estrutura atual é um array com objetos que têm IDs como chaves
    // Precisamos transformar em um array simples de objetos
    const processedMembers = [];
    
    // Iterar sobre o array de membros
    caixinha.members.forEach(memberObj => {
      // Para cada objeto, extrair os membros por ID
      Object.keys(memberObj).forEach(memberId => {
        const memberDataArray = memberObj[memberId];
        
        // Cada ID pode ter um array de dados
        if (Array.isArray(memberDataArray)) {
          memberDataArray.forEach(memberData => {
            processedMembers.push({
              id: memberData.id,
              nome: memberData.nome,
              email: memberData.email,
              isAdmin: memberData.isAdmin,
              active: memberData.active,
              fotoPerfil: memberData.fotoPerfil,
              joinedAt: memberData.joinedAt
            });
          });
        }
      });
    });

    // Retornar uma nova caixinha com os membros processados
    return {
      ...caixinha,
      members: processedMembers
    };
  }, [caixinha]);
};