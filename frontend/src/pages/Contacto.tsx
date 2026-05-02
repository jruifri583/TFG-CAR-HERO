import {
  CardContent,
  CardHeader,
  CardTitle,
  CardSinBorde,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import api from "@/lib/axios";
import { Turnstile } from "@marsidev/react-turnstile";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  cf_turnstile_response: z.string().optional(),
}).refine((data) => {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const isConfigured = siteKey && !siteKey.startsWith("1x0000");
  if (isConfigured && !data.cf_turnstile_response) return false;
  return true;
}, {
  message: "La validación anti-spam es obligatoria",
  path: ["cf_turnstile_response"]
});

type FormData = z.infer<typeof schema>;

export default function ContactoPage() {
  const navigate = useNavigate();

  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      email: "",
      mensaje: "",
      cf_turnstile_response: "",
    }
  });

  const onSubmit = async (data: FormData) => {
    setErrorEnvio(null);
    try {
      await api.post("/contacto", data);
    } catch (err: any) {
      console.error("Error enviando contacto:", err);
      setErrorEnvio("Hubo un problema al enviar tu mensaje. Inténtalo más tarde.");
      throw err; // para que isSubmitSuccessful no se marque a true por defecto
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full">
      <div className="hidden md:block bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center"></div>

      <div className="flex flex-col items-center justify-center gap-12 w-full max-w-md mx-auto md:max-w-none">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-64 h-24 md:w-100 md:h-32 shrink-0 cursor-pointer" onClick={() => navigate("/login")}></div>

        <CardSinBorde className="w-full max-w-87.5 p-1">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              ¿En qué podemos ayudarte?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSubmitSuccessful && !errorEnvio ? (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-green-600 font-medium">
                  ¡Mensaje enviado! Nos pondremos en contacto contigo pronto a través de tu email.
                </p>
                <Button onClick={() => navigate("/login")}>
                  Volver al inicio
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
                noValidate
              >
                {errorEnvio && (
                  <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">
                    {errorEnvio}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label>Nombre</Label>
                  <Input
                    type="text"
                    {...register("nombre")}
                    placeholder="Tu nombre"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="Tu email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Mensaje</Label>
                  <Textarea
                    {...register("mensaje")}
                    placeholder="¿En qué podemos ayudarte?"
                    rows={3}
                  />
                  {errors.mensaje && (
                    <p className="text-red-500 text-xs">
                      {errors.mensaje.message}
                    </p>
                  )}
                </div>

                {import.meta.env.VITE_TURNSTILE_SITE_KEY && !import.meta.env.VITE_TURNSTILE_SITE_KEY.startsWith("1x0000") && (
                  <div className="flex justify-center mt-2 overflow-hidden">
                    <Turnstile 
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
                        onSuccess={(token) => {
                          setValue("cf_turnstile_response", token, { shouldValidate: true });
                        }}
                        onExpire={() => {
                          setValue("cf_turnstile_response", "", { shouldValidate: true });
                        }}
                        onError={() => {
                          setValue("cf_turnstile_response", "", { shouldValidate: true });
                        }}
                    />
                    {errors.cf_turnstile_response && (
                        <p className="text-red-500 text-[10px] absolute mt-16">
                          Por favor, completa la verificación.
                        </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </CardSinBorde>
      </div>
    </div>
  );
}
