import React, { useState } from 'react';
import { Play, Swords, Trophy, Users, Check, Sparkles } from 'lucide-react';
import { UserProfile, MatchOpponent } from '../../types';
import { MatchmakingModal } from '../MatchmakingModal';
import { PlayWithFriendsModal } from '../PlayWithFriendsModal';

interface QuizLobbyScreenProps {
  userProfile: UserProfile;
  onStartGame: (
    mode: 'solo' | 'duel' | 'tournament', 
    mangaCategory: string, 
    opponent?: MatchOpponent
  ) => void;
}

export const QuizLobbyScreen: React.FC<QuizLobbyScreenProps> = ({
  userProfile,
  onStartGame,
}) => {
  const [activeTab, setActiveTab] = useState<'solo' | 'duel' | 'friends' | 'tournament'>('duel');
  const [selectedManga, setSelectedManga] = useState<string>('Tous');

  // Modals
  const [showMatchmakingModal, setShowMatchmakingModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const categories = [
    'Tous',
    'One Piece',
    'Naruto',
    'Dragon Ball',
    'Bleach',
    'Jujutsu Kaisen',
    'Demon Slayer',
    'Hunter x Hunter',
    'L’Attaque des Titans',
    'Solo Leveling',
  ];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-wide">
            Centre des Quiz & Compétitions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            20 questions par partie • 5 choix • 15s de réflexion • Barème officiel (10 à 50 pts).
          </p>
        </div>

        {/* Tab pill switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {(['solo', 'duel', 'friends', 'tournament'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setActiveTab(mode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeTab === mode
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'solo' ? 'Solo' : mode === 'duel' ? 'Duel en direct' : mode === 'friends' ? 'Jouer entre amis' : 'Tournoi'}
            </button>
          ))}
        </div>
      </div>

      {/* Manga Category Selector */}
      <div>
        <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-2.5">
          Sélectionner le manga / univers :
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((manga) => {
            const isSelected = selectedManga === manga;
            return (
              <button
                key={manga}
                onClick={() => setSelectedManga(manga)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{manga}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Cards matching requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Quiz Classique */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
          activeTab === 'solo' 
            ? 'bg-gradient-to-b from-slate-900 via-cyan-950/20 to-slate-950 border-cyan-500/50 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/40' 
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Quiz Classique</h3>
            <p className="text-slate-400 text-xs mt-1 mb-4">
              Joue à ton rythme pour t'entraîner et perfectionner tes connaissances manga.
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1.5 mb-5 font-mono">
              <li className="flex items-center gap-2">✓ 20 questions chronométrées</li>
              <li className="flex items-center gap-2">✓ Progression & points réels</li>
              <li className="flex items-center gap-2">✓ Pas de pression de duel</li>
            </ul>
          </div>
          <button
            onClick={() => onStartGame('solo', selectedManga)}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
          >
            Lancer Solo ({selectedManga})
          </button>
        </div>

        {/* Card 2: Duel en Direct (Vrai Joueur / Matchmaking) */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
          activeTab === 'duel' 
            ? 'bg-gradient-to-b from-slate-900 via-violet-950/30 to-slate-950 border-violet-500/50 shadow-xl shadow-violet-950/30 ring-1 ring-violet-500/40' 
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-950 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <Swords className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-950 border border-violet-500/40 text-violet-300 text-[10px] font-bold uppercase animate-pulse">
                Matchmaking Réel
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white">Duel en Direct</h3>
            <p className="text-slate-400 text-xs mt-1 mb-4">
              Matchmaking avec de vrais joueurs en ligne. Si aucun joueur n'est connecté, un robot étiqueté est assigné.
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1.5 mb-5 font-mono">
              <li className="flex items-center gap-2">✓ Vrais adversaires en direct</li>
              <li className="flex items-center gap-2">✓ Fallback robot transparent</li>
              <li className="flex items-center gap-2">✓ Victoire mondiale pour le 1er</li>
            </ul>
          </div>
          <button
            onClick={() => setShowMatchmakingModal(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-violet-500/20"
          >
            Chercher un Duel ({selectedManga})
          </button>
        </div>

        {/* Card 3: NOUVEAU - Jouer avec des Amis */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
          activeTab === 'friends' 
            ? 'bg-gradient-to-b from-slate-900 via-cyan-950/30 to-slate-950 border-cyan-400/70 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400/50' 
            : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 text-[10px] font-bold uppercase">
                Entre Amis
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white">Jouer entre Amis</h3>
            <p className="text-slate-400 text-xs mt-1 mb-4">
              Défiez directement l'un de vos amis ou créez une salle privée avec code d'accès !
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1.5 mb-5 font-mono">
              <li className="flex items-center gap-2">✓ Invitation directe entre amis</li>
              <li className="flex items-center gap-2">✓ Salle privée avec code</li>
              <li className="flex items-center gap-2">✓ Match 100% réel et privé</li>
            </ul>
          </div>
          <button
            onClick={() => setShowFriendsModal(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-cyan-500/20"
          >
            Inviter un Ami ({selectedManga})
          </button>
        </div>

        {/* Card 4: Tournoi Royal */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
          activeTab === 'tournament' 
            ? 'bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 border-amber-500/50 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/40' 
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Grand Tournoi (10 Joueurs)</h3>
            <p className="text-slate-400 text-xs mt-1 mb-4">
              Arène royale regroupant jusqu'à 10 joueurs. Un seul champion sacré pour le classement mondial.
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1.5 mb-5 font-mono">
              <li className="flex items-center gap-2">✓ Jusqu'à 10 participants</li>
              <li className="flex items-center gap-2">✓ 20 questions pan-anime</li>
              <li className="flex items-center gap-2">✓ Titre d'honneur exclusif</li>
            </ul>
          </div>
          <button
            onClick={() => onStartGame('tournament', selectedManga)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-amber-500/20"
          >
            Rejoindre Tournoi ({selectedManga})
          </button>
        </div>
      </div>

      {/* Official Rules Box */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-900/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Règles Officielles du Système de Quiz Anime Quest
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-emerald-400 font-bold">Facile : </span>
            <span>10 pts</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-cyan-400 font-bold">Moyenne : </span>
            <span>20 pts</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-amber-400 font-bold">Difficile : </span>
            <span>30 pts</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-red-400 font-bold">Extrême : </span>
            <span>50 pts</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          • Classement mondial : Seul le joueur terminant à la 1ère place d'une partie reçoit une victoire officielle au classement mondial.
        </p>
      </div>

      {/* Matchmaking Modal */}
      <MatchmakingModal
        currentUser={userProfile}
        selectedManga={selectedManga}
        isOpen={showMatchmakingModal}
        onClose={() => setShowMatchmakingModal(false)}
        onMatchFound={(opponent) => {
          onStartGame('duel', selectedManga, opponent);
        }}
      />

      {/* Play with Friends Modal */}
      <PlayWithFriendsModal
        currentUser={userProfile}
        selectedManga={selectedManga}
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        onStartFriendDuel={(friendName, friendPhoto, isBot, manga) => {
          onStartGame('duel', manga, {
            isBot,
            uid: `friend_${Date.now()}`,
            displayName: friendName,
            photoURL: friendPhoto,
            tag: '[AMI JOUEUR]',
          });
        }}
      />
    </div>
  );
};
