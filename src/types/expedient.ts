export interface Expedient {
  // Campos principales del expediente según API real
  ExpedienteId: string;
  ExpedienteNro: string;
  ExpedienteAnio: number;
  ExpedienteReferencia: string;
  ExpedienteEstado: string;
  ExpedienteFecha: string;
  ExpedienteCuerpos: number;
  ExpedienteActuaciones: number;
  
  // Información de oficina
  OficinaId: string;
  OficinaCodigo: string;
  OficinaDescripcion: string;
  OficinaTipo: string;
  
  // Información de dependencia
  DependenciaId: string;
  DependenciaCodigo: string;
  DependenciaDescripcion: string;
  
  // Información de organismo
  OrganismoId: string;
  OrganismoCodigo: string;
  OrganismoDescripcion: string;
  
  // Oficina actual
  ExpOficinaActual: string;
  
  // Campos adicionales para compatibilidad con el sistema actual
  id?: string;
  number?: string;
  title?: string;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  department?: string;
  status?: 'draft' | 'en_tramite' | 'paralizado' | 'archivado';
  tags?: string[];
  oficina?: string;
  referencia?: string;
  tipoProceso?: 'administrativo' | 'compra';
  tipoTramite?: string;
  solicitante?: string;
  numeroExpediente?: string;
  fechaInicio?: Date;
  fechaPausa?: Date;
  fechaCierre?: Date;
  fechaArchivo?: Date;
  fechaDerivacion?: Date;
  fechaRecepcion?: Date;
  version?: number;
  confidencial?: boolean;
  urgente?: boolean;
  actuaciones?: string[];
  derivaciones?: string[];
  adjuntos?: string[];
  archived?: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  archivoMotivo?: string;
  lastAccessedAt?: Date;
  lastAccessedBy?: string;
  modificaciones?: ModificacionExpediente[];
  derivadoPor?: string;
  recibidoPor?: string;
}

export interface ExpedientSummary {
  id: string;
  number: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string;
  status: 'draft' | 'en_tramite' | 'paralizado' | 'archivado';
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