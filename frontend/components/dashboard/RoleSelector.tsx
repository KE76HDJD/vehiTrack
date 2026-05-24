'use client';

import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/types';
import { ROLE_INFO } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const ROLES: UserRole[] = ['gardien', 'manager', 'employé', 'administrateur'];

export function RoleSelector() {
  const { currentUser, setRole } = useRole();

  return (
    <div className="fixed bottom-6 right-6 bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#1f2937] rounded-lg p-4 shadow-lg z-50">
      <p className="text-xs text-slate-600 dark:text-[#9ca3af] font-semibold mb-3 uppercase">Debug: Role Selector</p>
      <div className="flex flex-col gap-2">
        {ROLES.map((role) => (
          <Button
            key={role}
            onClick={() => setRole(role)}
            variant={currentUser.role === role ? 'default' : 'outline'}
            size="sm"
            className={`justify-start text-xs ${
              currentUser.role === role
                ? 'bg-emerald-600 dark:bg-[#10b981] text-white dark:text-[#09090b] hover:bg-emerald-700 dark:hover:bg-[#059669]'
                : 'border-slate-300 dark:border-[#1f2937] text-slate-700 dark:text-[#d1d5db] hover:bg-slate-100 dark:hover:bg-[#1f2937]'
            }`}
          >
            {ROLE_INFO[role].label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-slate-600 dark:text-[#9ca3af] mt-3 pt-3 border-t border-slate-200 dark:border-[#1f2937]">
        Current: <span className="text-emerald-600 dark:text-[#10b981] font-semibold">{ROLE_INFO[currentUser.role].label}</span>
      </p>
    </div>
  );
}
