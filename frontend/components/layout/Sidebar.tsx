'use client';

import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_INFO, ROLE_PERMISSIONS, ROLE_MODULES } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export function Sidebar() {
  const { logout } = useAuth();
  const { currentUser } = useRole();
  const pathname = usePathname();
  const roleInfo = ROLE_INFO[currentUser.role];
  const userPermissions = ROLE_PERMISSIONS[currentUser.role];
  const modules = ROLE_MODULES[currentUser.role];

  const visibleItems = [
    { label: 'Accueil', href: '/dashboard', icon: '🏠' },
    ...modules,
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-50 dark:bg-[#0f0f12] border-r border-slate-200 dark:border-[#1f2937] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-[#1f2937]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 dark:from-[#10b981] to-teal-500 dark:to-[#06b6d4] flex items-center justify-center">
            <span className="text-white dark:text-[#09090b] font-bold text-lg">V</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">VehiTrack</h1>
            <p className="text-xs text-slate-600 dark:text-[#9ca3af]">Pro</p>
          </div>
        </div>
        <div className="text-sm text-slate-600 dark:text-[#9ca3af] border-t border-slate-200 dark:border-[#1f2937] pt-4">
          <p className="font-semibold text-slate-900 dark:text-white">{currentUser.name}</p>
          <p className="text-xs mt-1">{roleInfo.label}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname === item.href
                ? 'bg-emerald-600 dark:bg-[#10b981] text-white dark:text-[#09090b] font-semibold'
                : 'text-slate-700 dark:text-[#d1d5db] hover:bg-slate-100 dark:hover:bg-[#1f2937] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm flex-1">{item.label}</span>
            {pathname === item.href && <ChevronRight className="w-4 h-4" />}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-[#1f2937] p-4 space-y-2">
        <div className="px-4 py-2 text-xs text-slate-600 dark:text-[#9ca3af]">
          <p className="font-semibold text-slate-900 dark:text-white mb-2">Permissions</p>
          <div className="flex flex-wrap gap-1">
            {userPermissions.slice(0, 3).map((perm) => (
              <span
                key={perm}
                className="bg-slate-200 dark:bg-[#1f2937] px-2 py-1 rounded text-emerald-700 dark:text-[#10b981] text-xs"
              >
                {perm}
              </span>
            ))}
            {userPermissions.length > 3 && (
              <span className="bg-slate-200 dark:bg-[#1f2937] px-2 py-1 rounded text-slate-600 dark:text-[#9ca3af] text-xs">
                +{userPermissions.length - 3} more
              </span>
            )}
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-[#d1d5db] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1f2937] rounded-lg transition-all text-sm">
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
