import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  getDocs, 
  limit, 
  where 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

export const USERS_COLLECTION = 'users';
export const USERNAMES_COLLECTION = 'usernames';

/**
 * Checks if a username is available in Firestore
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3 || cleanUsername.length > 30) {
    return false;
  }
  const usernameRef = doc(db, USERNAMES_COLLECTION, cleanUsername);
  try {
    const docSnap = await getDoc(usernameRef);
    return !docSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERNAMES_COLLECTION}/${cleanUsername}`);
    return false;
  }
}

/**
 * Creates user profile & locks unique username
 */
export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt' | 'level' | 'xp' | 'wins' | 'losses' | 'totalGames' | 'points' | 'rankTitle' | 'isOnline'>): Promise<UserProfile> {
  const cleanUsername = profile.username.trim().toLowerCase();
  const usernameRef = doc(db, USERNAMES_COLLECTION, cleanUsername);
  const userRef = doc(db, USERS_COLLECTION, profile.uid);

  // Double check availability
  const isAvailable = await checkUsernameAvailable(cleanUsername);
  if (!isAvailable) {
    throw new Error(`Le nom d'utilisateur "${profile.username}" est déjà réservé.`);
  }

  const now = new Date().toISOString();
  const fullProfile: UserProfile = {
    ...profile,
    username: cleanUsername,
    level: 1,
    xp: 0,
    wins: 0,
    losses: 0,
    totalGames: 0,
    points: 0,
    rankTitle: 'Aventurier Débutant',
    isOnline: true,
    lastSeen: now,
    createdAt: now,
    updatedAt: now,
  };

  try {
    // 1. Reserve username
    await setDoc(usernameRef, {
      uid: profile.uid,
      username: cleanUsername,
      createdAt: now,
    });

    // 2. Write user profile
    await setDoc(userRef, fullProfile);
    return fullProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${profile.uid}`);
    throw error;
  }
}

/**
 * Fetch a user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
    return null;
  }
}

/**
 * Update user profile (with atomic username switch if changed)
 */
export async function updateUserProfile(
  uid: string, 
  updates: Partial<UserProfile>, 
  previousUsername?: string
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const now = new Date().toISOString();

  try {
    if (updates.username && previousUsername && updates.username.toLowerCase() !== previousUsername.toLowerCase()) {
      const newUsername = updates.username.trim().toLowerCase();
      const isAvailable = await checkUsernameAvailable(newUsername);
      if (!isAvailable) {
        throw new Error(`Le nom d'utilisateur "${updates.username}" est déjà pris.`);
      }

      // Reserve new username
      await setDoc(doc(db, USERNAMES_COLLECTION, newUsername), {
        uid,
        username: newUsername,
        createdAt: now
      });

      // Free previous username
      await deleteDoc(doc(db, USERNAMES_COLLECTION, previousUsername.toLowerCase()));
      updates.username = newUsername;
    }

    await updateDoc(userRef, {
      ...updates,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
    throw error;
  }
}

/**
 * Search users by username or display name
 */
export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  const clean = searchTerm.trim().toLowerCase();
  if (!clean) return [];

  const usersRef = collection(db, USERS_COLLECTION);
  try {
    // Primary query for username
    const q = query(
      usersRef,
      where('username', '>=', clean),
      where('username', '<=', clean + '\uf8ff'),
      limit(10)
    );
    const snap = await getDocs(q);
    const results: UserProfile[] = [];
    snap.forEach((d) => {
      results.push(d.data() as UserProfile);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    return [];
  }
}

/**
 * Get global leaderboard players
 */
export async function getGlobalLeaderboard(): Promise<UserProfile[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  try {
    const q = query(usersRef, limit(50));
    const snap = await getDocs(q);
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      users.push(d.data() as UserProfile);
    });

    // Rank primarily by victories (per spec), secondary by points
    return users.sort((a, b) => {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return b.points - a.points;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    return [];
  }
}
