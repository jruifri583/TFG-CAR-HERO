// pages/Register.tsx

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardSinBorde,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    password_confirmation: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type FormData = {
  email: string;
  password: string;
  password_confirmation: string;
};

export default function Register() {
  const { setUser, login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/register", data);
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
      }
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    try {
      await api.post("/auth/google", { id_token: response.credential });
      const res = await api.get("/me");
      setUser(res.data);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-2 min-h-screen w-full">
      <div className="hidden md:block bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center"></div>

      <div className="flex flex-col items-center justify-center gap-16">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-100 h-40"></div>

        <CardSinBorde className="w-full p-1 max-w-87.5 h-120">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Registrarse</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input type="email" {...register("email")} />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Contraseña</Label>
                <Input type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Confirmar Contraseña</Label>
                <Input type="password" {...register("password_confirmation")} />
                {errors.password_confirmation && (
                  <p className="text-red-500 text-xs">
                    {errors.password_confirmation.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-8!">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Registrarse"}
                </Button>
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => alert("Error al iniciar sesión con Google")}
                    size="medium"
                    useOneTap={false}
                  />
                </div>
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              <span>¿Tienes cuenta? </span>
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Entra aquí
              </button>
            </div>
          </CardContent>
        </CardSinBorde>
      </div>
    </div>
  );
}
