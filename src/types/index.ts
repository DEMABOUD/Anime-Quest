export type Difficulty = 'facile' | 'moyen' | 'difficile' | 'extreme';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL: string;
  bio: string;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  totalGames: number;
  points: number;
  rankTitle: string;
  guildId?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecord {
  uid: string;
  username: string;
  displayName: string;
  grantedBy: string;
  createdAt: string;
}

export interface Friendship {
  id: string;
  senderUid: string;
  receiverUid: string;
  senderUsername: string;
  receiverUsername: string;
  senderName: string;
  receiverName: string;
  senderPhoto: string;
  receiverPhoto: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt?: string;
}

export interface PrivateMessage {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  senderPhoto: string;
  receiverUid: string;
  content: string;
  createdAt: string;
}

export interface GroupChat {
  id: string;
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  creatorUid: string;
  memberUids: string[];
  createdAt: string;
  avatarUrl?: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderUid: string;
  senderName: string;
  senderPhoto: string;
  content: string;
  createdAt: string;
}

export interface Guild {
  id: string;
  name: string;
  manga: string;
  quote: string;
  leaderUid: string;
  leaderName: string;
  level: number;
  xp: number;
  memberCount: number;
  maxMembers: number;
  memberUids: string[];
  losses: number; // 20 losses threshold for disbanding!
  wins: number;
  successRate: number;
  isDisbanded: boolean;
  badge: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  manga: string;
  question: string;
  options: [string, string, string, string, string]; // Exactly 5 options
  correctIndex: number; // 0 to 4
  difficulty: Difficulty;
  points: number; // 10, 20, 30, 50
  explanation?: string;
}

export interface PlayerScore {
  uid: string;
  displayName: string;
  username?: string;
  photoURL: string;
  score: number;
  correctAnswers: number;
  streak: number;
  hasAnsweredCurrent?: boolean;
  lastAnswerCorrect?: boolean;
  isBot?: boolean;
}

export interface MatchOpponent {
  isBot: boolean;
  uid: string;
  displayName: string;
  photoURL: string;
  tag: string; // e.g. "JOUEUR EN LIGNE" or "ROBOT IA"
  level?: number;
}

export interface FriendChallenge {
  id: string;
  fromUid: string;
  fromName: string;
  fromPhoto: string;
  toUid: string;
  toName: string;
  manga: string;
  status: 'pending' | 'accepted' | 'declined';
  matchId?: string;
  createdAt: string;
}

export interface DuelMatch {
  id: string;
  mangaCategory: string;
  player1Uid: string;
  player1Name: string;
  player1Photo: string;
  player1Score: number;
  player2Uid: string;
  player2Name: string;
  player2Photo: string;
  player2Score: number;
  isPlayer2Bot: boolean;
  currentQuestionIndex: number;
  status: 'waiting' | 'in_progress' | 'completed';
  winnerUid?: string;
  createdAt: string;
}

export type NavigationTab = 'home' | 'quiz' | 'community' | 'guilds' | 'profile' | 'leaderboard';
