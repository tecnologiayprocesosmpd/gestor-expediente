import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, CheckCircle, Undo2 } from "lucide-react";
import { Actuacion } from "@/types/actuacion";

interface SelectActuacionEstadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: Actuacion['status'];
  onSelect: (newStatus: Actuacion['status']) => void;
}

export function SelectActuacionEstadoDialog({
  open,
  onOpenChange,
  currentStatus,
  onSelect
}: SelectActuacionEstadoDialogProps) {
  
  const getOptions = () => {
    if (currentStatus === 'para-firmar') {
      return [
        { 
          value: 'borrador' as const, 
          label: 'Volver a Borrador', 
          icon: Undo2, 
          variant: 'outline' as const 
        },
        { 
          value: 'firmado' as const, 
          label: 'Firmado', 
          icon: CheckCircle, 
          variant: 'default' as const 
        }
      ];
    }
    return [];
  };

  const options = getOptions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado de Actuación</DialogTitle>
          <DialogDescription>
            Seleccione el nuevo estado para la actuación
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={option.variant}
                className="w-full h-auto py-4 justify-start"
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="w-5 h-5" />
                  <span className="text-base font-medium">{option.label}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}