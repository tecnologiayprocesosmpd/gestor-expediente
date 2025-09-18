import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Edit3, 
  Eye, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Plus,
  Calendar
} from "lucide-react";
import { Actuacion } from "@/types/actuacion";
import { useUser } from "@/contexts/UserContext";
import { CitacionDialog } from "./CitacionDialog";
import { StatusChangeConfirmDialog } from "./StatusChangeConfirmDialog";

interface ActuacionListProps {
  expedientId: string;
  actuaciones: Actuacion[];
  onViewActuacion?: (id: string) => void;
  onEditActuacion?: (id: string) => void;
  onCreateActuacion?: () => void;
  onChangeStatus?: (id: string, status: Actuacion['status']) => void;
  onCitacionCreated?: () => void;
}

export function ActuacionList({
  expedientId,
  actuaciones = [],
  onViewActuacion,
  onEditActuacion,
  onCreateActuacion,
  onChangeStatus,
  onCitacionCreated
}: ActuacionListProps) {
  const { user } = useUser();
  const canEdit = user?.role === 'mesa';
  const canCreate = user?.role === 'mesa' || user?.role === 'oficina';

  const getStatusBadge = (status: Actuacion['status']) => {
    const config = {
      'borrador': { 
        variant: 'secondary' as const, 
        label: 'Borrador', 
        icon: Edit3 
      },
      'para-firmar': { 
        variant: 'default' as const, 
        label: 'Para Firmar', 
        icon: AlertTriangle 
      },
      'firmado': { 
        variant: 'outline' as const, 
        label: 'Firmado', 
        icon: CheckCircle 
      }
    };

    const { variant, label, icon: Icon } = config[status];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const handleStatusChange = (actuacionId: string, currentStatus: Actuacion['status']) => {
    if (!canEdit || !onChangeStatus) return;

    const nextStatus: { [key in Actuacion['status']]: Actuacion['status'] | null } = {
      'borrador': 'para-firmar',
      'para-firmar': 'firmado',
      'firmado': null
    };

    const next = nextStatus[currentStatus];
    if (next) {
      onChangeStatus(actuacionId, next);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <span>Actuaciones</span>
            <Badge variant="secondary">{actuaciones.length}</Badge>
          </div>
          {canCreate && (
            <Button onClick={onCreateActuacion} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nueva Actuación
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actuaciones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No hay actuaciones en este expediente</p>
            {canCreate && (
              <Button 
                onClick={onCreateActuacion}
                className="mt-4"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Actuación
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {actuaciones.map((actuacion) => (
              <div 
                key={actuacion.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-soft transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-sm text-muted-foreground">
                      Actuación #{actuacion.number}
                    </span>
                    {getStatusBadge(actuacion.status)}
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {actuacion.title}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Creado el {actuacion.createdAt.toLocaleDateString('es-ES')} por {actuacion.createdBy}</p>
                    {actuacion.status === 'firmado' && actuacion.signedAt && (
                      <p className="text-primary">
                        Firmado el {actuacion.signedAt.toLocaleDateString('es-ES')} 
                        {actuacion.signedBy && ` por ${actuacion.signedBy}`}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewActuacion?.(actuacion.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  
                  {actuacion.status === 'borrador' && canEdit && (
                    <StatusChangeConfirmDialog
                      onConfirm={() => handleStatusChange(actuacion.id, actuacion.status)}
                      message="¿Está seguro de enviar la actuación para firma?"
                    >
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        PARA FIRMA
                      </Button>
                    </StatusChangeConfirmDialog>
                  )}
                  
                  {canEdit && actuacion.status === 'borrador' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onEditActuacion?.(actuacion.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  )}

                  {canEdit && actuacion.status === 'para-firmar' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusChange(actuacion.id, actuacion.status)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Firmar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}