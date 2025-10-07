import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Plus, 
  Download,
  Upload,
  ArrowLeft,
  FileCheck,
  X,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from 'jspdf';

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
}

interface ExpedientOficioViewProps {
  expedientId: string;
  expedientNumber: string;
  expedientTitle: string;
  onBack: () => void;
}

export function ExpedientOficioView({ 
  expedientId, 
  expedientNumber, 
  expedientTitle,
  onBack 
}: ExpedientOficioViewProps) {
  const [oficios, setOficios] = useState<OficioItem[]>([]);
  const [showDestinatarioForm, setShowDestinatarioForm] = useState(false);
  const [destinatario, setDestinatario] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [showOficioDetails, setShowOficioDetails] = useState(false);
  const [selectedOficio, setSelectedOficio] = useState<OficioItem | null>(null);
  const [responsePdfFile, setResponsePdfFile] = useState<File | null>(null);

  // Cargar oficios desde localStorage filtrados por expediente
  useEffect(() => {
    const savedOficios = localStorage.getItem('oficios');
    if (savedOficios) {
      try {
        const parsed = JSON.parse(savedOficios);
        const expedientOficios = parsed
          .filter((o: any) => o.expedientId === expedientId)
          .map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt),
            finishedAt: o.finishedAt ? new Date(o.finishedAt) : undefined
          }));
        setOficios(expedientOficios);
      } catch (error) {
        console.error('Error loading oficios:', error);
      }
    }
  }, [expedientId]);

  // Guardar oficios en localStorage
  const saveOficios = (newOficio: OficioItem) => {
    const savedOficios = localStorage.getItem('oficios');
    let allOficios = [];
    
    if (savedOficios) {
      try {
        allOficios = JSON.parse(savedOficios);
      } catch (error) {
        console.error('Error parsing oficios:', error);
      }
    }
    
    allOficios.push(newOficio);
    localStorage.setItem('oficios', JSON.stringify(allOficios));
    
    // Actualizar lista local
    setOficios(prev => [...prev, newOficio]);
  };

  const updateOficio = (updatedOficio: OficioItem) => {
    const savedOficios = localStorage.getItem('oficios');
    if (savedOficios) {
      try {
        let allOficios = JSON.parse(savedOficios);
        allOficios = allOficios.map((o: OficioItem) => 
          o.id === updatedOficio.id ? updatedOficio : o
        );
        localStorage.setItem('oficios', JSON.stringify(allOficios));
        
        // Actualizar lista local
        setOficios(prev => prev.map(o => o.id === updatedOficio.id ? updatedOficio : o));
      } catch (error) {
        console.error('Error updating oficio:', error);
      }
    }
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

    const newOficio: OficioItem = {
      id: crypto.randomUUID(),
      expedientId,
      expedientNumber,
      expedientTitle,
      destinatario: trimmedDestinatario,
      createdAt: new Date(),
      pdfAttached: !!pdfFile,
      pdfFileName: pdfFile?.name
    };

    saveOficios(newOficio);

    // Reset form
    setDestinatario('');
    setShowDestinatarioForm(false);
    setPdfFile(null);

    toast.success('Oficio creado exitosamente');
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
    if (selectedOficio && responsePdfFile) {
      const updatedOficio = {
        ...selectedOficio,
        finished: true,
        finishedAt: new Date(),
        responsePdfAttached: true,
        responsePdfFileName: responsePdfFile.name
      };

      updateOficio(updatedOficio);
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

  // Separar oficios activos y finalizados
  const activeOficios = oficios.filter(o => !o.finished);
  const finishedOficios = oficios.filter(o => o.finished);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Expediente
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Oficios del Expediente</h2>
          <p className="text-sm text-muted-foreground">{expedientNumber} - {expedientTitle}</p>
        </div>
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
            onClick={() => setShowDestinatarioForm(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Oficio para este Expediente
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
              <p>No hay oficios activos para este expediente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOficios.map((oficio) => (
                <div key={oficio.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{oficio.expedientNumber}</h3>
                      <p className="text-sm text-muted-foreground">{oficio.expedientTitle}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">
                          Destinatario: {oficio.destinatario}
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
                    <Button 
                      onClick={() => handleSelectOficio(oficio)}
                      size="sm"
                      variant="default"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      VER
                    </Button>
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
                        <Badge variant="secondary">
                          Destinatario: {oficio.destinatario}
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

      {/* Dialog para crear oficio */}
      <Dialog open={showDestinatarioForm} onOpenChange={setShowDestinatarioForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Oficio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatario *</Label>
              <Input
                id="destinatario"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder="Ingrese el destinatario del oficio"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {destinatario.length}/200 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf-upload">PDF Adjunto (Opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="flex-1"
                />
                {pdfFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPdfFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {pdfFile && (
                <p className="text-xs text-muted-foreground">
                  Archivo seleccionado: {pdfFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
              <Button onClick={handleCreateOficio}>
                Crear Oficio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles del oficio y agregar respuesta */}
      <Dialog open={showOficioDetails} onOpenChange={setShowOficioDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Oficio</DialogTitle>
          </DialogHeader>
          {selectedOficio && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Expediente</Label>
                    <p className="text-sm text-muted-foreground">{selectedOficio.expedientNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Destinatario</Label>
                    <p className="text-sm text-muted-foreground">{selectedOficio.destinatario}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Creación</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(selectedOficio.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  {selectedOficio.pdfAttached && (
                    <div>
                      <Label className="text-sm font-medium">PDF Adjunto</Label>
                      <p className="text-sm text-muted-foreground">{selectedOficio.pdfFileName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="response-pdf">Adjuntar PDF de Respuesta *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="response-pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleResponsePdfUpload}
                    className="flex-1"
                  />
                  {responsePdfFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResponsePdfFile(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {responsePdfFile && (
                  <p className="text-xs text-muted-foreground">
                    Archivo seleccionado: {responsePdfFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOficioDetails(false);
                    setSelectedOficio(null);
                    setResponsePdfFile(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleFinishOficio}
                  disabled={!responsePdfFile}
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
