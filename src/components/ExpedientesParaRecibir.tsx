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
  onExpandChange?: (isExpanded: boolean) => void;
}

export function ExpedientesParaRecibir({ 
  expedients, 
  onRecibirExpediente,
  onExpandChange 
}: ExpedientesParaRecibirProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onExpandChange?.(open);
  };
  
  // Filtrar expedientes en trámite para la oficina del usuario
  // Por ahora mock - en producción esto se haría por oficina asignada
  const expedientesParaRecibir = expedients.filter(exp => exp.status === 'en_tramite');
  
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
    <Card className="hover:shadow-lg transition-shadow border-2 border-[hsl(var(--card-inicio-border))] bg-gradient-to-br from-[hsl(var(--card-inicio-light))] to-[hsl(var(--card-inicio-light))]">
      <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-6 text-center cursor-pointer">
            <div className="w-12 h-12 bg-[hsl(var(--card-inicio))] rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-[hsl(var(--card-inicio))] mb-1">EXPEDIENTES</h3>
            <p className="text-xs text-[hsl(var(--card-inicio))] opacity-80">Para recibir</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge className="bg-[hsl(var(--card-inicio))] text-white text-xs">
                {expedientesParaRecibir.length} Pendientes
              </Badge>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-[hsl(var(--card-inicio))]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[hsl(var(--card-inicio))]" />
              )}
            </div>
          </CardContent>
        </CollapsibleTrigger>
      </Collapsible>
    </Card>
  );
}