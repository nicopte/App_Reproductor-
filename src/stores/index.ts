import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Episode, ViewType } from '@/types';

interface NavigationState {
  currentView: ViewType;
  viewParams: Record<string, string>;
  navigate: (view: ViewType, params?: Record<string, string>) => void;
  goBack: () => void;
  history: ViewType[];
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      currentView: 'home',
      viewParams: {},
      history: ['home'],
      navigate: (view, params = {}) => {
        const state = get();
        set({
          currentView: view,
          viewParams: params,
          history: [...state.history, view],
        });
      },
      goBack: () => {
        const state = get();
        const newHistory = state.history.slice(0, -1);
        const prevView = newHistory[newHistory.length - 1] || 'home';
        set({
          currentView: prevView,
          viewParams: {},
          history: newHistory.length > 0 ? newHistory : ['home'],
        });
      },
    }),
    {
      name: 'mp3db-navigation',
      partialize: (state) => ({ currentView: state.currentView, viewParams: state.viewParams }),
    }
  )
);

interface PlayerState {
  currentSong: Episode | null;
  queue: Episode[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  previousVolume: number;
  isMuted: boolean;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
  playSong: (song: Episode, queue?: Episode[]) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  nextSong: () => void;
  previousSong: () => void;
  addToQueue: (song: Episode) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      queueIndex: -1,
      isPlaying: false,
      currentTime: 0,
      volume: 0.7,
      previousVolume: 0.7,
      isMuted: false,
      repeat: 'off',
      shuffle: false,
      playSong: (song, queue) => {
        const newQueue = queue || [song];
        const index = newQueue.findIndex((s) => s.id === song.id);
        set({
          currentSong: song,
          queue: newQueue,
          queueIndex: index >= 0 ? index : 0,
          isPlaying: true,
          currentTime: 0,
        });
      },
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      setPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setVolume: (volume) => {
        set({ volume: Math.max(0, Math.min(1, volume)), isMuted: false });
      },
      toggleMute: () =>
        set((s) => ({
          isMuted: !s.isMuted,
          volume: s.isMuted ? s.previousVolume : 0,
          previousVolume: s.isMuted ? s.previousVolume : s.volume,
        })),
      toggleRepeat: () =>
        set((s) => ({
          repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off',
        })),
      toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
      nextSong: () => {
        const { queue, queueIndex, repeat, shuffle } = get();
        if (queue.length === 0) return;
        let nextIndex: number;
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          nextIndex = queueIndex + 1;
          if (nextIndex >= queue.length) {
            if (repeat === 'all') nextIndex = 0;
            else return;
          }
        }
        set({
          currentSong: queue[nextIndex],
          queueIndex: nextIndex,
          isPlaying: true,
          currentTime: 0,
        });
      },
      previousSong: () => {
        const { queue, queueIndex, currentTime } = get();
        if (queue.length === 0) return;
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        const prevIndex = queueIndex - 1;
        if (prevIndex < 0) return;
        set({
          currentSong: queue[prevIndex],
          queueIndex: prevIndex,
          isPlaying: true,
          currentTime: 0,
        });
      },
      addToQueue: (song) =>
        set((s) => ({ queue: [...s.queue, song] })),
      removeFromQueue: (index) =>
        set((s) => {
          const newQueue = s.queue.filter((_, i) => i !== index);
          let newIndex = s.queueIndex;
          if (index < s.queueIndex) newIndex--;
          else if (index === s.queueIndex && newIndex >= newQueue.length) newIndex = newQueue.length - 1;
          return { queue: newQueue, queueIndex: newIndex };
        }),
      clearQueue: () => set({ queue: [], queueIndex: -1 }),
    }),
    {
      name: 'mp3db-player',
      partialize: (state) => ({
        volume: state.volume,
        previousVolume: state.previousVolume,
        isMuted: state.isMuted,
        repeat: state.repeat,
        shuffle: state.shuffle,
      }),
    }
  )
);

interface AuthState {
  user: { id: string; name: string; email: string; avatar?: string; isAdmin?: boolean } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const user = await res.json();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const user = await res.json();
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  register: async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        const user = await res.json();
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout, clear client state regardless
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
