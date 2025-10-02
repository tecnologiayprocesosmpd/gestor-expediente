export interface CitaAgenda {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  expedientId?: string; // Relación con expediente
  actuacionId?: string; // Relación con actuación específica
  tipo: 'audiencia' | 'citacion' | 'reunion' | 'vencimiento' | 'otro';
  estado: 'programado' | 'proximo' | 'hoy' | 'completada';
  participantes?: string[];
  ubicacion?: string;
  observaciones?: string;
  recordatorio?: {
    tiempo: number; // minutos antes
    enviado: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FechaCitacion {
  id: string;
  fecha: Date;
  tipo: 'audiencia' | 'presentacion' | 'vencimiento' | 'otro';
  descripcion: string;
  expedientId: string;
  actuacionId?: string;
  completada: boolean;
  createdAt: Date;
}

export interface AgendaView {
  tipo: 'dia' | 'semana' | 'mes';
  fecha: Date;
}

export interface AgendaFilter {
  tipo?: string[];
  estado?: string[];
  expedientId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}