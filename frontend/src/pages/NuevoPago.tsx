import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import SolicitudesPage from "@/pages/Solicitudes";

const METODOS_PAGO = [
  { id: 1, nombre: "Efectivo" },
  { id: 2, nombre: "Tarjeta" },
  { id: 3, nombre: "Transferencia" },
];

const schema = z.object({
  solicitud_id: z.number().min(1, "Selecciona una solicitud"),
  importe: z.number().min(0, "No puede ser negativo"),
  metodo_pago_id: z.number().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export default function NuevoPagoPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/pagos", { ...data, estado_pago_id: 2 });
      navigate("/pagos");
    } catch (error: any) {
      console.error("Error creando pago:", error);
    }
  };

  return (
    <div className="w-full">
      <CardSinBorde className="w-full">
        <CardContent className="flex flex-col gap-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Solicitudes */}
            <div className="space-y-2 mb-4">
              <label className="text-sm text-muted-foreground">
                Solicitud *
              </label>
              <div
                className={`rounded-lg overflow-hidden ${watch("solicitud_id") ? "border-primary" : ""}`}
              >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Importe (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("importe", { valueAsNumber: true })}
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

            <div className="flex flex-wrap gap-2 justify-end mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/pagos")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Registrar pago"}
              </Button>
            </div>
          </form>
        </CardContent>
      </CardSinBorde>
    </div>
  );
}
