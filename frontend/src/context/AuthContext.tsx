import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '@/lib/axios';
import { type User, type AuthContextType, type LoginCredentials } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                // Tipamos la respuesta de Axios para que sepa que devuelve un User
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
        // Tipamos la respuesta para que reconozca 'access_token'
        const response = await api.post<{ access_token: string }>('/login', credentials);
        localStorage.setItem('token', response.data.access_token);
        
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};