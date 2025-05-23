// utils/formatters.js

/**
 * Formata um número de documento (CPF/CNPJ)
 * @param {string} value - Número do documento (apenas dígitos)
 * @param {string} type - Tipo do documento ('cpf' ou 'cnpj')
 * @returns {string} Documento formatado
 */
export const formatDocument = (value, type) => {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // CPF: XXX.XXX.XXX-XX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
      if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    } else {
      // CNPJ: XX.XXX.XXX/XXXX-XX
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
      if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
      if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
      return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
    }
  };
  
/**
 * Formata um CEP
 * @param {string} value - CEP (apenas dígitos)
 * @returns {string} CEP formatado
 */
export const formatCEP = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  /**
   * Formata um número de telefone
   * @param {string} value - Número de telefone (apenas dígitos)
   * @returns {string} Telefone formatado
   */
  export const formatPhone = (value) => {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // Se não tiver dígitos, retorna vazio
    if (!digits) return '';
  
    // Se começar com 0800 ou 0300
    if (digits.startsWith('0800') || digits.startsWith('0300')) {
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
    }
  
    // Telefone normal
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };
  
  // Função auxiliar para remover formatação
  export const stripFormatting = (value) => {
    return value.replace(/\D/g, '');
  };
  
/**
 * Format a number as currency
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (default: 'BRL')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'BRL') => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format a date to localized string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
};

/**
 * Format a number as percentage
 * @param {number} value - Value to format
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value) => {
  if (value === undefined || value === null) return '';
  return `${value}%`;
};

/**
 * Get appropriate color for loan status
 * @param {string} status - Loan status
 * @returns {string} MUI color name
 */
export const getLoanStatusColor = (status) => {
  if (!status) return 'default';
  
  switch (status.toLowerCase()) {
    case 'approved':
    case 'aprovado':
      return 'success';
    case 'pending':
    case 'pendente':
      return 'warning';
    case 'denied':
    case 'negado':
    case 'rejected':
    case 'rejected':
    case 'cancelled':
    case 'cancelado':
      return 'error';
    case 'paid':
    case 'pago':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Calculate installment value with interest
 * @param {number} totalValue - Total loan value
 * @param {number} numInstallments - Number of installments
 * @param {number} interestRate - Interest rate (percentage)
 * @returns {number} Installment value
 */
export const calculateInstallment = (totalValue, numInstallments, interestRate = 0) => {
  if (!numInstallments || numInstallments <= 0 || !totalValue) return 0;
  
  // Simple interest calculation
  const totalWithInterest = totalValue * (1 + (interestRate / 100));
  return totalWithInterest / numInstallments;
};

  // Exporta como default um objeto com todas as funções
  export default {
    formatDocument,
    formatPhone,
    stripFormatting,
    formatCEP,
    calculateInstallment,
    getLoanStatusColor,
    formatPercentage,
    formatDate,
    formatCurrency
  };