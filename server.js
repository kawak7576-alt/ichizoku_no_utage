// server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";

// src/data/characters.ts
var HEAD_CHARACTER = {
  id: "head",
  relation: "\u5F53\u4E3B",
  location: "\u5927\u5E83\u9593",
  title: "\u5927\u5E83\u9593\u306E\u5F53\u4E3B",
  description: "\u62C5\u5F53\u5834\u6240\uFF1A\u5927\u5E83\u9593",
  avatarIcon: "Crown"
};
var SIBLING_CHARACTERS = [
  {
    id: "eldest_son",
    relation: "\u9577\u7537",
    location: "\u66F8\u658E",
    title: "\u66F8\u658E\u306E\u9577\u7537",
    description: "\u62C5\u5F53\u5834\u6240\uFF1A\u66F8\u658E",
    avatarIcon: "BookOpen"
  },
  {
    id: "eldest_daughter",
    relation: "\u9577\u5973",
    location: "\u30A2\u30C8\u30EA\u30A8",
    title: "\u30A2\u30C8\u30EA\u30A8\u306E\u9577\u5973",
    description: "\u62C5\u5F53\u5834\u6240\uFF1A\u30A2\u30C8\u30EA\u30A8",
    avatarIcon: "Palette"
  },
  {
    id: "second_son",
    relation: "\u6B21\u7537",
    location: "\u30A8\u30F3\u30C8\u30E9\u30F3\u30B9",
    title: "\u30A8\u30F3\u30C8\u30E9\u30F3\u30B9\u306E\u6B21\u7537",
    description: "\u62C5\u5F53\u5834\u6240\uFF1A\u30A8\u30F3\u30C8\u30E9\u30F3\u30B9",
    avatarIcon: "DoorOpen"
  },
  {
    id: "second_daughter",
    relation: "\u6B21\u5973",
    location: "\u6E29\u5BA4",
    title: "\u6E29\u5BA4\u306E\u6B21\u5973",
    description: "\u62C5\u5F53\u5834\u6240\uFF1A\u6E29\u5BA4",
    avatarIcon: "Trees"
  },
  {
    id: "third_son",
    relation: "\u4E09\u7537",
    location: "\u98DF\u5802",
    title: "\u98DF\u5802\u306E\u4E09\u7537",
    description: "\u62C5\u5F53\u5834\u6240\uFF1A\u98DF\u5802",
    avatarIcon: "Utensils"
  },
  {
    id: "third_daughter",
    relation: "\u4E09\u5973",
    location: "\u904A\u622F\u5BA4",
    title: "\u904A\u622F\u5BA4\u306E\u4E09\u5973",
    description: "\u62C5\u5F53\u5834\u6240\uFF1A\u904A\u622F\u5BA4",
    avatarIcon: "Dice5"
  }
];
var CHARACTERS = [
  HEAD_CHARACTER,
  ...SIBLING_CHARACTERS
];
var ALL_NINE_CHARACTERS = [
  ...CHARACTERS,
  {
    id: "phantom_thief",
    relation: "\u602A\u76D7",
    location: "",
    title: "\u602A\u76D7",
    description: "\u4E00\u65CF\u306E\u8AB0\u304B\u306B\u5909\u88C5\u3057\u305F\u602A\u76D7\u3002",
    avatarIcon: "Mask"
  },
  {
    id: "kitsune",
    relation: "\u5996\u72D0",
    location: "",
    title: "\u5996\u72D0",
    description: "\u4E00\u65CF\u306B\u7D1B\u308C\u8FBC\u3093\u3060\u5996\u7570\u3002",
    avatarIcon: "Flame"
  }
];

// server/words.ts
var WORD_PAIRS = [
  { positive: "\u30AB\u30EC\u30FC", negative: "\u30CF\u30E4\u30B7\u30E9\u30A4\u30B9", kitsuneWord: "\u798F\u795E\u6F2C\u3051" },
  { positive: "\u72AC", negative: "\u732B", kitsuneWord: "\u9996\u8F2A" },
  { positive: "\u9752", negative: "\u7DD1", kitsuneWord: "\u30A8\u30E1\u30E9\u30EB\u30C9" },
  { positive: "\u91CE\u7403", negative: "\u30B5\u30C3\u30AB\u30FC", kitsuneWord: "\u30E6\u30CB\u30D5\u30A9\u30FC\u30E0" },
  { positive: "\u91E3\u308A", negative: "\u767B\u5C71", kitsuneWord: "\u30EA\u30E5\u30C3\u30AF" },
  { positive: "\u30C8\u30DE\u30C8", negative: "\u30CB\u30F3\u30B8\u30F3", kitsuneWord: "\u30B9\u30FC\u30D7" },
  { positive: "\u30D0\u30E9", negative: "\u30C1\u30E5\u30FC\u30EA\u30C3\u30D7", kitsuneWord: "\u82B1\u74F6" },
  { positive: "\u30B3\u30FC\u30D2\u30FC", negative: "\u7D05\u8336", kitsuneWord: "\u30C6\u30A3\u30FC\u30AB\u30C3\u30D7" },
  { positive: "\u5BFF\u53F8", negative: "\u523A\u8EAB", kitsuneWord: "\u308F\u3055\u3073" },
  { positive: "\u96FB\u8ECA", negative: "\u30D0\u30B9", kitsuneWord: "\u5B9A\u671F\u5238" },
  { positive: "\u6D77", negative: "\u30D7\u30FC\u30EB", kitsuneWord: "\u6D6E\u304D\u8F2A" },
  { positive: "\u30D4\u30A2\u30CE", negative: "\u30AE\u30BF\u30FC", kitsuneWord: "\u697D\u8B5C" },
  { positive: "\u96E8", negative: "\u96EA", kitsuneWord: "\u5098" },
  { positive: "\u308A\u3093\u3054", negative: "\u307F\u304B\u3093", kitsuneWord: "\u76AE" },
  { positive: "\u6620\u753B\u9928", negative: "\u5287\u5834", kitsuneWord: "\u30DD\u30C3\u30D7\u30B3\u30FC\u30F3" },
  { positive: "\u30E9\u30FC\u30E1\u30F3", negative: "\u3046\u3069\u3093", kitsuneWord: "\u30EC\u30F3\u30B2" },
  { positive: "\u30B9\u30DE\u30DB", negative: "\u30D1\u30BD\u30B3\u30F3", kitsuneWord: "\u5145\u96FB\u5668" },
  { positive: "\u5BCC\u58EB\u5C71", negative: "\u30A8\u30D9\u30EC\u30B9\u30C8", kitsuneWord: "\u5C71\u9802" },
  { positive: "\u685C", negative: "\u7D05\u8449", kitsuneWord: "\u82B1\u898B" },
  { positive: "\u592A\u967D", negative: "\u6708", kitsuneWord: "\u671B\u9060\u93E1" },
  { positive: "\u6642\u8A08", negative: "\u30AB\u30EC\u30F3\u30C0\u30FC", kitsuneWord: "\u79D2\u91DD" },
  { positive: "\u56F3\u66F8\u9928", negative: "\u66F8\u5E97", kitsuneWord: "\u3057\u304A\u308A" },
  { positive: "\u30E1\u30AC\u30CD", negative: "\u30B5\u30F3\u30B0\u30E9\u30B9", kitsuneWord: "\u30EC\u30F3\u30BA" },
  { positive: "\u6E29\u6CC9", negative: "\u30B5\u30A6\u30CA", kitsuneWord: "\u624B\u306C\u3050\u3044" },
  { positive: "\u30C1\u30E7\u30B3\u30EC\u30FC\u30C8", negative: "\u30AF\u30C3\u30AD\u30FC", kitsuneWord: "\u30AB\u30AB\u30AA" },
  { positive: "\u30D1\u30F3", negative: "\u3054\u98EF", kitsuneWord: "\u30C8\u30FC\u30B9\u30BF\u30FC" },
  { positive: "\u9CE5", negative: "\u98DB\u884C\u6A5F", kitsuneWord: "\u7FFC" },
  { positive: "\u30DE\u30E9\u30BD\u30F3", negative: "\u77ED\u8DDD\u96E2\u8D70", kitsuneWord: "\u30B4\u30FC\u30EB\u30C6\u30FC\u30D7" },
  { positive: "\u30AD\u30E3\u30F3\u30D7", negative: "\u30DB\u30C6\u30EB", kitsuneWord: "\u30C6\u30F3\u30C8" },
  { positive: "\u91D1", negative: "\u9280", kitsuneWord: "\u30E1\u30C0\u30EB" },
  { positive: "\u30D3\u30FC\u30EB", negative: "\u30EF\u30A4\u30F3", kitsuneWord: "\u4E7E\u676F" },
  { positive: "\u30C6\u30CB\u30B9", negative: "\u30D0\u30C9\u30DF\u30F3\u30C8\u30F3", kitsuneWord: "\u30E9\u30B1\u30C3\u30C8" },
  { positive: "\u75C5\u9662", negative: "\u85AC\u5C40", kitsuneWord: "\u51E6\u65B9\u7B8B" },
  { positive: "\u8ECA", negative: "\u30D0\u30A4\u30AF", kitsuneWord: "\u30CF\u30F3\u30C9\u30EB" },
  { positive: "\u57CE", negative: "\u5BAE\u6BBF", kitsuneWord: "\u77F3\u57A3" }
];
function getRandomWordPair() {
  const index = Math.floor(Math.random() * WORD_PAIRS.length);
  return WORD_PAIRS[index];
}

// server/gameLogic.ts
var GameRoom = class {
  constructor(id) {
    this.phase = "lobby";
    this.players = /* @__PURE__ */ new Map();
    // Deck & Drafting
    this.deck = [];
    this.draftOrder = [];
    // player IDs in order 1..5
    this.currentDraftIndex = 0;
    // 0..4
    this.currentDraftStep = 1;
    // Card passed from previous player
    // Role Configuration: true = 秀才あり (prodigy 1, student 3), false = 秀才なし (student 4)
    this.includeProdigy = true;
    // Timers
    this.phaseStartTime = 0;
    this.phaseDurationSeconds = 0;
    this.isExtended = false;
    this.extensionSeconds = 120;
    this.salvationSecondsRemaining = 30;
    this.chatMessages = [];
    this.id = id;
  }
  addPlayer(name, socketId, isBot = false) {
    const hasConnectedHumanHost = Array.from(this.players.values()).some(
      (p) => p.isHost && p.isConnected && !p.isBot
    );
    const isHost = !isBot && !hasConnectedHumanHost;
    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`;
    const player = {
      id: playerId,
      name,
      socketId,
      isHost,
      isConnected: true,
      isBot
    };
    this.players.set(playerId, player);
    this.ensureActiveHost();
    return player;
  }
  getPlayer(id) {
    return this.players.get(id);
  }
  getPlayerBySocketId(socketId) {
    for (const player of this.players.values()) {
      if (player.socketId === socketId) return player;
    }
    return void 0;
  }
  getHost() {
    for (const p of this.players.values()) {
      if (p.isHost && p.isConnected && !p.isBot) return p;
    }
    for (const p of this.players.values()) {
      if (p.isHost) return p;
    }
    return void 0;
  }
  ensureActiveHost() {
    const currentHost = this.getHost();
    if (currentHost && currentHost.isConnected && !currentHost.isBot) {
      return currentHost;
    }
    for (const p of this.players.values()) {
      p.isHost = false;
    }
    for (const p of this.players.values()) {
      if (p.isConnected && !p.isBot) {
        p.isHost = true;
        return p;
      }
    }
    for (const p of this.players.values()) {
      if (!p.isBot) {
        p.isHost = true;
        return p;
      }
    }
    if (this.players.size > 0) {
      const first = Array.from(this.players.values())[0];
      first.isHost = true;
      return first;
    }
    return void 0;
  }
  cleanDisconnectedInLobby(isSocketAlive2) {
    if (this.phase !== "lobby") return;
    for (const [id, p] of this.players.entries()) {
      if (!p.isBot) {
        const alive = p.isConnected && (!isSocketAlive2 || isSocketAlive2(p.socketId));
        if (!alive) {
          this.players.delete(id);
        }
      }
    }
    const hasConnectedHuman = Array.from(this.players.values()).some(
      (p) => p.isConnected && !p.isBot && (!isSocketAlive2 || isSocketAlive2(p.socketId))
    );
    if (!hasConnectedHuman) {
      this.players.clear();
    } else {
      this.ensureActiveHost();
    }
  }
  removePlayer(playerId) {
    this.players.delete(playerId);
    this.ensureActiveHost();
  }
  fillWithBots() {
    if (this.phase !== "lobby") return;
    const botNames = ["\u66F8\u751F\u30A2\u30E9\u30F3", "\u4EE4\u5B22\u30AF\u30E9\u30E9", "\u9752\u5E74\u30AB\u30A4\u30F3", "\u753B\u5546\u30A8\u30EA\u30C3\u30AF"];
    let idx = 0;
    while (this.players.size < 5) {
      const name = botNames[idx % botNames.length] + ` (${this.players.size + 1})`;
      this.addPlayer(name, `bot_${Math.random().toString(36).substring(2, 7)}`, true);
      idx++;
    }
  }
  removeBots() {
    if (this.phase !== "lobby") return;
    for (const [id, p] of this.players.entries()) {
      if (p.isBot) {
        this.players.delete(id);
      }
    }
  }
  startGame() {
    if (this.players.size !== 5) return false;
    this.phase = "opening";
    this.assignCharacters();
    this.addSystemMessage("\u5C4B\u6577\u306E\u5BB4\u304C\u59CB\u307E\u308A\u307E\u3057\u305F\u3002\u5F53\u4E3B\u306E\u5927\u5207\u306A\u5BB6\u5B9D\u304C\u76D7\u307E\u308C\u307E\u3057\u305F\u2026\u2026\uFF01");
    return true;
  }
  assignCharacters() {
    const shuffledChars = [...SIBLING_CHARACTERS].sort(() => Math.random() - 0.5);
    const playerArray = Array.from(this.players.values());
    for (let i = 0; i < 5; i++) {
      playerArray[i].characterId = shuffledChars[i].id;
    }
    this.sickroomCharacter = shuffledChars[5];
  }
  proceedToDrafting() {
    if (this.phase !== "opening") return;
    this.phase = "drafting";
    const roleCards = this.includeProdigy ? ["student", "student", "student", "prodigy", "phantom_thief", "kitsune"] : ["student", "student", "student", "student", "phantom_thief", "kitsune"];
    this.deck = roleCards.sort(() => Math.random() - 0.5);
    const playerList = Array.from(this.players.values());
    const firstDiscovererIndex = Math.floor(Math.random() * 5);
    this.firstDiscovererId = playerList[firstDiscovererIndex].id;
    this.draftOrder = [];
    for (let i = 0; i < 5; i++) {
      const p = playerList[(firstDiscovererIndex + i) % 5];
      p.draftOrder = i + 1;
      this.draftOrder.push(p.id);
    }
    this.currentDraftIndex = 0;
    this.currentDraftStep = 1;
    this.carriedCard = void 0;
    const p1 = this.players.get(this.draftOrder[0]);
    const card1 = this.deck.pop();
    const card2 = this.deck.pop();
    p1.role = void 0;
    p1.draftingCards = [card1, card2];
    this.addSystemMessage(
      `\u7B2C\u4E00\u767A\u898B\u8005\u306F\u3010${p1.name}\u3011\u3067\u3059\u3002\u5C71\u672D\u304B\u30892\u679A\u306E\u5F79\u8077\u30AB\u30FC\u30C9\u3092\u53D7\u3051\u53D6\u308A\u307E\u3057\u305F\u3002`
    );
    this.checkBotDraftAction();
  }
  // Handle player draft action
  handleDraftAction(playerId, chosenRole) {
    if (this.phase !== "drafting") return false;
    const currentActivePlayerId = this.draftOrder[this.currentDraftIndex];
    if (currentActivePlayerId !== playerId) return false;
    const player = this.players.get(playerId);
    const cards = player.draftingCards || [];
    if (!cards.includes(chosenRole)) return false;
    player.role = chosenRole;
    const unchosenIndex = cards.findIndex((r) => r === chosenRole);
    const unchosenRole = cards[unchosenIndex === 0 ? 1 : 0];
    player.draftingCards = void 0;
    if (this.currentDraftIndex < 4) {
      const nextPlayer = this.players.get(this.draftOrder[this.currentDraftIndex + 1]);
      const nextChar = SIBLING_CHARACTERS.find((c) => c.id === nextPlayer.characterId);
      player.passedCard = {
        targetPlayerId: nextPlayer.id,
        targetPlayerName: nextPlayer.name,
        targetCharacterRelation: nextChar?.relation || "\u6B21\u306E\u30D7\u30EC\u30A4\u30E4\u30FC",
        role: unchosenRole
      };
      this.carriedCard = unchosenRole;
      this.currentDraftIndex++;
      this.currentDraftStep = this.currentDraftIndex + 1;
      const drawnCard = this.deck.pop();
      nextPlayer.draftingCards = [this.carriedCard, drawnCard];
      this.addSystemMessage(
        `${player.name}\u304C\u5F79\u8077\u3092\u9078\u629E\u3057\u3001\u3082\u30461\u679A\u3092\u6B21\u306E\u3010${nextPlayer.name}\u3011\u3078\u6E21\u3057\u307E\u3057\u305F\u3002`
      );
      this.checkBotDraftAction();
    } else {
      this.sickroomRole = unchosenRole;
      player.passedCard = {
        targetPlayerId: "sickroom",
        targetPlayerName: "\u30CE\u30F3\u30D7\u30EC\u30A4\u30E4\u30FC",
        targetCharacterRelation: this.sickroomCharacter?.relation || "\u7642\u990A\u5BA4",
        role: unchosenRole
      };
      this.addSystemMessage(
        `${player.name}\u304C\u5F79\u8077\u3092\u9078\u629E\u3057\u3001\u6B8B\u3055\u308C\u305F\u6700\u5F8C\u306E1\u679A\u304C\u7642\u990A\u5BA4\u3078\u7F6E\u304B\u308C\u307E\u3057\u305F\u3002`
      );
      this.finishDraftingAndSetupWords();
    }
    return true;
  }
  checkBotDraftAction() {
    if (this.phase !== "drafting") return;
    const currentActivePlayerId = this.draftOrder[this.currentDraftIndex];
    const player = this.players.get(currentActivePlayerId);
    if (!player || !player.isBot) return;
    setTimeout(() => {
      if (this.phase !== "drafting") return;
      if (player.draftingCards && player.draftingCards.length > 0) {
        const choice = player.draftingCards[Math.floor(Math.random() * player.draftingCards.length)];
        this.handleDraftAction(player.id, choice);
      }
    }, 1200);
  }
  finishDraftingAndSetupWords() {
    this.currentWordPair = getRandomWordPair();
    const pos = this.currentWordPair.positive;
    const neg = this.currentWordPair.negative;
    const kitsuneWord = this.currentWordPair.kitsuneWord;
    let positiveRemaining = 3;
    let negativeRemaining = 2;
    const studentPlayers = [];
    for (const player of this.players.values()) {
      if (player.role === "prodigy") {
        player.word = pos;
        player.wordType = "positive";
        positiveRemaining--;
      } else if (player.role === "kitsune") {
        player.word = pos;
        player.wordType = "positive";
        player.kitsuneDesignatedWord = kitsuneWord;
        player.kitsuneDeclared = false;
        positiveRemaining--;
      } else if (player.role === "phantom_thief") {
        player.word = neg;
        player.wordType = "negative";
        negativeRemaining--;
      } else {
        studentPlayers.push(player);
      }
    }
    const studentWords = [];
    for (let i = 0; i < positiveRemaining; i++) studentWords.push("positive");
    for (let i = 0; i < negativeRemaining; i++) studentWords.push("negative");
    studentWords.sort(() => Math.random() - 0.5);
    for (let i = 0; i < studentPlayers.length; i++) {
      const type = studentWords[i];
      studentPlayers[i].wordType = type;
      studentPlayers[i].word = type === "positive" ? pos : neg;
    }
    this.startDiscussionPhase("first_discussion", 180);
  }
  startDiscussionPhase(phase, durationSeconds) {
    this.phase = phase;
    this.phaseDurationSeconds = durationSeconds;
    this.phaseStartTime = Date.now();
    this.isExtended = false;
    for (const p of this.players.values()) {
      p.isReadyNext = false;
    }
    if (phase === "first_discussion") {
      this.addSystemMessage(
        "\u3010\u7B2C\u4E00\u8A0E\u8AD6\u3011\u304C\u958B\u59CB\u3055\u308C\u307E\u3057\u305F\uFF083\u5206\uFF09\u3002\u5F53\u4E3B\u3084\u4E00\u65CF\u306B\u3064\u3044\u3066\u81EA\u7531\u306B\u8A9E\u308A\u5408\u3044\u307E\u3057\u3087\u3046\u3002\u203B\u30EF\u30FC\u30C9\u306F\u307E\u3060\u975E\u516C\u958B\u3067\u3059\u3002"
      );
    } else if (phase === "word_wolf") {
      this.addSystemMessage(
        "\u3010\u30EF\u30FC\u30C9\u30A6\u30EB\u30D5\u3011\u304C\u958B\u59CB\u3055\u308C\u307E\u3057\u305F\uFF085\u5206\uFF09\u3002\u5404\u3005\u306B\u79D8\u5BC6\u306E\u30EF\u30FC\u30C9\u304C\u914D\u3089\u308C\u307E\u3057\u305F\u3002\u4F1A\u8A71\u304B\u3089\u602A\u3057\u3044\u4EBA\u7269\u3092\u63A2\u308A\u307E\u3057\u3087\u3046\uFF01"
      );
    } else if (phase === "final_discussion") {
      this.addSystemMessage(
        "\u3010\u6700\u7D42\u8A0E\u8AD6\u3011\u304C\u958B\u59CB\u3055\u308C\u307E\u3057\u305F\uFF083\u5206\uFF09\u3002\u602A\u76D7\u3068\u5996\u72D0\u306E\u6B63\u4F53\u3092\u7279\u5B9A\u3059\u308B\u305F\u3081\u306E\u6700\u5F8C\u306E\u8A71\u3057\u5408\u3044\u3067\u3059\uFF01"
      );
    }
    this.startTimer();
    this.checkBotReadyStatus();
  }
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.onTimerTick();
    }, 1e3);
  }
  onTimerTick() {
    const elapsed = Math.floor((Date.now() - this.phaseStartTime) / 1e3);
    if (!this.isExtended) {
      if (elapsed >= this.phaseDurationSeconds) {
        this.isExtended = true;
        this.phaseStartTime = Date.now();
        this.phaseDurationSeconds = this.extensionSeconds;
        this.addSystemMessage(
          "\u5236\u9650\u6642\u9593\u304C\u7D42\u4E86\u3057\u307E\u3057\u305F\u3002\u5EF6\u9577\u6642\u9593\uFF082:00\u30AB\u30A6\u30F3\u30C8\u30C0\u30A6\u30F3\uFF09\u306B\u5165\u308A\u307E\u3059\u3002"
        );
        this.onStateChange?.();
      }
    } else {
      if (elapsed >= this.phaseDurationSeconds) {
        this.advanceFromDiscussion();
      }
    }
  }
  toggleReady(playerId) {
    const player = this.players.get(playerId);
    if (!player) return false;
    player.isReadyNext = !player.isReadyNext;
    const allReady = Array.from(this.players.values()).every((p) => p.isReadyNext);
    if (allReady) {
      this.advanceFromDiscussion();
    }
    return true;
  }
  checkBotReadyStatus() {
    const bots = Array.from(this.players.values()).filter((p) => p.isBot);
    bots.forEach((b) => {
      if (b.role === "kitsune" && Math.random() > 0.3) {
        b.kitsuneDeclared = true;
      }
    });
  }
  advanceFromDiscussion() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.phase === "first_discussion") {
      this.startDiscussionPhase("word_wolf", 300);
    } else if (this.phase === "word_wolf") {
      this.startDiscussionPhase("final_discussion", 180);
    } else if (this.phase === "final_discussion") {
      this.startVotingPhase();
    }
    this.onStateChange?.();
  }
  toggleKitsuneDeclared(playerId) {
    const player = this.players.get(playerId);
    if (!player || player.role !== "kitsune") return false;
    player.kitsuneDeclared = !player.kitsuneDeclared;
    return true;
  }
  startVotingPhase() {
    this.phase = "voting";
    if (this.timerInterval) clearInterval(this.timerInterval);
    for (const p of this.players.values()) {
      p.hasVoted = false;
      p.thiefVote = void 0;
      p.kitsuneVote = void 0;
    }
    this.addSystemMessage(
      "\u3010\u6295\u7968\u30D5\u30A7\u30FC\u30BA\u3011\u304C\u958B\u59CB\u3055\u308C\u307E\u3057\u305F\u3002\u602A\u76D7\u5019\u88DC\u3068\u5996\u72D0\u5019\u88DC\uFF08\u7642\u990A\u5BA4\u30FB\u81EA\u8EAB\u3092\u542B\u3080\uFF09\u3092\u305D\u308C\u305E\u308C\u9078\u3093\u3067\u6295\u7968\u3092\u78BA\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    );
    const candidateIds = [...Array.from(this.players.keys()), "sickroom"];
    const bots = Array.from(this.players.values()).filter((p) => p.isBot);
    bots.forEach((b) => {
      setTimeout(() => {
        if (this.phase !== "voting") return;
        const thiefTarget = candidateIds[Math.floor(Math.random() * candidateIds.length)];
        const kitsuneTarget = candidateIds[Math.floor(Math.random() * candidateIds.length)];
        this.submitVote(b.id, thiefTarget, kitsuneTarget);
      }, 1500 + Math.random() * 2e3);
    });
  }
  submitVote(playerId, thiefTarget, kitsuneTarget) {
    if (this.phase !== "voting") return false;
    const player = this.players.get(playerId);
    if (!player) return false;
    const validTargets = [...Array.from(this.players.keys()), "sickroom"];
    if (!validTargets.includes(thiefTarget) || !validTargets.includes(kitsuneTarget)) {
      return false;
    }
    player.thiefVote = thiefTarget;
    player.kitsuneVote = kitsuneTarget;
    player.hasVoted = true;
    const allVoted = Array.from(this.players.values()).every((p) => p.hasVoted);
    if (allVoted) {
      this.tallyVotesAndProcessOutcome();
    }
    return true;
  }
  tallyVotesAndProcessOutcome() {
    const thiefVotes = {};
    const kitsuneVotes = {};
    const thiefCounts = {};
    const kitsuneCounts = {};
    for (const p of this.players.values()) {
      const tv = p.thiefVote || "sickroom";
      const kv = p.kitsuneVote || "sickroom";
      thiefVotes[p.id] = tv;
      kitsuneVotes[p.id] = kv;
      thiefCounts[tv] = (thiefCounts[tv] || 0) + 1;
      kitsuneCounts[kv] = (kitsuneCounts[kv] || 0) + 1;
    }
    let maxThief = 0;
    let thiefTopTargets = [];
    for (const [target, count] of Object.entries(thiefCounts)) {
      if (count > maxThief) {
        maxThief = count;
        thiefTopTargets = [target];
      } else if (count === maxThief) {
        thiefTopTargets.push(target);
      }
    }
    const thiefNominee = thiefTopTargets.length === 1 ? thiefTopTargets[0] : null;
    let maxKitsune = 0;
    let kitsuneTopTargets = [];
    for (const [target, count] of Object.entries(kitsuneCounts)) {
      if (count > maxKitsune) {
        maxKitsune = count;
        kitsuneTopTargets = [target];
      } else if (count === maxKitsune) {
        kitsuneTopTargets.push(target);
      }
    }
    const kitsuneNominee = kitsuneTopTargets.length === 1 ? kitsuneTopTargets[0] : null;
    this.voteRecord = {
      thiefVotes,
      kitsuneVotes,
      thiefNominee,
      kitsuneNominee,
      thiefVoteCounts: thiefCounts,
      kitsuneVoteCounts: kitsuneCounts
    };
    let trueThiefLocation = "sickroom";
    let trueKitsuneLocation = "sickroom";
    let thiefPlayerId = null;
    let kitsunePlayerId = null;
    if (this.sickroomRole === "phantom_thief") {
      trueThiefLocation = "sickroom";
    }
    if (this.sickroomRole === "kitsune") {
      trueKitsuneLocation = "sickroom";
    }
    for (const p of this.players.values()) {
      if (p.role === "phantom_thief") {
        trueThiefLocation = p.id;
        thiefPlayerId = p.id;
      }
      if (p.role === "kitsune") {
        trueKitsuneLocation = p.id;
        kitsunePlayerId = p.id;
      }
    }
    let kitsuneWins = false;
    if (trueKitsuneLocation === "sickroom") {
      if (kitsuneNominee !== "sickroom") {
        kitsuneWins = true;
      }
    } else if (kitsunePlayerId) {
      const kp = this.players.get(kitsunePlayerId);
      if (kp.kitsuneDeclared && kitsuneNominee !== kitsunePlayerId) {
        kitsuneWins = true;
      }
    }
    if (kitsuneWins) {
      this.evaluateFinalResult({
        kitsuneWins: true,
        trueThiefLocation,
        trueKitsuneLocation,
        thiefNominee,
        kitsuneNominee
      });
      return;
    }
    const isThiefNominated = thiefNominee !== null && thiefNominee === trueThiefLocation;
    if (isThiefNominated && thiefPlayerId) {
      this.startSalvationPhase(
        thiefPlayerId,
        trueThiefLocation,
        trueKitsuneLocation,
        thiefNominee,
        kitsuneNominee
      );
    } else {
      this.evaluateFinalResult({
        kitsuneWins: false,
        trueThiefLocation,
        trueKitsuneLocation,
        thiefNominee,
        kitsuneNominee,
        salvationAttempted: false
      });
    }
  }
  startSalvationPhase(thiefPlayerId, trueThiefLoc, trueKitLoc, thiefNom, kitNom) {
    this.phase = "salvation";
    this.salvationThiefId = thiefPlayerId;
    this.salvationSecondsRemaining = 30;
    this.salvationGuess = void 0;
    this.salvationSuccess = void 0;
    const thief = this.players.get(thiefPlayerId);
    this.addSystemMessage(
      `\u602A\u76D7\u306E\u6B63\u4F53\u306F\u3010${thief?.name || "\u4E00\u65CF\u306E\u8AB0\u304B"}\u3011\u3068\u898B\u629C\u304B\u308C\u307E\u3057\u305F\uFF01 \u602A\u76D7\u306E\u6551\u6E08\u63AA\u7F6E\u304C\u767A\u52D5\u3057\u307E\u3059\u3002`
    );
    if (thief && thief.isBot) {
      setTimeout(() => {
        const botGuessed = Math.random() > 0.5 ? this.currentWordPair?.positive || "" : "\u4E0D\u660E";
        this.submitSalvationGuess(thiefPlayerId, botGuessed);
      }, 3e3);
    }
    if (this.timerInterval) clearInterval(this.timerInterval);
    const start = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1e3);
      this.salvationSecondsRemaining = Math.max(0, 30 - elapsed);
      if (this.salvationSecondsRemaining <= 0) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.submitSalvationGuess(thiefPlayerId, "");
      }
    }, 1e3);
  }
  submitSalvationGuess(thiefPlayerId, guess) {
    if (this.phase !== "salvation") return false;
    if (this.salvationThiefId !== thiefPlayerId) return false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    const trimmedGuess = guess.trim();
    const positiveWord = this.currentWordPair?.positive || "";
    const cleanGuess = trimmedGuess.toLowerCase().replace(/\s+/g, "");
    const cleanPositive = positiveWord.toLowerCase().replace(/\s+/g, "");
    const isMatch = cleanGuess.length > 0 && cleanGuess === cleanPositive;
    this.salvationGuess = trimmedGuess;
    this.salvationSuccess = isMatch;
    let trueThiefLoc = "sickroom";
    let trueKitLoc = "sickroom";
    for (const p of this.players.values()) {
      if (p.role === "phantom_thief") trueThiefLoc = p.id;
      if (p.role === "kitsune") trueKitLoc = p.id;
    }
    this.evaluateFinalResult({
      kitsuneWins: false,
      trueThiefLocation: trueThiefLoc,
      trueKitsuneLocation: trueKitLoc,
      thiefNominee: this.voteRecord?.thiefNominee || null,
      kitsuneNominee: this.voteRecord?.kitsuneNominee || null,
      salvationAttempted: true,
      salvationSuccess: isMatch,
      salvationGuess: trimmedGuess
    });
    return true;
  }
  evaluateFinalResult(params) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.phase = "result";
    const {
      kitsuneWins,
      trueThiefLocation,
      trueKitsuneLocation,
      thiefNominee,
      kitsuneNominee,
      salvationAttempted = false,
      salvationSuccess = false,
      salvationGuess
    } = params;
    const roles = {};
    const words = {};
    const wordTypes = {};
    let kitsuneDeclared = false;
    let kitsuneTargetWord = this.currentWordPair?.kitsuneWord || "";
    for (const p of this.players.values()) {
      if (p.role) roles[p.id] = p.role;
      if (p.word) words[p.id] = p.word;
      if (p.wordType) wordTypes[p.id] = p.wordType;
      if (p.role === "kitsune") {
        kitsuneDeclared = !!p.kitsuneDeclared;
      }
    }
    if (this.sickroomRole) {
      roles["sickroom"] = this.sickroomRole;
    }
    const kitsuneNominated = kitsuneNominee !== null && kitsuneNominee === trueKitsuneLocation;
    const thiefNominated = thiefNominee !== null && thiefNominee === trueThiefLocation;
    let winner = "inconclusive";
    let winnerTitle = "";
    let narrative = "";
    if (kitsuneWins) {
      winner = "kitsune";
      winnerTitle = "\u5996\u72D0\u306E\u5B8C\u5168\u52DD\u5229\uFF01";
      narrative = "\u5996\u72D0\u304C\u602A\u76D7\u9A12\u304E\u306B\u7D1B\u308C\u3066\u304A\u5B9D\u3092\u596A\u3044\u53BB\u3063\u305F\uFF01\u300C\u3075\u3075\u3001\u4EBA\u9593\u306A\u3069\u305F\u3084\u3059\u304F\u5316\u304B\u305B\u308B\u3082\u306E\u3088\u3002\u300D\u602A\u76D7\u3082\u4E00\u65CF\u3082\u3001\u5996\u306E\u5E7B\u8853\u306B\u8E0A\u3089\u3055\u308C\u3066\u3044\u305F\u306E\u3060\u3002";
    } else if (salvationAttempted && salvationSuccess) {
      winner = "draw";
      winnerTitle = "\u5F15\u304D\u5206\u3051\uFF08\u602A\u76D7\u306E\u6551\u6E08\u6210\u529F\uFF09";
      narrative = "\u300C\u30DC\u30AF\u306E\u6B63\u4F53\u306F\u898B\u7834\u3089\u308C\u305F\u304C\u3001\u30AD\u30DF\u305F\u3061\u306E\u5408\u8A00\u8449\u306F\u3010" + (this.currentWordPair?.positive || "") + "\u3011\u3060\u306D\uFF01\u300D\u602A\u76D7\u306F\u6B63\u306E\u30EF\u30FC\u30C9\u3092\u898B\u629C\u304D\u3001\u7159\u5E55\u3068\u5171\u306B\u59FF\u3092\u6D88\u3057\u305F\u3002\u304A\u5B9D\u306F\u53D6\u308A\u623B\u3057\u305F\u304C\u3001\u602A\u76D7\u306E\u59FF\u306F\u3069\u3053\u306B\u3082\u306A\u304B\u3063\u305F\u2026\u2026\u3002";
    } else if (thiefNominated && kitsuneNominated) {
      winner = "family";
      winnerTitle = "\u4E00\u65CF\u5074\u306E\u5B8C\u5168\u52DD\u5229\uFF01";
      narrative = "\u300C\u3064\u3044\u306B\u6B63\u4F53\u3092\u66B4\u3044\u305F\u305E\uFF01 \u304A\u5B9D\u306F\u7121\u4E8B\u3001\u4E00\u65CF\u306E\u624B\u306B\u623B\u3063\u305F\u3002\u300D\u602A\u76D7\u3068\u5996\u72D0\u306E\u72E1\u733E\u306A\u5909\u88C5\u3092\u5171\u306B\u898B\u7834\u308A\u3001\u8A87\u308A\u9AD8\u304D\u4E00\u65CF\u306E\u7D46\u304C\u52DD\u5229\u3092\u53CE\u3081\u305F\uFF01";
    } else if (!thiefNominated) {
      winner = "phantom_thief";
      winnerTitle = "\u602A\u76D7\u5074\u306E\u5B8C\u5168\u52DD\u5229\uFF01";
      narrative = "\u300C\u30DC\u30AF\u306E\u5909\u88C5\u306F\u898B\u7834\u308C\u306A\u304B\u3063\u305F\u3088\u3046\u3060\u306D\u3002\u5BB6\u5B9D\u306F\u3042\u308A\u304C\u305F\u304F\u9802\u6234\u3057\u3066\u3044\u304F\u30E8\uFF01\u300D\u602A\u76D7\u306F\u60A0\u7136\u3068\u5C4B\u6577\u306E\u591C\u95C7\u3078\u6D88\u3048\u53BB\u3063\u305F\u3002";
    } else {
      winner = "inconclusive";
      winnerTitle = "\u602A\u76D7\u902E\u6355\u30FB\u5996\u72D0\u9003\u4EA1";
      narrative = "\u602A\u76D7\u306E\u5909\u88C5\u3092\u66B4\u304D\u304A\u5B9D\u306F\u596A\u9084\u3057\u305F\u304C\u3001\u5C4B\u6577\u306B\u6F5C\u3080\u5996\u72D0\u306E\u5F71\u3092\u9003\u3057\u3066\u3057\u307E\u3063\u305F\u2026\u2026\u5B8C\u5168\u306A\u5E73\u7A4F\u306F\u307E\u3060\u8A2A\u308C\u3066\u3044\u306A\u3044\u3002";
    }
    this.result = {
      winner,
      winnerTitle,
      narrative,
      positiveWord: this.currentWordPair?.positive || "",
      negativeWord: this.currentWordPair?.negative || "",
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
      salvationGuess
    };
    this.addSystemMessage(`\u30B2\u30FC\u30E0\u304C\u7D42\u4E86\u3057\u307E\u3057\u305F\uFF01 \u7D50\u679C\uFF1A${winnerTitle}`);
  }
  resetForRematch() {
    this.phase = "lobby";
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.deck = [];
    this.firstDiscovererId = void 0;
    this.draftOrder = [];
    this.currentDraftIndex = 0;
    this.currentDraftStep = 1;
    this.carriedCard = void 0;
    this.sickroomCharacter = void 0;
    this.sickroomRole = void 0;
    this.currentWordPair = void 0;
    this.voteRecord = void 0;
    this.salvationThiefId = void 0;
    this.salvationGuess = void 0;
    this.salvationSuccess = void 0;
    this.result = void 0;
    this.removeBots();
    for (const [id, p] of this.players.entries()) {
      if (!p.isConnected && !p.isBot) {
        this.players.delete(id);
      }
    }
    this.ensureActiveHost();
    this.addSystemMessage("\u30EB\u30FC\u30E0\u304C\u30EA\u30BB\u30C3\u30C8\u3055\u308C\u307E\u3057\u305F\u3002\u518D\u6226\u306E\u6E96\u5099\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\uFF01");
  }
  addMessage(senderId, senderName, text) {
    const sender = this.players.get(senderId);
    let relation = void 0;
    if (sender && sender.characterId) {
      const char = CHARACTERS.find((c) => c.id === sender.characterId);
      if (char) relation = char.relation;
    }
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName,
      characterRelation: relation,
      text,
      timestamp: Date.now()
    };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 100) this.chatMessages.shift();
    return msg;
  }
  addSystemMessage(text) {
    const msg = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: "system",
      senderName: "\u57F7\u4E8B",
      text,
      timestamp: Date.now(),
      isSystem: true
    };
    this.chatMessages.push(msg);
    if (this.chatMessages.length > 100) this.chatMessages.shift();
    return msg;
  }
  // Get strictly sanitized public state
  getPublicState() {
    const publicPlayers = Array.from(this.players.values()).map(
      (p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isConnected: p.isConnected,
        isBot: p.isBot,
        characterId: p.characterId,
        isReadyNext: p.isReadyNext,
        hasVoted: p.hasVoted,
        draftOrder: p.draftOrder
      })
    );
    const currentDraftPlayerId = this.phase === "drafting" ? this.draftOrder[this.currentDraftIndex] : void 0;
    return {
      roomId: this.id,
      phase: this.phase,
      phaseStartTime: this.phaseStartTime,
      phaseDurationSeconds: this.phaseDurationSeconds,
      isExtended: this.isExtended,
      extensionSeconds: this.extensionSeconds,
      readyCount: Array.from(this.players.values()).filter((p) => p.isReadyNext).length,
      totalPlayers: this.players.size,
      players: publicPlayers,
      sickroomCharacter: this.sickroomCharacter,
      firstDiscovererId: this.firstDiscovererId,
      currentDraftPlayerId,
      currentDraftStep: this.currentDraftStep,
      hostPlayerId: this.getHost()?.id || "",
      includeProdigy: this.includeProdigy,
      voteRecord: this.voteRecord,
      salvation: this.phase === "salvation" ? {
        active: true,
        thiefPlayerId: this.salvationThiefId || "",
        secondsRemaining: this.salvationSecondsRemaining,
        guess: this.salvationGuess,
        isSuccess: this.salvationSuccess
      } : void 0,
      result: this.result
    };
  }
  // Get strictly personalized private state for this player only!
  getPrivateState(playerId) {
    const p = this.players.get(playerId);
    if (!p) return {};
    const privateData = {};
    if (p.role) {
      privateData.role = p.role;
    }
    if (p.passedCard) {
      privateData.passedCard = p.passedCard;
    }
    if (this.phase === "word_wolf" || this.phase === "final_discussion" || this.phase === "voting" || this.phase === "salvation" || this.phase === "result") {
      privateData.word = p.word;
      privateData.wordType = p.wordType;
    }
    if (p.role === "kitsune") {
      privateData.kitsuneDesignatedWord = p.kitsuneDesignatedWord;
      privateData.kitsuneDeclared = p.kitsuneDeclared;
    }
    if (this.phase === "drafting") {
      const activeDraftPlayerId = this.draftOrder[this.currentDraftIndex];
      if (activeDraftPlayerId === playerId && p.draftingCards) {
        privateData.draftingCards = p.draftingCards;
      }
    }
    if (this.phase === "salvation" && this.salvationThiefId === playerId) {
      privateData.salvationEligible = true;
    }
    return privateData;
  }
};

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.use(express.json({ limit: "50mb" }));
var charactersDir = path.resolve(__dirname, "public", "characters");
if (!fs.existsSync(charactersDir)) {
  fs.mkdirSync(charactersDir, { recursive: true });
}
var savedAvatarsJsonPath = path.resolve(__dirname, "server", "saved_avatars.json");
var memoryCustomAvatars = {};
function loadSavedAvatars() {
  try {
    if (fs.existsSync(savedAvatarsJsonPath)) {
      const content = fs.readFileSync(savedAvatarsJsonPath, "utf-8");
      const data = JSON.parse(content);
      if (data && typeof data === "object") {
        memoryCustomAvatars = data;
        const distCharsDir = path.resolve(__dirname, "dist", "characters");
        const hasDist = fs.existsSync(path.resolve(__dirname, "dist"));
        if (hasDist && !fs.existsSync(distCharsDir)) {
          fs.mkdirSync(distCharsDir, { recursive: true });
        }
        for (const [id, dataUrl] of Object.entries(memoryCustomAvatars)) {
          if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            const buf = Buffer.from(base64Data, "base64");
            fs.writeFileSync(path.join(charactersDir, `${id}.png`), buf);
            if (hasDist) {
              fs.writeFileSync(path.join(distCharsDir, `${id}.png`), buf);
            }
          }
        }
        console.log(`Loaded ${Object.keys(memoryCustomAvatars).length} avatars from saved_avatars.json`);
      }
    }
  } catch (err) {
    console.error("Error loading saved avatars:", err);
  }
}
loadSavedAvatars();
function persistAvatars(characters) {
  memoryCustomAvatars = { ...memoryCustomAvatars, ...characters };
  const distCharsDir = path.resolve(__dirname, "dist", "characters");
  const hasDist = fs.existsSync(path.resolve(__dirname, "dist"));
  if (hasDist && !fs.existsSync(distCharsDir)) {
    fs.mkdirSync(distCharsDir, { recursive: true });
  }
  const savedKeys = [];
  for (const [id, dataUrl] of Object.entries(characters)) {
    if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buf = Buffer.from(base64Data, "base64");
      fs.writeFileSync(path.join(charactersDir, `${id}.png`), buf);
      if (hasDist) {
        fs.writeFileSync(path.join(distCharsDir, `${id}.png`), buf);
      }
      savedKeys.push(id);
    }
  }
  try {
    const sDir = path.dirname(savedAvatarsJsonPath);
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir, { recursive: true });
    fs.writeFileSync(savedAvatarsJsonPath, JSON.stringify(memoryCustomAvatars));
  } catch (e) {
    console.error("Failed to write saved_avatars.json:", e);
  }
  io.emit("characters_updated", {
    timestamp: Date.now(),
    available: Object.keys(memoryCustomAvatars),
    characters: memoryCustomAvatars
  });
  return savedKeys;
}
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/characters", express.static(charactersDir));
var httpServer = createServer(app);
var io = new Server(httpServer, {
  cors: {
    origin: "*"
  },
  pingInterval: 25e3,
  pingTimeout: 45e3,
  connectTimeout: 45e3
});
var isSocketAlive = (socketId) => io.sockets.sockets.has(socketId);
var isProd = process.env.NODE_ENV === "production";
var PORT = Number(process.env.PORT) || 3e3;
var rooms = /* @__PURE__ */ new Map();
var UNIFIED_ROOM_ID = "MANSION";
function getOrCreateRoom(roomId = UNIFIED_ROOM_ID) {
  let room = rooms.get(UNIFIED_ROOM_ID);
  if (!room) {
    room = new GameRoom(UNIFIED_ROOM_ID);
    room.onStateChange = () => {
      broadcastRoomState(room);
    };
    rooms.set(UNIFIED_ROOM_ID, room);
  }
  return room;
}
function broadcastRoomState(room) {
  const publicState = room.getPublicState();
  io.to(`room_${room.id}`).emit("game_state", publicState);
  for (const player of room.players.values()) {
    if (player.isConnected && !player.isBot) {
      const privateState = room.getPrivateState(player.id);
      io.to(player.socketId).emit("private_state", privateState);
    }
  }
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", activeRooms: rooms.size });
});
app.get("/api/download-zip", (req, res) => {
  const zipPath = path.resolve(__dirname, "ichizoku-no-utage.zip");
  try {
    execSync("python3 scripts/create_zip.py", { cwd: __dirname });
    if (fs.existsSync(zipPath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="ichizoku-no-utage.zip"'
      );
      res.sendFile(zipPath);
    } else {
      res.status(500).send("ZIP file could not be generated.");
    }
  } catch (err) {
    console.error("Error generating zip:", err);
    res.status(500).send("Error generating zip");
  }
});
app.post("/api/upload-character-sheet", (req, res) => {
  try {
    const { characters } = req.body;
    if (!characters || typeof characters !== "object") {
      return res.status(400).json({ error: "Invalid characters object" });
    }
    const savedKeys = persistAvatars(characters);
    console.log(`Saved ${savedKeys.length} character images into ${charactersDir}`);
    res.json({ success: true, count: savedKeys.length, saved: savedKeys });
  } catch (err) {
    console.error("Error saving character sheet:", err);
    res.status(500).json({ error: "Failed to save character images" });
  }
});
app.get("/api/characters/all", (req, res) => {
  res.json({ characters: memoryCustomAvatars });
});
app.get("/api/characters/list", (req, res) => {
  try {
    if (!fs.existsSync(charactersDir)) {
      return res.json({ available: [] });
    }
    const files = fs.readdirSync(charactersDir);
    const available = files.filter((f) => f.endsWith(".png") || f.endsWith(".jpg")).map((f) => path.parse(f).name);
    res.json({ available });
  } catch (err) {
    res.status(500).json({ error: "Failed to list character images" });
  }
});
io.on("connection", (socket) => {
  let currentPlayerId = null;
  let currentRoomId = null;
  if (Object.keys(memoryCustomAvatars).length > 0) {
    socket.emit("characters_updated", {
      timestamp: Date.now(),
      available: Object.keys(memoryCustomAvatars),
      characters: memoryCustomAvatars
    });
  }
  socket.on("sync_avatars", (data) => {
    if (data?.characters && typeof data.characters === "object") {
      const keys = Object.keys(data.characters);
      if (keys.length > 0) {
        persistAvatars(data.characters);
        console.log(`Synced ${keys.length} avatars from client`);
      }
    }
  });
  socket.on("request_avatars", () => {
    socket.emit("characters_updated", {
      timestamp: Date.now(),
      available: Object.keys(memoryCustomAvatars),
      characters: memoryCustomAvatars
    });
  });
  socket.on(
    "join_room",
    (data) => {
      const { playerName, playerId } = data;
      const room = getOrCreateRoom(UNIFIED_ROOM_ID);
      if (room.phase === "lobby") {
        room.cleanDisconnectedInLobby(isSocketAlive);
      }
      let player = playerId ? room.getPlayer(playerId) : void 0;
      if (player) {
        player.socketId = socket.id;
        player.isConnected = true;
        if (playerName && !player.isBot) {
          player.name = playerName.trim() || player.name;
        }
        room.ensureActiveHost();
      } else {
        if (room.phase !== "lobby") {
          const hasConnectedHuman = Array.from(room.players.values()).some(
            (p) => p.isConnected && !p.isBot && isSocketAlive(p.socketId)
          );
          if (!hasConnectedHuman) {
            room.resetForRematch();
          } else {
            socket.emit("error_message", "\u30B2\u30FC\u30E0\u304C\u65E2\u306B\u9032\u884C\u4E2D\u306E\u305F\u3081\u53C2\u52A0\u3067\u304D\u307E\u305B\u3093");
            return;
          }
        }
        if (room.players.size >= 5) {
          const bots = Array.from(room.players.values()).filter((p) => p.isBot);
          if (bots.length > 0) {
            room.removePlayer(bots[bots.length - 1].id);
          } else {
            room.cleanDisconnectedInLobby(isSocketAlive);
            if (room.players.size >= 5) {
              socket.emit("error_message", "\u5B9A\u54E1\uFF085\u540D\uFF09\u306B\u9054\u3057\u3066\u3044\u307E\u3059");
              return;
            }
          }
        }
        const cleanName = (playerName || "\u5BA2\u4EBA").trim().substring(0, 12);
        player = room.addPlayer(cleanName, socket.id, false);
      }
      currentPlayerId = player.id;
      currentRoomId = room.id;
      socket.join(`room_${room.id}`);
      socket.emit("room_joined", {
        roomId: room.id,
        playerId: player.id,
        isHost: player.isHost
      });
      socket.emit("chat_history", room.chatMessages);
      broadcastRoomState(room);
    }
  );
  socket.on("reset_room", () => {
    const room = getOrCreateRoom(UNIFIED_ROOM_ID);
    room.resetForRematch();
    room.cleanDisconnectedInLobby(isSocketAlive);
    if (currentPlayerId) {
      const p = room.getPlayer(currentPlayerId);
      if (p) {
        for (const other of room.players.values()) other.isHost = false;
        p.isHost = true;
      }
    }
    room.ensureActiveHost();
    room.addSystemMessage("\u30B2\u30FC\u30E0\u304C\u30EA\u30BB\u30C3\u30C8\u3055\u308C\u3001\u521D\u671F\u30DE\u30C3\u30C1\u30F3\u30B0\u753B\u9762\u306B\u623B\u308A\u307E\u3057\u305F\u3002");
    broadcastRoomState(room);
  });
  socket.on("start_game", () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player) return;
    room.ensureActiveHost();
    if (!player.isHost) {
      const activeHost = Array.from(room.players.values()).find(
        (p) => p.isHost && p.isConnected && !p.isBot
      );
      if (!activeHost) {
        player.isHost = true;
      }
    }
    if (!player.isHost) return;
    if (room.players.size !== 5) {
      socket.emit("error_message", "5\u4EBA\u63C3\u3046\u307E\u3067\u30B2\u30FC\u30E0\u3092\u958B\u59CB\u3067\u304D\u307E\u305B\u3093");
      return;
    }
    if (room.startGame()) {
      broadcastRoomState(room);
    }
  });
  socket.on("fill_bots", () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player) return;
    room.cleanDisconnectedInLobby(isSocketAlive);
    if (room.phase === "lobby") {
      player.isHost = true;
      room.ensureActiveHost();
      room.fillWithBots();
      broadcastRoomState(room);
    }
  });
  socket.on("remove_bots", () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player) return;
    if (room.phase === "lobby") {
      room.removeBots();
      room.ensureActiveHost();
      broadcastRoomState(room);
    }
  });
  socket.on("kick_player", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.phase !== "lobby") return;
    if (data?.targetPlayerId) {
      room.removePlayer(data.targetPlayerId);
      room.cleanDisconnectedInLobby(isSocketAlive);
      broadcastRoomState(room);
    }
  });
  socket.on("set_role_config", (data) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.includeProdigy = !!data.includeProdigy;
    const msg = room.includeProdigy ? "\u3010\u5F79\u8077\u8A2D\u5B9A\u3011\u79C0\u624D\u3042\u308A\uFF08\u79C0\u624D1 / \u5B66\u751F3 / \u602A\u76D71 / \u5996\u72D01\uFF09\u306B\u8A2D\u5B9A\u3055\u308C\u307E\u3057\u305F\u3002" : "\u3010\u5F79\u8077\u8A2D\u5B9A\u3011\u79C0\u624D\u306A\u3057\uFF08\u5B66\u751F4 / \u602A\u76D71 / \u5996\u72D01\uFF09\u306B\u8A2D\u5B9A\u3055\u308C\u307E\u3057\u305F\u3002";
    room.addSystemMessage(msg);
    broadcastRoomState(room);
  });
  socket.on("proceed_to_draft", () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.proceedToDrafting();
    broadcastRoomState(room);
  });
  socket.on("draft_action", (data) => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const ok = room.handleDraftAction(currentPlayerId, data.chosenRole);
    if (ok) {
      broadcastRoomState(room);
    }
  });
  socket.on("toggle_ready", () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.toggleReady(currentPlayerId);
    broadcastRoomState(room);
  });
  socket.on("kitsune_declare", () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.toggleKitsuneDeclared(currentPlayerId);
    const privateState = room.getPrivateState(currentPlayerId);
    socket.emit("private_state", privateState);
  });
  socket.on(
    "submit_vote",
    (data) => {
      if (!currentRoomId || !currentPlayerId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;
      const ok = room.submitVote(
        currentPlayerId,
        data.thiefTarget,
        data.kitsuneTarget
      );
      if (ok) {
        broadcastRoomState(room);
      }
    }
  );
  socket.on("submit_salvation_guess", (data) => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const ok = room.submitSalvationGuess(currentPlayerId, data.guess);
    if (ok) {
      broadcastRoomState(room);
    }
  });
  socket.on("rematch", () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.resetForRematch();
    broadcastRoomState(room);
  });
  socket.on("send_chat", (data) => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player) return;
    const cleanText = (data.text || "").trim();
    if (!cleanText) return;
    const msg = room.addMessage(player.id, player.name, cleanText);
    io.to(`room_${room.id}`).emit("new_message", msg);
  });
  socket.on("disconnect", () => {
    if (currentRoomId && currentPlayerId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        const player = room.getPlayer(currentPlayerId);
        if (player) {
          player.isConnected = false;
          broadcastRoomState(room);
          const pId = currentPlayerId;
          setTimeout(() => {
            if (room.phase === "lobby") {
              const curP = room.getPlayer(pId);
              if (curP && !curP.isConnected && !curP.isBot) {
                room.removePlayer(pId);
                room.cleanDisconnectedInLobby(isSocketAlive);
                broadcastRoomState(room);
              }
            } else {
              room.ensureActiveHost();
              broadcastRoomState(room);
            }
          }, 15e3);
        }
      }
    }
  });
});
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "dist", "index.html"));
  });
}
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT} (prod=${isProd})`);
});
