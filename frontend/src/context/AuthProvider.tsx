// context/AuthProvider.tsx
import { useState, useEffect, type ReactNode } from "react";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import type { User } from "@/types/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 👈 AHORA SÍ ES REAL
  const [isEditing, setIsEditing] = useState(false);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const res = await api.post("/login", { email, password });
    const { user, token } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user_data", JSON.stringify(user));
    localStorage.setItem("last_login", new Date().toISOString());

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
  };

  const loginWithGoogle = async (id_token: string) => {
    const res = await api.post("/auth/google", { id_token });
    const { user, token } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user_data", JSON.stringify(user));
    localStorage.setItem("last_login", new Date().toISOString());

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
  };

  const loginWithToken = async (token: string) => {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    try {
      const res = await api.get("/me");
      const user = res.data.user;
      setUser(user);
      localStorage.setItem("user_data", JSON.stringify(user));
      localStorage.setItem("last_login", new Date().toISOString());
    } catch (error) {
      logout();
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api
      .get("/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("user_data", JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user_data");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        loginWithGoogle,
        loginWithToken,
        logout,
        loading,
        isEditing,
        setIsEditing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
