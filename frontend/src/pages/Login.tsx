// pages/Login.tsx
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login({ email: data.email, password: data.password });
      navigate("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors ?? {};
        Object.entries(serverErrors).forEach(([field, messages]) => {
          setError(field as keyof FormData, {
            message: (messages as string[])[0],
          });
        });
      } else {
        setError("password", { message: "Email o contraseña incorrectos" });
      }
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    try {
      const loginRes = await api.post("/auth/google", {
        id_token: response.credential,
      });
      const { user, token } = loginRes.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user_data", JSON.stringify(user));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

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
    <div className="grid grid-cols-2 min-h-screen w-full">
      <div className="hidden md:block bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center"></div>
      <div className="flex flex-col items-center justify-center gap-16">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-100 h-40"></div>

        <CardSinBorde className="w-full p-1 max-w-87.5 h-120">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col mt-8 gap-6"
            >
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="Introduce tu email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="Introduce tu contraseña"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-4 mt-8!">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert("Error al iniciar sesión con Google")}
                  useOneTap
                  size="medium"
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
