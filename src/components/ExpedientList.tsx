import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  Eye,
  Edit,
  Calendar,
  User,
  FileText,
  Plus,
  SortAsc,
  SortDesc
} from "lucide-react";
import { ExpedientSummary } from "@/types/expedient";
import { useUser } from "@/contexts/UserContext";

interface ExpedientListProps {
  expedients: ExpedientSummary[];
  onViewExpedient?: (id: string) => void;
  onEditExpedient?: (id: string) => void;
  onCreateExpedient?: () => void;
}

type SortField = 'number' | 'title' | 'createdAt' | 'status' | 'priority';
type SortDirection = 'asc' | 'desc';

export function ExpedientList({ 
  expedients, 
  onViewExpedient, 
  onEditExpedient, 
  onCreateExpedient 
}: ExpedientListProps) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'active' | 'closed'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const canEdit = user?.role === 'mesa';

  // Filter expedients based on search term and status
  const filteredExpedients = expedients.filter(expedient => {
    const matchesSearch = searchTerm === '' || 
      expedient.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedient.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expedient.createdBy.toLowerCase().includes(searchTerm.toLowerCase());

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
      case 'priority':
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
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

  const getStatusBadge = (status: 'draft' | 'active' | 'closed') => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      closed: 'outline'
    } as const;
    
    const labels = {
      draft: 'Borrador',
      active: 'Activo',
      closed: 'Cerrado'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-secondary text-secondary-foreground',
      medium: 'bg-accent text-accent-foreground',
      high: 'bg-destructive text-destructive-foreground'
    };
    
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta'
    };

    return (
      <Badge className={colors[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 font-medium"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
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

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, número o creador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'draft', 'closed'].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedStatus(status as any)}
                  className="capitalize"
                >
                  {status === 'all' ? 'Todos' : 
                   status === 'active' ? 'Activos' :
                   status === 'draft' ? 'Borradores' : 'Cerrados'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {sortedExpedients.length} de {expedients.length} expedientes
        </span>
        <div className="flex items-center space-x-4">
          <span>Ordenar por:</span>
          <div className="flex items-center space-x-2">
            <SortButton field="createdAt">Fecha</SortButton>
            <SortButton field="number">Número</SortButton>
            <SortButton field="title">Título</SortButton>
            <SortButton field="status">Estado</SortButton>
          </div>
        </div>
      </div>

      {/* Expedients Grid */}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedExpedients.map((expedient) => (
            <Card key={expedient.id} className="hover:shadow-medium transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {expedient.number}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2">
                      {expedient.title}
                    </CardTitle>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getStatusBadge(expedient.status)}
                    {getPriorityBadge(expedient.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2" />
                    <span>{expedient.createdBy}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Creado: {expedient.createdAt.toLocaleDateString('es-ES')}</span>
                  </div>
                  {expedient.updatedAt.toDateString() !== expedient.createdAt.toDateString() && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Actualizado: {expedient.updatedAt.toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewExpedient?.(expedient.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  {canEdit && (
                    <Button
                      size="sm"
                      onClick={() => onEditExpedient?.(expedient.id)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}