import React, { useState, useEffect } from 'react';
import { Swords, Loader2, Bot, UserCheck, ShieldAlert, X } from 'lucide-react';
import { UserProfile, MatchOpponent } from '../types';
import { searchRealMatchmaking } from '../services/gameService';

interface MatchmakingModalProps {
  currentUser: UserProfile;
  selectedManga: string;
  isOpen: boolean;
  onClose: () => void;
  onMatchFound: (opponent: MatchOpponent) => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({
  currentUser,
  selectedManga,
  isOpen,
  onClose,
  onMatchFound,
}) => {
  const [statusText, setStatusText] = useState("Connexion au serveur de matchmaking...");
  const [foundOpponent, setFoundOpponent] = useState<MatchOpponent | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setFoundOpponent(null);
      setIsSearching(true);
      return;
    }

    let isMounted = true;

    async function runMatchmaking() {
      setIsSearching(true);
      try {
        const result = await searchRealMatchmaking(
          currentUser, 
          selectedManga, 
          (text) => {
            if (isMounted) setStatusText(text);
          }
        );

        if (!isMounted) return;

        setFoundOpponent(result.opponent);
        setIsSearching(false);
      } catch (err) {
        console.error('Matchmaking error:', err);
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }

    runMatchmaking();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser, selectedManga]);

  if (!isOpen) return null;

  const handleStartDuel = () => {
    if (foundOpponent) {
      onMatchFound(foundOpponent);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/40 shadow-2xl relative text-center">
        
        {/* Cancel button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Searching State */}
        {isSearching && (
          <div className="py-6 space-y-5">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
              <div className="absolute -inset-2 rounded-full border border-violet-500/40 animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/30">
                <Swords className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold font-display text-white">
                Recherche de Joueur Réel
              </h3>
              <p className="text-xs text-cyan-300 font-mono mt-1">
                Catégorie : {selectedManga}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{statusText}</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
              Le système vérifie la présence de joueurs réels connectés. Si aucun joueur n'est en ligne, un Robot d'Entraînement sera assigné.
            </p>
          </div>
        )}

        {/* Opponent Found State */}
        {!isSearching && foundOpponent && (
          <div className="py-4 space-y-5 animate-fadeIn">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border">
              {foundOpponent.isBot ? (
                <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border-amber-500/40">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>0 Joueurs en ligne • Adjonction Robot IA</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 border-emerald-500/40">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Joueur Réel Connecté !</span>
                </div>
              )}
            </div>

            {/* Duel Faceoff Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-around">
              {/* Current user */}
              <div className="flex flex-col items-center">
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-cyan-400 shadow-md mb-1.5"
                />
                <div className="text-xs font-bold text-white font-display max-w-[100px] truncate">
                  {currentUser.displayName}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono">Niv. {currentUser.level}</div>
              </div>

              {/* VS */}
              <div className="text-xl font-extrabold font-display text-red-500 px-3">
                VS
              </div>

              {/* Opponent */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={foundOpponent.photoURL}
                    alt={foundOpponent.displayName}
                    className={`w-14 h-14 rounded-full object-cover border-2 shadow-md mb-1.5 ${
                      foundOpponent.isBot ? 'border-amber-400 bg-amber-950/40' : 'border-emerald-400'
                    }`}
                  />
                  {foundOpponent.isBot && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-amber-950 border border-amber-400 text-[8px] font-bold text-amber-300">
                      BOT
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white font-display max-w-[120px] truncate">
                  {foundOpponent.displayName}
                </div>
                <div className={`text-[10px] font-mono font-bold ${
                  foundOpponent.isBot ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {foundOpponent.tag}
                </div>
              </div>
            </div>

            {/* Explicit Notice when it is a Robot */}
            {foundOpponent.isBot && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-left text-xs text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Avis Transparent Robot IA :</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Aucun joueur réel n’était en file d’attente. Conformément aux règles, cet adversaire est explicitement un <strong>Robot d'Entraînement IA</strong> sans faux identifiant humain.
                </p>
              </div>
            )}

            <button
              onClick={handleStartDuel}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold font-display uppercase tracking-wider text-xs shadow-xl transition-transform hover:scale-[1.02] cursor-pointer"
            >
              Lancer le Combat Maintenant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
