import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useEffect, useState } from "react";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Introduce tu contraseña"),
});

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithToken } = useAuth();
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

  const [googleReady, setGoogleReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setGoogleReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

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
      await loginWithGoogle(response.credential);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar sesión con Google");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      loginWithToken(token).then(() => {
        window.history.replaceState({}, document.title, "/");
        navigate("/dashboard");
      }).catch(() => {
        toast.error("Sesión inválida");
      });
    }
  }, [navigate, loginWithToken]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full">
      <div className="hidden md:block bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center"></div>
      <div className="flex flex-col items-center justify-center gap-12">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-64 h-24 md:w-100 md:h-32"></div>

        <CardSinBorde className="w-full p-1 max-w-87.5 h-120">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col mt-8 gap-6"
              noValidate
            >
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  type="text"
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
                <div className={`google-btn-wrapper${googleReady ? " visible" : ""}`}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Error al iniciar sesión con Google")}
                    useOneTap
                    size="medium"
                    text="continue_with"
                  />
                </div>
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
        <button
          onClick={() => navigate("/contacto")}
          className="fixed bottom-4 left-4 text-sm text-primary md:text-white hover:text-accent transition-colors drop-shadow-md"
        >
          Contacto
        </button>
      </div>
    </div>
  );
}
