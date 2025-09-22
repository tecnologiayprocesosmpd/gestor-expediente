import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface OficioManagerProps {
  expedients: ExpedientSummary[];
  onBack: () => void;
}

interface OficioItem {
  id: string;
  expedientId: string;
  expedientNumber: string;
  expedientTitle: string;
  selectedActuaciones: string[];
  createdAt: Date;
  pdfAttached?: boolean;
  pdfFileName?: string;
  finished?: boolean;
  finishedAt?: Date;
  responsePdfAttached?: boolean;
  responsePdfFileName?: string;
}

export function OficioManager({ expedients, onBack }: OficioManagerProps) {
  const [oficios, setOficios] = useState<OficioItem[]>([]);
  const [showExpedientSelector, setShowExpedientSelector] = useState(false);
  const [selectedExpedientId, setSelectedExpedientId] = useState<string>('');
  const [expedientActuaciones, setExpedientActuaciones] = useState<Actuacion[]>([]);
  const [selectedActuaciones, setSelectedActuaciones] = useState<string[]>([]);
  const [showActuacionSelector, setShowActuacionSelector] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showOficioDetails, setShowOficioDetails] = useState(false);
  const [selectedOficio, setSelectedOficio] = useState<OficioItem | null>(null);
  const [responsePdfFile, setResponsePdfFile] = useState<File | null>(null);

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
    
    // Cargar actuaciones del expediente
    const actuaciones = actuacionStorage.getActuacionesByExpedient(expedientId);
    setExpedientActuaciones(actuaciones);
    setSelectedActuaciones([]);
    
    setShowExpedientSelector(false);
    setShowActuacionSelector(true);
  };

  const handleToggleActuacion = (actuacionId: string) => {
    setSelectedActuaciones(prev => 
      prev.includes(actuacionId)
        ? prev.filter(id => id !== actuacionId)
        : [...prev, actuacionId]
    );
  };

  const handleSelectAllActuaciones = () => {
    if (selectedActuaciones.length === expedientActuaciones.length) {
      setSelectedActuaciones([]);
    } else {
      setSelectedActuaciones(expedientActuaciones.map(a => a.id));
    }
  };

  const handleCreateOficio = () => {
    if (selectedExpedientId && selectedActuaciones.length > 0) {
      const expedient = expedients.find(e => e.id === selectedExpedientId);
      if (!expedient) return;

      const newOficio: OficioItem = {
        id: crypto.randomUUID(),
        expedientId: selectedExpedientId,
        expedientNumber: expedient.number,
        expedientTitle: expedient.title,
        selectedActuaciones: [...selectedActuaciones],
        createdAt: new Date(),
        pdfAttached: !!pdfFile,
        pdfFileName: pdfFile?.name
      };

      const updatedOficios = [...oficios, newOficio];
      saveOficios(updatedOficios);

      // Reset form
      setSelectedExpedientId('');
      setSelectedActuaciones([]);
      setExpedientActuaciones([]);
      setShowActuacionSelector(false);
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
    const allActuaciones = actuacionStorage.getActuacionesByExpedient(oficio.expedientId);
    const actuaciones = allActuaciones.filter(act => oficio.selectedActuaciones.includes(act.id));
    
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('OFICIO', 20, 30);
    
    // Información del expediente
    doc.setFontSize(14);
    doc.text(`Expediente: ${oficio.expedientNumber}`, 20, 50);
    doc.setFontSize(12);
    doc.text(oficio.expedientTitle, 20, 65);
    doc.text(`Fecha de creación: ${format(oficio.createdAt, "dd 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })}`, 20, 80);
    
    if (oficio.pdfAttached) {
      doc.text(`PDF adjunto: ${oficio.pdfFileName}`, 20, 95);
    }
    
    // Actuaciones
    doc.setFontSize(14);
    doc.text(`Actuaciones incluidas (${actuaciones.length}):`, 20, 110);
    
    let yPosition = 125;
    actuaciones.forEach((actuacion, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${actuacion.title}`, 20, yPosition);
      doc.setFontSize(10);
      doc.text(`Tipo: ${actuacion.tipo} | Estado: ${actuacion.status}`, 20, yPosition + 10);
      doc.text(`Fecha: ${format(actuacion.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}`, 20, yPosition + 20);
      
      yPosition += 35;
    });
    
    // Descargar PDF
    doc.save(`Oficio_${oficio.expedientNumber}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    toast.success('Oficio exportado como PDF');
  };

  const handleFinishOficio = () => {
    if (selectedOficio && responsePdfFile) {
      const updatedOficio = {
        ...selectedOficio,
        finished: true,
        finishedAt: new Date(),
        responsePdfAttached: true,
        responsePdfFileName: responsePdfFile.name
      };

      const updatedOficios = oficios.map(o => 
        o.id === selectedOficio.id ? updatedOficio : o
      );
      
      saveOficios(updatedOficios);
      setShowOficioDetails(false);
      setSelectedOficio(null);
      setResponsePdfFile(null);
      
      toast.success('Oficio finalizado exitosamente');
    }
  };

  const handleSelectOficio = (oficio: OficioItem) => {
    if (oficio.finished) return;
    setSelectedOficio(oficio);
    setShowOficioDetails(true);
  };

  // Separar oficios activos y finalizados
  const activeOficios = oficios.filter(o => !o.finished);
  const finishedOficios = oficios.filter(o => o.finished);

  const handlePrintOficio = (oficio: OficioItem) => {
    // Generar contenido para imprimir
    const allActuaciones = actuacionStorage.getActuacionesByExpedient(oficio.expedientId);
    const actuaciones = allActuaciones.filter(act => oficio.selectedActuaciones.includes(act.id));

    const expedient = expedients.find(e => e.id === oficio.expedientId);

    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>OFICIO</h1>
        <hr>
        <h2>Expediente: ${oficio.expedientNumber}</h2>
        <h3>${oficio.expedientTitle}</h3>
        <p><strong>Fecha de creación:</strong> ${format(oficio.createdAt, "dd 'de' MMMM 'de' yyyy, HH:mm 'hs'", { locale: es })}</p>
        ${oficio.pdfAttached ? `<p><strong>PDF adjunto:</strong> ${oficio.pdfFileName}</p>` : ''}
        <hr>
        <h3>Actuaciones incluidas (${actuaciones.length}):</h3>
        ${actuaciones.map((actuacion, index) => `
          <div style="margin: 20px 0; border: 1px solid #ccc; padding: 15px;">
            <h4>${index + 1}. ${actuacion.title}</h4>
            <p><strong>Tipo:</strong> ${actuacion.tipo}</p>
            <p><strong>Estado:</strong> ${actuacion.status}</p>
            <p><strong>Fecha:</strong> ${format(actuacion.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}</p>
            <div style="margin-top: 10px;">
              ${actuacion.content}
            </div>
          </div>
        `).join('')}
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
          Volver al Inicio
        </Button>
        <h1 className="text-2xl font-bold">Gestión de Oficios</h1>
      </div>

      {/* Botón para crear nuevo oficio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Crear Nuevo Oficio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setShowExpedientSelector(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Seleccionar Expediente para Oficio
          </Button>
        </CardContent>
      </Card>

      {/* Lista de oficios activos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Oficios Activos ({activeOficios.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeOficios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay oficios activos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOficios.map((oficio) => (
                <div key={oficio.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 cursor-pointer" onClick={() => handleSelectOficio(oficio)}>
                      <h3 className="font-semibold">{oficio.expedientNumber}</h3>
                      <p className="text-sm text-muted-foreground">{oficio.expedientTitle}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">
                          {oficio.selectedActuaciones.length} actuaciones
                        </Badge>
                        {oficio.pdfAttached && (
                          <Badge variant="secondary">PDF adjunto</Badge>
                        )}
                        <Badge variant="default">Activo</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Creado: {format(oficio.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleExportToPdf(oficio)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar PDF
                      </Button>
                      <Button 
                        onClick={() => handlePrintOficio(oficio)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Imprimir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de oficios finalizados */}
      {finishedOficios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              Oficios Finalizados ({finishedOficios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {finishedOficios.map((oficio) => (
                <div key={oficio.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{oficio.expedientNumber}</h3>
                      <p className="text-sm text-muted-foreground">{oficio.expedientTitle}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">
                          {oficio.selectedActuaciones.length} actuaciones
                        </Badge>
                        {oficio.pdfAttached && (
                          <Badge variant="secondary">PDF adjunto</Badge>
                        )}
                        {oficio.responsePdfAttached && (
                          <Badge variant="secondary">PDF respuesta</Badge>
                        )}
                        <Badge variant="default" className="bg-green-600">Finalizado</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Creado: {format(oficio.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}</p>
                        {oficio.finishedAt && (
                          <p>Finalizado: {format(oficio.finishedAt, "dd/MM/yyyy HH:mm", { locale: es })}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleExportToPdf(oficio)}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para seleccionar expediente */}
      <Dialog open={showExpedientSelector} onOpenChange={setShowExpedientSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seleccionar Expediente para Oficio</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {expedients.map((expedient) => (
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
                        <Badge variant={expedient.status === 'en_tramite' ? 'default' : 'secondary'}>
                          {expedient.status === 'en_tramite' ? 'En Trámite' : 
                           expedient.status === 'draft' ? 'Borrador' : 'Pausado'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Dialog para seleccionar actuaciones */}
      <Dialog open={showActuacionSelector} onOpenChange={setShowActuacionSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Seleccionar Actuaciones para el Oficio</DialogTitle>
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

            {/* Botón seleccionar todas */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllActuaciones}
              >
                {selectedActuaciones.length === expedientActuaciones.length ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                {selectedActuaciones.length === expedientActuaciones.length ? 'Deseleccionar Todas' : 'Seleccionar Todas'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedActuaciones.length} de {expedientActuaciones.length} seleccionadas
              </span>
            </div>

            {/* Lista de actuaciones */}
            <ScrollArea className="max-h-64">
              <div className="space-y-2">
                {expedientActuaciones.map((actuacion) => (
                  <div key={actuacion.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedActuaciones.includes(actuacion.id)}
                        onCheckedChange={() => handleToggleActuacion(actuacion.id)}
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{actuacion.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {actuacion.tipo} - {actuacion.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(actuacion.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

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
              <Button variant="outline" onClick={() => setShowActuacionSelector(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateOficio}
                disabled={selectedActuaciones.length === 0}
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
                    {selectedOficio.selectedActuaciones.length} actuaciones
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

              {/* Adjuntar PDF de respuesta */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Adjuntar PDF de Respuesta</Label>
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
                <Button variant="outline" onClick={() => setShowOficioDetails(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleFinishOficio}
                  disabled={!responsePdfFile}
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