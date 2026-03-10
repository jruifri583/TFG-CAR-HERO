import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";

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
  rol: { nombre: string; slug: string } | null;
}

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const { isEditing, setIsEditing, setUser: setContextUser } = useAuth();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data.user);
        setForm(res.data.user);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };
    fetchMe();
  }, []);

  const handleChange = (field: keyof User, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setForm(user ?? {});
    setIsEditing(false);
  };

  const handleSave = async () => {
    const res = await api.put("/me", form);
    setUser(res.data.user);
    setContextUser(res.data.user);
    setIsEditing(false);
  };

  if (!user) return <p>Cargando...</p>;

  const readOnlyClass = !isEditing
    ? "pointer-events-none focus:ring-0 focus:outline-none"
    : "";

  return (
    <div className="w-full">
      <span className="text-4xl font-bold mb-6 inline-block">Perfil</span>
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-4">
          {/* Campos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                type="email"
                value={form.email ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Nombre</label>
              <Input
                type="text"
                value={form.nombre ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Apellidos</label>
              <Input
                type="text"
                value={form.apellidos ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("apellidos", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">NIF</label>
              <Input
                type="text"
                value={form.nif ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("nif", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Teléfono</label>
              <Input
                type="text"
                value={form.telefono ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Dirección</label>
              <Input
                type="text"
                value={form.direccion ?? ""}
                readOnly={!isEditing}
                className={readOnlyClass}
                onChange={(e) => handleChange("direccion", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Rol</label>
              <Input
                type="text"
                value={user.rol?.nombre ?? ""}
                readOnly
                className="pointer-events-none"
              />
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

          {/* Botones */}
          <div className="flex flex-wrap gap-2 justify-end">
            {!isEditing ? (
              <>
                <Button className="w-50" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
                <Button
                  className="w-50"
                  variant="outline"
                  onClick={() => window.history.back()}
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
