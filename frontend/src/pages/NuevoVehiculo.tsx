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
  matricula: z.string().min(1, "La matrícula es obligatoria").max(20),
  vin: z.string().min(1, "El VIN es obligatorio").max(20),
  marca: z.string().max(100).optional().or(z.literal("")),
  modelo: z.string().max(100).optional().or(z.literal("")),
  año: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable(),
  kilometros: z.number().min(0).optional().nullable(),
  fecha_ultima_itv: z.string().optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function NuevoVehiculoPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.get(`/users/${userId}`).then((res) => {
      const u = res.data;
      setUserName(`${u.nombre} ${u.apellidos ?? ""}`);
    });
  }, [userId]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = { ...data, user_id: Number(userId) };
      await api.post("/vehiculos", payload);
      navigate(`/perfil/${userId}`);
    } catch (error: any) {
      console.error("Error creando vehículo:", error);
    }
  };

  return (
    <div className="w-full space-y-6">
      <span className="text-4xl font-bold inline-block">Nuevo vehículo</span>
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
                  Matrícula *
                </label>
                <Input
                  type="text"
                  {...register("matricula")}
                  placeholder="1234-ABC"
                />
                {errors.matricula && (
                  <p className="text-red-500 text-xs">
                    {errors.matricula.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">VIN *</label>
                <Input
                  type="text"
                  {...register("vin")}
                  placeholder="VIN del vehículo"
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
                  placeholder="Toyota"
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
                  placeholder="Corolla"
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
                  placeholder="2020"
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
                  placeholder="50000"
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
                <Input type="date" {...register("fecha_ultima_itv")} />
                {errors.fecha_ultima_itv && (
                  <p className="text-red-500 text-xs">
                    {errors.fecha_ultima_itv.message}
                  </p>
                )}
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
                {isSubmitting ? "Guardando..." : "Crear vehículo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
