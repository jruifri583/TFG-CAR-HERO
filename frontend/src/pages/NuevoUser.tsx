import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";

const ROLES = [
  { id: 1, nombre: "Administrador", slug: "administrador" },
  { id: 2, nombre: "Empleado", slug: "empleado" },
  { id: 3, nombre: "Cliente", slug: "cliente" },
];

const schema = z
  .object({
    email: z
      .string()
      .email("Dirección de email inválida")
      .max(150, "El email no puede exceder los 150 caracteres"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(20, "La contraseña no puede exceder los 20 caracteres"),
    password_confirmation: z.string().min(1, "Confirma la contraseña"),
    nombre: z
      .string()
      .max(255, "El nombre no puede exceder los 255 caracteres")
      .optional()
      .or(z.literal("")),
    apellidos: z
      .string()
      .max(255, "Los apellidos no pueden exceder los 255 caracteres")
      .optional()
      .or(z.literal("")),
    nif: z
      .string()
      .max(20, "El NIF no puede exceder los 20 caracteres")
      .optional()
      .or(z.literal("")),
    telefono: z
      .string()
      .max(50, "El teléfono no puede exceder los 50 caracteres")
      .optional()
      .or(z.literal("")),
    direccion: z
      .string()
      .max(255, "La dirección no puede exceder los 255 caracteres")
      .optional()
      .or(z.literal("")),
    rol_id: z.number().optional(),
    activo: z.boolean(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof schema>;

export default function NuevoUsuarioPage() {
  const navigate = useNavigate();
  const { setHeaderData } = useHeader();

  useEffect(() => {
    setHeaderData({
      nombre: "Nuevo usuario",
      imagen: "/avatars/default_user.png",
    });
    // Limpiar al desmontar
    return () => setHeaderData(null);
  }, [setHeaderData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rol_id: 3, activo: true },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/users", data);
      toast.success("¡Usuario creado con éxito!");
      navigate("/users");
    } catch (error: any) {
      console.error("Error creando usuario:", error);
      toast.error("No se pudo crear el usuario. Por favor, revisa los datos.");
    }
  };

  return (
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bloque 1: Credenciales */}
              <div className="space-y-4 border-b pb-6 sm:border-b-0 sm:pb-0 sm:border-r sm:border-black sm:pr-6">
                <h3 className="font-bold text-lg mb-4">Credenciales</h3>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="text"
                    {...register("email")}
                    placeholder="email@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Contraseña *</label>
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Confirmar Contraseña *</label>
                  <Input
                    type="password"
                    {...register("password_confirmation")}
                    placeholder="Repite la contraseña"
                  />
                  {errors.password_confirmation && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Rol de usuario</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                    value={watch("rol_id") ?? 3}
                    onChange={(e) => setValue("rol_id", Number(e.target.value))}
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="activo"
                    className="w-5 h-5 rounded border-2 border-slate-300 accent-primary cursor-pointer transition-all"
                    {...register("activo")}
                  />
                  <label htmlFor="activo" className="text-sm font-bold cursor-pointer select-none">
                    Usuario activo por defecto
                  </label>
                </div>
              </div>

              {/* Bloque 2: Información Personal */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Información Personal</h3>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    type="text"
                    {...register("nombre")}
                    placeholder="Nombre"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Apellidos</label>
                  <Input
                    type="text"
                    {...register("apellidos")}
                    placeholder="Apellidos"
                  />
                  {errors.apellidos && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.apellidos.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">NIF</label>
                    <Input
                      type="text"
                      {...register("nif")}
                      placeholder="12345678A"
                    />
                    {errors.nif && (
                      <p className="text-red-500 text-xs font-medium">{errors.nif.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Teléfono</label>
                    <Input
                      type="text"
                      {...register("telefono")}
                      placeholder="600000000"
                    />
                    {errors.telefono && (
                      <p className="text-red-500 text-xs font-medium">
                        {errors.telefono.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Dirección</label>
                  <Input
                    type="text"
                    {...register("direccion")}
                    placeholder="Calle, número, ciudad"
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.direccion.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end mt-4 pt-4 border-t border-black">
              <Button
                className="w-50"
                type="button"
                variant="outline"
                onClick={() => navigate("/users")}
              >
                Cancelar
              </Button>
              <Button className="w-50" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
