import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSinBorde, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";


export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: ""
  });

  // Registro normal
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/register", formData);
      alert("Registro completado. Ahora puedes hacer login.");
      navigate("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message ?? "Error al registrar");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error inesperado");
      }
    }
  };

  // Login con Google usando el componente oficial
  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;

    try {
      const res = await api.post("/auth/google", { id_token: response.credential });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error login Google", error);
      alert("Error al iniciar sesión con Google");
    }
  };

  const handleGoogleError = () => {
    alert("Error al iniciar sesión con Google");
  };

  return (
    <div className="grid grid-cols-2 min-h-screen w-full">
      <div className="bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center"></div>

      <div className="flex flex-col items-center justify-center gap-16">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-100 h-40 mb-6"></div>

        <CardSinBorde className="w-full p-4 max-w-87.5">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Registrarse</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col mt-8 gap-6">
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Confirmar Contraseña</Label>
                <Input
                  type="password"
                  value={formData.password_confirmation}
                  onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                />
              </div>
            <div className="flex flex-col gap-4 mt-8!">
              <Button type="submit" className="md:col-span-2 w-full ">
                Registrarse
              </Button>

              {/* Botón de Google usando el componente oficial */}
              <div className=" w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  text="signup_with"
                
                />
              </div>
            </div>
            </form>
          </CardContent>
        </CardSinBorde>
      </div>
    </div>
  );
}
