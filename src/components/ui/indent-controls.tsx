import { Button } from "@/components/ui/button";
import { Indent, Outdent } from "lucide-react";

interface IndentControlsProps {
  editor: any;
}

export function IndentControls({ editor }: IndentControlsProps) {
  const addIndent = () => {
    editor.chain().focus().increaseIndent().run();
  };

  const removeIndent = () => {
    editor.chain().focus().decreaseIndent().run();
  };

  return (
    <>
        <Button
          variant="ghost"
          size="sm"
          onClick={removeIndent}
          title="Disminuir sangría"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Outdent className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addIndent}
          title="Aumentar sangría"
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <Indent className="w-4 h-4" />
        </Button>
    </>
  );
}