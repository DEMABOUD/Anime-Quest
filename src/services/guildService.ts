import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Guild, UserProfile } from '../types';

export const GUILDS_COLLECTION = 'guilds';

// Default initial starter guilds for popular anime if database has none
export const STARTER_GUILDS: Omit<Guild, 'id'>[] = [
  {
    name: 'Straw Hat Pirates',
    manga: 'One Piece',
    quote: 'Ensemble jusqu’au bout ! Le One Piece existe !',
    leaderUid: 'system_luffy',
    leaderName: 'Luffy_976',
    level: 5,
    xp: 2340,
    memberCount: 24,
    maxMembers: 30,
    memberUids: ['system_luffy'],
    losses: 4,
    wins: 28,
    successRate: 88,
    isDisbanded: false,
    badge: '☠️',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Akatsuki Syndicate',
    manga: 'Naruto',
    quote: 'Faire régner la paix par la puissance des Bijuus.',
    leaderUid: 'system_pain',
    leaderName: 'Pain_Tendo',
    level: 6,
    xp: 4120,
    memberCount: 21,
    maxMembers: 30,
    memberUids: ['system_pain'],
    losses: 7,
    wins: 34,
    successRate: 83,
    isDisbanded: false,
    badge: '☁️',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Exorcistes de Tokyo',
    manga: 'Jujutsu Kaisen',
    quote: 'Exorciser les fléaux sans laisser de regrets.',
    leaderUid: 'system_gojo',
    leaderName: 'Gojo_Satoru',
    level: 4,
    xp: 1890,
    memberCount: 19,
    maxMembers: 25,
    memberUids: ['system_gojo'],
    losses: 2,
    wins: 22,
    successRate: 91,
    isDisbanded: false,
    badge: '👁️',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Gotei 13 Soul Guild',
    manga: 'Bleach',
    quote: 'Protéger l’équilibre entre le Monde Réel et la Soul Society.',
    leaderUid: 'system_yamamoto',
    leaderName: 'Genryusai_Yama',
    level: 5,
    xp: 3400,
    memberCount: 26,
    maxMembers: 30,
    memberUids: ['system_yamamoto'],
    losses: 5,
    wins: 30,
    successRate: 85,
    isDisbanded: false,
    badge: '⚔️',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Bataillon d’Exploration',
    manga: 'L’Attaque des Titans',
    quote: 'Offrez vos cœurs pour la liberté de l’humanité !',
    leaderUid: 'system_erwin',
    leaderName: 'Erwin_Smith',
    level: 5,
    xp: 2980,
    memberCount: 27,
    maxMembers: 30,
    memberUids: ['system_erwin'],
    losses: 9,
    wins: 31,
    successRate: 77,
    isDisbanded: false,
    badge: '🛡️',
    createdAt: new Date().toISOString(),
  }
];

/**
 * Seed initial starter guilds if collection is empty
 */
export async function seedStarterGuildsIfEmpty(): Promise<void> {
  try {
    const colSnap = await getDocs(query(collection(db, GUILDS_COLLECTION), limit(1)));
    if (colSnap.empty) {
      for (const sg of STARTER_GUILDS) {
        const docRef = doc(collection(db, GUILDS_COLLECTION));
        await setDoc(docRef, { ...sg, id: docRef.id });
      }
    }
  } catch (error) {
    console.warn('Seed guilds check/init', error);
  }
}

/**
 * Create a new anime guild
 */
export async function createGuild(
  name: string,
  manga: string,
  quote: string,
  badge: string,
  creator: UserProfile
): Promise<Guild> {
  const guildCol = collection(db, GUILDS_COLLECTION);
  const now = new Date().toISOString();

  const newDocRef = doc(guildCol);
  const newGuild: Guild = {
    id: newDocRef.id,
    name: name.trim(),
    manga: manga.trim(),
    quote: quote.trim() || 'Vers la victoire !',
    leaderUid: creator.uid,
    leaderName: creator.displayName,
    level: 1,
    xp: 0,
    memberCount: 1,
    maxMembers: 30,
    memberUids: [creator.uid],
    losses: 0,
    wins: 0,
    successRate: 100,
    isDisbanded: false,
    badge: badge || '⚔️',
    createdAt: now,
  };

  try {
    await setDoc(newDocRef, newGuild);
    // Update user profile with new guildId
    await updateDoc(doc(db, 'users', creator.uid), {
      guildId: newGuild.id
    });
    return newGuild;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GUILDS_COLLECTION);
    throw error;
  }
}

/**
 * Subscribe to all active guilds
 */
export function subscribeGuilds(callback: (guilds: Guild[]) => void): () => void {
  const q = query(collection(db, GUILDS_COLLECTION), where('isDisbanded', '==', false));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as Guild[];
    
    // Sort by wins and level
    list.sort((a, b) => b.wins - a.wins || b.level - a.level);
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, GUILDS_COLLECTION);
  });
}

/**
 * Fetch a guild by ID
 */
export async function getGuildById(guildId: string): Promise<Guild | null> {
  const docRef = doc(db, GUILDS_COLLECTION, guildId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as Guild;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${GUILDS_COLLECTION}/${guildId}`);
    return null;
  }
}

/**
 * Join an existing guild
 */
export async function joinGuild(guildId: string, user: UserProfile): Promise<void> {
  const guildRef = doc(db, GUILDS_COLLECTION, guildId);
  try {
    const snap = await getDoc(guildRef);
    if (!snap.exists()) throw new Error('Guilde introuvable');
    const guild = snap.data() as Guild;

    if (guild.isDisbanded) {
      throw new Error('Cette guilde a été dissoute après 20 défaites.');
    }
    if (guild.memberCount >= guild.maxMembers) {
      throw new Error('Cette guilde a atteint sa capacité maximale de membres.');
    }
    if (guild.memberUids.includes(user.uid)) {
      return; // Already member
    }

    const updatedMembers = [...guild.memberUids, user.uid];
    await updateDoc(guildRef, {
      memberUids: updatedMembers,
      memberCount: updatedMembers.length
    });

    await updateDoc(doc(db, 'users', user.uid), {
      guildId
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GUILDS_COLLECTION}/${guildId}`);
    throw error;
  }
}

/**
 * Leave a guild
 */
export async function leaveGuild(guildId: string, user: UserProfile): Promise<void> {
  const guildRef = doc(db, GUILDS_COLLECTION, guildId);
  try {
    const snap = await getDoc(guildRef);
    if (!snap.exists()) return;
    const guild = snap.data() as Guild;

    const updatedMembers = guild.memberUids.filter(id => id !== user.uid);
    let newLeaderUid = guild.leaderUid;
    let newLeaderName = guild.leaderName;

    // If chief leaves, assign to another member if any, or disband
    if (guild.leaderUid === user.uid) {
      if (updatedMembers.length > 0) {
        newLeaderUid = updatedMembers[0];
        newLeaderName = 'Nouveau Chef';
      }
    }

    await updateDoc(guildRef, {
      memberUids: updatedMembers,
      memberCount: updatedMembers.length,
      leaderUid: newLeaderUid,
      leaderName: newLeaderName,
      isDisbanded: updatedMembers.length === 0 ? true : guild.isDisbanded
    });

    await updateDoc(doc(db, 'users', user.uid), {
      guildId: null
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GUILDS_COLLECTION}/${guildId}`);
    throw error;
  }
}

/**
 * Record a Guild War outcome (respecting the 20 cumulative losses rule!)
 */
export async function recordGuildWarResult(
  guildId: string, 
  isVictory: boolean, 
  warSuccessRate: number
): Promise<{ isDisbandedNow: boolean; remainingLives: number }> {
  const guildRef = doc(db, GUILDS_COLLECTION, guildId);
  try {
    const snap = await getDoc(guildRef);
    if (!snap.exists()) return { isDisbandedNow: false, remainingLives: 0 };
    const guild = snap.data() as Guild;

    let newLosses = guild.losses;
    let newWins = guild.wins;
    let newXp = guild.xp + (isVictory ? 250 : 50);
    let newLevel = Math.floor(newXp / 1000) + 1;

    if (isVictory) {
      newWins += 1;
    } else {
      newLosses += 1;
    }

    // Recalculate average success rate
    const totalBattles = newWins + newLosses;
    const currentRate = totalBattles > 0 ? Math.round((newWins / totalBattles) * 100) : 100;

    // 20 losses rule: disbanded when reaching 20 losses!
    const isDisbandedNow = newLosses >= 20;

    await updateDoc(guildRef, {
      wins: newWins,
      losses: newLosses,
      xp: newXp,
      level: newLevel,
      successRate: currentRate,
      isDisbanded: isDisbandedNow,
    });

    return {
      isDisbandedNow,
      remainingLives: Math.max(0, 20 - newLosses)
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GUILDS_COLLECTION}/${guildId}`);
    throw error;
  }
}
