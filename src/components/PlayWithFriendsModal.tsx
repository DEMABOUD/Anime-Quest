import React, { useState, useEffect } from 'react';
import { Users, X, Swords, KeyRound, Copy, Check, Loader2, Sparkles, Send } from 'lucide-react';
import { UserProfile, Friendship } from '../types';
import { subscribeFriendships } from '../services/socialService';
import { sendFriendChallenge } from '../services/gameService';

interface PlayWithFriendsModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onStartFriendDuel: (opponentName: string, opponentPhoto: string, isBot: boolean, manga: string) => void;
  selectedManga: string;
}

export const PlayWithFriendsModal: React.FC<PlayWithFriendsModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onStartFriendDuel,
  selectedManga,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'room_code'>('friends');
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [challengingUid, setChallengingUid] = useState<string | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState<string | null>(null);

  // Private room code
  const [myRoomCode, setMyRoomCode] = useState<string>('');
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Generate random room code
    const randomCode = 'QUEST-' + Math.floor(100 + Math.random() * 900);
    setMyRoomCode(randomCode);

    const unsub = subscribeFriendships(currentUser.uid, (list) => {
      setFriendships(list.filter(f => f.status === 'accepted'));
    });

    return () => unsub();
  }, [isOpen, currentUser.uid]);

  if (!isOpen) return null;

  const handleChallengeFriend = async (friendUid: string, friendName: string, friendPhoto: string) => {
    setChallengingUid(friendUid);
    setChallengeSuccess(null);
    try {
      await sendFriendChallenge(currentUser, friendUid, friendName, selectedManga);
      setChallengeSuccess(`Invitation de duel envoyée à ${friendName} !`);
      
      // Start the match for the sender
      setTimeout(() => {
        onStartFriendDuel(friendName, friendPhoto, false, selectedManga);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Erreur défi ami:', err);
      // Fallback direct start
      onStartFriendDuel(friendName, friendPhoto, false, selectedManga);
      onClose();
    } finally {
      setChallengingUid(null);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myRoomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomCode.trim()) return;
    // Start duel with friend via room code
    onStartFriendDuel(`Ami de Salle (${inputRoomCode.toUpperCase()})`, 'https://api.dicebear.com/7.x/bottts/svg?seed=FriendRoom', false, selectedManga);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1329] border border-cyan-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Jouer avec des Amis</h3>
              <p className="text-[11px] text-cyan-400">Univers sélectionné : {selectedManga}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'friends'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mes Amis en Ligne
          </button>
          <button
            onClick={() => setActiveTab('room_code')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'room_code'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Code de Salle Privée
          </button>
        </div>

        {challengeSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{challengeSuccess}</span>
          </div>
        )}

        {/* TAB 1: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
              Choisir un ami à défier ({friendships.length})
            </div>

            {friendships.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs space-y-2">
                <p>Vous n'avez pas encore d'amis connectés.</p>
                <p className="text-[11px] text-slate-500">
                  Ajoutez vos amis depuis l'onglet Communauté ou utilisez le Code de Salle Privée pour inviter un ami instantanément !
                </p>
                <button
                  onClick={() => setActiveTab('room_code')}
                  className="mt-2 py-1.5 px-4 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer"
                >
                  Utiliser un Code de Salle
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {friendships.map((f) => {
                  const isSender = f.senderUid === currentUser.uid;
                  const friendUid = isSender ? f.receiverUid : f.senderUid;
                  const friendName = isSender ? f.receiverName : f.senderName;
                  const friendUsername = isSender ? f.receiverUsername : f.senderUsername;
                  const friendPhoto = isSender ? f.receiverPhoto : f.senderPhoto;
                  const isBusy = challengingUid === friendUid;

                  return (
                    <div
                      key={f.id}
                      className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={friendPhoto}
                            alt={friendName}
                            className="w-10 h-10 rounded-full object-cover border border-cyan-400"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950" />
                        </div>
                        <div>
                          <div className="text-sm font-bold font-display text-white">{friendName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{friendUsername}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleChallengeFriend(friendUid, friendName, friendPhoto)}
                        disabled={isBusy}
                        className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Swords className="w-3.5 h-3.5" />
                            <span>Défier</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ROOM CODE */}
        {activeTab === 'room_code' && (
          <div className="space-y-4">
            {/* Create Room */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                <span>Votre Code de Salle Privée</span>
              </div>
              <p className="text-xs text-slate-400">
                Partagez ce code avec votre ami pour qu'il rejoigne votre duel en direct :
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-cyan-500/50 text-center font-mono font-bold text-lg text-cyan-300 tracking-wider">
                  {myRoomCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  title="Copier le code"
                >
                  {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={() => {
                  onStartFriendDuel(`Partie Privée [${myRoomCode}]`, 'https://api.dicebear.com/7.x/bottts/svg?seed=FriendRoom', false, selectedManga);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Ouvrir la salle et attendre mon ami
              </button>
            </div>

            {/* Join Room */}
            <form onSubmit={handleJoinByCode} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">
                Rejoindre une Salle avec un Code
              </div>
              <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex : QUEST-842"
                maxLength={12}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 font-mono text-center uppercase tracking-widest text-cyan-300 outline-none focus:border-cyan-400 text-sm"
              />
              <button
                type="submit"
                disabled={!inputRoomCode.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                Rejoindre le Duel de mon Ami
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
