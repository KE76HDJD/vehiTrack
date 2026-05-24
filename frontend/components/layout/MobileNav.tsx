'use client';

import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { ROLE_INFO, ROLE_PERMISSIONS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Eye,
  BarChart3,
  Car,
  Lock,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Accueil',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    roles: ['gardien', 'manager', 'employé', 'administrateur'],
  },
  {
    label: 'Surveillance Temps Réel',
    href: '/dashboard/real-time',
    icon: <Eye className="w-5 h-5" />,
    roles: ['gardien', 'administrateur'],
  },
  {
    label: 'Analytics & Rapports',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['manager', 'administrateur'],
  },
  {
    label: 'Parking & Réservations',
    href: '/dashboard/reservations',
    icon: <Car className="w-5 h-5" />,
    roles: ['employé', 'manager', 'administrateur'],
  },
  {
    label: 'Audit & RBAC',
    href: '/dashboard/audit',
    icon: <Lock className="w-5 h-5" />,
    roles: ['administrateur'],
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useRole();
  const pathname = usePathname();
  const roleInfo = ROLE_INFO[currentUser.role];
  const userPermissions = ROLE_PERMISSIONS[currentUser.role];

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-[#111114] border border-[#1f2937] text-[#fafafa] hover:bg-[#1f2937] md:hidden"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0f0f12] border-r border-[#1f2937] flex flex-col z-40 transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1f2937] mt-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] flex items-center justify-center">
              <span className="text-[#09090b] font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">VehiTrack</h1>
              <p className="text-xs text-[#9ca3af]">Pro</p>
            </div>
          </div>
          <div className="text-sm text-[#9ca3af] border-t border-[#1f2937] pt-4">
            <p className="font-semibold text-white">{currentUser.name}</p>
            <p className="text-xs mt-1">{roleInfo.label}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-[#10b981] text-[#09090b] font-semibold'
                  : 'text-[#d1d5db] hover:bg-[#1f2937] hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm flex-1">{item.label}</span>
              {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#1f2937] p-4 space-y-2">
          <button className="w-full flex items-center gap-2 px-4 py-2 text-[#d1d5db] hover:text-white hover:bg-[#1f2937] rounded-lg transition-all text-sm">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
