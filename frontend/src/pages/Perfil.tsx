import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";

const ROLES = [
  { id: 1, nombre: "Administrador", slug: "administrador" },
  { id: 2, nombre: "Empleado", slug: "empleado" },
  { id: 3, nombre: "Cliente", slug: "cliente" },
];

interface User {
  id: number;
  email: string;
  nombre: string;
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
  const [form, setForm] = useState<Partial<User> & { rol_id?: number }>({});
  const {
    isEditing,
    setIsEditing,
    setUser: setContextUser,
    user: authUser,
  } = useAuth();

  const isOwnProfile = !id;
  const isAdmin = authUser?.rol?.slug === "administrador";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = id ? await api.get(`/users/${id}`) : await api.get("/me");
        const userData = id ? res.data : res.data.user;
        setUser(userData);
        setForm({ ...userData, rol_id: userData.rol?.id });
      } catch (error) {}
    };
    fetchUser();
  }, [id]);

  const handleChange = (field: keyof User, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm(user ? { ...user, rol_id: user.rol?.id } : {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const res = isOwnProfile
      ? await api.put("/me", form)
      : await api.put(`/users/${id}`, form);
    const updated = isOwnProfile ? res.data.user : res.data;
    setUser(updated);
    if (isOwnProfile) setContextUser(updated);
    setIsEditing(false);
  };

  if (!user) return <p>Cargando...</p>;

  const readOnlyClass = !isEditing
    ? "pointer-events-none focus:ring-0 focus:outline-none"
    : "";

  return (
    <div className="w-full">
      <span className="text-4xl font-bold mb-6 inline-block">
        {isOwnProfile ? "Perfil" : `${user.nombre} ${user.apellidos ?? ""}`}
      </span>
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                type="email"
                value={form.email ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Nombre</label>
              <Input
                type="text"
                value={form.nombre ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Apellidos</label>
              <Input
                type="text"
                value={form.apellidos ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("apellidos", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">NIF</label>
              <Input
                type="text"
                value={form.nif ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("nif", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Teléfono</label>
              <Input
                type="text"
                value={form.telefono ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Dirección</label>
              <Input
                type="text"
                value={form.direccion ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("direccion", e.target.value)}
              />
            </div>

            {/* Rol */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Rol</label>
              {isEditing && isAdmin && !isOwnProfile ? (
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.rol_id ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rol_id: Number(e.target.value),
                    }))
                  }
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
                  placeholder="Nueva contraseña (opcional)"
                  onChange={(e) =>
                    handleChange("password" as keyof User, e.target.value)
                  }
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {!isEditing ? (
              <>
                <Button className="w-50" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
                <Button
                  className="w-50"
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
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button className="w-50" onClick={handleSave}>
                  Guardar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
