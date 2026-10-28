import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  MessageSquare, 
  Swords, 
  PhoneCall, 
  Check, 
  X, 
  Users, 
  Loader2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { UserProfile, Friendship, GroupChat } from '../../types';
import { GroupAvatar } from '../GroupAvatar';
import { 
  searchUsers 
} from '../../services/userService';
import { 
  sendFriendRequest, 
  respondFriendRequest, 
  subscribeFriendships,
  subscribeGroups,
  joinGroup 
} from '../../services/socialService';

interface CommunityScreenProps {
  currentUser: UserProfile;
  onOpenChat: (targetUser: { uid: string; displayName: string; photoURL: string }) => void;
  onOpenGroupChat: (group: GroupChat) => void;
  onStartCall: (targetUser: { uid: string; displayName: string; photoURL: string }) => void;
  onStartDuelWithFriend: (friendName: string) => void;
  onOpenCreateGroup: () => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  currentUser,
  onOpenChat,
  onOpenGroupChat,
  onStartCall,
  onStartDuelWithFriend,
  onOpenCreateGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'amis' | 'groupes' | 'messages'>('amis');
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Social data
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [groups, setGroups] = useState<GroupChat[]>([]);

  useEffect(() => {
    const unsubFriendships = subscribeFriendships(currentUser.uid, (list) => {
      setFriendships(list);
    });

    const unsubGroups = subscribeGroups((gList) => {
      setGroups(gList);
    });

    return () => {
      unsubFriendships();
      unsubGroups();
    };
  }, [currentUser.uid]);

  // Handle Search by username
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setActionFeedback(null);
    try {
      const results = await searchUsers(searchTerm);
      // Filter out self
      setSearchResults(results.filter(u => u.uid !== currentUser.uid));
    } catch {
      setActionFeedback('Erreur lors de la recherche.');
    } finally {
      setIsSearching(false);
    }
  };

  // Send request
  const handleSendRequest = async (target: UserProfile) => {
    try {
      await sendFriendRequest(currentUser, target);
      setActionFeedback(`Demande d'amitié envoyée à @${target.username} !`);
    } catch (err: any) {
      setActionFeedback(err.message || 'Impossible d’envoyer la demande.');
    }
  };

  // Accepted friends list
  const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
  // Pending requests where current user is receiver
  const pendingRequests = friendships.filter(f => f.status === 'pending' && f.receiverUid === currentUser.uid);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {/* Top Tabs (Mockup 8: Amis, Groupes, Messages) */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm mx-auto">
        {(['amis', 'groupes', 'messages'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold font-display uppercase tracking-wider capitalize transition-all cursor-pointer relative ${
              activeTab === tab
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab === 'amis' ? 'Amis' : tab === 'groupes' ? 'Groupes' : 'Messages'}</span>
            {tab === 'amis' && pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search Input Bar (Mockup 8) */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un joueur par son nom d’utilisateur (@nom)..."
          className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/70 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-xs placeholder:text-slate-500 transition-all font-sans"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Rechercher'}
        </button>
      </form>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 text-xs flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-cyan-400 font-bold">×</button>
        </div>
      )}

      {/* Search Results Display */}
      {searchResults.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Résultats de recherche ({searchResults.length})
          </div>
          <div className="space-y-2">
            {searchResults.map((user) => {
              const alreadyFriend = friendships.some(f => 
                (f.senderUid === user.uid || f.receiverUid === user.uid) && f.status === 'accepted'
              );
              const alreadyPending = friendships.some(f => 
                (f.senderUid === user.uid || f.receiverUid === user.uid) && f.status === 'pending'
              );

              return (
                <div key={user.uid} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
                    <div>
                      <div className="text-sm font-bold text-white font-display">{user.displayName}</div>
                      <div className="text-xs text-slate-400 font-mono">@{user.username} • Niv. {user.level || 1}</div>
                    </div>
                  </div>

                  <div>
                    {alreadyFriend ? (
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Ami
                      </span>
                    ) : alreadyPending ? (
                      <span className="text-xs text-amber-400 font-semibold">En attente</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user)}
                        className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: AMIS */}
      {activeTab === 'amis' && (
        <div className="space-y-4">
          {/* Pending Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Demandes d’amitié reçues ({pendingRequests.length})
              </div>
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={req.senderPhoto} alt={req.senderName} className="w-9 h-9 rounded-full object-cover border border-amber-400" />
                      <div>
                        <div className="text-xs font-bold text-white font-display">{req.senderName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{req.senderUsername}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => respondFriendRequest(req.id, 'accepted')}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
                        title="Accepter"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        onClick={() => respondFriendRequest(req.id, 'declined')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Refuser"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List (Mockup 8) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
              <span>Mes Amis ({acceptedFriendships.length})</span>
            </div>

            {acceptedFriendships.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                Vous n'avez pas encore d'amis ajoutés. Utilisez la barre de recherche ci-dessus pour rechercher un ami par son nom d'utilisateur unique !
              </div>
            ) : (
              acceptedFriendships.map((f) => {
                const isSender = f.senderUid === currentUser.uid;
                const friendUid = isSender ? f.receiverUid : f.senderUid;
                const friendName = isSender ? f.receiverName : f.senderName;
                const friendUsername = isSender ? f.receiverUsername : f.senderUsername;
                const friendPhoto = isSender ? f.receiverPhoto : f.senderPhoto;

                return (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friendPhoto}
                          alt={friendName}
                          className="w-11 h-11 rounded-full object-cover border border-cyan-400"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" title="En ligne" />
                      </div>
                      <div>
                        <div className="text-sm font-bold font-display text-white">{friendName}</div>
                        <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <span>En ligne</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 font-mono">@{friendUsername}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Social Actions (Duel, Message, Call) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onStartDuelWithFriend(friendName)}
                        title="Défier en Duel"
                        className="p-2 rounded-xl bg-violet-950/80 border border-violet-500/40 text-violet-300 hover:bg-violet-900 transition-colors cursor-pointer"
                      >
                        <Swords className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenChat({ uid: friendUid, displayName: friendName, photoURL: friendPhoto })}
                        title="Envoyer un message"
                        className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onStartCall({ uid: friendUid, displayName: friendName, photoURL: friendPhoto })}
                        title="Lancer un appel vocal / vidéo"
                        className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition-colors cursor-pointer"
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GROUPES (Mockup 13 & 8) */}
      {activeTab === 'groupes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Groupes Communautaires ({groups.length})
            </span>
            <button
              onClick={onOpenCreateGroup}
              className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Créer un groupe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.map((grp) => {
              const isMember = grp.memberUids?.includes(currentUser.uid);
              return (
                <div
                  key={grp.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-2.5">
                      <GroupAvatar
                        avatarUrl={grp.avatarUrl}
                        name={grp.name}
                        category={grp.category}
                        sizeClassName="w-12 h-12"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold uppercase truncate">
                            {grp.category || 'Anime'}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {grp.memberUids?.length || 1} membre(s)
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold font-display text-white truncate">
                          {grp.name}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {grp.description || 'Groupe de fans d’anime et de discussions.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    {isMember ? (
                      <button
                        onClick={() => onOpenGroupChat(grp)}
                        className="w-full py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Ouvrir le salon
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await joinGroup(grp.id, currentUser.uid);
                          onOpenGroupChat(grp);
                        }}
                        className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Rejoindre le groupe
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MESSAGES (Mockup 12) */}
      {activeTab === 'messages' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
            Conversations Actives
          </div>

          {acceptedFriendships.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
              Pour discuter en privé, ajoutez d'abord un joueur en ami.
            </div>
          ) : (
            acceptedFriendships.map((f) => {
              const isSender = f.senderUid === currentUser.uid;
              const friendUid = isSender ? f.receiverUid : f.senderUid;
              const friendName = isSender ? f.receiverName : f.senderName;
              const friendPhoto = isSender ? f.receiverPhoto : f.senderPhoto;

              return (
                <div
                  key={f.id}
                  onClick={() => onOpenChat({ uid: friendUid, displayName: friendName, photoURL: friendPhoto })}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img src={friendPhoto} alt={friendName} className="w-11 h-11 rounded-full object-cover border border-cyan-400" />
                    <div>
                      <div className="text-sm font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                        {friendName}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">
                        Cliquez pour ouvrir la conversation chiffrée
                      </div>
                    </div>
                  </div>
                  <MessageSquare className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
