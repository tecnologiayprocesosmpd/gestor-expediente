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
import { AlertTriangle } from "lucide-react";

interface StatusChangeConfirmDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function StatusChangeConfirmDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  onConfirm,
  title = "Confirmar cambio de estado",
  message = "¿Está seguro de enviar la actuación para firma?"
}: StatusChangeConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      onConfirm();
      onOpenChange?.(false);
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? "Procesando..." : "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}