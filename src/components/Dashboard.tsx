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
  const recentExpedients = expedients.slice(0, 5);
  
  const stats = {
    total: expedients.length,
    active: expedients.filter(e => e.status === 'active').length,
    draft: expedients.filter(e => e.status === 'draft').length,
    high: expedients.filter(e => e.priority === 'high').length,
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Bienvenido, {user.name}
        </h2>
        <p className="text-white/90 text-lg">
          {user.department} • {user.role === 'mesa' ? 'Gestión Completa' : 'Solo Lectura'}
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
            <CardTitle className="text-sm font-medium">Total Expedientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todos los expedientes
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