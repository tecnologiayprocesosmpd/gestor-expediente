import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import SelectProfilePostLogin from '@/components/SelectProfilePostLogin';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ExpedientList } from '@/components/ExpedientList';
import { ExpedientView } from '@/components/ExpedientView';
import { ExpedientEditor } from '@/components/ExpedientEditor';
import { AgendaView } from '@/components/AgendaView';
import { OficioManager } from '@/components/OficioManager';
import { ExpedientSummary, Expedient } from '@/types/expedient';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockExpedients: ExpedientSummary[] = [
  {
    id: '1',
    number: 'EXP-2024-001',
    title: 'Solicitud de Amparo - Caso García',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'Dr. María González',
    department: 'Mesa de Entrada',
      status: 'en_tramite',
    tipoTramite: 'Amparo',
    solicitante: 'García, Juan Carlos',
    confidencial: false,
    urgente: true,
    content: '<p>Solicitud de amparo por vulneración de derechos constitucionales en proceso administrativo sancionador iniciado por la Municipalidad...</p>',
    referencia: 'Amparo contra municipalidad por proceso sancionador irregular',
    tipoProceso: 'administrativo'
  },
  {
    id: '2', 
    number: 'EXP-2024-002',
    title: 'Defensa Penal - Proceso Rodríguez',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    createdBy: 'Dr. Carlos López',
    department: 'Defensoría Penal',
    status: 'draft',
    tipoTramite: 'Defensa Penal',
    solicitante: 'Tribunal Penal Nº 3',
    confidencial: true,
    urgente: false,
    content: '<p>Designación de defensor oficial para el imputado Rodríguez en causa penal por presunto delito contra la integridad sexual...</p>',
    referencia: 'Defensa oficial en causa penal - delito sexual',
    tipoProceso: 'administrativo'
  },
  {
    id: '3',
    number: 'EXP-2024-003', 
    title: 'Consulta Legal - Derechos Laborales',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-25'),
    createdBy: 'Dra. Ana Martínez',
    department: 'Secretaría General',
    status: 'en_tramite',
    tipoTramite: 'Consulta Legal',
    solicitante: 'Sindicato de Trabajadores',
    confidencial: false,
    urgente: false,
    content: '<p>Consulta sobre aplicación de convenio colectivo de trabajo y derechos de trabajadores en situación de despido sin justa causa...</p>',
    referencia: 'Asesoramiento sobre convenio colectivo y despidos',
    tipoProceso: 'administrativo'
  },
  {
    id: '4',
    number: 'EXP-2024-004',
    title: 'Recurso de Inconstitucionalidad - Ley Provincial',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-28'),
    createdBy: 'Dr. Roberto Silva',
    department: 'Mesa de Entrada',
    status: 'pausado',
    tipoTramite: 'Recurso Inconstitucionalidad',
    solicitante: 'Defensor General',
    confidencial: false,
    urgente: false,
    content: '<p>Recurso de inconstitucionalidad contra artículos de la Ley Provincial de Procedimientos Administrativos que vulneran el derecho de defensa...</p>',
    referencia: 'Recurso contra ley provincial por vulnerar debido proceso',
    tipoProceso: 'administrativo'
  },
  {
    id: '5',
    number: 'EXP-2024-005',
    title: 'Asesoramiento Civil - Divorcio',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    createdBy: 'Dra. Laura Pérez',
    department: 'Defensoría Civil',
    status: 'pausado',
    tipoTramite: 'Asesoramiento Civil',
    solicitante: 'Pérez, María Elena',
    confidencial: true,
    urgente: false,
    content: '<p>Asesoramiento legal para divorcio por presentación conjunta y régimen de tenencia compartida de menores de edad...</p>',
    referencia: 'Divorcio por mutuo acuerdo con hijos menores',
    tipoProceso: 'administrativo'
  },
  {
    id: '6',
    number: 'EXP-2024-006',
    title: 'Amparo Colectivo - Medio Ambiente',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
    createdBy: 'Dr. Fernando Costa',
    department: 'Mesa de Entrada',
    status: 'en_tramite',
    tipoTramite: 'Amparo Colectivo',
    solicitante: 'Asociación Ecologista',
    confidencial: false,
    urgente: true,
    content: '<p>Amparo colectivo por daño ambiental causado por empresa minera que contamina fuentes de agua potable en comunidades rurales...</p>',
    referencia: 'Amparo colectivo contra contaminación minera',
    tipoProceso: 'administrativo'
  }
];

function AppContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'dashboard' | 'expedientes' | 'view' | 'editor' | 'agenda' | 'oficios'>('dashboard');
  const [expedients, setExpedients] = useState<ExpedientSummary[]>(mockExpedients);
  const [currentExpedientId, setCurrentExpedientId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [autoCreateActuacion, setAutoCreateActuacion] = useState(false);
  
  // State for managing actuaciones per expedient
  const [expedientActuaciones, setExpedientActuaciones] = useState<Record<string, any[]>>({});
  
  // Get current expedient data
  const getCurrentExpedient = () => {
    if (!currentExpedientId) return null;
    return expedients.find(exp => exp.id === currentExpedientId);
  };

  // If user not set in UserContext yet (post-login), show profile selector dropdown
  if (!user) {
    return <SelectProfilePostLogin />;
  }

  const handleCreateExpedient = () => {
    setCurrentExpedientId(null);
    setCurrentView('editor');
  };

  const handleViewExpedient = (id: string, createActuacion: boolean = false) => {
    setCurrentExpedientId(id);
    setAutoCreateActuacion(createActuacion);
    setCurrentView('view');
  };

  const handleEditExpedient = (id: string) => {
    setCurrentExpedientId(id);
    setCurrentView('editor');
  };

  const handleSaveExpedient = (data: any) => {
    if (currentExpedientId) {
      // Update existing expedient
      setExpedients(prev => prev.map(exp => 
        exp.id === currentExpedientId 
          ? { 
              ...exp, 
              title: data.title || exp.title,
              number: data.number || exp.number,
              status: data.status || exp.status,
              assignedOffice: data.assignedOffice,
              updatedAt: new Date() 
            }
          : exp
      ));
      toast({
        title: "Expediente actualizado",
        description: "Los cambios han sido guardados correctamente",
      });
    } else {
      // Create new expedient
      const newExpedient: ExpedientSummary = {
        id: String(Date.now()),
        number: data.number, // Use the auto-generated number from editor
        title: data.title || 'Sin título',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.name,
        department: user.department || 'Sin departamento',
        status: data.status || 'draft',
        tipoTramite: data.tipoTramite || 'General',
        solicitante: data.solicitante || 'No especificado',
        confidencial: data.confidencial || false,
        urgente: data.urgente || false,
        content: data.content || '<p>Contenido del expediente...</p>',
        referencia: data.referencia || 'Sin referencia especificada',
        tipoProceso: data.tipoProceso || 'administrativo'
      };
      
      setExpedients(prev => [newExpedient, ...prev]);
      setCurrentExpedientId(newExpedient.id);
      
      toast({
        title: "Expediente creado",
        description: `Nuevo expediente ${newExpedient.number} creado exitosamente`,
      });
    }
  };

  const handleSaveActuacion = (data: any) => {
    return new Promise((resolve, reject) => {
      console.log('[Index.handleSaveActuacion] Iniciando guardado de actuación:', data);
      
      if (!currentExpedientId) {
        console.log('[Index.handleSaveActuacion] Error: No hay expediente actual');
        reject(new Error('No hay expediente actual'));
        return;
      }
      
      // Create actuacion - Allow minimal content for drafts
      if (data.status === 'borrador' || (data.title?.trim() && data.content?.length > 20)) {
        const newActuacion = {
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          expedientId: currentExpedientId,
          number: (expedientActuaciones[currentExpedientId]?.length || 0) + 1,
          title: data.title || 'Nueva Actuación',
          content: data.content || '<p>Contenido de la actuación...</p>',
          status: data.status || 'borrador',
          createdBy: user?.name || 'Usuario',
          createdAt: new Date(),
          updatedAt: new Date(),
          tipo: data.tipo || 'nota',
          confidencial: data.confidencial || false,
          urgente: data.urgente || false,
          version: 1
        };

        console.log('[Index.handleSaveActuacion] Nueva actuación creada:', newActuacion);

        setExpedientActuaciones(prev => {
          const updated = {
            ...prev,
            [currentExpedientId]: [...(prev[currentExpedientId] || []), newActuacion]
          };
          console.log('[Index.handleSaveActuacion] Estado actualizado:', updated);
          return updated;
        });
        
        toast({
          title: "Actuación agregada",
          description: "La nueva actuación ha sido guardada correctamente",
        });

        // Use setTimeout to ensure state update is processed
        setTimeout(() => {
          console.log('[Index.handleSaveActuacion] Resolviendo promesa');
          resolve(newActuacion);
        }, 100);
      } else {
        console.log('[Index.handleSaveActuacion] Error: Título requerido o contenido insuficiente para actuaciones no borrador');
        reject(new Error('Para guardar una actuación se requiere título. Para actuaciones que no sean borradores, se requiere contenido mínimo.'));
      }
    });
  };

  const handleBackFromEditor = () => {
    setCurrentExpedientId(null);
    setAutoCreateActuacion(false);
    setCurrentView('dashboard');
  };

  // Dashboard button handlers
  const handleNavigateToExpedients = () => {
    setCurrentView('expedientes');
  };

  const handleNavigateToActuaciones = () => {
    // No action needed - removed casos-pendientes
  };

  const handleCreateActuacion = () => {
    // Navigate to create actuacion view
    setCurrentExpedientId(null);
    setCurrentView('editor');
  };

  const handleFilterExpedients = (status: string) => {
    setStatusFilter(status);
  };

  const handleNavigateToOficios = () => {
    setCurrentView('oficios');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            expedients={expedients}
            onCreateExpedient={handleCreateExpedient}
            onViewExpedient={handleViewExpedient}
            onEditExpedient={handleEditExpedient}
            onNavigateToExpedients={handleNavigateToExpedients}
            onCreateActuacion={handleCreateActuacion}
            onFilterExpedients={handleFilterExpedients}
            onNavigateToOficios={handleNavigateToOficios}
          />
        );
      case 'expedientes':
        return (
          <ExpedientList
            expedients={expedients}
            onViewExpedient={handleViewExpedient}
            onEditExpedient={handleEditExpedient}
            onCreateExpedient={handleCreateExpedient}
            initialStatusFilter={statusFilter}
          />
        );
      case 'view':
        return (
          <ExpedientView
            expedientId={currentExpedientId || undefined}
            expedient={getCurrentExpedient()}
            actuaciones={expedientActuaciones[currentExpedientId || ''] || []}
            onBack={handleBackFromEditor}
            onSaveActuacion={handleSaveActuacion}
            onUpdateActuaciones={(updatedActuaciones) => {
              if (currentExpedientId) {
                setExpedientActuaciones(prev => ({
                  ...prev,
                  [currentExpedientId]: updatedActuaciones
                }));
              }
            }}
            autoCreateActuacion={autoCreateActuacion}
          />
        );
      case 'editor':
        return (
          <ExpedientEditor
            expedientId={currentExpedientId || undefined}
            expedient={getCurrentExpedient()}
            onBack={handleBackFromEditor}
            onSave={handleSaveExpedient}
          />
        );
      case 'agenda':
        return (
          <AgendaView 
            onNavigateToExpedient={(expedientId) => {
              setCurrentExpedientId(expedientId);
              setCurrentView('view');
            }}
          />
        );
      case 'oficios':
        return (
          <OficioManager
            expedients={expedients}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      onCreateExpedient={handleCreateExpedient}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default function Index() {
  return <AppContent />;
};