import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Heading, ChevronDown } from "lucide-react";

interface HeadingSelectorProps {
  editor: any;
}

export function HeadingSelector({ editor }: HeadingSelectorProps) {
  const headingOptions = [
    { label: 'Párrafo normal', level: null, className: 'text-sm' },
    { label: 'Título 1', level: 1, className: 'text-2xl font-bold' },
    { label: 'Título 2', level: 2, className: 'text-xl font-bold' },
    { label: 'Título 3', level: 3, className: 'text-lg font-bold' },
    { label: 'Título 4', level: 4, className: 'text-base font-bold' },
    { label: 'Título 5', level: 5, className: 'text-sm font-bold' },
    { label: 'Título 6', level: 6, className: 'text-xs font-bold' },
    { label: 'Cita', level: 'blockquote', className: 'text-sm italic border-l-4 pl-4' },
  ];

  const setHeading = (level: number | null | string) => {
    if (level === null) {
      editor.chain().focus().setParagraph().run();
    } else if (level === 'blockquote') {
      editor.chain().focus().toggleBlockquote().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Título 1';
    if (editor.isActive('heading', { level: 2 })) return 'Título 2';
    if (editor.isActive('heading', { level: 3 })) return 'Título 3';
    if (editor.isActive('heading', { level: 4 })) return 'Título 4';
    if (editor.isActive('heading', { level: 5 })) return 'Título 5';
    if (editor.isActive('heading', { level: 6 })) return 'Título 6';
    if (editor.isActive('blockquote')) return 'Cita';
    return 'Normal';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-muted text-sm">
          <Heading className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">{getCurrentHeading()}</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {headingOptions.map((option, index) => (
          <DropdownMenuItem 
            key={index}
            onClick={() => setHeading(option.level)}
            className={option.className}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}