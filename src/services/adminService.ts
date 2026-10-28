import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { UserProfile, AdminRecord } from '../types';

export const ADMINS_COLLECTION = 'admins';
export const USERS_COLLECTION = 'users';

export const MASTER_ADMIN_EMAILS = [
  'demaboudjunior07@gmail.com',
  'nickdemaboud@gmail.com'
];

/**
 * Checks if an email is a designated Master Admin email
 */
export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.trim().toLowerCase());
}

/**
 * Strictly controls who is allowed to view and trigger the application installation/download option.
 * As explicitly requested: ONLY demaboudjunior07@gmail.com (and developer test alias) can see this option.
 * Regular players and other users will NOT see any install button.
 */
export function canViewInstallOption(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized === 'demaboudjunior07@gmail.com' || normalized === 'nickdemaboud@gmail.com';
}

/**
 * Checks whether the current user is an admin (master email or Firestore admin doc)
 */
export async function checkIsAdmin(uid: string, email?: string | null): Promise<boolean> {
  // 1. Direct master email check
  if (isMasterAdminEmail(email)) {
    // Ensure document exists in admins collection for consistency
    try {
      const adminRef = doc(db, ADMINS_COLLECTION, uid);
      const snap = await getDoc(adminRef);
      if (!snap.exists()) {
        await setDoc(adminRef, {
          uid,
          username: 'master_admin',
          displayName: 'Maître Administrateur',
          grantedBy: 'system',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Non-blocking if offline or initializing
    }
    return true;
  }

  // 2. Query Firestore /admins/{uid}
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, uid);
    const snap = await getDoc(adminRef);
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ADMINS_COLLECTION}/${uid}`);
    return false;
  }
}

/**
 * Fetch all users registered on the platform for admin inspection
 * Note: Strictly respects user privacy - only gaming profiles (Pseudo, @username, avatar, stats) are loaded.
 */
export async function getAllUsersForAdmin(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(usersRef);
    const users: UserProfile[] = [];
    snap.forEach((d) => {
      const data = d.data() as UserProfile;
      users.push(data);
    });

    // Sort by level / points descending
    return users.sort((a, b) => (b.points || 0) - (a.points || 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    return [];
  }
}

/**
 * Fetch all delegated admin records
 */
export async function getAllAdmins(): Promise<AdminRecord[]> {
  try {
    const adminsRef = collection(db, ADMINS_COLLECTION);
    const snap = await getDocs(adminsRef);
    const admins: AdminRecord[] = [];
    snap.forEach((d) => {
      admins.push(d.data() as AdminRecord);
    });
    return admins;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ADMINS_COLLECTION);
    return [];
  }
}

/**
 * Gives exact same admin priorities to another user
 */
export async function grantAdminPrivilege(targetUser: UserProfile, grantedByUid: string): Promise<void> {
  const adminRef = doc(db, ADMINS_COLLECTION, targetUser.uid);
  const now = new Date().toISOString();

  const record: AdminRecord = {
    uid: targetUser.uid,
    username: targetUser.username,
    displayName: targetUser.displayName,
    grantedBy: grantedByUid,
    createdAt: now,
  };

  try {
    await setDoc(adminRef, record);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMINS_COLLECTION}/${targetUser.uid}`);
    throw error;
  }
}

/**
 * Revokes admin privileges from a user
 */
export async function revokeAdminPrivilege(targetUid: string): Promise<void> {
  const currentAuthEmail = auth.currentUser?.email;
  // Never allow revoking master admin
  if (isMasterAdminEmail(currentAuthEmail) && targetUid === auth.currentUser?.uid) {
    throw new Error('Impossible de révoquer le Maître Administrateur originel.');
  }

  const adminRef = doc(db, ADMINS_COLLECTION, targetUid);
  try {
    await deleteDoc(adminRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ADMINS_COLLECTION}/${targetUid}`);
    throw error;
  }
}
