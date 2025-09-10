export interface EmpleadoLegajo {
  id: string;
  dni: string;
  apellido: string;
  nombre: string;
  email: string;
  telefono?: string;
  fechaIngreso: Date;
  cargo: string;
  departamento: string;
  estado: 'activo' | 'licencia' | 'suspendido' | 'cesante';
  designaciones: Designacion[];
  licencias: Licencia[];
  sanciones: Sancion[];
  historialClinico: HistorialClinico[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Designacion {
  id: string;
  empleadoId: string;
  cargo: string;
  departamento: string;
  fechaInicio: Date;
  fechaFin?: Date;
  resolucion: string;
  observaciones?: string;
  estado: 'vigente' | 'finalizada';
}

export interface Licencia {
  id: string;
  empleadoId: string;
  tipo: 'medica' | 'administrativa' | 'estudio' | 'maternidad' | 'paternidad' | 'vacaciones';
  fechaInicio: Date;
  fechaFin: Date;
  diagnostico?: string;
  certificadoMedico?: string;
  observaciones?: string;
  estado: 'solicitada' | 'aprobada' | 'rechazada' | 'finalizada';
  aprobadaPor?: string;
  fechaAprobacion?: Date;
}

export interface Sancion {
  id: string;
  empleadoId: string;
  tipo: 'llamado-atencion' | 'apercibimiento' | 'suspension' | 'cesantia';
  motivo: string;
  fechaSancion: Date;
  dias?: number; // Para suspensiones
  resolucion: string;
  observaciones?: string;
  estado: 'vigente' | 'cumplida' | 'anulada';
}

export interface HistorialClinico {
  id: string;
  empleadoId: string;
  fecha: Date;
  tipo: 'examen-ingreso' | 'examen-periodico' | 'accidente-trabajo' | 'enfermedad-profesional';
  diagnostico?: string;
  recomendaciones?: string;
  medico: string;
  centroMedico: string;
  observaciones?: string;
}