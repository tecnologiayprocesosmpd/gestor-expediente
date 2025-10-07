import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Plus, 
  Download, 
  Upload,
  ArrowLeft,
  FileCheck,
  Eye,
  Printer
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [destinatario, setDestinatario] = useState('');
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
  const saveOficios = (newOficios: OficioItem[]) => {
    const savedOficios = localStorage.getItem('oficios');
    let allOficios: OficioItem[] = [];
    
    if (savedOficios) {
      try {
        allOficios = JSON.parse(savedOficios);
      } catch (error) {
        console.error('Error parsing oficios:', error);
      }
    }

    // Reemplazar oficios de este expediente
    const otherOficios = allOficios.filter((o: any) => o.expedientId !== expedientId);
    const updatedAllOficios = [...otherOficios, ...newOficios];
    
    localStorage.setItem('oficios', JSON.stringify(updatedAllOficios));
    setOficios(newOficios);
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

    const updatedOficios = [...oficios, newOficio];
    saveOficios(updatedOficios);

    // Reset form
    setDestinatario('');
    setShowCreateForm(false);
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
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Expediente
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Oficios del Expediente</h1>
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
            onClick={() => setShowCreateForm(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Oficio
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
                    <div className="space-y-2">
                      <h3 className="font-semibold">{oficio.expedientNumber}</h3>
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
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handlePrintOficio(oficio)}
                        size="sm"
                        variant="outline"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => handleExportToPdf(oficio)}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear oficio */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Oficio</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destinatario" className="text-sm font-medium">
                Destinatario *
              </Label>
              <Input
                id="destinatario"
                type="text"
                placeholder="Ingrese el destinatario del oficio..."
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                maxLength={200}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {destinatario.length}/200 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf-upload" className="text-sm font-medium">
                Adjuntar PDF (opcional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {pdfFile ? pdfFile.name : 'Seleccionar PDF'}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setDestinatario('');
                  setPdfFile(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateOficio}
                disabled={!destinatario.trim()}
                className="flex-1"
              >
                Crear Oficio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para detalles del oficio activo */}
      <Dialog open={showOficioDetails} onOpenChange={setShowOficioDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Oficio</DialogTitle>
          </DialogHeader>
          
          {selectedOficio && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Expediente</Label>
                  <p className="text-sm">{selectedOficio.expedientNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Destinatario</Label>
                  <p className="text-sm">{selectedOficio.destinatario}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Creación</Label>
                  <p className="text-sm">{format(selectedOficio.createdAt, "dd/MM/yyyy HH:mm", { locale: es })}</p>
                </div>
                {selectedOficio.pdfAttached && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">PDF Adjunto</Label>
                    <p className="text-sm">{selectedOficio.pdfFileName}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="response-pdf" className="text-sm font-medium">
                  Adjuntar PDF de Respuesta *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="response-pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleResponsePdfUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('response-pdf')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {responsePdfFile ? responsePdfFile.name : 'Seleccionar PDF de Respuesta'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Es necesario adjuntar un PDF de respuesta para finalizar el oficio
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowOficioDetails(false);
                    setSelectedOficio(null);
                    setResponsePdfFile(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleFinishOficio}
                  disabled={!responsePdfFile}
                  className="flex-1"
                >
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
