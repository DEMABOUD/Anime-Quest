import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, PlayerScore, MatchOpponent, FriendChallenge, DuelMatch } from '../types';

export const USERS_COLLECTION = 'users';
export const MATCHMAKING_COLLECTION = 'matchmaking_queue';
export const DUEL_MATCHES_COLLECTION = 'duel_matches';
export const FRIEND_CHALLENGES_COLLECTION = 'friend_challenges';

/**
 * Robot definition (explicitly non-human, labeled as Robot d'Entraînement IA)
 */
export const ROBOT_OPPONENT: MatchOpponent = {
  isBot: true,
  uid: 'bot_anime_ai',
  displayName: "Robot d'Entraînement IA",
  photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=AnimeRobotAI",
  tag: "[ROBOT IA]",
  level: 1,
};

/**
 * Real Multiplayer Matchmaker
 * Searches for real players in the matchmaking queue.
 * Only if NO real players are online/available after search window, falls back to Robot.
 */
export async function searchRealMatchmaking(
  currentUser: UserProfile,
  mangaCategory: string,
  onStatusUpdate?: (statusText: string) => void
): Promise<{ opponent: MatchOpponent; matchId?: string }> {
  const queueRef = collection(db, MATCHMAKING_COLLECTION);
  const userQueueDoc = doc(db, MATCHMAKING_COLLECTION, currentUser.uid);

  onStatusUpdate?.("Recherche d'un joueur réel en ligne...");

  try {
    // 1. Look for waiting opponents in Firestore queue (who are NOT current user)
    const q = query(
      queueRef,
      where('status', '==', 'waiting'),
      limit(5)
    );
    const snap = await getDocs(q);
    const otherPlayers = snap.docs.filter(d => d.id !== currentUser.uid);

    if (otherPlayers.length > 0) {
      // Real player found! Pair with the first available real player
      const opponentDoc = otherPlayers[0];
      const opponentData = opponentDoc.data();
      const matchId = `match_${Date.now()}_${currentUser.uid}_${opponentDoc.id}`;

      // Mark matched in queue
      await updateDoc(doc(db, MATCHMAKING_COLLECTION, opponentDoc.id), {
        status: 'matched',
        matchedWithUid: currentUser.uid,
        matchId,
      });

      // Remove current user from queue
      try {
        await deleteDoc(userQueueDoc);
      } catch {}

      onStatusUpdate?.(`Joueur réel trouvé : ${opponentData.displayName} !`);

      return {
        opponent: {
          isBot: false,
          uid: opponentData.uid,
          displayName: opponentData.displayName,
          photoURL: opponentData.photoURL,
          tag: "[JOUEUR RÉEL EN LIGNE]",
          level: opponentData.level || 1,
        },
        matchId,
      };
    }

    // 2. Put self into waiting queue so another real player entering can match
    await setDoc(userQueueDoc, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      username: currentUser.username,
      photoURL: currentUser.photoURL,
      level: currentUser.level,
      mangaCategory,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });

    // 3. Short real-time wait (6 seconds) to see if another real player connects
    for (let i = 5; i > 0; i--) {
      onStatusUpdate?.(`Recherche de joueurs réels... (${i}s)`);
      await new Promise(r => setTimeout(r, 1000));

      // Check if someone matched with me while waiting
      const mySnap = await getDoc(userQueueDoc);
      if (mySnap.exists()) {
        const myData = mySnap.data();
        if (myData.status === 'matched' && myData.matchedWithUid) {
          try {
            await deleteDoc(userQueueDoc);
          } catch {}

          // Fetch matched real player info
          const matchedUserDoc = await getDoc(doc(db, USERS_COLLECTION, myData.matchedWithUid));
          if (matchedUserDoc.exists()) {
            const oppData = matchedUserDoc.data() as UserProfile;
            return {
              opponent: {
                isBot: false,
                uid: oppData.uid,
                displayName: oppData.displayName,
                photoURL: oppData.photoURL,
                tag: "[JOUEUR RÉEL EN LIGNE]",
                level: oppData.level || 1,
              },
              matchId: myData.matchId,
            };
          }
        }
      }
    }

    // 4. Clean up self from queue
    try {
      await deleteDoc(userQueueDoc);
    } catch {}

    // 5. No real players available right now -> Fallback to Robot d'Entraînement IA
    onStatusUpdate?.("Aucun joueur réel disponible. Attribution d'un Robot d'Entraînement IA.");
    return {
      opponent: ROBOT_OPPONENT,
    };
  } catch (error) {
    console.warn("Erreur matchmaking réseau:", error);
    return {
      opponent: ROBOT_OPPONENT,
    };
  }
}

/**
 * Send a direct duel challenge to a friend
 */
export async function sendFriendChallenge(
  currentUser: UserProfile,
  friendUid: string,
  friendName: string,
  manga: string
): Promise<string> {
  const challengeId = `chall_${Date.now()}_${currentUser.uid}`;
  const challengeRef = doc(db, FRIENDCHALLENGES_COLLECTION, challengeId);
  const matchId = `match_${Date.now()}_${currentUser.uid}_${friendUid}`;

  const challengeData: FriendChallenge = {
    id: challengeId,
    fromUid: currentUser.uid,
    fromName: currentUser.displayName,
    fromPhoto: currentUser.photoURL,
    toUid: friendUid,
    toName: friendName,
    manga,
    status: 'pending',
    matchId,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(challengeRef, challengeData);
    return challengeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, FRIENDCHALLENGES_COLLECTION);
    throw error;
  }
}

export const FRIENDCHALLENGES_COLLECTION = 'friend_challenges';

/**
 * Listen for incoming challenges for current user
 */
export function subscribeIncomingChallenges(
  currentUid: string,
  callback: (challenge: FriendChallenge | null) => void
): () => void {
  const q = query(
    collection(db, FRIENDCHALLENGES_COLLECTION),
    where('toUid', '==', currentUid),
    where('status', '==', 'pending')
  );

  return onSnapshot(q, (snap) => {
    if (!snap.empty) {
      const docData = snap.docs[0].data() as FriendChallenge;
      callback(docData);
    } else {
      callback(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, FRIENDCHALLENGES_COLLECTION);
  });
}

/**
 * Respond to friend challenge
 */
export async function respondToChallenge(
  challengeId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const ref = doc(db, FRIENDCHALLENGES_COLLECTION, challengeId);
  try {
    if (status === 'declined') {
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, { status: 'accepted' });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${FRIENDCHALLENGES_COLLECTION}/${challengeId}`);
  }
}

/**
 * Finalize Match without any currency (no coins or gems)
 */
export async function finalizeMatchResult(
  playerScores: PlayerScore[],
  currentPlayerUid: string,
  earnedXp: number = 100
): Promise<{ isWinner: boolean; rank: number; newStats: Partial<UserProfile> }> {
  // Sort players by score descending
  const sorted = [...playerScores].sort((a, b) => b.score - a.score);
  const playerRank = sorted.findIndex(p => p.uid === currentPlayerUid) + 1;
  const isWinner = playerRank === 1;

  const currentScoreObj = sorted.find(p => p.uid === currentPlayerUid);
  const earnedPoints = currentScoreObj ? currentScoreObj.score : 0;

  const userRef = doc(db, USERS_COLLECTION, currentPlayerUid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return { isWinner, rank: playerRank, newStats: {} };
    }
    const currentData = snap.data() as UserProfile;

    const newWins = isWinner ? (currentData.wins || 0) + 1 : (currentData.wins || 0);
    const newLosses = isWinner ? (currentData.losses || 0) : (currentData.losses || 0) + 1;
    const newTotalGames = (currentData.totalGames || 0) + 1;
    const newPoints = (currentData.points || 0) + earnedPoints;
    const newXp = (currentData.xp || 0) + earnedXp + (isWinner ? 150 : 50);
    const newLevel = Math.floor(newXp / 500) + 1;

    let rankTitle = 'Aventurier Débutant';
    if (newWins >= 100) rankTitle = 'Roi des Otakus';
    else if (newWins >= 50) rankTitle = 'Maître Shinobi';
    else if (newWins >= 25) rankTitle = 'Commandant de Flotte';
    else if (newWins >= 10) rankTitle = 'Chasseur Émérite';
    else if (newWins >= 3) rankTitle = 'Apprenti Guerrier';

    const updates: Partial<UserProfile> = {
      wins: newWins,
      losses: newLosses,
      totalGames: newTotalGames,
      points: newPoints,
      xp: newXp,
      level: newLevel,
      rankTitle,
    };

    await updateDoc(userRef, updates);
    return { isWinner, rank: playerRank, newStats: updates };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${currentPlayerUid}`);
    throw error;
  }
}
