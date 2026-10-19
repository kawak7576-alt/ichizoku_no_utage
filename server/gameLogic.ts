import {
  CharacterId,
  CharacterInfo,
  ChatMessage,
  GamePhase,
  GameResult,
  GameStatePublic,
  PlayerPrivate,
  PlayerPublic,
  Role,
  VoteRecord,
} from '../src/types/game.ts';
import { CHARACTERS, SIBLING_CHARACTERS } from '../src/data/characters.ts';
import { getRandomWordPair, WordPair } from './words.ts';

interface ServerPlayer {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  isConnected: boolean;
  isBot: boolean;
  characterId?: CharacterId;
  role?: Role;
  word?: string;
  wordType?: 'positive' | 'negative';
  kitsuneDesignatedWord?: string;
  kitsuneDeclared?: boolean;
  draftingCards?: Role[];
  draftOrder?: number;
  isReadyNext?: boolean;
  hasVoted?: boolean;
  thiefVote?: string; // target: playerId or 'sickroom'
  kitsuneVote?: string; // target: playerId or 'sickroom'
}

export class GameRoom {
  public id: string;
  public phase: GamePhase = 'lobby';
  public players: Map<string, ServerPlayer> = new Map();
  public sickroomCharacter?: CharacterInfo;
  public sickroomRole?: Role;

  // Deck & Drafting
  public deck: Role[] = [];
  public firstDiscovererId?: string;
  public draftOrder: string[] = []; // player IDs in order 1..5
  public currentDraftIndex: number = 0; // 0..4
  public currentDraftStep: number = 1; // 1..6
  public carriedCard?: Role; // Card passed from previous player

  // Words
  public currentWordPair?: WordPair;

  // Timers
  public phaseStartTime: number = 0;
  public phaseDurationSeconds: number = 0;
  public isExtended: boolean = false;
  public extensionSeconds: number = 120; // 2 minutes max extension
  public timerInterval?: NodeJS.Timeout;

  // Salvation
  public salvationThiefId?: string;
  public salvationSecondsRemaining: number = 30;
  public salvationGuess?: string;
  public salvationSuccess?: boolean;

  // Results & Votes
  public voteRecord?: VoteRecord;
  public result?: GameResult;
  public chatMessages: ChatMessage[] = [];

  // Callback to broadcast state when timer transitions occur
  public onStateChange?: () => void;

  constructor(id: string) {
    this.id = id;
  }

  public addPlayer(name: string, socketId: string, isBot = false): ServerPlayer {
    const hasConnectedHumanHost = Array.from(this.players.values()).some(
      (p) => p.isHost && p.isConnected && !p.isBot
    );
    const isHost = !isBot && !hasConnectedHumanHost;

    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`;
    const player: ServerPlayer = {
      id: playerId,
      name,
      socketId,
      isHost,
      isConnected: true,
      isBot,
    };
    this.players.set(playerId, player);
    this.ensureActiveHost();
    return player;
  }

  public getPlayer(id: string): ServerPlayer | undefined {
    return this.players.get(id);
  }

  public getPlayerBySocketId(socketId: string): ServerPlayer | undefined {
    for (const player of this.players.values()) {
      if (player.socketId === socketId) return player;
    }
    return undefined;
  }

  public getHost(): ServerPlayer | undefined {
    // Prefer connected human host
    for (const p of this.players.values()) {
      if (p.isHost && p.isConnected && !p.isBot) return p;
    }
    for (const p of this.players.values()) {
      if (p.isHost) return p;
    }
    return undefined;
  }

  public ensureActiveHost(): ServerPlayer | undefined {
    // 1. If currently connected human host exists, keep them
    const currentHost = this.getHost();
    if (currentHost && currentHost.isConnected && !currentHost.isBot) {
      return currentHost;
    }

    // 2. Clear all host flags
    for (const p of this.players.values()) {
      p.isHost = false;
    }

    // 3. Promote first connected human player
    for (const p of this.players.values()) {
      if (p.isConnected && !p.isBot) {
        p.isHost = true;
        return p;
      }
    }

    // 4. Fallback to any human
    for (const p of this.players.values()) {
      if (!p.isBot) {
        p.isHost = true;
        return p;
      }
    }

    // 5. Fallback to first player
    if (this.players.size > 0) {
      const first = Array.from(this.players.values())[0];
      first.isHost = true;
      return first;
    }

    return undefined;
  }

  public cleanDisconnectedInLobby(isSocketAlive?: (socketId: string) => boolean) {
    if (this.phase !== 'lobby') return;
    for (const [id, p] of this.players.entries()) {
      if (!p.isBot) {
        const alive = p.isConnected && (!isSocketAlive || isSocketAlive(p.socketId));
        if (!alive) {
          this.players.delete(id);
        }
      }
    }
    // If no connected human players remain, clear any leftover bots
    const hasConnectedHuman = Array.from(this.players.values()).some(
      (p) => p.isConnected && !p.isBot && (!isSocketAlive || isSocketAlive(p.socketId))
    );
    if (!hasConnectedHuman) {
      this.players.clear();
    } else {
      this.ensureActiveHost();
    }
  }

  public removePlayer(playerId: string) {
    this.players.delete(playerId);
    this.ensureActiveHost();
  }

  public fillWithBots() {
    if (this.phase !== 'lobby') return;
    const botNames = ['書生アラン', '令嬢クララ', '青年カイン', '画商エリック'];
    let idx = 0;
    while (this.players.size < 5) {
      const name = botNames[idx % botNames.length] + ` (${this.players.size + 1})`;
      this.addPlayer(name, `bot_${Math.random().toString(36).substring(2, 7)}`, true);
      idx++;
    }
  }

  public removeBots() {
    if (this.phase !== 'lobby') return;
    for (const [id, p] of this.players.entries()) {
      if (p.isBot) {
        this.players.delete(id);
      }
    }
  }

  public startGame(): boolean {
    if (this.players.size !== 5) return false;
    this.phase = 'opening';
    this.assignCharacters();
    this.addSystemMessage('屋敷の宴が始まりました。当主の大切な家宝が盗まれました……！');
    return true;
  }

  private assignCharacters() {
    // Exactly 5 players chosen from the 6 siblings (長男、長女、次男、次女、三男、三女).
    // The 6th sibling goes to the sickroom (療養室).
    // Head (当主) is not chosen as a player.
    const shuffledChars = [...SIBLING_CHARACTERS].sort(() => Math.random() - 0.5);
    const playerArray = Array.from(this.players.values());

    for (let i = 0; i < 5; i++) {
      playerArray[i].characterId = shuffledChars[i].id;
    }
    // 6th character goes to sickroom
    this.sickroomCharacter = shuffledChars[5];
  }

  public proceedToDrafting() {
    if (this.phase !== 'opening') return;
    this.phase = 'drafting';

    const roleCards: Role[] = [
      'student',
      'student',
      'student',
      'prodigy',
      'phantom_thief',
      'kitsune',
    ];
    this.deck = roleCards.sort(() => Math.random() - 0.5);

    const playerList = Array.from(this.players.values());
    const firstDiscovererIndex = Math.floor(Math.random() * 5);
    this.firstDiscovererId = playerList[firstDiscovererIndex].id;

    // Establish clockwise order starting from first discoverer
    this.draftOrder = [];
    for (let i = 0; i < 5; i++) {
      const p = playerList[(firstDiscovererIndex + i) % 5];
      p.draftOrder = i + 1;
      this.draftOrder.push(p.id);
    }

    this.currentDraftIndex = 0;
    this.currentDraftStep = 1;
    this.carriedCard = undefined;

    // Step 1: First discoverer draws 1 card for themself
    const p1 = this.players.get(this.draftOrder[0])!;
    const card1 = this.deck.pop()!;
    p1.role = card1;
    p1.draftingCards = [card1];

    this.addSystemMessage(
      `第一発見者は【${p1.name}】です。山札から1枚目の役職カードを受け取りました。`
    );

    this.checkBotDraftAction();
  }

  // Handle player draft action
  public handleDraftAction(playerId: string, chosenRole: Role): boolean {
    if (this.phase !== 'drafting') return false;
    const currentActivePlayerId = this.draftOrder[this.currentDraftIndex];
    if (currentActivePlayerId !== playerId) return false;

    const player = this.players.get(playerId)!;

    if (this.currentDraftIndex === 0) {
      // First discoverer has already drawn card 1 as role.
      // Now first discoverer draws a 2nd card and passes to next player.
      const card2 = this.deck.pop()!;
      this.carriedCard = card2;
      player.draftingCards = undefined; // first discoverer hand clear
      this.currentDraftIndex = 1; // Move to Player 2
      this.currentDraftStep = 2;

      const nextPlayer = this.players.get(this.draftOrder[1])!;
      const card3 = this.deck.pop()!;
      // Player 2 sees card2 (carried) and card3 (drawn from deck)
      nextPlayer.draftingCards = [this.carriedCard, card3];

      this.addSystemMessage(
        `${player.name}がカードを引き、次の【${nextPlayer.name}】へ渡しました。`
      );
      this.checkBotDraftAction();
      return true;
    }

    // Players 2, 3, 4, 5
    const cards = player.draftingCards || [];
    if (!cards.includes(chosenRole)) return false;

    // Player picks chosenRole as their secret role
    player.role = chosenRole;

    // The other card is unchosen
    const unchosenIndex = cards.findIndex((r) => r === chosenRole);
    const unchosenRole = cards[unchosenIndex === 0 ? 1 : 0];
    player.draftingCards = undefined;

    if (this.currentDraftIndex < 4) {
      // Pass unchosenRole to next player
      this.carriedCard = unchosenRole;
      this.currentDraftIndex++;
      this.currentDraftStep = this.currentDraftIndex + 1;

      const nextPlayer = this.players.get(this.draftOrder[this.currentDraftIndex])!;
      const drawnCard = this.deck.pop()!;
      nextPlayer.draftingCards = [this.carriedCard, drawnCard];

      this.addSystemMessage(
        `${player.name}が役職を選択し、もう1枚を次の【${nextPlayer.name}】へ渡しました。`
      );
      this.checkBotDraftAction();
    } else {
      // 5th player finished! The remaining unchosen card goes to the sickroom!
      this.sickroomRole = unchosenRole;
      this.addSystemMessage(
        `${player.name}が役職を選択し、残された最後の1枚が療養室へ置かれました。`
      );
      // Drafting is complete! Setup words and transition to 第一討論
      this.finishDraftingAndSetupWords();
    }

    return true;
  }

  private checkBotDraftAction() {
    if (this.phase !== 'drafting') return;
    const currentActivePlayerId = this.draftOrder[this.currentDraftIndex];
    const player = this.players.get(currentActivePlayerId);
    if (!player || !player.isBot) return;

    setTimeout(() => {
      if (this.phase !== 'drafting') return;
      if (this.currentDraftIndex === 0) {
        // Player 1 auto-passes
        this.handleDraftAction(player.id, player.role!);
      } else if (player.draftingCards && player.draftingCards.length > 0) {
        const choice =
          player.draftingCards[
            Math.floor(Math.random() * player.draftingCards.length)
          ];
        this.handleDraftAction(player.id, choice);
      }
    }, 1200);
  }

  private finishDraftingAndSetupWords() {
    // Pick random word pair
    this.currentWordPair = getRandomWordPair();
    const pos = this.currentWordPair.positive;
    const neg = this.currentWordPair.negative;
    const kitsuneWord = this.currentWordPair.kitsuneWord;

    // Distribute words to 5 players: exactly 3 Positive, 2 Negative!
    // 秀才: ALWAYS positive
    // 妖狐: ALWAYS positive
    // 怪盗: ALWAYS negative
    // 学生: adjusted so total among 5 players is exactly 3 pos, 2 neg!
    let positiveRemaining = 3;
    let negativeRemaining = 2;

    const studentPlayers: ServerPlayer[] = [];

    for (const player of this.players.values()) {
      if (player.role === 'prodigy') {
        player.word = pos;
        player.wordType = 'positive';
        positiveRemaining--;
      } else if (player.role === 'kitsune') {
        player.word = pos;
        player.wordType = 'positive';
        player.kitsuneDesignatedWord = kitsuneWord;
        player.kitsuneDeclared = false;
        positiveRemaining--;
      } else if (player.role === 'phantom_thief') {
        player.word = neg;
        player.wordType = 'negative';
        negativeRemaining--;
      } else {
        // Student
        studentPlayers.push(player);
      }
    }

    // Now distribute remaining positive and negative among studentPlayers
    const studentWords: Array<'positive' | 'negative'> = [];
    for (let i = 0; i < positiveRemaining; i++) studentWords.push('positive');
    for (let i = 0; i < negativeRemaining; i++) studentWords.push('negative');
    studentWords.sort(() => Math.random() - 0.5);

    for (let i = 0; i < studentPlayers.length; i++) {
      const type = studentWords[i];
      studentPlayers[i].wordType = type;
      studentPlayers[i].word = type === 'positive' ? pos : neg;
    }

    // Transition to 第一討論
    this.startDiscussionPhase('first_discussion', 180);
  }

  private startDiscussionPhase(
    phase: 'first_discussion' | 'word_wolf' | 'final_discussion',
    durationSeconds: number
  ) {
    this.phase = phase;
    this.phaseDurationSeconds = durationSeconds;
    this.phaseStartTime = Date.now();
    this.isExtended = false;

    // Reset ready flags
    for (const p of this.players.values()) {
      p.isReadyNext = false;
    }

    if (phase === 'first_discussion') {
      this.addSystemMessage(
        '【第一討論】が開始されました（3分）。当主や一族について自由に語り合いましょう。※ワードはまだ非公開です。'
      );
    } else if (phase === 'word_wolf') {
      this.addSystemMessage(
        '【ワードウルフ】が開始されました（5分）。各々に秘密のワードが配られました。会話から怪しい人物を探りましょう！'
      );
    } else if (phase === 'final_discussion') {
      this.addSystemMessage(
        '【最終討論】が開始されました（3分）。怪盗と妖狐の正体を特定するための最後の話し合いです！'
      );
    }

    this.startTimer();
    this.checkBotReadyStatus();
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.onTimerTick();
    }, 1000);
  }

  private onTimerTick() {
    const elapsed = Math.floor((Date.now() - this.phaseStartTime) / 1000);

    if (!this.isExtended) {
      if (elapsed >= this.phaseDurationSeconds) {
        // Switch to extension!
        this.isExtended = true;
        this.phaseStartTime = Date.now(); // reset timer for extension
        this.phaseDurationSeconds = this.extensionSeconds; // 120 seconds (2:00)
        this.addSystemMessage(
          '制限時間が終了しました。延長時間（2:00カウントダウン）に入ります。'
        );
        this.onStateChange?.();
      }
    } else {
      if (elapsed >= this.phaseDurationSeconds) {
        // Extension ended, move to next phase automatically
        this.advanceFromDiscussion();
      }
    }
  }

  public toggleReady(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;
    player.isReadyNext = !player.isReadyNext;

    // Check if ALL 5 players are ready!
    const allReady = Array.from(this.players.values()).every((p) => p.isReadyNext);
    if (allReady) {
      this.advanceFromDiscussion();
    }
    return true;
  }

  private checkBotReadyStatus() {
    // Bots can mark ready after a while if desired
    const bots = Array.from(this.players.values()).filter((p) => p.isBot);
    bots.forEach((b) => {
      // Bots auto-toggle kitsune declaration if they happen to be kitsune!
      if (b.role === 'kitsune' && Math.random() > 0.3) {
        b.kitsuneDeclared = true;
      }
    });
  }

  private advanceFromDiscussion() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (this.phase === 'first_discussion') {
      this.startDiscussionPhase('word_wolf', 300);
    } else if (this.phase === 'word_wolf') {
      this.startDiscussionPhase('final_discussion', 180);
    } else if (this.phase === 'final_discussion') {
      this.startVotingPhase();
    }
    this.onStateChange?.();
  }

  public toggleKitsuneDeclared(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player || player.role !== 'kitsune') return false;
    player.kitsuneDeclared = !player.kitsuneDeclared;
    return true;
  }

  private startVotingPhase() {
    this.phase = 'voting';
    if (this.timerInterval) clearInterval(this.timerInterval);

    for (const p of this.players.values()) {
      p.hasVoted = false;
      p.thiefVote = undefined;
      p.kitsuneVote = undefined;
    }

    this.addSystemMessage(
      '【投票フェーズ】が開始されました。怪盗候補と妖狐候補（療養室・自身を含む）をそれぞれ選んで投票を確定してください。'
    );

    // Bot voting
    const candidateIds = [...Array.from(this.players.keys()), 'sickroom'];
    const bots = Array.from(this.players.values()).filter((p) => p.isBot);
    bots.forEach((b) => {
      setTimeout(() => {
        if (this.phase !== 'voting') return;
        const thiefTarget = candidateIds[Math.floor(Math.random() * candidateIds.length)];
        const kitsuneTarget = candidateIds[Math.floor(Math.random() * candidateIds.length)];
        this.submitVote(b.id, thiefTarget, kitsuneTarget);
      }, 1500 + Math.random() * 2000);
    });
  }

  public submitVote(
    playerId: string,
    thiefTarget: string,
    kitsuneTarget: string
  ): boolean {
    if (this.phase !== 'voting') return false;
    const player = this.players.get(playerId);
    if (!player) return false;

    // Target must be a valid player id or 'sickroom'
    const validTargets = [...Array.from(this.players.keys()), 'sickroom'];
    if (!validTargets.includes(thiefTarget) || !validTargets.includes(kitsuneTarget)) {
      return false;
    }

    player.thiefVote = thiefTarget;
    player.kitsuneVote = kitsuneTarget;
    player.hasVoted = true;

    // Check if ALL players have voted
    const allVoted = Array.from(this.players.values()).every((p) => p.hasVoted);
    if (allVoted) {
      this.tallyVotesAndProcessOutcome();
    }

    return true;
  }

  private tallyVotesAndProcessOutcome() {
    const thiefVotes: Record<string, string> = {};
    const kitsuneVotes: Record<string, string> = {};
    const thiefCounts: Record<string, number> = {};
    const kitsuneCounts: Record<string, number> = {};

    for (const p of this.players.values()) {
      const tv = p.thiefVote || 'sickroom';
      const kv = p.kitsuneVote || 'sickroom';
      thiefVotes[p.id] = tv;
      kitsuneVotes[p.id] = kv;
      thiefCounts[tv] = (thiefCounts[tv] || 0) + 1;
      kitsuneCounts[kv] = (kitsuneCounts[kv] || 0) + 1;
    }

    // Determine top candidate for thief
    let maxThief = 0;
    let thiefTopTargets: string[] = [];
    for (const [target, count] of Object.entries(thiefCounts)) {
      if (count > maxThief) {
        maxThief = count;
        thiefTopTargets = [target];
      } else if (count === maxThief) {
        thiefTopTargets.push(target);
      }
    }
    const thiefNominee = thiefTopTargets.length === 1 ? thiefTopTargets[0] : null;

    // Determine top candidate for kitsune
    let maxKitsune = 0;
    let kitsuneTopTargets: string[] = [];
    for (const [target, count] of Object.entries(kitsuneCounts)) {
      if (count > maxKitsune) {
        maxKitsune = count;
        kitsuneTopTargets = [target];
      } else if (count === maxKitsune) {
        kitsuneTopTargets.push(target);
      }
    }
    const kitsuneNominee =
      kitsuneTopTargets.length === 1 ? kitsuneTopTargets[0] : null;

    this.voteRecord = {
      thiefVotes,
      kitsuneVotes,
      thiefNominee,
      kitsuneNominee,
      thiefVoteCounts: thiefCounts,
      kitsuneVoteCounts: kitsuneCounts,
    };

    // Find actual locations of roles
    let trueThiefLocation = 'sickroom';
    let trueKitsuneLocation = 'sickroom';
    let thiefPlayerId: string | null = null;
    let kitsunePlayerId: string | null = null;

    if (this.sickroomRole === 'phantom_thief') {
      trueThiefLocation = 'sickroom';
    }
    if (this.sickroomRole === 'kitsune') {
      trueKitsuneLocation = 'sickroom';
    }

    for (const p of this.players.values()) {
      if (p.role === 'phantom_thief') {
        trueThiefLocation = p.id;
        thiefPlayerId = p.id;
      }
      if (p.role === 'kitsune') {
        trueKitsuneLocation = p.id;
        kitsunePlayerId = p.id;
      }
    }

    // 1. Check Kitsune victory condition (priority 1)
    let kitsuneWins = false;
    if (trueKitsuneLocation === 'sickroom') {
      // Kitsune in sickroom: wins IF sickroom was NOT nominated as kitsune!
      if (kitsuneNominee !== 'sickroom') {
        kitsuneWins = true;
      }
    } else if (kitsunePlayerId) {
      const kp = this.players.get(kitsunePlayerId)!;
      // Kitsune as player: wins IF self-declared designated word AND NOT nominated as kitsune
      if (kp.kitsuneDeclared && kitsuneNominee !== kitsunePlayerId) {
        kitsuneWins = true;
      }
    }

    if (kitsuneWins) {
      // Kitsune wins outright! (Overrides all else)
      this.evaluateFinalResult({
        kitsuneWins: true,
        trueThiefLocation,
        trueKitsuneLocation,
        thiefNominee,
        kitsuneNominee,
      });
      return;
    }

    // 2. Check if Phantom Thief was nominated
    const isThiefNominated =
      thiefNominee !== null && thiefNominee === trueThiefLocation;

    if (isThiefNominated && thiefPlayerId) {
      // Phantom Thief is an active player and was nominated -> Salvation phase!
      this.startSalvationPhase(
        thiefPlayerId,
        trueThiefLocation,
        trueKitsuneLocation,
        thiefNominee,
        kitsuneNominee
      );
    } else {
      // Phantom Thief was not nominated (or thief was in sickroom) -> regular evaluation
      this.evaluateFinalResult({
        kitsuneWins: false,
        trueThiefLocation,
        trueKitsuneLocation,
        thiefNominee,
        kitsuneNominee,
        salvationAttempted: false,
      });
    }
  }

  private startSalvationPhase(
    thiefPlayerId: string,
    trueThiefLoc: string,
    trueKitLoc: string,
    thiefNom: string | null,
    kitNom: string | null
  ) {
    this.phase = 'salvation';
    this.salvationThiefId = thiefPlayerId;
    this.salvationSecondsRemaining = 30;
    this.salvationGuess = undefined;
    this.salvationSuccess = undefined;

    const thief = this.players.get(thiefPlayerId);
    this.addSystemMessage(
      `怪盗の正体は【${thief?.name || '一族の誰か'}】と見抜かれました！ 怪盗の救済措置が発動します。`
    );

    // Bot thief handler
    if (thief && thief.isBot) {
      setTimeout(() => {
        const botGuessed = Math.random() > 0.5 ? this.currentWordPair?.positive || '' : '不明';
        this.submitSalvationGuess(thiefPlayerId, botGuessed);
      }, 3000);
    }

    // Timer for salvation
    if (this.timerInterval) clearInterval(this.timerInterval);
    const start = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      this.salvationSecondsRemaining = Math.max(0, 30 - elapsed);
      if (this.salvationSecondsRemaining <= 0) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        // Time expired without valid answer -> salvation failed
        this.submitSalvationGuess(thiefPlayerId, '');
      }
    }, 1000);
  }

  public submitSalvationGuess(thiefPlayerId: string, guess: string): boolean {
    if (this.phase !== 'salvation') return false;
    if (this.salvationThiefId !== thiefPlayerId) return false;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const trimmedGuess = guess.trim();
    const positiveWord = this.currentWordPair?.positive || '';
    const cleanGuess = trimmedGuess.toLowerCase().replace(/\s+/g, '');
    const cleanPositive = positiveWord.toLowerCase().replace(/\s+/g, '');

    const isMatch = cleanGuess.length > 0 && cleanGuess === cleanPositive;
    this.salvationGuess = trimmedGuess;
    this.salvationSuccess = isMatch;

    // Find actual locations
    let trueThiefLoc = 'sickroom';
    let trueKitLoc = 'sickroom';
    for (const p of this.players.values()) {
      if (p.role === 'phantom_thief') trueThiefLoc = p.id;
      if (p.role === 'kitsune') trueKitLoc = p.id;
    }

    this.evaluateFinalResult({
      kitsuneWins: false,
      trueThiefLocation: trueThiefLoc,
      trueKitsuneLocation: trueKitLoc,
      thiefNominee: this.voteRecord?.thiefNominee || null,
      kitsuneNominee: this.voteRecord?.kitsuneNominee || null,
      salvationAttempted: true,
      salvationSuccess: isMatch,
      salvationGuess: trimmedGuess,
    });

    return true;
  }

  private evaluateFinalResult(params: {
    kitsuneWins: boolean;
    trueThiefLocation: string;
    trueKitsuneLocation: string;
    thiefNominee: string | null;
    kitsuneNominee: string | null;
    salvationAttempted?: boolean;
    salvationSuccess?: boolean;
    salvationGuess?: string;
  }) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.phase = 'result';

    const {
      kitsuneWins,
      trueThiefLocation,
      trueKitsuneLocation,
      thiefNominee,
      kitsuneNominee,
      salvationAttempted = false,
      salvationSuccess = false,
      salvationGuess,
    } = params;

    // Gather roles, words, types
    const roles: Record<string, Role> = {};
    const words: Record<string, string> = {};
    const wordTypes: Record<string, 'positive' | 'negative'> = {};

    let kitsuneDeclared = false;
    let kitsuneTargetWord = this.currentWordPair?.kitsuneWord || '';

    for (const p of this.players.values()) {
      if (p.role) roles[p.id] = p.role;
      if (p.word) words[p.id] = p.word;
      if (p.wordType) wordTypes[p.id] = p.wordType;
      if (p.role === 'kitsune') {
        kitsuneDeclared = !!p.kitsuneDeclared;
      }
    }
    if (this.sickroomRole) {
      roles['sickroom'] = this.sickroomRole;
    }

    const kitsuneNominated =
      kitsuneNominee !== null && kitsuneNominee === trueKitsuneLocation;
    const thiefNominated =
      thiefNominee !== null && thiefNominee === trueThiefLocation;

    let winner: 'family' | 'phantom_thief' | 'kitsune' | 'draw' | 'inconclusive' =
      'inconclusive';
    let winnerTitle = '';
    let narrative = '';

    // Priority 1: 妖狐勝利
    if (kitsuneWins) {
      winner = 'kitsune';
      winnerTitle = '妖狐の完全勝利！';
      narrative =
        '妖狐が怪盗騒ぎに紛れてお宝を奪い去った！「ふふ、人間などたやすく化かせるものよ。」怪盗も一族も、妖の幻術に踊らされていたのだ。';
    }
    // Priority 2: 怪盗救済成功（引き分け）
    else if (salvationAttempted && salvationSuccess) {
      winner = 'draw';
      winnerTitle = '引き分け（怪盗の救済成功）';
      narrative =
        '「ボクの正体は見破られたが、キミたちの合言葉は【' +
        (this.currentWordPair?.positive || '') +
        '】だね！」怪盗は正のワードを見抜き、煙幕と共に姿を消した。お宝は取り戻したが、怪盗の姿はどこにもなかった……。';
    }
    // Priority 3: 一族側通常勝利 (怪盗と妖狐の両方を正しく指名)
    else if (thiefNominated && kitsuneNominated) {
      winner = 'family';
      winnerTitle = '一族側の完全勝利！';
      narrative =
        '「ついに正体を暴いたぞ！ お宝は無事、一族の手に戻った。」怪盗と妖狐の狡猾な変装を共に見破り、誇り高き一族の絆が勝利を収めた！';
    }
    // Priority 4: 怪盗側通常勝利 (怪盗が指名されず逃げ切り)
    else if (!thiefNominated) {
      winner = 'phantom_thief';
      winnerTitle = '怪盗側の完全勝利！';
      narrative =
        '「ボクの変装は見破れなかったようだね。家宝はありがたく頂戴していくヨ！」怪盗は悠然と屋敷の夜闇へ消え去った。';
    }
    // Other (Thief nominated & salvation failed, but Family missed Fox)
    else {
      winner = 'inconclusive';
      winnerTitle = '怪盗逮捕・妖狐逃亡';
      narrative =
        '怪盗の変装を暴きお宝は奪還したが、屋敷に潜む妖狐の影を逃してしまった……完全な平穏はまだ訪れていない。';
    }

    this.result = {
      winner,
      winnerTitle,
      narrative,
      positiveWord: this.currentWordPair?.positive || '',
      negativeWord: this.currentWordPair?.negative || '',
      roles,
      words,
      wordTypes,
      kitsuneDesignatedWord: kitsuneTargetWord,
      kitsuneDeclared,
      kitsuneNominated,
      kitsuneLocation: trueKitsuneLocation,
      thiefNominated,
      thiefLocation: trueThiefLocation,
      salvationAttempted,
      salvationSuccess,
      salvationGuess,
    };

    this.addSystemMessage(`ゲームが終了しました！ 結果：${winnerTitle}`);
  }

  public resetForRematch() {
    this.phase = 'lobby';
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.deck = [];
    this.firstDiscovererId = undefined;
    this.draftOrder = [];
    this.currentDraftIndex = 0;
    this.currentDraftStep = 1;
    this.carriedCard = undefined;
    this.sickroomCharacter = undefined;
    this.sickroomRole = undefined;
    this.currentWordPair = undefined;
    this.voteRecord = undefined;
    this.salvationThiefId = undefined;
    this.salvationGuess = undefined;
    this.salvationSuccess = undefined;
    this.result = undefined;

    this.removeBots();
    for (const [id, p] of this.players.entries()) {
      if (!p.isConnected && !p.isBot) {
        this.players.delete(id);
      }
    }
    this.ensureActiveHost();

    this.addSystemMessage('ルームがリセットされました。再戦の準備が完了しました！');
  }

  public addMessage(
    senderId: string,
    senderName: string,
    text: string
  ): ChatMessage {
    const sender = this.players.get(senderId);
    let relation: string | undefined = undefined;
    if (sender && sender.characterId) {
      const char = CHARACTERS.find((c) => c.id === sender.characterId);
      if (char) relation = char.relation;
    }

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName,
      characterRelation: relation,
      text,
      timestamp: Date.now(),
    };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 100) this.chatMessages.shift();
    return msg;
  }

  public addSystemMessage(text: string): ChatMessage {
    const msg: ChatMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: 'system',
      senderName: '執事',
      text,
      timestamp: Date.now(),
      isSystem: true,
    };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 100) this.chatMessages.shift();
    return msg;
  }

  // Get strictly sanitized public state
  public getPublicState(): GameStatePublic {
    const publicPlayers: PlayerPublic[] = Array.from(this.players.values()).map(
      (p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isConnected: p.isConnected,
        isBot: p.isBot,
        characterId: p.characterId,
        isReadyNext: p.isReadyNext,
        hasVoted: p.hasVoted,
        draftOrder: p.draftOrder,
      })
    );

    const currentDraftPlayerId =
      this.phase === 'drafting'
        ? this.draftOrder[this.currentDraftIndex]
        : undefined;

    return {
      roomId: this.id,
      phase: this.phase,
      phaseStartTime: this.phaseStartTime,
      phaseDurationSeconds: this.phaseDurationSeconds,
      isExtended: this.isExtended,
      extensionSeconds: this.extensionSeconds,
      readyCount: Array.from(this.players.values()).filter((p) => p.isReadyNext)
        .length,
      totalPlayers: this.players.size,
      players: publicPlayers,
      sickroomCharacter: this.sickroomCharacter,
      firstDiscovererId: this.firstDiscovererId,
      currentDraftPlayerId,
      currentDraftStep: this.currentDraftStep,
      hostPlayerId: this.getHost()?.id || '',
      voteRecord: this.voteRecord,
      salvation:
        this.phase === 'salvation'
          ? {
              active: true,
              thiefPlayerId: this.salvationThiefId || '',
              secondsRemaining: this.salvationSecondsRemaining,
              guess: this.salvationGuess,
              isSuccess: this.salvationSuccess,
            }
          : undefined,
      result: this.result,
    };
  }

  // Get strictly personalized private state for this player only!
  public getPrivateState(playerId: string): PlayerPrivate {
    const p = this.players.get(playerId);
    if (!p) return {};

    const privateData: PlayerPrivate = {};

    // Only reveal player's own role after assigned
    if (p.role) {
      privateData.role = p.role;
    }

    // Only reveal word during word_wolf, final_discussion, voting, salvation, result
    if (
      this.phase === 'word_wolf' ||
      this.phase === 'final_discussion' ||
      this.phase === 'voting' ||
      this.phase === 'salvation' ||
      this.phase === 'result'
    ) {
      privateData.word = p.word;
      privateData.wordType = p.wordType;
    }

    // Only reveal Kitsune designated word to Kitsune
    if (p.role === 'kitsune') {
      privateData.kitsuneDesignatedWord = p.kitsuneDesignatedWord;
      privateData.kitsuneDeclared = p.kitsuneDeclared;
    }

    // Drafting hand cards (only during player's turn to act)
    if (this.phase === 'drafting') {
      const activeDraftPlayerId = this.draftOrder[this.currentDraftIndex];
      if (activeDraftPlayerId === playerId && p.draftingCards) {
        privateData.draftingCards = p.draftingCards;
      }
    }

    if (this.phase === 'salvation' && this.salvationThiefId === playerId) {
      privateData.salvationEligible = true;
    }

    return privateData;
  }
}
