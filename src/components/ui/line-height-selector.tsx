import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlignJustify } from "lucide-react";

interface LineHeightSelectorProps {
  editor: any;
}

export function LineHeightSelector({ editor }: LineHeightSelectorProps) {
  const lineHeights = [
    { label: '1.0', value: '1' },
    { label: '1.15', value: '1.15' },
    { label: '1.5', value: '1.5' },
    { label: '2.0', value: '2' },
    { label: '2.5', value: '2.5' },
    { label: '3.0', value: '3' }
  ];

  const setLineHeight = (lineHeight: string) => {
    editor.chain().focus().selectAll().run();
    const selection = editor.state.selection;
    
    editor.chain()
      .setTextSelection(selection)
      .updateAttributes('paragraph', { style: `line-height: ${lineHeight}` })
      .run();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" title="Interlineado" className="h-8 px-3 hover:bg-muted text-sm">
          <AlignJustify className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Espaciado</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {lineHeights.map((height) => (
          <DropdownMenuItem 
            key={height.value}
            onClick={() => setLineHeight(height.value)}
          >
            {height.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}