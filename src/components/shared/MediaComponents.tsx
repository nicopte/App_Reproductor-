'use client';

import { cn, formatDuration } from '@/lib/constants';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface MediaCardProps {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  rounded?: boolean;
  type: 'playlist' | 'podcast';
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
}

export function MediaCard({
  title,
  subtitle,
  image,
  rounded = false,
  type,
  onClick,
  onPlay,
  className,
}: MediaCardProps) {
  const borderRadius = rounded ? 'rounded-xl' : 'rounded-lg';

  return (
    <div
      className={cn(
        'group relative flex flex-col gap-2 p-2 rounded-lg transition-all duration-200',
        'hover:bg-accent/50 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Image */}
      <div className={cn('relative aspect-square overflow-hidden bg-muted shadow-lg', borderRadius)}>
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent">
            <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground/60">{title.charAt(0)}</span>
            </div>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <Button
            size="icon"
            className={cn(
              'w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground',
              'shadow-xl hover:scale-105 transition-transform'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </Button>
        </div>

        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Info */}
      <div className="px-0.5 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface SongRowProps {
  title: string;
  artist: string;
  album?: string;
  duration: number;
  image?: string;
  isActive?: boolean;
  isPlaying?: boolean;
  index?: number;
  onClick?: () => void;
  onPlay?: () => void;
}

export function SongRow({
  title,
  artist,
  album,
  duration,
  image,
  isActive = false,
  isPlaying = false,
  index,
  onClick,
  onPlay,
}: SongRowProps) {

  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_1fr_auto] md:grid-cols-[32px_1fr_1fr_1fr_80px] items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group',
        'hover:bg-accent cursor-pointer',
        isActive && 'bg-accent/60'
      )}
      onClick={onClick}
    >
      {/* Index/Playing indicator */}
      <div className="flex items-center justify-center w-8">
        <span className={cn(
          'text-sm tabular-nums',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:hidden'
        )}>
          {index !== undefined ? index + 1 : '-'}
        </span>
        {isPlaying && (
          <div className="hidden group-hover:flex items-center justify-center gap-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[3px] bg-primary rounded-full eq-bar" />
            ))}
          </div>
        )}
        {!isPlaying && (
          <span className="hidden group-hover:block text-muted-foreground">
            <Play className="w-4 h-4 fill-current" />
          </span>
        )}
      </div>

      {/* Title + Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
              {title.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className={cn('text-sm font-medium truncate', isActive && 'text-primary')}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground truncate">{artist}</p>
        </div>
      </div>

      {/* Album (desktop) */}
      <p className="hidden md:block text-sm text-muted-foreground truncate">{album}</p>

      {/* Duration */}
      <span className="text-sm text-muted-foreground tabular-nums text-right">
        {formatDuration(duration)}
      </span>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  showAll?: boolean;
  onShowAll?: () => void;
}

export function SectionHeader({ title, showAll = false, onShowAll }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      {showAll && (
        <button
          onClick={onShowAll}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todo
        </button>
      )}
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 6 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-square rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-3 w-12 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[300px]">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function GenreCard({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform duration-200"
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
      <span className="absolute bottom-3 left-3 text-sm font-bold text-white drop-shadow-lg">
        {name}
      </span>
    </div>
  );
}
