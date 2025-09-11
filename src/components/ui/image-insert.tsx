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
import { Image, Upload } from "lucide-react";

interface ImageInsertProps {
  editor: any;
}

export function ImageInsert({ editor }: ImageInsertProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const insertImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setIsOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        editor.chain().focus().setImage({ src: result }).run();
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Insertar imagen">
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
            <Button onClick={insertImage} className="w-full">
              Insertar desde URL
            </Button>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}