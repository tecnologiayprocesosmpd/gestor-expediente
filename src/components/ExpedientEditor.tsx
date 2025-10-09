import { useState, useEffect } from 'react';
import { useUser } from "@/contexts/UserContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  ArrowLeft,
  FileText
} from "lucide-react";

import { ConfirmDerivationDialog } from "./ConfirmDerivationDialog";

interface ExpedientEditorProps {
  expedientId?: string;
  expedient?: any;
  onBack?: () => void;
  onSave?: (data: any) => void;
}

export function ExpedientEditor({ expedientId, expedient: propExpedient, onBack, onSave }: ExpedientEditorProps) {
  const [title, setTitle] = useState(propExpedient?.title || '');
  const [expedientNumber, setExpedientNumber] = useState(() => {
    // Auto-generate expedient number if creating new
    if (!propExpedient?.number) {
      // Get all existing expedients from localStorage to calculate next number
      const storedExpedients = localStorage.getItem('expedients');
      const existingExpedients = storedExpedients ? JSON.parse(storedExpedients) : [];
      const maxNumber = existingExpedients.reduce((max: number, exp: any) => {
        const num = parseInt(exp.number);
        return !isNaN(num) && num > max ? num : max;
      }, 0);
      return String(maxNumber + 1);
    }
    return propExpedient.number;
  });
  const [status, setStatus] = useState<'draft' | 'en_tramite' | 'paralizado' | 'archivado'>(propExpedient?.status || 'draft');
  const [assignedOffice, setAssignedOffice] = useState(propExpedient?.oficina || propExpedient?.assignedOffice || '');
  const [referencia, setReferencia] = useState(propExpedient?.referencia || '');
  const [tipoProceso, setTipoProceso] = useState<'administrativo' | 'compra'>(propExpedient?.tipoProceso || 'administrativo');
  const [showDerivationDialog, setShowDerivationDialog] = useState(false);

  const { user } = useUser();
  const canEditBasicInfo = true; // Ambos perfiles pueden editar info básica
  const canOnlyAddActuaciones = false; // Ambos perfiles pueden editar expedientes completos


  // Update state when expedient prop changes
  useEffect(() => {
    if (propExpedient) {
      setTitle(propExpedient.title || '');
      setExpedientNumber(propExpedient.number || '');
      setStatus(propExpedient.status || 'draft');
      setAssignedOffice(propExpedient.oficina || propExpedient.assignedOffice || '');
      setReferencia(propExpedient.referencia || '');
      setTipoProceso(propExpedient.tipoProceso || 'administrativo');
    }
  }, [propExpedient]);

  const handleDerivation = () => {
    if (!assignedOffice) {
      alert('Debe seleccionar una oficina antes de derivar el expediente');
      return;
    }
    setShowDerivationDialog(true);
  };

  const confirmDerivation = () => {
    const derivationData = {
      id: expedientId || `exp-${Date.now()}`,
      title,
      number: expedientNumber,
      status: 'en_tramite' as const,
      oficina: assignedOffice,
      referencia,
      tipoProceso,
      createdAt: new Date(),
      updatedAt: new Date(),
      fechaDerivacion: new Date(),
      derivadoPor: user?.name || 'Usuario',
      createdBy: user?.name || 'Usuario'
    };

    if (onSave) {
      onSave(derivationData);
    }

    // Navigate back to dashboard
    if (onBack) {
      onBack();
    }
  };

  const getStatusColors = (status: string) => {
    const colors = {
      draft: {
        bg: 'bg-[hsl(var(--status-draft))]',
        border: 'border-[hsl(var(--status-draft))]',
        text: 'text-[hsl(var(--status-draft-foreground))]'
      },
      en_tramite: {
        bg: 'bg-[hsl(var(--status-en-tramite))]',
        border: 'border-[hsl(var(--status-en-tramite))]',
        text: 'text-[hsl(var(--status-en-tramite-foreground))]'
      },
      paralizado: {
        bg: 'bg-amber-500',
        border: 'border-amber-500',
        text: 'text-white'
      },
      archivado: {
        bg: 'bg-[hsl(var(--status-archivado))]',
        border: 'border-[hsl(var(--status-archivado))]',
        text: 'text-[hsl(var(--status-archivado-foreground))]'
      }
    };
    
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Borrador',
      en_tramite: 'En Trámite',
      paralizado: 'Paralizado',
      archivado: 'Archivado'
    };
    
    return labels[status as keyof typeof labels] || 'Borrador';
  };

  const statusColors = getStatusColors(status);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert className={`${statusColors.border} border-2 ${statusColors.bg}/10`}>
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${statusColors.bg}`}></div>
            <span className="text-lg font-semibold">
              ESTADO DEL EXPEDIENTE
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={`${statusColors.bg} ${statusColors.text} px-4 py-2`}>
              {getStatusLabel(status)}
            </Badge>
            {canOnlyAddActuaciones && (
              <Badge variant="outline" className="text-xs">
                Solo Actuaciones
              </Badge>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Expedientes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {expedientId ? 'Editar Expediente' : 'Nuevo Expediente'}
            </h1>
            <p className="text-muted-foreground">
              Información del expediente
            </p>
          </div>
        </div>
        
      </div>

      {/* Document Info */}
      <Card className={`${statusColors.border} border-l-4`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Información del Expediente</span>
            </div>
            {canOnlyAddActuaciones && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Solo lectura - Mesa de Entrada
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 mb-4">
            <Label htmlFor="titulo" className="text-sm font-semibold">TÍTULO DEL EXPEDIENTE *</Label>
            <Input
              id="titulo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingrese el título del expediente..."
              required
              disabled={!canEditBasicInfo || status !== 'draft'}
              className={`${(!canEditBasicInfo || status !== 'draft') ? 'bg-muted cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Nuevos campos obligatorios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oficina" className="text-sm font-semibold">OFICINA *</Label>
              <select
                id="oficina"
                value={assignedOffice}
                onChange={(e) => setAssignedOffice(e.target.value)}
                required
                disabled={!canEditBasicInfo || status !== 'draft'}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${(!canEditBasicInfo || status !== 'draft') ? 'bg-muted cursor-not-allowed' : ''}`}
              >
                <option value="">Seleccionar oficina...</option>
                <option value="defensoria-1">Defensoría Civil Nº 1</option>
                <option value="defensoria-2">Defensoría Civil Nº 2</option>
                <option value="defensoria-penal">Defensoría Penal</option>
                <option value="secretaria-administrativa">Secretaría Administrativa</option>
                <option value="secretaria-tecnica">Secretaría Técnica</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo-proceso" className="text-sm font-semibold">TIPO DE PROCESO *</Label>
              <select
                id="tipo-proceso"
                value={tipoProceso}
                onChange={(e) => setTipoProceso(e.target.value as 'administrativo' | 'compra')}
                required
                disabled={!canEditBasicInfo || status !== 'draft'}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${(!canEditBasicInfo || status !== 'draft') ? 'bg-muted cursor-not-allowed' : ''}`}
              >
                <option value="administrativo">Administrativo</option>
                <option value="compra">Compra</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia" className="text-sm font-semibold">REFERENCIA *</Label>
            <textarea
              id="referencia"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              required
              disabled={!canEditBasicInfo || status !== 'draft'}
              placeholder="Describa la referencia del expediente..."
              rows={3}
              className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${(!canEditBasicInfo || status !== 'draft') ? 'bg-muted cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="expedient-number" className="text-sm font-medium text-muted-foreground">Número de Expediente</Label>
              <Input
                id="expedient-number"
                value={expedientNumber}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed font-mono text-sm"
                title="Número autogenerado - No modificable"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha-creacion" className="text-sm font-medium text-muted-foreground">FECHA DE CREACIÓN</Label>
              <Input
                id="fecha-creacion"
                value={new Date().toLocaleDateString('es-ES')}
                readOnly
                disabled
                className="bg-muted cursor-not-allowed text-sm"
              />
            </div>
          </div>

          {status !== 'draft' && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                Los campos básicos solo se pueden editar cuando el expediente está en estado "Borrador".
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">        
        <div className="flex items-center space-x-3">
          {status === 'draft' && canEditBasicInfo && (
            <Button 
              onClick={handleDerivation}
              disabled={!assignedOffice || !title.trim() || !referencia.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
            >
              Enviar a{assignedOffice ? ` ${assignedOffice.toUpperCase().replace('-', ' ')}` : ' [SELECCIONAR OFICINA]'}
            </Button>
          )}
          
          {status !== 'draft' && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Badge variant="outline" className={`${statusColors.bg} ${statusColors.text}`}>
                {getStatusLabel(status)}
              </Badge>
              <span className="text-sm">Este expediente ya fue enviado</span>
            </div>
          )}
        </div>
      </div>

      <ConfirmDerivationDialog
        open={showDerivationDialog}
        onOpenChange={setShowDerivationDialog}
        onConfirm={confirmDerivation}
        title={title}
      />
    </div>
  );
}