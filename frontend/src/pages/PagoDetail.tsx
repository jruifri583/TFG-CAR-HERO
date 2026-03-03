import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";

interface PagoDetail {
  id: number;
  solicitud: number;
  importe: number | null;
  metodo_pago: { nombre: string } | null;
  created_at: string | null;
}

export default function PagoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pago, setPago] = useState<PagoDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPago = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No hay token de autenticación");

        const res = await api.get(`/pagos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPago(res.data);
      } catch (error) {
        console.error("Error cargando pago:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPago();
  }, [id]);

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!pago) return <p className="p-6">Pago no encontrado.</p>;

  return (
    <div className="p-6 max-w-lg">
      <button
        onClick={() => navigate("/pagos")}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Volver a Pagos
      </button>

      <span className="text-4xl font-bold mb-6 inline-block">
        Detalle del Pago
      </span>

      <div className="space-y-4 mt-4">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Solicitud</span>
          <span className="font-medium">{pago.solicitud ?? "-"}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Importe</span>
          <span className="font-medium">
            {pago.importe != null ? `${pago.importe} €` : "-"}
          </span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Método de pago</span>
          <span className="font-medium">{pago.metodo_pago?.nombre ?? "-"}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Fecha de pago</span>
          <span className="font-medium">
            {pago.created_at
              ? new Date(pago.created_at).toLocaleDateString("es-ES")
              : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
