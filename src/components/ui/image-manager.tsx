import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, Upload, FlipHorizontal, FlipVertical, RotateCw } from 'lucide-react';

interface ImageManagerProps {
  editor: any;
}

export function ImageManager({ editor }: ImageManagerProps) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [width, setWidth] = useState<number>(300);
  
  // Image editing states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState(100);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setScale(100);
  };

  const applyFilters = () => {
    if (!canvasRef.current || !imageRef.current || !imagePreview) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      (flipH ? -1 : 1) * (scale / 100),
      (flipV ? -1 : 1) * (scale / 100)
    );
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();
  };

  useEffect(() => {
    if (imagePreview) {
      applyFilters();
    }
  }, [brightness, contrast, saturation, rotation, flipH, flipV, scale, imagePreview]);

  const getImageStyle = () => {
    let style = `width: ${width}px; height: auto;`;
    
    if (alignment === 'left') {
      style += ' float: left; margin-right: 1rem; margin-bottom: 0.5rem;';
    } else if (alignment === 'right') {
      style += ' float: right; margin-left: 1rem; margin-bottom: 0.5rem;';
    } else {
      style += ' display: block; margin-left: auto; margin-right: auto;';
    }
    
    return style;
  };

  const insertImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setAdvancedImage({
        src: imageUrl,
        alt: 'Imagen insertada',
        style: getImageStyle()
      }).run();
      handleClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertProcessedImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    editor?.chain().focus().setAdvancedImage({
      src: dataUrl,
      alt: selectedFile?.name || 'Imagen editada',
      style: getImageStyle()
    }).run();
    
    handleClose();
  };

  const insertSimpleFile = () => {
    if (!imagePreview) return;

    editor?.chain().focus().setAdvancedImage({
      src: imagePreview,
      alt: selectedFile?.name || 'Imagen',
      style: getImageStyle()
    }).run();
    
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setImageUrl('');
    setSelectedFile(null);
    setImagePreview('');
    setAlignment('center');
    setWidth(300);
    resetFilters();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 hover:bg-muted"
          title="Insertar/Editar imagen"
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Imagen</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Imagen</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="insert" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insert">Insertar</TabsTrigger>
            <TabsTrigger value="edit" disabled={!imagePreview}>Editar</TabsTrigger>
          </TabsList>

          <TabsContent value="insert" className="space-y-4 mt-4">
            {/* Insert from URL */}
            <div className="space-y-2">
              <Label htmlFor="image-url">URL de la imagen</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button onClick={insertImage} disabled={!imageUrl}>
                  Insertar
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O</span>
              </div>
            </div>

            {/* Upload from file */}
            <div className="space-y-2">
              <Label htmlFor="image-file">Subir desde archivo</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="image-file" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Haz clic para seleccionar o arrastra una imagen aquí
                  </p>
                </label>
              </div>

              {imagePreview && (
                <div className="mt-4 space-y-4">
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <img 
                      ref={imageRef}
                      src={imagePreview} 
                      alt="Vista previa" 
                      className="max-h-48 mx-auto rounded"
                      crossOrigin="anonymous"
                    />
                  </div>

                  {/* Image configuration */}
                  <div className="space-y-4">
                    <div>
                      <Label>Alineación</Label>
                      <RadioGroup value={alignment} onValueChange={(value: any) => setAlignment(value)} className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left" id="left" />
                          <Label htmlFor="left">Izquierda</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="center" id="center" />
                          <Label htmlFor="center">Centro</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right" id="right" />
                          <Label htmlFor="right">Derecha</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="width">Ancho (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        min="50"
                        max="1000"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={insertSimpleFile} className="w-full">
                    Insertar Imagen
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4 mt-4">
            {imagePreview && (
              <>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <canvas 
                    ref={canvasRef}
                    className="max-w-full max-h-64 mx-auto rounded"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Brillo: {brightness}%</Label>
                    <Slider
                      value={[brightness]}
                      onValueChange={([value]) => setBrightness(value)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contraste: {contrast}%</Label>
                    <Slider
                      value={[contrast]}
                      onValueChange={([value]) => setContrast(value)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Saturación: {saturation}%</Label>
                    <Slider
                      value={[saturation]}
                      onValueChange={([value]) => setSaturation(value)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Escala: {scale}%</Label>
                    <Slider
                      value={[scale]}
                      onValueChange={([value]) => setScale(value)}
                      min={10}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rotación: {rotation}°</Label>
                    <Slider
                      value={[rotation]}
                      onValueChange={([value]) => setRotation(value)}
                      min={0}
                      max={360}
                      step={1}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setFlipH(!flipH)}
                      className="flex-1"
                    >
                      <FlipHorizontal className="w-4 h-4 mr-2" />
                      Voltear H
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setFlipV(!flipV)}
                      className="flex-1"
                    >
                      <FlipVertical className="w-4 h-4 mr-2" />
                      Voltear V
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setRotation((rotation + 90) % 360)}
                      className="flex-1"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      90°
                    </Button>
                  </div>

                  <Button variant="outline" onClick={resetFilters} className="w-full">
                    Resetear Filtros
                  </Button>

                  <Button onClick={insertProcessedImage} className="w-full">
                    Insertar Imagen Editada
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
