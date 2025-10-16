import { agendaStorage } from './agendaStorage';

/**
 * Inicializar datos de ejemplo para la agenda
 */
export const initializeMockAgendaData = () => {
  const INITIALIZED_KEY = 'gestexp_agenda_initialized_v1';
  
  // Check if already initialized
  if (localStorage.getItem(INITIALIZED_KEY)) {
    return;
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Cita de hoy - mañana
  agendaStorage.saveCita({
    titulo: 'Audiencia - Caso García',
    descripcion: 'Audiencia preliminar en causa penal',
    fechaInicio: new Date(today.setHours(10, 0, 0, 0)),
    tipo: 'audiencia',
    estado: 'hoy',
    ubicacion: 'Sala 3 - Tribunal Penal',
    participantes: ['Dr. García', 'Fiscal'],
    createdBy: 'Sistema'
  });

  // Cita de hoy - tarde
  agendaStorage.saveCita({
    titulo: 'Reunión con cliente - Divorcio',
    descripcion: 'Reunión para firma de acuerdo de divorcio',
    fechaInicio: new Date(today.setHours(15, 30, 0, 0)),
    tipo: 'reunion',
    estado: 'hoy',
    ubicacion: 'Oficina Defensoría',
    participantes: ['Sra. Pérez'],
    createdBy: 'Sistema'
  });

  // Cita de mañana
  agendaStorage.saveCita({
    titulo: 'Citación judicial',
    descripcion: 'Notificación de citación en causa civil',
    fechaInicio: new Date(tomorrow.setHours(11, 0, 0, 0)),
    tipo: 'citacion',
    estado: 'proximo',
    ubicacion: 'Juzgado Civil N°2',
    participantes: [],
    createdBy: 'Sistema'
  });

  // Vencimiento próxima semana
  agendaStorage.saveCita({
    titulo: 'Vencimiento presentación recurso',
    descripcion: 'Último día para presentar recurso de apelación',
    fechaInicio: new Date(nextWeek.setHours(9, 0, 0, 0)),
    tipo: 'vencimiento',
    estado: 'programado',
    ubicacion: 'Mesa de Entradas',
    participantes: [],
    createdBy: 'Sistema'
  });

  localStorage.setItem(INITIALIZED_KEY, 'true');
  console.log('Mock agenda data initialized');
};
