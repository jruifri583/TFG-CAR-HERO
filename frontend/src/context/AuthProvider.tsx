// context/AuthProvider.tsx
import { useState, useEffect, type ReactNode } from "react";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import type { User } from "@/types/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);
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
    localStorage.setItem("last_login", new Date().toISOString()); // 👈

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
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
        });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        loginWithGoogle,
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
