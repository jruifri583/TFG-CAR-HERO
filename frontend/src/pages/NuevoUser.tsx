import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ROLES = [
  { id: 1, nombre: "Administrador", slug: "administrador" },
  { id: 2, nombre: "Empleado", slug: "empleado" },
  { id: 3, nombre: "Cliente", slug: "cliente" },
];

const schema = z.object({
  email: z.string().email("Email inválido").max(150),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  nombre: z.string().max(255).optional().or(z.literal("")),
  apellidos: z.string().max(255).optional().or(z.literal("")),
  nif: z.string().max(20).optional().or(z.literal("")),
  telefono: z.string().max(50).optional().or(z.literal("")),
  direccion: z.string().max(255).optional().or(z.literal("")),
  rol_id: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NuevoUsuarioPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rol_id: 3 },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/users", data);
      navigate("/users");
    } catch (error: any) {
      console.error("Error creando usuario:", error);
    }
  };

  return (
    <div className="w-full">
      <span className="text-4xl font-bold mb-6 inline-block">
        Nuevo usuario
      </span>
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Email *</label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="email@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Contraseña *
                </label>
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Nombre</label>
                <Input
                  type="text"
                  {...register("nombre")}
                  placeholder="Nombre"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Apellidos
                </label>
                <Input
                  type="text"
                  {...register("apellidos")}
                  placeholder="Apellidos"
                />
                {errors.apellidos && (
                  <p className="text-red-500 text-xs">
                    {errors.apellidos.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">NIF</label>
                <Input
                  type="text"
                  {...register("nif")}
                  placeholder="12345678A"
                />
                {errors.nif && (
                  <p className="text-red-500 text-xs">{errors.nif.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Teléfono
                </label>
                <Input
                  type="text"
                  {...register("telefono")}
                  placeholder="600000000"
                />
                {errors.telefono && (
                  <p className="text-red-500 text-xs">
                    {errors.telefono.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Dirección
                </label>
                <Input
                  type="text"
                  {...register("direccion")}
                  placeholder="Calle, número, ciudad"
                />
                {errors.direccion && (
                  <p className="text-red-500 text-xs">
                    {errors.direccion.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Rol</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
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
            </div>

            <div className="flex flex-wrap gap-2 justify-end mt-4">
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
