import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Eye, EyeOff, Building2, FileText } from "lucide-react";
import { useSecurity } from "@/contexts/SecurityContext";
import { useUser, type UserProfile } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

const profiles = [
  {
    id: 'mesa-entrada' as UserProfile,
    title: 'Mesa de Entrada',
    role: 'mesa' as const,
    icon: FileText,
    description: 'Gestión de ingresos y trámites iniciales'
  },
  {
    id: 'oficina' as UserProfile,
    title: 'Oficina',
    role: 'oficina' as const,
    icon: Building2,
    description: 'Gestión de expedientes y procedimientos'
  }
];

export function AuthenticationFlow() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>('mesa-entrada');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useSecurity();
  const { setUser } = useUser();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.username || !credentials.password) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      const success = await login(credentials);
      if (!success) {
        setError('Usuario o contraseña incorrectos');
      } else {
        const profile = profiles.find(p => p.id === selectedProfile);
        if (profile) {
          setUser({
            profile: selectedProfile,
            role: profile.role,
            name: `Usuario ${profile.title}`,
            department: profile.title
          });
          toast({
            title: "Sesión iniciada",
            description: `Bienvenido como ${profile.title}`,
          });
        }
      }
    } catch (error) {
      setError('Error al conectar con el sistema. Intente nuevamente.');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            MPD Sistema
          </h1>
          <p className="text-muted-foreground">
            Ministerio Público de la Defensa
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de Gestión de Expedientes y Legajos
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-medium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Ingrese sus credenciales para acceder al sistema
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ 
                      ...prev, 
                      username: e.target.value 
                    }))}
                    disabled={isLoading}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ 
                        ...prev, 
                        password: e.target.value 
                      }))}
                      disabled={isLoading}
                      className="h-11 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(prev => !prev)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Perfil de Acceso</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {profiles.map((profile) => {
                      const Icon = profile.icon;
                      const isSelected = selectedProfile === profile.id;
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => setSelectedProfile(profile.id)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                            isSelected 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                          disabled={isLoading}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                {profile.title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {profile.description}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-primary hover:bg-gradient-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Demo credentials info */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Credenciales de prueba:
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Usuario: <code className="bg-background px-1 rounded">admin</code></div>
                <div>Contraseña: <code className="bg-background px-1 rounded">admin</code></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Ministerio Público de la Defensa</p>
          <p>Sistema de Gestión Digital</p>
        </div>
      </div>
    </div>
  );
}