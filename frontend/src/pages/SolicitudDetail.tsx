import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import SolicitudCircularTracker from "@/components/ui/SolicitudCircularTracker";
import { 
  FileText,
  Clock, MapPin, ShieldCheck, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/context/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHeader } from "@/context/HeaderContext";

// ─── Interfaces ────────────────────────────────────────────────────────────────

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

interface Resolucion {
  id: number;
  nombre: string;
}

interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
}

interface Estado {
  id: number;
  nombre: string;
  slug: string;
}

// Orden de estados avanzables
const ORDEN_ESTADOS = [
  "pendiente",
  "asignado",
  "en_recogida",
  "en_itv",
  "retornando",
  "finalizado",
];

// ─── Schema de edición ─────────────────────────────────────────────────────────

const editSchema = z
  .object({
    direccion: z
      .string()
      .min(1, "La dirección es obligatoria")
      .max(255, "La dirección no puede exceder los 255 caracteres"),
    fecha_programada: z.string().optional().or(z.literal("")),
    resolucion_id: z.number().nullable().optional(),
    user_empleado_id: z.number().nullable().optional(),
    notas: z
      .string()
      .max(500, "Las notas no pueden exceder los 500 caracteres")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.user_empleado_id && !data.fecha_programada) {
        return false;
      }
      return true;
    },
    {
      message: "Se requiere fecha programada para asignar un empleado.",
      path: ["user_empleado_id"],
    }
  );

type EditFormData = z.infer<typeof editSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "—",
}: {
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  options: { id: number; nombre: string }[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-muted-foreground">{label}</label>
      <select
        className="w-full border rounded-md px-3 py-2 text-sm bg-background border-input"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────

export default function SolicitudDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.rol?.slug;

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [editando, setEditando] = useState(false);

  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [avanzando, setAvanzando] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditFormData>({ resolver: zodResolver(editSchema) });
  const { setHeaderData } = useHeader();

  const cargarSolicitud = () =>
    api.get(`/solicitudes/${id}`).then((res) => setSolicitud(res.data.data));

  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  useEffect(() => {
    if (role !== "cliente") {
      api.get("/solicitudes/meta").then((res) => {
        setEstados(res.data.baseData?.estados ?? []);
        setResoluciones(res.data.baseData?.resoluciones ?? []);
        setEmpleados(res.data.empleados ?? []);
      });
    }

    if (role === "empleado") {
      api.get("/contadores").then((res) => {
        setIsBusy(res.data.has_active_request || false);
      });
    }
  }, [role]);

  useEffect(() => {
    if (editando && solicitud) {
      reset({
        direccion: solicitud.direccion ?? "",
        fecha_programada: solicitud.fecha_programada
          ? solicitud.fecha_programada.slice(0, 16)
          : "",
        resolucion_id: solicitud.resolucion?.id ?? null,
        user_empleado_id: solicitud.empleado?.id ?? null,
        notas: solicitud.notas ?? "",
      });
    }
  }, [editando, solicitud]);

  useEffect(() => {
    if (solicitud) {
      setHeaderData({
        nombre: editando ? "Editar solicitud" : `Solicitud`,
        imagen: null,
        avatar: String(solicitud.id), 
      });
    }
    return () => setHeaderData(null);
  }, [setHeaderData, solicitud, editando]);

  const siguienteEstado = (): Estado | null => {
    if (!solicitud?.estado) return null;
    const slugActual = solicitud.estado.slug;
    const posActual = ORDEN_ESTADOS.indexOf(slugActual);
    if (posActual === -1 || posActual >= ORDEN_ESTADOS.length - 1) return null;
    const slugSiguiente = ORDEN_ESTADOS[posActual + 1];
    return estados.find((e) => e.slug === slugSiguiente) ?? null;
  };

  const handleAvanzarEstado = async () => {
    const siguiente = siguienteEstado();
    if (!siguiente || !solicitud) return;
    setAvanzando(true);
    setServerError(null);
    try {
      await api.put(`/solicitudes/${id}`, {
        direccion: solicitud.direccion,
        estado_id: siguiente.id,
      });
      await cargarSolicitud();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.estado_id?.[0] ||
        "Error al avanzar el estado.";
      setServerError(msg);
    } finally {
      setAvanzando(false);
    }
  };

  const onSubmit = async (data: EditFormData) => {
    setServerError(null);
    try {
      await api.put(`/solicitudes/${id}`, {
        ...data,
        resolucion_id: data.resolucion_id ?? null,
        user_empleado_id: data.user_empleado_id ?? null,
        fecha_programada: data.fecha_programada || null,
        notas: data.notas || null,
      });
      await cargarSolicitud();
      setEditando(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.estado_id?.[0] ||
        "Error al actualizar la solicitud.";
      setServerError(msg);
    }
  };

  if (!solicitud) return <p className="p-8 text-center animate-pulse">Cargando...</p>;

  const siguiente = siguienteEstado();
  const puedeAvanzar =
    role !== "cliente" &&
    siguiente !== null &&
    solicitud.estado?.slug !== "pendiente" &&
    solicitud.estado?.slug !== "cancelado" &&
    solicitud.estado?.slug !== "finalizado";

  // ─── Vistas Secundarias ──────────────────────────────────────────────────────

  function MapCard({ direccion }: { direccion: string }) {
    const encoded = encodeURIComponent(direccion);
    return (
      <CardSinBorde className="h-[450px] lg:h-full min-h-[450px] overflow-hidden relative group p-0 gap-0 shadow-sm rounded-xl">
        <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2">
           <div className="bg-background/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-border flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <span className="text-xs font-bold text-foreground truncate max-w-[150px] sm:max-w-[200px]">{direccion}</span>
           </div>
           <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encoded}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2 text-xs font-bold hover:bg-primary/90 transition-all active:scale-95"
           >
              <ExternalLink size={14} /> Abrir en Maps
           </a>
        </div>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          allowFullScreen
          className="contrast-[1.1] brightness-[0.95]"
        ></iframe>
      </CardSinBorde>
    );
  }

  function EmpleadoDetailView() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7">
           <MapCard direccion={solicitud!.direccion} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <CardSinBorde className="border border-border shadow-sm h-full rounded-xl overflow-hidden relative">
            <CardContent className="p-6 flex flex-col h-full space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Estado de Servicio</Label>
                  <h3 className="text-xl font-semibold leading-none">
                    {solicitud!.estado?.nombre}
                  </h3>
                </div>
                <div className="bg-muted p-3 rounded-xl">
                   <Clock size={24} className="text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-primary flex items-center gap-2">
                   <ShieldCheck size={14} /> Resultado ITV
                </Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={solicitud!.resolucion?.id ?? ""}
                  onChange={async (e) => {
                    const rid = e.target.value ? Number(e.target.value) : null;
                    try {
                      setAvanzando(true);
                      await api.put(`/solicitudes/${id}`, { direccion: solicitud!.direccion, resolucion_id: rid });
                      await cargarSolicitud();
                    } catch(e) {
                      console.error(e);
                    } finally {
                      setAvanzando(false);
                    }
                  }}
                >
                  <option value="">-- Determinar resolución --</option>
                  {resoluciones.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 flex-1">
                <Label className="text-primary flex items-center gap-2">
                   <FileText size={14} /> Notas Operativas
                </Label>
                <Textarea 
                  className="min-h-[80px] resize-none"
                  placeholder="Observaciones..."
                  defaultValue={solicitud!.notas ?? ""}
                  onBlur={async (e) => {
                    const val = e.target.value;
                    if (val === solicitud!.notas) return;
                    try {
                      setAvanzando(true);
                      await api.put(`/solicitudes/${id}`, { direccion: solicitud!.direccion, notas: val });
                      await cargarSolicitud();
                    } catch(e) {
                      console.error(e);
                    } finally {
                      setAvanzando(false);
                    }
                  }}
                />
              </div>
              <div className="pt-2">
                 {puedeAvanzar ? (
                   <div className="space-y-3">
                     <Button 
                       onClick={handleAvanzarEstado}
                       disabled={avanzando || (isBusy && siguiente?.slug === 'en_recogida')}
                       className="w-full py-6 text-md font-bold uppercase tracking-wider"
                       variant={(isBusy && siguiente?.slug === 'en_recogida') ? 'outline' : 'default'}
                     >
                       {avanzando ? "Actualizando..." : 
                        (isBusy && siguiente?.slug === 'en_recogida') ? "Servicio activo" : 
                        `Avanzar a ${siguiente?.nombre}`}
                     </Button>
                     {isBusy && siguiente?.slug === 'en_recogida' && (
                        <p className="text-center text-destructive font-medium animate-pulse">
                          * Tienes otro servicio activo pendiente de entrega.
                        </p>
                     )}
                   </div>
                 ) : (
                    <CardSinBorde className="bg-muted/50 p-4 rounded-xl text-center border border-dashed">
                      <p className="text-xs font-medium text-muted-foreground italic">Servicio finalizado o en espera de pago</p>
                    </CardSinBorde>
                 )}
              </div>
            </CardContent>
          </CardSinBorde>
        </div>
      </div>
    );
  }

  function StandardDetailView() {
    if (editando) {
      return (
        <div className="w-full space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <CardSinBorde className="w-full">
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Dirección *</label>
                  <Input type="text" {...register("direccion")} />
                  {errors.direccion && <p className="text-red-500 text-xs">{errors.direccion.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Fecha programada</label>
                  <Input type="datetime-local" {...register("fecha_programada")} />
                </div>
                <SelectField label="Resolución" value={watch("resolucion_id")} onChange={(v) => setValue("resolucion_id", v)} options={resoluciones} placeholder="Sin resolución" />
                {role === "administrador" && (
                  <div className="space-y-1">
                    <SelectField label="Empleado" value={watch("user_empleado_id")} onChange={(v) => setValue("user_empleado_id", v)} options={empleados.map((e) => ({ id: e.id, nombre: `${e.nombre} ${e.apellidos}` }))} placeholder="Sin asignar" />
                    {errors.user_empleado_id && <p className="text-red-500 text-xs">{errors.user_empleado_id.message}</p>}
                  </div>
                )}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm text-muted-foreground">Notas</label>
                  <Input type="text" {...register("notas")} placeholder="Observaciones opcionales" />
                  {errors.notas && <p className="text-red-500 text-xs">{errors.notas.message}</p>}
                </div>
              </CardContent>
            </CardSinBorde>
            {serverError && <p className="text-red-500 text-sm text-right font-bold italic">{serverError}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setEditando(false); setServerError(null); }}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar cambios"}</Button>
            </div>
          </form>
        </div>
      );
    }
    return (
      <div className="w-full space-y-6">
        <CardSinBorde className="w-full">
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <Field label="Dirección" value={solicitud!.direccion} />
            <Field label="Fecha programada" value={fmt(solicitud!.fecha_programada)} />
            <Field label="Estado" value={solicitud!.estado?.nombre ?? "-"} />
            <Field label="Resolución" value={solicitud!.resolucion?.nombre ?? "-"} />
            <Field label="Notas" value={solicitud!.notas ?? "-"} />
          </CardContent>
        </CardSinBorde>
        {role !== "cliente" && (
          <CardSinBorde className="w-full">
            <CardContent className="space-y-4 pt-6">
              <p className="font-semibold text-lg">Cliente</p>
              <div className="flex items-center gap-4">
                <img src={solicitud!.cliente?.imagen ?? "/avatars/default_user.png"} className="w-14 h-14 rounded-full object-cover" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <Field label="Nombre" value={`${solicitud!.cliente?.nombre ?? ""} ${solicitud!.cliente?.apellidos ?? ""}`} />
                  <Field label="Email" value={solicitud!.cliente?.email ?? "-"} />
                </div>
              </div>
            </CardContent>
          </CardSinBorde>
        )}
        <CardSinBorde className="w-full">
          <CardContent className="space-y-4 pt-6">
            <p className="font-semibold text-lg">Vehículo</p>
            <div className="flex items-center gap-4">
              <img src={solicitud!.vehiculo?.imagen ?? "/avatars/default_car.png"} className="w-14 h-14 rounded object-cover" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <Field label="Matrícula" value={solicitud!.vehiculo?.matricula ?? "-"} />
                <Field label="Marca / Modelo" value={`${solicitud!.vehiculo?.marca ?? ""} ${solicitud!.vehiculo?.modelo ?? ""}`} />
              </div>
            </div>
          </CardContent>
        </CardSinBorde>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSinBorde className="w-full">
            <CardContent className="space-y-4 pt-6">
              <p className="font-semibold text-lg">Seguimiento horario</p>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Hora recogida" value={fmt(solicitud!.hora_recogida)} />
                <Field label="Hora ITV" value={fmt(solicitud!.hora_itv)} />
                <Field label="Hora entrega" value={fmt(solicitud!.hora_entrega)} />
              </div>
            </CardContent>
          </CardSinBorde>
          <CardSinBorde className="w-full">
            <CardContent className="flex justify-center items-center pt-6">
              <SolicitudCircularTracker estado={solicitud!.estado} />
            </CardContent>
          </CardSinBorde>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Atrás</Button>
          {puedeAvanzar && (
            <div className="flex flex-col items-end gap-2">
              <Button
                className={`px-8 ${isBusy && siguiente?.slug === 'en_recogida' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'variant-secondary'}`}
                variant={isBusy && siguiente?.slug === 'en_recogida' ? 'ghost' : 'secondary'}
                onClick={handleAvanzarEstado}
                disabled={avanzando || (isBusy && siguiente?.slug === 'en_recogida')}
              >
                {avanzando ? "Avanzando..." : isBusy && siguiente?.slug === 'en_recogida' ? "Servicio activo" : `Avanzar a "${siguiente?.nombre}"`}
              </Button>
            </div>
          )}
          {role !== "cliente" && <Button onClick={() => setEditando(true)}>Editar</Button>}
        </div>
      </div>
    );
  }

  // ─── Render Final ────────────────────────────────────────────────────────────

  return (
    <div className="w-full">
      {role === "empleado" && !editando ? <EmpleadoDetailView /> : <StandardDetailView />}
    </div>
  );
}
