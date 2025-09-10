export interface Expedient {
  id: string;
  number: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string;
  status: 'draft' | 'active' | 'closed';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface ExpedientSummary {
  id: string;
  number: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  department: string;
  status: 'draft' | 'active' | 'closed';
  priority: 'low' | 'medium' | 'high';
}