import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown, MailOpen } from "lucide-react";
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
import { CardSinBorde, CardContent } from "@/components/ui/card";

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
      return <ArrowUpDown size={14} className="opacity-30 shrink-0 inline ml-1" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-primary shrink-0 inline ml-1" />
    ) : (
      <ArrowDown size={14} className="text-primary shrink-0 inline ml-1" />
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Estado</TableHead>
            <TableHead
              className="cursor-pointer font-bold text-center w-[220px]"
              onClick={() => handleSort("nombre")}
            >
              Remitente{renderSortArrow("nombre")}
            </TableHead>
            <TableHead
              className="cursor-pointer font-bold text-center w-[250px] hidden sm:table-cell"
              onClick={() => handleSort("email")}
            >
              Email{renderSortArrow("email")}
            </TableHead>
            <TableHead
              className="cursor-pointer font-bold text-center w-[200px]"
              onClick={() => handleSort("created_at")}
            >
              Recibido{renderSortArrow("created_at")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {mensajes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No hay mensajes en la bandeja
              </TableCell>
            </TableRow>
          ) : (
            mensajes.map((mensaje) => (
              <React.Fragment key={mensaje.id}>
                <TableRow
                  key={mensaje.id}
                  className={`cursor-pointer h-14 transition-colors ${
                    !mensaje.leido_at
                      ? "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleMessageClick(mensaje)}
                >
                  <TableCell className="text-center">
                    {!mensaje.leido_at ? (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full mx-auto shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-pulse" />
                    ) : (
                      <MailOpen className="text-slate-400 w-4 h-4 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center font-medium text-slate-900 truncate">
                    {mensaje.nombre}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <span className="text-sm text-slate-500 font-medium truncate inline-block max-w-[150px]">
                      {mensaje.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs font-semibold text-slate-500">
                    {new Date(mensaje.created_at).toLocaleDateString("es-ES", { day: '2-digit', month: 'long', year: 'numeric' })}
                  </TableCell>
                </TableRow>

                {expandedId === mensaje.id && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={4} className="p-0 border-b-2 border-primary/20">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        {/* Mensaje Original (Izquierda) */}
                        <div className="flex flex-col gap-3 min-w-0">
                          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Mensaje
                          </span>
                          <CardSinBorde className="bg-primary/5 border-2 border-primary/20 shadow-sm flex-1">
                            <CardContent className="p-5 text-sm text-foreground whitespace-pre-wrap leading-relaxed break-words">
                              {mensaje.mensaje}
                            </CardContent>
                          </CardSinBorde>
                        </div>

                        {/* Zona de Respuesta (Derecha) */}
                        <div className="flex flex-col gap-3 min-w-0">
                          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {mensaje.respondido_at ? "Respuesta enviada" : "Tu Respuesta"}
                          </span>
                          
                          {mensaje.respondido_at ? (
                            <CardSinBorde className="bg-blue-50/50 border-2 border-blue-600 shadow-sm flex-1">
                              <CardContent className="p-5 text-sm whitespace-pre-wrap break-words flex flex-col h-full">
                                <p className="text-blue-600 font-bold mb-4 flex items-center gap-2">
                                  ✓ Respondido el {new Date(mensaje.respondido_at).toLocaleString("es-ES")}
                                </p>
                                <span className="text-foreground flex-1">{mensaje.respuesta}</span>
                              </CardContent>
                            </CardSinBorde>
                          ) : (
                            <div className="flex flex-col gap-3 h-full">
                              <textarea
                                className="flex-1 min-h-[150px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                placeholder={`Escribe de vuelta a ${mensaje.nombre}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={replying}
                              />
                              <div className="flex justify-end pt-1">
                                <Button 
                                  size="lg"
                                  className="px-8"
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
                disabled={currentPage === 1}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) goToPage(currentPage - 1);
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
                disabled={currentPage === totalPages}
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) goToPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </>
  );
}
