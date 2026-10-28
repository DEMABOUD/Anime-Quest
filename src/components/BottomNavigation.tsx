import React from 'react';
import { Home, HelpCircle, Users, Shield, User } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavigationProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  unreadCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavigationTab, label: 'Accueil', icon: Home },
    { id: 'quiz' as NavigationTab, label: 'Quiz', icon: HelpCircle },
    { id: 'community' as NavigationTab, label: 'Communauté', icon: Users, badge: unreadCount },
    { id: 'guilds' as NavigationTab, label: 'Guildes', icon: Shield },
    { id: 'profile' as NavigationTab, label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b19]/95 backdrop-blur-xl border-t border-cyan-900/40 px-2 py-1.5 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-cyan-400 scale-105 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : ''}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wide mt-1 font-display">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1.5 w-8 h-1 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
