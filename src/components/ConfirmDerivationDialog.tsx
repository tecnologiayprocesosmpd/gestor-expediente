import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmDerivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onConfirm: () => void;
}

export function ConfirmDerivationDialog({
  open,
  onOpenChange,
  title,
  onConfirm
}: ConfirmDerivationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-6 py-4">
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold text-foreground">
              ¿Está seguro que desea derivar este expediente?
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-base font-medium text-foreground">
                {title}
              </p>
            </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}