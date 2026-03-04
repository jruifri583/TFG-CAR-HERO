import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
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
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<User>>({});
  const { isEditing, setIsEditing } = useAuth();

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
    setEditing(false);
  };

  const handleSave = async () => {
    const res = await api.put("/me", form);
    setUser(res.data.user);
    setIsEditing(false);
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div className="max-w-lg">
      <span className="text-4xl font-bold mb-6 inline-block">Perfil</span>

      <div className="space-y-3">
        <InputGroup data-readonly={!editing ? "true" : undefined}>
          <InputGroupText>Email</InputGroupText>
          <InputGroupInput
            type="email"
            value={form.email ?? ""}
            readOnly={!editing}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </InputGroup>
        <InputGroup data-readonly={!editing ? "true" : undefined}>
          <InputGroupText>Nombre</InputGroupText>
          <InputGroupInput
            type="text"
            value={form.nombre ?? ""}
            readOnly={!editing}
            onChange={(e) => handleChange("nombre", e.target.value)}
          />
        </InputGroup>
        <InputGroup data-readonly={!editing ? "true" : undefined}>
          <InputGroupText>Apellidos</InputGroupText>
          <InputGroupInput
            type="text"
            value={form.apellidos ?? ""}
            readOnly={!editing}
            onChange={(e) => handleChange("apellidos", e.target.value)}
          />
        </InputGroup>
        <InputGroup data-readonly={!editing ? "true" : undefined}>
          <InputGroupText>NIF</InputGroupText>
          <InputGroupInput
            type="text"
            value={form.nif ?? ""}
            readOnly={!editing}
            onChange={(e) => handleChange("nif", e.target.value)}
          />
        </InputGroup>
        <InputGroup data-readonly={!editing ? "true" : undefined}>
          <InputGroupText>Teléfono</InputGroupText>
          <InputGroupInput
            type="text"
            value={form.telefono ?? ""}
            readOnly={!editing}
            onChange={(e) => handleChange("telefono", e.target.value)}
          />
        </InputGroup>
        <InputGroup data-readonly={!editing ? "true" : undefined}>
          <InputGroupText>Dirección</InputGroupText>
          <InputGroupInput
            type="text"
            value={form.direccion ?? ""}
            readOnly={!editing}
            onChange={(e) => handleChange("direccion", e.target.value)}
          />
        </InputGroup>
        <InputGroup data-readonly="true">
          <InputGroupText>Rol</InputGroupText>
          <InputGroupInput
            type="text"
            value={user.rol?.nombre ?? ""}
            readOnly
          />
        </InputGroup>
        {editing && (
          <InputGroup>
            <InputGroupText>Contraseña</InputGroupText>
            <InputGroupInput
              type="password"
              placeholder="Nueva contraseña (opcional)"
              onChange={(e) =>
                handleChange("password" as keyof User, e.target.value)
              }
            />
          </InputGroup>
        )}
      </div>

      <div className="flex gap-2 mt-6">
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Editar</Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar</Button>
          </>
        )}
      </div>
    </div>
  );
}
