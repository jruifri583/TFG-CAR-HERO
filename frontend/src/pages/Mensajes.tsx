import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, MailOpen, Mail } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Mensaje {
  id: number;
  nombre: string;
  email: string;
  mensaje: string;
  respuesta: string | null;
  leido_at: string | null;
  respondido_at: string | null;
  created_at: string;
}

type SortField = "nombre" | "email" | "created_at" | "leido_at";

export default function MensajesPage() {
  const [loading, setLoading] = useState(true);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Accordion row state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchMensajes = async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      const res = await api.get(`/mensajes?${params.toString()}`);
      setMensajes(res.data.data);
      setTotalPages(res.data.last_page || 1);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, [currentPage, sortField, sortOrder]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default new sort strictly to desc
    }
    setCurrentPage(1);
  };

  const renderSortArrow = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown size={14} className="inline ml-1 opacity-40" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="inline ml-1" />
    ) : (
      <ArrowDown size={14} className="inline ml-1" />
    );
  };

  const handleMessageClick = async (mensaje: Mensaje) => {
    // Toggle accordion
    if (expandedId === mensaje.id) {
      setExpandedId(null);
    } else {
      setExpandedId(mensaje.id);
      setReplyText(""); // clear draft when opening another
    }

    if (!mensaje.leido_at) {
      try {
        await api.patch(`/mensajes/${mensaje.id}/leido`);
        // Update local state without fetching again
        setMensajes((prev) =>
          prev.map((m) =>
            m.id === mensaje.id
              ? { ...m, leido_at: new Date().toISOString() }
              : m
          )
        );
        // Notificar al Sidebar que decremente el contador
        window.dispatchEvent(new CustomEvent("decrement-mensaje"));
      } catch (err) {
        console.error("No se pudo marcar como leído", err);
      }
    }
  };

  const handleReplySubmit = async (mensajeId: number) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await api.post(`/mensajes/${mensajeId}/responder`, {
        respuesta: replyText,
      });
      toast.success("Respuesta enviada correctamente");
      // Update local state
      setMensajes((prev) =>
        prev.map((m) =>
          m.id === mensajeId
            ? {
                ...m,
                respuesta: res.data.mensaje.respuesta,
                respondido_at: res.data.mensaje.respondido_at,
                leido_at: res.data.mensaje.leido_at,
              }
            : m
        )
      );
    } catch (err) {
      console.error("Error al enviar la respuesta:", err);
      toast.error("Hubo un error al enviar tu respuesta.");
    } finally {
      setReplying(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <>
      <div className="flex justify-between items-center mb-6" />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead
              className="cursor-pointer font-bold"
              onClick={() => handleSort("nombre")}
            >
              Remitente{renderSortArrow("nombre")}
            </TableHead>
            <TableHead
              className="cursor-pointer font-bold hidden sm:table-cell"
              onClick={() => handleSort("email")}
            >
              Email{renderSortArrow("email")}
            </TableHead>
            <TableHead className="font-bold hidden md:table-cell">Mensaje</TableHead>
            <TableHead
              className="cursor-pointer font-bold"
              onClick={() => handleSort("created_at")}
            >
              Recibido{renderSortArrow("created_at")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {mensajes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No hay mensajes en la bandeja
              </TableCell>
            </TableRow>
          ) : (
            mensajes.map((mensaje) => (
              <React.Fragment key={mensaje.id}>
                <TableRow
                  className={`cursor-pointer h-14 transition-colors ${
                    !mensaje.leido_at
                      ? "bg-blue-50/50 dark:bg-blue-900/10 font-medium hover:bg-blue-100/50"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                  onClick={() => handleMessageClick(mensaje)}
                >
                  <TableCell>
                    {!mensaje.leido_at ? (
                      <Mail className="text-primary w-5 h-5 mx-auto" />
                    ) : (
                      <MailOpen className="text-muted-foreground w-5 h-5 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">{mensaje.nombre}</TableCell>
                  <TableCell className="hidden sm:table-cell">{mensaje.email}</TableCell>
                  <TableCell className="truncate max-w-[200px] hidden md:table-cell">
                    {mensaje.mensaje.length > 50
                      ? mensaje.mensaje.substring(0, 50) + "..."
                      : mensaje.mensaje}
                  </TableCell>
                  <TableCell>
                    {new Date(mensaje.created_at).toLocaleDateString("es-ES")}
                  </TableCell>
                </TableRow>

                {expandedId === mensaje.id && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={5} className="p-0 border-b-2 border-primary/20">
                      <div className="p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Mensaje Original */}
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Mensaje original
                          </span>
                          <div className="bg-background p-4 rounded-md shadow-sm text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {mensaje.mensaje}
                          </div>
                        </div>

                        {/* Zona de Respuesta */}
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Tu Respuesta
                          </span>
                          
                          {mensaje.respondido_at ? (
                            <div className="bg-green-50/50 dark:bg-green-900/10 p-4 rounded-md border border-green-200 dark:border-green-800 text-sm whitespace-pre-wrap">
                              <p className="text-green-700 dark:text-green-400 font-semibold mb-2 flex items-center gap-2">
                                ✓ Respondido el {new Date(mensaje.respondido_at).toLocaleString("es-ES")}
                              </p>
                              <span className="text-foreground">{mensaje.respuesta}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <textarea
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={`Escribe de vuelta a ${mensaje.nombre}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={replying}
                              />
                              <div className="flex justify-end">
                                <Button 
                                  onClick={() => handleReplySubmit(mensaje.id)}
                                  disabled={replying || !replyText.trim()}
                                >
                                  {replying ? "Enviando email..." : "Enviar Respuesta"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(currentPage - 1);
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </>
  );
}
