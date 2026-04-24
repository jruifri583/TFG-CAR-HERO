import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import UsersPage from "@/pages/Users";
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
  const { id: paramUserId } = useParams();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const actualUserId = paramUserId ? Number(paramUserId) : selectedUserId;
  const [userName, setUserName] = useState("");
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !paramUserId &&
        tableContainerRef.current &&
        !tableContainerRef.current.contains(target)
      ) {
        if (["INPUT", "SELECT", "BUTTON", "LABEL"].includes(target.tagName) || target.closest("button") || target.closest("input")) {
          return;
        }
        setSelectedUserId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [paramUserId]);
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
    if (actualUserId) {
      api.get(`/users/${actualUserId}`).then((res) => {
        const u = res.data.data ?? res.data;
        setUserName(`${u.nombre} ${u.apellidos ?? ""}`);
      });
    } else {
      setUserName("");
    }
  }, [actualUserId]);

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
      formData.append("user_id", String(actualUserId));
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
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-6 pt-6">
          {!paramUserId && (
            <div ref={tableContainerRef}>
              <UsersPage isSelector onSelect={setSelectedUserId} selectedId={selectedUserId} />
            </div>
          )}

          {actualUserId ? (
            <>
            {userName && (
              <div className="flex items-center gap-2 bg-slate-50 border p-3 rounded-lg mb-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-tight">Propietario:</span>
                <span className="text-sm font-bold text-slate-900 underline underline-offset-4">{userName}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Bloque 1: Info Básica */}
              <div className="space-y-4 border-b-2 border-primary pb-8 sm:border-b-0 sm:pb-0 sm:border-r-2 sm:border-primary sm:pr-8">
                <h3 className="font-bold text-lg mb-4">Información del Vehículo</h3>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Matrícula *</label>
                  <Input
                    type="text"
                    {...register("matricula")}
                    placeholder="1234 ABC"
                    className="border-slate-200"
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
                  <label className="text-sm font-medium">VIN (Bastidor) *</label>
                  <Input
                    type="text"
                    {...register("vin")}
                    placeholder="VIN del vehículo"
                    className="border-slate-200"
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
                      placeholder="Toyota"
                      className="border-slate-200"
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
                      placeholder="Corolla"
                      className="border-slate-200"
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
                      placeholder="2020"
                      className="border-slate-200"
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
                      placeholder="50000"
                      className="border-slate-200"
                    />
                    {errors.kilometros && (
                      <p className="text-red-500 text-xs font-medium">{errors.kilometros.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-sm font-medium">Fecha última ITV</label>
                  <Input type="date" {...register("fecha_ultima_itv")} className="border-slate-200" />
                  {errors.fecha_ultima_itv && (
                    <p className="text-red-500 text-xs font-medium">{errors.fecha_ultima_itv.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end mt-10 pt-6 border-t-2 border-primary font-bold">
              <Button
                className="w-40"
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button className="w-40" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear Vehículo"}
              </Button>
            </div>
            </form>
            </>
          ) : (
            <div className="text-center py-10 mt-6 border-t-2 border-primary">
               <p className="text-muted-foreground font-medium">Selecciona un usuario de la lista superior para registrar su nuevo vehículo.</p>
            </div>
          )}
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
