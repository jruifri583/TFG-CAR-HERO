import { useState, useEffect, type ReactNode } from 'react';
import api from '@/lib/axios';
import { AuthContext } from '@/context/AuthContext';
import { type User, type LoginCredentials } from '@/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Función auxiliar para configurar la sesión
    const setSession = (token: string | null) => {
        if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    // 1. Verificar usuario al cargar la app
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setSession(token);
                const response = await api.get<User>('/me');
                setUser(response.data);
            } catch (error) {
                console.error("Token inválido o expirado");
                setSession(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    // 2. Login Tradicional (Email/Password)
    const login = async (credentials: LoginCredentials) => {
        const response = await api.post<{ token: string }>('/login', credentials);
        const token = response.data.token;

        setSession(token);
        
        const userRes = await api.get<User>('/me');
        setUser(userRes.data);
    };

    // 3. Login de Google (Para usarlo desde Register/Login.tsx)
    // Recibe el token que devuelve tu controlador de Laravel
    const loginWithGoogle = async (token: string, userData: User) => {
        setSession(token);
        setUser(userData);
    };

    const logout = () => {
        setSession(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser, loginWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
};
