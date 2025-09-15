import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Image, 
  Upload, 
  RotateCw, 
  Move, 
  Crop, 
  Palette,
  ZoomIn,
  ZoomOut,
  FlipHorizontal,
  FlipVertical,
  Settings
} from "lucide-react";

interface ImageEditProps {
  editor: any;
}

export function ImageEdit({ editor }: ImageEditProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [rotation, setRotation] = useState([0]);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [scale, setScale] = useState([100]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const resetFilters = () => {
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
    setRotation([0]);
    setFlipH(false);
    setFlipV(false);
    setScale([100]);
  };

  const applyFilters = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Aplicar transformaciones
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Rotación
    ctx.rotate((rotation[0] * Math.PI) / 180);
    
    // Escala y volteo
    const scaleX = (flipH ? -1 : 1) * (scale[0] / 100);
    const scaleY = (flipV ? -1 : 1) * (scale[0] / 100);
    ctx.scale(scaleX, scaleY);
    
    // Filtros CSS
    ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`;
    
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();
  };

  useEffect(() => {
    if (imagePreview) {
      applyFilters();
    }
  }, [brightness, contrast, saturation, rotation, flipH, flipV, scale, imagePreview]);

  const insertImageFromUrl = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ 
        src: imageUrl,
        alt: 'Imagen insertada',
        title: 'Imagen'
      }).run();
      setImageUrl('');
      setIsOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertProcessedImage = () => {
    if (!canvasRef.current) return;
    
    const processedImageUrl = canvasRef.current.toDataURL('image/png', 0.9);
    editor.chain().focus().setImage({ 
      src: processedImageUrl,
      alt: 'Imagen editada',
      title: 'Imagen editada'
    }).run();
    
    setIsOpen(false);
    resetFilters();
    setSelectedImage(null);
    setImagePreview('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insertar y editar imagen" className="h-8 w-8 p-0 hover:bg-muted">
          <Image className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Insertar y Editar Imagen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Método 1: URL */}
          <div className="space-y-2">
            <Label htmlFor="image-url">URL de la imagen</Label>
            <div className="flex gap-2">
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="flex-1"
              />
              <Button onClick={insertImageFromUrl} variant="outline">
                Insertar
              </Button>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground">
            ó
          </div>
          
          {/* Método 2: Subir y editar archivo */}
          <div className="space-y-4">
            <Label htmlFor="image-file">Subir y editar archivo</Label>
            <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <label htmlFor="image-file" className="cursor-pointer">
                <input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Haz clic para subir una imagen y editarla
                  </p>
                </div>
              </label>
            </div>

            {/* Editor de imagen */}
            {imagePreview && (
              <div className="space-y-4">
                <Separator />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vista previa */}
                  <div className="space-y-2">
                    <Label>Vista previa</Label>
                    <div className="border rounded-lg overflow-hidden bg-gray-50">
                      <img 
                        ref={imageRef}
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full h-auto max-h-64 mx-auto block"
                        onLoad={applyFilters}
                      />
                      <canvas 
                        ref={canvasRef}
                        className="max-w-full h-auto max-h-64 mx-auto block"
                        style={{ display: imagePreview ? 'block' : 'none' }}
                      />
                    </div>
                  </div>

                  {/* Controles de edición */}
                  <div className="space-y-4">
                    <Label>Controles de edición</Label>
                    
                    {/* Brillo */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Brillo</Label>
                        <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
                      </div>
                      <Slider
                        value={brightness}
                        onValueChange={setBrightness}
                        min={0}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Contraste */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Contraste</Label>
                        <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
                      </div>
                      <Slider
                        value={contrast}
                        onValueChange={setContrast}
                        min={0}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Saturación */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Saturación</Label>
                        <span className="text-xs text-muted-foreground">{saturation[0]}%</span>
                      </div>
                      <Slider
                        value={saturation}
                        onValueChange={setSaturation}
                        min={0}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Escala */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Escala</Label>
                        <span className="text-xs text-muted-foreground">{scale[0]}%</span>
                      </div>
                      <Slider
                        value={scale}
                        onValueChange={setScale}
                        min={10}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Rotación */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Rotación</Label>
                        <span className="text-xs text-muted-foreground">{rotation[0]}°</span>
                      </div>
                      <Slider
                        value={rotation}
                        onValueChange={setRotation}
                        min={-180}
                        max={180}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Voltear */}
                    <div className="flex gap-2">
                      <Button
                        variant={flipH ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFlipH(!flipH)}
                        className="flex-1"
                      >
                        <FlipHorizontal className="w-4 h-4 mr-1" />
                        Horizontal
                      </Button>
                      <Button
                        variant={flipV ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFlipV(!flipV)}
                        className="flex-1"
                      >
                        <FlipVertical className="w-4 h-4 mr-1" />
                        Vertical
                      </Button>
                    </div>

                    {/* Resetear */}
                    <Button variant="outline" onClick={resetFilters} className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Resetear Filtros
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          {imagePreview && (
            <Button onClick={insertProcessedImage}>
              Insertar Imagen Editada
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}