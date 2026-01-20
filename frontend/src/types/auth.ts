export interface User {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    nif: string;
    rol_id: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    loading: boolean;
}