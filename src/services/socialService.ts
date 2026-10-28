import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Friendship, PrivateMessage, GroupChat, GroupMessage, UserProfile } from '../types';

export const FRIENDSHIPS_COLLECTION = 'friendships';
export const CONVERSATIONS_COLLECTION = 'conversations';
export const GROUPS_COLLECTION = 'groups';

/**
 * Generate deterministic conversation ID between two UIDs
 */
export function getConversationId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

/**
 * Send a friend request
 */
export async function sendFriendRequest(sender: UserProfile, target: UserProfile): Promise<Friendship> {
  const friendshipId = [sender.uid, target.uid].sort().join('_');
  const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);

  const now = new Date().toISOString();
  const friendship: Friendship = {
    id: friendshipId,
    senderUid: sender.uid,
    receiverUid: target.uid,
    senderUsername: sender.username,
    receiverUsername: target.username,
    senderName: sender.displayName,
    receiverName: target.displayName,
    senderPhoto: sender.photoURL,
    receiverPhoto: target.photoURL,
    status: 'pending',
    createdAt: now,
  };

  try {
    await setDoc(friendshipRef, friendship);
    return friendship;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${FRIENDSHIPS_COLLECTION}/${friendshipId}`);
    throw error;
  }
}

/**
 * Accept or decline a friend request
 */
export async function respondFriendRequest(friendshipId: string, status: 'accepted' | 'declined'): Promise<void> {
  const friendshipRef = doc(db, FRIENDSHIPS_COLLECTION, friendshipId);
  try {
    if (status === 'declined') {
      await deleteDoc(friendshipRef);
    } else {
      await updateDoc(friendshipRef, {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${FRIENDSHIPS_COLLECTION}/${friendshipId}`);
    throw error;
  }
}

/**
 * Subscribe to user's friendships (sent and received)
 */
export function subscribeFriendships(uid: string, callback: (friendships: Friendship[]) => void): () => void {
  const collectionRef = collection(db, FRIENDSHIPS_COLLECTION);
  
  // Query where user is either sender or receiver
  const q1 = query(collectionRef, where('senderUid', '==', uid));
  const q2 = query(collectionRef, where('receiverUid', '==', uid));

  let sentList: Friendship[] = [];
  let receivedList: Friendship[] = [];

  const update = () => {
    const map = new Map<string, Friendship>();
    [...sentList, ...receivedList].forEach(f => map.set(f.id, f));
    callback(Array.from(map.values()));
  };

  const unsub1 = onSnapshot(q1, (snap) => {
    sentList = snap.docs.map(d => d.data() as Friendship);
    update();
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, FRIENDSHIPS_COLLECTION);
  });

  const unsub2 = onSnapshot(q2, (snap) => {
    receivedList = snap.docs.map(d => d.data() as Friendship);
    update();
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, FRIENDSHIPS_COLLECTION);
  });

  return () => {
    unsub1();
    unsub2();
  };
}

/**
 * Send a private message between friends
 */
export async function sendPrivateMessage(
  sender: UserProfile, 
  receiverUid: string, 
  conversationId: string, 
  content: string
): Promise<void> {
  if (!content.trim()) return;

  const messagesCol = collection(db, CONVERSATIONS_COLLECTION, conversationId, 'messages');
  const now = new Date().toISOString();

  try {
    await addDoc(messagesCol, {
      conversationId,
      senderUid: sender.uid,
      senderName: sender.displayName,
      senderPhoto: sender.photoURL,
      receiverUid,
      content: content.trim(),
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CONVERSATIONS_COLLECTION}/${conversationId}/messages`);
    throw error;
  }
}

/**
 * Subscribe to private messages of a conversation
 */
export function subscribePrivateMessages(
  conversationId: string, 
  callback: (messages: PrivateMessage[]) => void
): () => void {
  const messagesCol = collection(db, CONVERSATIONS_COLLECTION, conversationId, 'messages');
  
  return onSnapshot(messagesCol, (snapshot) => {
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as PrivateMessage[];
    
    // Sort chronologically
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `${CONVERSATIONS_COLLECTION}/${conversationId}/messages`);
  });
}

/**
 * Community Groups
 */
export async function createGroup(
  name: string,
  description: string,
  category: string,
  isPrivate: boolean,
  creator: UserProfile,
  avatarUrl?: string
): Promise<GroupChat> {
  const groupsCol = collection(db, GROUPS_COLLECTION);
  const now = new Date().toISOString();
  
  const newGroupData = {
    name: name.trim(),
    description: description.trim(),
    category,
    isPrivate,
    creatorUid: creator.uid,
    memberUids: [creator.uid],
    createdAt: now,
    avatarUrl: avatarUrl?.trim() || '',
  };

  try {
    const ref = await addDoc(groupsCol, newGroupData);
    return {
      id: ref.id,
      ...newGroupData
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, GROUPS_COLLECTION);
    throw error;
  }
}

export function subscribeGroups(callback: (groups: GroupChat[]) => void): () => void {
  const groupsCol = collection(db, GROUPS_COLLECTION);
  return onSnapshot(groupsCol, (snap) => {
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as GroupChat[];
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, GROUPS_COLLECTION);
  });
}

export async function joinGroup(groupId: string, userUid: string): Promise<void> {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  try {
    const snap = await getDocs(query(collection(db, GROUPS_COLLECTION)));
    const target = snap.docs.find(d => d.id === groupId);
    if (target) {
      const data = target.data() as GroupChat;
      const members = data.memberUids || [];
      if (!members.includes(userUid)) {
        await updateDoc(groupRef, {
          memberUids: [...members, userUid]
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GROUPS_COLLECTION}/${groupId}`);
    throw error;
  }
}

export async function sendGroupMessage(
  groupId: string,
  sender: UserProfile,
  content: string
): Promise<void> {
  if (!content.trim()) return;

  const msgCol = collection(db, GROUPS_COLLECTION, groupId, 'messages');
  const now = new Date().toISOString();

  try {
    await addDoc(msgCol, {
      groupId,
      senderUid: sender.uid,
      senderName: sender.displayName,
      senderPhoto: sender.photoURL,
      content: content.trim(),
      createdAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${GROUPS_COLLECTION}/${groupId}/messages`);
    throw error;
  }
}

export function subscribeGroupMessages(
  groupId: string,
  callback: (messages: GroupMessage[]) => void
): () => void {
  const msgCol = collection(db, GROUPS_COLLECTION, groupId, 'messages');
  return onSnapshot(msgCol, (snapshot) => {
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as GroupMessage[];
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, `${GROUPS_COLLECTION}/${groupId}/messages`);
  });
}
