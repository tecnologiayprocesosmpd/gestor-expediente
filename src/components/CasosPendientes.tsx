import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Clock, 
  AlertTriangle,
  Mail,
  CreditCard,
  PenTool,
  CheckCircle,
  Search,
  Filter
} from "lucide-react";

interface CasosPendientesProps {
  onViewItem?: (id: string, type: string) => void;
}

export function CasosPendientes({ onViewItem }: CasosPendientesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');

  // Mock data para casos pendientes
  const casosPendientes = {
    expedientes: [
      {
        id: 'exp-001',
        number: 'EXP-2024-006',
        title: 'Amparo contra Resolución Municipal',
        solicitante: 'Rodríguez, Ana María',
        fechaIngreso: new Date('2024-01-28'),
        urgente: true,
        tipo: 'Amparo'
      },
      {
        id: 'exp-002', 
        number: 'EXP-2024-007',
        title: 'Consulta sobre Derechos del Consumidor',
        solicitante: 'González, Pedro Luis',
        fechaIngreso: new Date('2024-01-29'),
        urgente: false,
        tipo: 'Consulta Legal'
      }
    ],
    escritos: [
      {
        id: 'esc-001',
        number: 'ESC-2024-001',
        title: 'Recurso de Apelación - Caso Martínez',
        remitente: 'Dr. Carlos Fernández',
        fechaIngreso: new Date('2024-01-30'),
        expedienteRelacionado: 'EXP-2023-089'
      },
      {
        id: 'esc-002',
        number: 'ESC-2024-002', 
        title: 'Alegatos Finales - Proceso Penal',
        remitente: 'Dra. María Valdez',
        fechaIngreso: new Date('2024-01-30'),
        expedienteRelacionado: 'EXP-2023-156'
      }
    ],
    oficios: [
      {
        id: 'ofi-001',
        number: 'OF-2024-001',
        title: 'Informe Pericial - Caso Civil',
        remitente: 'Juzgado Civil Nº 2',
        fechaIngreso: new Date('2024-01-29'),
        plazoRespuesta: new Date('2024-02-15')
      }
    ],
    pagosJudiciales: [
      {
        id: 'pag-001',
        number: 'PJ-2024-001',
        concepto: 'Honorarios Profesionales - Amparo García',
        monto: 45000,
        beneficiario: 'Dr. Roberto Silva',
        fechaVencimiento: new Date('2024-02-10')
      }
    ],
    actuacionesParaFirmar: [
      {
        id: 'act-firm-001',
        expediente: 'EXP-2024-001',
        titulo: 'Dictamen Legal - Amparo García',
        creador: 'Dr. María González',
        fechaCreacion: new Date('2024-01-28'),
        estado: 'Pendiente Firma'
      }
    ],
    actuacionesParaAgregar: [
      {
        id: 'act-add-001',
        expediente: 'EXP-2024-003',
        titulo: 'Seguimiento Consulta Laboral',
        responsable: 'Dra. Ana Martínez',
        fechaVencimiento: new Date('2024-02-05'),
        prioridad: 'alta'
      }
    ]
  };

  const getUrgencyBadge = (urgente: boolean) => (
    urgente ? (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Urgente
      </Badge>
    ) : null
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Casos Pendientes de Recepción</h1>
          <p className="text-muted-foreground">Gestiona todos los documentos y casos pendientes de procesamiento</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, título o remitente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Button
                variant={selectedFilter === 'todos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('todos')}
              >
                Todos
              </Button>
              <Button
                variant={selectedFilter === 'urgentes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('urgentes')}
              >
                Urgentes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes tipos de casos */}
      <Tabs defaultValue="expedientes" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="expedientes">Expedientes</TabsTrigger>
          <TabsTrigger value="escritos">Escritos</TabsTrigger>
          <TabsTrigger value="oficios">Oficios</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="firmar">Por Firmar</TabsTrigger>
          <TabsTrigger value="agregar">Por Agregar</TabsTrigger>
        </TabsList>

        <TabsContent value="expedientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Expedientes Pendientes ({casosPendientes.expedientes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {casosPendientes.expedientes.map((expediente) => (
                  <div key={expediente.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-primary">{expediente.number}</span>
                          {getUrgencyBadge(expediente.urgente)}
                          <Badge variant="outline">{expediente.tipo}</Badge>
                        </div>
                        <h4 className="font-medium mb-1">{expediente.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Solicitante: {expediente.solicitante}</p>
                          <p>Fecha de ingreso: {expediente.fechaIngreso.toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onViewItem?.(expediente.id, 'expediente')}>
                          Ver Detalle
                        </Button>
                        <Button size="sm" onClick={() => onViewItem?.(expediente.id, 'expediente')}>
                          Procesar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escritos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Escritos Pendientes ({casosPendientes.escritos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {casosPendientes.escritos.map((escrito) => (
                  <div key={escrito.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-primary">{escrito.number}</span>
                          <Badge variant="secondary">Relacionado: {escrito.expedienteRelacionado}</Badge>
                        </div>
                        <h4 className="font-medium mb-1">{escrito.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Remitente: {escrito.remitente}</p>
                          <p>Fecha de ingreso: {escrito.fechaIngreso.toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Documento
                        </Button>
                        <Button size="sm">
                          Vincular
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oficios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Oficios Pendientes ({casosPendientes.oficios.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {casosPendientes.oficios.map((oficio) => (
                  <div key={oficio.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-primary">{oficio.number}</span>
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 mr-1" />
                            Vence: {oficio.plazoRespuesta.toLocaleDateString('es-ES')}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{oficio.title}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Remitente: {oficio.remitente}</p>
                          <p>Fecha de ingreso: {oficio.fechaIngreso.toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Oficio
                        </Button>
                        <Button size="sm">
                          Responder
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pagos Judiciales Pendientes ({casosPendientes.pagosJudiciales.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {casosPendientes.pagosJudiciales.map((pago) => (
                  <div key={pago.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-primary">{pago.number}</span>
                          <Badge variant="secondary" className="text-green-700 bg-green-100">
                            {formatCurrency(pago.monto)}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{pago.concepto}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Beneficiario: {pago.beneficiario}</p>
                          <p>Vencimiento: {pago.fechaVencimiento.toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Detalle
                        </Button>
                        <Button size="sm">
                          Procesar Pago
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firmar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                Actuaciones para Firmar ({casosPendientes.actuacionesParaFirmar.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {casosPendientes.actuacionesParaFirmar.map((actuacion) => (
                  <div key={actuacion.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-primary">{actuacion.expediente}</span>
                          <Badge variant="outline" className="text-orange-700 bg-orange-100">
                            {actuacion.estado}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{actuacion.titulo}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Creado por: {actuacion.creador}</p>
                          <p>Fecha: {actuacion.fechaCreacion.toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Revisar
                        </Button>
                        <Button size="sm">
                          Firmar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agregar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Actuaciones para Agregar ({casosPendientes.actuacionesParaAgregar.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {casosPendientes.actuacionesParaAgregar.map((actuacion) => (
                  <div key={actuacion.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-primary">{actuacion.expediente}</span>
                          <Badge variant={actuacion.prioridad === 'alta' ? 'destructive' : 'secondary'}>
                            {actuacion.prioridad === 'alta' ? 'Alta Prioridad' : 'Normal'}
                          </Badge>
                        </div>
                        <h4 className="font-medium mb-1">{actuacion.titulo}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Responsable: {actuacion.responsable}</p>
                          <p>Vencimiento: {actuacion.fechaVencimiento.toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Ver Detalle
                        </Button>
                        <Button size="sm">
                          Crear Actuación
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}