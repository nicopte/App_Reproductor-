'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Music2, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';

export function LoginView() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (success) => {
      if (!success) setError('Usuario o contraseña incorrectos');
    },
    onError: () => setError('Error al iniciar sesión'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    loginMutation.mutate();
  };

  const handleQuickLogin = () => {
    setEmail('demo@mp3db.com');
    setPassword('demo123');
    login('demo@mp3db.com', 'demo123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={showRegister ? 'register' : 'login'}
          initial={{ opacity: 0, x: showRegister ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: showRegister ? -20 : 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Music2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {showRegister ? 'Crear cuenta' : 'Bienvenido de vuelta'}
              </CardTitle>
              <CardDescription>
                {showRegister
                  ? 'Regístrate para empezar a disfrutar de MP3DB'
                  : 'Inicia sesión en tu cuenta de MP3DB'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {showRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        className="pl-10 h-11"
                        aria-label="Nombre"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10 h-11"
                      aria-label="Email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-11"
                      aria-label="Contraseña"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {showRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                </Button>

                {/* Quick Login */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">o</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleQuickLogin}
                >
                  Entrar como invitado
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {showRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
                  <button
                    type="button"
                    onClick={() => { setShowRegister(!showRegister); setError(''); }}
                    className="text-primary hover:underline font-medium"
                  >
                    {showRegister ? 'Inicia sesión' : 'Regístrate'}
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
