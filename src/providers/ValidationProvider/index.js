import React, {createContext, useContext, useMemo, useCallback, useReducer} from 'react';
import {useTranslation} from 'react-i18next';
import {validateDocument, validateEmail, validatePhone, validateCEP} from '../../utils/validation';
import {formatDocument, formatPhone, formatCEP} from '../../utils/formatters';
import {VALIDATION_ACTIONS} from '../../core/constants/actions';
import {initialValidationState} from '../../core/constants/initialState';
import {validationReducer} from '../../reducers/validation/validationReducer';

const ValidationContext = createContext(null);

export const ValidationProvider = ({children}) => {
    const {t} = useTranslation();
    const [state, dispatch] = useReducer(validationReducer, initialValidationState);

    // 🔹 Validação de conteúdo textual (evita spam, palavras ofensivas, etc.)
    const contentValidation = useCallback((text, options = {}) => {
        const {
            maxLength = 500,
            minLength = 0,
            forbiddenWords = [],
            requiredWords = [],
            customValidators = []
        } = options;

        const errors = [];

        if (!text) 
            return [t('validation.errors.required')];
        
        if (text.length > maxLength) 
            errors.push(t('validation.errors.maxLength', {maxLength}));
        if (text.length < minLength) 
            errors.push(t('validation.errors.minLength', {minLength}));
        
        const forbiddenWordsFound = forbiddenWords.filter(
            word => text.toLowerCase().includes(word.toLowerCase())
        );
        if (forbiddenWordsFound.length > 0) 
            errors.push(t('validation.errors.forbiddenWords'));
        
        const missingRequiredWords = requiredWords.filter(
            word => !text.toLowerCase().includes(word.toLowerCase())
        );
        if (missingRequiredWords.length > 0) 
            errors.push(t('validation.errors.missingRequiredWords'));
        
        customValidators.forEach(validator => {
            const validationResult = validator(text);
            if (validationResult) 
                errors.push(validationResult);
            }
        );

        return errors.length > 0
            ? errors
            : null;
    }, [t]);

    // 🔹 Função genérica para validação de campos de formulários
    const validateField = useCallback((value, type, options = {}) => {
        if (!value && !options.required) 
            return null;
        
        const validationStrategies = {
            email: () => validateEmail(value)
                ? null
                : t('validation.errors.invalidEmail'),
            cpf: () => validateDocument('cpf', value)
                ? null
                : t('validation.errors.invalidCPF'),
            cnpj: () => validateDocument('cnpj', value)
                ? null
                : t('validation.errors.invalidCNPJ'),
            phone: () => validatePhone(value)
                ? null
                : t('validation.errors.invalidPhone'),
            cep: () => validateCEP(value)
                ? null
                : t('validation.errors.invalidCEP'),
            url: () => {
                try {
                    new URL(value);
                    return null;
                } catch  {
                    return t('validation.errors.invalidURL');
                }
            },
            date: () => isNaN(new Date(value).getTime())
                ? t('validation.errors.invalidDate')
                : null,
            text: () => {
                const errors = contentValidation(value, options);
                return errors
                    ? errors.join('. ')
                    : null;
            },
            password: () => {
                const {
                    minLength = 8,
                    requireSpecialChar = true
                } = options;
                if (value.length < minLength) 
                    return t('validation.errors.passwordTooShort', {minLength});
                if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) 
                    return t('validation.errors.passwordNoSpecialChar');
                if (!/\d/.test(value)) 
                    return t('validation.errors.passwordNoNumber');
                if (!/[A-Z]/.test(value)) 
                    return t('validation.errors.passwordNoUppercase');
                return null;
            },
            // Nova validação para mensagens
            message: () => {
                const {
                    maxLength = 2000,
                    minLength = 1
                } = options;

                if (!value) 
                    return t('validation.errors.emptyMessage');
                if (value.length < minLength) 
                    return t('validation.errors.messageMinLength');
                if (value.length > maxLength) 
                    return t('validation.errors.messageMaxLength', {maxLength});
                
                // Validação de conteúdo opcional usando o contentValidation
                return null;
            },

            // Validação de destinatário
            recipient: () => {
                if (!value) 
                    return t('validation.errors.noRecipient');
                return null;
            }
        };

        return validationStrategies[type]
            ? validationStrategies[type]()
            : null;
    }, [t, contentValidation]);

    // 🔹 Validação de formulário completo
    const validateForm = useCallback(async (formData, schema) => {
        dispatch({type: VALIDATION_ACTIONS.SET_IS_VALIDATING, payload: true});
        const errors = new Map();

        try {
            for (const [fieldName, fieldSchema] of Object.entries(schema)) {
                const {
                    type,
                    required,
                    dependsOn,
                    customValidation,
                    ...options
                } = fieldSchema;
                const value = formData[fieldName];

                if (required && !value) {
                    errors.set(fieldName, t('validation.errors.required'));
                    continue;
                }

                if (dependsOn) {
                    const dependencyValue = formData[dependsOn.field];
                    if (dependsOn.condition(dependencyValue, value)) {
                        errors.set(
                            fieldName,
                            dependsOn.message || t('validation.errors.dependencyFailed')
                        );
                        continue;
                    }
                }

                const validationError = validateField(value, type, options);
                if (validationError) {
                    errors.set(fieldName, validationError);
                    continue;
                }

                if (customValidation) {
                    const customError = await customValidation(value, formData);
                    if (customError) 
                        errors.set(fieldName, customError);
                    }
                }
        } catch (error) {
            console.error('Validation error:', error);
            errors.set('_form', t('validation.errors.general'));
        } finally {
            dispatch({type: VALIDATION_ACTIONS.SET_ERRORS, payload: errors});
            dispatch({type: VALIDATION_ACTIONS.SET_IS_VALIDATING, payload: false});
        }

        return errors.size === 0;
    }, [t, validateField]);

    // 🔹 Formatação de campos (exemplo: CPF, telefone, CEP)
    const formatField = useCallback((value, type) => {
        const formatStrategies = {
            cpf: () => formatDocument(value, 'cpf'),
            cnpj: () => formatDocument(value, 'cnpj'),
            phone: () => formatPhone(value),
            cep: () => formatCEP(value)
        };

        return formatStrategies[type]
            ? formatStrategies[type]()
            : value;
    }, []);

    // 🔹 Define um campo como "sujo" (dirty) quando alterado pelo usuário
    const setFieldDirty = useCallback((fieldName) => {
        dispatch({
            type: VALIDATION_ACTIONS.SET_DIRTY_FIELDS,
            payload: new Set([
                ...state.dirtyFields,
                fieldName
            ])
        });
    }, [dispatch, state.dirtyFields]);

    // 🔹 Reseta a validação do formulário
    const resetValidation = useCallback(() => {
        dispatch({type: VALIDATION_ACTIONS.RESET_VALIDATION});
    }, [dispatch]);

    // 🔹 Expor o contexto de validação para os componentes filhos
    const value = useMemo(() => ({
        errors: state.errors,
        dirtyFields: state.dirtyFields,
        isValidating: state.isValidating,
        validateField,
        validateForm,
        validateContent: contentValidation,
        formatField,
        setFieldDirty,
        resetValidation,
        hasErrors: state.errors.size > 0
    }), [
        state,
        validateField,
        validateForm,
        contentValidation,
        formatField,
        setFieldDirty,
        resetValidation
    ]);

    return (
        <ValidationContext.Provider value={value}>
            {children}
        </ValidationContext.Provider>
    );
};

// 🔹 Hook personalizado para acessar o contexto de validação
export const useValidation = () => {
    const context = useContext(ValidationContext);
    if (!context) {
        throw new Error("useValidation deve ser usado dentro de um ValidationProvider");
    }
    return context;
};
