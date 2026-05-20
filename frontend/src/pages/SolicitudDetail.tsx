import { useEffect, useState, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import SolicitudCircularTracker from "@/components/ui/SolicitudCircularTracker";
import { 
  FileText,
  Clock, MapPin, ShieldCheck, ExternalLink, Activity, User, Phone
} from "lucide-react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/context/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHeader } from "@/context/HeaderContext";
import { toast } from "sonner";

// Interfaces

interface Solicitud {
  id: number;
  direccion: string;
  fecha_programada: string | null;
  hora_recogida: string | null;
  hora_itv: string | null;
  hora_entrega: string | null;
  notas: string | null;
  importe_cobro: number | null;
  cliente: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    ciudad: string | null;
    codigo_postal: string | null;
    imagen: string | null;
    telefono: string | null;
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
    imagen: string | null;
  } | null;
  resolucion: { id: number; nombre: string } | null;
  pago: {
    id: number;
    importe: number;
    metodo_pago: { id: number; nombre: string; slug?: string } | null;
    estado_pago: { id: number; nombre: string; slug: string } | null;
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
  email: string;
}

// Helper: muestra nombre+apellidos o, si son null, la parte antes de @ del email
function displayName(nombre: string | null | undefined, apellidos: string | null | undefined, email?: string | null): string {
  if (nombre || apellidos) return `${nombre ?? ""} ${apellidos ?? ""}`.trim();
  if (email) return email.split("@")[0];
  return "Sin nombre";
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


// Schema de edición

const editSchema = z.object({
  direccion: z.string().min(1, "La dirección de recogida es obligatoria").max(255),
  fecha_programada: z.string().min(1, "La fecha programada es obligatoria").refine((val) => {
    if (!val) return true;
    return new Date(val) >= new Date();
  }, "La fecha programada no puede ser anterior a hoy"),
  resolucion_id: z.any().optional(),
  user_empleado_id: z.any().refine((val) => val !== "" && val !== null && val !== undefined, "El empleado es obligatorio"),
  importe_cobro: z.string().min(1, "El importe del servicio es obligatorio"),
  notas: z.string().max(500).optional().or(z.literal("")),
});

type EditFormData = z.infer<typeof editSchema>;

// Helpers

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

const MapCard = memo(({ direccion, ciudad, cp }: { direccion: string, ciudad?: string | null, cp?: string | null }) => {
  // Construimos una query más precisa combinando dirección, CP y Ciudad.
  let querySearch = direccion;
  if (cp) querySearch += `, ${cp}`;
  if (ciudad) querySearch += `, ${ciudad}`;

  if (!querySearch.toLowerCase().includes("españa") && !querySearch.toLowerCase().includes("spain")) {
    querySearch += ", España";
  }

  const encoded = encodeURIComponent(querySearch);

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
        src={`https://maps.google.com/maps?width=100%25&height=100%25&hl=es&q=${encoded}&t=&z=15&ie=UTF8&iwloc=B&output=embed`}
        allowFullScreen
        className="contrast-[1.1] brightness-[0.95]"
      ></iframe>
    </CardSinBorde>
  );
});

// Props de Vistas

interface CommonViewProps {
  id: string | undefined;
  solicitud: Solicitud;
  role: string | undefined;
  serverError: string | null;
  avanzando: boolean;
  setAvanzando: (v: boolean) => void;
  cargarSolicitud: () => Promise<void>;
  handleAvanzarEstado: () => Promise<void>;
  puedeAvanzar: boolean;
  siguiente: Estado | null;
  isBusy: boolean;
  cancelando: boolean;
  handleCancelar: () => Promise<void>;
  puedeCancelar: boolean;
}

interface EmpleadoDetailViewProps extends CommonViewProps {
  resoluciones: Resolucion[];
  pagoImporte: string;
  setPagoImporte: (v: string) => void;
  pagoMetodoId: number | null;
  setPagoMetodoId: (v: number | null) => void;
  handleRegistrarPago: () => Promise<void>;
  handlePagar: (id: number) => Promise<void>;
  pagando: boolean;
  esFinalizar: boolean;
  esTransferencia: boolean;
}

interface StandardDetailViewProps extends CommonViewProps {
  editando: boolean;
  setEditando: (v: boolean) => void;
  setServerError: (v: string | null) => void;
  resoluciones: Resolucion[];
  empleados: Empleado[];
  pagando: boolean;
  handlePagar: (id: number) => Promise<void>;
  // Form props
  register: any;
  handleSubmit: any;
  setValue: any;
  watch: any;
  errors: any;
  isSubmitting: boolean;
  onSubmit: (data: any) => Promise<void>;
  onError: (errors: any) => void;
  navigate: any;
  // Pago props (para Admin)
  pagoImporte: string;
  setPagoImporte: (v: string) => void;
  pagoMetodoId: number | null;
  setPagoMetodoId: (v: number | null) => void;
  handleRegistrarPago: () => Promise<void>;
}

// Sub-Componentes (Vistas)

const EmpleadoDetailView = memo(({
  id, solicitud, resoluciones, avanzando, setAvanzando, cargarSolicitud,
  pagoImporte, setPagoImporte, pagoMetodoId, setPagoMetodoId,
  handleRegistrarPago: _handleRegistrarPago, handlePagar: _handlePagar, pagando: _pagando, serverError,
  puedeAvanzar, handleAvanzarEstado, isBusy, siguiente,
  esFinalizar, esTransferencia: _esTransferencia
}: EmpleadoDetailViewProps) => {
  const esAsignado = solicitud.estado?.slug === 'asignado';
  const scheduledDate = solicitud.fecha_programada ? new Date(solicitud.fecha_programada) : null;
  const esHoy = !scheduledDate || isToday(scheduledDate);
  const puedeGestionarAhora = !esAsignado || esHoy;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div className="lg:col-span-7">
         <MapCard 
           direccion={solicitud.direccion} 
           ciudad={solicitud.cliente?.ciudad} 
           cp={solicitud.cliente?.codigo_postal} 
         />
      </div>
      <div className="lg:col-span-5 space-y-6">
        <CardSinBorde className="border border-border shadow-sm h-full rounded-xl overflow-hidden relative">
          <CardContent className="p-6 flex flex-col h-full space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-b border-slate-100 pb-4">
              <div className="space-y-1 sm:border-r sm:border-slate-100 sm:pr-4">
                <Label className="text-primary flex items-center gap-2 uppercase font-black text-xs tracking-widest">
                  <User size={16} /> Cliente
                </Label>
                <div className="font-bold text-base text-slate-900 px-1">
                  {displayName(solicitud.cliente?.nombre, solicitud.cliente?.apellidos, solicitud.cliente?.email)}
                </div>
              </div>
              
              <div className="space-y-1 sm:pl-4 pt-4 sm:pt-0">
                <Label className="text-primary flex items-center gap-2 uppercase font-black text-xs tracking-widest">
                  <Phone size={16} /> Teléfono
                </Label>
                {solicitud.cliente?.telefono ? (
                  <a 
                    href={`tel:${solicitud.cliente.telefono}`}
                    className="font-bold text-base text-primary hover:underline px-1 flex items-center gap-2"
                  >
                    {solicitud.cliente.telefono}
                  </a>
                ) : (
                  <div className="text-sm text-slate-400 italic px-1">No disponible</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary flex items-center gap-2 uppercase font-black text-xs tracking-widest">
                <Clock size={16} /> Estado de Servicio
              </Label>
              <Input 
                type="text" 
                value={solicitud.estado?.nombre ?? "—"} 
                readOnly 
                className="bg-slate-50 border-slate-200 pointer-events-none font-bold text-slate-900" 
              />
            </div>
            
            <div className="space-y-4">
              {['en_itv', 'retornando', 'finalizado'].includes(solicitud.estado?.slug || "") && (
                <div className="space-y-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <Label className="text-primary flex items-center gap-2 uppercase font-black text-xs tracking-widest">
                     <ShieldCheck size={16} /> Resultado ITV
                  </Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                    value={solicitud.resolucion?.id ?? ""}
                    disabled={solicitud.estado?.slug !== 'en_itv' || avanzando}
                    onChange={async (e) => {
                      const rid = e.target.value ? Number(e.target.value) : null;
                      try {
                        setAvanzando(true);
                        await api.put(`/solicitudes/${id}`, { direccion: solicitud.direccion, resolucion_id: rid });
                        await cargarSolicitud();
                      } catch(err) {
                        console.error(err);
                      } finally {
                        setAvanzando(false);
                      }
                    }}
                  >
                    <option value="" disabled>Seleccionar resultado</option>
                    {resoluciones
                      .filter(r => r.nombre.toLowerCase() !== 'pendiente')
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))
                    }
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-primary flex items-center gap-2 uppercase font-black text-xs tracking-widest">
                   <FileText size={16} /> Notas Operativas
                </Label>
                
                {/* Visualización de notas existentes - No editable */}
                {solicitud.notas && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 whitespace-pre-wrap italic">
                    {solicitud.notas}
                  </div>
                )}

                {/* Área para añadir nuevas notas */}
                <div className="space-y-2 pt-1">
                  <Textarea 
                    id="nueva-nota"
                    className="min-h-[80px] resize-none text-sm border-slate-200 focus:border-primary/50"
                    placeholder="Añadir una observación interna..."
                    disabled={avanzando || solicitud.estado?.slug === 'finalizado'}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-[10px] uppercase font-bold h-8"
                    disabled={avanzando || solicitud.estado?.slug === 'finalizado'}
                    onClick={async () => {
                      const input = document.getElementById('nueva-nota') as HTMLTextAreaElement;
                      const val = input?.value.trim();
                      if (!val) return;

                      try {
                        setAvanzando(true);
                        const timestamp = new Date().toLocaleString('es-ES', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
                        const nuevaNotaCompleta = solicitud.notas 
                          ? `${solicitud.notas}\n\n[${timestamp}] Empleado: ${val}` 
                          : `[${timestamp}] Empleado: ${val}`;
                        
                        await api.put(`/solicitudes/${id}`, { direccion: solicitud.direccion, notas: nuevaNotaCompleta });
                        if (input) input.value = '';
                        await cargarSolicitud();
                        toast.success("Nota añadida");
                      } catch(err) {
                        console.error(err);
                        toast.error("No se pudo añadir la nota");
                      } finally {
                        setAvanzando(false);
                      }
                    }}
                  >
                    Añadir comentario
                  </Button>
                </div>
              </div>
            </div>

            {/* GESTIÓN DE COBRO */}
            {solicitud.estado?.slug === 'retornando' && !solicitud.pago && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <Label className="text-xs uppercase tracking-widest text-primary font-black mb-2 block">
                  Cobro del servicio
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground">Importe</Label>
                    <Input
                      type="number"
                      value={pagoImporte !== "" ? pagoImporte : (solicitud.importe_cobro ? String(solicitud.importe_cobro) : "")}
                      onChange={(e) => setPagoImporte(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground">Método de pago</Label>
                    <select
                      className="w-full h-9 border rounded-md px-2 text-xs"
                      value={pagoMetodoId ?? ""}
                      onChange={(e) => setPagoMetodoId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Seleccionar</option>
                      <option value="1">Efectivo</option>
                      <option value="2">Tarjeta</option>
                      <option value="3">Transferencia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Pago COMPLETADO */}
            {solicitud.pago && (solicitud.pago.estado_pago?.slug === 'pagado' || solicitud.pago.estado_pago?.id === 2) && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-black text-sm uppercase italic">
                    <ShieldCheck size={18} /> Pago completado ({solicitud.pago.metodo_pago?.nombre})
                  </div>
              </div>
            )}

            {serverError && (
              <p className="text-[10px] text-destructive font-bold text-center italic">{serverError}</p>
            )}

            <div className="pt-2">
               {puedeAvanzar || !["finalizado", "cancelado"].includes(solicitud.estado?.slug || "") ? (
                 <div className="space-y-3">
                   <Button 
                     onClick={handleAvanzarEstado}
                     variant={(!solicitud.pago && !pagoMetodoId && esFinalizar) ? "destructive" : "default"}
                     disabled={
                       !puedeAvanzar ||
                       avanzando || 
                       (isBusy && siguiente?.slug === 'en_recogida') ||
                       !puedeGestionarAhora
                     }
                     className="w-full py-6 text-md font-bold uppercase tracking-wider shadow-lg"
                   >
                     {avanzando ? "Actualizando..." : 
                      (!solicitud.pago && !pagoMetodoId && esFinalizar) 
                        ? "Finalizar sin pago"
                        : esFinalizar && pagoMetodoId && !solicitud.pago
                          ? `Finalizar con ${pagoMetodoId === 1 ? 'Efectivo' : pagoMetodoId === 2 ? 'Tarjeta' : 'Transferencia'}` 
                          : `Avanzar a ${siguiente?.nombre}`}
                   </Button>
                   {!puedeAvanzar && solicitud.estado?.slug === 'en_itv' && !solicitud.resolucion && (
                     <p className="text-center text-warning font-medium text-xs italic">
                       * Selecciona el resultado de la ITV para continuar.
                     </p>
                   )}
                   {isBusy && siguiente?.slug === 'en_recogida' && (
                      <p className="text-center text-destructive font-medium animate-pulse text-xs">
                        * Tienes otro servicio activo pendiente de entrega.
                      </p>
                   )}
                   {!puedeGestionarAhora && esAsignado && (
                      <p className="text-center text-amber-600 font-medium text-xs italic">
                        * El servicio está programado para el día {format(new Date(solicitud.fecha_programada!), "dd/MM/yyyy")}. Solo puede gestionarse su día.
                      </p>
                   )}
                 </div>
               ) : (
                  <div className="pt-2">
                    {solicitud.estado?.slug === 'finalizado' ? (
                      <div className="bg-emerald-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 shadow-inner">
                         <ShieldCheck size={24} />
                         <span className="font-black italic uppercase tracking-widest">Servicio Finalizado</span>
                      </div>
                    ) : (
                      <CardSinBorde className="bg-muted/50 p-4 rounded-xl text-center border border-dashed">
                        <p className="text-xs font-medium text-muted-foreground italic">
                          {!solicitud.pago && esFinalizar 
                            ? "Debes registrar el método de cobro antes de finalizar" 
                            : "Estado finalizado o sin transiciones"}
                        </p>
                      </CardSinBorde>
                    )}
                  </div>
               )}
            </div>
          </CardContent>
        </CardSinBorde>
      </div>
    </div>
  );
});

const StandardDetailView = memo(({
  id: _id, solicitud, role, editando, setEditando, serverError, setServerError, 
  avanzando, setAvanzando: _setAvanzando,
  resoluciones, empleados, pagando, handlePagar: _handlePagar, puedeAvanzar, handleAvanzarEstado,
  siguiente, isBusy, register, handleSubmit, setValue, watch, errors, 
  isSubmitting, onSubmit, onError, navigate: _navigate, 
  pagoImporte, setPagoImporte, pagoMetodoId, setPagoMetodoId, handleRegistrarPago,
  cancelando, handleCancelar, puedeCancelar
}: StandardDetailViewProps) => {
  if (editando) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <CardSinBorde className="w-full">
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 border-b-2 border-primary pb-8 sm:border-b-0 sm:pb-0 sm:border-r-2 sm:border-primary sm:pr-8">
                  <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="text-primary" size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Detalles del Servicio</h3>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Dirección de recogida *</label>
                    <Input type="text" {...register("direccion")} className={`border-slate-200 ${errors.direccion ? 'border-red-500' : ''}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Fecha programada *</label>
                    <Input 
                      type="datetime-local" 
                      {...register("fecha_programada")} 
                      min={new Date().toLocaleString('sv').replace(' ', 'T').slice(0, 16)}
                      className={`border-slate-200 ${errors.fecha_programada ? 'border-red-500' : ''}`} 
                    />
                  </div>
                  {role !== "administrador" && (
                    <div className="space-y-1">
                       <SelectField 
                        label="Resolución ITV" 
                        value={watch("resolucion_id")} 
                        onChange={(v) => setValue("resolucion_id", v)} 
                        options={resoluciones} 
                        placeholder="Pendiente de determinar" 
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Activity className="text-primary" size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Gestión y Notas</h3>
                  </div>
                  {role === "administrador" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Empleado Asignado *</label>
                        <SelectField 
                          label="" 
                          value={watch("user_empleado_id")} 
                          onChange={(v) => setValue("user_empleado_id", v)} 
                          options={empleados.map((e: Empleado) => ({ 
                            id: e.id, 
                            nombre: displayName(e.nombre, e.apellidos, e.email)
                          }))} 
                          placeholder="Seleccionar empleado" 
                        />
                      </div>
                      {/* Importe del servicio: el admin lo fija en la solicitud */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Importe del Servicio (€) *</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...register("importe_cobro")}
                          className={`border-slate-200 ${errors.importe_cobro ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Observaciones</label>
                    <Textarea {...register("notas")} placeholder="Notas..." className="min-h-[120px] bg-slate-50/50 border-slate-200" />
                  </div>
                </div>
              </div>
              {serverError && <p className="text-red-500 text-sm font-bold italic text-center p-3 bg-red-50 rounded-lg">{serverError}</p>}
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-primary font-bold">
                <Button type="button" variant="outline" className="w-full md:w-50" onClick={() => { setEditando(false); setServerError(null); }}>Cancelar</Button>
                <Button 
                  type="submit" 
                  className="w-full md:w-50" 
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

  const esFinalizar = siguiente?.slug === 'finalizado';
  const esTransferencia = pagoMetodoId === 3;

  return (
    <div className="w-full animate-in fade-in duration-500 space-y-8">
      {/* SECCIÓN PRINCIPAL: DETALLES, CLIENTE, VEHÍCULO Y PAGOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-7 space-y-8">
          <CardSinBorde>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileText className="text-primary" size={20} />
                </div>
                <h3 className="font-bold text-lg">Detalles del Servicio</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <ReadOnlyField label="Dirección de Recogida" value={solicitud.direccion} icon={MapPin} />
                <div className="grid grid-cols-2 gap-4">
                  <ReadOnlyField label="Fecha Programada" value={fmt(solicitud.fecha_programada)} icon={Clock} />
                  <ReadOnlyField label="Estado Actual" value={solicitud.estado?.nombre} />
                </div>
                <ReadOnlyField label="Resolución ITV" value={solicitud.resolucion?.nombre} icon={ShieldCheck} />
                
                {role === 'administrador' && ['retornando', 'finalizado'].includes(solicitud.estado?.slug || "") && !solicitud.pago && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block text-center">Registro de Cobro</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px]">Importe</Label>
                          <Input type="number" value={pagoImporte} onChange={(e) => setPagoImporte(e.target.value)} className="h-9 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Método</Label>
                          <select className="w-full h-9 border rounded-md px-2 text-xs" value={pagoMetodoId ?? ""} onChange={(e) => setPagoMetodoId(Number(e.target.value))}>
                            <option value="">Seleccionar</option>
                            <option value="1">Efectivo</option>
                            <option value="2">Tarjeta</option>
                            <option value="3">Transferencia</option>
                          </select>
                        </div>
                    </div>
                    <Button onClick={handleRegistrarPago} disabled={pagando || !pagoMetodoId || !pagoImporte} className="w-full h-10 bg-primary text-white font-bold">Cobrar ahora</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </CardSinBorde>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {role !== "cliente" && (
                <CardSinBorde className="border-l-2 border-l-primary">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-bold text-lg">Cliente</h3>
                    {role === "administrador" ? (
                      <Link 
                        to={`/perfil/${solicitud.cliente?.id}`}
                        className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 hover:border-primary/30 transition-all cursor-pointer group"
                      >
                        <img src={solicitud.cliente?.imagen ?? "/avatars/default_user.png"} className="w-16 h-16 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        <div className="flex-1">
                          <p className="font-bold text-lg group-hover:text-primary transition-colors">{displayName(solicitud.cliente?.nombre, solicitud.cliente?.apellidos, solicitud.cliente?.email)}</p>
                          <p className="text-sm text-slate-500 truncate">{solicitud.cliente?.email}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <img src={solicitud.cliente?.imagen ?? "/avatars/default_user.png"} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                        <div className="flex-1">
                          <p className="font-bold text-lg">{displayName(solicitud.cliente?.nombre, solicitud.cliente?.apellidos, solicitud.cliente?.email)}</p>
                          <p className="text-sm text-slate-500 truncate">{solicitud.cliente?.email}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CardSinBorde>
              )}
              <CardSinBorde className="border-l-2 border-l-primary">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-bold text-lg">Vehículo</h3>
                  {role !== "empleado" ? (
                    <Link 
                      to={`/vehiculos/${solicitud.vehiculo?.id}`}
                      className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-white rounded-full overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                        <img src={solicitud.vehiculo?.imagen ?? "/avatars/default_car.png"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg group-hover:text-primary transition-colors">{solicitud.vehiculo?.marca} {solicitud.vehiculo?.modelo}</p>
                        <p className="text-[12px] font-bold text-primary uppercase tracking-tight mt-0.5">{solicitud.vehiculo?.matricula}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="w-16 h-16 bg-white rounded-full overflow-hidden flex items-center justify-center">
                        <img src={solicitud.vehiculo?.imagen ?? "/avatars/default_car.png"} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{solicitud.vehiculo?.marca} {solicitud.vehiculo?.modelo}</p>
                        <p className="text-[12px] font-bold text-primary uppercase tracking-tight mt-0.5">{solicitud.vehiculo?.matricula}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </CardSinBorde>
              {/* Card Empleado */}
              {role !== "empleado" && (
                <CardSinBorde className="border-l-2 border-l-primary md:col-span-2 xl:col-span-1">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-bold text-lg">Empleado</h3>
                    {solicitud.empleado ? (
                      role === "administrador" ? (
                        <Link 
                          to={`/perfil/${solicitud.empleado.id}`}
                          className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100/80 hover:border-primary/30 transition-all cursor-pointer group"
                        >
                          <img src={solicitud.empleado.imagen ?? "/avatars/default_user.png"} className="w-16 h-16 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg group-hover:text-primary transition-colors truncate">{displayName(solicitud.empleado.nombre, solicitud.empleado.apellidos, solicitud.empleado.email)}</p>
                            <p className="text-sm text-slate-500 truncate">{solicitud.empleado.email}</p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <img src={solicitud.empleado.imagen ?? "/avatars/default_user.png"} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg truncate">{displayName(solicitud.empleado.nombre, solicitud.empleado.apellidos, solicitud.empleado.email)}</p>
                            <p className="text-sm text-slate-500 truncate">{solicitud.empleado.email}</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <User className="text-slate-400" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-500">No asignado</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </CardSinBorde>
              )}
           </div>


        </div>

        <div className="lg:col-span-5 space-y-8">
           <CardSinBorde>
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="w-full flex items-center justify-start gap-3 border-b-2 border-primary pb-4 mb-4">
                  <Activity className="text-primary" size={20} />
                  <h3 className="font-bold text-lg">Progreso</h3>
                </div>
                <SolicitudCircularTracker estado={solicitud.estado} />
              </CardContent>
            </CardSinBorde>

            <CardSinBorde>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-primary pb-4 mb-4">
                  <Clock className="text-primary" size={20} />
                  <h3 className="font-bold text-lg">Historial</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-slate-50 text-sm"><span>Recogida</span><span className="font-bold">{fmt(solicitud.hora_recogida)}</span></div>
                  <div className="flex justify-between p-3 rounded-lg bg-slate-50 text-sm"><span>Entrada ITV</span><span className="font-bold">{fmt(solicitud.hora_itv)}</span></div>
                  <div className="flex justify-between p-3 rounded-lg bg-slate-50 text-sm"><span>Entrega Final</span><span className="font-bold">{fmt(solicitud.hora_entrega)}</span></div>
                </div>
              </CardContent>
            </CardSinBorde>
        </div>
      </div>

      {/* Información de Pago y Notas - Ancho Completo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch mt-8">
         <div className="space-y-6">
           {/* Importe fijado por el admin — el cliente solo lo ve como información */}
           {!solicitud.pago && solicitud.importe_cobro && (
             <div className="px-6 py-4 rounded-xl border border-yellow-200 flex items-center justify-between gap-4 h-full" style={{ background: 'rgb(254 252 232)' }}>
               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Importe del servicio</label>
                 <div className="text-2xl font-black text-slate-800">
                   {Number(solicitud.importe_cobro).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                 </div>
                 <div className="text-xs text-yellow-700 mt-0.5 italic">Pendiente de cobro</div>
               </div>
             </div>
           )}

           {solicitud.pago && (
             <div className="px-6 py-4 rounded-xl border flex items-center justify-between gap-4 h-full" style={{
               background: solicitud.pago.estado_pago?.slug === 'pagado' ? 'rgb(240 253 244)' : 'rgb(254 252 232)',
               borderColor: solicitud.pago.estado_pago?.slug === 'pagado' ? 'rgb(187 247 208)' : 'rgb(253 224 71 / 0.4)',
             }}>
               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detalle del Pago</label>
                 <div className="text-2xl font-black text-slate-800">
                   {Number(solicitud.pago.importe).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                 </div>
                 <div className="text-xs text-slate-500 mt-0.5">{solicitud.pago.metodo_pago?.nombre}</div>
               </div>
               <span className={`px-4 py-1.5 rounded-full text-xs font-bold ring-1 ${
                 (solicitud.pago.estado_pago?.slug === 'pagado' || solicitud.pago.estado_pago?.id === 2)
                   ? 'bg-success/10 text-success ring-success/20'
                   : 'bg-warning/10 text-warning ring-warning/20'
               }`}>
                 {solicitud.pago.estado_pago?.nombre}
               </span>
             </div>
           )}
         </div>

         <div className="font-medium flex flex-col h-full">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-1">Notas del servicio</label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm italic text-slate-600 flex-1">
              {solicitud.notas || "Sin observaciones adicionales."}
            </div>
         </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-8 mt-2 border-t-2 border-primary font-bold">
        {role === "administrador" && ["pendiente", "asignado"].includes(solicitud.estado?.slug || "") && (
          <Button onClick={() => setEditando(true)} variant={puedeAvanzar ? "outline" : "default"} className="w-full md:w-50">Editar</Button>
        )}
        {puedeAvanzar && (
          <Button
            className="w-full md:w-50"
            variant={(!solicitud.pago && !pagoMetodoId && esFinalizar) ? "destructive" : "default"}
            onClick={handleAvanzarEstado}
            disabled={avanzando || (isBusy && siguiente?.slug === 'en_recogida')}
          >
            {avanzando ? "..." : 
             (!solicitud.pago && !pagoMetodoId && esFinalizar) 
               ? "Finalizar sin pago"
               : esFinalizar && esTransferencia && !solicitud.pago 
                 ? "Finalizar (Transferencia)" 
                 : `A "${siguiente?.nombre}"`}
          </Button>
         )}

        {role === "cliente" && puedeCancelar && (
          <Button
            variant="destructive"
            className="w-full md:w-50 hover:bg-red-700"
            onClick={handleCancelar}
            disabled={cancelando}
          >
            {cancelando ? "Cancelando..." : "Cancelar"}
          </Button>
        )}
      </div>
    </div>
  );
});

// Componente Principal

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
  const [cancelando, setCancelando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [pagoImporte, setPagoImporte] = useState<string>("");
  const [pagoMetodoId, setPagoMetodoId] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting }, reset,
  } = useForm<EditFormData>({ resolver: zodResolver(editSchema) });
  const { setHeaderData } = useHeader();

  const cargarSolicitud = async () => {
    try {
      const res = await api.get(`/solicitudes/${id}`);
      setSolicitud(res.data.data);
    } catch(err: any) { 
      console.error(err);
      toast.error("No se pudo cargar la solicitud.");
      setTimeout(() => navigate("/solicitudes"), 2000);
    }
  };

  useEffect(() => { cargarSolicitud(); }, [id]);

  useEffect(() => {
    if (role !== "cliente") {
      api.get("/solicitudes/meta").then((res) => {
        setEstados(res.data.baseData?.estados ?? []);
        setResoluciones(res.data.baseData?.resoluciones ?? []);
        setEmpleados(res.data.empleados ?? []);
      });
    }
    if (role === "empleado") {
      api.get("/contadores").then((res) => { setIsBusy(res.data.has_active_request || false); });
    }
  }, [role]);

  useEffect(() => {
    if (editando && solicitud) {
      reset({
        direccion: solicitud.direccion ?? "",
        fecha_programada: solicitud.fecha_programada?.slice(0, 16) ?? "",
        resolucion_id: solicitud.resolucion?.id ?? null,
        user_empleado_id: solicitud.empleado?.id ?? undefined, // undefined for zod required check
        notas: solicitud.notas ?? "",
        importe_cobro: solicitud.importe_cobro ? String(solicitud.importe_cobro) : "",
      });
    }
  }, [editando, solicitud, reset]);

  useEffect(() => {
    if (solicitud) {
      setHeaderData({
        nombre: editando ? "Editar solicitud" : "Detalle de solicitud",
        imagen: null,
        avatar: String(solicitud.id), 
      });
    }
    return () => setHeaderData(null);
  }, [setHeaderData, solicitud, editando]);

  const siguienteEstado = (): Estado | null => {
    if (!solicitud?.estado) return null;
    const pos = ORDEN_ESTADOS.indexOf(solicitud.estado.slug);
    if (pos === -1 || pos >= ORDEN_ESTADOS.length - 1) return null;
    return estados.find((e) => e.slug === ORDEN_ESTADOS[pos + 1]) ?? null;
  };

  const handleAvanzarEstado = async () => {
    const siguiente = siguienteEstado();
    if (!siguiente || !solicitud) return;
    setAvanzando(true);
    setServerError(null);
    try {
      const esFinalizar = siguiente.slug === 'finalizado';
      // Al finalizar: registrar pago si hay método seleccionado y no hay pago ya
      if (esFinalizar && !solicitud.pago && pagoMetodoId) {
        const importeEfectivo = pagoImporte !== "" ? Number(pagoImporte) : Number(solicitud.importe_cobro ?? 0);
        await api.post(`/pagos`, {
          solicitud_id: solicitud.id,
          importe: importeEfectivo,
          metodo_pago_id: pagoMetodoId,
          estado_pago_id: 2, // siempre pagado (incluye transferencia)
        });
      }
      await api.put(`/solicitudes/${id}`, { direccion: solicitud.direccion, estado_id: siguiente.id });
      await cargarSolicitud();
      
      // Notificación de éxito solo al finalizar
      if (esFinalizar) {
        toast.success("¡Servicio finalizado con éxito!", {
          description: "La solicitud ha sido completada y cerrada correctamente.",
        });
      }

      setPagoMetodoId(null);
      setPagoImporte("");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Error al avanzar.";
      const validationErrors = err?.response?.data?.errors;
      
      if (validationErrors) {
        Object.values(validationErrors).flat().forEach((msg: any) => toast.error(msg));
      } else {
        toast.error(errorMsg);
      }
      setServerError(errorMsg);
    } finally { setAvanzando(false); }
  };

  const handleRegistrarPago = async () => {
    if (!solicitud || !pagoMetodoId) return;
    // Usa el importe del input; si está vacío, usa el fijado por el admin
    const importeEfectivo = pagoImporte !== "" ? Number(pagoImporte) : Number(solicitud.importe_cobro ?? 0);
    if (!importeEfectivo) return; // no enviar si sigue siendo 0
    setPagando(true);
    try {
      await api.post(`/pagos`, {
        solicitud_id: solicitud.id,
        importe: importeEfectivo,
        metodo_pago_id: pagoMetodoId,
        estado_pago_id: 2,
      });
      await cargarSolicitud();
    } catch (err: any) { setServerError(err?.response?.data?.message || "Error pago."); }
    finally { setPagando(false); }
  };

  const handlePagar = async (mId: number) => {
    if (!solicitud) return;
    setPagando(true);
    setServerError(null);
    try {
      if (solicitud.pago) {
        // Actualizar pago existente (cambia el método y lo marca como pagado)
        await api.put(`/pagos/${solicitud.pago.id}`, {
          solicitud_id: solicitud.id,
          importe: solicitud.pago.importe,
          estado_pago_id: 2, // pagado
          metodo_pago_id: mId,
        });
      } else if (solicitud.importe_cobro) {
        // Crear el pago con el importe fijado por el admin
        await api.post(`/pagos`, {
          solicitud_id: solicitud.id,
          importe: solicitud.importe_cobro,
          metodo_pago_id: mId,
          estado_pago_id: 2, // pagado directamente al confirmar
        });
      }
      await cargarSolicitud();
      setPagoMetodoId(null);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Error al registrar el pago. Inténtalo de nuevo.");
    } finally { setPagando(false); }
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
        importe_cobro: Number(data.importe_cobro),
      });
      await cargarSolicitud();
      setEditando(false);
    } catch (err: any) { setServerError(err?.response?.data?.message || "Error update."); }
  };

  const handleCancelar = async () => {
    if (!solicitud) return;

    toast.warning("¿Cancelar esta solicitud?", {
      description: "Esta acción marcará la solicitud como cancelada definitivamente.",
      action: {
        label: "Confirmar",
        onClick: async () => {
          setCancelando(true);
          setServerError(null);
          try {
            await api.post(`/solicitudes/${id}/cancelar`);
            toast.success("Solicitud cancelada correctamente");
            await cargarSolicitud();
          } catch (err: any) {
            setServerError(err?.response?.data?.message || "No se pudo cancelar la solicitud.");
            toast.error("Error al cancelar la solicitud");
          } finally {
            setCancelando(false);
          }
        },
      },
      actionButtonStyle: {
        backgroundColor: "#f59e0b",
        color: "white",
      },
    });
  };

  if (!solicitud) return <p className="p-8 text-center animate-pulse">Cargando...</p>;

  const siguiente = siguienteEstado();
  const esFinalizar = siguiente?.slug === 'finalizado';
  const esTransferencia = pagoMetodoId === 3;
  const esEnItv = solicitud.estado?.slug === 'en_itv';
  // esRetornando evaluado directamente donde se necesita
  const puedeAvanzar = 
    role === "empleado" && 
    !!siguiente && 
    !["finalizado", "cancelado"].includes(solicitud.estado?.slug || "") &&
    (!esEnItv || !!solicitud.resolucion); // Quitamos la restricción de que deba haber pago para avanzar (ahora se permite finalizar sin pago)

  // A client can cancel if the solicitud isn't in a terminal state and
  // the scheduled date (if set) hasn't passed yet.
  const puedeCancelar = role === "cliente" &&
    ![
      "cancelado",
      "finalizado",
      "en_recogida",
      "en_itv",
      "retornando",
    ].includes(solicitud.estado?.slug || "") &&
    (
      !solicitud.fecha_programada ||
      new Date(solicitud.fecha_programada) > new Date()
    );

  const viewProps = {
    id, solicitud, role, serverError, avanzando, setAvanzando, cargarSolicitud,
    handleAvanzarEstado, puedeAvanzar, siguiente, isBusy,
    cancelando, handleCancelar, puedeCancelar
  };

  const employeeProps: EmpleadoDetailViewProps = {
    ...viewProps, resoluciones, pagoImporte, setPagoImporte, pagoMetodoId, setPagoMetodoId,
    handleRegistrarPago, handlePagar, pagando, esFinalizar, esTransferencia
  };

  const onError = (errs: any) => {
    const messages = new Set<string>();
    const collectErrors = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (typeof obj.message === 'string') {
        if (!obj.message.toLowerCase().includes("invalid input")) {
          messages.add(obj.message);
        }
      } else {
        Object.values(obj).forEach(collectErrors);
      }
    };
    collectErrors(errs);
    messages.forEach(msg => toast.error(msg));
  };

  const standardProps: StandardDetailViewProps = {
    ...viewProps, setServerError, resoluciones, empleados, pagando, handlePagar,
    register, handleSubmit, setValue, watch, errors, isSubmitting, onSubmit, onError, navigate,
    setEditando, editando, pagoImporte, setPagoImporte, pagoMetodoId, setPagoMetodoId, handleRegistrarPago
  };

  const isTerminal = ["finalizado", "cancelado"].includes(solicitud.estado?.slug || "");

  return (
    <div className="w-full">
      {role === "empleado" && !editando && !isTerminal
        ? <EmpleadoDetailView {...employeeProps} /> 
        : <StandardDetailView {...standardProps} />}
    </div>
  );
}
