import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import SelectProfilePostLogin from '@/components/SelectProfilePostLogin';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ExpedientList } from '@/components/ExpedientList';
import { ExpedientView } from '@/components/ExpedientView';
import { ExpedientEditor } from '@/components/ExpedientEditor';
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
    urgente: true
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
    urgente: false
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
    urgente: false
  },
  {
    id: '4',
    number: 'EXP-2024-004',
    title: 'Recurso de Inconstitucionalidad - Ley Provincial',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-28'),
    createdBy: 'Dr. Roberto Silva',
    department: 'Mesa de Entrada',
    status: 'archivado',
    tipoTramite: 'Recurso Inconstitucionalidad',
    solicitante: 'Defensor General',
    confidencial: false,
    urgente: false
  },
  {
    id: '5',
    number: 'EXP-2024-005',
    title: 'Asesoramiento Civil - Divorcio',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    createdBy: 'Dra. Laura Pérez',
    department: 'Defensoría Civil',
    status: 'draft',
    tipoTramite: 'Asesoramiento Civil',
    solicitante: 'Pérez, María Elena',
    confidencial: true,
    urgente: false
  }
];

function AppContent() {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'dashboard' | 'expedientes' | 'view' | 'editor' | 'agenda'>('dashboard');
  const [expedients, setExpedients] = useState<ExpedientSummary[]>(mockExpedients);
  const [currentExpedientId, setCurrentExpedientId] = useState<string | null>(null);
  
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

  const handleViewExpedient = (id: string) => {
    setCurrentExpedientId(id);
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
        number: data.number || `EXP-2024-${String(expedients.length + 1).padStart(3, '0')}`,
        title: data.title || 'Sin título',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.name,
        department: user.department || 'Sin departamento',
        status: data.status || 'draft',
        tipoTramite: data.tipoTramite || 'General',
        solicitante: data.solicitante || 'No especificado',
        confidencial: data.confidencial || false,
        urgente: data.urgente || false
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
    if (!currentExpedientId) return;
    
    const newActuacion = {
      id: String(Date.now()),
      expedientId: currentExpedientId,
      number: (expedientActuaciones[currentExpedientId]?.length || 0) + 1,
      title: data.title || 'Nueva Actuación',
      content: data.content || '<p>Contenido de la actuación...</p>',
      status: 'borrador' as const,
      createdBy: user?.name || 'Usuario',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setExpedientActuaciones(prev => ({
      ...prev,
      [currentExpedientId]: [newActuacion, ...(prev[currentExpedientId] || [])]
    }));
    
    toast({
      title: "Actuación agregada",
      description: "La nueva actuación ha sido guardada correctamente",
    });
  };

  const handleBackFromEditor = () => {
    setCurrentExpedientId(null);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            expedients={expedients}
            onCreateExpedient={user.role === 'mesa' ? handleCreateExpedient : undefined}
            onViewExpedient={handleViewExpedient}
            onEditExpedient={user.role === 'mesa' ? handleEditExpedient : undefined}
          />
        );
      case 'expedientes':
        return (
          <ExpedientList
            expedients={expedients}
            onViewExpedient={handleViewExpedient}
            onEditExpedient={user.role === 'mesa' ? handleEditExpedient : undefined}
            onCreateExpedient={user.role === 'mesa' ? handleCreateExpedient : undefined}
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
          />
        );
      case 'editor':
        return (
          <ExpedientEditor
            expedientId={currentExpedientId || undefined}
            expedient={getCurrentExpedient()}
            onBack={handleBackFromEditor}
            onSave={user?.role === 'oficina' ? handleSaveActuacion : handleSaveExpedient}
          />
        );
      case 'agenda':
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Sección de Agenda próximamente</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      onCreateExpedient={user.role === 'mesa' ? handleCreateExpedient : undefined}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default function Index() {
  return <AppContent />;
};