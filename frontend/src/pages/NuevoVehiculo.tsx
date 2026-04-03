import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useHeader } from "@/context/HeaderContext";

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
    .or(z.literal("").transform(() => undefined)),
  kilometros: z.coerce
    .number()
    .min(0, "Los kilómetros no pueden ser negativos")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  fecha_ultima_itv: z.string().optional().or(z.literal("")),
});

export default function NuevoVehiculoPage() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });
  const { setHeaderData, setOnImageChange } = useHeader();

  useEffect(() => {
    setHeaderData({
      nombre: "Nuevo vehículo",
      imagen: imagePreview || "/avatars/default_car.png",
      isEditing: true,
    });
    return () => setHeaderData(null);
  }, [setHeaderData, imagePreview]);

  useEffect(() => {
    if (userId) {
      api.get(`/users/${userId}`).then((res) => {
        const u = res.data.data ?? res.data;
        setUserName(`${u.nombre} ${u.apellidos ?? ""}`);
      });
    }
  }, [userId]);

  // Registra el handler de imagen
  useEffect(() => {
    setOnImageChange(() => (file: File) => {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
    return () => setOnImageChange(null);
  }, [setOnImageChange]);

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
          formData.append(key, data[key]);
        }
      });
      formData.append("user_id", String(userId));
      if (imageFile) {
        formData.append("imagen", imageFile);
      }

      await api.post("/vehiculos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("¡Vehículo creado con éxito!");
      navigate("/vehiculos");
    } catch (error: any) {
      console.error("Error creando vehículo:", error);
      toast.error(
        "No se pudo crear el vehículo. Revisa que no exista ya con la misma matrícula o VIN."
      );
    }
  };

  return (
    <div className="w-full space-y-6">
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
                  {...register("año")}
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
                  {...register("kilometros")}
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
