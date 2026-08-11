'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore, useNavigationStore } from '@/stores';
import { formatDuration, cn } from '@/lib/constants';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Repeat1,
  Shuffle,
  ChevronUp,
  ChevronDown,
  ListMusic,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentSong,
    queue,
    queueIndex,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    repeat,
    shuffle,
    togglePlay,
    setPlaying,
    setCurrentTime,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    nextSong,
    previousSong,
    playSong,
  } = usePlayerStore();

  const [showQueue, setShowQueue] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Audio playback
  useEffect(() => {
    if (!audioRef.current || !currentSong?.url) return;
    const audio = audioRef.current;

    if (currentSong.url !== audio.src) {
      audio.src = currentSong.url;
      audio.load();
    }

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentSong, isPlaying, setPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [setCurrentTime]);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      nextSong();
    }
  }, [repeat, nextSong]);

  const handleSeek = useCallback(
    (value: number[]) => {
      if (audioRef.current) {
        audioRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
      }
    },
    [setCurrentTime]
  );

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      setVolume(value[0]);
    },
    [setVolume]
  );

  if (!currentSong) {
    return null;
  }

  const progress = currentSong.duration > 0 ? (currentTime / currentSong.duration) * 100 : 0;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* Full queue panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-36 md:bottom-28 right-3 md:right-4 z-50 w-[calc(100%-1.5rem)] md:w-[380px] h-[55vh] glass shadow-card rounded-3xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-display text-sm font-semibold">Cola de reproducción</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl" onClick={() => setShowQueue(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-56px)]">
              <div className="p-2">
                {queue.map((song, index) => (
                  <button
                    key={`${song.id}-${index}`}
                    onClick={() => {
                      playSong(song, queue);
                      setShowQueue(false);
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-left transition-colors',
                      'hover:bg-accent/10',
                      song.id === currentSong?.id && 'bg-accent/10'
                    )}
                  >
                    <span className="w-5 text-center text-xs text-muted-foreground">
                      {song.id === currentSong?.id ? (
                        <div className="flex items-center justify-center gap-0.5">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-[3px] bg-primary rounded-full eq-bar" />
                          ))}
                        </div>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm truncate', song.id === currentSong?.id && 'text-primary font-medium')}>
                        {song.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{song.podcast?.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDuration(song.duration)}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Player */}
      <div className="fixed bottom-20 left-3 right-3 md:bottom-4 md:left-auto md:right-4 z-50 md:w-[420px]">
        <div className="glass shadow-card overflow-hidden rounded-3xl">
          {/* Progress bar */}
          <div
            className="relative h-1 w-full bg-border/40 cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              handleSeek([percent * currentSong.duration]);
            }}
          >
            <div
              className="h-full bg-gradient-warm transition-all duration-100 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Compact row (mobile + desktop) */}
          <div className="flex items-center gap-3 p-2.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted flex-shrink-0">
              {currentSong.image ? (
                <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                {isPlaying && (
                  <span className="flex items-end gap-0.5">
                    <span className="bg-primary eq-bar h-3 w-0.5 rounded-full" style={{ animationDelay: '0ms' }} />
                    <span className="bg-primary eq-bar h-3 w-0.5 rounded-full" style={{ animationDelay: '150ms' }} />
                    <span className="bg-primary eq-bar h-3 w-0.5 rounded-full" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
                <p className="truncate text-sm font-semibold">{currentSong.title}</p>
              </div>
              <p className="text-muted-foreground truncate text-xs">{currentSong.podcast?.title}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="hidden sm:grid w-9 h-9 rounded-full text-muted-foreground hover:text-foreground" onClick={previousSong}>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="w-10 h-10 rounded-full bg-gradient-warm shadow-glow text-primary-foreground hover:opacity-90 active:scale-95 transition"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="hidden sm:grid w-9 h-9 rounded-full text-muted-foreground hover:text-foreground" onClick={nextSong}>
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:grid w-9 h-9 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => setExpanded(!expanded)}
                aria-label="Más opciones"
              >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Expanded controls */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border/50"
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className={cn('w-8 h-8 rounded-full', shuffle && 'text-primary')} onClick={toggleShuffle}>
                      <Shuffle className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className={cn('w-8 h-8 rounded-full', repeat !== 'off' && 'text-primary')} onClick={toggleRepeat}>
                      {repeat === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className={cn('w-8 h-8 rounded-full', showQueue && 'text-primary')} onClick={() => setShowQueue(!showQueue)}>
                      <ListMusic className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatDuration(Math.floor(currentTime))} / {formatDuration(currentSong.duration)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={toggleMute}>
                      <VolumeIcon className="w-3.5 h-3.5" />
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) => handleVolumeChange([v[0] / 100])}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>

  );
}

function Music({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
