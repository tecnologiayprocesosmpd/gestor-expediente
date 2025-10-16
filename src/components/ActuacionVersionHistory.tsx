import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export interface ActuacionVersion {
  id: string;
  content: string;
  title: string;
  timestamp: Date;
  modifiedBy: string;
  version: number;
}

interface ActuacionVersionHistoryProps {
  versions: ActuacionVersion[];
  onRestore: (version: ActuacionVersion) => void;
}

export function ActuacionVersionHistory({ versions, onRestore }: ActuacionVersionHistoryProps) {
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getPreviewText = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.slice(0, 150) + (text.length > 150 ? '...' : '');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="w-4 h-4 mr-2" />
          Historial ({versions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Historial de Versiones</DialogTitle>
          <DialogDescription>
            Todas las versiones guardadas de esta actuación. Haz clic en restaurar para volver a una versión anterior.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {sortedVersions.map((version, index) => (
              <div
                key={version.id}
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">Versión {version.version}</span>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs">Actual</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(version.timestamp), {
                        addSuffix: true,
                        locale: es
                      })}
                    </p>
                  </div>
                  {index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(version)}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restaurar
                    </Button>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{version.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Modificado por: {version.modifiedBy}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {getPreviewText(version.content)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
