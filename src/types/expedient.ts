export interface Expedient {
  id: string;
  number: string; // Formato: SEC-YYYY-NNNNNN
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string; // Secretaría responsable
  status: 'draft' | 'en_tramite' | 'pausado';
  tags: string[];
  
  // Metadatos obligatorios
  tipoTramite: string; // Tipo de proceso/trámite
  referencia?: string; // Referencia externa o interna
  solicitante: string; // Quién solicita el trámite
  numeroExpediente?: string; // Número oficial si difiere del number
  
  // Fechas de estado
  fechaInicio: Date;
  fechaPausa?: Date;
  fechaCierre?: Date;
  fechaArchivo?: Date;
  
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
  
  // Auditoría
  lastAccessedAt?: Date;
  lastAccessedBy?: string;
  modificaciones?: ModificacionExpediente[];
}

export interface ExpedientSummary {
  id: string;
  number: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string;
  status: 'draft' | 'en_tramite' | 'pausado';
  tipoTramite: string;
  solicitante: string;
  confidencial: boolean;
  urgente: boolean;
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