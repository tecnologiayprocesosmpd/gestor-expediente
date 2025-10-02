import type { CitaAgenda, FechaCitacion } from '@/types/agenda';

const AGENDA_STORAGE_KEY = 'agenda_citas';
const FECHAS_CITACION_KEY = 'fechas_citacion';

// Utilidades para manejar citas de agenda
export const agendaStorage = {
  // Obtener todas las citas
  getCitas(): CitaAgenda[] {
    const stored = localStorage.getItem(AGENDA_STORAGE_KEY);
    if (!stored) return [];
    
    const citas = JSON.parse(stored);
    return citas.map((cita: any) => ({
      ...cita,
      fechaInicio: new Date(cita.fechaInicio),
      fechaFin: cita.fechaFin ? new Date(cita.fechaFin) : undefined,
      createdAt: new Date(cita.createdAt),
      updatedAt: new Date(cita.updatedAt)
    }));
  },

  // Guardar cita
  saveCita(cita: Omit<CitaAgenda, 'id' | 'createdAt' | 'updatedAt'>): CitaAgenda {
    const citas = this.getCitas();
    const newCita: CitaAgenda = {
      ...cita,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    citas.push(newCita);
    localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(citas));
    return newCita;
  },

  // Actualizar cita
  updateCita(id: string, updates: Partial<CitaAgenda>): CitaAgenda | null {
    const citas = this.getCitas();
    const index = citas.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    citas[index] = {
      ...citas[index],
      ...updates,
      updatedAt: new Date()
    };
    
    localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(citas));
    return citas[index];
  },

  // Eliminar cita
  deleteCita(id: string): boolean {
    const citas = this.getCitas();
    const filtered = citas.filter(c => c.id !== id);
    
    if (filtered.length === citas.length) return false;
    
    localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Obtener citas por expediente
  getCitasByExpedient(expedientId: string): CitaAgenda[] {
    return this.getCitas().filter(cita => cita.expedientId === expedientId);
  },

  // Obtener citas por rango de fechas
  getCitasByDateRange(fechaInicio: Date, fechaFin: Date): CitaAgenda[] {
    return this.getCitas().filter(cita => {
      const inicio = new Date(cita.fechaInicio);
      return inicio >= fechaInicio && inicio <= fechaFin;
    });
  }
};

// Utilidades para fechas de citación en expedientes/actuaciones
export const fechasCitacionStorage = {
  // Obtener fechas de citación
  getFechasCitacion(): FechaCitacion[] {
    const stored = localStorage.getItem(FECHAS_CITACION_KEY);
    if (!stored) return [];
    
    const fechas = JSON.parse(stored);
    return fechas.map((fecha: any) => ({
      ...fecha,
      fecha: new Date(fecha.fecha),
      createdAt: new Date(fecha.createdAt)
    }));
  },

  // Guardar fecha de citación
  saveFechaCitacion(fecha: Omit<FechaCitacion, 'id' | 'createdAt'>): FechaCitacion {
    const fechas = this.getFechasCitacion();
    const newFecha: FechaCitacion = {
      ...fecha,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    fechas.push(newFecha);
    localStorage.setItem(FECHAS_CITACION_KEY, JSON.stringify(fechas));
    
    // Crear automáticamente una cita en la agenda
    agendaStorage.saveCita({
      titulo: `Citación - ${fecha.descripcion}`,
      descripcion: fecha.descripcion,
      fechaInicio: fecha.fecha,
      expedientId: fecha.expedientId,
      actuacionId: fecha.actuacionId,
      tipo: fecha.tipo as any,
      estado: 'programado',
      createdBy: 'system'
    });
    
    return newFecha;
  },

  // Obtener fechas por expediente
  getFechasByExpedient(expedientId: string): FechaCitacion[] {
    return this.getFechasCitacion().filter(fecha => fecha.expedientId === expedientId);
  },

  // Marcar fecha como completada
  completarFecha(id: string): boolean {
    const fechas = this.getFechasCitacion();
    const fecha = fechas.find(f => f.id === id);
    
    if (!fecha) return false;
    
    fecha.completada = true;
    localStorage.setItem(FECHAS_CITACION_KEY, JSON.stringify(fechas));
    
    // Actualizar cita relacionada
    const citas = agendaStorage.getCitas();
    const citaRelacionada = citas.find(c => 
      c.expedientId === fecha.expedientId && 
      c.actuacionId === fecha.actuacionId
    );
    
    if (citaRelacionada) {
      agendaStorage.updateCita(citaRelacionada.id, { estado: 'completada' });
    }
    
    return true;
  }
};