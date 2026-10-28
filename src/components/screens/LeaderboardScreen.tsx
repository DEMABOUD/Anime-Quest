import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, Shield, Users, RefreshCw } from 'lucide-react';
import { UserProfile, Guild } from '../../types';
import { GuildBadge } from '../GuildBadge';
import { getGlobalLeaderboard } from '../../services/userService';
import { subscribeGuilds } from '../../services/guildService';

interface LeaderboardScreenProps {
  currentUser: UserProfile;
  onViewUserProfile?: (user: UserProfile) => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  currentUser,
  onViewUserProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'players' | 'guilds'>('players');
  const [timeFilter, setTimeFilter] = useState<'global' | 'week' | 'month'>('global');
  
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  // Load leaderboard data
  const loadData = async () => {
    setLoading(true);
    try {
      const topPlayers = await getGlobalLeaderboard();
      // Ensure current user is in or merged if new
      if (!topPlayers.some(p => p.uid === currentUser.uid)) {
        topPlayers.push(currentUser);
      }
      topPlayers.sort((a, b) => b.wins - a.wins || b.points - a.points);
      setPlayers(topPlayers);
    } catch (err) {
      console.error('Erreur chargement classement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubGuilds = subscribeGuilds((gList) => {
      setGuilds(gList);
    });
    return () => unsubGuilds();
  }, [currentUser]);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">
            Classement Mondial
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Validation stricte : Seule la 1ère place d'un match octroie une Victoire Mondiale.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Main Switcher: Joueurs vs Guildes (Mockup 7) */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 max-w-xs mx-auto">
        <button
          onClick={() => setActiveTab('players')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'players'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Joueurs</span>
        </button>
        <button
          onClick={() => setActiveTab('guilds')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'guilds'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Guildes (Top 50)</span>
        </button>
      </div>

      {/* Sub Filters: Global, Semaine, Mois (Mockup 7) */}
      <div className="flex justify-center gap-2">
        {(['global', 'week', 'month'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
              timeFilter === filter
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {filter === 'global' ? 'Global' : filter === 'week' ? 'Semaine' : 'Mois'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Cards */}
      {activeTab === 'players' && players.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 max-w-lg mx-auto items-end">
          {/* #2 Rank */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 text-center relative flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-950 text-[10px] font-bold font-mono flex items-center justify-center mb-1">
              2
            </span>
            <img src={players[1].photoURL} alt={players[1].displayName} className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 shadow-sm mb-1.5" />
            <div className="text-xs font-bold text-white truncate max-w-full">{players[1].displayName}</div>
            <div className="text-[11px] font-mono text-cyan-400 font-bold">{players[1].wins} victoires</div>
            <div className="text-[9px] text-slate-400">{players[1].points} pts</div>
          </div>

          {/* #1 Rank (Center, Taller, Glowing) */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-400/80 text-center relative flex flex-col items-center shadow-xl shadow-amber-500/20 scale-105">
            <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold font-display flex items-center gap-1 shadow-md">
              <Trophy className="w-3 h-3 fill-current" />
              <span>CHAMPION</span>
            </div>
            <img src={players[0].photoURL} alt={players[0].displayName} className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md mb-2 mt-1" />
            <div className="text-xs sm:text-sm font-extrabold text-white truncate max-w-full">{players[0].displayName}</div>
            <div className="text-xs font-mono text-amber-300 font-bold">{players[0].wins} victoires</div>
            <div className="text-[10px] text-slate-400">{players[0].points} pts</div>
          </div>

          {/* #3 Rank */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-900/40 text-center relative flex flex-col items-center">
            <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-bold font-mono flex items-center justify-center mb-1">
              3
            </span>
            <img src={players[2].photoURL} alt={players[2].displayName} className="w-12 h-12 rounded-full object-cover border-2 border-amber-600 shadow-sm mb-1.5" />
            <div className="text-xs font-bold text-white truncate max-w-full">{players[2].displayName}</div>
            <div className="text-[11px] font-mono text-cyan-400 font-bold">{players[2].wins} victoires</div>
            <div className="text-[9px] text-slate-400">{players[2].points} pts</div>
          </div>
        </div>
      )}

      {/* Leaderboard List matching Mockup 7 */}
      <div className="space-y-2">
        {activeTab === 'players' ? (
          players.map((player, index) => {
            const isMe = player.uid === currentUser.uid;
            return (
              <div
                key={player.uid}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isMe
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 text-center font-mono font-bold text-sm text-slate-400">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>

                  <img
                    src={player.photoURL}
                    alt={player.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-display text-white truncate">
                        {player.displayName}
                      </span>
                      {isMe && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 text-[9px] font-bold">
                          Vous
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>@{player.username}</span>
                      <span>•</span>
                      <span className="text-cyan-400">Niv. {player.level || 1}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-amber-300">
                    {player.wins} <span className="text-[10px] text-slate-400 font-sans">Victoires</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {player.points} pts
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          guilds.map((guild, index) => (
            <div
              key={guild.id}
              className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 text-center font-mono font-bold text-sm text-slate-400">
                  {index + 1}
                </div>
                <GuildBadge
                  badge={guild.badge}
                  name={guild.name}
                  sizeClassName="w-10 h-10"
                />
                <div>
                  <div className="text-sm font-bold font-display text-white">
                    {guild.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {guild.manga} • Niv. {guild.level} • {guild.memberCount}/{guild.maxMembers} membres
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-bold font-mono text-amber-300">
                  {guild.wins} <span className="text-[10px] text-slate-400 font-sans">Victoires</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {guild.losses}/20 défaites • {guild.successRate}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
