export interface User {
    id: number;
    nombre: string;
    email: string;
    rol_id: number;
    // añade aquí los campos que devuelve tu API /me
}

export interface AuthContextType {
    user: User | null;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    loading: boolean;
}