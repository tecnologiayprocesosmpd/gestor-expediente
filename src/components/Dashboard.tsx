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
    ? expedients.filter(e => e.status === 'derivado' || e.status === 'en_tramite') // Mock: asumimos que estos están asignados
    : expedients;
    
  const recentExpedients = filteredExpedients.slice(0, 5);
  
  const stats = {
    total: filteredExpedients.length,
    active: filteredExpedients.filter(e => e.status === 'en_tramite').length,
    draft: filteredExpedients.filter(e => e.status === 'draft').length,
    derivados: filteredExpedients.filter(e => e.status === 'derivado').length,
  };

  const getStatusBadge = (status: 'draft' | 'en_tramite' | 'archivado' | 'derivado' | 'desistido') => {
    const colors = {
      draft: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      en_tramite: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))] border-[hsl(var(--status-en-tramite))]',
      archivado: 'bg-[hsl(var(--status-archivado))] text-[hsl(var(--status-archivado-foreground))] border-[hsl(var(--status-archivado))]',
      derivado: 'bg-[hsl(var(--status-derivado))] text-[hsl(var(--status-derivado-foreground))] border-[hsl(var(--status-derivado))]',
      desistido: 'bg-[hsl(var(--status-desistido))] text-[hsl(var(--status-desistido-foreground))] border-[hsl(var(--status-desistido))]'
    };
    
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      archivado: 'Archivado',
      derivado: 'Derivado',
      desistido: 'Desistido'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusBorderClass = (status: 'draft' | 'en_tramite' | 'archivado' | 'derivado' | 'desistido') => {
    const borderColors = {
      draft: 'border-[hsl(var(--status-draft))]',
      en_tramite: 'border-[hsl(var(--status-en-tramite))]',
      archivado: 'border-[hsl(var(--status-archivado))]',
      derivado: 'border-[hsl(var(--status-derivado))]',
      desistido: 'border-[hsl(var(--status-desistido))]'
    };
    
    return borderColors[status];
  };

  return (
    <div className="space-y-6">
      {/* Funciones Principales - Solo para Mesa de Entrada */}
      {user.role === 'mesa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-blue-900 mb-1">Expedientes</h3>
              <p className="text-xs text-blue-700">Para Recibir</p>
              <Badge className="mt-2 bg-blue-600 text-white text-xs">12 Pendientes</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-green-900 mb-1">Oficios</h3>
              <p className="text-xs text-green-700">Para Recibir</p>
              <Badge className="mt-2 bg-green-600 text-white text-xs">8 Pendientes</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-orange-900 mb-1">Actuaciones</h3>
              <p className="text-xs text-orange-700">Para Firmar</p>
              <Badge className="mt-2 bg-orange-600 text-white text-xs">5 Pendientes</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-purple-900 mb-1">Actuaciones</h3>
              <p className="text-xs text-purple-700">Para Agregar</p>
              <Badge className="mt-2 bg-purple-600 text-white text-xs">3 Pendientes</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-indigo-900 mb-1">Novedades</h3>
              <p className="text-xs text-indigo-700">del Sistema</p>
              <Badge className="mt-2 bg-indigo-600 text-white text-xs">Ver Todas</Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cuadro de Novedades - Expandido */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Novedades del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm text-blue-900">Nueva funcionalidad: Gestión de Casos Pendientes</h4>
                  <p className="text-xs text-blue-700 mt-1">Ahora puedes gestionar todos los casos pendientes desde una vista centralizada.</p>
                </div>
                <Badge variant="secondary" className="text-xs">Nuevo</Badge>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm text-green-900">Actualización: Mejoras en Auditoría</h4>
                  <p className="text-xs text-green-700 mt-1">Se agregaron nuevos reportes de auditoría y seguimiento trimestral.</p>
                </div>
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">Actualizado</Badge>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm text-purple-900">Mejora: Editor de Texto Avanzado</h4>
                  <p className="text-xs text-purple-700 mt-1">Nuevas funcionalidades de edición de imágenes y texto mejorado.</p>
                </div>
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">Mejorado</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  className={`flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-soft transition-all ${getStatusBorderClass(expedient.status)}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-foreground">
                        {expedient.number}
                      </span>
                      {getStatusBadge(expedient.status)}
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