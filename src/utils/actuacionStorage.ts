import { Actuacion } from "@/types/actuacion";

const ACTUACIONES_KEY = 'actuaciones';
const ACTUACIONES_NOTIFICATIONS_KEY = 'actuaciones_notifications';

export interface ActuacionNotification {
  id: string;
  actuacionId: string;
  expedientId: string;
  title: string;
  previousStatus: string;
  newStatus: string;
  createdAt: Date;
  read: boolean;
}

class ActuacionStorage {
  getActuaciones(): Actuacion[] {
    try {
      const data = localStorage.getItem(ACTUACIONES_KEY);
      if (!data) return [];
      
      const actuaciones = JSON.parse(data);
      return actuaciones.map((actuacion: any) => ({
        ...actuacion,
        createdAt: new Date(actuacion.createdAt),
        updatedAt: new Date(actuacion.updatedAt),
        signedAt: actuacion.signedAt ? new Date(actuacion.signedAt) : undefined,
        observaciones: actuacion.observaciones?.map((obs: any) => ({
          ...obs,
          fechaCreacion: new Date(obs.fechaCreacion),
          fechaResolucion: obs.fechaResolucion ? new Date(obs.fechaResolucion) : undefined
        })) || []
      }));
    } catch (error) {
      console.error('Error loading actuaciones:', error);
      return [];
    }
  }

  saveActuacion(actuacion: Actuacion): void {
    try {
      const actuaciones = this.getActuaciones();
      const existingIndex = actuaciones.findIndex(a => a.id === actuacion.id);
      let statusChanged = false;
      let oldStatus = '';
      
      if (existingIndex >= 0) {
        oldStatus = actuaciones[existingIndex].status;
        
        // Si el estado cambia a firmado, registrar quién firmó
        if (actuacion.status === 'firmado' && oldStatus !== 'firmado') {
          actuacion.signedAt = new Date();
          // signedBy debe ser establecido por quien hace la firma
        }
        
        actuaciones[existingIndex] = actuacion;
        statusChanged = oldStatus !== actuacion.status;
        
        // Crear notificación si cambió de borrador a para-firmar
        if (oldStatus === 'borrador' && actuacion.status === 'para-firmar') {
          this.createStatusChangeNotification(actuacion, oldStatus, 'para-firmar');
        }
      } else {
        actuaciones.push(actuacion);
        statusChanged = true;
      }
      
      localStorage.setItem(ACTUACIONES_KEY, JSON.stringify(actuaciones));
      
      // Actualizar fecha de última actividad del expediente
      this.updateExpedientLastActivity(actuacion.expedientId);
      
      // Emitir evento personalizado para notificar cambios
      if (statusChanged) {
        this.emitActuacionChangeEvent(actuacion, oldStatus);
      }
    } catch (error) {
      console.error('Error saving actuacion:', error);
    }
  }

  private updateExpedientLastActivity(expedientId: string): void {
    try {
      const storedExpedients = localStorage.getItem('expedients');
      if (!storedExpedients) return;

      const expedients = JSON.parse(storedExpedients);
      const updatedExpedients = expedients.map((exp: any) => {
        if (exp.id === expedientId) {
          return {
            ...exp,
            fechaUltimaActividad: new Date().toISOString()
          };
        }
        return exp;
      });

      localStorage.setItem('expedients', JSON.stringify(updatedExpedients));
    } catch (error) {
      console.error('Error updating expedient last activity:', error);
    }
  }

  private emitActuacionChangeEvent(actuacion: Actuacion, oldStatus: string): void {
    const event = new CustomEvent('actuacionStatusChanged', {
      detail: {
        actuacion,
        oldStatus,
        newStatus: actuacion.status,
        timestamp: new Date()
      }
    });
    window.dispatchEvent(event);
  }

  deleteActuacion(id: string): void {
    try {
      const actuaciones = this.getActuaciones();
      const filtered = actuaciones.filter(a => a.id !== id);
      localStorage.setItem(ACTUACIONES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting actuacion:', error);
    }
  }

  getActuacionesByExpedient(expedientId: string): Actuacion[] {
    return this.getActuaciones().filter(a => a.expedientId === expedientId);
  }

  getActuacionesParaFirma(): Actuacion[] {
    return this.getActuaciones().filter(a => a.status === 'para-firmar');
  }

  private createStatusChangeNotification(actuacion: Actuacion, oldStatus: string, newStatus: string): void {
    const notification: ActuacionNotification = {
      id: `notif_${actuacion.id}_${Date.now()}`,
      actuacionId: actuacion.id,
      expedientId: actuacion.expedientId,
      title: `Actuación "${actuacion.title}" lista para firma`,
      previousStatus: oldStatus,
      newStatus: newStatus,
      createdAt: new Date(),
      read: false
    };

    const notifications = this.getNotifications();
    notifications.unshift(notification); // Agregar al inicio
    
    // Mantener solo las últimas 10 notificaciones
    if (notifications.length > 10) {
      notifications.splice(10);
    }
    
    localStorage.setItem(ACTUACIONES_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  getNotifications(): ActuacionNotification[] {
    try {
      const data = localStorage.getItem(ACTUACIONES_NOTIFICATIONS_KEY);
      if (!data) return [];
      
      const notifications = JSON.parse(data);
      return notifications.map((notif: any) => ({
        ...notif,
        createdAt: new Date(notif.createdAt)
      }));
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  getUnreadNotifications(): ActuacionNotification[] {
    return this.getNotifications().filter(n => !n.read);
  }

  markNotificationAsRead(id: string): void {
    try {
      const notifications = this.getNotifications();
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        localStorage.setItem(ACTUACIONES_NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  markAllNotificationsAsRead(): void {
    try {
      const notifications = this.getNotifications();
      notifications.forEach(n => n.read = true);
      localStorage.setItem(ACTUACIONES_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }
}

export const actuacionStorage = new ActuacionStorage();