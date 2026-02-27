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
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1️⃣ obtener CSRF cookie
      await api.get("/sanctum/csrf-cookie");

      // 2️⃣ login Laravel
      await api.post("api/login", {
        email,
        password,
      });

      // 3️⃣ obtener usuario autenticado
      const res = await api.get("/api/me");

      setUser(res.data);

      navigate("/dashboard");
    } catch {
      alert("Error al iniciar sesión.");
    }
  };

  // Login con Google
  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;

    try {
      await api.get("/sanctum/csrf-cookie");

      // El login ya me trae los datos del usuario
      const loginRes = await api.post("/api/auth/google", {
        id_token: response.credential,
      });

      // Guardamos los datos que vinieron del POST
      setUser(loginRes.data);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión con Google");
    }
  };

  const handleGoogleError = () => {
    alert("Error al iniciar sesión con Google");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/"); // limpia query
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
                {/* Botón de Google usando el componente oficial */}

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
