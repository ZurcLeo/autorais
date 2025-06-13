// src/utils/mercadoPagoUtils.js

/**
 * Utility functions for MercadoPago integration
 */

/**
 * Initializes MercadoPago SDK V2 properly
 * @returns {Promise<object|null>} MercadoPago instance or null if failed
 */
export const initializeMercadoPago = async () => {
  // Check if MercadoPago SDK is available
  if (typeof window === 'undefined' || !window.MercadoPago) {
    console.warn('MercadoPago SDK not available');
    return null;
  }

  try {
    const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
    
    if (!publicKey) {
      console.warn('MercadoPago public key not found in environment variables');
      return null;
    }

    // Initialize MercadoPago SDK V2 with proper configuration
    const mp = new window.MercadoPago(publicKey, {
      locale: 'pt-BR' // Set proper locale for Brazil
    });
    
    console.log('MercadoPago SDK V2 initialized successfully');
    return mp;
  } catch (error) {
    console.error('Error initializing MercadoPago SDK V2:', error);
    return null;
  }
};

/**
 * Generates a device ID using MercadoPago SDK V2
 * Note: In SDK V2, deviceId is automatically handled when creating card tokens
 * This function provides compatibility for backend requirements
 * @returns {Promise<string>} Device ID
 */
export const generateDeviceId = async () => {
  try {
    // Wait for SDK to be available
    const sdkAvailable = await waitForMercadoPagoSDK(5000);
    if (!sdkAvailable) {
      console.warn('MercadoPago SDK timeout, using fallback device ID');
      return generateFallbackDeviceId();
    }

    // Initialize MercadoPago
    const mp = await initializeMercadoPago();
    if (!mp) {
      console.warn('Failed to initialize MercadoPago, using fallback device ID');
      return generateFallbackDeviceId();
    }

    // In SDK V2, device ID is automatically managed
    // We generate a session-based ID for backend compatibility
    const sessionId = generateSessionId();
    
    // Store MP instance globally for potential card tokenization
    window.__mercadoPagoInstance = mp;
    
    console.log('MercadoPago session ID generated for device identification:', sessionId);
    return sessionId;
    
  } catch (error) {
    console.error('Error generating MercadoPago device ID:', error);
    return generateFallbackDeviceId();
  }
};

/**
 * Generates a session-based device ID for MercadoPago V2
 * @returns {string} Session ID
 */
export const generateSessionId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const userAgent = navigator.userAgent ? btoa(navigator.userAgent).substr(0, 8) : 'unknown';
  
  // Format compatible with MercadoPago expectations
  return `MP_${timestamp}_${random}_${userAgent}`;
};

/**
 * Generates a fallback device ID when MercadoPago SDK is not available
 * @returns {string} Fallback device ID
 */
export const generateFallbackDeviceId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const userAgent = navigator.userAgent ? btoa(navigator.userAgent).substr(0, 8) : 'unknown';
  
  return `DEVICE_${timestamp}_${random}_${userAgent}`;
};

/**
 * Checks if MercadoPago SDK is loaded and ready to use
 * @returns {boolean} True if SDK is available
 */
export const isMercadoPagoSDKAvailable = () => {
  return typeof window !== 'undefined' && window.MercadoPago && typeof window.MercadoPago === 'function';
};

/**
 * Creates a card token using MercadoPago SDK V2
 * @param {object} cardData - Card information
 * @returns {Promise<object>} Token data with device ID automatically included
 */
export const createCardToken = async (cardData) => {
  try {
    // Get or initialize MercadoPago instance
    let mp = window.__mercadoPagoInstance;
    if (!mp) {
      mp = await initializeMercadoPago();
      if (!mp) {
        throw new Error('Failed to initialize MercadoPago SDK');
      }
      window.__mercadoPagoInstance = mp;
    }

    // Validate required card data
    if (!cardData.cardNumber || !cardData.securityCode || !cardData.expirationMonth || !cardData.expirationYear) {
      throw new Error('Missing required card data');
    }

    // Create card token using SDK V2 - deviceId is automatically included
    const token = await mp.createCardToken({
      cardNumber: cardData.cardNumber,
      securityCode: cardData.securityCode,
      expirationMonth: cardData.expirationMonth,
      expirationYear: cardData.expirationYear,
      cardholder: {
        name: cardData.cardholderName,
        identification: {
          type: cardData.identificationType || 'CPF',
          number: cardData.identificationNumber
        }
      }
    });

    console.log('Card token created successfully with automatic device ID');
    return token;
    
  } catch (error) {
    console.error('Error creating card token:', error);
    throw error;
  }
};

/**
 * Gets payment methods using MercadoPago SDK V2
 * @returns {Promise<array>} Available payment methods
 */
export const getPaymentMethods = async () => {
  try {
    // Get or initialize MercadoPago instance
    let mp = window.__mercadoPagoInstance;
    if (!mp) {
      mp = await initializeMercadoPago();
      if (!mp) {
        throw new Error('Failed to initialize MercadoPago SDK');
      }
      window.__mercadoPagoInstance = mp;
    }

    const paymentMethods = await mp.getPaymentMethods();
    return paymentMethods;
    
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

/**
 * Gets identification types using MercadoPago SDK V2
 * @returns {Promise<array>} Available identification types
 */
export const getIdentificationTypes = async () => {
  try {
    // Get or initialize MercadoPago instance
    let mp = window.__mercadoPagoInstance;
    if (!mp) {
      mp = await initializeMercadoPago();
      if (!mp) {
        throw new Error('Failed to initialize MercadoPago SDK');
      }
      window.__mercadoPagoInstance = mp;
    }

    const identificationTypes = await mp.getIdentificationTypes();
    return identificationTypes;
    
  } catch (error) {
    console.error('Error getting identification types:', error);
    throw error;
  }
};

/**
 * Validates card data before tokenization
 * @param {object} cardData - Card information to validate
 * @returns {object} Validation result
 */
export const validateCardData = (cardData) => {
  const errors = [];
  const warnings = [];

  // Validate card number
  const cleanCardNumber = cardData.cardNumber?.replace(/\s/g, '') || '';
  if (!cleanCardNumber) {
    errors.push('Card number is required');
  } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    errors.push('Card number must be between 13 and 19 digits');
  } else if (!/^\d+$/.test(cleanCardNumber)) {
    errors.push('Card number must contain only digits');
  }

  // Validate expiration month
  const month = cardData.expirationMonth;
  if (!month) {
    errors.push('Expiration month is required');
  } else if (!/^\d{1,2}$/.test(month) || parseInt(month) < 1 || parseInt(month) > 12) {
    errors.push('Invalid expiration month');
  }

  // Validate expiration year
  const year = cardData.expirationYear;
  const currentYear = new Date().getFullYear();
  if (!year) {
    errors.push('Expiration year is required');
  } else if (!/^\d{4}$/.test(year) || parseInt(year) < currentYear) {
    errors.push('Invalid expiration year');
  }

  // Validate security code
  const cvv = cardData.securityCode;
  if (!cvv) {
    errors.push('Security code is required');
  } else if (!/^\d{3,4}$/.test(cvv)) {
    errors.push('Security code must be 3 or 4 digits');
  }

  // Validate cardholder name
  const name = cardData.cardholderName?.trim();
  if (!name) {
    errors.push('Cardholder name is required');
  } else if (name.length < 3) {
    errors.push('Cardholder name must be at least 3 characters');
  }

  // Validate identification
  const idNumber = cardData.identificationNumber?.replace(/\D/g, '') || '';
  const idType = cardData.identificationType;
  
  if (!idNumber) {
    errors.push('Identification number is required');
  } else if (idType === 'CPF' && idNumber.length !== 11) {
    errors.push('CPF must have 11 digits');
  } else if (idType === 'CNPJ' && idNumber.length !== 14) {
    errors.push('CNPJ must have 14 digits');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cardBrand: detectCardBrand(cleanCardNumber)
  };
};

/**
 * Detects card brand from card number
 * @param {string} cardNumber - Clean card number
 * @returns {string} Card brand
 */
export const detectCardBrand = (cardNumber) => {
  if (!cardNumber) return 'unknown';

  // Visa
  if (/^4/.test(cardNumber)) return 'visa';
  
  // Mastercard
  if (/^5[1-5]/.test(cardNumber) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(cardNumber)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(cardNumber)) return 'amex';
  
  // Diners Club
  if (/^3[0689]/.test(cardNumber)) return 'diners';
  
  // Discover
  if (/^6/.test(cardNumber)) return 'discover';
  
  // Elo (Brazil)
  if (/^(4011|4312|4389|4514|4573|6277|6362|6363|6550|6551)/.test(cardNumber)) {
    return 'elo';
  }
  
  // Hipercard (Brazil)
  if (/^(3841|6062)/.test(cardNumber)) return 'hipercard';

  return 'unknown';
};

/**
 * Gets installment options for a card and amount
 * @param {string} cardToken - Card token
 * @param {number} amount - Payment amount
 * @returns {Promise<array>} Installment options
 */
export const getInstallments = async (cardToken, amount) => {
  try {
    // Get or initialize MercadoPago instance
    let mp = window.__mercadoPagoInstance;
    if (!mp) {
      mp = await initializeMercadoPago();
      if (!mp) {
        throw new Error('Failed to initialize MercadoPago SDK');
      }
      window.__mercadoPagoInstance = mp;
    }

    const installments = await mp.getInstallments({
      amount: amount.toString(),
      bin: cardToken.first_six_digits,
      payment_method_id: cardToken.payment_method_id
    });

    return installments;
    
  } catch (error) {
    console.error('Error getting installments:', error);
    throw error;
  }
};

/**
 * Gets issuer information for a card
 * @param {string} paymentMethodId - Payment method ID
 * @param {string} bin - Card BIN (first 6 digits)
 * @returns {Promise<array>} Issuer information
 */
export const getIssuers = async (paymentMethodId, bin) => {
  try {
    // Get or initialize MercadoPago instance
    let mp = window.__mercadoPagoInstance;
    if (!mp) {
      mp = await initializeMercadoPago();
      if (!mp) {
        throw new Error('Failed to initialize MercadoPago SDK');
      }
      window.__mercadoPagoInstance = mp;
    }

    const issuers = await mp.getIssuers({
      payment_method_id: paymentMethodId,
      bin: bin
    });

    return issuers;
    
  } catch (error) {
    console.error('Error getting issuers:', error);
    throw error;
  }
};

/**
 * Waits for MercadoPago SDK to be loaded
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<boolean>} True if SDK is loaded, false if timeout
 */
export const waitForMercadoPagoSDK = (timeout = 5000) => {
  return new Promise((resolve) => {
    if (isMercadoPagoSDKAvailable()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isMercadoPagoSDKAvailable()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
};