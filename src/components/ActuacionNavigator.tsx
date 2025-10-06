import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import type { Actuacion } from '@/types/actuacion';

interface ActuacionNavigatorProps {
  actuaciones: Actuacion[];
  expedientNumber: string;
  expedientTitle: string;
}

export function ActuacionNavigator({ actuaciones, expedientNumber, expedientTitle }: ActuacionNavigatorProps) {
  const [selectedActuacion, setSelectedActuacion] = useState<Actuacion | null>(
    actuaciones.length > 0 ? actuaciones[0] : null
  );

  const getStatusBadge = (status: Actuacion['status']) => {
    const variants = {
      'borrador': { label: 'Borrador', className: 'bg-slate-500' },
      'para-firmar': { label: 'Para Firmar', className: 'bg-amber-500' },
      'firmado': { label: 'Firmado', className: 'bg-emerald-500' }
    };
    
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const renderPDFPreview = (actuacion: Actuacion) => {
    // Extraer texto del HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = actuacion.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    return (
      <div className="bg-white text-black p-12 min-h-full" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Información de la actuación */}
        <div className="mb-8">
          <h3 className="text-center text-lg font-bold mb-6">
            ACTUACIÓN N° {actuacion.number}
          </h3>
          
          <div className="mb-6 text-sm space-y-1">
            <p><strong>Título:</strong> {actuacion.title}</p>
            <p><strong>Tipo:</strong> {actuacion.tipo.toUpperCase()}</p>
            <p><strong>Fecha de Creación:</strong> {new Date(actuacion.createdAt).toLocaleDateString('es-ES')}</p>
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
            Actuaciones ({actuaciones.length})
          </h3>
          
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="space-y-2">
              {actuaciones.map((actuacion) => (
                <button
                  key={actuacion.id}
                  onClick={() => setSelectedActuacion(actuacion)}
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
