import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type User = any | null;

type AuthContextType = {
    user: User;
    token: string | null;
    loading: boolean;
    login: (userData: any, userToken: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updatedUser: any) => void;
    // Drop-in replacement for fetch() on any authenticated request:
    // - automatically attaches Authorization: Bearer <token>
    // - if the server responds 401 (expired/invalid token), logs out and
    //   redirects to /login instead of leaving the screen showing a generic error
    authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const defaultAuthContext: AuthContextType = {
    user: null,
    token: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
    updateUser: () => {},
    authFetch: async () => {
        throw new Error('authFetch called outside AuthProvider');
    },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    

    // authFetch reads the latest token via this ref rather than closing over
    // the `token` state directly, so it always has the current value even if
    // called from a stale closure (e.g. a setTimeout created a while ago).
    const tokenRef = useRef<string | null>(null);
    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

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

    // Guards against multiple simultaneous 401s (e.g. 3 screens fetching at
    // once after the token expired) all trying to logout/redirect at the same time.
    const loggingOutRef = useRef(false);

    const authFetch = async (url: string, options: RequestInit = {}) => {
        const headers = {
            ...(options.headers || {}),
            ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
        };

        const res = await fetch(url, { ...options, headers });

        if (res.status === 401 && !loggingOutRef.current) {
            loggingOutRef.current = true;
            await logout();
            router.replace('/login');
            // reset after a tick so a later, legitimate 401 (new session) can trigger again
            setTimeout(() => {
                loggingOutRef.current = false;
            }, 1000);
        }

        return res;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);