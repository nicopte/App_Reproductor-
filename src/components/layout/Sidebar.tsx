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
    <aside className="hidden md:flex flex-col w-64 min-w-[16rem] h-full pt-4 pb-3 pl-3">
      <div className="flex h-full flex-col gap-1 rounded-3xl bg-sidebar p-3 shadow-soft border border-sidebar-border/60">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pb-3 pt-1">
          <span className="shadow-glow grid h-9 w-9 place-items-center overflow-hidden rounded-2xl">
            <img src="/logo.jpg" alt={APP_NAME} className="w-full h-full object-cover" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">{APP_NAME}</span>
        </div>

        {/* Main Nav */}
        <nav className="flex flex-col gap-1">
          {(['home', 'search', 'library'] as const).map((item) => {
            const Icon = NAV_ICONS[item];
            const labels: Record<string, string> = { home: 'Inicio', search: 'Buscar', library: 'Biblioteca' };
            const active = currentView === item;
            return (
              <button
                key={item}
                onClick={() => navigate(item)}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-gradient-warm text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{labels[item]}</span>
              </button>
            );
          })}
        </nav>

        {/* Library Section */}
        <div className="mt-5 flex items-center justify-between px-3 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tu Biblioteca
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-xl hover:bg-muted"
            onClick={() => navigate('create-playlist')}
            aria-label="Crear playlist"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0 px-1">
          <div className="space-y-1 pb-4">
            {LIBRARY_ITEMS.map((item) => {
              const Icon = LIB_ICONS[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'podcasts') navigate('podcasts');
                    else if (item.id === 'favorites') navigate('favorites');
                    else navigate('library');
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Bottom */}
        <div className="pt-2 mt-1 border-t border-sidebar-border/60">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 px-2 py-2.5">
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
                className="shrink-0 rounded-xl hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full justify-center rounded-2xl bg-gradient-warm text-primary-foreground shadow-glow border-0"
              onClick={() => navigate('login')}
            >
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { currentView, navigate } = useNavigationStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2">
      <div className="glass shadow-card rounded-3xl px-2 py-2">
        <ul className="flex items-center justify-between">
          {(['home', 'search', 'library'] as const).map((item) => {
            const Icon = NAV_ICONS[item];
            const labels: Record<string, string> = { home: 'Inicio', search: 'Buscar', library: 'Biblioteca' };
            const active = currentView === item;
            return (
              <li key={item} className="flex-1">
                <button
                  onClick={() => navigate(item)}
                  className="flex flex-col items-center gap-0.5 w-full rounded-2xl px-2 py-1.5 transition-all"
                  aria-label={labels[item]}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl transition-all',
                      active ? 'bg-gradient-warm text-primary-foreground shadow-glow' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                  </span>
                  <span className={cn('text-[10px] font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                    {labels[item]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
