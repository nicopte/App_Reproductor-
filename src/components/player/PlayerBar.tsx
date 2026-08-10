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
  Heart,
  X,
  GripVertical,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

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
  const [isFav, setIsFav] = useState(false);

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
    return (
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-[72px] glass border-t border-border flex items-center justify-center md:justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <Music className="w-5 h-5" />
          <span>Selecciona una canción para reproducir</span>
        </div>
      </footer>
    );
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
            className="fixed bottom-[72px] md:bottom-[88px] right-0 z-50 w-full md:w-[380px] h-[60vh] glass shadow-card border-l border-t border-border rounded-t-3xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h3 className="font-semibold text-sm">Cola de reproducción</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setShowQueue(false)}>
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
                      'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-colors',
                      'hover:bg-accent',
                      song.id === currentSong?.id && 'bg-accent/50'
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

      {/* Main Player Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 glass shadow-card rounded-t-3xl md:rounded-t-none border-t border-border">
        {/* Progress bar - thin line at top of player */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-border/30 cursor-pointer group rounded-t-3xl md:rounded-t-none overflow-hidden">
          <div
            className="h-full bg-gradient-warm transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden items-center h-[72px] px-4 gap-3">
          {/* Song info */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {currentSong.image ? (
                <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{currentSong.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentSong.podcast?.title}</p>
            </div>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={previousSong}>
              <SkipBack className="w-4 h-4 fill-current" />
            </Button>
            <Button
              size="icon"
              className="w-10 h-10 rounded-full bg-gradient-warm hover:opacity-90 text-primary-foreground shadow-glow"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={nextSong}>
              <SkipForward className="w-4 h-4 fill-current" />
            </Button>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:grid grid-cols-3 items-center h-[88px] px-6">
          {/* Left: Song info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 shadow-lg">
              {currentSong.image ? (
                <img src={currentSong.image} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <button className="text-sm font-medium truncate block hover:underline max-w-[200px]">
                {currentSong.title}
              </button>
              <button className="text-xs text-muted-foreground truncate block hover:underline max-w-[200px]">
                {currentSong.podcast?.title}
              </button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 ml-1 flex-shrink-0"
              onClick={() => setIsFav(!isFav)}
            >
              <Heart className={cn('w-4 h-4', isFav ? 'fill-primary text-primary' : 'text-muted-foreground')} />
            </Button>
          </div>

          {/* Center: Controls + Progress */}
          <div className="flex flex-col items-center gap-1.5 max-w-[600px] mx-auto w-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className={cn('w-8 h-8', shuffle && 'text-primary')}
                onClick={toggleShuffle}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={previousSong}>
                <SkipBack className="w-4 h-4 fill-current" />
              </Button>
              <Button
                size="icon"
                className="w-10 h-10 rounded-full bg-gradient-warm hover:opacity-90 text-primary-foreground shadow-glow hover:scale-105 transition-transform"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={nextSong}>
                <SkipForward className="w-4 h-4 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('w-8 h-8', repeat !== 'off' && 'text-primary')}
                onClick={toggleRepeat}
              >
                {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                {formatDuration(Math.floor(currentTime))}
              </span>
              <div className="flex-1 group cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                handleSeek([percent * currentSong.duration]);
              }}>
                <div className="h-1 bg-muted rounded-full relative group-hover:h-1.5 transition-all">
                  <div
                    className="h-full bg-primary rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-10 tabular-nums">
                {formatDuration(currentSong.duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume + Queue */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn('w-8 h-8', showQueue && 'text-primary')}
              onClick={() => setShowQueue(!showQueue)}
            >
              <ListMusic className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 group">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleMute}>
                <VolumeIcon className="w-4 h-4" />
              </Button>
              <div className="w-24 group-hover:w-28 transition-all">
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
        </div>
      </footer>
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
