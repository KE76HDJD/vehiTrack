'use client';
import { useRole } from '@/contexts/RoleContext';
import { useApi } from '@/hooks/useApi';
import { ROLE_INFO, ROLE_MODULES, PARKING_ZONES } from '@/lib/constants';
import { Card } from '@/components/ui/card';
import { BarChart3, Eye, Car, Lock, AlertCircle, Loader2, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardHome() {
  const { currentUser } = useRole();
  const { getActiveSessions, getEmployees } = useApi();
  const roleInfo = ROLE_INFO[currentUser.role];

  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [employees, setEmployees]           = useState<any[]>([]);
  const [loading, setLoading]               = useState(true);

  const totalSlots = PARKING_ZONES.reduce((s, z) => s + z.rows * z.cols, 0);

  useEffect(() => {
    Promise.all([
      getActiveSessions().catch(() => []),
      getEmployees().catch(() => []),
    ]).then(([s, e]) => {
      setActiveSessions(Array.isArray(s) ? s : []);
      setEmployees(Array.isArray(e) ? e : []);
    }).finally(() => setLoading(false));
  }, []);

  const currentModules = ROLE_MODULES[currentUser.role] || [];

  const ICON_MAP: Record<string, any> = {
    '📹': Eye, '🚨': AlertCircle, '📊': BarChart3,
    '🅿️': Car, '🎫': Car, '📋': Lock, '🔐': Lock,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Bienvenue, {currentUser.name}
        </h1>
        <p className="text-slate-600 dark:text-[#9ca3af] text-lg">
          Connecté en tant que{' '}
          <span className="text-emerald-600 dark:text-[#10b981] font-semibold">{roleInfo?.label}</span>
        </p>
        <p className="text-slate-600 dark:text-[#9ca3af] mt-1">{roleInfo?.description}</p>
      </div>

      {/* Stats réelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Status Système',
            value: 'En ligne',
            color: 'text-emerald-600 dark:text-[#10b981]',
            bg: 'bg-emerald-100 dark:bg-[#10b981]/20',
            icon: Eye,
            iconColor: 'text-emerald-600 dark:text-[#10b981]',
          },
          {
            label: 'Places Totales',
            value: totalSlots,
            color: 'text-teal-600 dark:text-[#06b6d4]',
            bg: 'bg-teal-100 dark:bg-[#06b6d4]/20',
            icon: Car,
            iconColor: 'text-teal-600 dark:text-[#06b6d4]',
          },
          {
            label: 'Sessions Actives',
            value: loading ? '…' : activeSessions.length,
            color: 'text-amber-600 dark:text-[#f59e0b]',
            bg: 'bg-amber-100 dark:bg-[#f59e0b]/20',
            icon: BarChart3,
            iconColor: 'text-amber-600 dark:text-[#f59e0b]',
          },
          {
            label: 'Employés',
            value: loading ? '…' : employees.length,
            color: 'text-blue-600 dark:text-[#06b6d4]',
            bg: 'bg-blue-100 dark:bg-[#06b6d4]/20',
            icon: Users,
            iconColor: 'text-blue-600 dark:text-[#06b6d4]',
          },
        ].map(stat => (
          <Card key={stat.label} className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 dark:text-[#9ca3af] text-sm font-medium mb-2">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Modules Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentModules.map(module => {
            const IconComponent = ICON_MAP[module.icon] || Car;
            return (
              <Link key={module.label} href={module.href} className="group">
                <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6 hover:border-emerald-500 dark:hover:border-[#10b981] transition-all cursor-pointer hover:shadow-lg">
                  <div className="flex flex-col items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-[#10b981]/20 group-hover:bg-emerald-200 dark:group-hover:bg-[#10b981]/30 flex items-center justify-center transition-all">
                      <IconComponent className="w-6 h-6 text-emerald-600 dark:text-[#10b981]" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-semibold group-hover:text-emerald-600 dark:group-hover:text-[#10b981] transition-colors">
                      {module.label}
                    </h3>
                  </div>
                </Card>
              </Link>
            );
          })}
          {/* Lien création employé pour admin */}
          {currentUser.role === 'administrateur' && (
            <Link href="/dashboard/create-employee" className="group">
              <Card className="bg-white dark:bg-[#111114] border-slate-200 dark:border-[#1f2937] p-6 hover:border-emerald-500 dark:hover:border-[#10b981] transition-all cursor-pointer hover:shadow-lg">
                <div className="flex flex-col items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-[#10b981]/20 group-hover:bg-emerald-200 dark:group-hover:bg-[#10b981]/30 flex items-center justify-center transition-all">
                    <Users className="w-6 h-6 text-emerald-600 dark:text-[#10b981]" />
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-semibold group-hover:text-emerald-600 dark:group-hover:text-[#10b981] transition-colors">
                    Créer un Employé
                  </h3>
                </div>
              </Card>
            </Link>
          )}
        </div>
      </div>

      {/* Infos rapides */}
      <div className="bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#1f2937] rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Informations Rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-slate-600 dark:text-[#9ca3af] text-sm mb-1">Capacité Parking</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-[#10b981]">{totalSlots}</p>
            <p className="text-slate-600 dark:text-[#9ca3af] text-xs mt-1">places totales</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-[#9ca3af] text-sm mb-1">Sessions Actives</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-[#f59e0b]">
              {loading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : activeSessions.length}
            </p>
            <p className="text-slate-600 dark:text-[#9ca3af] text-xs mt-1">en ce moment</p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-[#9ca3af] text-sm mb-1">Équipe</p>
            <p className="text-3xl font-bold text-teal-600 dark:text-[#06b6d4]">
              {loading ? <Loader2 className="w-6 h-6 animate-spin inline" /> : employees.length}
            </p>
            <p className="text-slate-600 dark:text-[#9ca3af] text-xs mt-1">employés actifs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
