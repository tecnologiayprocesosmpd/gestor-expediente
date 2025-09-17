export interface Expedient {
  id: string;
  number: string; // Formato: SEC-YYYY-NNNNNN
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string; // Secretaría responsable
  status: 'draft' | 'derivado' | 'recibido' | 'en_tramite' | 'pausado';
  tags: string[];
  
  // Nuevos campos obligatorios para el flujo simplificado
  oficina: string; // Oficina a la que se deriva
  referencia: string; // Descripción de referencia
  tipoProceso: 'administrativo' | 'compra'; // Tipo de proceso
  
  // Metadatos obligatorios
  tipoTramite: string; // Tipo de proceso/trámite
  solicitante: string; // Quién solicita el trámite
  numeroExpediente?: string; // Número oficial si difiere del number
  
  // Fechas de estado y derivación
  fechaInicio: Date;
  fechaPausa?: Date;
  fechaCierre?: Date;
  fechaArchivo?: Date;
  fechaDerivacion?: Date; // Cuando se deriva el expediente
  fechaRecepcion?: Date; // Cuando se recibe el expediente
  
  // Campos de control
  version: number; // Para control de versiones
  confidencial: boolean; // Si contiene información sensible
  urgente: boolean; // Marcador de urgencia
  
  // Relaciones
  actuaciones?: string[]; // IDs de actuaciones asociadas
  derivaciones?: string[]; // IDs de derivaciones
  adjuntos?: string[]; // IDs de archivos adjuntos
  
  // Campos de archivo
  archived?: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  archivoMotivo?: string; // Motivo del archivo
  
  // Auditoría y trazabilidad del flujo
  lastAccessedAt?: Date;
  lastAccessedBy?: string;
  modificaciones?: ModificacionExpediente[];
  derivadoPor?: string; // Usuario que derivó el expediente
  recibidoPor?: string; // Usuario que recibió el expediente
}

export interface ExpedientSummary {
  id: string;
  number: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string;
  status: 'draft' | 'derivado' | 'recibido' | 'en_tramite' | 'pausado';
  tipoTramite: string;
  solicitante: string;
  confidencial: boolean;
  urgente: boolean;
  content: string;        // Contenido del expediente para mostrar extracto
  referencia: string;     // Descripción de referencia
  tipoProceso: 'administrativo' | 'compra'; // Tipo de proceso
  actuacionesCount?: number;
  derivacionesCount?: number;
  adjuntosCount?: number;
  lastActivity?: Date;
}

// Nuevas interfaces para el sistema completo
export interface ModificacionExpediente {
  id: string;
  expedientId: string;
  campo: string;
  valorAnterior: any;
  valorNuevo: any;
  fecha: Date;
  usuario: string;
  motivo?: string;
}

export interface TipoTramite {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  secretaria: string;
  activo: boolean;
  plantillaActuacion?: string; // Template para actuaciones
  camposObligatorios: string[]; // Campos requeridos para este tipo
  flujoAprobacion?: string[]; // Roles que deben aprobar
}

export interface FiltroExpediente {
  searchTerm?: string;
  status?: string[];
  department?: string[];
  tipoTramite?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  createdBy?: string[];
  confidencial?: boolean;
  urgente?: boolean;
}