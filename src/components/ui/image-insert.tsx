import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Image, Upload, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface ImageInsertProps {
  editor: any;
}

export function ImageInsert({ editor }: ImageInsertProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'inline'>('center');
  const [width, setWidth] = useState('400');

  const insertImage = () => {
    if (imageUrl) {
      const style = getImageStyle();
      editor.chain().focus().setAdvancedImage({ 
        src: imageUrl,
        style 
      }).run();
      setImageUrl('');
      setIsOpen(false);
    }
  };

  const getImageStyle = () => {
    let style = `width: ${width}px; height: auto;`;
    
    if (alignment === 'left') {
      style += ' float: left; margin-right: 16px; margin-bottom: 8px;';
    } else if (alignment === 'right') {
      style += ' float: right; margin-left: 16px; margin-bottom: 8px;';
    } else if (alignment === 'center') {
      style += ' display: block; margin-left: auto; margin-right: auto;';
    }
    
    return style;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const style = getImageStyle();
        editor.chain().focus().setAdvancedImage({ 
          src: result,
          alt: file.name,
          style 
        }).run();
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insertar imagen" className="h-8 w-8 p-0 hover:bg-muted">
          <Image className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insertar Imagen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">URL de la imagen</Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          
          <div className="text-center text-muted-foreground">
            ó
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image-file">Subir archivo</Label>
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
                    Haz clic para subir una imagen
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="space-y-2">
              <Label>Alineación</Label>
              <RadioGroup value={alignment} onValueChange={(value: any) => setAlignment(value)}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="align-left" />
                    <Label htmlFor="align-left" className="flex items-center gap-1 cursor-pointer">
                      <AlignLeft className="w-4 h-4" />
                      Izquierda
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="align-center" />
                    <Label htmlFor="align-center" className="flex items-center gap-1 cursor-pointer">
                      <AlignCenter className="w-4 h-4" />
                      Centro
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="align-right" />
                    <Label htmlFor="align-right" className="flex items-center gap-1 cursor-pointer">
                      <AlignRight className="w-4 h-4" />
                      Derecha
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-width">Ancho (px)</Label>
              <Input
                id="image-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                min="50"
                max="1200"
              />
            </div>
          </div>

          <Button onClick={insertImage} className="w-full" disabled={!imageUrl}>
            Insertar Imagen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}