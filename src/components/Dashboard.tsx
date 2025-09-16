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
  onNavigateToExpedients?: () => void;
  onNavigateToActuaciones?: () => void;
  onCreateActuacion?: () => void;
  onFilterExpedients?: (status: string) => void;
}

export function Dashboard({ 
  expedients = [], 
  onCreateExpedient, 
  onViewExpedient, 
  onEditExpedient,
  onNavigateToExpedients,
  onNavigateToActuaciones,
  onCreateActuacion,
  onFilterExpedients
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
    pausados: filteredExpedients.filter(e => e.status === 'pausado').length,
    derivados: filteredExpedients.filter(e => e.status === 'derivado').length,
  };

  const getStatusBadge = (status: 'draft' | 'en_tramite' | 'pausado' | 'archivado' | 'derivado') => {
    const colors = {
      draft: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      en_tramite: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))] border-[hsl(var(--status-en-tramite))]',
      pausado: 'bg-[hsl(var(--status-pausado))] text-[hsl(var(--status-pausado-foreground))] border-[hsl(var(--status-pausado))]',
      archivado: 'bg-[hsl(var(--status-archivado))] text-[hsl(var(--status-archivado-foreground))] border-[hsl(var(--status-archivado))]',
      derivado: 'bg-[hsl(var(--status-derivado))] text-[hsl(var(--status-derivado-foreground))] border-[hsl(var(--status-derivado))]'
    };
    
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      pausado: 'Pausado',
      archivado: 'Archivado',
      derivado: 'Derivado'
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusBorderClass = (status: 'draft' | 'en_tramite' | 'pausado' | 'archivado' | 'derivado') => {
    const borderColors = {
      draft: 'border-[hsl(var(--status-draft))]',
      en_tramite: 'border-[hsl(var(--status-en-tramite))]',
      pausado: 'border-[hsl(var(--status-pausado))]',
      archivado: 'border-[hsl(var(--status-archivado))]',
      derivado: 'border-[hsl(var(--status-derivado))]'
    };
    
    return borderColors[status];
  };

  return (
    <div className="space-y-6">
      {/* Funciones Principales - Solo para Mesa de Entrada */}
      {user.role === 'mesa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
            onClick={() => {
              onFilterExpedients?.('derivado');
              onNavigateToExpedients?.();
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-blue-900 mb-1">Expedientes</h3>
              <p className="text-xs text-blue-700">Para Recibir</p>
              <Badge className="mt-2 bg-blue-600 text-white text-xs">{stats.derivados} Pendientes</Badge>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100"
            onClick={() => {
              onFilterExpedients?.('draft');
              onNavigateToExpedients?.();
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-green-900 mb-1">Oficios</h3>
              <p className="text-xs text-green-700">Para Recibir</p>
              <Badge className="mt-2 bg-green-600 text-white text-xs">{stats.draft} Pendientes</Badge>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100"
            onClick={() => onNavigateToActuaciones?.()}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-teal-900 mb-1">Actuaciones</h3>
              <p className="text-xs text-teal-700">Para Firmar</p>
              <Badge className="mt-2 bg-teal-600 text-white text-xs">5 Pendientes</Badge>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-[hsl(67,65%,85%)] bg-gradient-to-br from-[hsl(67,65%,95%)] to-[hsl(67,65%,90%)]"
            onClick={() => onCreateActuacion?.()}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[hsl(67,65%,27%)] rounded-lg flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-[hsl(67,65%,15%)] mb-1">Actuaciones</h3>
              <p className="text-xs text-[hsl(67,65%,20%)]">Para Agregar</p>
              <Badge className="mt-2 bg-[hsl(67,65%,27%)] text-white text-xs">3 Pendientes</Badge>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Actividad Reciente */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm text-blue-900">Expediente EXP-2024-0156 modificado</h4>
                  <p className="text-xs text-blue-700 mt-1">Se agregó nueva actuación - Informe técnico completado</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
                </div>
                <Badge variant="secondary" className="text-xs">Actualizado</Badge>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-green-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm text-green-900">Nuevo agendamiento programado</h4>
                  <p className="text-xs text-green-700 mt-1">Audiencia pública - 25 de Septiembre, 14:00 hs</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 4 horas</p>
                </div>
                <Badge variant="outline" className="text-xs border-green-300 text-green-700">Agendado</Badge>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-orange-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm text-orange-900">Expediente EXP-2024-0143 derivado</h4>
                  <p className="text-xs text-orange-700 mt-1">Derivado a Oficina de Recursos Naturales para evaluación</p>
                  <p className="text-xs text-muted-foreground mt-1">Ayer</p>
                </div>
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">Derivado</Badge>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm text-purple-900">Actuación firmada digitalmente</h4>
                  <p className="text-xs text-purple-700 mt-1">Resolución N° 245/2024 - EXP-2024-0128</p>
                  <p className="text-xs text-muted-foreground mt-1">Ayer</p>
                </div>
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">Firmado</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}