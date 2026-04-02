import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    .max(20, "Máximo 20 caracteres"),
  vin: z
    .string()
    .min(1, "El VIN es obligatorio")
    .max(20, "Máximo 20 caracteres"),
  marca: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  modelo: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  año: z
    .number()
    .min(1900, "Año inválido")
    .max(new Date().getFullYear() + 1, "Año inválido")
    .optional()
    .nullable(),
  kilometros: z.number().min(0, "No puede ser negativo").optional().nullable(),
  fecha_ultima_itv: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

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
  } = useForm<FormData>({
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
        nombre: `${vehiculo.marca} ${vehiculo.modelo}`,
        matricula: vehiculo.matricula,
        imagen: vehiculo.imagen,
        isEditing,
      });
    }
    return () => setHeaderData(null);
  }, [vehiculo, isEditing]);

  // Registra el handler de imagen
  useEffect(() => {
    setOnImageChange(() => async (file: File) => {
      const formData = new FormData();
      formData.append("imagen", file);
      try {
        const res = await api.post(`/vehiculos/${id}/imagen`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setVehiculo((prev) =>
          prev ? { ...prev, imagen: res.data.imagen } : prev,
        );
        setHeaderData({
          nombre: `${vehiculo?.marca} ${vehiculo?.modelo}`,
          matricula: vehiculo?.matricula ?? "",
          imagen: res.data.imagen,
          isEditing,
        });
      } catch (error) {
        console.error("Error actualizando imagen:", error);
      }
    });
    return () => setOnImageChange(null);
  }, [id]);

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

  const onSubmit = async (data: FormData) => {
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

  const readOnlyClass = !isEditing
    ? "pointer-events-none focus:ring-0 focus:outline-none"
    : "";

  return (
    <div className="w-full space-y-6">
      <CardSinBorde className="w-full">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Matrícula
                </label>
                <Input
                  type="text"
                  {...register("matricula")}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.matricula && (
                  <p className="text-red-500 text-xs">
                    {errors.matricula.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">VIN</label>
                <Input
                  type="text"
                  {...register("vin")}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.vin && (
                  <p className="text-red-500 text-xs">{errors.vin.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Marca</label>
                <Input
                  type="text"
                  {...register("marca")}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.marca && (
                  <p className="text-red-500 text-xs">{errors.marca.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Modelo</label>
                <Input
                  type="text"
                  {...register("modelo")}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.modelo && (
                  <p className="text-red-500 text-xs">
                    {errors.modelo.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Año</label>
                <Input
                  type="number"
                  {...register("año", { valueAsNumber: true })}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.año && (
                  <p className="text-red-500 text-xs">{errors.año.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Kilómetros
                </label>
                <Input
                  type="number"
                  {...register("kilometros", { valueAsNumber: true })}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.kilometros && (
                  <p className="text-red-500 text-xs">
                    {errors.kilometros.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Fecha última ITV
                </label>
                <Input
                  type="date"
                  {...register("fecha_ultima_itv")}
                  readOnly={!isEditing}
                  className={readOnlyClass}
                />
                {errors.fecha_ultima_itv && (
                  <p className="text-red-500 text-xs">
                    {errors.fecha_ultima_itv.message}
                  </p>
                )}
              </div>
            </div>

            {/* Propietario */}
            {role !== "cliente" && (
              <CardSinBorde className="w-full mt-6">
                <CardContent className="space-y-4">
                  <p className="font-semibold text-lg">Propietario</p>
                  {vehiculo.cliente ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">
                          Nombre
                        </label>
                        <Input
                          type="text"
                          value={`${vehiculo.cliente.nombre} ${vehiculo.cliente.apellidos}`}
                          readOnly
                          className="pointer-events-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">
                          Email
                        </label>
                        <Input
                          type="text"
                          value={vehiculo.cliente.email}
                          readOnly
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Sin propietario
                    </p>
                  )}
                </CardContent>
              </CardSinBorde>
            )}

            <div className="flex flex-wrap gap-2 justify-end mt-6">
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
