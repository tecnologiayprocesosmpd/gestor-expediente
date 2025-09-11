export interface SecurityContext {
  user: string; // User ID
  roles: string[];
  permissions: string[];
  secretaria: string;
  departamento?: string;
  nivel: number; // Nivel de autoridad (1=máximo)
}

export interface AccessControl {
  recurso: string; // expediente, actuacion, legajo, etc.
  accion: string; // read, write, delete, sign, etc.
  condiciones?: AccessCondition[];
}

export interface AccessCondition {
  campo: string;
  operador: 'eq' | 'ne' | 'in' | 'contains' | 'gt' | 'lt';
  valor: any;
  logica?: 'AND' | 'OR';
}

export interface AuditLog {
  id: string;
  fecha: Date;
  usuario: string;
  accion: string;
  recurso: string;
  recursoId: string;
  detalles: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  resultado: 'exito' | 'fallo' | 'denegado';
  error?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  activa: boolean;
}

// Políticas de seguridad
export const SECURITY_POLICIES = {
  PASSWORD: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxAge: 90, // días
    historyCount: 5 // no reutilizar últimas 5
  },
  SESSION: {
    maxDuration: 8, // horas
    inactivityTimeout: 30, // minutos
    maxConcurrentSessions: 3
  },
  ACCESS: {
    maxFailedAttempts: 5,
    lockoutDuration: 30, // minutos
    requireMFA: false // por ahora
  }
} as const;