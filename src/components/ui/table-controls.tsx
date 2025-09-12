import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Table, Plus, Minus } from "lucide-react";

interface TableControlsProps {
  editor: any;
}

export function TableControls({ editor }: TableControlsProps) {
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const toggleHeaderColumn = () => {
    editor.chain().focus().toggleHeaderColumn().run();
  };

  const toggleHeaderRow = () => {
    editor.chain().focus().toggleHeaderRow().run();
  };

  const toggleHeaderCell = () => {
    editor.chain().focus().toggleHeaderCell().run();
  };

  const isTableActive = editor.isActive('table');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" title="Tabla" className="h-8 w-8 p-0 hover:bg-muted">
          <Table className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {!isTableActive ? (
          <DropdownMenuItem onClick={insertTable}>
            <Plus className="w-4 h-4 mr-2" />
            Insertar tabla
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={addColumnBefore}>
              <Plus className="w-4 h-4 mr-2" />
              Columna antes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addColumnAfter}>
              <Plus className="w-4 h-4 mr-2" />
              Columna después
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteColumn}>
              <Minus className="w-4 h-4 mr-2" />
              Eliminar columna
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addRowBefore}>
              <Plus className="w-4 h-4 mr-2" />
              Fila arriba
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addRowAfter}>
              <Plus className="w-4 h-4 mr-2" />
              Fila abajo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteRow}>
              <Minus className="w-4 h-4 mr-2" />
              Eliminar fila
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleHeaderRow}>
              Alternar encabezado fila
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleHeaderColumn}>
              Alternar encabezado columna
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteTable} className="text-destructive">
              <Minus className="w-4 h-4 mr-2" />
              Eliminar tabla
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}