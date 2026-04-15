import { useEffect, useState, memo } from "react";
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
  importe_cobro: number | null;
  cliente: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    ciudad: string | null;
    codigo_postal: string | null;
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

// ─── Props de Vistas ──────────────────────────────────────────────────────────

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
  navigate: any;
  // Pago props (para Admin)
  pagoImporte: string;
  setPagoImporte: (v: string) => void;
  pagoMetodoId: number | null;
  setPagoMetodoId: (v: number | null) => void;
  handleRegistrarPago: () => Promise<void>;
}

// ─── Sub-Componentes (Vistas) ────────────────────────────────────────────────

const EmpleadoDetailView = memo(({
  id, solicitud, resoluciones, avanzando, setAvanzando, cargarSolicitud,
  pagoImporte, setPagoImporte, pagoMetodoId, setPagoMetodoId,
  handleRegistrarPago, handlePagar, pagando, serverError,
  puedeAvanzar, handleAvanzarEstado, isBusy, siguiente,
  esFinalizar, esTransferencia
}: EmpleadoDetailViewProps) => {
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
            <div className="space-y-2">
              <Label className="text-primary flex items-center gap-2 uppercase font-bold text-[10px] tracking-widest">
                <Clock size={14} /> Estado de Servicio
              </Label>
              <Input 
                type="text" 
                value={solicitud.estado?.nombre ?? "—"} 
                readOnly 
                className="bg-slate-50 border-slate-200 pointer-events-none font-bold text-slate-900" 
              />
            </div>
            
            <div className="space-y-4">
              {(solicitud.estado?.slug === 'en_itv' || solicitud.resolucion) && (
                <div className="space-y-2">
                  <Label className="text-primary flex items-center gap-2 uppercase font-bold text-[10px] tracking-widest">
                     <ShieldCheck size={14} /> Resultado ITV
                  </Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={solicitud.resolucion?.id ?? ""}
                    disabled={solicitud.estado?.slug !== 'en_itv'}
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

              <div className="space-y-2">
                <Label className="text-primary flex items-center gap-2 uppercase font-bold text-[10px] tracking-widest">
                   <FileText size={14} /> Notas Operativas
                </Label>
                <Textarea 
                  className="min-h-[80px] resize-none"
                  placeholder="Observaciones..."
                  disabled={solicitud.estado?.slug === 'finalizado'}
                  defaultValue={solicitud.notas ?? ""}
                  onBlur={async (e) => {
                    const val = e.target.value;
                    if (val === solicitud.notas) return;
                    try {
                      setAvanzando(true);
                      await api.put(`/solicitudes/${id}`, { direccion: solicitud.direccion, notas: val });
                      await cargarSolicitud();
                    } catch(err) {
                      console.error(err);
                    } finally {
                      setAvanzando(false);
                    }
                  }}
                />
              </div>
            </div>

            {/* GESTIÓN DE COBRO */}
            {solicitud.estado?.slug === 'retornando' && !solicitud.pago && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-2 block">
                  Cobro del servicio
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {pagoMetodoId !== 3 && (
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Importe</Label>
                      <Input
                        type="number"
                        value={pagoImporte !== "" ? pagoImporte : (solicitud.importe_cobro ? String(solicitud.importe_cobro) : "")}
                        onChange={(e) => setPagoImporte(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  )}
                  <div className={`space-y-1 ${pagoMetodoId === 3 ? 'col-span-2' : ''}`}>
                    <Label className="text-[10px] text-muted-foreground">Método de pago</Label>
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
                {pagoMetodoId === 3 && (
                  <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-[10px] text-blue-700 font-bold italic">
                      Transferencia: el pago quedará pendiente hasta confirmar recepción.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pago COMPLETADO */}
            {solicitud.pago && solicitud.pago.estado_pago?.slug === 'pagado' && (
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
                       (isBusy && siguiente?.slug === 'en_recogida')
                     }
                     className="w-full py-6 text-md font-bold uppercase tracking-wider shadow-lg"
                   >
                     {avanzando ? "Actualizando..." : 
                      (!solicitud.pago && !pagoMetodoId && esFinalizar) 
                        ? "Finalizar sin pago"
                        : esFinalizar && esTransferencia && !solicitud.pago 
                          ? "Finalizar con Transferencia" 
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
  id, solicitud, role, editando, setEditando, serverError, setServerError, 
  avanzando, setAvanzando,
  resoluciones, empleados, pagando, handlePagar, puedeAvanzar, handleAvanzarEstado,
  siguiente, isBusy, register, handleSubmit, setValue, watch, errors, 
  isSubmitting, onSubmit, navigate, 
  pagoImporte, setPagoImporte, pagoMetodoId, setPagoMetodoId, handleRegistrarPago,
  cancelando, handleCancelar, puedeCancelar
}: StandardDetailViewProps) => {
  if (editando) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                    <Input type="text" {...register("direccion")} className="border-slate-200" />
                    {errors.direccion && <p className="text-red-500 text-xs font-medium">{errors.direccion.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Fecha programada</label>
                    <Input type="datetime-local" {...register("fecha_programada")} className="border-slate-200" />
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
                        <SelectField 
                          label="Empleado Asignado" 
                          value={watch("user_empleado_id")} 
                          onChange={(v) => setValue("user_empleado_id", v)} 
                          options={empleados.map((e: Empleado) => ({ 
                            id: e.id, 
                            nombre: `${e.nombre} ${e.apellidos}` 
                          }))} 
                          placeholder="Sin asignar" 
                        />
                        {errors.user_empleado_id && <p className="text-red-500 text-xs font-medium">{errors.user_empleado_id.message}</p>}
                      </div>
                      {/* Importe del servicio: el admin lo fija en la solicitud */}
                      <div className="space-y-1">
                        <label className="text-sm font-medium">Importe del Servicio (€)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={pagoImporte !== "" ? pagoImporte : (solicitud.importe_cobro ? String(solicitud.importe_cobro) : "")}
                          onChange={(e) => setPagoImporte(e.target.value)}
                          className="border-slate-200"
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
                <Button type="button" variant="outline" className="w-50" onClick={() => { setEditando(false); setServerError(null); }}>Cancelar</Button>
                <Button type="submit" className="w-50" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar cambios"}</Button>
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
                <ReadOnlyField label="Agente Asignado" value={solicitud.empleado ? `${solicitud.empleado.nombre} ${solicitud.empleado.apellidos}` : "No asignado"} />
                <ReadOnlyField label="Resolución ITV" value={solicitud.resolucion?.nombre} icon={ShieldCheck} />
                
                {role === 'administrador' && solicitud.estado?.slug === 'retornando' && !solicitud.pago && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block text-center">Registro de Cobro</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {pagoMetodoId !== 3 && (
                          <div className="space-y-1">
                            <Label className="text-[10px]">Importe</Label>
                            <Input type="number" value={pagoImporte} onChange={(e) => setPagoImporte(e.target.value)} className="h-9 text-sm" />
                          </div>
                        )}
                        <div className={`space-y-1 ${pagoMetodoId === 3 ? 'col-span-2' : ''}`}>
                          <Label className="text-[10px]">Método</Label>
                          <select className="w-full h-9 border rounded-md px-2 text-xs" value={pagoMetodoId ?? ""} onChange={(e) => setPagoMetodoId(Number(e.target.value))}>
                            <option value="">Seleccionar</option>
                            <option value="1">Efectivo</option>
                            <option value="2">Tarjeta</option>
                            <option value="3">Transferencia</option>
                          </select>
                        </div>
                    </div>
                    {pagoMetodoId !== 3 && (
                      <Button onClick={handleRegistrarPago} disabled={pagando || !pagoMetodoId || !pagoImporte} className="w-full h-10 bg-primary text-white font-bold">Cobrar ahora</Button>
                    )}
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
                    <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <img src={solicitud.cliente?.imagen ?? "/avatars/default_user.png"} className="w-16 h-16 rounded-full object-cover shadow-sm" />
                      <div className="flex-1">
                        <p className="font-bold text-lg">{solicitud.cliente?.nombre} {solicitud.cliente?.apellidos}</p>
                        <p className="text-sm text-slate-500 truncate">{solicitud.cliente?.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </CardSinBorde>
              )}
              <CardSinBorde className="border-l-2 border-l-primary">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-bold text-lg">Vehículo</h3>
                  <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full overflow-hidden flex items-center justify-center">
                      <img src={solicitud.vehiculo?.imagen ?? "/avatars/default_car.png"} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{solicitud.vehiculo?.marca} {solicitud.vehiculo?.modelo}</p>
                      <p className="text-[12px] font-bold text-primary uppercase tracking-tight mt-0.5">{solicitud.vehiculo?.matricula}</p>
                    </div>
                  </div>
                </CardContent>
              </CardSinBorde>
           </div>

           {/* Información de Pago y Notas */}
           <div className="space-y-6">
              {/* Importe fijado por el admin — el cliente solo lo ve como información */}
              {!solicitud.pago && solicitud.importe_cobro && (
                <div className="px-6 py-4 rounded-xl border border-yellow-200 flex items-center justify-between gap-4" style={{ background: 'rgb(254 252 232)' }}>
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
                <div className="px-6 py-4 rounded-xl border flex items-center justify-between gap-4" style={{
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
                    solicitud.pago.estado_pago?.slug === 'pagado'
                      ? 'bg-success/10 text-success ring-success/20'
                      : 'bg-warning/10 text-warning ring-warning/20'
                  }`}>
                    {solicitud.pago.estado_pago?.nombre}
                  </span>
                </div>
              )}

              <div className="font-medium">
                 <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Notas del servicio</label>
                 <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm italic text-slate-600 mt-1">
                   {solicitud.notas || "Sin observaciones adicionales."}
                 </div>
              </div>
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

      <div className="flex flex-wrap items-center justify-end gap-3 pt-8 mt-2 border-t-2 border-primary font-bold">
        <Button variant="outline" onClick={() => navigate(-1)} className="w-50">Volver</Button>
        {role === "administrador" && !["cancelado"].includes(solicitud.estado?.slug || "") && (
          <Button onClick={() => setEditando(true)} variant={puedeAvanzar ? "outline" : "default"} className="w-50">Editar</Button>
        )}
        {puedeAvanzar && (
          <Button
            className="w-50"
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
        {solicitud.pago && solicitud.pago.estado_pago?.slug === 'pendiente' && (
          <div className="flex gap-2">
            <Button className="bg-emerald-600 text-white" disabled={pagando} onClick={() => handlePagar(1)}>Cobrar Efectivo</Button>
            <Button className="bg-cyan-600 text-white" disabled={pagando} onClick={() => handlePagar(2)}>Cobrar Tarjeta</Button>
          </div>
        )}
        {role === "cliente" && puedeCancelar && (
          <Button
            variant="destructive"
            className="w-50 hover:bg-red-700"
            onClick={handleCancelar}
            disabled={cancelando}
          >
            {cancelando ? "Cancelando..." : "Cancelar solicitud"}
          </Button>
        )}
      </div>
    </div>
  );
});

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
    } catch(err) { console.error(err); }
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
        user_empleado_id: solicitud.empleado?.id ?? null,
        notas: solicitud.notas ?? "",
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
          estado_pago_id: pagoMetodoId === 3 ? 1 : 2, // transferencia → pendiente, resto → pagado
        });
      }
      await api.put(`/solicitudes/${id}`, { direccion: solicitud.direccion, estado_id: siguiente.id });
      await cargarSolicitud();
      setPagoMetodoId(null);
      setPagoImporte("");
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "Error al avanzar.");
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
        estado_pago_id: (pagoMetodoId === 3) ? 1 : 2,
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
        // El admin fija el importe directamente en la solicitud (no crea un pago)
        importe_cobro: pagoImporte !== "" ? Number(pagoImporte) : (solicitud?.importe_cobro ?? null),
      });
      await cargarSolicitud();
      setPagoImporte("");
      setPagoMetodoId(null);
      setEditando(false);
    } catch (err: any) { setServerError(err?.response?.data?.message || "Error update."); }
  };

  const handleCancelar = async () => {
    if (!solicitud) return;
    setCancelando(true);
    setServerError(null);
    try {
      await api.post(`/solicitudes/${id}/cancelar`);
      await cargarSolicitud();
    } catch (err: any) {
      setServerError(err?.response?.data?.message || "No se pudo cancelar la solicitud.");
    } finally {
      setCancelando(false);
    }
  };

  if (!solicitud) return <p className="p-8 text-center animate-pulse">Cargando...</p>;

  const siguiente = siguienteEstado();
  const esFinalizar = siguiente?.slug === 'finalizado';
  const esTransferencia = pagoMetodoId === 3;
  const esEnItv = solicitud.estado?.slug === 'en_itv';
  const esRetornando = solicitud.estado?.slug === 'retornando';
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

  const standardProps: StandardDetailViewProps = {
    ...viewProps, setServerError, resoluciones, empleados, pagando, handlePagar,
    register, handleSubmit, setValue, watch, errors, isSubmitting, onSubmit, navigate,
    setEditando, editando, pagoImporte, setPagoImporte, pagoMetodoId, setPagoMetodoId, handleRegistrarPago
  };

  return (
    <div className="w-full">
      {role === "empleado" && !editando 
        ? <EmpleadoDetailView {...employeeProps} /> 
        : <StandardDetailView {...standardProps} />}
    </div>
  );
}
