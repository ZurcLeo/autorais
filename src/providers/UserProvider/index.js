// src/providers/user/UserProvider.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { userService } from '../../services/user';
import { coreLogger } from '../../core/logging';
import { useCoreState } from '../../core/states/CoreStateManager';
import { useAuth } from '../AuthProvider';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const { user: authUser } = useAuth();
    const { dispatch } = useCoreState();
    
    const [state, setState] = useState({
        isLoading: true,
        isInitialized: false,
        currentProfile: null,
        error: null
    });

    useEffect(() => {
        const initializeUser = async () => {
            try {
                // Inicia o serviço
                await userService.start();

                // Se há usuário autenticado, carrega o perfil
                if (authUser) {
                    const profile = await userService.getCurrentProfile();
                    
                    setState({
                        isLoading: false,
                        isInitialized: true,
                        currentProfile: profile,
                        error: null
                    });

                    // Notifica o core state sobre disponibilidade
                    dispatch({
                        type: 'SERVICE_READY',
                        service: 'user',
                        data: { profile }
                    });
                } else {
                    setState({
                        isLoading: false,
                        isInitialized: true,
                        currentProfile: null,
                        error: null
                    });
                }
            } catch (error) {
                coreLogger.logServiceError('UserProvider', error, {
                    context: 'initialization'
                });

                setState({
                    isLoading: false,
                    isInitialized: true,
                    currentProfile: null,
                    error
                });

                // Notifica o core state sobre o erro
                dispatch({
                    type: 'SERVICE_ERROR',
                    service: 'user',
                    error
                });
            }
        };

        initializeUser();

        // Cleanup
        return () => {
            userService.stop().catch(error => {
                coreLogger.logServiceError('UserProvider', error, {
                    context: 'cleanup'
                });
            });
        };
    }, [authUser, dispatch]);

    const updateProfile = async (data) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
            
            const profile = await userService.updateProfile(
                state.currentProfile.id,
                data
            );
            
            setState(prev => ({
                ...prev,
                isLoading: false,
                currentProfile: profile,
                error: null
            }));

            // Notifica o core state sobre a atualização
            dispatch({
                type: 'SERVICE_UPDATE',
                service: 'user',
                data: { profile }
            });

            return profile;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error
            }));

            throw error;
        }
    };

    const value = {
        ...state,
        updateProfile
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};