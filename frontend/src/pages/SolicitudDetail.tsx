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
  Clock, MapPin, ShieldCheck, ExternalLink, Activity
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

function ReadOnlyField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: any;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
        {label}
      </label>
      <div className="relative group">
        <Input
          type="text"
          value={value ?? "—"}
          readOnly
          className="bg-slate-50 border-slate-200 pointer-events-none transition-colors group-hover:bg-slate-100/50"
        />
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
            <Icon size={16} />
          </div>
        )}
      </div>
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
    role === "empleado" &&
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
        <div className="w-full">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardSinBorde className="w-full">
              <CardContent className="flex flex-col gap-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Bloque 1: Detalles del Servicio */}
                  <div className="space-y-4 border-b-2 border-primary pb-8 sm:border-b-0 sm:pb-0 sm:border-r-2 sm:border-primary sm:pr-8">
                    <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="text-primary" size={20} />
                      </div>
                      <h3 className="font-bold text-lg">Detalles del Servicio</h3>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Dirección de recogida *</label>
                      <Input 
                        type="text" 
                        {...register("direccion")} 
                        className="border-slate-200"
                      />
                      {errors.direccion && (
                        <p className="text-red-500 text-xs font-medium">{errors.direccion.message}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Fecha programada</label>
                      <Input 
                        type="datetime-local" 
                        {...register("fecha_programada")} 
                        className="border-slate-200"
                      />
                    </div>

                    <div className="space-y-1">
                       <SelectField 
                        label="Resolución ITV" 
                        value={watch("resolucion_id")} 
                        onChange={(v) => setValue("resolucion_id", v)} 
                        options={resoluciones} 
                        placeholder="Pendiente de determinar" 
                      />
                    </div>
                  </div>

                  {/* Bloque 2: Gestión y Notas */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Activity className="text-primary" size={20} />
                      </div>
                      <h3 className="font-bold text-lg">Gestión y Notas</h3>
                    </div>

                    {role === "administrador" && (
                      <div className="space-y-1">
                        <SelectField 
                          label="Empleado Asignado" 
                          value={watch("user_empleado_id")} 
                          onChange={(v) => setValue("user_empleado_id", v)} 
                          options={empleados.map((e) => ({ 
                            id: e.id, 
                            nombre: `${e.nombre} ${e.apellidos}` 
                          }))} 
                          placeholder="Sin asignar" 
                        />
                        {errors.user_empleado_id && (
                          <p className="text-red-500 text-xs font-medium">{errors.user_empleado_id.message}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-sm font-medium">Observaciones</label>
                      <Textarea 
                        {...register("notas")} 
                        placeholder="Notas internas o instrucciones adicionales..." 
                        className="min-h-[120px] bg-slate-50/50 border-slate-200"
                      />
                      {errors.notas && (
                        <p className="text-red-500 text-xs font-medium">{errors.notas.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {serverError && (
                  <p className="text-red-500 text-sm font-bold italic text-center p-3 bg-red-50 rounded-lg">
                    {serverError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t-2 border-primary font-bold">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-50"
                    onClick={() => { setEditando(false); setServerError(null); }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </CardContent>
            </CardSinBorde>
          </form>
        </div>
      );
    }

    return (
      <div className="w-full animate-in fade-in duration-500">
        {/* Fila 1: Detalles y Cliente/Vehículo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CardSinBorde>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileText className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-lg">Detalles del Servicio</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <ReadOnlyField label="Dirección de Recogida" value={solicitud!.direccion} icon={MapPin} />
                </div>
                <ReadOnlyField label="Fecha Programada" value={fmt(solicitud!.fecha_programada)} icon={Clock} />
                <ReadOnlyField label="Estado Actual" value={solicitud!.estado?.nombre} />
                <ReadOnlyField label="Agente Asignado" value={solicitud!.empleado ? `${solicitud!.empleado.nombre} ${solicitud!.empleado.apellidos}` : "Pendiente de asignar"} />
                <ReadOnlyField label="Resolución ITV" value={solicitud!.resolucion?.nombre} icon={ShieldCheck} />
                <div className="sm:col-span-2 font-medium">
                   <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Notas del Servicio</label>
                   <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm italic text-slate-600 mt-1">
                      {solicitud!.notas || "Sin observaciones adicionales."}
                   </div>
                </div>
              </div>
            </CardContent>
          </CardSinBorde>

          <div className="flex flex-col gap-8 h-full">
            {role !== "cliente" && (
              <CardSinBorde className="border-l-2 border-l-primary flex-1">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    Información del Cliente
                  </h3>
                  <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <img 
                      src={solicitud!.cliente?.imagen ?? "/avatars/default_user.png"} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg text-slate-800">
                        {solicitud!.cliente?.nombre} {solicitud!.cliente?.apellidos}
                      </p>
                      <p className="text-sm text-slate-500 font-medium truncate">
                        {solicitud!.cliente?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </CardSinBorde>
            )}

            <CardSinBorde className="border-l-2 border-l-primary flex-1">
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Vehículo Vinculado
                </h3>
                <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                    <img 
                      src={solicitud!.vehiculo?.imagen ?? "/avatars/default_car.png"} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded mb-1">
                      {solicitud!.vehiculo?.matricula}
                    </div>
                    <p className="font-bold text-lg text-slate-800">
                      {solicitud!.vehiculo?.marca} {solicitud!.vehiculo?.modelo}
                    </p>
                  </div>
                </div>
              </CardContent>
            </CardSinBorde>
          </div>
        </div>

        {/* Fila 2: Progreso y Seguimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CardSinBorde className="h-full">
            <CardContent className="pt-6 h-full flex flex-col">
              <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Activity className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-lg">Progreso de la Solicitud</h3>
              </div>
              <div className="flex-1 flex items-center justify-center py-4">
                <SolicitudCircularTracker estado={solicitud!.estado} />
              </div>
            </CardContent>
          </CardSinBorde>

          <CardSinBorde className="h-full">
            <CardContent className="pt-6 h-full flex flex-col">
              <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Clock className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-lg">Seguimiento Horario Real</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center py-4">
                <div className="grid grid-cols-1 gap-4">
                   <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Recogida</span>
                      <span className="font-bold text-slate-700">{fmt(solicitud!.hora_recogida)}</span>
                   </div>
                   <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Llegada ITV</span>
                      <span className="font-bold text-slate-700">{fmt(solicitud!.hora_itv)}</span>
                   </div>
                   <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Entrega Final</span>
                      <span className="font-bold text-slate-700">{fmt(solicitud!.hora_entrega)}</span>
                   </div>
                </div>
              </div>
            </CardContent>
          </CardSinBorde>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-8 mt-2 border-t-2 border-primary font-bold">
          <Button variant="outline" onClick={() => navigate(-1)} className="w-50">
            Volver
          </Button>
          
          {role === "administrador" && 
           !["en_recogida", "en_itv", "retornando", "finalizado", "cancelado"].includes(solicitud!.estado?.slug || "") && (
            <Button 
              onClick={() => setEditando(true)}
              variant={puedeAvanzar ? "outline" : "default"}
              className="w-50"
            >
              Editar Datos
            </Button>
          )}

          {puedeAvanzar && (
            <Button
              className={`w-50 ${isBusy && siguiente?.slug === 'en_recogida' ? 'opacity-50' : ''}`}
              variant={isBusy && siguiente?.slug === 'en_recogida' ? 'outline' : 'default'}
              onClick={handleAvanzarEstado}
              disabled={avanzando || (isBusy && siguiente?.slug === 'en_recogida')}
            >
              {avanzando ? "Actualizando..." : isBusy && siguiente?.slug === 'en_recogida' ? "Ocupado" : `A "${siguiente?.nombre}"`}
            </Button>
           )}
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
