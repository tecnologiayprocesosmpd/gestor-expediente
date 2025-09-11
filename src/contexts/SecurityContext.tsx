import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission, PERMISSIONS } from '@/types/user';
import { SecurityContext as ISecurityContext, AccessControl } from '@/types/security';

interface SecurityContextType {
  user: User | null;
  securityContext: ISecurityContext | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string, resource?: any) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (accessControl: AccessControl, resource?: any) => boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [securityContext, setSecurityContext] = useState<ISecurityContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar
    checkActiveSession();
  }, []);

  const checkActiveSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Aquí iría la validación del token con el backend
        // Por ahora simulamos una verificación
        await validateToken(token);
      }
    } catch (error) {
      console.error('Error validating session:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async (token: string) => {
    // Simulación - en producción esto sería una llamada al backend
    // const response = await api.validateToken(token);
    // setUser(response.user);
    // setSecurityContext(buildSecurityContext(response.user));
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulación de login - en producción sería una llamada al backend
      const mockUser = await authenticateUser(credentials);
      
      if (mockUser) {
        setUser(mockUser);
        setSecurityContext(buildSecurityContext(mockUser));
        localStorage.setItem('auth_token', 'mock_token');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSecurityContext(null);
    localStorage.removeItem('auth_token');
  };

  const buildSecurityContext = (user: User): ISecurityContext => {
    const roles = user.roles.map(r => r.codigo);
    const permissions = user.permisos.map(p => p.codigo);
    const nivel = Math.min(...user.roles.map(r => r.nivel));

    return {
      user: user.id,
      roles,
      permissions,
      secretaria: user.secretaria,
      departamento: user.departamento,
      nivel
    };
  };

  const hasPermission = (permission: string, resource?: any): boolean => {
    if (!securityContext) return false;
    
    // Admin tiene todos los permisos
    if (securityContext.roles.includes('admin')) return true;
    
    // Verificar permiso directo
    if (securityContext.permissions.includes(permission)) {
      return checkResourceConstraints(permission, resource);
    }
    
    return false;
  };

  const hasRole = (role: string): boolean => {
    if (!securityContext) return false;
    return securityContext.roles.includes(role);
  };

  const canAccess = (accessControl: AccessControl, resource?: any): boolean => {
    if (!hasPermission(`${accessControl.recurso}:${accessControl.accion}`, resource)) {
      return false;
    }

    // Verificar condiciones adicionales si existen
    if (accessControl.condiciones && resource) {
      return evaluateAccessConditions(accessControl.condiciones, resource);
    }

    return true;
  };

  const checkResourceConstraints = (permission: string, resource?: any): boolean => {
    if (!resource || !securityContext) return true;

    // Reglas específicas por permiso
    switch (permission) {
      case PERMISSIONS.EXPEDIENTES_UPDATE:
        // Solo puede editar expedientes de su secretaría
        return resource.department === securityContext.secretaria;
      
      case PERMISSIONS.EXPEDIENTES_DERIVE:
        // Solo puede derivar si tiene nivel suficiente
        return securityContext.nivel <= 3;
      
      case PERMISSIONS.ACTUACIONES_SIGN:
        // Solo puede firmar actuaciones creadas por él o su departamento
        return resource.createdBy === securityContext.user || 
               resource.department === securityContext.departamento;
      
      default:
        return true;
    }
  };

  const evaluateAccessConditions = (conditions: any[], resource: any): boolean => {
    // Implementar evaluación de condiciones complejas
    return conditions.every(condition => {
      const value = getNestedProperty(resource, condition.campo);
      return evaluateCondition(value, condition.operador, condition.valor);
    });
  };

  const getNestedProperty = (obj: any, path: string): any => {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  };

  const evaluateCondition = (actual: any, operator: string, expected: any): boolean => {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'ne': return actual !== expected;
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'contains': return actual && actual.includes(expected);
      case 'gt': return actual > expected;
      case 'lt': return actual < expected;
      default: return false;
    }
  };

  // Mock authentication function - replace with real API call
  const authenticateUser = async (credentials: LoginCredentials): Promise<User | null> => {
    // Simulación para desarrollo
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      return {
        id: 'user-1',
        username: 'admin',
        email: 'admin@mpd.gov.ar',
        firstName: 'Administrador',
        lastName: 'Sistema',
        dni: '12345678',
        cargo: 'Administrador de Sistema',
        secretaria: 'Administrativa',
        activo: true,
        fechaAlta: new Date(),
        roles: [{
          id: 'role-admin',
          codigo: 'admin',
          nombre: 'Administrador',
          descripcion: 'Acceso completo al sistema',
          nivel: 1,
          permisos: Object.values(PERMISSIONS),
          activo: true
        }],
        permisos: Object.values(PERMISSIONS).map(p => ({
          id: `perm-${p}`,
          codigo: p,
          nombre: p,
          descripcion: `Permiso ${p}`,
          modulo: p.split(':')[0],
          accion: p.split(':')[1]
        })),
        preferencias: {
          tema: 'light' as const,
          idioma: 'es',
          notificaciones: {
            email: true,
            push: true,
            derivaciones: true,
            vencimientos: true,
            firmas: true
          },
          dashboard: {
            widgets: ['expedientes-pendientes', 'actuaciones-firma', 'reportes'],
            layout: 'expanded' as const
          },
          editor: {
            autoguardado: true,
            intervaloAutoguardado: 5
          }
        },
        creadoPor: 'system',
        fechaCreacion: new Date()
      };
    }
    return null;
  };

  return (
    <SecurityContext.Provider value={{
      user,
      securityContext,
      login,
      logout,
      hasPermission,
      hasRole,
      canAccess,
      isLoading
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}