'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/types';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import Image from 'next/image';

const ROLE_MAP: Record<string, UserRole> = {
  gardien: 'gardien',
  employe: 'employé',
  manager: 'manager',
  admin: 'administrateur',
};

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useRole();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('http://localhost:8001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        // Décoder le JWT pour récupérer le rôle
        const payload = JSON.parse(atob(data.data.access_token.split('.')[1]));
        const backendRole = payload.role as string;
        const frontendRole = ROLE_MAP[backendRole] || 'employé';

        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        localStorage.setItem('role', frontendRole);
        localStorage.setItem('email', email);

        setRole(frontendRole);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Email ou mot de passe incorrect.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#09090b] dark:via-slate-950 dark:to-[#1a1a1f] flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 dark:bg-emerald-950 rounded-full blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 dark:bg-cyan-950 rounded-full blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>
      <Card className="w-full max-w-md bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] relative z-10">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              <Image src="/logo-vehitrack.jpg" alt="VehiTrack Pro Logo" fill className="object-contain" priority />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">VehiTrack Pro</h1>
            <p className="text-slate-600 dark:text-slate-400">Système de Gestion Parking Intelligent</p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="admin@vehitrack.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 dark:bg-[#1a1a1f] border-slate-200 dark:border-[#2a2a2f] text-slate-900 dark:text-white"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 dark:bg-[#1a1a1f] border-slate-200 dark:border-[#2a2a2f] text-slate-900 dark:text-white pr-10"
                  required
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              {isLoading ? 'Connexion en cours...' : 'Se Connecter'}
            </Button>
          </form>
          <div className="space-y-2 pt-6 border-t border-slate-200 dark:border-[#2a2a2f]">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase mb-3">Comptes de test</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin', email: 'admin@vehitrack.io' },
                { role: 'Gardien', email: 'gardien@vehitrack.io' },
                { role: 'Manager', email: 'manager@vehitrack.io' },
                { role: 'Employé', email: 'employe@vehitrack.io' },
              ].map(({ role, email: e }) => (
                <button key={role} type="button"
                  onClick={() => { setEmail(e); setPassword('yaokouma'); }}
                  disabled={isLoading}
                  className="p-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1a1a1f] hover:bg-slate-200 dark:hover:bg-[#2a2a2f] border border-slate-300 dark:border-[#2a2a2f] rounded-lg transition-colors">
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
