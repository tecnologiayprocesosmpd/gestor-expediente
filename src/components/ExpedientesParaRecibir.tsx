import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Calendar,
  User,
  CheckCircle
} from "lucide-react";
import { ExpedientSummary } from "@/types/expedient";
import { useUser } from "@/contexts/UserContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExpedientesParaRecibirProps {
  expedients: ExpedientSummary[];
  onRecibirExpediente?: (expedientId: string) => void;
}

export function ExpedientesParaRecibir({ 
  expedients, 
  onRecibirExpediente 
}: ExpedientesParaRecibirProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  
  // Filtrar expedientes derivados para la oficina del usuario
  // Por ahora mock - en producción esto se haría por oficina asignada
  const expedientesParaRecibir = expedients.filter(exp => exp.status === 'derivado');
  
  const handleRecibirExpediente = (expedientId: string) => {
    if (onRecibirExpediente) {
      onRecibirExpediente(expedientId);
    }
  };

  const getOficinaLabel = (oficinaValue: string) => {
    const oficinas = {
      'defensoria-1': 'Defensoría Civil Nº 1',
      'defensoria-2': 'Defensoría Civil Nº 2', 
      'defensoria-penal': 'Defensoría Penal',
      'secretaria-administrativa': 'Secretaría Administrativa',
      'secretaria-tecnica': 'Secretaría Técnica'
    };
    return oficinas[oficinaValue as keyof typeof oficinas] || oficinaValue;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-6 text-center cursor-pointer">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-blue-900 mb-1">EXPEDIENTES</h3>
            <p className="text-xs text-blue-700">Para recibir</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge className="bg-blue-600 text-white text-xs">
                {expedientesParaRecibir.length} Pendientes
              </Badge>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-blue-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-600" />
              )}
            </div>
          </CardContent>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="px-4 pb-4">
            <div className="border-t border-blue-200 pt-4">
              {expedientesParaRecibir.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-blue-700">No hay expedientes pendientes de recibir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expedientesParaRecibir.map((expedient) => (
                    <div 
                      key={expedient.id}
                      className="bg-white rounded-lg border border-blue-200 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {expedient.number}
                            </span>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              Derivado
                            </Badge>
                          </div>
                          
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                            {expedient.title}
                          </h4>
                          
                          <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Creado por: {expedient.createdBy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Fecha: {format(expedient.createdAt, "dd/MM/yyyy", { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-3">
                          <Button
                            size="sm"
                            onClick={() => handleRecibirExpediente(expedient.id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                          >
                            RECIBIR
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}