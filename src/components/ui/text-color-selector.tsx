import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Type, Highlighter } from "lucide-react";

interface TextColorSelectorProps {
  editor: any;
  type: 'text' | 'highlight';
}

export function TextColorSelector({ editor, type }: TextColorSelectorProps) {
  const colors = [
    { label: 'Negro', value: '#000000' },
    { label: 'Gris oscuro', value: '#4B5563' },
    { label: 'Gris', value: '#9CA3AF' },
    { label: 'Rojo', value: '#DC2626' },
    { label: 'Naranja', value: '#EA580C' },
    { label: 'Amarillo', value: '#D97706' },
    { label: 'Verde', value: '#16A34A' },
    { label: 'Azul', value: '#2563EB' },
    { label: 'Índigo', value: '#4F46E5' },
    { label: 'Púrpura', value: '#9333EA' },
    { label: 'Rosa', value: '#EC4899' },
  ];

  const highlightColors = [
    { label: 'Amarillo', value: '#FEF08A' },
    { label: 'Verde claro', value: '#BBF7D0' },
    { label: 'Azul claro', value: '#BFDBFE' },
    { label: 'Rosa claro', value: '#FBCFE8' },
    { label: 'Naranja claro', value: '#FED7AA' },
    { label: 'Púrpura claro', value: '#DDD6FE' },
  ];

  const setColor = (color: string) => {
    if (type === 'text') {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  const removeColor = () => {
    if (type === 'text') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
  };

  const colorList = type === 'text' ? colors : highlightColors;
  const Icon = type === 'text' ? Type : Highlighter;
  const title = type === 'text' ? 'Color de texto' : 'Color de resaltado';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" title={title} className="h-8 w-8 p-0 hover:bg-muted">
          <Icon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <div className="grid grid-cols-4 gap-1 p-2">
          {colorList.map((color) => (
            <button
              key={color.value}
              onClick={() => setColor(color.value)}
              className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
        <DropdownMenuItem onClick={removeColor} className="text-sm">
          Quitar {type === 'text' ? 'color' : 'resaltado'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}