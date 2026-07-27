'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigationStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Music, ImagePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageUploader } from '@/components/shared/ImageUploader';

export function CreatePlaylistView() {
  const navigate = useNavigationStore((s) => s.navigate);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; image?: string }) =>
      fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: async (res) => {
      const playlist = await res.json();
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      navigate('playlist-detail', { id: playlist.id });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      image: image || undefined,
    });
  };

  return (
    <div className="max-w-lg mx-auto pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold mb-2">Crear Playlist</h1>
          <p className="text-muted-foreground text-sm">
            Crea una nueva playlist para organizar tu música
          </p>
        </div>

        {/* Cover Image */}
        <div className="flex justify-center">
          <ImageUploader folder="playlists" value={image} onChange={setImage} label="Portada de playlist" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium mb-1.5 block">
              Título *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              placeholder="Nombre de la playlist"
              className="h-11"
              aria-label="Título de la playlist"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium mb-1.5 block">
              Descripción
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu playlist (opcional)"
              rows={3}
              aria-label="Descripción de la playlist"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createMutation.isPending ? 'Creando...' : 'Crear playlist'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('library')}>
              Cancelar
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
