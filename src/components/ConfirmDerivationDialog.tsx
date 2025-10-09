import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Building2 } from "lucide-react";

interface ConfirmDerivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oficina: string;
  expedientNumber: string;
  onConfirm: () => void;
}

export function ConfirmDerivationDialog({
  open,
  onOpenChange,
  oficina,
  expedientNumber,
  onConfirm
}: ConfirmDerivationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Confirmar Derivación de Expediente
          </DialogTitle>
          <DialogDescription>
            Esta acción enviará el expediente a la oficina seleccionada y no se podrá deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>¿Está seguro que desea derivar este expediente?</strong>
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Expediente:</span>
              <span className="font-mono text-primary">{expedientNumber}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Oficina destino:</span>
              <span className="font-semibold text-foreground">{getOficinaLabel(oficina)}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Una vez derivado, el expediente aparecerá en la lista "EXPEDIENTES Para recibir" 
            de la oficina seleccionada y deberá ser recibido antes de poder trabajar en él.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isConfirming ? "Derivando..." : "Confirmar Derivación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}