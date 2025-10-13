import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileSignature } from 'lucide-react';

interface HeaderFooterDialogProps {
  headerText: string;
  footerText: string;
  onHeaderChange: (text: string) => void;
  onFooterChange: (text: string) => void;
}

export function HeaderFooterDialog({
  headerText,
  footerText,
  onHeaderChange,
  onFooterChange,
}: HeaderFooterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localHeader, setLocalHeader] = useState(headerText);
  const [localFooter, setLocalFooter] = useState(footerText);

  const handleSave = () => {
    onHeaderChange(localHeader);
    onFooterChange(localFooter);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Encabezado y pie de página" className="h-8 px-3 hover:bg-muted">
          <FileSignature className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Enc/Pie</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Encabezado y Pie de Página</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header">Encabezado</Label>
            <Input
              id="header"
              value={localHeader}
              onChange={(e) => setLocalHeader(e.target.value)}
              placeholder="Texto del encabezado..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footer">Pie de página</Label>
            <Input
              id="footer"
              value={localFooter}
              onChange={(e) => setLocalFooter(e.target.value)}
              placeholder="Texto del pie de página..."
            />
            <p className="text-xs text-muted-foreground">
              El número de página se agregará automáticamente al pie de página
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
