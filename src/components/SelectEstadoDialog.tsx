import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Pause, Archive } from "lucide-react";

interface SelectEstadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: 'en_tramite' | 'paralizado' | 'archivado';
  onSelect: (newStatus: 'en_tramite' | 'paralizado' | 'archivado') => void;
}

export function SelectEstadoDialog({
  open,
  onOpenChange,
  currentStatus,
  onSelect
}: SelectEstadoDialogProps) {
  
  const statusOptions = [
    { value: 'en_tramite' as const, label: 'En Trámite', icon: FileText, color: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))]' },
    { value: 'paralizado' as const, label: 'Paralizado', icon: Pause, color: 'bg-amber-500 text-white' },
    { value: 'archivado' as const, label: 'Archivado', icon: Archive, color: 'bg-[hsl(var(--status-archivado))] text-[hsl(var(--status-archivado-foreground))]' }
  ];

  const availableOptions = statusOptions.filter(option => option.value !== currentStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Expediente</DialogTitle>
          <DialogDescription>
            Seleccione el nuevo estado para el expediente
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {availableOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant="outline"
                className="w-full h-auto py-4 justify-start"
                onClick={() => {
                  onSelect(option.value);
                  onOpenChange(false);
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="w-5 h-5" />
                  <span className="text-base font-medium">{option.label}</span>
                  <Badge className={`ml-auto ${option.color}`}>
                    {option.label}
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
