import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/axios';
import { User, AuthContextType } from '@/types/auth';

// 1. Inicializamos con el tipo correcto o undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await api.get('/me');
                setUser(response.data);
            } catch (error) {
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };
        if (localStorage.getItem('token')) checkUser();
        else setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post('/login', credentials);
        localStorage.setItem('token', response.data.access_token);
        const userRes = await api.get('/me');
        setUser(userRes.data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// 2. Este Hook ahora es seguro y no dará error de "undefined"
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};