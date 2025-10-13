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
import { Search } from 'lucide-react';

interface SearchReplaceDialogProps {
  editor: any;
}

export function SearchReplaceDialog({ editor }: SearchReplaceDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    if (!searchTerm) return;
    
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n');
    const index = text.indexOf(searchTerm, from);
    
    if (index !== -1) {
      editor.commands.setTextSelection({ from: index, to: index + searchTerm.length });
      editor.commands.scrollIntoView();
    }
  };

  const handleReplace = () => {
    if (!searchTerm) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, '\n');
    
    if (selectedText === searchTerm) {
      editor.commands.insertContent(replaceTerm);
      handleSearch(); // Find next occurrence
    }
  };

  const handleReplaceAll = () => {
    if (!searchTerm) return;
    
    const content = editor.getHTML();
    const regex = new RegExp(searchTerm, 'g');
    const newContent = content.replace(regex, replaceTerm);
    editor.commands.setContent(newContent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Buscar y reemplazar" className="h-8 px-3 hover:bg-muted">
          <Search className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar y Reemplazar</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Texto a buscar..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="replace">Reemplazar con</Label>
            <Input
              id="replace"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              placeholder="Texto de reemplazo..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleSearch}>
              Buscar siguiente
            </Button>
            <Button variant="outline" onClick={handleReplace}>
              Reemplazar
            </Button>
            <Button onClick={handleReplaceAll}>
              Reemplazar todo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
