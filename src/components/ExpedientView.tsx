import { useState } from 'react';
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Plus,
  Eye,
  Edit,
  Download,
  Calendar,
  User,
  Clock
} from "lucide-react";
import { ActuacionList } from "./ActuacionList";
import { ExpedientEditor } from "./ExpedientEditor";
import type { Actuacion } from "@/types/actuacion";

interface ExpedientViewProps {
  expedientId?: string;
  onBack?: () => void;
}

// Mock data para las actuaciones
const mockActuaciones: Actuacion[] = [
  {
    id: '1',
    expedientId: 'exp-001',
    number: 1,
    title: 'Inicio de Actuación',
    content: '<p>Se inicia la presente actuación con la documentación correspondiente...</p>',
    status: 'firmado',
    createdBy: 'Juan Pérez - Mesa de Entrada',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    signedBy: 'Dr. Carlos López',
    signedAt: new Date('2024-01-16')
  },
  {
    id: '2',
    expedientId: 'exp-001',
    number: 2,
    title: 'Revisión de Documentación',
    content: '<p>Se procede a la revisión de la documentación presentada por el interesado...</p>',
    status: 'para-firmar',
    createdBy: 'Ana García - Oficina',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  }
];

export function ExpedientView({ expedientId, onBack }: ExpedientViewProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>(mockActuaciones);
  
  // Mock data del expediente
  const expedient = {
    id: expedientId || 'exp-001',
    number: 'EXP-2024-001',
    title: 'Solicitud de Defensa Pública',
    status: 'active' as const,
    assignedOffice: 'Defensoría Civil Nº 1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  };

  const { user } = useUser();
  
  const getStatusColors = (status: string) => {
    const colors = {
      draft: {
        bg: 'bg-[hsl(var(--status-draft))]',
        border: 'border-[hsl(var(--status-draft))]',
        text: 'text-[hsl(var(--status-draft-foreground))]'
      },
      active: {
        bg: 'bg-[hsl(var(--status-active))]',
        border: 'border-[hsl(var(--status-active))]',
        text: 'text-[hsl(var(--status-active-foreground))]'
      },
      closed: {
        bg: 'bg-[hsl(var(--status-closed))]',
        border: 'border-[hsl(var(--status-closed))]',
        text: 'text-[hsl(var(--status-closed-foreground))]'
      },
      archived: {
        bg: 'bg-[hsl(var(--status-archived))]',
        border: 'border-[hsl(var(--status-archived))]',
        text: 'text-[hsl(var(--status-archived-foreground))]'
      },
      derivado: {
        bg: 'bg-[hsl(var(--status-derivado))]',
        border: 'border-[hsl(var(--status-derivado))]',
        text: 'text-[hsl(var(--status-derivado-foreground))]'
      }
    };
    
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Borrador',
      active: 'Activo',
      closed: 'Cerrado',
      archived: 'Archivado',
      derivado: 'Derivado'
    };
    
    return labels[status as keyof typeof labels] || 'Borrador';
  };

  const handleAddActuacion = () => {
    setShowEditor(true);
  };

  const handleViewActuacion = (actuacionId: string) => {
    console.log('Ver actuación:', actuacionId);
  };

  const handleEditActuacion = (actuacionId: string) => {
    console.log('Editar actuación:', actuacionId);
    setShowEditor(true);
  };

  const handleStatusChange = (actuacionId: string, newStatus: Actuacion['status']) => {
    setActuaciones(prev => 
      prev.map(act => 
        act.id === actuacionId 
          ? { ...act, status: newStatus, signedAt: newStatus === 'firmado' ? new Date() : undefined }
          : act
      )
    );
  };

  const statusColors = getStatusColors(expedient.status);
  const latestActuacion = actuaciones.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  if (showEditor) {
    return (
      <ExpedientEditor 
        expedientId={expedientId}
        onBack={() => setShowEditor(false)}
        onSave={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Status Indicator - Esquina Superior Derecha */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`${statusColors.bg} rounded-full px-4 py-2 shadow-lg backdrop-blur-sm border-2 border-white/20`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-white/90 shadow-sm animate-pulse`}></div>
            <span className="text-sm font-semibold text-white">
              {getStatusLabel(expedient.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} className="shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {expedient.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                Expediente: {expedient.number}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pr-20">
            <Button variant="outline" className="shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Expedient Info */}
        <Card className={`${statusColors.border} border-l-4 shadow-lg`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <FileText className="w-6 h-6" />
              <span>Información del Expediente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fecha de Creación</p>
                  <p className="text-muted-foreground">
                    {expedient.createdAt.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Última Modificación</p>
                  <p className="text-muted-foreground">
                    {expedient.updatedAt.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Oficina Asignada</p>
                  <p className="text-muted-foreground">
                    {expedient.assignedOffice}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Actuacion */}
        {latestActuacion && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Última Actuación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{latestActuacion.title}</h3>
                    <p className="text-muted-foreground">
                      ACT-{latestActuacion.number.toString().padStart(3, '0')} - {latestActuacion.createdBy}
                    </p>
                  </div>
                  <Badge variant={latestActuacion.status === 'firmado' ? 'default' : 'secondary'} className="px-4 py-2">
                    {latestActuacion.status === 'firmado' ? 'Firmado' : 
                     latestActuacion.status === 'para-firmar' ? 'Para Firmar' : 'Borrador'}
                  </Badge>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: latestActuacion.content }}
                />
                <p className="text-sm text-muted-foreground">
                  Creado: {latestActuacion.createdAt.toLocaleString('es-ES')}
                  {latestActuacion.signedAt && (
                    <span> • Firmado: {latestActuacion.signedAt.toLocaleString('es-ES')}</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actuaciones List */}
        <div className="shadow-lg rounded-lg overflow-hidden">
          <ActuacionList
            expedientId={expedient.id}
            actuaciones={actuaciones}
            onViewActuacion={handleViewActuacion}
            onEditActuacion={handleEditActuacion}
            onCreateActuacion={handleAddActuacion}
            onChangeStatus={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}