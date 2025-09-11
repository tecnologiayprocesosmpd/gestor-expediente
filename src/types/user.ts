export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  
  // Información profesional
  cargo: string;
  legajo?: string; // Número de legajo si es empleado
  matricula?: string; // Matrícula profesional si aplica
  
  // Organización
  secretaria: string; // Secretaría a la que pertenece
  departamento?: string;
  oficina?: string;
  
  // Estado y control
  activo: boolean;
  fechaAlta: Date;
  fechaBaja?: Date;
  ultimoLogin?: Date;
  
  // Roles y permisos
  roles: UserRole[];
  permisos: Permission[];
  
  // Configuración personal
  preferencias: UserPreferences;
  
  // Auditoría
  creadoPor: string;
  fechaCreacion: Date;
  modificadoPor?: string;
  fechaModificacion?: Date;
}

export interface UserRole {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  nivel: number; // Nivel jerárquico (1=mayor autoridad)
  secretaria?: string; // Si es específico de una secretaría
  permisos: string[]; // IDs de permisos asociados
  activo: boolean;
}

export interface Permission {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string; // expedientes, legajos, reportes, etc.
  accion: string; // crear, leer, editar, eliminar, firmar, derivar, etc.
  recursos?: string[]; // Recursos específicos afectados
}

export interface UserPreferences {
  tema: 'light' | 'dark' | 'system';
  idioma: string;
  notificaciones: {
    email: boolean;
    push: boolean;
    derivaciones: boolean;
    vencimientos: boolean;
    firmas: boolean;
  };
  dashboard: {
    widgets: string[];
    layout: 'compact' | 'expanded';
  };
  editor: {
    plantillaPorDefecto?: string;
    autoguardado: boolean;
    intervaloAutoguardado: number; // minutos
  };
}

// Roles predefinidos del sistema
export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  SECRETARIO: 'secretario',
  SUBSECRETARIO: 'subsecretario',
  JEFE_DESPACHO: 'jefe-despacho',
  MESA_ENTRADA: 'mesa-entrada',
  LETRADO: 'letrado',
  AUXILIAR: 'auxiliar',
  CONSULTA: 'consulta'
} as const;

// Permisos del sistema
export const PERMISSIONS = {
  // Expedientes
  EXPEDIENTES_CREATE: 'expedientes:crear',
  EXPEDIENTES_READ: 'expedientes:leer',
  EXPEDIENTES_UPDATE: 'expedientes:editar',
  EXPEDIENTES_DELETE: 'expedientes:eliminar',
  EXPEDIENTES_DERIVE: 'expedientes:derivar',
  EXPEDIENTES_ARCHIVE: 'expedientes:archivar',
  EXPEDIENTES_REOPEN: 'expedientes:reabrir',
  
  // Actuaciones
  ACTUACIONES_CREATE: 'actuaciones:crear',
  ACTUACIONES_READ: 'actuaciones:leer',
  ACTUACIONES_UPDATE: 'actuaciones:editar',
  ACTUACIONES_DELETE: 'actuaciones:eliminar',
  ACTUACIONES_SIGN: 'actuaciones:firmar',
  ACTUACIONES_APPROVE: 'actuaciones:aprobar',
  
  // Legajos
  LEGAJOS_CREATE: 'legajos:crear',
  LEGAJOS_READ: 'legajos:leer',
  LEGAJOS_UPDATE: 'legajos:editar',
  LEGAJOS_DELETE: 'legajos:eliminar',
  
  // Reportes
  REPORTES_CREATE: 'reportes:crear',
  REPORTES_READ: 'reportes:leer',
  REPORTES_EXPORT: 'reportes:exportar',
  
  // Administración
  ADMIN_USERS: 'admin:usuarios',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_SYSTEM: 'admin:sistema',
  ADMIN_AUDIT: 'admin:auditoria'
} as const;