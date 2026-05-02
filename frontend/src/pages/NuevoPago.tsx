import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import SolicitudesPage from "@/pages/Solicitudes";

const METODOS_PAGO = [
  { id: 1, nombre: "Efectivo" },
  { id: 2, nombre: "Tarjeta" },
  { id: 3, nombre: "Transferencia" },
];

const schema = z.object({
  solicitud_id: z.number().min(1, "Debes seleccionar una solicitud"),
  importe: z.coerce
    .number()
    .min(0, "El importe no puede ser negativo")
    .or(z.literal("").transform(() => undefined)),
  metodo_pago_id: z.number().optional().nullable(),
});

export default function NuevoPagoPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        tableContainerRef.current &&
        !tableContainerRef.current.contains(target)
      ) {
        // Prevent clearing if clicking on inputs/buttons so the user doesn't lose selection when filling the rest of the form
        if (["INPUT", "SELECT", "BUTTON", "LABEL"].includes(target.tagName) || target.closest("button") || target.closest("input")) {
          return;
        }
        setValue("solicitud_id", null as any);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setValue]);

  const solicitudId = watch("solicitud_id");

  useEffect(() => {
    if (solicitudId) {
      api.get(`/solicitudes/${solicitudId}`).then((res) => {
        const sol = res.data.data;
        if (sol.importe_cobro) {
          setValue("importe", sol.importe_cobro);
        }
      });
    } else {
      setValue("importe", undefined as any);
    }
  }, [solicitudId, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await api.post("/pagos", { ...data, estado_pago_id: 2 });
      toast.success("¡Pago registrado con éxito!", {
        description: "El pago de la solicitud ha sido procesado correctamente.",
      });
      navigate("/pagos");
    } catch (error: any) {
      console.error("Error creando pago:", error);
      toast.error("Ocurrió un error al registrar el pago.");
    }
  };

  return (
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Solicitudes */}
            <div className="space-y-2 mb-4">
              <div ref={tableContainerRef}>
                <SolicitudesPage
                  sinPago
                  onSelect={(id) => setValue("solicitud_id", id)}
                  selectedId={watch("solicitud_id")}
                />
              </div>
              {errors.solicitud_id && (
                <p className="text-red-500 text-xs">
                  {errors.solicitud_id.message}
                </p>
              )}
            </div>

            {/* Importe y método */}
            {watch("solicitud_id") ? (
              <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Importe (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("importe")}
                  placeholder="0.00"
                />
                {errors.importe && (
                  <p className="text-red-500 text-xs">
                    {errors.importe.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Método de pago
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={watch("metodo_pago_id") ?? ""}
                  onChange={(e) =>
                    setValue(
                      "metodo_pago_id",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                >
                  <option value="">Sin especificar</option>
                  {METODOS_PAGO.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end mt-10 pt-6 border-t-2 border-primary font-bold">
              <Button
                className="w-full md:w-50"
                type="button"
                variant="outline"
                onClick={() => navigate("/pagos")}
              >
                Cancelar
              </Button>
              <Button className="w-full md:w-50" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Registrar pago"}
              </Button>
            </div>
            </>
            ) : (
              <div className="text-center py-10 mt-6 border-t-2 border-primary">
                 <p className="text-muted-foreground font-medium">Selecciona una solicitud pendiente de la lista superior para registrar su pago correspondiente.</p>
              </div>
            )}
          </form>
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
