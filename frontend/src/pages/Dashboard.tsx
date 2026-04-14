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
  cliente: { 
    id: number;
    nombre: string; 
    apellidos: string; 
    email: string;
    ciudad: string | null;
    codigo_postal: string | null;
    imagen: string | null 
  } | null;
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
      <td className="py-2 hidden md:table-cell max-w-[200px] truncate">{s.direccion}</td>
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
      <td className="py-2 hidden sm:table-cell">
        {s.updated_at
          ? format(new Date(s.updated_at), "dd MMM yyyy", { locale: es })
          : "-"}
      </td>
      <td className="py-2 hidden md:table-cell max-w-[200px] truncate">{s.direccion}</td>
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
        <div className="flex md:items-center gap-4 w-full">
          <span className="text-xl font-black text-slate-400 dark:text-slate-500 shrink-0 select-none mt-1 md:mt-0">
            {s.id}
          </span>
          <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap justify-between gap-y-6 gap-x-4 w-full min-w-0">
            
            {/* Bloque 1: Vehículo */}
            <div className="flex items-center gap-4 min-w-0">
              <img 
                src={s.vehiculo?.imagen ?? "/avatars/default_car.png"} 
                className="w-12 h-12 lg:w-14 lg:h-14 object-cover rounded-full shadow-sm border-2 border-white dark:border-slate-800 shrink-0"
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
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
              <div className="relative flex items-center justify-center shrink-0">
                {(() => {
                  const Icon = STATUS_ICONS[s.estado?.slug || ""] || Clock;
                  return <Icon size={28} className={`z-10 ${isCancelled ? "text-red-500" : "text-primary"}`} />;
                })()}
                <div className={`absolute w-4 h-4 rounded-full z-0 opacity-20 ${isCancelled ? "bg-red-500" : "bg-primary animate-ping"}`} />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Estado</p>
              <h4 className={`text-xs font-black uppercase italic truncate ${isCancelled ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
                {s.estado?.nombre}
              </h4>
            </div>
          </div>

          {/* Empleado */}
          <div className="flex items-center gap-4 min-w-0">
            {s.empleado ? (
              <>
                <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
                  <img src={s.empleado.imagen ?? "/avatars/default_user.png"} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Empleado</p>
                  <p className="text-xs font-black italic truncate">{s.empleado.nombre}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                     <UserCheck size={20} className="text-slate-300 dark:text-slate-600" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Empleado</p>
                  <p className="text-[10px] text-muted-foreground italic font-medium leading-none">Asignando...</p>
                </div>
              </>
            )}
          </div>

          {/* Resolución */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                <ShieldCheck size={22} className="text-slate-400" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1.5">Resolución</p>
              <div className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest italic leading-none ${getResolucionClass(s.resolucion?.nombre || "Pendiente")}`}>
                {s.resolucion?.nombre || "Pendiente"}
              </div>
            </div>
          </div>

          {/* Actualizado */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 lg:w-14 flex items-center justify-center shrink-0">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                <Calendar size={22} className="text-slate-400" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter leading-none mb-1">Actualizado</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic leading-none truncate">{fmt(s.updated_at)}</p>
            </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Usuarios — azul profundo 900→800 */}
          <Card className="border-0 shadow-md" style={{ background: 'linear-gradient(135deg, #194185 0%, #1849A9 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#84CAFF' }}>Usuarios</CardTitle>
              <div className="p-2 rounded-lg" style={{ background: '#175CD3' }}>
                <Users size={16} style={{ color: '#D1E9FF' }} />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-black text-white">
                {contadores?.usuarios ?? "-"}
              </span>
            </CardContent>
          </Card>

          {/* Vehículos — azul oscuro 800→700 */}
          <Card className="border-0 shadow-md" style={{ background: 'linear-gradient(135deg, #1849A9 0%, #175CD3 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#B2DDFF' }}>Vehículos</CardTitle>
              <div className="p-2 rounded-lg" style={{ background: '#1570EF' }}>
                <Car size={16} style={{ color: '#EFF8FF' }} />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-black text-white">
                {contadores?.vehiculos ?? "-"}
              </span>
            </CardContent>
          </Card>

          {/* Solicitudes — azul medio 600→500 */}
          <Card className="border-0 shadow-md" style={{ background: 'linear-gradient(135deg, #1570EF 0%, #2E90FA 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#D1E9FF' }}>Solicitudes</CardTitle>
              <div className="p-2 rounded-lg" style={{ background: '#1849A9' }}>
                <FileText size={16} style={{ color: '#EFF8FF' }} />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-black text-white">
                {contadores?.solicitudes ?? "-"}
              </span>
            </CardContent>
          </Card>

          {/* Pagos — azul claro 100→50 */}
          <Card className="border-0 shadow-md" style={{ background: 'linear-gradient(135deg, #D1E9FF 0%, #EFF8FF 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#175CD3' }}>Pagos</CardTitle>
              <div className="p-2 rounded-lg" style={{ background: '#84CAFF' }}>
                <CreditCard size={16} style={{ color: '#194185' }} />
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-black" style={{ color: '#1849A9' }}>
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b italic uppercase text-[10px] tracking-widest">
                        <th className="text-left py-2">Vehículo</th>
                        <th className="text-left py-2">Cliente</th>
                        <th className="text-left py-2 hidden md:table-cell">Dirección</th>
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
            </div>

            {/* Actualizadas */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Actualizadas recientemente
              </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b italic uppercase text-[10px] tracking-widest">
                        <th className="text-left py-2">Vehículo</th>
                        <th className="text-left py-2">Cliente</th>
                        <th className="text-left py-2">Estado</th>
                        <th className="text-left py-2 hidden sm:table-cell">Última actualización</th>
                        <th className="text-left py-2 hidden md:table-cell">Dirección</th>
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
            </div>
          </CardContent>
        </Card>

        {/* Gráficas */}
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

  function EmpleadoDashboard() {
    const pendingAssignments = solicitudesActualizadas.filter(s => s.estado?.slug === 'asignado');

    return (
      <div className="space-y-6">
        {/* Sección de nuevas asignaciones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Actividades</h2>
          </div>
          
          {pendingAssignments.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-md p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm group">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-400/10 transition-colors duration-500" />
              
              <div className="relative shrink-0 w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-blue-50 dark:border-slate-700">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-50" />
                <CheckCircle className="text-blue-600 dark:text-blue-400 relative z-10" size={28} strokeWidth={2} />
              </div>
              
              <div className="flex-1 text-center sm:text-left relative z-10">
                <h3 className="text-base font-black text-blue-900 dark:text-blue-100 tracking-tight leading-none mb-1 uppercase italic">
                  Todo al día
                </h3>
                <p className="text-xs text-blue-700/70 dark:text-blue-300/60 font-bold uppercase tracking-widest leading-relaxed">
                  Actualmente no tienes tareas asignadas pendientes de procesar
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAssignments.map(s => (
                <CardSinBorde key={s.id} className="bg-yellow-50 border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30 overflow-hidden relative group transition-all hover:shadow-lg">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-yellow-400/20 transition-all duration-500" />
                  
                  <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4 relative z-10">
                    <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-2xl ring-4 ring-yellow-50/50 dark:ring-yellow-900/10 shadow-inner">
                      <AlertTriangle className="text-yellow-600 dark:text-yellow-400 animate-pulse" size={24} />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-[10px] font-black text-yellow-800 dark:text-yellow-200 uppercase italic tracking-tighter mb-1">
                        Nueva Solicitud Asignada
                      </p>
                      <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-tight">
                        {s.vehiculo?.marca} {s.vehiculo?.modelo} - <span className="font-mono text-xs opacity-70">{s.vehiculo?.matricula}</span>
                      </h3>
                      <p className="text-xs text-yellow-700/80 dark:text-yellow-300/60 font-medium">
                        Cliente: {s.cliente?.nombre} {s.cliente?.apellidos} • {s.direccion}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      <Button 
                        asChild
                        className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg shadow-yellow-200/50 border-none transition-all font-bold h-11 px-6 rounded-xl group-hover:scale-105 active:scale-95"
                      >
                        <NavLink to={`/solicitudes/${s.id}`}>
                          <FileText size={18} className="mr-2" />
                          Gestionar ahora
                        </NavLink>
                      </Button>
                    </div>
                  </CardContent>
                </CardSinBorde>
              ))}
            </div>
          )}
        </div>

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

    return (
      <div className="space-y-6">

        {/* Sección ITV */}
        <CardSinBorde className="border-none shadow-none bg-white overflow-hidden">
          <CardContent className="p-0">
            {contadores?.itv_alertas && contadores.itv_alertas.length > 0 ? (
              <div className="flex flex-col gap-3">
                {contadores.itv_alertas.map((alert) => (
                  <div key={alert.id} className="flex flex-col sm:flex-row items-center justify-between py-8 px-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-xl gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded-full">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-500" size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-yellow-900 dark:text-yellow-100 italic">
                          ¡Atención ITV!
                        </h4>
                        <p className="text-sm text-yellow-800/80 dark:text-yellow-200/60 max-w-lg">
                          La ITV de tu <strong>{alert.marca} {alert.modelo} ({alert.matricula})</strong> caduca pronto. (Última: {fmt(alert.fecha_ultima_itv)})
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/perfil/${user?.id}/nueva-solicitud?vehiculo_id=${alert.id}&v_marca=${alert.marca}&v_modelo=${alert.modelo}&v_matricula=${alert.matricula}`)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white h-12 px-6 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      <FileText size={18} className="mr-2" />
                      Solicitar recogida
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between py-8 px-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl gap-4">
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
