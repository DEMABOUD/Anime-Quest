import React from 'react';
import { Trophy, Settings, Award, Flame, Download, Crown } from 'lucide-react';
import { UserProfile, NavigationTab } from '../types';

interface HeaderProps {
  userProfile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenLeaderboard: () => void;
  onOpenInstallModal?: () => void;
  isAdmin?: boolean;
  onOpenAdminPanel?: () => void;
  currentTab: NavigationTab;
  pendingRequestsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onOpenProfile,
  onOpenSettings,
  onOpenLeaderboard,
  onOpenInstallModal,
  isAdmin = false,
  onOpenAdminPanel,
  currentTab,
  pendingRequestsCount,
}) => {
  if (!userProfile) return null;

  const currentLevelXp = userProfile.xp % 500;
  const levelProgress = Math.min(100, Math.round((currentLevelXp / 500) * 100));

  return (
    <header className="sticky top-0 z-40 bg-[#070b19]/90 backdrop-blur-md border-b border-cyan-900/30 px-4 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* User profile capsule */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/60 transition-all text-left cursor-pointer group"
        >
          <div className="relative">
            <img
              src={userProfile.photoURL}
              alt={userProfile.displayName}
              className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 shadow-sm shadow-cyan-500/40"
            />
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-950 border border-cyan-400 text-[9px] font-bold text-cyan-300">
              {userProfile.level}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                {userProfile.displayName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Niv. {userProfile.level}
              </span>
            </div>
            {/* XP progress bar */}
            <div className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </button>

        {/* Status, Points & Actions (No currency!) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rank Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-bold font-display uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{userProfile.rankTitle}</span>
          </div>

          {/* Points badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>{userProfile.points.toLocaleString('fr-FR')} pts</span>
          </div>

          {/* Leaderboard button */}
          <button
            onClick={onOpenLeaderboard}
            title="Classement mondial"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              currentTab === 'leaderboard'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-500/30'
                : 'bg-slate-900/80 border-slate-700/60 hover:border-amber-400 text-slate-300'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          {/* Download App Button */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              title="Télécharger l'application"
              className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 hover:bg-cyan-900 text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-cyan-500/20"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden md:inline text-[11px] font-bold font-display uppercase tracking-wider">
                Installer
              </span>
            </button>
          )}

          {/* Admin Crown Button */}
          {isAdmin && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              title="Panneau Administrateur Suprême"
              className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 animate-pulse"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-[10px] font-bold font-display uppercase tracking-wider">
                Admin
              </span>
            </button>
          )}

          {/* Settings */}
          <div className="relative">
            <button
              onClick={onOpenSettings}
              title="Paramètres"
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-400 text-slate-300 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-300 hover:text-cyan-300" />
            </button>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
