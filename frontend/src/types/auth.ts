export interface User {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  nif: string;
  rol_id: number;
  imagen: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  codigo_postal: string | null;
  activo: boolean;
  rol: { nombre: string; slug: string } | null;
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

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
}
