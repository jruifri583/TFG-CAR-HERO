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

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function ContactoPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    console.log("Contacto:", data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen w-full">
      <div className="hidden md:block bg-primary bg-[url('/logo.png')] bg-no-repeat bg-center"></div>

      <div className="flex flex-col items-center justify-center gap-8 px-4 py-8 w-full max-w-md mx-auto md:max-w-none">
        <div className="bg-[url('/logoLinea.png')] bg-no-repeat bg-center bg-contain w-80 h-32 shrink-0"></div>

        <CardSinBorde className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              ¿En qué podemos ayudarte?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isSubmitSuccessful ? (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-green-600 font-medium">
                  ¡Mensaje enviado! Nos pondremos en contacto contigo pronto.
                </p>
                <Button onClick={() => navigate("/login")}>
                  Volver al login
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
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
                  />
                  {errors.mensaje && (
                    <p className="text-red-500 text-xs">
                      {errors.mensaje.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/login")}
                  >
                    Volver al login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </CardSinBorde>
      </div>

      <button
        onClick={() => navigate("/login")}
        className="fixed bottom-4 left-4 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        ← Volver al login
      </button>
    </div>
  );
}
