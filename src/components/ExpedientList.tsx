import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Plus,
  SortAsc,
  SortDesc
} from "lucide-react";
import { StatusChangeConfirmDialog } from "@/components/StatusChangeConfirmDialog";
import { ExpedientSummary } from "@/types/expedient";
import { useUser } from "@/contexts/UserContext";

interface ExpedientListProps {
  expedients: ExpedientSummary[];
  onViewExpedient?: (id: string) => void;
  onCreateExpedient?: () => void;
  onStatusChange?: (id: string, newStatus: 'en_tramite' | 'paralizado' | 'archivado') => void;
  initialStatusFilter?: string;
}

type SortField = 'number' | 'title' | 'createdAt' | 'status';
type SortDirection = 'asc' | 'desc';

export function ExpedientList({ 
  expedients, 
  onViewExpedient, 
  onCreateExpedient,
  onStatusChange,
  initialStatusFilter 
}: ExpedientListProps) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'en_tramite' | 'paralizado' | 'archivado'>(
    initialStatusFilter && ['en_tramite', 'paralizado', 'archivado'].includes(initialStatusFilter) 
      ? initialStatusFilter as 'en_tramite' | 'paralizado' | 'archivado'
      : 'all'
  );
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const canEdit = true; // Ambos perfiles pueden editar

  const handleStatusChange = (expedientId: string, currentStatus: 'en_tramite' | 'paralizado' | 'archivado') => {
    let newStatus: 'en_tramite' | 'paralizado' | 'archivado';
    
    // Ciclo de estados: en_tramite → paralizado → archivado → en_tramite
    if (currentStatus === 'en_tramite') {
      newStatus = 'paralizado';
    } else if (currentStatus === 'paralizado') {
      newStatus = 'archivado';
    } else {
      newStatus = 'en_tramite';
    }
    
    onStatusChange?.(expedientId, newStatus);
  };

  const getStatusChangeLabel = (status: 'en_tramite' | 'paralizado' | 'archivado') => {
    if (status === 'en_tramite') return 'Paralizar';
    if (status === 'paralizado') return 'Archivar';
    return 'Reactivar';
  };

  const getStatusChangeMessage = (status: 'en_tramite' | 'paralizado' | 'archivado') => {
    if (status === 'en_tramite') return '¿Está seguro de que desea paralizar este expediente?';
    if (status === 'paralizado') return '¿Está seguro de que desea archivar este expediente?';
    return '¿Está seguro de que desea reactivar este expediente?';
  };

  // Filter expedients based on search term and status (excluding draft)
  const filteredExpedients = expedients.filter(expedient => {
    // Exclude draft expedients from list
    if (expedient.status === 'draft') return false;

    const matchesSearch = searchTerm === '' || 
      expedient.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedient.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedient.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedient.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedient.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || expedient.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Sort expedients
  const sortedExpedients = [...filteredExpedients].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'number':
        comparison = a.number.localeCompare(b.number);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: 'draft' | 'en_tramite' | 'paralizado' | 'archivado') => {
    const colors = {
      draft: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      en_tramite: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))] border-[hsl(var(--status-en-tramite))]',
      paralizado: 'bg-amber-500 text-white border-amber-500',
      archivado: 'bg-[hsl(var(--status-archivado))] text-[hsl(var(--status-archivado-foreground))] border-[hsl(var(--status-archivado))]'
    };
    
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      paralizado: 'Paralizado',
      archivado: 'Archivado'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 px-2 text-xs font-medium"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expedientes</h1>
          <p className="text-muted-foreground">
            Gestión y consulta de expedientes del sistema
          </p>
        </div>
        {canEdit && (
          <Button onClick={onCreateExpedient}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Expediente
          </Button>
        )}
      </div>

      {/* Compact Filter Navbar */}
      <div className="bg-background border rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                placeholder="Buscar por título, número, creador, referencia o contenido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Estado:</span>
                <div className="flex flex-wrap gap-1">
                  {['all', 'en_tramite', 'paralizado', 'archivado'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus(status as any)}
                      className="h-8 px-3 text-xs"
                    >
                      {status === 'all' ? 'Todos' : 
                       status === 'en_tramite' ? 'En Trámite' :
                       status === 'paralizado' ? 'Paralizados' :
                       status === 'archivado' ? 'Archivados' : status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Ordenar:</span>
                <div className="flex flex-wrap items-center gap-1">
                  <SortButton field="createdAt">Fecha</SortButton>
                  <SortButton field="number">Número</SortButton>
                  <SortButton field="title">Título</SortButton>
                  <SortButton field="status">Estado</SortButton>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-muted-foreground whitespace-nowrap lg:ml-auto">
                {sortedExpedients.length} de {expedients.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expedients Table */}
      {sortedExpedients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2">No hay expedientes</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedStatus !== 'all' 
                ? 'No se encontraron expedientes que coincidan con los filtros aplicados.'
                : 'No hay expedientes disponibles en el sistema.'
              }
            </p>
            {canEdit && !searchTerm && selectedStatus === 'all' && (
              <Button onClick={onCreateExpedient}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Expediente
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
                   <col className="w-32" />
                   <col className="w-40" />
                   <col className="w-32" />
                   <col className="w-24" />
                 </colgroup>
                <thead className="border-b">
                  <tr className="bg-muted/30">
                    <th className="text-left p-4 font-medium w-32">Número</th>
                    <th className="text-left p-4 font-medium">Expediente</th>
                    <th className="text-left p-4 font-medium w-32">Estado</th>
                    <th className="text-left p-4 font-medium w-40">Creado por</th>
                    <th className="text-left p-4 font-medium w-32">Fecha</th>
                    <th className="text-right p-4 font-medium w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExpedients.map((expedient) => (
                    <tr 
                      key={expedient.id} 
                      className="border-b hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-sm font-mono text-primary">
                          {expedient.number}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-foreground line-clamp-1">
                          {expedient.title}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(expedient.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{expedient.createdBy}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div>{expedient.createdAt.toLocaleDateString('es-ES')}</div>
                          {expedient.updatedAt.toDateString() !== expedient.createdAt.toDateString() && (
                            <div className="text-xs text-muted-foreground">
                              Act: {expedient.updatedAt.toLocaleDateString('es-ES')}
                            </div>
                          )}
                        </div>
                      </td>
                       <td className="p-4">
                         <div className="flex flex-col items-end space-y-2">
                           <div className="flex items-center space-x-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => onViewExpedient?.(expedient.id)}
                             >
                               <Eye className="w-4 h-4" />
                             </Button>
                              {canEdit && expedient.status !== 'draft' && (
                                <StatusChangeConfirmDialog
                                  onConfirm={() => handleStatusChange(expedient.id, expedient.status as 'en_tramite' | 'paralizado' | 'archivado')}
                                  title={`${getStatusChangeLabel(expedient.status as 'en_tramite' | 'paralizado' | 'archivado')} expediente`}
                                  message={getStatusChangeMessage(expedient.status as 'en_tramite' | 'paralizado' | 'archivado')}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                </StatusChangeConfirmDialog>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Ver expediente</span>
                              {canEdit && expedient.status !== 'draft' && (
                                <span>{getStatusChangeLabel(expedient.status as 'en_tramite' | 'paralizado' | 'archivado')}</span>
                              )}
                           </div>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}