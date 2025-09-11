import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Edit
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ExpedientSummary } from "@/types/expedient";

interface DashboardProps {
  expedients: ExpedientSummary[];
  onCreateExpedient?: () => void;
  onViewExpedient?: (id: string) => void;
  onEditExpedient?: (id: string) => void;
}

export function Dashboard({ 
  expedients = [], 
  onCreateExpedient, 
  onViewExpedient, 
  onEditExpedient 
}: DashboardProps) {
  const { user } = useUser();

  if (!user) return null;

  const canEdit = user.role === 'mesa';
  
  // Para oficinas, solo mostrar expedientes asignados (mock - aquí filtrarías por oficina asignada)
  const filteredExpedients = user.role === 'oficina' 
    ? expedients.filter(e => e.status === 'derivado' || e.status === 'active') // Mock: asumimos que estos están asignados
    : expedients;
    
  const recentExpedients = filteredExpedients.slice(0, 5);
  
  const stats = {
    total: filteredExpedients.length,
    active: filteredExpedients.filter(e => e.status === 'active').length,
    draft: filteredExpedients.filter(e => e.status === 'draft').length,
    derivados: filteredExpedients.filter(e => e.status === 'derivado').length,
    high: filteredExpedients.filter(e => e.priority === 'high').length,
  };

  const getStatusBadge = (status: 'draft' | 'active' | 'paused' | 'closed' | 'archived' | 'derivado') => {
    const colors = {
      draft: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      active: 'bg-[hsl(var(--status-active))] text-[hsl(var(--status-active-foreground))] border-[hsl(var(--status-active))]',
      closed: 'bg-[hsl(var(--status-closed))] text-[hsl(var(--status-closed-foreground))] border-[hsl(var(--status-closed))]',
      archived: 'bg-[hsl(var(--status-archived))] text-[hsl(var(--status-archived-foreground))] border-[hsl(var(--status-archived))]',
      derivado: 'bg-[hsl(var(--status-derivado))] text-[hsl(var(--status-derivado-foreground))] border-[hsl(var(--status-derivado))]'
    };
    
    const labels = {
      draft: 'Borrador',
      active: 'Activo',
      closed: 'Cerrado',
      archived: 'Archivado',
      derivado: 'Derivado'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const colors = {
      low: 'bg-secondary text-secondary-foreground',
      medium: 'bg-accent text-accent-foreground',
      high: 'bg-destructive text-destructive-foreground',
      urgent: 'bg-red-600 text-white border-red-700'
    };
    
    const labels = {
      low: 'Baja',
      medium: 'Media', 
      high: 'Alta',
      urgent: 'Urgente'
    };

    return (
      <Badge className={colors[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Bienvenido, {user.name}
        </h2>
        <p className="text-white/90 text-lg">
          {user.profile === 'mesa-entrada' ? 'Mesa de Entrada' : 'Oficina'} • {user.role === 'mesa' ? 'Control Total' : 'Solo Actuaciones'}
        </p>
        <p className="text-white/70 text-sm mt-1">
          {user.role === 'mesa' 
            ? 'Puede crear, editar y asignar expedientes a oficinas' 
            : 'Puede ver expedientes asignados y agregar actuaciones'}
        </p>
        {canEdit && (
          <Button
            onClick={onCreateExpedient}
            className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Nuevo Expediente
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.role === 'mesa' ? 'Total Expedientes' : 'Expedientes Asignados'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {user.role === 'mesa' ? 'En el sistema' : 'A su oficina'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>

        {user.role === 'mesa' ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borradores</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
              <p className="text-xs text-muted-foreground">
                Sin finalizar
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Derivados</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.derivados}</div>
              <p className="text-xs text-muted-foreground">
                A su oficina
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridad</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.high}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expedients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Expedientes Recientes</span>
            <Badge variant="secondary">{recentExpedients.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpedients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No hay expedientes disponibles</p>
              {canEdit && (
                <Button 
                  onClick={onCreateExpedient}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Expediente
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentExpedients.map((expedient) => (
                <div 
                  key={expedient.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-soft transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-foreground">
                        {expedient.number}
                      </span>
                      {getStatusBadge(expedient.status)}
                      {getPriorityBadge(expedient.priority)}
                    </div>
                    <h4 className="font-medium text-foreground mb-1">
                      {expedient.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Creado el {expedient.createdAt.toLocaleDateString('es-ES')} por {expedient.createdBy}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewExpedient?.(expedient.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    {canEdit && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onEditExpedient?.(expedient.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}