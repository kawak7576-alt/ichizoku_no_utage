/**
 * Shared Game Types for "一族の宴 ― 消えた家宝と変装者 ―"
 */

export type CharacterId =
  | 'eldest_son'
  | 'eldest_daughter'
  | 'second_son'
  | 'second_daughter'
  | 'third_son'
  | 'third_daughter';

export interface CharacterInfo {
  id: CharacterId;
  relation: string; // 長男, 長女, 次男, 次女, 三男, 三女
  location: string; // 書斎, ギャラリー, エントランス, 庭園, 食堂, 遊戯室
  title: string;
  description: string;
  avatarIcon: string;
}

export type Role = 'student' | 'prodigy' | 'phantom_thief' | 'kitsune';

export interface RoleInfo {
  role: Role;
  name: string; // 学生, 秀才, 怪盗, 妖狐
  camp: '一族側' | '怪盗側' | '妖狐側';
  description: string;
  badgeColor: string;
}

export type GamePhase =
  | 'lobby'
  | 'opening'
  | 'drafting'
  | 'first_discussion'
  | 'word_wolf'
  | 'final_discussion'
  | 'voting'
  | 'salvation'
  | 'result';

export interface PlayerPublic {
  id: string;
  name: string;
  isHost: boolean;
  isConnected: boolean;
  isBot?: boolean;
  characterId?: CharacterId;
  isReadyNext?: boolean;
  hasVoted?: boolean;
  draftOrder?: number; // 1 to 5
}

export interface PlayerPrivate {
  role?: Role;
  word?: string;
  wordType?: 'positive' | 'negative';
  kitsuneDesignatedWord?: string;
  kitsuneDeclared?: boolean;
  draftingCards?: Role[]; // Cards currently in hand during draft step
  salvationEligible?: boolean;
}

export interface VoteRecord {
  thiefVotes: Record<string, string>; // voterId -> target (playerId or 'sickroom')
  kitsuneVotes: Record<string, string>; // voterId -> target (playerId or 'sickroom')
  thiefNominee: string | null; // target ID or null if tie
  kitsuneNominee: string | null; // target ID or null if tie
  thiefVoteCounts: Record<string, number>;
  kitsuneVoteCounts: Record<string, number>;
}

export interface GameResult {
  winner: 'family' | 'phantom_thief' | 'kitsune' | 'draw' | 'inconclusive';
  winnerTitle: string;
  narrative: string;
  positiveWord: string;
  negativeWord: string;
  roles: Record<string, Role>; // playerId or 'sickroom' -> Role
  words: Record<string, string>; // playerId -> word
  wordTypes: Record<string, 'positive' | 'negative'>;
  kitsuneDesignatedWord: string;
  kitsuneDeclared: boolean;
  kitsuneNominated: boolean;
  kitsuneLocation: string; // playerId or 'sickroom'
  thiefNominated: boolean;
  thiefLocation: string; // playerId or 'sickroom'
  salvationAttempted: boolean;
  salvationSuccess?: boolean;
  salvationGuess?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  characterRelation?: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameStatePublic {
  roomId: string;
  phase: GamePhase;
  phaseStartTime: number;
  phaseDurationSeconds: number;
  isExtended: boolean;
  extensionSeconds: number;
  readyCount: number;
  totalPlayers: number;
  players: PlayerPublic[];
  sickroomCharacter?: CharacterInfo;
  firstDiscovererId?: string;
  currentDraftPlayerId?: string;
  currentDraftStep?: number; // 1 to 6
  hostPlayerId: string;
  voteRecord?: VoteRecord;
  salvation?: {
    active: boolean;
    thiefPlayerId: string;
    secondsRemaining: number;
    guess?: string;
    isSuccess?: boolean;
  };
  result?: GameResult;
}
