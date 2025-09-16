import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ data, onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>();
  const isSavingRef = useRef(false);

  const saveData = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;
    
    try {
      isSavingRef.current = true;
      await onSave(data);
      
      // Show subtle save indicator
      toast({
        title: "Guardado automático",
        description: "Los cambios se guardaron correctamente",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error al guardar:', error);
      toast({
        title: "Error al guardar", 
        description: "No se pudieron guardar los cambios automáticamente",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, toast]);

  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);
    
    // Only save if data actually changed
    if (currentData !== previousDataRef.current) {
      previousDataRef.current = currentData;
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(() => {
        saveData();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveData]);

  // Manual save function
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData();
  }, [saveData]);

  return {
    forceSave,
    isSaving: isSavingRef.current
  };
}