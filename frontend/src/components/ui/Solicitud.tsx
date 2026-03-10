import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Clock, X } from "lucide-react";

const ESTADOS = [
  { slug: "pendiente", label: "Pendiente" },
  { slug: "asignado", label: "Asignado" },
  { slug: "en_recogida", label: "En recogida" },
  { slug: "en_itv", label: "En ITV" },
  { slug: "retornando", label: "Retornando" },
  { slug: "finalizado", label: "Finalizado" },
];

interface Solicitud {
  id: number;
  estado: { slug: string; nombre: string };
  hora_recogida: string | null;
  hora_itv: string | null;
  hora_entrega: string | null;
  fecha_programada: string | null;
  notas: string | null;
}

interface Props {
  solicitud: Solicitud;
}

function getHora(slug: string, solicitud: Solicitud): string | null {
  if (slug === "en_recogida") return solicitud.hora_recogida;
  if (slug === "en_itv") return solicitud.hora_itv;
  if (slug === "finalizado") return solicitud.hora_entrega;
  return null;
}

function formatHora(iso: string | null): string {
  if (!iso) return "";
  return format(new Date(iso), "dd MMM HH:mm", { locale: es });
}

export default function Solicitud({ solicitud }: Props) {
  const estadoActual = solicitud.estado.slug;
  const cancelado = estadoActual === "cancelado";

  const indexActual = ESTADOS.findIndex((e) => e.slug === estadoActual);

  return (
    <div className="px-6 py-4 bg-muted/40 border-t">
      {cancelado ? (
        <div className="flex items-center gap-2 text-destructive font-medium">
          <X size={18} />
          <span>Solicitud cancelada</span>
          {solicitud.notas && (
            <span className="text-muted-foreground text-sm ml-2">
              — {solicitud.notas}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {ESTADOS.map((estado, index) => {
            const completado = index < indexActual;
            const activo = index === indexActual;
            const pendiente = index > indexActual;
            const hora = getHora(estado.slug, solicitud);

            return (
              <div key={estado.slug} className="flex items-center">
                {/* Nodo */}
                <div className="flex flex-col items-center min-w-[80px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                      ${completado ? "bg-primary border-primary text-white" : ""}
                      ${activo ? "bg-primary border-primary text-white ring-4 ring-primary/20" : ""}
                      ${pendiente ? "bg-white border-muted-foreground/30 text-muted-foreground" : ""}
                    `}
                  >
                    {completado ? (
                      <Check size={14} />
                    ) : activo ? (
                      <Clock size={14} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 text-center leading-tight
                      ${activo ? "text-primary font-semibold" : ""}
                      ${completado ? "text-primary" : ""}
                      ${pendiente ? "text-muted-foreground" : ""}
                    `}
                  >
                    {estado.label}
                  </span>
                  {hora && (
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {formatHora(hora)}
                    </span>
                  )}
                </div>

                {/* Línea conectora */}
                {index < ESTADOS.length - 1 && (
                  <div
                    className={`h-0.5 w-8 mx-1 transition-all ${
                      index < indexActual
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info extra */}
      {solicitud.fecha_programada && (
        <p className="text-xs text-muted-foreground mt-2">
          📅 Fecha programada: {formatHora(solicitud.fecha_programada)}
        </p>
      )}
    </div>
  );
}
