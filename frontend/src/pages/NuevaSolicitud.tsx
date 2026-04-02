import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { toast } from "sonner";

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
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userName, setUserName] = useState("");
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const { user: authUser } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const fetchData = async () => {
      const vId = searchParams.get("vehiculo_id");
      const initialValues: any = {
        direccion: "",
        notas: "",
      };
      if (vId) initialValues.vehiculo_id = Number(vId);

      // 1. Datos del usuario (Priorizamos sesión actual)
      if (authUser && String(authUser.id) === userId) {
        setUserName(`${authUser.nombre} ${authUser.apellidos ?? ""}`);
        initialValues.direccion = authUser.direccion || "";
      } else if (userId) {
        try {
          const res = await api.get(`/users/${userId}`);
          const u = res.data.data ?? res.data;
          setUserName(`${u.nombre} ${u.apellidos ?? ""}`);
          initialValues.direccion = u.direccion || "";
        } catch (error) {
          console.error("Error cargando usuario:", error);
        }
      }

      // Sincronización final de valores iniciales
      reset(initialValues);

      // 2. Lista de vehículos completa (en segundo plano)
      if (userId) {
        try {
          const resV = await api.get(`/vehiculos?user_id=${userId}`);
          const vList = Array.isArray(resV.data) ? resV.data : resV.data.data ?? [];
          setVehiculos(vList);
        } catch (error) {
          console.error("Error cargando vehículos:", error);
        }
      }
    };

    fetchData();
  }, [userId, authUser, searchParams, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/solicitudes", {
        ...data,
        user_cliente_id: Number(userId),
      });
      toast.success("¡Solicitud creada con éxito!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creando solicitud:", error);
      const msg = error.response?.data?.message || "No se pudo crear la solicitud. Comprueba que el vehículo no tenga ya una solicitud activa.";
      toast.error(msg);
    }
  };

  return (
    <div className="w-full space-y-6">
      <span className="text-4xl font-bold inline-block">Nueva solicitud</span>

      <CardSinBorde className="w-full">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Vehículo *
                </label>
                {searchParams.get("vehiculo_id") ? (
                  <div className="w-full border rounded-md px-3 py-2 text-sm bg-muted flex items-center gap-2">
                    <Car size={16} className="text-blue-600" />
                    <span className="font-medium">
                      {(() => {
                        const vId = searchParams.get("vehiculo_id");
                        const v_marca = searchParams.get("v_marca");
                        const v_modelo = searchParams.get("v_modelo");
                        const v_matricula = searchParams.get("v_matricula");

                        if (v_marca && v_modelo) {
                          return `${v_marca} ${v_modelo} — ${v_matricula}`;
                        }

                        const v = vehiculos.find(
                          (item) => item.id == Number(vId)
                        );
                        return v
                          ? `${v.marca} ${v.modelo} — ${v.matricula}`
                          : "Cargando vehículo...";
                      })()}
                    </span>
                    <input type="hidden" {...register("vehiculo_id")} />
                  </div>
                ) : (
                  <>
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
                  </>
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
                <label className="text-sm text-muted-foreground">Notas</label>
                <Input
                  type="text"
                  {...register("notas")}
                  placeholder="Ej: Recoger en el garaje comunitario, llamar antes de llegar..."
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
