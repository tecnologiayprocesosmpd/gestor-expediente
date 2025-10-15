import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText } from 'lucide-react';

interface PageSetupDialogProps {
  pageSize: string;
  orientation: string;
  onPageSizeChange: (size: string) => void;
  onOrientationChange: (orientation: string) => void;
}

export function PageSetupDialog({
  pageSize,
  orientation,
  onPageSizeChange,
  onOrientationChange,
}: PageSetupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Configurar página" className="h-8 px-3 hover:bg-muted">
          <FileText className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Página</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración de Página</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pageSize">Tamaño de página</Label>
            <Select value={pageSize} onValueChange={onPageSizeChange}>
              <SelectTrigger id="pageSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4 (21 x 29.7 cm)</SelectItem>
                <SelectItem value="letter">Carta (21.6 x 27.9 cm)</SelectItem>
                <SelectItem value="oficio">Oficio (21.6 x 33 cm)</SelectItem>
                <SelectItem value="legal">Legal (21.6 x 35.6 cm)</SelectItem>
                <SelectItem value="a3">A3 (29.7 x 42 cm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="orientation">Orientación</Label>
            <Select value={orientation} onValueChange={onOrientationChange}>
              <SelectTrigger id="orientation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Vertical</SelectItem>
                <SelectItem value="landscape">Horizontal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
