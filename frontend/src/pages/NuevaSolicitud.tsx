import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { useHeader } from "@/context/HeaderContext";
import { toast } from "sonner";

const schema = z.object({
  vehiculo_id: z.number().min(1, "Debes seleccionar un vehículo"),
  direccion: z
    .string()
    .min(1, "La dirección es obligatoria")
    .max(255, "La dirección no puede exceder los 255 caracteres"),
  fecha_programada: z.string().optional().or(z.literal("")),
  notas: z
    .string()
    .max(500, "Las notas no pueden exceder los 500 caracteres")
    .optional()
    .or(z.literal("")),
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
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [direcciones, setDirecciones] = useState<string[]>([]);
  const { user: authUser } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const { setHeaderData } = useHeader();

  useEffect(() => {
    setHeaderData({
      nombre: "Nueva solicitud",
      imagen: "/avatars/solicitudes.png",
    });
    return () => setHeaderData(null);
  }, [setHeaderData]);

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
        initialValues.direccion = authUser.direccion || "";
        
        // Direcciones sugeridas
        const previous = (authUser as any).direcciones_anteriores || [];
        const unique = Array.from(new Set([authUser.direccion, ...previous])).filter(Boolean) as string[];
        setDirecciones(unique);
      } else if (userId) {
        try {
          const res = await api.get(`/users/${userId}`);
          const u = res.data.data ?? res.data;
          initialValues.direccion = u.direccion || "";
          // Direcciones sugeridas del cliente seleccionado
          const previous = u.direcciones_anteriores || [];
          const unique = Array.from(new Set([u.direccion, ...previous])).filter(Boolean) as string[];
          setDirecciones(unique);
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

      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-6 pt-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Bloque 1: Detalles del Servicio */}
              <div className="space-y-4 border-b pb-8 sm:border-b-0 sm:pb-0 sm:border-r sm:border-black sm:pr-8">
                <h3 className="font-bold text-lg mb-4">Detalles del Servicio</h3>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Vehículo *</label>
                  {searchParams.get("vehiculo_id") ? (
                    <div className="w-full border rounded-md px-3 py-2 text-sm bg-slate-50 flex items-center gap-2 border-slate-200">
                      <Car size={16} className="text-primary" />
                      <span className="font-medium text-foreground">
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
                      <div className="relative">
                        <select
                          className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-background pr-10 appearance-none focus:ring-2 focus:ring-primary outline-none transition-all"
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
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                      </div>
                      {errors.vehiculo_id && (
                        <p className="text-red-500 text-xs font-medium">
                          {errors.vehiculo_id.message}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Dirección de recogida *</label>
                  <div className="relative">
                    <Input
                      type="text"
                      {...register("direccion")}
                      placeholder="Calle, número, ciudad"
                      list={direcciones.length > 1 ? "direcciones-sugeridas" : undefined}
                      className="border-slate-200"
                    />
                    {direcciones.length > 1 && (
                      <ChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    )}
                  </div>
                  {direcciones.length > 1 && (
                    <datalist id="direcciones-sugeridas">
                      {direcciones.map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  )}
                  {errors.direccion && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.direccion.message}
                    </p>
                  )}
                </div>

                {authUser?.rol?.slug !== "cliente" && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Fecha programada</label>
                    <Input
                      type="datetime-local"
                      {...register("fecha_programada")}
                      className="border-slate-200"
                    />
                  </div>
                )}
              </div>

              {/* Bloque 2: Información Adicional */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg mb-4">Información Adicional</h3>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-primary uppercase text-[10px] tracking-wider font-extrabold mb-2 block">Instrucciones o Notas</label>
                  <Textarea
                    {...register("notas")}
                    placeholder="Ej: Recoger en el garaje comunitario, llamar antes de llegar..."
                    className="min-h-[120px] bg-slate-50/50 border-slate-200"
                  />
                  {errors.notas && (
                    <p className="text-red-500 text-xs font-medium">
                      {errors.notas.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end mt-10 pt-6 border-t border-black font-bold">
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
