// pages/Login.tsx

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardSinBorde,
} from "@/components/ui/card";
import api from "@/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  // Login tradicional
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });

      // Recupera token de localStorage
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      navigate("/dashboard");
    } catch {
      alert("Error al iniciar sesión");
    }
  };

  // Login con Google
  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;

    try {
      const loginRes = await api.post("/api/auth/google", {
        id_token: response.credential,
      });

      const { user, token } = loginRes.data;

      // 🔹 Guardar token y user
      localStorage.setItem("token", token);
      localStorage.setItem("user_data", JSON.stringify(user));

      // 🔹 Configurar Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 🔹 Actualizar estado
      setUser(user);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión con Google");
    }
  };

  const handleGoogleError = () => {
    alert("Error al iniciar sesión con Google");
  };

  // Si viene token en query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      window.history.replaceState({}, document.title, "/");
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="grid grid-cols-2 min-h-screen w-full ">
      <div className="hidden md:block bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center"></div>
      <div className="flex flex-col items-center justify-center gap-16">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-100 h-40 mb-26"></div>

        <CardSinBorde className="w-full p-4 max-w-87.5">
          <CardHeader>
            <CardTitle className="text-3xl font-bold ">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col mt-8 gap-6 ">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Introduce tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-4 mt-8!">
                <Button type="submit" className="md:col-span-2 w-full">
                  Entrar
                </Button>

                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="continue_with"
                />
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              <span>¿No tienes cuenta? </span>
              <button
                onClick={() => navigate("/register")}
                className="text-primary hover:underline font-medium"
              >
                Regístrate aquí
              </button>
            </div>
          </CardContent>
        </CardSinBorde>
      </div>
    </div>
  );
}
