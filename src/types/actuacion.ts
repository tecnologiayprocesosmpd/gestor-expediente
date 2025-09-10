export interface Actuacion {
  id: string;
  expedientId: string;
  number: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'borrador' | 'para-firmar' | 'firmado';
  signedAt?: Date;
  signedBy?: string;
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