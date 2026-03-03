// context/AuthProvider.tsx
import { useState, useEffect, type ReactNode } from "react";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import type { User } from "@/types/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const res = await api.post("/login", { email, password });

    const { user, token } = res.data;

    // Guardar token en localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user_data", JSON.stringify(user));

    // Configurar Axios para usar Bearer token en todas las peticiones
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Actualizar estado
    setUser(user);
  };

  const loginWithGoogle = async (id_token: string) => {
    const res = await api.post("/auth/google", { id_token });

    const { user, token } = res.data;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  // ⚡ Opcional: cargar token guardado al iniciar app
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user_data");

    if (token && userData) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, loginWithGoogle, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
