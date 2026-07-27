'use client';

import { useRef, useState } from 'react';
import { Loader2, ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/constants';
import type { CloudinaryFolder } from '@/lib/cloudinary';

interface ImageUploaderProps {
  folder: CloudinaryFolder;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  shape?: 'square' | 'circle';
  label?: string;
}

/**
 * Uploads an image straight to Cloudinary via POST /api/upload and reports
 * the resulting secure URL back through onChange. Shows a live preview,
 * upload progress, and lets the user clear the current image.
 */
export function ImageUploader({ folder, value, onChange, className, shape = 'square', label }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al subir la imagen');
      }
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <div
        role="button"
        tabIndex={0}
        aria-label={label ?? 'Subir imagen'}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          'relative w-32 h-32 flex items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted/40 cursor-pointer transition-colors hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
          shape === 'circle' ? 'rounded-full' : 'rounded-xl'
        )}
      >
        {value ? (
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <ImagePlus className="w-6 h-6 text-muted-foreground" />
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {value && !isUploading && (
          <button
            type="button"
            aria-label="Quitar imagen"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileSelect}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
