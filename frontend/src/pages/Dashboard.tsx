import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, FileText, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

interface Contadores {
  usuarios: number;
  vehiculos: number;
  solicitudes: number;
  pagos: number;
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

export default function DashboardPage() {
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
    <div className="space-y-6">
      <span className="text-4xl font-bold inline-block">Dashboard</span>

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
              Pendientes sin asignar
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
                      Sin solicitudes pendientes
                    </td>
                  </tr>
                ) : (
                  solicitudesRecientes.map((s) => <NuevaRow key={s.id} s={s} />)
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
