import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import SolicitudCircularTracker from "@/components/ui/SolicitudCircularTracker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Solicitud {
  id: number;
  direccion: string;
  fecha_programada: string | null;
  hora_recogida: string | null;
  hora_itv: string | null;
  hora_entrega: string | null;
  notas: string | null;
  cliente: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    imagen: string | null;
  } | null;
  vehiculo: {
    id: number;
    matricula: string;
    marca: string;
    modelo: string;
    imagen: string | null;
  } | null;
  estado: { id: number; slug: string; nombre: string } | null;
  empleado: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
  } | null;
  resolucion: { id: number; nombre: string } | null;
  pago: {
    id: number;
    importe: number;
    metodo_pago: { id: number; nombre: string } | null;
    estado_pago: { id: number; nombre: string } | null;
  } | null;
}

function fmt(iso: string | null) {
  if (!iso) return "-";
  return format(new Date(iso), "dd MMM yyyy HH:mm", { locale: es });
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <Input
        type="text"
        value={value ?? ""}
        readOnly
        className="pointer-events-none focus:ring-0 focus:outline-none"
      />
    </div>
  );
}

export default function SolicitudDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);

  useEffect(() => {
    api.get(`/solicitudes/${id}`).then((res) => setSolicitud(res.data.data));
  }, [id]);

  if (!solicitud) return <p>Cargando...</p>;

  return (
    <div className="w-full space-y-6">
      <span className="text-4xl font-bold inline-block">
        Solicitud #{solicitud.id}
      </span>

      {/* Datos principales */}
      <CardSinBorde className="w-full">
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Dirección" value={solicitud.direccion} />
          <Field
            label="Fecha programada"
            value={fmt(solicitud.fecha_programada)}
          />
          <Field label="Estado" value={solicitud.estado?.nombre ?? "-"} />
          <Field
            label="Resolución"
            value={solicitud.resolucion?.nombre ?? "-"}
          />
          <Field label="Notas" value={solicitud.notas ?? "-"} />
        </CardContent>
      </CardSinBorde>

      {/* Cliente */}
      <CardSinBorde className="w-full">
        <CardContent className="space-y-4">
          <p className="font-semibold text-lg">Cliente</p>
          <div className="flex items-center gap-4">
            <img
              src={solicitud.cliente?.imagen ?? "/avatars/default_user.png"}
              className="w-14 h-14 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/avatars/default_user.png";
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <Field
                label="Nombre"
                value={`${solicitud.cliente?.nombre ?? ""} ${solicitud.cliente?.apellidos ?? ""}`}
              />
              <Field label="Email" value={solicitud.cliente?.email ?? "-"} />
            </div>
          </div>
        </CardContent>
      </CardSinBorde>

      {/* Vehículo */}
      <CardSinBorde className="w-full">
        <CardContent className="space-y-4">
          <p className="font-semibold text-lg">Vehículo</p>
          <div className="flex items-center gap-4">
            <img
              src={solicitud.vehiculo?.imagen ?? "/avatars/default_car.png"}
              className="w-14 h-14 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avatars/default_car.png";
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <Field
                label="Matrícula"
                value={solicitud.vehiculo?.matricula ?? "-"}
              />
              <Field
                label="Marca / Modelo"
                value={`${solicitud.vehiculo?.marca ?? ""} ${solicitud.vehiculo?.modelo ?? ""}`}
              />
            </div>
          </div>
        </CardContent>
      </CardSinBorde>

      {/* Empleado */}
      <CardSinBorde className="w-full">
        <CardContent className="space-y-4">
          <p className="font-semibold text-lg">Empleado</p>
          {solicitud.empleado ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nombre"
                value={`${solicitud.empleado.nombre} ${solicitud.empleado.apellidos}`}
              />
              <Field label="Email" value={solicitud.empleado.email} />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Sin asignar</p>
          )}
        </CardContent>
      </CardSinBorde>

      {/* Pago */}
      <CardSinBorde className="w-full">
        <CardContent className="space-y-4">
          <p className="font-semibold text-lg">Pago</p>
          {solicitud.pago ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Importe" value={`${solicitud.pago.importe} €`} />
              <Field
                label="Método de pago"
                value={solicitud.pago.metodo_pago?.nombre ?? "-"}
              />
              <Field
                label="Estado del pago"
                value={solicitud.pago.estado_pago?.nombre ?? "-"}
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Sin pago asociado</p>
          )}
        </CardContent>
      </CardSinBorde>

      {/* Horas + Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horas */}
        <CardSinBorde className="w-full">
          <CardContent className="space-y-4">
            <p className="font-semibold text-lg">Seguimiento horario</p>
            <div className="grid grid-cols-1 gap-4">
              <Field
                label="Hora recogida"
                value={fmt(solicitud.hora_recogida)}
              />
              <Field label="Hora ITV" value={fmt(solicitud.hora_itv)} />
              <Field label="Hora entrega" value={fmt(solicitud.hora_entrega)} />
            </div>
          </CardContent>
        </CardSinBorde>

        {/* Tracker circular */}
        <CardSinBorde className="w-full">
          <CardContent className="flex justify-center items-center">
            <SolicitudCircularTracker estado={solicitud.estado} />
          </CardContent>
        </CardSinBorde>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2">
        <Button className="w-50" variant="outline" onClick={() => navigate(-1)}>
          Atrás
        </Button>
        <Button
          className="w-50"
          onClick={() => navigate(`/solicitudes/${id}/editar`)}
        >
          Editar
        </Button>
      </div>
    </div>
  );
}
