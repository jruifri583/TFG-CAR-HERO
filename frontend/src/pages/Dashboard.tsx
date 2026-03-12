import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, FileText, CreditCard } from "lucide-react";
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

interface PagoReciente {
  id: number;
  importe: number;
  solicitud_id: number | null;
  metodo_pago: string | null;
  created_at: string;
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
const COLORS = ["#0088ff", "#00C49F", "#FFBB28", "#FF8042", "#a855f7"];

export default function DashboardPage() {
  const [contadores, setContadores] = useState<Contadores | null>(null);
  const [porEstado, setPorEstado] = useState<SolicitudEstado[]>([]);
  const [porMes, setPorMes] = useState<SolicitudMes[]>([]);
  const [pagosRecientes, setPagosRecientes] = useState<PagoReciente[]>([]);

  useEffect(() => {
    api.get("/contadores").then((res) => setContadores(res.data));
    api
      .get("/dashboard/solicitudes-por-estado")
      .then((res) => setPorEstado(res.data));
    api
      .get("/dashboard/solicitudes-por-mes")
      .then((res) => setPorMes(res.data));
    api
      .get("/dashboard/pagos-recientes")
      .then((res) => setPagosRecientes(res.data));
  }, []);

  const mesData = porMes.map((m) => ({
    mes: MESES[m.mes - 1],
    total: m.total,
  }));

  return (
    <div className="space-y-6">
      <span className="text-4xl font-bold inline-block">Dashboard</span>

      {/* Tarjetas de totales */}
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
                <Bar dataKey="total" fill="#0088ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solicitudes por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={porEstado}
                  dataKey="total"
                  nameKey="estado"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {porEstado.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pagos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="text-left py-2">Solicitud</th>
                <th className="text-left py-2">Importe</th>
                <th className="text-left py-2">Método</th>
                <th className="text-left py-2">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagosRecientes.map((pago, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{pago.solicitud_id ?? "-"}</td>
                  <td className="py-2">{pago.importe} €</td>
                  <td className="py-2">{pago.metodo_pago ?? "-"}</td>
                  <td className="py-2">
                    {pago.created_at
                      ? new Date(pago.created_at).toLocaleDateString("es-ES")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
