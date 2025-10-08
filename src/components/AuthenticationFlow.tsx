import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isCredentialsValidated, setIsCredentialsValidated] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const { login, isLoading } = useSecurity();
  const { setUser } = useUser();
  const { toast } = useToast();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
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
        setIsCredentialsValidated(true);
        setError(''); // Clear any previous errors
        toast({
          title: "Credenciales validadas",
          description: "Ahora seleccione su perfil de acceso",
        });
      }
    } catch (error) {
      setError('Error al conectar con el sistema. Intente nuevamente.');
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedProfile) {
      setError('Por favor seleccione un perfil');
      return;
    }

    const profile = profiles.find(p => p.id === selectedProfile);
    if (profile) {
      setUser({
        profile: selectedProfile as UserProfile,
        role: profile.role,
        name: `Usuario ${profile.title}`,
        department: profile.title
      });
      toast({
        title: "Sesión iniciada",
        description: `Bienvenido como ${profile.title}`,
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-60 h-60 mx-auto mb-4">
            <img 
              src="/assets/logo-mpd.png" 
              alt="Logo MPD" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            MPD Sistema
          </h1>
        </div>

        {/* Login Card */}
        <Card className="shadow-medium">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {!isCredentialsValidated ? 'Iniciar Sesión' : 'Seleccionar Perfil'}
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              {!isCredentialsValidated 
                ? 'Ingrese sus credenciales para acceder al sistema'
                : 'Seleccione el perfil con el que desea trabajar'
              }
            </p>
          </CardHeader>
          <CardContent>
            {!isCredentialsValidated ? (
              // Credentials Form
              <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-primary hover:bg-gradient-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Validando credenciales...
                    </div>
                  ) : (
                    'Validar Credenciales'
                  )}
                </Button>
              </form>
            ) : (
              // Profile Selection Form
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Perfil de Acceso</Label>
                  <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger className="w-full h-12 bg-background">
                      <SelectValue placeholder="Seleccione un perfil..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {profiles.map((profile) => {
                        const Icon = profile.icon;
                        return (
                          <SelectItem 
                            key={profile.id} 
                            value={profile.id}
                            className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50 bg-background"
                          >
                            <div className="flex items-center gap-3 py-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-medium text-foreground">
                                  {profile.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {profile.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => {
                      setIsCredentialsValidated(false);
                      setSelectedProfile('');
                      setError('');
                    }}
                  >
                    Volver
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-gradient-primary hover:bg-gradient-primary/90"
                    disabled={!selectedProfile}
                  >
                    Ingresar al Sistema
                  </Button>
                </div>
              </form>
            )}

            {/* Demo credentials info */}
            {!isCredentialsValidated && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Credenciales de prueba:
                </p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Usuario: <code className="bg-background px-1 rounded">admin</code></div>
                  <div>Contraseña: <code className="bg-background px-1 rounded">admin</code></div>
                </div>
              </div>
            )}
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