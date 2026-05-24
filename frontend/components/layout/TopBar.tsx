'use client';

import { useRole } from '@/contexts/RoleContext';
import { ThemeToggle } from './ThemeToggle';
import { Bell, Settings, Search } from 'lucide-react';

export function TopBar() {
  const { currentUser } = useRole();

  return (
    <header className="border-b border-slate-200 dark:border-[#1f2937] bg-white dark:bg-[#09090b] px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#111114] border border-slate-200 dark:border-[#1f2937] rounded-lg text-slate-900 dark:text-[#fafafa] placeholder-slate-400 dark:placeholder-[#9ca3af] focus:outline-none focus:border-emerald-500 dark:focus:border-[#10b981] focus:ring-1 focus:ring-emerald-500 dark:focus:ring-[#10b981]"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111114] transition-all">
            <Bell className="w-5 h-5 text-slate-600 dark:text-[#9ca3af] hover:text-teal-600 dark:hover:text-[#06b6d4]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 dark:bg-[#f43f5e] rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#111114] transition-all">
            <Settings className="w-5 h-5 text-slate-600 dark:text-[#9ca3af] hover:text-emerald-600 dark:hover:text-[#10b981]" />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-[#1f2937]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 dark:from-[#10b981] to-teal-500 dark:to-[#06b6d4] flex items-center justify-center text-sm font-bold text-white dark:text-[#09090b]">
              {currentUser.avatar}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-slate-900 dark:text-[#fafafa]">{currentUser.name}</p>
              <p className="text-xs text-slate-600 dark:text-[#9ca3af]">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
