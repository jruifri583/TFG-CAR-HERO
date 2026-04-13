import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, User as UserIcon } from "lucide-react";
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
import { toast } from "sonner";

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
  nif: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) => {
        if (!value) return true;

        const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

        if (/^\d{8}[A-Z]$/.test(value)) {
          const number = parseInt(value.slice(0, 8), 10);
          return DNI_LETTERS[number % 23] === value[8];
        }

        if (/^[XYZ]\d{7}[A-Z]$/.test(value)) {
          const map: Record<string, string> = { X: "0", Y: "1", Z: "2" };
          const number = map[value[0]] + value.slice(1, 8);
          return DNI_LETTERS[parseInt(number, 10) % 23] === value[8];
        }

        return false;
      },
      {
        message: "DNI/NIE inválido",
      },
    )
    .optional(),
  telefono: z
    .string()
    .regex(/^\d+$/, "El teléfono solo puede contener números")
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
      .max(20, "Máximo 20 caracteres")
      .optional()
      .or(z.literal("")),
    password_confirmation: z
      .string()
      .optional()
      .or(z.literal("")),
    rol_id: z.number().optional(),
    activo: z.boolean().optional(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
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
  const { setHeaderData, setOnImageChange } = useHeader();

  const isOwnProfile = !id;
  const isAdmin = authUser?.rol?.slug === "administrador" || authUser?.rol_id === 1;
  const isStaff = isAdmin || authUser?.rol?.slug === "empleado" || authUser?.rol_id === 2;

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
    // Resetea estado de edición global
    setIsEditing(false);

    // Establece header inicial
    setHeaderData({
      nombre: isOwnProfile ? "Mi perfil" : "Cargando perfil...",
      imagen: (authUser?.imagen as string | null) || null,
      isEditing: false
    });

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
          password_confirmation: "",
          rol_id: userData.rol?.id,
          activo: userData.activo,
        });

        // Actualizar header con datos reales
        setHeaderData({
          nombre: isOwnProfile 
            ? "Mi perfil" 
            : `Perfil de ${userData.nombre ?? "usuario"}`,
          imagen: userData.imagen,
          isEditing: false,
        });
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };
    fetchUser();

    return () => {
      setHeaderData(null);
      setIsEditing(false);
      setOnImageChange(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reset, isOwnProfile, setHeaderData, setIsEditing, setOnImageChange]);

  useEffect(() => {
    setOnImageChange(() => async (file: File) => {
      const formData = new FormData();
      formData.append("imagen", file);
      try {
        const res = isOwnProfile
          ? await api.post("/me/imagen", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await api.post(`/users/${id}/imagen`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            
        const updated = res.data.user;
        setUser(updated);
        if (isOwnProfile) setContextUser(updated);

        setHeaderData((prev) => (prev ? { ...prev, imagen: updated.imagen } : prev));
        toast.success("Imagen de perfil actualizada");
      } catch (error) {
        console.error("Error actualizando imagen:", error);
        toast.error("Hubo un error al actualizar la imagen");
      }
    });
  }, [id, isOwnProfile, setContextUser, setHeaderData, setOnImageChange]);

  // Actualiza isEditing en el header cuando cambia
  useEffect(() => {
    setHeaderData((prev) => (prev ? { ...prev, isEditing } : prev));
  }, [isEditing, setHeaderData]);

  const handleCancel = () => {
    reset({
      email: user?.email ?? "",
      nombre: user?.nombre ?? "",
      apellidos: user?.apellidos ?? "",
      nif: user?.nif ?? "",
      telefono: user?.telefono ?? "",
      direccion: user?.direccion ?? "",
      password: "",
      password_confirmation: "",
      rol_id: user?.rol?.id,
      activo: user?.activo,
    });
    setIsEditing(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = { 
        ...data,
        rol_id: data.rol_id,
        activo: data.activo
      };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      const res = isOwnProfile
        ? await api.put("/me", payload)
        : await api.put(`/users/${id}`, payload);

      const updated = isOwnProfile ? res.data.user : res.data.user;
      setUser(updated);
      if (isOwnProfile) setContextUser(updated);

      // Sincronizar react-hook-form con los datos actualizados
      reset({
        email: updated.email ?? "",
        nombre: updated.nombre ?? "",
        apellidos: updated.apellidos ?? "",
        nif: updated.nif ?? "",
        telefono: updated.telefono ?? "",
        direccion: updated.direccion ?? "",
        password: "",
        password_confirmation: "",
        rol_id: updated.rol?.id,
        activo: updated.activo,
      });

      setIsEditing(false);
      toast.success("¡Perfil actualizado con éxito!");
    } catch (error: any) {
      console.error("Error actualizando perfil:", error);
      const msg = error.response?.data?.message || "Ocurrió un error al guardar los cambios";
      toast.error(msg);
    }
  };

  const onValidationError = (errors: any) => {
    console.error("Errores de validación:", errors);
    toast.error("Por favor, revisa los campos del formulario");
  };

  if (!user) return <p>Cargando...</p>;

  const readOnlyClass = !isEditing
    ? "pointer-events-none focus:ring-0 focus:outline-none"
    : "";

  return (
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-6 pt-6">
          {((isStaff || isOwnProfile) && user?.rol?.slug === 'cliente') && !isEditing && (
            <div className="flex justify-end pb-2">
              <ButtonGroup>
                <Button
                  className="h-9 px-4"
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/perfil/${id}/nuevo-vehiculo`)}
                >
                  Añadir vehículo
                </Button>
                <Button
                  className="h-9 px-4"
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/perfil/${id}/nueva-solicitud`)}
                >
                  Crear solicitud
                </Button>
              </ButtonGroup>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit, onValidationError)} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Bloque 1: Credenciales */}
              <div className="space-y-4 border-b-2 border-primary pb-8 sm:border-b-0 sm:pb-0 sm:border-r-2 sm:border-primary sm:pr-8">
                <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Lock className="text-primary" size={20} />
                  </div>
                  <h3 className="font-bold text-lg">Credenciales</h3>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    {...register("email")}
                    readOnly={!isEditing}
                    className={`${readOnlyClass} bg-transparent border-slate-200`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Rol de usuario</label>
                  {isEditing && isAdmin && !isOwnProfile ? (
                    <select
                      className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
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
                      value={user.rol?.nombre ?? "Sin rol"}
                      readOnly
                      className="pointer-events-none bg-slate-50 border-slate-200"
                    />
                  )}
                </div>

                {isEditing && (
                  <div className="space-y-4 pt-2 border-t-2 border-primary mt-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-primary uppercase text-[10px] tracking-wider font-black">Nueva Contraseña</label>
                      <Input
                        type="password"
                        {...register("password")}
                        placeholder="Mínimo 6 caracteres"
                        className="bg-white border-slate-200"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs font-medium">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-primary uppercase text-[10px] tracking-wider font-black">Confirmar Contraseña</label>
                      <Input
                        type="password"
                        {...register("password_confirmation")}
                        placeholder="Repite la contraseña"
                        className="bg-white border-slate-200"
                      />
                      {errors.password_confirmation && (
                        <p className="text-red-500 text-xs font-medium">
                          {errors.password_confirmation.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isAdmin && !isOwnProfile && (
                  <div className="flex items-center gap-3 pt-4 border-t-2 border-primary">
                    <input
                      type="checkbox"
                      id="activo"
                      className={`w-5 h-5 rounded border-2 border-slate-300 accent-primary transition-all ${
                        !isEditing ? "pointer-events-none opacity-100" : "cursor-pointer"
                      }`}
                      {...register("activo")}
                    />
                    <label htmlFor="activo" className="text-sm font-bold cursor-pointer select-none">
                      Usuario activo
                    </label>
                  </div>
                )}
              </div>

              {/* Bloque 2: Información Personal */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <UserIcon className="text-primary" size={20} />
                  </div>
                  <h3 className="font-bold text-lg">Información Personal</h3>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    type="text"
                    {...register("nombre")}
                    readOnly={!isEditing}
                    className={`${readOnlyClass} bg-transparent border-slate-200`}
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
                    readOnly={!isEditing}
                    className={`${readOnlyClass} bg-transparent border-slate-200`}
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
                      readOnly={!isEditing}
                      className={`${readOnlyClass} bg-transparent border-slate-200`}
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase();
                      }}
                    />
                    {errors.nif && (
                      <p className="text-red-500 text-xs font-medium">{errors.nif.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Teléfono</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      {...register("telefono")}
                      readOnly={!isEditing}
                      className={`${readOnlyClass} bg-transparent border-slate-200`}
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
                    readOnly={!isEditing}
                    className={`${readOnlyClass} bg-transparent border-slate-200`}
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.direccion.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end mt-10 pt-6 border-t-2 border-primary font-bold">
              {!isEditing ? (
                <>
                  <Button
                    className="w-50"
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Perfil
                  </Button>
                  <Button
                    className="w-50"
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Volver
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
                    Guardar Cambios
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
