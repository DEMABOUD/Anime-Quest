import React, { useState } from 'react';
import { Edit3, Trophy, Flame, Shield, Award, Sparkles, Swords, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  onOpenEditModal: () => void;
  onOpenLeaderboard: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  onOpenEditModal,
  onOpenLeaderboard,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'historique' | 'collection'>('general');

  const winRate = userProfile.totalGames > 0
    ? Math.round((userProfile.wins / userProfile.totalGames) * 100)
    : 0;

  const currentLevelXp = userProfile.xp % 500;
  const levelProgress = Math.min(100, Math.round((currentLevelXp / 500) * 100));

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Profile Header Card matching Mockup 6 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#0b1329] to-slate-950 border border-cyan-500/30 p-6 shadow-2xl text-center">
        <div className="absolute top-4 right-4">
          <button
            onClick={onOpenEditModal}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Modifier</span>
          </button>
        </div>

        {/* Avatar with glowing ring */}
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/20">
            <img
              src={userProfile.photoURL}
              alt={userProfile.displayName}
              className="w-full h-full rounded-full object-cover border-2 border-slate-950"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-[10px] font-bold text-cyan-300 font-mono">
            Niv. {userProfile.level}
          </div>
        </div>

        {/* Display name & username */}
        <h2 className="text-2xl font-bold font-display text-white">
          {userProfile.displayName}
        </h2>
        <div className="text-xs font-mono text-cyan-400 mt-0.5">
          @{userProfile.username}
        </div>

        {/* Rank Title badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-bold font-display uppercase tracking-wider mt-2 mb-3">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Rang : {userProfile.rankTitle}</span>
        </div>

        {/* XP Progress Bar */}
        <div className="max-w-xs mx-auto mb-4">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>XP : {currentLevelXp} / 500</span>
            <span>Niveau {userProfile.level + 1}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Biography (Cahier des charges Point D) */}
        <p className="text-xs text-slate-300 max-w-md mx-auto italic px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 leading-relaxed">
          « {userProfile.bio || 'Aucune biographie rédigée.'} »
        </p>

        {/* Key Stats Row (Mockup 6) */}
        <div className="grid grid-cols-3 gap-2 pt-5 border-t border-slate-800/80 mt-5">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Victoires</div>
            <div className="text-xl font-bold font-display text-emerald-400 mt-0.5">
              {userProfile.wins}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Défaites</div>
            <div className="text-xl font-bold font-display text-red-400 mt-0.5">
              {userProfile.losses}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Taux Victoire</div>
            <div className="text-xl font-bold font-display text-cyan-300 mt-0.5">
              {winRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Général, Historique, Collection (Mockup 6) */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm mx-auto">
        {(['general', 'historique', 'collection'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider capitalize transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'general' ? 'Général' : tab === 'historique' ? 'Historique' : 'Collection'}
          </button>
        ))}
      </div>

      {/* TAB 1: GÉNÉRAL */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Statistiques Globales de Compétition
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Total parties jouées : </span>
                <strong className="text-white font-mono">{userProfile.totalGames}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Points mondiaux : </span>
                <strong className="text-amber-300 font-mono">{userProfile.points} pts</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Rang actuel : </span>
                <strong className="text-amber-400 font-display">{userProfile.rankTitle}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">Niveau de joueur : </span>
                <strong className="text-cyan-400 font-mono">Niv. {userProfile.level}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>Voir ma position dans le Classement Mondial</span>
          </button>
        </div>
      )}

      {/* TAB 2: HISTORIQUE */}
      {activeTab === 'historique' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Dernières Activités
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-400" />
                <span>Duel Classique One Piece</span>
              </div>
              <span className="text-emerald-400 font-bold">+1 Victoire</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Combat de Guilde Inter-Mangas</span>
              </div>
              <span className="text-cyan-300 font-bold">+250 XP</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COLLECTION */}
      {activeTab === 'collection' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Badges & Titres Débloqués
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-center">
              <div className="text-2xl mb-1">👑</div>
              <div className="text-xs font-bold text-white">Fondateur</div>
              <div className="text-[10px] text-cyan-300">Saison 1</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 text-center">
              <div className="text-2xl mb-1">⚔️</div>
              <div className="text-xs font-bold text-white">Duelliste</div>
              <div className="text-[10px] text-amber-300">10+ duels</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-violet-500/40 text-center">
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-xs font-bold text-white">Gardien</div>
              <div className="text-[10px] text-violet-300">Guilde active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
