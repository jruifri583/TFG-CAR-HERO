import React, { useEffect, useState } from "react";
import { MailOpen, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { PaginationSelector } from "@/components/ui/pagination";
import { SortArrow } from "@/components/ui/sort-arrow";
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

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [search, setSearch] = useState("");
  const [inputFocused, setInputFocused] = useState(false);

  const fetchMensajes = async (searchValue = search) => {
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      if (sortField) {
        params.append("sort", sortField);
        params.append("order", sortOrder);
      }
      if (searchValue) params.append("search", searchValue);
      const res = await api.get(`/mensajes?${params.toString()}`);
      setMensajes(res.data.data);
      setTotalPages(res.data.meta?.last_page || res.data.last_page || 1);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, [currentPage, sortField, sortOrder]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setCurrentPage(1);
    fetchMensajes(value);
  }, 300);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };



  const handleMessageClick = async (mensaje: Mensaje) => {
    if (expandedId === mensaje.id) {
      setExpandedId(null);
    } else {
      setExpandedId(mensaje.id);
      setReplyText("");
    }

    if (!mensaje.leido_at) {
      try {
        await api.patch(`/mensajes/${mensaje.id}/leido`);
        
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
      <div className="flex justify-end mb-4 items-center w-full flex-wrap gap-2 pb-2">
        <ButtonGroup className="max-w-full">
          <div className="relative flex items-center">
            {!search && (
              <Search
                size={14}
                className="absolute left-2.5 text-muted-foreground pointer-events-none"
              />
            )}
            <Input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                debouncedSearch(e.target.value);
              }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              className={`border-black rounded-md py-1.5 text-sm outline-none transition-all duration-300 bg-background shadow-none
                ${search ? "pl-3" : "pl-8"}
                ${inputFocused || search ? "w-44 md:w-64" : "w-28 md:w-32"}
                focus-visible:ring-0`}
            />
            {search && (
              <button
                className="absolute right-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  debouncedSearch("");
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </ButtonGroup>
      </div>
      {mensajes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl w-full">
          <p className="text-slate-500 font-medium italic">No hay mensajes en la bandeja</p>
        </div>
      ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px] text-center">Estado</TableHead>
            <TableHead
              className="cursor-pointer font-bold text-center w-[220px]"
              onClick={() => handleSort("nombre")}
            >
              Remitente<SortArrow field="nombre" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
            <TableHead
              className="cursor-pointer font-bold text-center w-[250px] hidden sm:table-cell"
              onClick={() => handleSort("email")}
            >
              Email<SortArrow field="email" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
            <TableHead
              className="cursor-pointer font-bold text-center w-[200px]"
              onClick={() => handleSort("created_at")}
            >
              Recibido<SortArrow field="created_at" sortField={sortField} sortOrder={sortOrder} />
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
            {mensajes.map((mensaje) => (
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
            ))}
        </TableBody>
      </Table>
      )}

      <PaginationSelector
        currentPage={currentPage}
        totalPages={totalPages}
        goToPage={goToPage}
        className="mt-6"
      />

    </>
  );
}
