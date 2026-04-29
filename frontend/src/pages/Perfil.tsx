import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, User as UserIcon, MapPin, Trash2, Plus } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardSinBorde } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";
import { useHeader } from "@/context/HeaderContext";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// ButtonGroup removed — unused
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
  ciudad: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  codigo_postal: z
    .string()
    .max(10, "Máximo 10 caracteres")
    .optional()
    .or(z.literal("")),
  direcciones: z.array(z.object({
    alias: z.string().max(100, "Máximo 100 caracteres").optional().or(z.literal("")),
    direccion: z.string().min(1, "La dirección es obligatoria").max(255, "Máximo 255 caracteres"),
    ciudad: z.string().min(1, "La ciudad es obligatoria").max(100, "Máximo 100 caracteres"),
    codigo_postal: z.string().min(1, "El C.P. es obligatorio").max(10, "Máximo 10 caracteres"),
  })).optional(),
    current_password: z
      .string()
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial")
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
  ciudad: string | null;
  codigo_postal: string | null;
  imagen: string | null;
  activo: boolean;
  rol_id?: number;
  rol: { id: number; nombre: string; slug: string } | null;
  direcciones?: Array<{
    id?: number;
    alias: string | null;
    direccion: string;
    ciudad: string | null;
    codigo_postal: string | null;
  }>;
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
  // isStaff se evalúa a través de isAdmin en los condicionales del formulario

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { fields: direccionesFields, append: appendDireccion, remove: removeDireccion } = useFieldArray({
    control,
    name: "direcciones",
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
          ciudad: userData.ciudad ?? "",
          codigo_postal: userData.codigo_postal ?? "",
          direcciones: [
            // Metemos la principal como la primera de la lista para el formulario
            {
              id: -1, // ID especial para la principal
              direccion: userData.direccion ?? "",
              ciudad: userData.ciudad ?? "",
              codigo_postal: userData.codigo_postal ?? "",
              alias: "Principal"
            },
            ...(userData.direcciones || []).map((d: any) => ({
              id: d.id,
              alias: d.alias ?? "",
              direccion: d.direccion ?? "",
              ciudad: d.ciudad ?? "",
              codigo_postal: d.codigo_postal ?? ""
            }))
          ],
          current_password: "",
          password: "",
          password_confirmation: "",
          rol_id: userData.rol?.id,
          activo: !!userData.activo,
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
      ciudad: user?.ciudad ?? "",
      codigo_postal: user?.codigo_postal ?? "",
      direcciones: [
        {
          id: -1,
          direccion: user?.direccion ?? "",
          ciudad: user?.ciudad ?? "",
          codigo_postal: user?.codigo_postal ?? "",
          alias: "Principal"
        },
        ...(user?.direcciones || []).map((d: any) => ({
          id: d.id,
          alias: d.alias ?? "",
          direccion: d.direccion ?? "",
          ciudad: d.ciudad ?? "",
          codigo_postal: d.codigo_postal ?? ""
        }))
      ],
      current_password: "",
      password: "",
      password_confirmation: "",
      rol_id: user?.rol?.id,
      activo: !!user?.activo,
    });
    setIsEditing(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { direcciones: allDirs, ...rest } = data;
      
      // Separamos: la primera va a los campos del usuario, el resto al array de direcciones
      const principal = allDirs?.[0];
      const adicionales = allDirs?.slice(1) || [];

      const payload = { 
        ...rest,
        direccion: principal?.direccion || "",
        ciudad: principal?.ciudad || "",
        codigo_postal: principal?.codigo_postal || "",
        direcciones: adicionales,
        rol_id: data.rol_id,
        activo: data.activo
      };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
        delete payload.current_password;
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
        ciudad: updated.ciudad ?? "",
        codigo_postal: updated.codigo_postal ?? "",
        direcciones: [
          {
            id: -1,
            direccion: updated.direccion ?? "",
            ciudad: updated.ciudad ?? "",
            codigo_postal: updated.codigo_postal ?? "",
            alias: "Principal"
          },
          ...(updated.direcciones || []).map((d: any) => ({
            id: d.id,
            alias: d.alias ?? "",
            direccion: d.direccion ?? "",
            ciudad: d.ciudad ?? "",
            codigo_postal: d.codigo_postal ?? ""
          }))
        ],
        current_password: "",
        password: "",
        password_confirmation: "",
        rol_id: updated.rol?.id,
        activo: !!updated.activo,
      });

      setIsEditing(false);
      toast.success("¡Perfil actualizado con éxito!");
    } catch (error: any) {
      console.error("Error actualizando perfil:", error);
      if (error.response?.status === 422 && error.response?.data?.errors?.current_password) {
        toast.error(error.response.data.errors.current_password[0]);
      } else {
        const msg = error.response?.data?.message || "Ocurrió un error al guardar los cambios";
        toast.error(msg);
      }
    }
  };



  if (!user) return <p>Cargando...</p>;

  const readOnlyClass = !isEditing
    ? "pointer-events-none focus:ring-0 focus:outline-none"
    : "";

  return (
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-6 pt-6">


          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

                {isAdmin && (
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
                )}

                {isEditing && (
                  <div className="space-y-4 pt-2 border-t-2 border-primary mt-4">
                    {isOwnProfile && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-primary uppercase text-[10px] tracking-wider font-black">Contraseña Actual</label>
                        <Input
                          type="password"
                          {...register("current_password")}
                          placeholder="Requerido para cambiar la contraseña"
                          className="bg-white border-slate-200"
                        />
                        {errors.current_password && (
                          <p className="text-red-500 text-xs font-medium">
                            {errors.current_password.message}
                          </p>
                        )}
                      </div>
                    )}
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


              </div>

              <div className="space-y-4 pt-6 border-t-2 border-primary col-span-1 sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <MapPin className="text-primary" size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Direcciones</h3>
                  </div>
                  {isEditing && (
                    <Button 
                      type="button" 
                      onClick={() => appendDireccion({ alias: "", direccion: "", ciudad: "", codigo_postal: "" })}
                      className="w-50 gap-2 font-bold"
                    >
                      <Plus size={16} /> Añadir dirección
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {direccionesFields.map((field, index) => (
                    <Card key={field.id} className="shadow-none border-slate-200 bg-transparent relative group">
                      <CardContent className="p-5">
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              toast.warning("¿Eliminar esta dirección?", {
                                description: `Se eliminará la Dirección ${index + 1}.`,
                                action: {
                                  label: "Confirmar",
                                  onClick: () => removeDireccion(index),
                                },
                                actionButtonStyle: {
                                  backgroundColor: "#f59e0b",
                                  color: "white",
                                },
                              });
                            }}
                            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Dirección {index + 1}</label>
                            <Input
                              {...register(`direcciones.${index}.direccion` as const)}
                              readOnly={!isEditing}
                              placeholder="Calle, número..."
                              className={`${readOnlyClass} bg-transparent border-slate-200 shadow-none focus-visible:ring-1`}
                            />
                            {errors.direcciones?.[index]?.direccion && (
                              <p className="text-red-500 text-[10px] font-medium mt-1">{errors.direcciones[index]?.direccion?.message}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium">Ciudad</label>
                            <Input
                              {...register(`direcciones.${index}.ciudad` as const)}
                              readOnly={!isEditing}
                              placeholder="Ciudad"
                              className={`${readOnlyClass} bg-transparent border-slate-200 shadow-none focus-visible:ring-1`}
                            />
                            {errors.direcciones?.[index]?.ciudad && (
                              <p className="text-red-500 text-[10px] font-medium mt-1">{errors.direcciones[index]?.ciudad?.message}</p>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium">Código Postal</label>
                              {!isEditing && <MapPin size={16} className="text-slate-300" />}
                            </div>
                            <Input
                              {...register(`direcciones.${index}.codigo_postal` as const)}
                              readOnly={!isEditing}
                              placeholder="CP"
                              className={`${readOnlyClass} bg-transparent border-slate-200 shadow-none focus-visible:ring-1`}
                            />
                            {errors.direcciones?.[index]?.codigo_postal && (
                              <p className="text-red-500 text-[10px] font-medium mt-1">{errors.direcciones[index]?.codigo_postal?.message}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {direccionesFields.length === 0 && !isEditing && (
                    <p className="text-sm text-muted-foreground italic px-2">No hay direcciones registradas.</p>
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
