export interface Actuacion {
  id: string;
  expedientId: string;
  number: number; // Número secuencial dentro del expediente
  title: string;
  content: string; // Contenido HTML del editor
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'borrador' | 'revision' | 'para-firmar' | 'firmado' | 'observado';
  
  // Firma digital
  signedAt?: Date;
  signedBy?: string;
  firmaDigital?: FirmaDigital;
  
  // Metadatos adicionales
  tipo: 'resolucion' | 'providencia' | 'nota' | 'dictamen' | 'decreto' | 'auto';
  confidencial: boolean;
  urgente: boolean;
  
  // Plantilla y formato
  plantilla?: string; // ID de plantilla utilizada
  formatoSalida?: 'pdf' | 'docx' | 'html';
  
  // Adjuntos y referencias
  adjuntos?: string[]; // IDs de archivos adjuntos
  referenciaExterna?: string;
  
  // Control de versiones
  version: number;
  versionAnterior?: string; // ID de versión anterior
  
  // Observaciones y revisiones
  observaciones?: Observacion[];
  requiereRevision: boolean;
  revisadoPor?: string;
  fechaRevision?: Date;
  
  // Auditoría
  modificaciones?: ModificacionActuacion[];
}

export interface FirmaDigital {
  certificado: string; // Certificado digital utilizado
  hash: string; // Hash del documento firmado
  timestamp: Date; // Timestamp de la firma
  algoritmo: string; // Algoritmo de firma (ej: SHA-256 with RSA)
  cadenaConfianza: string[]; // Cadena de certificados
  valida: boolean; // Estado de validez de la firma
  motivoInvalidez?: string;
}

export interface Observacion {
  id: string;
  actuacionId: string;
  contenido: string;
  fechaCreacion: Date;
  creadoPor: string;
  resuelta: boolean;
  fechaResolucion?: Date;
  respuesta?: string;
}

export interface ModificacionActuacion {
  id: string;
  actuacionId: string;
  campo: string;
  valorAnterior: any;
  valorNuevo: any;
  fecha: Date;
  usuario: string;
  motivo?: string;
}

export interface Derivacion {
  id: string;
  expedientId: string;
  fromDepartment: string;
  toDepartment: string;
  type: 'completa' | 'parcial';
  actuacionesIncluidas?: string[]; // IDs de actuaciones para derivación parcial
  observations?: string;
  createdAt: Date;
  createdBy: string;
  status: 'pendiente' | 'recibida' | 'rechazada';
}