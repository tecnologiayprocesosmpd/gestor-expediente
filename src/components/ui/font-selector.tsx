import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Type } from "lucide-react";

interface FontSelectorProps {
  editor: any;
}

export function FontSelector({ editor }: FontSelectorProps) {
  const fonts = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Courier New', value: 'Courier New, monospace' }
  ];

  const setFont = (fontFamily: string) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" title="Fuente">
          <Type className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {fonts.map((font) => (
          <DropdownMenuItem 
            key={font.value}
            onClick={() => setFont(font.value)}
            style={{ fontFamily: font.value }}
          >
            {font.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}