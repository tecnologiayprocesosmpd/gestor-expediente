import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Settings } from "lucide-react";

interface MarginControlsProps {
  onMarginsChange: (margins: { top: number; right: number; bottom: number; left: number }) => void;
  currentMargins: { top: number; right: number; bottom: number; left: number };
}

export function MarginControls({ onMarginsChange, currentMargins }: MarginControlsProps) {
  const [margins, setMargins] = useState(currentMargins);

  const handleMarginChange = (side: keyof typeof margins, value: string) => {
    const numValue = parseInt(value) || 0;
    const newMargins = { ...margins, [side]: numValue };
    setMargins(newMargins);
    onMarginsChange(newMargins);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" title="Configurar márgenes" className="h-8 w-8 p-0 hover:bg-muted">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-semibold">Márgenes del documento</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="margin-top">Superior (px)</Label>
              <Input
                id="margin-top"
                type="number"
                value={margins.top}
                onChange={(e) => handleMarginChange('top', e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin-right">Derecho (px)</Label>
              <Input
                id="margin-right"
                type="number"
                value={margins.right}
                onChange={(e) => handleMarginChange('right', e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin-bottom">Inferior (px)</Label>
              <Input
                id="margin-bottom"
                type="number"
                value={margins.bottom}
                onChange={(e) => handleMarginChange('bottom', e.target.value)}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin-left">Izquierdo (px)</Label>
              <Input
                id="margin-left"
                type="number"
                value={margins.left}
                onChange={(e) => handleMarginChange('left', e.target.value)}
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}