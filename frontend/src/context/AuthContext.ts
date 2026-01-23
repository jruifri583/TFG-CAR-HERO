
import { createContext } from 'react';
import type { User, LoginCredentials } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void; // para actualizar usuario
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (token: string, userData: User) => Promise<void>; 
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);