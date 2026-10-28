import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import { UserProfile, NavigationTab, Guild, GroupChat, MatchOpponent, FriendChallenge } from './types';
import { getUserProfile } from './services/userService';
import { subscribeFriendships } from './services/socialService';
import { subscribeIncomingChallenges, respondToChallenge, ROBOT_OPPONENT } from './services/gameService';
import { getQuizQuestions } from './data/questions';

// Components
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { AuthModal } from './components/AuthModal';
import { ProfileSetupModal } from './components/ProfileSetupModal';
import { SettingsModal } from './components/SettingsModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { CallModal } from './components/CallModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { checkIsAdmin, canViewInstallOption } from './services/adminService';
import { usePWAInstall } from './hooks/usePWAInstall';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { QuizLobbyScreen } from './components/screens/QuizLobbyScreen';
import { QuizGameScreen } from './components/screens/QuizGameScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { CommunityScreen } from './components/screens/CommunityScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { GuildsScreen } from './components/screens/GuildsScreen';
import { GuildWarScreen } from './components/screens/GuildWarScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

import { Swords, Check, X } from 'lucide-react';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Mandatory Profile Setup or Editing
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false);

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

  // Modals & Active Overlays
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [activeCallTarget, setActiveCallTarget] = useState<{ uid: string; displayName: string; photoURL: string } | null>(null);

  // PWA Installation: Strictly restricted to demaboudjunior07@gmail.com
  const { isInstallable, install } = usePWAInstall();
  const canInstallApp = Boolean(
    firebaseUser?.email && canViewInstallOption(firebaseUser.email)
  );

  const handleOpenInstall = async () => {
    if (!canInstallApp) return;
    if (isInstallable) {
      const success = await install();
      if (success) return;
    }
    setShowInstallModal(true);
  };

  // Admin and Quiz Oracle privileges
  const [isAdmin, setIsAdmin] = useState(false);
  const [oracleEnabled, setOracleEnabled] = useState(() => {
    return localStorage.getItem('animequest_admin_oracle') !== 'false';
  });

  const handleToggleOracle = (enabled: boolean) => {
    setOracleEnabled(enabled);
    localStorage.setItem('animequest_admin_oracle', String(enabled));
  };

  // Active Chat (Private or Group)
  const [activePrivateChat, setActivePrivateChat] = useState<{ uid: string; displayName: string; photoURL: string } | null>(null);
  const [activeGroupChat, setActiveGroupChat] = useState<GroupChat | null>(null);

  // Active In-game Quiz Match
  const [activeQuizMatch, setActiveQuizMatch] = useState<{
    mode: 'solo' | 'duel' | 'tournament';
    manga: string;
    opponent?: MatchOpponent;
  } | null>(null);

  // Active Guild War
  const [activeGuildWar, setActiveGuildWar] = useState<Guild | null>(null);

  // Social indicators
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [incomingChallenge, setIncomingChallenge] = useState<FriendChallenge | null>(null);

  // Listen to Google Authentication State & verify admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            setShowProfileSetup(false);
          } else {
            // First time login: mandatory profile setup!
            setShowProfileSetup(true);
          }

          // Check Admin status (demaboudjunior07@gmail.com or delegated admin)
          const adminStatus = await checkIsAdmin(user.uid, user.email);
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error('Erreur chargement profil Firestore:', err);
          setShowProfileSetup(true);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to pending friend requests & incoming friend challenges
  useEffect(() => {
    if (!userProfile) return;

    const unsubFriendships = subscribeFriendships(userProfile.uid, (list) => {
      const pending = list.filter(f => f.status === 'pending' && f.receiverUid === userProfile.uid);
      setPendingRequestsCount(pending.length);
    });

    const unsubChallenges = subscribeIncomingChallenges(userProfile.uid, (challenge) => {
      setIncomingChallenge(challenge);
    });

    return () => {
      unsubFriendships();
      unsubChallenges();
    };
  }, [userProfile?.uid]);

  // Handle Guest Mode (without coins/gems)
  const handleGuestMode = () => {
    const sampleProfile: UserProfile = {
      uid: 'guest_user_' + Math.floor(Math.random() * 10000),
      username: 'luffy_otaku',
      displayName: 'Luffy_976',
      photoURL: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
      bio: 'Futur Roi des Pirates et passionné d’anime ! Prêt pour tous les duels.',
      level: 12,
      xp: 320,
      wins: 342,
      losses: 118,
      totalGames: 460,
      points: 11320,
      rankTitle: 'Argent III',
      guildId: undefined,
      isOnline: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(sampleProfile);
    setIsAuthLoading(false);
  };

  // Launch a game
  const handleStartGame = (
    mode: 'solo' | 'duel' | 'tournament', 
    mangaCategory: string, 
    opponent?: MatchOpponent
  ) => {
    setActivePrivateChat(null);
    setActiveGroupChat(null);
    setActiveGuildWar(null);
    setActiveQuizMatch({
      mode,
      manga: mangaCategory,
      opponent: opponent || (mode === 'duel' ? ROBOT_OPPONENT : undefined),
    });
  };

  // Handle incoming challenge accept
  const handleAcceptChallenge = async () => {
    if (!incomingChallenge) return;
    await respondToChallenge(incomingChallenge.id, 'accepted');
    handleStartGame('duel', incomingChallenge.manga, {
      isBot: false,
      uid: incomingChallenge.fromUid,
      displayName: incomingChallenge.fromName,
      photoURL: incomingChallenge.fromPhoto,
      tag: '[AMI JOUEUR]',
    });
    setIncomingChallenge(null);
  };

  const handleDeclineChallenge = async () => {
    if (!incomingChallenge) return;
    await respondToChallenge(incomingChallenge.id, 'declined');
    setIncomingChallenge(null);
  };

  // Launch Guild War
  const handleStartGuildWar = (guild: Guild) => {
    setActiveQuizMatch(null);
    setActivePrivateChat(null);
    setActiveGroupChat(null);
    setActiveGuildWar(guild);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070b19] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/30 animate-pulse mb-4">
          ⚔️
        </div>
        <h2 className="text-xl font-bold font-display tracking-widest text-cyan-300">
          ANIME QUEST
        </h2>
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-cyan-400 animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  // Not logged in and not guest
  if (!userProfile && !showProfileSetup) {
    return (
      <AuthModal
        onSuccess={async (user) => {
          setFirebaseUser(user);
          const p = await getUserProfile(user.uid);
          if (p) {
            setUserProfile(p);
          } else {
            setShowProfileSetup(true);
          }
        }}
        onGuestMode={handleGuestMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* 1. Top Header */}
      {userProfile && (
        <Header
          userProfile={userProfile}
          onOpenProfile={() => {
            setActiveQuizMatch(null);
            setActiveGuildWar(null);
            setActivePrivateChat(null);
            setActiveGroupChat(null);
            setCurrentTab('profile');
          }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenLeaderboard={() => {
            setActiveQuizMatch(null);
            setActiveGuildWar(null);
            setActivePrivateChat(null);
            setActiveGroupChat(null);
            setCurrentTab('leaderboard');
          }}
          currentTab={currentTab}
          pendingRequestsCount={pendingRequestsCount}
          onOpenInstallModal={canInstallApp ? handleOpenInstall : undefined}
          isAdmin={isAdmin}
          onOpenAdminPanel={() => setShowAdminPanel(true)}
        />
      )}

      {/* Real-time Incoming Friend Duel Challenge Banner */}
      {incomingChallenge && (
        <div className="sticky top-16 z-50 max-w-lg mx-auto w-full px-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950 via-slate-900 to-cyan-950 border-2 border-violet-400 shadow-2xl flex items-center justify-between gap-3 animate-bounce">
            <div className="flex items-center gap-2.5">
              <img
                src={incomingChallenge.fromPhoto}
                alt={incomingChallenge.fromName}
                className="w-10 h-10 rounded-full object-cover border border-violet-400 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-white font-display">
                  {incomingChallenge.fromName} vous défie !
                </div>
                <div className="text-[10px] text-cyan-300 font-mono">
                  Manga : {incomingChallenge.manga}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleAcceptChallenge}
                className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Accepter</span>
              </button>
              <button
                onClick={handleDeclineChallenge}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        {/* If Active Quiz Match is running */}
        {activeQuizMatch && userProfile ? (
          <QuizGameScreen
            userProfile={userProfile}
            mode={activeQuizMatch.mode}
            questions={getQuizQuestions(20, activeQuizMatch.manga)}
            opponent={activeQuizMatch.opponent}
            isAdmin={isAdmin}
            oracleEnabled={oracleEnabled}
            onGameComplete={(newStats) => {
              if (newStats) {
                setUserProfile(prev => prev ? { ...prev, ...newStats } : null);
              }
              setActiveQuizMatch(null);
            }}
            onQuit={() => setActiveQuizMatch(null)}
          />
        ) : activeGuildWar && userProfile ? (
          /* If Active Guild War is running */
          <GuildWarScreen
            myGuild={activeGuildWar}
            currentUser={userProfile}
            isAdmin={isAdmin}
            oracleEnabled={oracleEnabled}
            onWarFinished={() => setActiveGuildWar(null)}
            onQuit={() => setActiveGuildWar(null)}
          />
        ) : activePrivateChat && userProfile ? (
          /* If Active Private Chat */
          <ChatScreen
            currentUser={userProfile}
            targetFriend={activePrivateChat}
            onBack={() => setActivePrivateChat(null)}
            onStartCall={(target) => setActiveCallTarget(target)}
          />
        ) : activeGroupChat && userProfile ? (
          /* If Active Group Chat */
          <ChatScreen
            currentUser={userProfile}
            group={activeGroupChat}
            onBack={() => setActiveGroupChat(null)}
          />
        ) : (
          /* Main Navigation Tabs */
          <>
            {currentTab === 'home' && userProfile && (
              <HomeScreen
                userProfile={userProfile}
                onNavigate={(tab) => setCurrentTab(tab)}
                onStartQuickDuel={(manga) => handleStartGame('duel', manga || 'Tous')}
                onOpenEvent={() => handleStartGame('duel', 'One Piece')}
                onOpenInstallModal={canInstallApp ? handleOpenInstall : undefined}
              />
            )}

            {currentTab === 'quiz' && userProfile && (
              <QuizLobbyScreen
                userProfile={userProfile}
                onStartGame={(mode, manga, opponent) => handleStartGame(mode, manga, opponent)}
              />
            )}

            {currentTab === 'community' && userProfile && (
              <CommunityScreen
                currentUser={userProfile}
                onOpenChat={(target) => setActivePrivateChat(target)}
                onOpenGroupChat={(grp) => setActiveGroupChat(grp)}
                onStartCall={(target) => setActiveCallTarget(target)}
                onStartDuelWithFriend={(friendName) => handleStartGame('duel', 'Tous', {
                  isBot: false,
                  uid: `friend_${Date.now()}`,
                  displayName: friendName,
                  photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + friendName,
                  tag: '[AMI JOUEUR]',
                })}
                onOpenCreateGroup={() => setShowCreateGroup(true)}
              />
            )}

            {currentTab === 'guilds' && userProfile && (
              <GuildsScreen
                currentUser={userProfile}
                onStartGuildWar={(guild) => handleStartGuildWar(guild)}
                onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
              />
            )}

            {currentTab === 'profile' && userProfile && (
              <ProfileScreen
                userProfile={userProfile}
                onOpenEditModal={() => {
                  setIsEditProfile(true);
                  setShowProfileSetup(true);
                }}
                onOpenLeaderboard={() => setCurrentTab('leaderboard')}
              />
            )}

            {currentTab === 'leaderboard' && userProfile && (
              <LeaderboardScreen
                currentUser={userProfile}
              />
            )}
          </>
        )}
      </main>

      {/* 3. Bottom Navigation Bar */}
      {!activeQuizMatch && !activeGuildWar && !activePrivateChat && !activeGroupChat && (
        <BottomNavigation
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          unreadCount={pendingRequestsCount}
        />
      )}

      {/* 4. Mandatory Profile Setup / Edit Modal */}
      {(showProfileSetup || isEditProfile) && (
        <ProfileSetupModal
          uid={firebaseUser?.uid || userProfile?.uid || 'guest_user'}
          initialProfile={isEditProfile ? userProfile : null}
          isOpen={true}
          isEditMode={isEditProfile}
          onSuccess={(newProf) => {
            setUserProfile(newProf);
            setShowProfileSetup(false);
            setIsEditProfile(false);
          }}
          onClose={isEditProfile ? () => {
            setIsEditProfile(false);
            setShowProfileSetup(false);
          } : undefined}
        />
      )}

      {/* 5. Create Group Modal */}
      {userProfile && (
        <CreateGroupModal
          currentUser={userProfile}
          isOpen={showCreateGroup}
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={(grp) => {
            setActiveGroupChat(grp);
          }}
        />
      )}

      {/* 6. Settings Modal */}
      {userProfile && (
        <SettingsModal
          currentUser={userProfile}
          isOpen={showSettings}
          isAdmin={isAdmin}
          onClose={() => setShowSettings(false)}
          onLogout={() => {
            setUserProfile(null);
            setFirebaseUser(null);
          }}
          onEditProfile={() => {
            setIsEditProfile(true);
            setShowProfileSetup(true);
          }}
          onOpenInstallModal={canInstallApp ? handleOpenInstall : undefined}
          onOpenAdminPanel={() => setShowAdminPanel(true)}
        />
      )}

      {/* 7. Voice / Video Call Modal */}
      {userProfile && (
        <CallModal
          currentUser={userProfile}
          targetUser={activeCallTarget}
          isOpen={Boolean(activeCallTarget)}
          onEndCall={() => setActiveCallTarget(null)}
        />
      )}

      {/* 8. PWA Install & Download Modal (Strictement réservé à demaboudjunior07@gmail.com) */}
      {canInstallApp && (
        <PWAInstallModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* 9. Panneau Administrateur Suprême (Accessible à demaboudjunior07@gmail.com et délégués) */}
      {userProfile && (
        <AdminPanelModal
          currentUser={userProfile}
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          oracleEnabled={oracleEnabled}
          onToggleOracle={handleToggleOracle}
        />
      )}
    </div>
  );
}
