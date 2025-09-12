import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface FontSizeSelectorProps {
  editor: any;
}

export function FontSizeSelector({ editor }: FontSizeSelectorProps) {
  const fontSizes = [
    { label: '8', value: '8px' },
    { label: '9', value: '9px' },
    { label: '10', value: '10px' },
    { label: '11', value: '11px' },
    { label: '12', value: '12px' },
    { label: '14', value: '14px' },
    { label: '16', value: '16px' },
    { label: '18', value: '18px' },
    { label: '20', value: '20px' },
    { label: '24', value: '24px' },
    { label: '28', value: '28px' },
    { label: '32', value: '32px' },
    { label: '36', value: '36px' },
    { label: '48', value: '48px' },
    { label: '72', value: '72px' }
  ];

  const setFontSize = (fontSize: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize }).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-muted text-sm">
          <span className="hidden sm:inline mr-1">12</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {fontSizes.map((size) => (
          <DropdownMenuItem 
            key={size.value}
            onClick={() => setFontSize(size.value)}
            style={{ fontSize: size.value }}
          >
            {size.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}