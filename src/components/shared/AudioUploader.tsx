'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { Loader2, UploadCloud, Music, X } from 'lucide-react';
import { cn } from '@/lib/constants';
import { useAuthStore } from '@/stores';

const MAX_TARGET_MB = 40;
const MAX_HARD_MB = 45; // must match MAX_EPISODE_AUDIO_BYTES on the server route

interface AudioUploaderProps {
  value?: string;
  fileName?: string;
  onUploaded: (result: { url: string; durationSeconds: number }) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * Uploads an mp3 file straight from the browser to Vercel Blob storage
 * (via the token issued by POST /api/podcasts/upload), so large episode
 * files never pass through a Vercel serverless function body.
 */
export function AudioUploader({ value, fileName, onUploaded, onClear, className }: AudioUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const readAudioDuration = (file: File): Promise<number> =>
    new Promise((resolve, reject) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => reject(new Error('No se pudo leer la duración del audio'));
      audio.src = URL.createObjectURL(file);
    });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setError('');

    const isMp3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3');
    if (!isMp3) {
      setError('Solo se aceptan archivos .mp3');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_HARD_MB) {
      setError(
        `El archivo pesa ${sizeMB.toFixed(1)}MB, el máximo es ${MAX_HARD_MB}MB. Exportalo con un bitrate menor (128kbps) antes de subirlo.`
      );
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setProgress(0);
    try {
      const durationSeconds = await readAudioDuration(file);

      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const blob = await upload(`podcasts/${user.id}/${Date.now()}-${safeName}`, file, {
        access: 'public',
        handleUploadUrl: '/api/podcasts/upload',
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      onUploaded({ url: blob.url, durationSeconds });

      if (sizeMB > MAX_TARGET_MB) {
        setError(
          `Subido, pero pesa ${sizeMB.toFixed(1)}MB (recomendado: hasta ${MAX_TARGET_MB}MB). Considerá comprimirlo la próxima vez.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el audio');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/40">
          <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName ?? 'Audio subido'}</p>
            <p className="text-xs text-muted-foreground">Listo para publicar</p>
          </div>
          {onClear && (
            <button
              type="button"
              aria-label="Quitar audio"
              onClick={onClear}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Subir episodio en mp3"
          onClick={() => !isUploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border bg-muted/30 cursor-pointer transition-colors hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary text-center'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Subiendo… {progress}%</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm font-medium">Subir episodio (.mp3, hasta {MAX_TARGET_MB}MB)</p>
              <p className="text-xs text-muted-foreground">Se sube directo, sin pasar por el servidor</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,.mp3"
        className="sr-only"
        onChange={handleFileSelect}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
