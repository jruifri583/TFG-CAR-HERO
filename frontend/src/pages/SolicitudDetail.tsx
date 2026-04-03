import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardSinBorde } from "@/components/ui/card";
import SolicitudCircularTracker from "@/components/ui/SolicitudCircularTracker";
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

// Orden de estados avanzables (excluye cancelado/finalizado que son terminales)
const ORDEN_ESTADOS = [
  "pendiente",
  "asignado",
  "en_recogida",
  "en_itv",
  "retornando",
];

// ─── Schema de edición ─────────────────────────────────────────────────────────

const editSchema = z
  .object({
    direccion: z.string().min(1, "La dirección es obligatoria").max(255),
    fecha_programada: z.string().optional().or(z.literal("")),
    resolucion_id: z.number().nullable().optional(),
    user_empleado_id: z.number().nullable().optional(),
    notas: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Si hay empleado, debe haber fecha
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

// ─── Sub-componentes ───────────────────────────────────────────────────────────

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
        className="w-full border rounded-md px-3 py-2 text-sm bg-background"
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

// ─── Página principal ──────────────────────────────────────────────────────────

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditFormData>({ resolver: zodResolver(editSchema) });
  const { setHeaderData } = useHeader();

  // Carga solicitud
  const cargarSolicitud = () =>
    api.get(`/solicitudes/${id}`).then((res) => setSolicitud(res.data.data));

  useEffect(() => {
    cargarSolicitud();
  }, [id]);

  // Carga meta una sola vez
  useEffect(() => {
    if (role !== "cliente") {
      api.get("/solicitudes/meta").then((res) => {
        setEstados(res.data.baseData?.estados ?? []);
        setResoluciones(res.data.baseData?.resoluciones ?? []);
        setEmpleados(res.data.empleados ?? []);
      });
    }
  }, [role]);

  // Rellena el formulario al activar edición
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

  // 🔥 Sincroniza el header
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

  // Calcula el siguiente estado posible
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

  if (!solicitud) return <p>Cargando...</p>;

  const siguiente = siguienteEstado();
  const puedeAvanzar =
    role !== "cliente" &&
    siguiente !== null &&
    solicitud.estado?.slug !== "pendiente" &&
    solicitud.estado?.slug !== "cancelado" &&
    solicitud.estado?.slug !== "finalizado";

  // ─── MODO VISTA ──────────────────────────────────────────────────────────────

  if (!editando) {
    return (
      <div className="w-full space-y-6">

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

        {/* Cliente — solo ADMIN / EMPLEADO */}
        {role !== "cliente" && (
          <CardSinBorde className="w-full">
            <CardContent className="space-y-4">
              <p className="font-semibold text-lg">Cliente</p>
              <div className="flex items-center gap-4">
                <img
                  src={
                    solicitud.cliente?.imagen ?? "/avatars/default_user.png"
                  }
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
                  <Field
                    label="Email"
                    value={solicitud.cliente?.email ?? "-"}
                  />
                </div>
              </div>
            </CardContent>
          </CardSinBorde>
        )}

        {/* Vehículo */}
        <CardSinBorde className="w-full">
          <CardContent className="space-y-4">
            <p className="font-semibold text-lg">Vehículo</p>
            <div className="flex items-center gap-4">
              <img
                src={
                  solicitud.vehiculo?.imagen ?? "/avatars/default_car.png"
                }
                className="w-14 h-14 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/avatars/default_car.png";
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
                <Field
                  label="Importe"
                  value={`${solicitud.pago.importe} €`}
                />
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
              <p className="text-muted-foreground text-sm">
                Sin pago asociado
              </p>
            )}
          </CardContent>
        </CardSinBorde>

        {/* Horas + Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSinBorde className="w-full">
            <CardContent className="space-y-4">
              <p className="font-semibold text-lg">Seguimiento horario</p>
              <div className="grid grid-cols-1 gap-4">
                <Field
                  label="Hora recogida"
                  value={fmt(solicitud.hora_recogida)}
                />
                <Field label="Hora ITV" value={fmt(solicitud.hora_itv)} />
                <Field
                  label="Hora entrega"
                  value={fmt(solicitud.hora_entrega)}
                />
              </div>
            </CardContent>
          </CardSinBorde>

          <CardSinBorde className="w-full">
            <CardContent className="flex justify-center items-center">
              <SolicitudCircularTracker estado={solicitud.estado} />
            </CardContent>
          </CardSinBorde>
        </div>

        {/* Error avance */}
        {serverError && (
          <p className="text-red-500 text-sm text-right">{serverError}</p>
        )}

        {/* Botones */}
        {!(solicitud.estado?.slug === "finalizado" && solicitud.pago) && (
          <div className="flex justify-end gap-2">
            <Button
              className="w-50"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Atrás
            </Button>

            {/* Avanzar estado — empleado y admin */}
            {puedeAvanzar && (
              <Button
                className="w-50"
                variant="secondary"
                onClick={handleAvanzarEstado}
                disabled={avanzando}
              >
                {avanzando
                  ? "Avanzando..."
                  : `Avanzar a "${siguiente?.nombre}"`}
              </Button>
            )}

            {/* Editar — solo admin y empleado */}
            {role !== "cliente" && (
              <Button className="w-50" onClick={() => setEditando(true)}>
                Editar
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── MODO EDICIÓN ────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos principales */}
        <CardSinBorde className="w-full">
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Dirección *
              </label>
              <Input type="text" {...register("direccion")} />
              {errors.direccion && (
                <p className="text-red-500 text-xs">
                  {errors.direccion.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">
                Fecha programada
              </label>
              <Input
                type="datetime-local"
                {...register("fecha_programada")}
              />
            </div>

            <SelectField
              label="Resolución"
              value={watch("resolucion_id")}
              onChange={(v) => setValue("resolucion_id", v)}
              options={resoluciones}
              placeholder="Sin resolución"
            />

            {/* Empleado — solo admin */}
            {role === "administrador" && (
              <div className="space-y-1">
                <SelectField
                  label="Empleado"
                  value={watch("user_empleado_id")}
                  onChange={(v) => setValue("user_empleado_id", v)}
                  options={empleados.map((e) => ({
                    id: e.id,
                    nombre: `${e.nombre} ${e.apellidos}`,
                  }))}
                  placeholder="Sin asignar"
                />
                {errors.user_empleado_id && (
                  <p className="text-red-500 text-xs">
                    {errors.user_empleado_id.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm text-muted-foreground">Notas</label>
              <Input
                type="text"
                {...register("notas")}
                placeholder="Observaciones opcionales"
              />
              {errors.notas && (
                <p className="text-red-500 text-xs">{errors.notas.message}</p>
              )}
            </div>
          </CardContent>
        </CardSinBorde>

        {serverError && (
          <p className="text-red-500 text-sm text-right">{serverError}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            className="w-50"
            type="button"
            variant="outline"
            onClick={() => {
              setEditando(false);
              setServerError(null);
            }}
          >
            Cancelar
          </Button>
          <Button className="w-50" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
