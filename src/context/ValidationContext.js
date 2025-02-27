// // src/context/ValidationContext.js
// import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { validateDocument, validateEmail, validatePhone, validateCEP } from '../utils/validation';
// import { formatDocument, formatPhone, formatCEP } from '../utils/formatters';

// // Creating our validation context
// const ValidationContext = createContext();

// export const ValidationProvider = ({ children }) => {
//   const { t } = useTranslation();
//   const [validationState, setValidationState] = useState({
//     errors: new Map(),
//     dirtyFields: new Set(),
//     isValidating: false
//   });

//   // Content validation rules - including profanity, sentiment, and length checks
//   const contentValidation = useCallback((text, options = {}) => {
//     const {
//       maxLength = 500,
//       minLength = 0,
//       type = 'general',
//       forbiddenWords = [],
//       requiredWords = [],
//       customValidators = []
//     } = options;

//     const errors = [];

//     // Basic length validation
//     if (text.length > maxLength) {
//       errors.push(t('validation.errors.maxLength', { maxLength }));
//     }
//     if (text.length < minLength) {
//       errors.push(t('validation.errors.minLength', { minLength }));
//     }

//     // Forbidden words check
//     const forbiddenWordsFound = forbiddenWords.filter(word =>
//       text.toLowerCase().includes(word.toLowerCase())
//     );
//     if (forbiddenWordsFound.length > 0) {
//       errors.push(t('validation.errors.forbiddenWords'));
//     }

//     // Required words check
//     const missingRequiredWords = requiredWords.filter(word =>
//       !text.toLowerCase().includes(word.toLowerCase())
//     );
//     if (missingRequiredWords.length > 0) {
//       errors.push(t('validation.errors.missingRequiredWords'));
//     }

//     // Sentiment analysis for excessive negativity
//     const negativeWords = ['péssimo', 'horrível', 'terrível', 'odioso', 'detestável'];
//     const negativeCount = negativeWords.reduce((count, word) =>
//       count + (text.toLowerCase().match(new RegExp(word, 'g')) || []).length, 0
//     );
//     if (negativeCount > 3) {
//       errors.push(t('validation.errors.excessiveNegativity'));
//     }

//     // Content type specific validation
//     if (type === 'description') {
//       if (!/^[^!@#$%^&*()]+$/.test(text)) {
//         errors.push(t('validation.errors.invalidCharacters'));
//       }
//     }

//     // Run custom validators
//     customValidators.forEach(validator => {
//       const validationResult = validator(text);
//       if (validationResult) {
//         errors.push(validationResult);
//       }
//     });

//     return errors;
//   }, [t]);

//   // Field validation with support for multiple types and formats
//   const validateField = useCallback((value, type, options = {}) => {
//     if (!value && !options.required) {
//       return null;
//     }

//     switch (type) {
//       case 'email':
//         return validateEmail(value)
//           ? null
//           : t('validation.errors.invalidEmail');

//       case 'cpf':
//         return validateDocument('cpf', value)
//           ? null
//           : t('validation.errors.invalidCPF');

//       case 'cnpj':
//         return validateDocument('cnpj', value)
//           ? null
//           : t('validation.errors.invalidCNPJ');

//       case 'phone':
//         return validatePhone(value)
//           ? null
//           : t('validation.errors.invalidPhone');

//       case 'cep':
//         return validateCEP(value)
//           ? null
//           : t('validation.errors.invalidCEP');

//       case 'password':
//         const { minLength = 8, requireSpecialChar = true } = options;
//         if (value.length < minLength) {
//           return t('validation.errors.passwordTooShort', { minLength });
//         }
//         if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
//           return t('validation.errors.passwordNoSpecialChar');
//         }
//         if (!/\d/.test(value)) {
//           return t('validation.errors.passwordNoNumber');
//         }
//         if (!/[A-Z]/.test(value)) {
//           return t('validation.errors.passwordNoUppercase');
//         }
//         return null;

//       case 'text':
//         const errors = contentValidation(value, options);
//         return errors.length > 0 ? errors.join('. ') : null;

//       case 'url':
//         try {
//           new URL(value);
//           return null;
//         } catch {
//           return t('validation.errors.invalidURL');
//         }

//       case 'date':
//         const date = new Date(value);
//         return isNaN(date.getTime())
//           ? t('validation.errors.invalidDate')
//           : null;

//       default:
//         if (options.pattern && !options.pattern.test(value)) {
//           return t('validation.errors.patternMismatch');
//         }
//         return null;
//     }
//   }, [t, contentValidation]);

//   // Form validation with support for field dependencies and custom rules
//   const validateForm = useCallback(async (formData, schema) => {
//     setValidationState(prev => ({ ...prev, isValidating: true }));
//     const errors = new Map();

//     try {
//       for (const [fieldName, fieldSchema] of Object.entries(schema)) {
//         const {
//           type,
//           required,
//           dependsOn,
//           customValidation,
//           ...options
//         } = fieldSchema;

//         const value = formData[fieldName];

//         // Check required fields
//         if (required && !value) {
//           errors.set(fieldName, t('validation.errors.required'));
//           continue;
//         }

//         // Check field dependencies
//         if (dependsOn) {
//           const dependencyValue = formData[dependsOn.field];
//           if (dependsOn.condition(dependencyValue, value)) {
//             errors.set(fieldName, dependsOn.message || t('validation.errors.dependencyFailed'));
//             continue;
//           }
//         }

//         // Run standard validation
//         const validationError = validateField(value, type, options);
//         if (validationError) {
//           errors.set(fieldName, validationError);
//           continue;
//         }

//         // Run custom validation if provided
//         if (customValidation) {
//           const customError = await customValidation(value, formData);
//           if (customError) {
//             errors.set(fieldName, customError);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Validation error:', error);
//       errors.set('_form', t('validation.errors.general'));
//     } finally {
//       setValidationState(prev => ({
//         ...prev,
//         errors,
//         isValidating: false
//       }));
//     }

//     return errors.size === 0;
//   }, [t, validateField]);

//   // Format fields according to their type
//   const formatField = useCallback((value, type) => {
//     switch (type) {
//       case 'cpf':
//       case 'cnpj':
//         return formatDocument(value, type);
//       case 'phone':
//         return formatPhone(value);
//       case 'cep':
//         return formatCEP(value);
//       default:
//         return value;
//     }
//   }, []);

//   // Mark field as dirty (user has interacted with it)
//   const setFieldDirty = useCallback((fieldName) => {
//     setValidationState(prev => ({
//       ...prev,
//       dirtyFields: new Set([...prev.dirtyFields, fieldName])
//     }));
//   }, []);

//   // Reset validation state
//   const resetValidation = useCallback(() => {
//     setValidationState({
//       errors: new Map(),
//       dirtyFields: new Set(),
//       isValidating: false
//     });
//   }, []);

//   // Context value with proper memoization
//   const value = useMemo(() => ({
//     errors: validationState.errors,
//     dirtyFields: validationState.dirtyFields,
//     isValidating: validationState.isValidating,
//     validateField,
//     validateForm,
//     validateContent: contentValidation,
//     formatField,
//     setFieldDirty,
//     resetValidation,
//     hasErrors: validationState.errors.size > 0
//   }), [
//     validationState,
//     validateField,
//     validateForm,
//     contentValidation,
//     formatField,
//     setFieldDirty,
//     resetValidation
//   ]);

//   return (
//     <ValidationContext.Provider value={value}>
//       {children}
//     </ValidationContext.Provider>
//   );
// };

// // Custom hook for using the validation context
// export const useValidation = () => {
//   const context = useContext(ValidationContext);
//   if (context === undefined) {
//     throw new Error('useValidation must be used within a ValidationProvider');
//   }
//   return context;
// };