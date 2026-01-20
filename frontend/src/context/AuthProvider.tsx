import { useState, useEffect, type ReactNode } from 'react';
import api from '@/lib/axios';
import { AuthContext } from './AuthContext';
import { type User, type LoginCredentials } from '@/types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await api.get<User>('/me');
                setUser(response.data);
            } catch {
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        if (localStorage.getItem('token')) checkUser();
        else setLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials) => {
        // 1. Obtenemos el token
        const response = await api.post<{ token: string }>('/login', credentials);
        const token = response.data.token;

        // 2. Lo guardamos en localStorage
        localStorage.setItem('token', token);

        // 3. Forzar el header para esta sesión específica inmediatamente
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 4. Obtener y establecer los datos del usuario
        const userRes = await api.get<User>('/me');
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
