import { useEffect } from 'react';
import { differenceInMonths } from 'date-fns';

export function useAutoArchive() {
  useEffect(() => {
    const checkAndArchiveInactiveExpedients = () => {
      try {
        const storedExpedients = localStorage.getItem('expedients');
        if (!storedExpedients) return;

        const expedients = JSON.parse(storedExpedients);
        let hasChanges = false;

        const updatedExpedients = expedients.map((expedient: any) => {
          // Solo procesar expedientes que no estén archivados
          if (expedient.status === 'archivado') {
            return expedient;
          }

          // Determinar la fecha de última actividad
          const fechaUltimaActividad = expedient.fechaUltimaActividad 
            ? new Date(expedient.fechaUltimaActividad)
            : new Date(expedient.updatedAt || expedient.createdAt);

          // Verificar si han pasado 6 meses desde la última actividad
          const mesesInactivo = differenceInMonths(new Date(), fechaUltimaActividad);

          if (mesesInactivo >= 6) {
            hasChanges = true;
            return {
              ...expedient,
              status: 'archivado',
              archivedAt: new Date().toISOString(),
              archivedBy: 'Sistema',
              archivoMotivo: 'Archivo automático por inactividad de 6 meses',
              motivoCambioEstado: 'Archivo automático: El expediente no ha tenido actividad durante 6 meses o más.',
              fechaArchivo: new Date().toISOString()
            };
          }

          return expedient;
        });

        // Solo actualizar localStorage si hubo cambios
        if (hasChanges) {
          localStorage.setItem('expedients', JSON.stringify(updatedExpedients));
          console.log('Expedientes archivados automáticamente por inactividad');
        }
      } catch (error) {
        console.error('Error al verificar expedientes inactivos:', error);
      }
    };

    // Ejecutar la verificación inmediatamente al montar
    checkAndArchiveInactiveExpedients();

    // Verificar una vez al día (cada 24 horas)
    const intervalId = setInterval(checkAndArchiveInactiveExpedients, 24 * 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);
}
