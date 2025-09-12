import React from 'react';
import { useSecurity } from '@/contexts/SecurityContext';
import { AuthenticationFlow } from '@/components/AuthenticationFlow';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { user, hasPermission, hasRole, isLoading } = useSecurity();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <AuthenticationFlow />;
  }

  // Check role permission
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-4xl mb-4">🚫</div>
            <h2 className="text-lg font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-4">
              No tiene los permisos necesarios para acceder a esta sección.
            </p>
            <p className="text-sm text-muted-foreground">
              Rol requerido: <code className="bg-muted px-1 rounded">{requiredRole}</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-4xl mb-4">🚫</div>
            <h2 className="text-lg font-semibold mb-2">Permiso Insuficiente</h2>
            <p className="text-muted-foreground mb-4">
              No tiene el permiso necesario para realizar esta acción.
            </p>
            <p className="text-sm text-muted-foreground">
              Permiso requerido: <code className="bg-muted px-1 rounded">{requiredPermission}</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}