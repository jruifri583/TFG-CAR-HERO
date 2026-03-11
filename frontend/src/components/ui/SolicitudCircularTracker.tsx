import { X, Car, Building2, RotateCcw, CheckCircle } from "lucide-react";

const ESTADOS = [
  { slug: "en_recogida", label: "En recogida", angle: 270, Icon: Car },
  { slug: "en_itv", label: "En ITV", angle: 0, Icon: Building2 },
  { slug: "retornando", label: "Retornando", angle: 90, Icon: RotateCcw },
  { slug: "finalizado", label: "Finalizado", angle: 180, Icon: CheckCircle },
];

interface Props {
  estado: { slug: string; nombre: string } | null;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export default function SolicitudCircularTracker({ estado }: Props) {
  const estadoActual = estado?.slug ?? "";
  const cancelado = estadoActual === "cancelado";
  const indexActual = ESTADOS.findIndex((e) => e.slug === estadoActual);

  const cx = 160;
  const cy = 160;
  const r = 100;

  const startAngle = ESTADOS[0].angle;
  const endAngle = indexActual >= 0 ? ESTADOS[indexActual].angle : startAngle;
  const progressAngle =
    endAngle <= startAngle && indexActual > 0 ? endAngle + 360 : endAngle;

  return (
    <div className="relative w-[320px] h-[320px]">
      <svg width="320" height="320" className="absolute inset-0">
        {/* Círculo base gris */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />

        {/* Arco de progreso azul */}
        {!cancelado && indexActual > 0 && (
          <path
            d={describeArc(cx, cy, r, startAngle, progressAngle)}
            fill="none"
            stroke="#2563eb"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}

        {/* Nodos */}
        {ESTADOS.map((e, index) => {
          const pos = polarToCartesian(cx, cy, r, e.angle);
          const completado = index < indexActual;
          const activo = index === indexActual;

          return (
            <g key={e.slug}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={18}
                fill={completado || activo ? "#2563eb" : "white"}
                stroke={completado || activo ? "#2563eb" : "#d1d5db"}
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>

      {/* Iconos sobre los nodos (foreignObject no funciona bien en SVG, usamos divs absolutos) */}
      {ESTADOS.map((e, index) => {
        const pos = polarToCartesian(cx, cy, r, e.angle);
        const completado = index < indexActual;
        const activo = index === indexActual;
        const { Icon } = e;

        return (
          <div
            key={e.slug}
            className="absolute flex items-center justify-center"
            style={{
              left: pos.x - 10,
              top: pos.y - 10,
              width: 20,
              height: 20,
            }}
          >
            <Icon
              size={14}
              className={completado || activo ? "text-white" : "text-gray-400"}
            />
          </div>
        );
      })}

      {/* Icono central */}
      <div className="absolute inset-0 flex items-center justify-center">
        {cancelado ? (
          <div className="flex flex-col items-center text-red-500">
            <X size={32} />
            <span className="text-xs mt-1 font-medium">Cancelado</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Car size={32} className="text-primary" />
            <span className="text-xs mt-1 font-medium capitalize text-muted-foreground">
              {estado?.nombre ?? "Pendiente"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
