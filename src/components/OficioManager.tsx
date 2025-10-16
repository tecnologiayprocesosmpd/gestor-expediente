import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Plus, 
  Download, 
  Upload,
  CheckSquare,
  Square,
  ArrowLeft,
  FileCheck,
  X
} from "lucide-react";
import { ExpedientSummary } from "@/types/expedient";
import { Actuacion } from "@/types/actuacion";
import { actuacionStorage } from "@/utils/actuacionStorage";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from 'jspdf';
import { usePagination } from "@/hooks/usePagination";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface OficioManagerProps {
  expedients: ExpedientSummary[];
  onBack: () => void;
}

interface OficioItem {
  id: string;
  expedientId: string;
  expedientNumber: string;
  expedientTitle: string;
  destinatario: string;
  createdAt: Date;
  pdfAttached?: boolean;
  pdfFileName?: string;
  finished?: boolean;
  finishedAt?: Date;
  responsePdfAttached?: boolean;
  responsePdfFileName?: string;
  responseDescription?: string;
}

const getExpedientStatusBadge = (status: 'draft' | 'en_tramite' | 'paralizado' | 'archivado') => {
  const statusConfig = {
    draft: {
      className: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]',
      label: 'Borrador'
    },
    en_tramite: {
      className: 'bg-[hsl(var(--status-en-tramite))] text-[hsl(var(--status-en-tramite-foreground))] border-[hsl(var(--status-en-tramite))]',
      label: 'En Trámite'
    },
    paralizado: {
      className: 'bg-amber-500 text-white border-amber-500',
      label: 'Paralizado'
    },
    archivado: {
      className: 'bg-[hsl(var(--status-archivado))] text-[hsl(var(--status-archivado-foreground))] border-[hsl(var(--status-archivado))]',
      label: 'Archivado'
    }
  };

  const config = statusConfig[status] || statusConfig.draft;
  return <Badge className={config.className}>{config.label}</Badge>;
};

export function OficioManager({ expedients, onBack }: OficioManagerProps) {
  const [oficios, setOficios] = useState<OficioItem[]>([]);
  const [showExpedientSelector, setShowExpedientSelector] = useState(false);
  const [selectedExpedientId, setSelectedExpedientId] = useState<string>('');
  const [showDestinatarioForm, setShowDestinatarioForm] = useState(false);
  const [destinatario, setDestinatario] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showOficioDetails, setShowOficioDetails] = useState(false);
  const [selectedOficio, setSelectedOficio] = useState<OficioItem | null>(null);
  const [responsePdfFile, setResponsePdfFile] = useState<File | null>(null);
  
  // Estados para filtrado de expedientes
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>(['en_tramite', 'paralizado', 'archivado']);
  const [filterTipoTramite, setFilterTipoTramite] = useState<string>('todos');
  
  // Estados para filtrado de oficios
  const [filterActivosDestinatario, setFilterActivosDestinatario] = useState('');
  const [filterFinalizadosDestinatario, setFilterFinalizadosDestinatario] = useState('');
  const [responseDescription, setResponseDescription] = useState('');

  // Cargar oficios desde localStorage
  useEffect(() => {
    const savedOficios = localStorage.getItem('oficios');
    if (savedOficios) {
      try {
        const parsed = JSON.parse(savedOficios);
        setOficios(parsed.map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt)
        })));
      } catch (error) {
        console.error('Error loading oficios:', error);
      }
    }
  }, []);

  // Guardar oficios en localStorage
  const saveOficios = (newOficios: OficioItem[]) => {
    localStorage.setItem('oficios', JSON.stringify(newOficios));
    setOficios(newOficios);
  };

  const handleSelectExpedient = (expedientId: string) => {
    setSelectedExpedientId(expedientId);
    setShowExpedientSelector(false);
    setShowDestinatarioForm(true);
  };

  const handleCreateOficio = () => {
    const trimmedDestinatario = destinatario.trim();
    
    if (!trimmedDestinatario || trimmedDestinatario.length === 0) {
      toast.error('El destinatario es obligatorio');
      return;
    }

    if (trimmedDestinatario.length > 200) {
      toast.error('El destinatario no puede exceder 200 caracteres');
      return;
    }

    if (selectedExpedientId) {
      const expedient = expedients.find(e => e.id === selectedExpedientId);
      if (!expedient) return;

      const newOficio: OficioItem = {
        id: crypto.randomUUID(),
        expedientId: selectedExpedientId,
        expedientNumber: expedient.number,
        expedientTitle: expedient.title,
        destinatario: trimmedDestinatario,
        createdAt: new Date(),
        pdfAttached: !!pdfFile,
        pdfFileName: pdfFile?.name
      };

      const updatedOficios = [...oficios, newOficio];
      saveOficios(updatedOficios);

      // Reset form
      setSelectedExpedientId('');
      setDestinatario('');
      setShowDestinatarioForm(false);
      setPdfFile(null);

      toast.success('Oficio creado exitosamente');
    }
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      toast.success(`PDF "${file.name}" adjuntado correctamente`);
    } else {
      toast.error('Por favor selecciona un archivo PDF válido');
    }
  };

  const handleResponsePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResponsePdfFile(file);
      toast.success(`PDF de respuesta "${file.name}" adjuntado correctamente`);
    } else {
      toast.error('Por favor selecciona un archivo PDF válido');
    }
  };

  const handleExportToPdf = (oficio: OficioItem) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('OFICIO', 20, 30);
    
    // Información del expediente
    doc.setFontSize(14);
    doc.text(`Expediente: ${oficio.expedientNumber}`, 20, 50);
    doc.setFontSize(12);
    doc.text(oficio.expedientTitle, 20, 65);
    doc.text(`Destinatario: ${oficio.destinatario}`, 20, 80);
    doc.text(`Fecha de creación: ${format(oficio.createdAt, "dd 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })}`, 20, 95);
    
    if (oficio.pdfAttached) {
      doc.text(`PDF adjunto: ${oficio.pdfFileName}`, 20, 110);
    }
    
    if (oficio.finished && oficio.finishedAt) {
      doc.text(`Fecha de regreso: ${format(oficio.finishedAt, "dd 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })}`, 20, 125);
      if (oficio.responsePdfAttached) {
        doc.text(`PDF de respuesta: ${oficio.responsePdfFileName}`, 20, 140);
      }
    }
    
    // Descargar PDF
    doc.save(`Oficio_${oficio.expedientNumber}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success('Oficio exportado como PDF');
  };

  const handleFinishOficio = () => {
    if (selectedOficio) {
      const updatedOficio = {
        ...selectedOficio,
        finished: true,
        finishedAt: new Date(),
        responsePdfAttached: !!responsePdfFile,
        responsePdfFileName: responsePdfFile?.name,
        responseDescription: responseDescription
      };

      const updatedOficios = oficios.map(o => 
        o.id === selectedOficio.id ? updatedOficio : o
      );
      
      saveOficios(updatedOficios);
      setShowOficioDetails(false);
      setSelectedOficio(null);
      setResponsePdfFile(null);
      setResponseDescription('');
      
      toast.success('Oficio finalizado exitosamente');
    }
  };

  const handleSelectOficio = (oficio: OficioItem) => {
    if (oficio.finished) return;
    setSelectedOficio(oficio);
    setShowOficioDetails(true);
  };

  // Filtrar expedientes disponibles
  const filteredExpedients = expedients.filter(exp => {
    // Filtro por status
    if (!filterStatus.includes(exp.status)) return false;
    
    // Filtro por tipo de trámite
    if (filterTipoTramite !== 'todos' && filterTipoTramite !== '' && exp.tipoTramite !== filterTipoTramite) return false;
    
    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        exp.number.toLowerCase().includes(search) ||
        exp.title.toLowerCase().includes(search) ||
        exp.tipoTramite.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  // Obtener tipos de trámite únicos
  const uniqueTipoTramites = Array.from(new Set(expedients.map(e => e.tipoTramite)));

  // Separar oficios activos y finalizados con filtrado
  const activeOficios = oficios
    .filter(o => !o.finished)
    .filter(o => !filterActivosDestinatario || o.destinatario.toLowerCase().includes(filterActivosDestinatario.toLowerCase()));
  
  const finishedOficios = oficios
    .filter(o => o.finished)
    .filter(o => !filterFinalizadosDestinatario || o.destinatario.toLowerCase().includes(filterFinalizadosDestinatario.toLowerCase()));

  // Pagination for Oficios Activos
  const {
    currentPage: currentPageActivos,
    totalPages: totalPagesActivos,
    paginatedItems: paginatedActiveOficios,
    goToPage: goToPageActivos,
    nextPage: nextPageActivos,
    previousPage: previousPageActivos,
    canGoNext: canGoNextActivos,
    canGoPrevious: canGoPreviousActivos,
  } = usePagination({ items: activeOficios, itemsPerPage: 5 });

  // Pagination for Oficios Finalizados
  const {
    currentPage: currentPageFinalizados,
    totalPages: totalPagesFinalizados,
    paginatedItems: paginatedFinishedOficios,
    goToPage: goToPageFinalizados,
    nextPage: nextPageFinalizados,
    previousPage: previousPageFinalizados,
    canGoNext: canGoNextFinalizados,
    canGoPrevious: canGoPreviousFinalizados,
  } = usePagination({ items: finishedOficios, itemsPerPage: 5 });

  const handlePrintOficio = (oficio: OficioItem) => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>OFICIO</h1>
        <hr>
        <h2>Expediente: ${oficio.expedientNumber}</h2>
        <h3>${oficio.expedientTitle}</h3>
        <p><strong>Destinatario:</strong> ${oficio.destinatario}</p>
        <p><strong>Fecha de creación:</strong> ${format(oficio.createdAt, "dd 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })}</p>
        ${oficio.pdfAttached ? `<p><strong>PDF adjunto:</strong> ${oficio.pdfFileName}</p>` : ''}
        ${oficio.finished && oficio.finishedAt ? `
          <hr>
          <h3>Información de Regreso:</h3>
          <p><strong>Fecha de regreso:</strong> ${format(oficio.finishedAt, "dd 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })}</p>
          ${oficio.responsePdfAttached ? `<p><strong>PDF de respuesta:</strong> ${oficio.responsePdfFileName}</p>` : ''}
        ` : ''}
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Oficio - ${oficio.expedientNumber}</title>
            <style>
              body { margin: 0; padding: 0; }
              @media print {
                body { font-size: 12px; }
                h1 { font-size: 24px; }
                h2 { font-size: 20px; }
                h3 { font-size: 16px; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Gestión de Oficios</h1>
      </div>

      {/* Botón para crear nuevo oficio */}
      <div className="flex justify-start">
        <Button 
          onClick={() => setShowExpedientSelector(true)}
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Oficio
        </Button>
      </div>

      {/* Lista de oficios activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Oficios Activos ({activeOficios.length})
            </div>
            <Input
              placeholder="Filtrar por destinatario..."
              value={filterActivosDestinatario}
              onChange={(e) => setFilterActivosDestinatario(e.target.value)}
              className="max-w-xs"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeOficios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay oficios activos</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedActiveOficios.map((oficio) => (
                <div 
                  key={oficio.id} 
                  className="border rounded-lg p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSelectOficio(oficio)}
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{oficio.expedientTitle}</h3>
                      <div className="flex gap-2 flex-wrap mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {oficio.destinatario}
                        </Badge>
                        {oficio.pdfAttached && (
                          <Badge variant="outline" className="text-xs">PDF</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {format(oficio.createdAt, "dd/MM/yyyy", { locale: es })}
                      </p>
                      <Badge variant="default" className="text-xs mt-1">Activo</Badge>
                    </div>
                  </div>
                </div>
                ))}
              </div>

              {/* Pagination for Oficios Activos */}
              {totalPagesActivos > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={previousPageActivos}
                          className={!canGoPreviousActivos ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPagesActivos }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPageActivos(page)}
                            isActive={currentPageActivos === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={nextPageActivos}
                          className={!canGoNextActivos ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista de oficios finalizados */}
      {finishedOficios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Oficios Finalizados ({finishedOficios.length})
              </div>
              <Input
                placeholder="Filtrar por destinatario..."
                value={filterFinalizadosDestinatario}
                onChange={(e) => setFilterFinalizadosDestinatario(e.target.value)}
                className="max-w-xs"
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <>
              <div className="space-y-2">
                {paginatedFinishedOficios.map((oficio) => (
                <div key={oficio.id} className="border rounded-lg p-2 bg-muted/30">
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{oficio.expedientTitle}</h3>
                      <div className="flex gap-2 flex-wrap mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {oficio.destinatario}
                        </Badge>
                        {oficio.pdfAttached && (
                          <Badge variant="outline" className="text-xs">PDF</Badge>
                        )}
                        {oficio.responsePdfAttached && (
                          <Badge variant="outline" className="text-xs">PDF respuesta</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span>Finalizado: {format(oficio.finishedAt!, "dd/MM/yyyy", { locale: es })}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleExportToPdf(oficio)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                ))}
              </div>

              {/* Pagination for Oficios Finalizados */}
              {totalPagesFinalizados > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={previousPageFinalizados}
                          className={!canGoPreviousFinalizados ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPagesFinalizados }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => goToPageFinalizados(page)}
                            isActive={currentPageFinalizados === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={nextPageFinalizados}
                          className={!canGoNextFinalizados ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          </CardContent>
        </Card>
      )}

      {/* Dialog para seleccionar expediente */}
      <Dialog open={showExpedientSelector} onOpenChange={setShowExpedientSelector}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Seleccionar Expediente para Oficio</DialogTitle>
          </DialogHeader>
          
          {/* Filtros */}
          <div className="space-y-4 border-b pb-4 flex-shrink-0">
            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                Buscar expediente
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar por número, título o tipo de trámite..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtro por Estado */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'en_tramite', label: 'En Trámite' },
                  { value: 'paralizado', label: 'Paralizado' },
                  { value: 'archivado', label: 'Archivado' }
                ].map(status => (
                  <Button
                    key={status.value}
                    variant={filterStatus.includes(status.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilterStatus(prev => 
                        prev.includes(status.value)
                          ? prev.filter(s => s !== status.value)
                          : [...prev, status.value]
                      );
                    }}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtro por Tipo de Trámite */}
            {uniqueTipoTramites.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de Trámite</Label>
                <Select value={filterTipoTramite} onValueChange={setFilterTipoTramite}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo de trámite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {uniqueTipoTramites.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Contador de resultados */}
            <p className="text-sm text-muted-foreground">
              {filteredExpedients.length} expediente{filteredExpedients.length !== 1 ? 's' : ''} disponible{filteredExpedients.length !== 1 ? 's' : ''}
            </p>
          </div>

          <ScrollArea className="flex-1 overflow-auto">
            <div className="space-y-2 pr-4">
              {filteredExpedients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No se encontraron expedientes con los filtros seleccionados</p>
                </div>
              ) : (
                filteredExpedients.map((expedient) => (
                  <div
                    key={expedient.id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSelectExpedient(expedient.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{expedient.number}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{expedient.title}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{expedient.tipoTramite}</Badge>
                          {getExpedientStatusBadge(expedient.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog para ingresar destinatario y crear oficio */}
      <Dialog open={showDestinatarioForm} onOpenChange={setShowDestinatarioForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Oficio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Expediente seleccionado */}
            {selectedExpedientId && (
              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="font-medium">
                  Expediente: {expedients.find(e => e.id === selectedExpedientId)?.number}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {expedients.find(e => e.id === selectedExpedientId)?.title}
                </p>
              </div>
            )}

            {/* Campo de destinatario */}
            <div className="space-y-2">
              <Label htmlFor="destinatario" className="text-sm font-medium">
                Destinatario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="destinatario"
                type="text"
                placeholder="Ingrese el destinatario del oficio"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                maxLength={200}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {destinatario.length}/200 caracteres
              </p>
            </div>

            {/* Fecha de creación (solo informativa) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha de Creación</Label>
              <Input
                type="text"
                value={format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Esta fecha se registrará automáticamente y no puede ser modificada
              </p>
            </div>

            <Separator />

            {/* Adjuntar PDF */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Adjuntar PDF (opcional)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="flex-1"
                />
                {pdfFile && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    {pdfFile.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDestinatarioForm(false);
                  setDestinatario('');
                  setPdfFile(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateOficio}
                disabled={!destinatario.trim()}
              >
                Crear Oficio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para manejar oficio seleccionado */}
      <Dialog open={showOficioDetails} onOpenChange={setShowOficioDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Oficio</DialogTitle>
          </DialogHeader>
          {selectedOficio && (
            <div className="space-y-4">
              {/* Información del oficio */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold text-lg">{selectedOficio.expedientNumber}</h3>
                <p className="text-sm text-muted-foreground">{selectedOficio.expedientTitle}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline">
                    Destinatario: {selectedOficio.destinatario}
                  </Badge>
                  {selectedOficio.pdfAttached && (
                    <Badge variant="secondary">PDF adjunto</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Creado: {format(selectedOficio.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                </p>
              </div>

              <Separator />

              {/* Descripción de respuesta */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Descripción de la Respuesta (opcional)</Label>
                <Input
                  type="text"
                  placeholder="Ingrese una descripción de la respuesta..."
                  value={responseDescription}
                  onChange={(e) => setResponseDescription(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Adjuntar PDF de respuesta */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Adjuntar PDF de Respuesta (opcional)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleResponsePdfUpload}
                    className="flex-1"
                  />
                  {responsePdfFile && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      {responsePdfFile.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowOficioDetails(false);
                  setResponseDescription('');
                  setResponsePdfFile(null);
                }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleFinishOficio}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Finalizar Oficio
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}