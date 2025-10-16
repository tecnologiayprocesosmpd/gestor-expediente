import { Tramite } from "@/types/tramite";

const STORAGE_KEY = "gestexp_tramites";
const INITIALIZED_KEY = "gestexp_tramites_initialized_v2";

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
  },

  initializeMockData: (): void => {
    // Check if already initialized
    if (localStorage.getItem(INITIALIZED_KEY)) {
      return;
    }

    // Clear any old data
    localStorage.removeItem(STORAGE_KEY);

    // Create mock tramites for testing
    const mockTramites: Tramite[] = [
      {
        id: "t1",
        expedientId: "1",
        numero: "TR-0001",
        referencia: "Solicitud de medida cautelar urgente",
        fechaCreacion: new Date("2024-01-16"),
        createdBy: "Dr. María González",
        finalizado: true
      },
      {
        id: "t2",
        expedientId: "1",
        numero: "TR-0002",
        referencia: "Presentación de prueba documental",
        fechaCreacion: new Date("2024-01-18"),
        createdBy: "Dr. María González",
        finalizado: false
      },
      {
        id: "t3",
        expedientId: "3",
        numero: "TR-0001",
        referencia: "Solicitud de dictamen sobre convenio colectivo",
        fechaCreacion: new Date("2024-01-23"),
        createdBy: "Dra. Ana Martínez",
        finalizado: false
      },
      {
        id: "t4",
        expedientId: "5",
        numero: "TR-0001",
        referencia: "Presentación de acuerdo de divorcio",
        fechaCreacion: new Date("2024-01-25"),
        createdBy: "Dra. Laura Pérez",
        finalizado: true
      },
      {
        id: "t5",
        expedientId: "6",
        numero: "TR-0001",
        referencia: "Solicitud de informe técnico ambiental",
        fechaCreacion: new Date("2024-01-27"),
        createdBy: "Dr. Fernando Costa",
        finalizado: false
      }
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTramites));
    localStorage.setItem(INITIALIZED_KEY, "true");
  }
};
