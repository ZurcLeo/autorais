// src/utils/securityValidation.js

/**
 * Enhanced security validation utilities
 * Prevents injection attacks and validates sensitive data
 */

/**
 * Sanitizes input to prevent XSS and injection attacks
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Validates and sanitizes monetary values
 * @param {any} value - Value to validate
 * @returns {number|null} Sanitized number or null if invalid
 */
export const sanitizeMonetaryValue = (value) => {
  if (value === null || value === undefined) return null;
  
  const numValue = parseFloat(value);
  
  // Check if it's a valid number
  if (isNaN(numValue)) return null;
  
  // Check reasonable bounds (0 to 1 million)
  if (numValue < 0 || numValue > 1000000) return null;
  
  // Round to 2 decimal places
  return Math.round(numValue * 100) / 100;
};

/**
 * Enhanced CPF validation with security checks
 * @param {string} cpf - CPF to validate
 * @returns {boolean} True if valid and secure
 */
export const validateCPFSecure = (cpf) => {
  if (!cpf || typeof cpf !== 'string') return false;
  
  // Sanitize input
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Check length
  if (cleanCPF.length !== 11) return false;
  
  // Check for repeated digits (security issue)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Check for known invalid patterns
  const invalidPatterns = [
    '00000000000', '11111111111', '22222222222',
    '33333333333', '44444444444', '55555555555',
    '66666666666', '77777777777', '88888888888',
    '99999999999'
  ];
  
  if (invalidPatterns.includes(cleanCPF)) return false;
  
  // Calculate verification digits
  const digits = cleanCPF.split('').map(Number);
  
  // First digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (digits[9] !== firstDigit) return false;
  
  // Second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return digits[10] === secondDigit;
};

/**
 * Enhanced CNPJ validation with security checks
 * @param {string} cnpj - CNPJ to validate
 * @returns {boolean} True if valid and secure
 */
export const validateCNPJSecure = (cnpj) => {
  if (!cnpj || typeof cnpj !== 'string') return false;
  
  // Sanitize input
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Check length
  if (cleanCNPJ.length !== 14) return false;
  
  // Check for repeated digits
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  const digits = cleanCNPJ.split('').map(Number);
  
  // First verification digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (digits[12] !== firstDigit) return false;
  
  // Second verification digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return digits[13] === secondDigit;
};

/**
 * Enhanced email validation with security checks
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid and secure
 */
export const validateEmailSecure = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  // Sanitize input
  const cleanEmail = email.trim().toLowerCase();
  
  // Length check
  if (cleanEmail.length > 254) return false;
  
  // Basic format check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(cleanEmail)) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,           // Double dots
    /^\./,            // Starting with dot
    /\.$@/,           // Ending with dot before @
    /@\./,            // @ followed by dot
    /@.*@/,           // Multiple @ symbols
    /[<>]/,           // HTML tags
    /javascript:/i,   // JavaScript protocol
    /['"]/            // Quotes
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(cleanEmail));
};

/**
 * Validates cardholder name with security checks
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid and secure
 */
export const validateCardholderNameSecure = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  const cleanName = name.trim();
  
  // Length checks
  if (cleanName.length < 2 || cleanName.length > 100) return false;
  
  // Only allow letters, spaces, apostrophes, and hyphens
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(cleanName)) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /[<>]/,           // HTML tags
    /javascript:/i,   // JavaScript protocol
    /\b(script|eval|function)\b/i, // Script keywords
    /[0-9]{4,}/,      // Long number sequences
    /^\s*$/           // Only whitespace
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(cleanName));
};

/**
 * Logs sensitive operations safely (without exposing data)
 * @param {string} operation - Operation name
 * @param {Object} metadata - Safe metadata to log
 */
export const logSecureOperation = (operation, metadata = {}) => {
  const timestamp = new Date().toISOString();
  const safeLog = {
    timestamp,
    operation,
    ...metadata,
    // Never log sensitive data
    userAgent: navigator.userAgent.substring(0, 100),
    url: window.location.pathname
  };
  
  console.log(`🔒 SECURE_OP: ${operation}`, safeLog);
};

/**
 * Rate limiting for sensitive operations
 */
class RateLimiter {
  constructor() {
    this.operations = new Map();
  }
  
  /**
   * Check if operation is allowed
   * @param {string} operation - Operation name
   * @param {number} maxAttempts - Max attempts per window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} True if allowed
   */
  isAllowed(operation, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const key = operation;
    
    if (!this.operations.has(key)) {
      this.operations.set(key, { attempts: 1, windowStart: now });
      return true;
    }
    
    const data = this.operations.get(key);
    
    // Reset window if expired
    if (now - data.windowStart > windowMs) {
      this.operations.set(key, { attempts: 1, windowStart: now });
      return true;
    }
    
    // Check if within limits
    if (data.attempts < maxAttempts) {
      data.attempts++;
      return true;
    }
    
    return false;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Content Security Policy helper
 * @returns {Object} CSP configuration
 */
export const getCSPConfig = () => ({
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for MercadoPago SDK
    'https://secure.mlstatic.com',
    'https://www.mercadopago.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:'
  ],
  'connect-src': [
    "'self'",
    'https://api.mercadopago.com',
    'https://api.mercadolibre.com'
  ],
  'frame-src': [
    "'self'",
    'https://www.mercadopago.com'
  ]
});

export default {
  sanitizeInput,
  sanitizeMonetaryValue,
  validateCPFSecure,
  validateCNPJSecure,
  validateEmailSecure,
  validateCardholderNameSecure,
  logSecureOperation,
  rateLimiter,
  getCSPConfig
};