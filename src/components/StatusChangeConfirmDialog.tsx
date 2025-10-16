import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface StatusChangeConfirmDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: (motivo?: string) => void;
  title?: string;
  message?: string;
  requireMotivo?: boolean;
}

export function StatusChangeConfirmDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  onConfirm,
  title = "Confirmar cambio de estado",
  message = "¿Está seguro de enviar la actuación para firma?",
  requireMotivo = true
}: StatusChangeConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleConfirm = async () => {
    if (requireMotivo && !motivo.trim()) {
      return;
    }
    setIsLoading(true);
    try {
      onConfirm(requireMotivo ? motivo : undefined);
      onOpenChange?.(false);
      setMotivo('');
    } finally {
      setIsLoading(false);
    }
  };

  // Si se proporciona `open`, usa modo controlado
  const isControlled = controlledOpen !== undefined;

  return (
    <AlertDialog open={isControlled ? controlledOpen : undefined} onOpenChange={onOpenChange}>
      {children && (
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {requireMotivo && (
          <div className="py-4">
            <Label htmlFor="motivo" className="text-sm font-medium">
              Motivo del cambio de estado *
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ingrese el motivo del cambio de estado..."
              className="mt-2"
              rows={4}
              disabled={isLoading}
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} onClick={() => setMotivo('')}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isLoading || (requireMotivo && !motivo.trim())}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
          >
            {isLoading ? "Procesando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}