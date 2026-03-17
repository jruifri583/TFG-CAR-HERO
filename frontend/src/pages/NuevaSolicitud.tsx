import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  vehiculo_id: z.number().min(1, "Selecciona un vehículo"),
  direccion: z.string().min(1, "La dirección es obligatoria").max(255),
  fecha_programada: z.string().optional().or(z.literal("")),
  notas: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

interface Vehiculo {
  id: number;
  matricula: string;
  marca: string | null;
  modelo: string | null;
}

export default function NuevaSolicitudPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.get(`/users/${userId}`).then((res) => {
      const u = res.data;
      setUserName(`${u.nombre} ${u.apellidos ?? ""}`);
      if (u.direccion) setValue("direccion", u.direccion);
    });

    api.get(`/vehiculos?user_id=${userId}`).then((res) => {
      setVehiculos(res.data.data ?? []);
    });
  }, [userId]);

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/solicitudes", {
        ...data,
        user_cliente_id: Number(userId),
      });
      navigate(`/perfil/${userId}`);
    } catch (error: any) {
      console.error("Error creando solicitud:", error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <span className="text-4xl font-bold inline-block">Nueva solicitud</span>
      {userName && (
        <p className="text-muted-foreground">
          Para: <strong>{userName}</strong>
        </p>
      )}

      <CardSinBorde className="w-full">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Vehículo *
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={watch("vehiculo_id") ?? ""}
                  onChange={(e) =>
                    setValue("vehiculo_id", Number(e.target.value))
                  }
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.marca} {v.modelo} — {v.matricula}
                    </option>
                  ))}
                </select>
                {errors.vehiculo_id && (
                  <p className="text-red-500 text-xs">
                    {errors.vehiculo_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Dirección *
                </label>
                <Input
                  type="text"
                  {...register("direccion")}
                  placeholder="Dirección de recogida"
                />
                {errors.direccion && (
                  <p className="text-red-500 text-xs">
                    {errors.direccion.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Fecha programada
                </label>
                <Input
                  type="datetime-local"
                  {...register("fecha_programada")}
                />
                {errors.fecha_programada && (
                  <p className="text-red-500 text-xs">
                    {errors.fecha_programada.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Notas</label>
                <Input
                  type="text"
                  {...register("notas")}
                  placeholder="Observaciones opcionales"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button
                className="w-50"
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button className="w-50" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear solicitud"}
              </Button>
            </div>
          </form>
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
