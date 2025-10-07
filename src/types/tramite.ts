export interface Tramite {
  id: string;
  expedientId: string;
  numero: string; // autonumérico
  referencia: string;
  fechaCreacion: Date;
  createdBy: string;
  finalizado: boolean; // indica si el trámite ha sido finalizado manualmente
}
