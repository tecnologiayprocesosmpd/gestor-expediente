import { Tramite } from "@/types/tramite";

const STORAGE_KEY = "gestexp_tramites";

export const tramiteStorage = {
  getAll: (): Tramite[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const tramites = JSON.parse(data);
    return tramites.map((t: any) => ({
      ...t,
      fechaCreacion: new Date(t.fechaCreacion),
      finalizado: t.finalizado ?? false // default to false for existing records
    }));
  },

  getByExpedientId: (expedientId: string): Tramite[] => {
    return tramiteStorage.getAll().filter(t => t.expedientId === expedientId);
  },

  save: (tramite: Tramite): void => {
    const tramites = tramiteStorage.getAll();
    const index = tramites.findIndex(t => t.id === tramite.id);
    
    if (index >= 0) {
      tramites[index] = tramite;
    } else {
      tramites.push(tramite);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tramites));
  },

  delete: (id: string): void => {
    const tramites = tramiteStorage.getAll().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tramites));
  },

  generateNumber: (expedientId: string): string => {
    const tramites = tramiteStorage.getByExpedientId(expedientId);
    const nextNumber = tramites.length + 1;
    return `TR-${nextNumber.toString().padStart(4, '0')}`;
  }
};
