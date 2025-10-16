import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Filter } from 'lucide-react';
import type { Actuacion } from '@/types/actuacion';

interface ActuacionNavigatorProps {
  actuaciones: Actuacion[];
  expedientNumber: string;
  expedientTitle: string;
}

export function ActuacionNavigator({ actuaciones, expedientNumber, expedientTitle }: ActuacionNavigatorProps) {
  const [filterStatus, setFilterStatus] = useState<'todos' | 'borrador' | 'para-firmar' | 'firmado'>('todos');
  
  // Filtrar actuaciones según el estado seleccionado
  const filteredActuaciones = useMemo(() => {
    if (filterStatus === 'todos') {
      return actuaciones;
    }
    return actuaciones.filter(a => a.status === filterStatus);
  }, [actuaciones, filterStatus]);
  
  const [selectedActuacion, setSelectedActuacion] = useState<Actuacion | null>(
    filteredActuaciones.length > 0 ? filteredActuaciones[0] : null
  );

  const getStatusBadge = (status: Actuacion['status']) => {
    const variants = {
      'borrador': { label: 'Borrador', className: 'border-orange-500 text-orange-600' },
      'para-firmar': { label: 'Para Firmar', className: 'border-blue-500 text-blue-600' },
      'firmado': { label: 'Firmado', className: 'border-green-500 text-green-600' }
    };
    
    const variant = variants[status];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  const getTipoLabel = (tipo: Actuacion['tipo']) => {
    const labels = {
      resolucion: 'Resolución',
      providencia: 'Providencia',
      nota: 'Nota',
      dictamen: 'Dictamen',
      decreto: 'Decreto',
      auto: 'Auto'
    };
    return labels[tipo];
  };

  const renderPDFPreview = (actuacion: Actuacion) => {
    // Extraer texto del HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = actuacion.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    return (
      <div className="bg-white text-black p-12 min-h-full" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Encabezado con título e información */}
        <div className="mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold text-center mb-4">{expedientTitle}</h1>
          <div className="text-sm space-y-1">
            <p><strong>Expediente:</strong> {expedientNumber}</p>
            <p><strong>Actuación #{actuacion.number}:</strong> {actuacion.title}</p>
            <p><strong>Tipo:</strong> {getTipoLabel(actuacion.tipo)}</p>
            <p><strong>Creado por:</strong> {actuacion.createdBy}</p>
            <p><strong>Fecha:</strong> {new Date(actuacion.createdAt).toLocaleDateString('es-ES')}</p>
            {actuacion.status === 'firmado' && actuacion.signedBy && (
              <p><strong>Firmado por:</strong> {actuacion.signedBy}</p>
            )}
          </div>
        </div>

        {/* Contenido de la actuación */}
        <div className="text-justify leading-relaxed whitespace-pre-wrap">
          {textContent}
        </div>

        {/* Pie de página con firma (si está firmado) */}
        {actuacion.status === 'firmado' && (
          <div className="mt-12 pt-8 border-t border-black">
            <div className="text-right">
              <p className="mb-1">_____________________________</p>
              <p className="font-bold">{actuacion.signedBy}</p>
              <p className="text-sm">Firma Digital</p>
              <p className="text-xs text-gray-600 mt-2">
                Firmado el {new Date(actuacion.signedAt!).toLocaleString('es-ES')}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full gap-4">
      {/* Lado izquierdo: Grilla de actuaciones */}
      <Card className="w-80 flex-shrink-0">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Actuaciones ({filteredActuaciones.length})
          </h3>
          
          {/* Filtro de estado */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrar por estado</span>
            </div>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="borrador">Borradores</SelectItem>
                <SelectItem value="para-firmar">Para Firma</SelectItem>
                <SelectItem value="firmado">Firmado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ScrollArea className="h-[calc(100vh-18rem)]">
            <div className="space-y-2">
              {filteredActuaciones.map((actuacion) => (
                <button
                  key={actuacion.id}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    setSelectedActuacion(actuacion);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedActuacion?.id === actuacion.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-sm">#{actuacion.number}</span>
                    {getStatusBadge(actuacion.status)}
                  </div>
                  <p className="font-medium text-sm line-clamp-2">
                    {actuacion.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(actuacion.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Lado derecho: Previsualización PDF */}
      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          {selectedActuacion ? (
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {renderPDFPreview(selectedActuacion)}
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Seleccione una actuación para ver su contenido</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
