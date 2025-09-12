import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface DocumentStatsProps {
  editor: any;
}

export function DocumentStats({ editor }: DocumentStatsProps) {
  if (!editor) return null;

  const characterCount = editor.storage.characterCount || {};
  const words = characterCount.words || 0;
  const characters = characterCount.characters || 0;
  const charactersNoSpaces = characterCount.charactersNoSpaces || 0;

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <FileText className="w-3 h-3" />
        <span>Palabras: {words}</span>
      </div>
      <div>Caracteres: {characters}</div>
      <div>Sin espacios: {charactersNoSpaces}</div>
    </div>
  );
}