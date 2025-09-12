import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, Unlink } from "lucide-react";
import { useState } from "react";

interface LinkControlsProps {
  editor: any;
}

export function LinkControls({ editor }: LinkControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');

  const setLink = () => {
    if (!url) return;
    
    const previousUrl = editor.getAttributes('link').href;
    
    // Si hay texto seleccionado, aplicar el enlace
    if (editor.state.selection.from !== editor.state.selection.to) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      // Si no hay selección, insertar enlace con el texto de la URL
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    }
    
    setUrl('');
    setIsOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const isLinkActive = editor.isActive('link');

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          title="Enlace" 
          className={`h-8 w-8 p-0 hover:bg-muted ${isLinkActive ? 'bg-accent text-accent-foreground' : ''}`}
        >
          <Link className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4" onClick={(e) => e.stopPropagation()}>
        {isLinkActive ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Enlace activo</p>
            <p className="text-xs text-muted-foreground">
              {editor.getAttributes('link').href}
            </p>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={removeLink}
              className="w-full"
            >
              <Unlink className="w-4 h-4 mr-2" />
              Quitar enlace
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="link-url" className="text-sm font-medium">URL del enlace</Label>
              <Input
                id="link-url"
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setLink();
                  }
                }}
                className="text-sm"
              />
            </div>
            <Button 
              onClick={setLink} 
              disabled={!url}
              className="w-full"
              size="sm"
            >
              <Link className="w-4 h-4 mr-2" />
              Aplicar enlace
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}