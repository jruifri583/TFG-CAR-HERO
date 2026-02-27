import { useState, useEffect, type ReactNode } from "react";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import { type User, type LoginCredentials } from "@/types/auth";
import axios from "axios";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Inicialización Síncrona: Leemos de localStorage inmediatamente al arrancar
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user_data");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Función auxiliar mejorada para configurar la sesión y persistencia
  const setSession = (token: string | null, userData: User | null = null) => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (userData) {
        localStorage.setItem("user_data", JSON.stringify(userData));
      }
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // 1. Verificar usuario al cargar la app (Sincroniza con el servidor)
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setSession(token);
        // La URL ya usa el prefijo /api por tu baseURL en axios config
        const response = await api.get<User>("/api/me");
        setUser(response.data);
        localStorage.setItem("user_data", JSON.stringify(response.data));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error validando sesión:", error.response?.data);
        }
        // Si el token es inválido o expiró, limpiamos todo
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
    // Nota: Como tu baseURL ya tiene /api, aquí usamos solo /login
    const response = await api.post("/api/login", credentials);
    const { token, user: userData } = response.data;
    setSession(token, userData);
    setUser(userData);

    const userRes = await api.get<User>("/api/me");
    setUser(userRes.data);
    localStorage.setItem("user_data", JSON.stringify(userRes.data));
  };

  // 3. Login de Google
  const loginWithGoogle = async (token: string, userData: any) => {
    const cleanUser = userData.user ? userData.user : userData;

    setSession(token, cleanUser);
    setUser(cleanUser);
  };

  // 4. Logout con limpieza total
  const logout = async () => {
    try {
      // Intentamos avisar al servidor (opcional)
      await api.post("/logout");
    } catch (error) {
      console.warn("Sesión ya invalidada en el servidor");
    } finally {
      // Limpiamos SIEMPRE el estado local
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, setUser, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};
