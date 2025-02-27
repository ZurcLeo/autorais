// utils/validation.js

/**
 * Calcula dígito verificador do CPF/CNPJ
 * @param {string[]} digits - Array de dígitos
 * @param {number[]} weights - Pesos para cálculo
 * @returns {number} Dígito verificador
 */
const calculateDigit = (digits, weights) => {
  const sum = digits.reduce((acc, digit, index) => {
    return acc + (digit * weights[index]);
  }, 0);
  
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};


// Função auxiliar para validar números positivos
const isPositiveNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};

// Função auxiliar para validar datas
const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Valida os dados de uma Caixinha antes da criação ou atualização
 * @param {Object} data - Dados da Caixinha a serem validados
 * @returns {Object} Objeto com propriedades success e errors
 */
export const validateCaixinhaData = (data) => {
  const errors = {};
  
  // Validação do nome
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Nome da Caixinha é obrigatório';
  } else if (data.name.length < 3 || data.name.length > 100) {
    errors.name = 'Nome deve ter entre 3 e 100 caracteres';
  }

  // Validação da descrição
  if (data.description && typeof data.description !== 'string') {
    errors.description = 'Descrição deve ser um texto válido';
  } else if (data.description && data.description.length > 500) {
    errors.description = 'Descrição não pode exceder 500 caracteres';
  }

  // Validação do adminId
  if (!data.adminId || typeof data.adminId !== 'string') {
    errors.adminId = 'ID do administrador é obrigatório';
  }

  // Validação dos membros
  if (data.members && !Array.isArray(data.members)) {
    errors.members = 'Lista de membros deve ser um array';
  }

  // Validação da contribuição mensal
  if (!isPositiveNumber(data.contribuicaoMensal)) {
    errors.contribuicaoMensal = 'Valor da contribuição mensal deve ser um número positivo';
  }

  // Validação do dia de vencimento
  if (!Number.isInteger(data.diaVencimento) || data.diaVencimento < 1 || data.diaVencimento > 31) {
    errors.diaVencimento = 'Dia de vencimento deve ser um número entre 1 e 31';
  }

  // Validação de multa e juros
  if (data.valorMulta && !isPositiveNumber(data.valorMulta)) {
    errors.valorMulta = 'Valor da multa deve ser um número positivo';
  }

  if (data.valorJuros && !isPositiveNumber(data.valorJuros)) {
    errors.valorJuros = 'Valor dos juros deve ser um número positivo';
  }

  // Validação do tipo de distribuição
  const tiposDistribuicaoValidos = ['padrão', 'proporcional', 'personalizado'];
  if (!tiposDistribuicaoValidos.includes(data.distribuicaoTipo)) {
    errors.distribuicaoTipo = 'Tipo de distribuição inválido';
  }

  // Validação da duração
  if (!Number.isInteger(data.duracaoMeses) || data.duracaoMeses < 1 || data.duracaoMeses > 60) {
    errors.duracaoMeses = 'Duração deve ser um número inteiro entre 1 e 60 meses';
  }

  // Validação da data de criação
  if (data.dataCriacao && !isValidDate(data.dataCriacao)) {
    errors.dataCriacao = 'Data de criação inválida';
  }

  // Validação dos dados bancários
  if (data.bankAccountActive) {
    if (!Array.isArray(data.bankAccountData) || data.bankAccountData.length === 0) {
      errors.bankAccountData = 'Dados bancários são obrigatórios quando a conta está ativa';
    }
  }

  // Verifica se há erros de validação
  const hasErrors = Object.keys(errors).length > 0;

  return {
    success: !hasErrors,
    errors: hasErrors ? errors : null
  };
};

/**
 * Valida um número de CPF
 * @param {string} cpf - Número do CPF (apenas dígitos)
 * @returns {boolean} true se o CPF é válido
 */
const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica tamanho
  if (cleanCPF.length !== 11) return false;
  
  // Verifica dígitos repetidos
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Converte para array de números
  const digits = cleanCPF.split('').map(Number);
  
  // Verifica primeiro dígito
  const firstDigit = calculateDigit(
    digits.slice(0, 9),
    [10, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  if (digits[9] !== firstDigit) return false;
  
  // Verifica segundo dígito
  const secondDigit = calculateDigit(
    digits.slice(0, 10),
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  if (digits[10] !== secondDigit) return false;
  
  return true;
};

/**
 * Valida um número de CNPJ
 * @param {string} cnpj - Número do CNPJ (apenas dígitos)
 * @returns {boolean} true se o CNPJ é válido
 */
const validateCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica tamanho
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica dígitos repetidos
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Converte para array de números
  const digits = cleanCNPJ.split('').map(Number);
  
  // Verifica primeiro dígito
  const firstDigit = calculateDigit(
    digits.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  if (digits[12] !== firstDigit) return false;
  
  // Verifica segundo dígito
  const secondDigit = calculateDigit(
    digits.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  if (digits[13] !== secondDigit) return false;
  
  return true;
};

/**
 * Valida um documento (CPF ou CNPJ)
 * @param {string} type - Tipo do documento ('cpf' ou 'cnpj')
 * @param {string} number - Número do documento
 * @returns {boolean} true se o documento é válido
 */
export const validateDocument = (type, number) => {
  try {
    // Verifica se os parâmetros são válidos
    if (!type || !number) return false;
    if (!['cpf', 'cnpj'].includes(type.toLowerCase())) return false;

    // Remove caracteres não numéricos
    const cleanNumber = number.replace(/\D/g, '');
    
    // Valida de acordo com o tipo
    return type.toLowerCase() === 'cpf' 
      ? validateCPF(cleanNumber)
      : validateCNPJ(cleanNumber);
  } catch (error) {
    console.error('Error validating document:', error);
    return false;
  }
};

/**
 * Valida um CEP
 * @param {string} cep - Número do CEP
 * @returns {boolean} true se o CEP é válido
 */
export const validateCEP = (cep) => {
  const cleanCEP = cep.replace(/\D/g, '');
  return /^[0-9]{8}$/.test(cleanCEP);
};

/**
 * Valida um e-mail
 * @param {string} email - Endereço de e-mail
 * @returns {boolean} true se o e-mail é válido
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida um número de telefone
 * @param {string} phone - Número de telefone
 * @returns {boolean} true se o telefone é válido
 */
export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  // Aceita números de telefone fixo e celular (com ou sem DDD)
  return /^(?:[1-9]{2})?(?:[2-9][0-9]{7,8})$/.test(cleanPhone);
};

// Exporta todas as funções de validação
export default {
  validateDocument,
  validateCEP,
  validateEmail,
  validatePhone,
  validateCaixinhaData
};