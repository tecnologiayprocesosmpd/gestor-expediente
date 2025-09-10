export interface Reporte {
  id: string;
  tipo: 'expedientes' | 'legajos' | 'actuaciones' | 'derivaciones';
  titulo: string;
  descripcion: string;
  parametros: ReporteParametros;
  createdAt: Date;
  createdBy: string;
  datos?: any[];
}

export interface ReporteParametros {
  fechaInicio?: Date;
  fechaFin?: Date;
  departamento?: string;
  empleado?: string;
  tipoTramite?: string;
  estado?: string;
  prioridad?: string;
}

export interface EstadisticaExpedientes {
  totalExpedientes: number;
  expedientesPorEstado: { estado: string; cantidad: number }[];
  expedientesPorPrioridad: { prioridad: string; cantidad: number }[];
  expedientesPorDepartamento: { departamento: string; cantidad: number }[];
  tendenciaMensual: { mes: string; cantidad: number }[];
}

export interface EstadisticaLegajos {
  totalEmpleados: number;
  empleadosPorDepartamento: { departamento: string; cantidad: number }[];
  empleadosPorEstado: { estado: string; cantidad: number }[];
  licenciasPorTipo: { tipo: string; cantidad: number }[];
  sancionesPorTipo: { tipo: string; cantidad: number }[];
}