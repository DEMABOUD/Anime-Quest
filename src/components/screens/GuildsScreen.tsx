import React, { useState, useEffect, useRef } from 'react';
import { Shield, Swords, Users, Trophy, AlertTriangle, Plus, Check, LogOut, Flame, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { UserProfile, Guild } from '../../types';
import { GuildBadge } from '../GuildBadge';
import { compressImageFromFile, isImageUrl } from '../../utils/imageUtils';
import { 
  subscribeGuilds, 
  seedStarterGuildsIfEmpty, 
  joinGuild, 
  leaveGuild,
  createGuild 
} from '../../services/guildService';

interface GuildsScreenProps {
  currentUser: UserProfile;
  onStartGuildWar: (guild: Guild) => void;
  onNavigateToLeaderboard: () => void;
}

export const GuildsScreen: React.FC<GuildsScreenProps> = ({
  currentUser,
  onStartGuildWar,
  onNavigateToLeaderboard,
}) => {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create form state
  const [guildName, setGuildName] = useState('');
  const [guildManga, setGuildManga] = useState('One Piece');
  const [guildQuote, setGuildQuote] = useState('');
  const [guildBadge, setGuildBadge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingEmblem, setIsProcessingEmblem] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emblemInputRef = useRef<HTMLInputElement | null>(null);

  const handleEmblemSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingEmblem(true);
    setErrorMsg(null);
    try {
      const compressedData = await compressImageFromFile(file, 350, 0.85);
      setGuildBadge(compressedData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de charger cette image.');
    } finally {
      setIsProcessingEmblem(false);
    }
  };

  useEffect(() => {
    seedStarterGuildsIfEmpty();
    const unsub = subscribeGuilds((list) => {
      setGuilds(list);
    });
    return () => unsub();
  }, []);

  const myGuild = guilds.find(g => g.id === currentUser.guildId || g.memberUids?.includes(currentUser.uid));

  const handleCreateGuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guildName.trim() || !guildManga.trim()) {
      setErrorMsg('Veuillez renseigner le nom et le manga.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await createGuild(guildName, guildManga, guildQuote, guildBadge, currentUser);
      setShowCreateModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la création de la guilde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* 1. MY GUILD VIEW (Mockup 10) */}
      {myGuild ? (
        <div className="space-y-6">
          {/* Main Guild Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/40">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <GuildBadge
                badge={myGuild.badge}
                name={myGuild.name}
                sizeClassName="w-20 h-20"
                className="border-2 border-cyan-400 shadow-xl"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                    {myGuild.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-300 text-xs font-bold font-mono">
                    Niv. {myGuild.level}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-400/50 text-indigo-300 text-xs font-bold">
                    {myGuild.manga}
                  </span>
                </div>
                <p className="text-xs italic text-slate-300 mb-3">
                  « {myGuild.quote} »
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-300">
                  <span>Membres : <strong className="text-white">{myGuild.memberCount}/{myGuild.maxMembers}</strong></span>
                  <span>Chef : <strong className="text-cyan-400">{myGuild.leaderName}</strong></span>
                  <span>XP : <strong className="text-cyan-300">{myGuild.xp} pts</strong></span>
                </div>
              </div>

              {/* Leave Guild Button */}
              <button
                onClick={() => leaveGuild(myGuild.id, currentUser)}
                title="Quitter la guilde"
                className="p-2 rounded-xl bg-slate-900/80 border border-red-500/40 text-red-400 hover:bg-red-950/50 text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-center sm:self-start"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Quitter</span>
              </button>
            </div>
          </div>

          {/* 20 Cumulative Losses Warning Box per Spec */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/50 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <span>Survie de Guilde : {myGuild.losses} / 20 défaites subies</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/80 font-mono text-white">
                  {20 - myGuild.losses} vies restantes
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Règle officielle Anime Quest : Toute guilde accumulant 20 défaites en combat est définitivement dissoute du serveur. Battez-vous ensemble jusqu'au bout !
              </p>
            </div>
          </div>

          {/* Guild War Event Card (Mockup 10) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <Swords className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                  Événement Actif
                </div>
                <h4 className="text-base font-bold font-display text-white">
                  Combat de Guilde Inter-Mangas
                </h4>
                <p className="text-xs text-slate-400">
                  20 questions (10 questions de votre manga vs 10 questions du manga adverse). 10s par question.
                </p>
              </div>
            </div>

            <button
              onClick={() => onStartGuildWar(myGuild)}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-slate-950 font-extrabold font-display uppercase tracking-wider text-xs shadow-lg shadow-red-950/50 transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
            >
              Lancer le Combat
            </button>
          </div>
        </div>
      ) : (
        /* If user does not have a guild yet */
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 text-3xl">
            🛡️
          </div>
          <h3 className="text-xl font-bold font-display text-white">
            Vous ne faites partie d'aucune guilde
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Rejoignez une guilde officielle dédiée à votre manga préféré ou fondez la vôtre pour participer aux combats collectifs !
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Créer ma Guilde</span>
            </button>
          </div>
        </div>
      )}

      {/* Guilds List / Directory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
          <span>Toutes les Guildes Actives ({guilds.length})</span>
          <button
            onClick={onNavigateToLeaderboard}
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            Voir Classement Top 50
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guilds.map((g) => {
            const isMyGuild = g.id === myGuild?.id;
            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isMyGuild
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <GuildBadge
                        badge={g.badge}
                        name={g.name}
                        sizeClassName="w-10 h-10"
                      />
                      <div>
                        <h4 className="text-sm font-bold font-display text-white">{g.name}</h4>
                        <div className="text-[11px] text-cyan-400 font-mono">Manga : {g.manga}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                      Niv. {g.level}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 italic line-clamp-1 mb-3">
                    « {g.quote} »
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="text-[11px] font-mono text-slate-400">
                    {g.memberCount}/{g.maxMembers} membres • {g.wins}V / {g.losses}D
                  </div>
                  {!isMyGuild && (
                    <button
                      onClick={() => joinGuild(g.id, currentUser)}
                      className="py-1.5 px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Rejoindre
                    </button>
                  )}
                  {isMyGuild && (
                    <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ma Guilde
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Guild Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/40 shadow-2xl relative">
            <h3 className="text-lg font-bold font-display text-white mb-4">
              Créer une Nouvelle Guilde de Manga
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateGuild} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
                  Nom de la guilde *
                </label>
                <input
                  type="text"
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  placeholder="Ex : Chapeau de Paille, Gotei 13..."
                  maxLength={50}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
                  Manga associé *
                </label>
                <input
                  type="text"
                  value={guildManga}
                  onChange={(e) => setGuildManga(e.target.value)}
                  placeholder="Ex : One Piece, Naruto, Bleach..."
                  maxLength={50}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-1">
                  Devise / Citation
                </label>
                <input
                  type="text"
                  value={guildQuote}
                  onChange={(e) => setGuildQuote(e.target.value)}
                  placeholder="Ex : Ensemble jusqu'au bout !"
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
                  Emblème personnalisé de la guilde (depuis votre galerie)
                </label>
                <input
                  ref={emblemInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleEmblemSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-2">
                  <div
                    onClick={() => emblemInputRef.current?.click()}
                    className="relative w-16 h-16 rounded-2xl bg-slate-950 border-2 border-cyan-400/60 overflow-hidden flex items-center justify-center cursor-pointer group shrink-0 shadow-md"
                  >
                    {guildBadge ? (
                      isImageUrl(guildBadge) ? (
                        <img
                          src={guildBadge}
                          alt="Emblème de guilde"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-3xl select-none">{guildBadge}</span>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <ImageIcon className="w-6 h-6 mb-0.5" />
                        <span className="text-[9px] uppercase font-bold">Galerie</span>
                      </div>
                    )}

                    {isProcessingEmblem && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => emblemInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{guildBadge && isImageUrl(guildBadge) ? 'Changer l’image' : 'Choisir dans la galerie'}</span>
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Sélectionnez le logo officiel ou blason de votre guilde.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Ou choisir un symbole rapide :
                  </span>
                  <div className="flex gap-2">
                    {['☠️', '⚔️', '☁️', '👁️', '🛡️', '🐉', '🔥', '👑'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setGuildBadge(icon)}
                        className={`w-8 h-8 rounded-xl border text-lg flex items-center justify-center cursor-pointer transition-all ${
                          guildBadge === icon ? 'border-cyan-400 bg-cyan-950 scale-105' : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
