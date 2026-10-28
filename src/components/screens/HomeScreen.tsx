import React from 'react';
import { Swords, HelpCircle, Shield, Sparkles, ChevronRight, Flame, Trophy, Download, Smartphone } from 'lucide-react';
import { UserProfile, NavigationTab } from '../../types';

interface HomeScreenProps {
  userProfile: UserProfile;
  onNavigate: (tab: NavigationTab) => void;
  onStartQuickDuel: (manga?: string) => void;
  onOpenEvent: () => void;
  onOpenInstallModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onNavigate,
  onStartQuickDuel,
  onOpenEvent,
  onOpenInstallModal,
}) => {
  const popularCategories = [
    { name: 'One Piece', badge: '🏴‍☠️', color: 'from-amber-500/20 to-red-600/20 border-amber-500/30' },
    { name: 'Naruto', badge: '🍥', color: 'from-orange-500/20 to-amber-600/20 border-orange-500/30' },
    { name: 'Jujutsu Kaisen', badge: '🤞', color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/30' },
    { name: 'Bleach', badge: '⚔️', color: 'from-cyan-500/20 to-sky-600/20 border-cyan-500/30' },
    { name: 'Dragon Ball', badge: '🐉', color: 'from-yellow-500/20 to-orange-600/20 border-yellow-500/30' },
    { name: 'L’Attaque des Titans', badge: '🛡️', color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' },
    { name: 'Demon Slayer', badge: '🌊', color: 'from-rose-500/20 to-purple-600/20 border-rose-500/30' },
    { name: 'Solo Leveling', badge: '👑', color: 'from-purple-500/20 to-violet-600/20 border-purple-500/30' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* 1. Hero Event Banner matching Mockup 3 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-cyan-500/40 p-5 sm:p-7 shadow-2xl shadow-cyan-950/40">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-4 bottom-2 text-6xl opacity-20 pointer-events-none select-none">
          🔥
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-400/50 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Événement Spécial
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-wide leading-tight">
            Défi des 7 Seigneurs de l’Ombre
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 mb-4">
            Affrontez les meilleurs otakus et remportez le titre exclusif de <span className="text-cyan-300 font-bold">Monarque Céleste</span> ainsi que la gloire au classement mondial.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/70 px-3 py-1.5 rounded-xl border border-cyan-500/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Temps restant : 2j 14h 32m</span>
            </div>
            <button
              onClick={() => onStartQuickDuel('One Piece')}
              className="py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 cursor-pointer"
            >
              Participer
            </button>
          </div>
        </div>
      </div>

      {/* PWA Install Promo Banner */}
      {onOpenInstallModal && (
        <div 
          onClick={onOpenInstallModal}
          className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-500/40 shadow-lg flex items-center justify-between gap-3 cursor-pointer hover:border-cyan-400 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold font-display text-white flex items-center gap-1.5">
                <span>Télécharger Anime Quest sur votre Téléphone</span>
                <span className="hidden sm:inline px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-mono">PWA App</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Plein écran instantané, sans barre d'adresse et sauvegarde permanente
              </div>
            </div>
          </div>

          <button
            type="button"
            className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 shrink-0"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Installer</span>
          </button>
        </div>
      )}

      {/* 2. Quick Action Cards (Quiz, Duels, Guildes) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Quiz Card */}
        <div 
          onClick={() => onNavigate('quiz')}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer shadow-lg hover:shadow-cyan-950/40"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Solo & Multi</span>
          </div>
          <h3 className="text-base font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
            Quiz Anime
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 mb-3">
            Joue et teste tes connaissances sur plus de 10 mangas cultes.
          </p>
          <div className="flex items-center text-xs font-bold text-cyan-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Jouer maintenant</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Duels 1v1 Card */}
        <div 
          onClick={() => onStartQuickDuel()}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 hover:border-violet-500/60 transition-all cursor-pointer shadow-lg hover:shadow-violet-950/40"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Swords className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">1v1 Rapide</span>
          </div>
          <h3 className="text-base font-bold font-display text-white group-hover:text-violet-300 transition-colors">
            Duel en Direct
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 mb-3">
            Affronte un adversaire en temps réel avec compte à rebours 15s.
          </p>
          <div className="flex items-center text-xs font-bold text-violet-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Défier un joueur</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Guilds Card */}
        <div 
          onClick={() => onNavigate('guilds')}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer shadow-lg hover:shadow-amber-950/40"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Guerres 20 Q</span>
          </div>
          <h3 className="text-base font-bold font-display text-white group-hover:text-amber-300 transition-colors">
            Guildes de Mangas
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 mb-3">
            Rejoins une guilde d’anime et lutte pour éviter les 20 défaites !
          </p>
          <div className="flex items-center text-xs font-bold text-amber-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Rejoindre ou créer</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Popular Anime Categories (Mockup 3 & 4) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <span>Catégories Populaires</span>
            <span className="text-xs font-sans font-normal text-slate-400">({popularCategories.length})</span>
          </h3>
          <button 
            onClick={() => onNavigate('quiz')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Tout voir
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {popularCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onStartQuickDuel(cat.name)}
              className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color} border hover:scale-[1.03] transition-all text-left cursor-pointer flex items-center gap-2.5 group`}
            >
              <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center text-lg shrink-0">
                {cat.badge}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold font-display text-white truncate group-hover:text-cyan-300">
                  {cat.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  Quiz & Duels
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Player Stats Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs text-slate-400">Taux de victoire mondial</div>
          <div className="text-xl font-bold font-display text-cyan-300">
            {userProfile.totalGames > 0
              ? `${Math.round((userProfile.wins / userProfile.totalGames) * 100)}%`
              : 'Nouveau joueur'}
          </div>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400">Victoires : </span>
            <span className="text-emerald-400 font-bold">{userProfile.wins}</span>
          </div>
          <div>
            <span className="text-slate-400">Défaites : </span>
            <span className="text-red-400 font-bold">{userProfile.losses}</span>
          </div>
          <div>
            <span className="text-slate-400">Points : </span>
            <span className="text-amber-400 font-bold">{userProfile.points}</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('leaderboard')}
          className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-900/60 transition-colors cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Classement</span>
        </button>
      </div>
    </div>
  );
};
