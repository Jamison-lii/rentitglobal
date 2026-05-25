import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = any | null;

type AuthContextType = {
    user: User;
    token: string | null;
    loading: boolean;
    login: (userData: any, userToken: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updatedUser: any) => void;
};

const defaultAuthContext: AuthContextType = {
    user: null,
    token: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
    updateUser: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user and token from storage when app starts
    useEffect(() => {
        const loadAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error('Failed to load auth:', err);
            } finally {
                setLoading(false);
            }
        };

        loadAuth();
    }, []);

    const login = async (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        await AsyncStorage.setItem('token', userToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);