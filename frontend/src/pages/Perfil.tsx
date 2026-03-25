import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import { useHeader } from "@/context/HeaderContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonGroup } from "@/components/ui/button-group";

const ROLES = [
  { id: 1, nombre: "Administrador", slug: "administrador" },
  { id: 2, nombre: "Empleado", slug: "empleado" },
  { id: 3, nombre: "Cliente", slug: "cliente" },
];

const schema = z.object({
  email: z.string().email("Email inválido").max(150, "Máximo 150 caracteres"),
  nombre: z
    .string()
    .max(255, "Máximo 255 caracteres")
    .optional()
    .or(z.literal("")),
  apellidos: z
    .string()
    .max(255, "Máximo 255 caracteres")
    .optional()
    .or(z.literal("")),
  nif: z.string().max(20, "Máximo 20 caracteres").optional().or(z.literal("")),
  telefono: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  direccion: z
    .string()
    .max(255, "Máximo 255 caracteres")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres")
    .optional()
    .or(z.literal("")),
  rol_id: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

interface User {
  id: number;
  email: string;
  nombre: string | null;
  apellidos: string | null;
  nif: string | null;
  telefono: string | null;
  direccion: string | null;
  imagen: string | null;
  activo: boolean;
  rol_id?: number;
  rol: { id: number; nombre: string; slug: string } | null;
}

export default function PerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const {
    isEditing,
    setIsEditing,
    setUser: setContextUser,
    user: authUser,
  } = useAuth();
  const { setHeaderData } = useHeader();

  const isOwnProfile = !id;
  const isAdmin = authUser?.rol?.slug === "administrador";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Establece header vacío inmediatamente si es perfil ajeno
    if (id) {
      setHeaderData({ nombre: "", imagen: null, isEditing: false });
    }

    const fetchUser = async () => {
      try {
        const res = id ? await api.get(`/users/${id}`) : await api.get("/me");
        const userData = id ? res.data : res.data.user;
        setUser(userData);
        reset({
          email: userData.email ?? "",
          nombre: userData.nombre ?? "",
          apellidos: userData.apellidos ?? "",
          nif: userData.nif ?? "",
          telefono: userData.telefono ?? "",
          direccion: userData.direccion ?? "",
          password: "",
          rol_id: userData.rol?.id,
        });

        if (id) {
          setHeaderData({
            nombre:
              `${userData.nombre ?? ""} ${userData.apellidos ?? ""}`.trim(),
            imagen: userData.imagen,
            isEditing: false,
          });
        }
      } catch (error) {}
    };
    fetchUser();

    return () => {
      if (id) setHeaderData(null);
    };
  }, [id]);

  // Actualiza isEditing en el header
  useEffect(() => {
    if (id && user) {
      setHeaderData((prev) => (prev ? { ...prev, isEditing } : prev));
    }
  }, [isEditing]);

  const handleCancel = () => {
    reset({
      email: user?.email ?? "",
      nombre: user?.nombre ?? "",
      apellidos: user?.apellidos ?? "",
      nif: user?.nif ?? "",
      telefono: user?.telefono ?? "",
      direccion: user?.direccion ?? "",
      password: "",
      rol_id: user?.rol?.id,
    });
    setIsEditing(false);
  };

  const onSubmit = async (data: FormData) => {
    const payload = { ...data };
    if (!payload.password) delete payload.password;

    const res = isOwnProfile
      ? await api.put("/me", payload)
      : await api.put(`/users/${id}`, payload);

    const updated = isOwnProfile ? res.data.user : res.data;
    setUser(updated);
    if (isOwnProfile) setContextUser(updated);
    setIsEditing(false);
  };

  if (!user) return <p>Cargando...</p>;

  console.log({
    isAdmin,
    isOwnProfile,
    isEditing,
    authUser,
  });

  const readOnlyClass = !isEditing
    ? "pointer-events-none focus:ring-0 focus:outline-none"
    : "";

  return (
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input
                  type="email"
                  {...register("email")}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Nombre</label>
                <Input
                  type="text"
                  {...register("nombre")}
                  readOnly={!isEditing}
                  className={readOnlyClass}
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
                  readOnly={!isEditing}
                  className={readOnlyClass}
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
                  readOnly={!isEditing}
                  className={readOnlyClass}
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
                  readOnly={!isEditing}
                  className={readOnlyClass}
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
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.direccion && (
                  <p className="text-red-500 text-xs">
                    {errors.direccion.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Rol</label>
                {isEditing && isAdmin && !isOwnProfile ? (
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={watch("rol_id") ?? ""}
                    onChange={(e) => setValue("rol_id", Number(e.target.value))}
                  >
                    {ROLES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type="text"
                    value={user.rol?.nombre ?? ""}
                    readOnly
                    className="pointer-events-none"
                  />
                )}
              </div>

              {isEditing && (
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">
                    Contraseña
                  </label>
                  <Input
                    type="password"
                    {...register("password")}
                    placeholder="Nueva contraseña (opcional)"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isAdmin && !isOwnProfile && !isEditing && (
              <div className="flex gap-2 mt-4">
                <ButtonGroup>
                  <Button
                    className="w-50"
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/perfil/${id}/nuevo-vehiculo`)}
                  >
                    Añadir vehículo
                  </Button>
                  <Button
                    className="w-50"
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/perfil/${id}/nueva-solicitud`)}
                  >
                    Crear solicitud
                  </Button>
                </ButtonGroup>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end mt-4">
              {!isEditing ? (
                <>
                  <Button
                    className="w-50"
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                  <Button
                    className="w-50"
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Atrás
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-50"
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button className="w-50" type="submit">
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
