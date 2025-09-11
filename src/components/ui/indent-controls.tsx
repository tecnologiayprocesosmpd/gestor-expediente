import { Button } from "@/components/ui/button";
import { Indent, Outdent } from "lucide-react";

interface IndentControlsProps {
  editor: any;
}

export function IndentControls({ editor }: IndentControlsProps) {
  const addIndent = () => {
    const { from, to } = editor.state.selection;
    editor.chain()
      .setTextSelection({ from, to })
      .updateAttributes('paragraph', { 
        style: 'margin-left: 2rem' 
      })
      .run();
  };

  const removeIndent = () => {
    const { from, to } = editor.state.selection;
    editor.chain()
      .setTextSelection({ from, to })
      .updateAttributes('paragraph', { 
        style: 'margin-left: 0' 
      })
      .run();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={removeIndent}
        title="Disminuir sangría"
      >
        <Outdent className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={addIndent}
        title="Aumentar sangría"
      >
        <Indent className="w-4 h-4" />
      </Button>
    </>
  );
}