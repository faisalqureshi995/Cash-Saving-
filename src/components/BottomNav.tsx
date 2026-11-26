import React from 'react';
import { ActiveTab } from '../types';
import { LayoutDashboard, Award, History, BarChart3, Trophy, Target } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: LayoutDashboard },
    { id: 'milestones' as ActiveTab, label: 'Milestones', icon: Target },
    { id: 'journey' as ActiveTab, label: 'Ranks', icon: Award },
    { id: 'history' as ActiveTab, label: 'History', icon: History },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'achievements' as ActiveTab, label: 'Badges', icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="grid grid-cols-6 items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-amber-500/15 scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
