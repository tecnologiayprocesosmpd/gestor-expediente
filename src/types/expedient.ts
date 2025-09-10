export interface Expedient {
  id: string;
  number: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string;
  status: 'draft' | 'active' | 'closed' | 'archived' | 'derivado';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  actuaciones?: string[]; // IDs de actuaciones asociadas
  derivaciones?: string[]; // IDs de derivaciones
  archived?: boolean;
  archivedAt?: Date;
  archivedBy?: string;
}

export interface ExpedientSummary {
  id: string;
  number: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string;
  status: 'draft' | 'active' | 'closed' | 'archived' | 'derivado';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actuacionesCount?: number;
  derivacionesCount?: number;
}