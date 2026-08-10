'use client';

import {
  Home,
  Search,
  Library,
  ListMusic,
  Heart,
  Podcast,
  Clock,
  Plus,
  LogOut,
} from 'lucide-react';
import { useNavigationStore } from '@/stores';
import { cn, APP_NAME, LIBRARY_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores';

const NAV_ICONS: Record<string, typeof Home> = {
  home: Home,
  search: Search,
  library: Library,
};

const LIB_ICONS: Record<string, typeof ListMusic> = {
  playlists: ListMusic,
  favorites: Heart,
  podcasts: Podcast,
  history: Clock,
};

export function Sidebar() {
  const { currentView, navigate } = useNavigationStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <aside className="hidden md:flex flex-col w-[280px] min-w-[280px] h-full pb-[88px] bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-9 h-9 rounded-2xl overflow-hidden flex items-center justify-center shadow-glow">
          <img src="/logo.jpg" alt={APP_NAME} className="w-full h-full object-cover" />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">{APP_NAME}</span>
      </div>

      {/* Main Nav */}
      <nav className="px-3 space-y-1">
        {(['home', 'search', 'library'] as const).map((item) => {
          const Icon = NAV_ICONS[item];
          const labels: Record<string, string> = { home: 'Inicio', search: 'Buscar', library: 'Biblioteca' };
          return (
            <button
              key={item}
              onClick={() => navigate(item)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200',
                currentView === item
                  ? 'bg-gradient-warm text-primary-foreground shadow-glow'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{labels[item]}</span>
            </button>
          );
        })}
      </nav>

      <Separator className="my-3 bg-sidebar-border/50" />

      {/* Library Section */}
      <div className="px-3 flex items-center justify-between mb-2">
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tu Biblioteca
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 hover:bg-sidebar-accent"
          onClick={() => navigate('create-playlist')}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0 px-3">
        <div className="space-y-1 pb-4">
          {LIBRARY_ITEMS.map((item) => {
            const Icon = LIB_ICONS[item.id];
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'podcasts') navigate('podcasts');
                  else if (item.id === 'favorites') navigate('favorites');
                  else if (item.id === 'history') navigate('library');
                  else navigate('library');
                }}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-sm transition-all duration-200',
                  'hover:bg-sidebar-accent/10 hover:text-sidebar-foreground',
                  'text-sidebar-foreground/70'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border/50">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name?.[0]?.toUpperCase() ?? 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cerrar sesión"
              onClick={() => logout()}
              className="shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => navigate('login')}
          >
            Iniciar sesión
          </Button>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { currentView, navigate } = useNavigationStore();

  return (
    <nav className="md:hidden fixed bottom-[76px] left-0 right-0 z-40 px-3">
      <div className="glass shadow-card rounded-3xl px-2 py-2">
        <div className="flex items-center justify-around">
          {(['home', 'search', 'library'] as const).map((item) => {
            const Icon = NAV_ICONS[item];
            const labels: Record<string, string> = { home: 'Inicio', search: 'Buscar', library: 'Biblioteca' };
            const active = currentView === item;
            return (
              <button
                key={item}
                onClick={() => navigate(item)}
                className="flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1.5 transition-all duration-200"
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-2xl transition-all',
                    active ? 'bg-gradient-warm text-primary-foreground shadow-glow' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
                </span>
                <span className={cn('text-[10px] font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                  {labels[item]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
