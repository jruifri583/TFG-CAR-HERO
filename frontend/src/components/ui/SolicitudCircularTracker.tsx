import { Clock, UserCheck, Car, Building2, RotateCcw, CheckCircle, X } from "lucide-react";

// Orden completo del flujo
const ESTADOS = [
  { slug: "pendiente",   label: "Pendiente",   Icon: Clock        },
  { slug: "asignado",    label: "Asignado",    Icon: UserCheck    },
  { slug: "en_recogida", label: "En recogida", Icon: Car          },
  { slug: "en_itv",      label: "En ITV",      Icon: Building2    },
  { slug: "retornando",  label: "Retornando",  Icon: RotateCcw    },
  { slug: "finalizado",  label: "Finalizado",  Icon: CheckCircle  },
];

const TOTAL = ESTADOS.length; // 6
// Cada paso ocupa 360/6 = 60°. Empezamos en la parte superior (−90° = 270° en SVG coords)
const angleForIndex = (i: number) => (360 / TOTAL) * i - 90;

interface Props {
  estado: { slug: string; nombre: string } | null;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/** Describe un arco SVG desde startAngle hasta endAngle (en grados, sentido horario) */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // Normaliza para que endAngle >= startAngle
  if (endAngle < startAngle) endAngle += 360;
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end   = polarToCartesian(cx, cy, r, endAngle);
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function SolicitudCircularTracker({ estado }: Props) {
  const estadoActual = estado?.slug ?? "";
  const cancelado    = estadoActual === "cancelado";
  const indexActual  = ESTADOS.findIndex((e) => e.slug === estadoActual);

  const cx = 160;
  const cy = 160;
  const r  = 100;

  // El arco va desde el primer nodo hasta el nodo activo
  const startAngle = angleForIndex(0);
  const endAngle   = indexActual > 0 ? angleForIndex(indexActual) : startAngle;

  return (
    <div className="relative w-[320px] h-[320px]">
      <svg width="320" height="320" className="absolute inset-0">
        {/* Arco base gris — del primer nodo (pendiente) al último (finalizado) */}
        <path
          d={describeArc(cx, cy, r, angleForIndex(0), angleForIndex(TOTAL - 1))}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Arco de progreso azul */}
        {!cancelado && indexActual > 0 && (
          <path
            d={describeArc(cx, cy, r, startAngle, endAngle)}
            fill="none"
            stroke="#2563eb"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}

        {/* Nodos */}
        {ESTADOS.map((e, index) => {
          const angle     = angleForIndex(index);
          const pos       = polarToCartesian(cx, cy, r, angle);
          const completado = index < indexActual;
          const activo     = index === indexActual;
          const fill       = completado ? "#2563eb" : activo ? "#2563eb" : "white";
          const stroke     = completado || activo ? "#2563eb" : "#d1d5db";

          return (
            <circle
              key={e.slug}
              cx={pos.x}
              cy={pos.y}
              r={18}
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Iconos sobre los nodos */}
      {ESTADOS.map((e, index) => {
        const angle      = angleForIndex(index);
        const pos        = polarToCartesian(cx, cy, r, angle);
        const completado = index < indexActual;
        const activo     = index === indexActual;
        const { Icon }   = e;

        return (
          <div
            key={e.slug}
            className="absolute flex flex-col items-center"
            style={{ left: pos.x - 18, top: pos.y - 18, width: 36, height: 36 }}
          >
            <Icon
              size={15}
              className={
                completado || activo ? "text-white mt-[10px]" : "text-gray-400 mt-[10px]"
              }
            />
          </div>
        );
      })}



      {/* Icono / texto central */}
      <div className="absolute inset-0 flex items-center justify-center">
        {cancelado ? (
          <div className="flex flex-col items-center text-red-500">
            <X size={32} />
            <span className="text-xs mt-1 font-medium">Cancelado</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Car size={28} className="text-primary" />
            <span className="text-xs mt-1 font-semibold text-primary capitalize">
              {estado?.nombre ?? "Pendiente"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
