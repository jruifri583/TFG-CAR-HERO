import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Car } from "lucide-react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/useAuth";

const schema = z.object({
  matricula: z
    .string()
    .min(1, "La matrícula es obligatoria")
    .max(20, "La matrícula no puede exceder los 20 caracteres"),
  vin: z
    .string()
    .min(1, "El VIN es obligatorio")
    .max(20, "El VIN no puede exceder los 20 caracteres"),
  marca: z
    .string()
    .max(100, "La marca no puede exceder los 100 caracteres")
    .optional()
    .or(z.literal("")),
  modelo: z
    .string()
    .max(100, "El modelo no puede exceder los 100 caracteres")
    .optional()
    .or(z.literal("")),
  año: z.coerce
    .number()
    .min(1900, "El año debe ser posterior a 1900")
    .max(new Date().getFullYear() + 1, "Año no válido")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => undefined)),
  kilometros: z.coerce
    .number()
    .min(0, "Los kilómetros no pueden ser negativos")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => undefined)),
  fecha_ultima_itv: z.string().optional().or(z.literal("")),
});

interface Vehiculo {
  id: number;
  imagen: string | null;
  matricula: string;
  vin: string;
  marca: string | null;
  modelo: string | null;
  año: number | null;
  kilometros: number | null;
  fecha_ultima_itv: string | null;
  cliente: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
  } | null;
}

export default function VehiculoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { setHeaderData, setOnImageChange } = useHeader();
  const { user } = useAuth();
  const role = user?.rol?.slug;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get(`/vehiculos/${id}`).then((res) => {
      const data = res.data.data ?? res.data;
      setVehiculo(data);
      reset({
        matricula: data.matricula ?? "",
        vin: data.vin ?? "",
        marca: data.marca ?? "",
        modelo: data.modelo ?? "",
        año: data.año ?? null,
        kilometros: data.kilometros ?? null,
        fecha_ultima_itv: data.fecha_ultima_itv ? data.fecha_ultima_itv.split("T")[0] : "",
      });
    });
  }, [id]);

  // Actualiza header cuando cambia vehiculo o isEditing
  useEffect(() => {
    if (vehiculo) {
      setHeaderData({
        nombre: `${vehiculo.marca ?? ""} ${vehiculo.modelo ?? ""}`.trim() || "Detalle vehículo",
        imagen: vehiculo.imagen || "/avatars/default_car.png",
        isEditing,
      });
    }
    return () => setHeaderData(null);
  }, [vehiculo, isEditing, setHeaderData]);

  // Registra el handler de imagen
  useEffect(() => {
    setOnImageChange(() => async (file: File) => {
      const formData = new FormData();
      formData.append("imagen", file);
      try {
        const res = await api.post(`/vehiculos/${id}/imagen`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newImage = res.data.imagen;
        setVehiculo((prev) => (prev ? { ...prev, imagen: newImage } : prev));
        setHeaderData({
          nombre: `${vehiculo?.marca ?? ""} ${vehiculo?.modelo ?? ""}`.trim(),
          imagen: newImage,
          isEditing,
        });
      } catch (error) {
        console.error("Error actualizando imagen:", error);
      }
    });
    return () => setOnImageChange(null);
  }, [id, vehiculo, isEditing, setHeaderData, setOnImageChange]);

  const handleCancel = () => {
    reset({
      matricula: vehiculo?.matricula ?? "",
      vin: vehiculo?.vin ?? "",
      marca: vehiculo?.marca ?? "",
      modelo: vehiculo?.modelo ?? "",
      año: vehiculo?.año ?? null,
      kilometros: vehiculo?.kilometros ?? null,
      fecha_ultima_itv: vehiculo?.fecha_ultima_itv ? vehiculo.fecha_ultima_itv.split("T")[0] : "",
    });
    setIsEditing(false);
  };

  const onSubmit = async (data: any) => {
    try {
      const res = await api.put(`/vehiculos/${id}`, {
        ...data,
        user_id: vehiculo?.cliente?.id,
      });
      const updated = res.data.vehiculo;
      setVehiculo(updated);
      reset({
        matricula: updated.matricula ?? "",
        vin: updated.vin ?? "",
        marca: updated.marca ?? "",
        modelo: updated.modelo ?? "",
        año: updated.año ?? null,
        kilometros: updated.kilometros ?? null,
        fecha_ultima_itv: updated.fecha_ultima_itv ? updated.fecha_ultima_itv.split("T")[0] : "",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error actualizando vehículo:", error);
    }
  };

  if (!vehiculo) return <p>Cargando...</p>;

  const readOnlyClass = !isEditing ? "bg-transparent pointer-events-none" : "bg-white";

  return (
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-6 pt-6">
          
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Bloque 1: Info Básica */}
              <div className="space-y-4 border-b-2 border-primary pb-8 sm:border-b-0 sm:pb-0 sm:border-r-2 sm:border-primary sm:pr-8">
                <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Car className="text-primary" size={20} />
                  </div>
                  <h3 className="font-bold text-lg">Información del Vehículo</h3>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Matrícula</label>
                  <Input
                    type="text"
                    {...register("matricula")}
                    readOnly={!isEditing}
                    className={`${readOnlyClass} border-slate-200`}
                    onChange={(e) => {
                      let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                      let formatted = val;

                      // Patron moderno: 1234 ABC
                      if (/^\d/.test(val)) {
                        if (val.length > 4) {
                          formatted = val.slice(0, 4) + " " + val.slice(4, 7);
                        }
                      } 
                      // Patron provincial Cordoba/Madrid: MA 1234 AB
                      else {
                        const matches = val.match(/^([A-Z]{1,2})(\d{0,4})([A-Z]{0,2})$/);
                        if (matches) {
                          const [, prov, nums, suffix] = matches;
                          formatted = prov;
                          if (nums) formatted += " " + nums;
                          if (suffix) formatted += " " + suffix;
                        }
                      }
                      
                      e.target.value = formatted;
                      register("matricula").onChange(e);
                    }}
                  />
                  {errors.matricula && (
                    <p className="text-red-500 text-xs font-medium">{errors.matricula.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">VIN (Bastidor)</label>
                  <Input
                    type="text"
                    {...register("vin")}
                    readOnly={!isEditing}
                    className={`${readOnlyClass} border-slate-200`}
                  />
                  {errors.vin && (
                    <p className="text-red-500 text-xs font-medium">{errors.vin.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Marca</label>
                    <Input
                      type="text"
                      {...register("marca")}
                      readOnly={!isEditing}
                      className={`${readOnlyClass} border-slate-200`}
                    />
                    {errors.marca && (
                      <p className="text-red-500 text-xs font-medium">{errors.marca.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Modelo</label>
                    <Input
                      type="text"
                      {...register("modelo")}
                      readOnly={!isEditing}
                      className={`${readOnlyClass} border-slate-200`}
                    />
                    {errors.modelo && (
                      <p className="text-red-500 text-xs font-medium">{errors.modelo.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bloque 2: Detalles Técnicos */}
              <div className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Año</label>
                    <Input
                      type="number"
                      {...register("año")}
                      readOnly={!isEditing}
                      className={`${readOnlyClass} border-slate-200`}
                    />
                    {errors.año && (
                      <p className="text-red-500 text-xs font-medium">{errors.año.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Kilómetros</label>
                    <Input
                      type="number"
                      {...register("kilometros")}
                      readOnly={!isEditing}
                      className={`${readOnlyClass} border-slate-200`}
                    />
                    {errors.kilometros && (
                      <p className="text-red-500 text-xs font-medium">{errors.kilometros.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-sm font-medium">Fecha última ITV</label>
                  <Input
                    type="date"
                    {...register("fecha_ultima_itv")}
                    readOnly={!isEditing}
                    className={`${readOnlyClass} border-slate-200`}
                  />
                  {errors.fecha_ultima_itv && (
                    <p className="text-red-500 text-xs font-medium">{errors.fecha_ultima_itv.message}</p>
                  )}
                </div>

                {/* Propietario (solo admin/empleado) */}
                {role !== "cliente" && (
                  <div className="pt-6 border-t-2 border-primary mt-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Propietario</h4>
                    {vehiculo.cliente ? (
                      <div className="bg-slate-50 p-3 rounded-md border border-slate-100 flex flex-col gap-1">
                        <p className="text-sm font-bold">{vehiculo.cliente.nombre} {vehiculo.cliente.apellidos}</p>
                        <p className="text-xs text-muted-foreground">{vehiculo.cliente.email}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Sin propietario asignado</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end mt-10 pt-6 border-t-2 border-primary font-bold">
              {!isEditing ? (
                <>
                  <Button
                    className="w-40"
                    type="button"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar Vehículo
                  </Button>
                  <Button
                    className="w-40"
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
                    className="w-40"
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button className="w-40" type="submit">
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
