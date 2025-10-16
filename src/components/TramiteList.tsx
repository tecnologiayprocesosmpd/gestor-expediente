import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText,
  Plus,
  Calendar,
  User,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { Tramite } from "@/types/tramite";
import { tramiteStorage } from "@/utils/tramiteStorage";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { StatusChangeConfirmDialog } from "./StatusChangeConfirmDialog";

interface TramiteListProps {
  tramites: Tramite[];
  onCreateTramite: () => void;
  onBack: () => void;
  onTramiteUpdated: () => void;
}

export function TramiteList({ tramites, onCreateTramite, onBack, onTramiteUpdated }: TramiteListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedTramiteId, setSelectedTramiteId] = useState<string | null>(null);

  const handleFinalizarClick = (tramiteId: string) => {
    setSelectedTramiteId(tramiteId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmFinalizar = async () => {
    if (selectedTramiteId) {
      const tramite = tramites.find(t => t.id === selectedTramiteId);
      if (tramite) {
        const updatedTramite = { ...tramite, finalizado: true };
        tramiteStorage.save(updatedTramite);
        toast.success("Trámite finalizado");
        onTramiteUpdated();
      }
    }
    setConfirmDialogOpen(false);
    setSelectedTramiteId(null);
  };

  // Check if there's an active (non-finished) tramite
  const hasActiveTramite = tramites.some(t => !t.finalizado);
  const canCreateNew = !hasActiveTramite;

  // Filter tramites based on search term
  const filteredTramites = tramites.filter(tramite => {
    const matchesSearch = searchTerm === '' || 
      tramite.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tramite.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tramite.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sort by creation date (newest first)
  const sortedTramites = [...filteredTramites].sort((a, b) => 
    b.fechaCreacion.getTime() - a.fechaCreacion.getTime()
  );

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedTramites,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
  } = usePagination({ items: sortedTramites, itemsPerPage: 5 });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Expediente
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trámites</h1>
            <p className="text-muted-foreground">
              Gestión de trámites del expediente
            </p>
          </div>
        </div>
        <Button 
          onClick={onCreateTramite}
          disabled={!canCreateNew}
          title={!canCreateNew ? "Debe finalizar el trámite actual antes de crear uno nuevo" : ""}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Trámite
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, referencia o creador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>
      </div>

      {/* Tramites Table */}
      {sortedTramites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2">No hay trámites</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'No se encontraron trámites que coincidan con la búsqueda.'
                : 'No hay trámites disponibles para este expediente.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={onCreateTramite} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Trámite
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-32" />
                  <col className="w-auto" />
                  <col className="w-40" />
                  <col className="w-32" />
                  <col className="w-32" />
                </colgroup>
                <thead className="border-b">
                  <tr className="bg-muted/30">
                    <th className="text-left p-4 font-medium w-32">Número</th>
                    <th className="text-left p-4 font-medium">Referencia</th>
                    <th className="text-left p-4 font-medium w-40">Creado por</th>
                    <th className="text-left p-4 font-medium w-32">Fecha</th>
                    <th className="text-left p-4 font-medium w-32">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTramites.map((tramite) => (
                    <tr 
                      key={tramite.id} 
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm font-mono text-primary">
                          {tramite.numero}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-foreground line-clamp-2">
                          {tramite.referencia}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{tramite.createdBy}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{tramite.fechaCreacion.toLocaleDateString('es-ES')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {tramite.finalizado ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-500 h-9 px-4 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Finalizado
                          </Badge>
                        ) : (
                          <StatusChangeConfirmDialog
                            open={confirmDialogOpen && selectedTramiteId === tramite.id}
                            onOpenChange={(open) => {
                              setConfirmDialogOpen(open);
                              if (!open) setSelectedTramiteId(null);
                            }}
                            onConfirm={handleConfirmFinalizar}
                            title="Confirmar finalización"
                            message="¿Está seguro que desea finalizar este trámite? Esta acción no se puede deshacer."
                            requireMotivo={false}
                          >
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleFinalizarClick(tramite.id)}
                              className="text-xs bg-cyan-500 hover:bg-cyan-600 text-white border-0"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Finalizar
                            </Button>
                          </StatusChangeConfirmDialog>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count and Pagination */}
      {sortedTramites.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {sortedTramites.length} {sortedTramites.length === 1 ? 'trámite' : 'trámites'} | Página {currentPage} de {totalPages || 1}
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={previousPage}
                    className={!canGoPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={nextPage}
                    className={!canGoNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
