// src/hooks/useProcessCaixinhaData.js
import { useCallback } from 'react';

const useProcessCaixinhaData = () => {
  const processCaixinhaData = useCallback((caixinhaData) => {
    if (!caixinhaData._fieldsProto) {
      return caixinhaData;
    }

    const fields = caixinhaData._fieldsProto;

    return {
      caixinhaId: caixinhaData._ref?._path?.segments?.slice(-1)[0] || '',
      nome: fields.nome?.stringValue || '',
      descricao: fields.descricao?.stringValue || '',
      adminId: fields.adminId?.stringValue || '',
      membros: fields.membros?.arrayValue?.values?.map(v => v.stringValue) || [],
      contribuicaoMensal: Number(fields.contribuicaoMensal?.doubleValue || 0),
      diaVencimento: Number(fields.diaVencimento?.integerValue || 1),
      valorMulta: Number(fields.valorMulta?.doubleValue || 0),
      valorJuros: Number(fields.valorJuros?.doubleValue || 0),
      distribuicaoTipo: fields.distribuicaoTipo?.stringValue || 'padrao',
      duracaoMeses: Number(fields.duracaoMeses?.integerValue || 12),
      dataCriacao: new Date(fields._createTime?._seconds * 1000).toISOString(),
      status: fields.status?.stringValue || 'ativo'
    };
  }, []); // Sem dependências, pois a lógica é pura

  return processCaixinhaData;
};

export default useProcessCaixinhaData;