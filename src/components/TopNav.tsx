import React from 'react';
import { ActiveTab } from '../types';
import { PlusCircle, Volume2, VolumeX, Moon, Sun, Settings } from 'lucide-react';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currentBalance: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}) => {
  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'milestones', label: 'Milestones (200)' },
    { id: 'journey', label: 'Rank Journey' },
    { id: 'history', label: 'History' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'achievements', label: 'Achievements' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors bg-slate-950/85 border-slate-800/80 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-slate-950 text-base leading-none">₨</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">
                Cash<span className="text-amber-400">Saving</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Quick Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
            title={soundEnabled ? 'Sound FX On' : 'Sound FX Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Gaming Theme'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
            title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Settings & Backup Modal Trigger */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings and Backup"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
            title="Settings & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Action Button: Add Cash */}
          <button
            onClick={onOpenAddModal}
            className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Cash</span>
          </button>
        </div>
      </div>
    </header>
  );
};
