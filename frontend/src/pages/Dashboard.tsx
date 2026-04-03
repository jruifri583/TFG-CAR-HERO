import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardSinBorde } from "@/components/ui/card";
import { 
  Users, Car, FileText, CreditCard, AlertTriangle,
  Clock, UserCheck, Truck, Search, RotateCcw, CheckCircle, XCircle,
  ShieldCheck, Calendar
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface Contadores {
  usuarios: number;
  vehiculos: number;
  solicitudes: number;
  pagos: number;
  historial: number;
  has_active_request?: boolean;
  itv_alertas?: Array<{
    id: number;
    marca: string;
    modelo: string;
    matricula: string;
    fecha_ultima_itv: string;
  }>;
}

interface SolicitudEstado {
  estado: string;
  total: number;
}

interface SolicitudMes {
  mes: number;
  total: number;
}

interface SolicitudReciente {
  id: number;
  direccion: string;
  fecha_programada: string | null;
  created_at: string | null;
  updated_at: string | null;
  cliente: { nombre: string; apellidos: string; imagen: string | null } | null;
  vehiculo: {
    marca: string;
    modelo: string;
    matricula: string;
    imagen: string | null;
  } | null;
  estado: { slug: string; nombre: string } | null;
  empleado: {
    id: number;
    nombre: string;
    apellidos: string;
    imagen: string | null;
  } | null;
  resolucion: { id: number; nombre: string } | null;
}

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  asignado: "bg-blue-100 text-blue-800",
  en_recogida: "bg-orange-100 text-orange-800",
  en_itv: "bg-purple-100 text-purple-800",
  retornando: "bg-indigo-100 text-indigo-800",
  cancelado: "bg-red-100 text-red-800",
  finalizado: "bg-green-100 text-green-800",
};

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#be185d",
];

function fmt(iso: string | null) {
  if (!iso) return "-";
  return format(new Date(iso), "dd MMM yyyy", { locale: es });
}

function NuevaRow({ s }: { s: SolicitudReciente }) {
  const navigate = useNavigate();
  return (
    <tr
      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
      onClick={() => navigate(`/solicitudes/${s.id}`)}
    >
      <td className="py-2">
        <div className="flex items-center gap-2">
          <img
            src={s.vehiculo?.imagen ?? "/avatars/default_car.png"}
            className="w-8 h-8 rounded object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/avatars/default_car.png";
            }}
          />
          <span>
            {s.vehiculo?.marca} {s.vehiculo?.modelo}
          </span>
        </div>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <img
            src={s.cliente?.imagen ?? "/avatars/default_user.png"}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/avatars/default_user.png";
            }}
          />
          <span>
            {s.cliente?.nombre} {s.cliente?.apellidos}
          </span>
        </div>
      </td>
      <td className="py-2 max-w-[200px] truncate">{s.direccion}</td>
    </tr>
  );
}

function ActualizadaRow({ s }: { s: SolicitudReciente }) {
  const navigate = useNavigate();
  return (
    <tr
      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
      onClick={() => navigate(`/solicitudes/${s.id}`)}
    >
      <td className="py-2">
        <div className="flex items-center gap-2">
          <img
            src={s.vehiculo?.imagen ?? "/avatars/default_car.png"}
            className="w-8 h-8 rounded object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/avatars/default_car.png";
            }}
          />
          <span>
            {s.vehiculo?.marca} {s.vehiculo?.modelo}
          </span>
        </div>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <img
            src={s.cliente?.imagen ?? "/avatars/default_user.png"}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/avatars/default_user.png";
            }}
          />
          <span>
            {s.cliente?.nombre} {s.cliente?.apellidos}
          </span>
        </div>
      </td>
      <td className="py-2">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${ESTADO_COLORS[s.estado?.slug ?? ""] ?? "bg-gray-100 text-gray-800"}`}
        >
          {s.estado?.nombre ?? "-"}
        </span>
      </td>
      <td className="py-2">
        {s.updated_at
          ? format(new Date(s.updated_at), "dd MMM yyyy", { locale: es })
          : "-"}
      </td>
      <td className="py-2 max-w-[200px] truncate">{s.direccion}</td>
    </tr>
  );
}
// mapping de iconos por slug
const STATUS_ICONS: Record<string, any> = {
  pendiente: Clock,
  asignado: UserCheck,
  en_recogida: Truck,
  en_itv: Search,
  retornando: RotateCcw,
  finalizado: CheckCircle,
  cancelado: XCircle,
};

function SolicitudStatusCard({ s }: { s: SolicitudReciente }) {
  const navigate = useNavigate();
  const isCancelled = s.estado?.slug === "cancelado";
  
  // Colores de resolución
  const getResolucionClass = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n.includes("favorable") && !n.includes("desfavorable")) return "bg-green-100 text-green-700 border-green-200";
    if (n.includes("desfavorable")) return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-600 border-slate-200"; // Pendiente u otros
  };

  return (
    <Card 
      className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-900/40 mb-4"
      onClick={() => navigate(`/solicitudes/${s.id}`)}
    >
      <CardContent className="p-4 lg:p-6 text-slate-800 dark:text-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-y-8 gap-x-4 items-center">
          
          {/* Bloque 1: Vehículo */}
          <div className="flex items-center gap-4 min-w-0">
            <img 
              src={s.vehiculo?.imagen ?? "/avatars/default_car.png"} 
              className="w-14 h-14 lg:w-16 lg:h-16 object-cover rounded-2xl shadow-sm border-2 border-white dark:border-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-black text-sm lg:text-base leading-tight truncate">
                {s.vehiculo?.marca} {s.vehiculo?.modelo}
              </h3>
              <p className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest font-mono font-bold truncate">
                {s.vehiculo?.matricula}
              </p>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              {(() => {
                const Icon = STATUS_ICONS[s.estado?.slug || ""] || Clock;
                return <Icon size={24} className={`z-10 ${isCancelled ? "text-red-500" : "text-primary"}`} />;
              })()}
              <div className={`absolute w-4 h-4 rounded-full z-0 opacity-20 ${isCancelled ? "bg-red-500" : "bg-primary animate-ping"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Estado</p>
              <h4 className={`text-xs font-black uppercase italic truncate ${isCancelled ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
                {s.estado?.nombre}
              </h4>
            </div>
          </div>

          {/* Empleado */}
          <div className="flex items-center gap-3 min-w-0">
            {s.empleado ? (
              <>
                <img src={s.empleado.imagen ?? "/avatars/default_user.png"} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Empleado</p>
                  <p className="text-xs font-black italic truncate">{s.empleado.nombre}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                   <UserCheck size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Empleado</p>
                  <p className="text-[10px] text-muted-foreground italic font-medium leading-none">Asignando...</p>
                </div>
              </>
            )}
          </div>

          {/* Resolución */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
              <ShieldCheck size={20} className="text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1.5">Resolución</p>
              <div className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest italic leading-none ${getResolucionClass(s.resolucion?.nombre || "Pendiente")}`}>
                {s.resolucion?.nombre || "Pendiente"}
              </div>
            </div>
          </div>

          {/* Actualizado */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
              <Calendar size={20} className="text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Actualizado</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic leading-none truncate">{fmt(s.updated_at)}</p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.rol?.slug ?? "";
  const [contadores, setContadores] = useState<Contadores | null>(null);
  const [porEstado, setPorEstado] = useState<SolicitudEstado[]>([]);
  const [porMes, setPorMes] = useState<SolicitudMes[]>([]);
  const [solicitudesRecientes, setSolicitudesRecientes] = useState<
    SolicitudReciente[]
  >([]);
  const [solicitudesActualizadas, setSolicitudesActualizadas] = useState<
    SolicitudReciente[]
  >([]);

  useEffect(() => {
    api.get("/contadores").then((res) => setContadores(res.data));
    api
      .get("/dashboard/solicitudes-por-estado")
      .then((res) => setPorEstado(res.data));
    api
      .get("/dashboard/solicitudes-por-mes")
      .then((res) => setPorMes(res.data));
    api
      .get("/dashboard/solicitudes-recientes")
      .then((res) => setSolicitudesRecientes(res.data.data));
    api
      .get("/dashboard/solicitudes-actualizadas")
      .then((res) => setSolicitudesActualizadas(res.data.data));
  }, []);

  const mesData = porMes.map((m) => ({
    mes: MESES[m.mes - 1],
    total: m.total,
  }));

  return (
    <div>
      {role === "administrador" && <AdminDashboard />}
      {role === "empleado" && <EmpleadoDashboard />}
      {role === "cliente" && <ClienteDashboard />}
    </div>
  );

  function AdminDashboard() {
    return (
      <div className="space-y-6">
        {/* Tarjetas */}
        <div className="grid grid-cols-4 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Usuarios
              </CardTitle>
              <Users size={18} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">
                {contadores?.usuarios ?? "-"}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Vehículos
              </CardTitle>
              <Car size={18} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">
                {contadores?.vehiculos ?? "-"}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-ring">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-white">Solicitudes</CardTitle>
              <FileText size={18} className="text-white" />
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">
                {contadores?.solicitudes ?? "-"}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-white">Pagos</CardTitle>
              <CreditCard size={18} className="text-white" />
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-white">
                {contadores?.pagos ?? "-"}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente de solicitudes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nuevas */}
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Nuevas solicitudes
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left py-2">Vehículo</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Dirección</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesRecientes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No hay nuevas solicitudes
                      </td>
                    </tr>
                  ) : (
                    solicitudesRecientes.map((s) => (
                      <NuevaRow key={s.id} s={s} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Actualizadas */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Actualizadas recientemente
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="text-left py-2">Vehículo</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Estado</th>
                    <th className="text-left py-2">Última actualización</th>
                    <th className="text-left py-2">Dirección</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesActualizadas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-muted-foreground"
                      >
                        Sin actualizaciones recientes
                      </td>
                    </tr>
                  ) : (
                    solicitudesActualizadas.map((s) => (
                      <ActualizadaRow key={s.id} s={s} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Gráficas */}
        <div className="grid grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitudes por estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={porEstado}
                    dataKey="total"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    isAnimationActive={false}
                    label={({ name, percent = 0 }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {porEstado.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function EmpleadoDashboard() {
    return (
      <div className="space-y-6">

        {/* Alertas de nuevas asignaciones */}
        {solicitudesActualizadas.filter(s => s.estado?.slug === 'asignado').length > 0 && (
          <div className="space-y-3">
            {solicitudesActualizadas
              .filter(s => s.estado?.slug === 'asignado')
              .map(s => (
                <CardSinBorde key={s.id} className="bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-full ring-4 ring-yellow-50 dark:ring-yellow-900/10">
                      <AlertTriangle className="text-yellow-600 dark:text-yellow-400 animate-pulse" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-yellow-900 dark:text-yellow-100 uppercase italic">
                        {contadores?.has_active_request ? "Pendiente de procesar" : "Solicitud Asignada"}
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        {contadores?.has_active_request 
                          ? "Termina tu servicio actual para poder gestionar el "
                          : "Tienes pendiente el "}
                        {s.vehiculo?.marca} {s.vehiculo?.modelo} ({s.vehiculo?.matricula})
                      </p>
                    </div>
                    <Button 
                      asChild={!contadores?.has_active_request}
                      disabled={contadores?.has_active_request}
                      className={`${contadores?.has_active_request ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70' : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-200/50'} border-none transition-all font-bold h-10 px-6 rounded-xl whitespace-nowrap`}
                    >
                      {contadores?.has_active_request ? (
                        <div className="flex items-center">
                          <Clock size={16} className="mr-2" />
                          Servicio activo
                        </div>
                      ) : (
                        <NavLink to={`/solicitudes/${s.id}`}>
                          <FileText size={16} className="mr-2" />
                          Gestionar ahora
                        </NavLink>
                      )}
                    </Button>
                  </CardContent>
                </CardSinBorde>
              ))}
          </div>
        )}

        {/* Gráficas duplicadas del Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitudes por estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={porEstado}
                    dataKey="total"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    isAnimationActive={false}
                    label={({ name, percent = 0 }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {porEstado.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  function ClienteDashboard() {
    const navigate = useNavigate();
    const nombreCompleto = [user?.nombre, user?.apellidos]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="space-y-6">
        {/* Saludo */}
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido/a{nombreCompleto ? `, ${nombreCompleto}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Aquí tienes un resumen de tu actividad.
          </p>
        </div>

        {/* Sección ITV */}
        <CardSinBorde className="border-none shadow-none bg-white overflow-hidden">
          <CardContent className="p-0">
            {contadores?.itv_alertas && contadores.itv_alertas.length > 0 ? (
              <div className="flex flex-col gap-3">
                {contadores.itv_alertas.map((alert) => (
                  <div key={alert.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-full">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-500" size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 italic">
                          ¡Atención ITV!
                        </h4>
                        <p className="text-sm text-yellow-800/80 dark:text-yellow-200/60">
                          La ITV de tu <strong>{alert.marca} {alert.modelo} ({alert.matricula})</strong> caduca pronto. (Última: {fmt(alert.fecha_ultima_itv)})
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/perfil/${user?.id}/nueva-solicitud?vehiculo_id=${alert.id}&v_marca=${alert.marca}&v_modelo=${alert.modelo}&v_matricula=${alert.matricula}`)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-md whitespace-nowrap"
                    >
                      <FileText size={16} className="mr-2" />
                      Solicitar recogida
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full hidden sm:block">
                    <Car className="text-blue-600 dark:text-blue-400" size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      Llevamos tu coche a la ITV por ti
                    </h4>
                    <p className="text-sm text-blue-800/80 dark:text-blue-200/60 max-w-lg">
                      Nos encargamos de todo el proceso para que no pierdas tiempo. Rápido, seguro y sin complicaciones.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate(`/perfil/${user?.id}/nueva-solicitud`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <FileText size={18} className="mr-2" />
                  Solicitar ahora
                </Button>
              </div>
            )}
          </CardContent>
        </CardSinBorde>

        {/* Solicitudes recientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recientemente...</h2>
          </div>
          
          {solicitudesActualizadas.length === 0 ? (
            <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
                  <FileText className="text-slate-300 dark:text-slate-600" size={32} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 max-w-[200px]">
                  No tienes ninguna solicitud activa en este momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {solicitudesActualizadas[0] && (
                <SolicitudStatusCard key={solicitudesActualizadas[0].id} s={solicitudesActualizadas[0]} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
