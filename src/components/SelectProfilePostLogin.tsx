import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Building2, Shield } from "lucide-react";
import { useState } from "react";
import { useUser, type UserProfile } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

export default function SelectProfilePostLogin() {
  const { setUser } = useUser();
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<string>("");

  const handleConfirm = () => {
    const map = {
      "mesa-entrada": {
        role: "mesa" as const,
        title: "Mesa de Entrada",
        icon: FileText,
      },
      oficina: {
        role: "oficina" as const,
        title: "Oficina",
        icon: Building2,
      },
    } as const;

    if (!selectedProfile) return;
    const cfg = map[selectedProfile as UserProfile];
    setUser({
      profile: selectedProfile as UserProfile,
      role: cfg.role,
      name: `Usuario ${cfg.title}`,
      department: cfg.title,
    });
    toast({
      title: "Perfil seleccionado",
      description: `Ingresando como ${cfg.title}`,
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Seleccionar Perfil</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sus credenciales fueron validadas. Elija cómo desea ingresar.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Perfil de Acceso</Label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger className="w-full h-12 bg-background">
                <SelectValue placeholder="Seleccione un perfil..." />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="mesa-entrada" className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 bg-background">
                  <div className="flex items-center gap-3 py-1.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">Mesa de Entrada</div>
                      <div className="text-xs text-muted-foreground">Gestión de ingresos y trámites iniciales</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="oficina" className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 bg-background">
                  <div className="flex items-center gap-3 py-1.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground">Oficina</div>
                      <div className="text-xs text-muted-foreground">Gestión de expedientes y procedimientos</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full h-11 bg-gradient-primary hover:bg-gradient-primary/90" 
            onClick={handleConfirm} 
            disabled={!selectedProfile}
          >
            Ingresar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
