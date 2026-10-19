import React, { useState } from 'react';
import {
  Users,
  Crown,
  Play,
  Bot,
  UserPlus,
  Share2,
  Check,
  Sparkles,
  HelpCircle,
  Download,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { GameStatePublic, PlayerPublic } from '../types/game.ts';
import { CHARACTERS, SIBLING_CHARACTERS } from '../data/characters.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';
import { OrnateCorner, OrnateDivider } from './OrnateFrame.tsx';

interface LobbyProps {
  gameState: GameStatePublic | null;
  currentUserId: string;
  isHost: boolean;
  onJoinRoom: (name: string) => void;
  onStartGame: () => void;
  onFillBots: () => void;
  onRemoveBots: () => void;
  onKickPlayer?: (id: string) => void;
  onOpenRules: () => void;
  onOpenImageSheet?: () => void;
  onResetRoom?: () => void;
}

export function Lobby({
  gameState,
  currentUserId,
  isHost,
  onJoinRoom,
  onStartGame,
  onFillBots,
  onRemoveBots,
  onKickPlayer,
  onOpenRules,
  onOpenImageSheet,
  onResetRoom,
}: LobbyProps) {
  const [inputName, setInputName] = useState(() => {
    return sessionStorage.getItem('mansion_player_name') || '探偵';
  });
  const [copied, setCopied] = useState(false);

  // 4-1. Title Screen (when player has not joined yet or reloaded)
  if (!gameState) {
    const handleJoinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputName.trim()) return;
      onJoinRoom(inputName.trim());
    };

    const hasSavedId = !!sessionStorage.getItem('mansion_player_id');

    return (
      <div className="max-w-md mx-auto my-4 sm:my-8 px-4 py-4 animate-fade-in">
        <div className="relative dark-panel p-6 sm:p-8 text-center space-y-4 border-amber-600/70 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Inner hairline border */}
          <div className="absolute inset-[4px] rounded-xl border border-amber-500/25 pointer-events-none" />

          {/* 4 Victorian corner flourishes */}
          <div className="absolute top-1.5 left-1.5 pointer-events-none">
            <OrnateCorner position="top-left" className="w-5 h-5 text-amber-500/80" />
          </div>
          <div className="absolute top-1.5 right-1.5 pointer-events-none">
            <OrnateCorner position="top-right" className="w-5 h-5 text-amber-500/80" />
          </div>
          <div className="absolute bottom-1.5 left-1.5 pointer-events-none">
            <OrnateCorner position="bottom-left" className="w-5 h-5 text-amber-500/80" />
          </div>
          <div className="absolute bottom-1.5 right-1.5 pointer-events-none">
            <OrnateCorner position="bottom-right" className="w-5 h-5 text-amber-500/80" />
          </div>

          {/* Crest / Emblem */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-950 via-stone-950 to-amber-800 border-2 border-amber-500/60 flex items-center justify-center shadow-xl">
            <span className="text-4xl font-serif text-amber-200 font-black">宴</span>
          </div>

          {/* Central Grand Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-amber-100 gold-gradient-text">
              一族の宴
            </h2>
            <p className="text-xs text-amber-400/90 font-serif tracking-wider mt-1">
              ― 消えた家宝と怪盗と ―
            </p>
            <p className="text-xs text-stone-400 mt-3 leading-relaxed max-w-xs mx-auto">
              正体隠匿 × ワードウルフ推理ゲーム
              <br />
              一族の誰かに変装した怪盗、そして妖狐の化かし合いを見破れ。
            </p>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoinSubmit} className="space-y-4 pt-2">
            <div className="text-left">
              <label className="block text-xs font-serif font-bold text-amber-300 mb-1.5">
                あなたの名前
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                maxLength={12}
                placeholder="例: 名探偵アリス"
                className="w-full px-4 py-3 bg-stone-950 border border-amber-900/60 focus:border-amber-400 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition min-h-[48px]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full gold-btn py-3.5 rounded-xl font-serif text-sm tracking-widest flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
            >
              <span>{hasSavedId ? 'ゲームに参加・復帰する' : 'ゲームに参加する'}</span>
            </button>
          </form>

          {/* Image Sheet Action */}
          {onOpenImageSheet && (
            <button
              type="button"
              onClick={onOpenImageSheet}
              className="w-full py-2.5 px-3 rounded-xl border border-amber-600/70 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 text-xs font-serif font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>🖼️ キャラクター画像シート（image.png）を適用</span>
            </button>
          )}

          {/* Footer links */}
          <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <button
              onClick={onOpenRules}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              掟と役職一覧
            </button>
            <a
              href="/api/download-zip"
              download="ichizoku-no-utage.zip"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              コードZIP保存
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4-2. Matching & Waiting Screen
  const players = gameState.players;
  const isReadyToStart = players.length === 5;
  const hasBots = players.some((p) => p.isBot);
  const connectedHumans = players.filter((p) => p.isConnected && !p.isBot);
  const hasDisconnectedPlayers = players.some((p) => !p.isConnected);
  const effectiveHost = isHost || connectedHumans.length <= 1;

  const handleShare = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto my-1.5 sm:my-4 px-2.5 sm:px-4 space-y-2.5 sm:space-y-4 animate-fade-in pb-4 sm:pb-8">
      {/* Waiting Room Header Banner */}
      <div className="relative dark-panel p-3 sm:p-5 shadow-2xl overflow-hidden border-amber-600/60">
        <div className="absolute inset-[3px] rounded-xl border border-amber-500/20 pointer-events-none" />
        <div className="absolute top-1 left-1 pointer-events-none">
          <OrnateCorner position="top-left" className="w-5 h-5 text-amber-500/70" />
        </div>
        <div className="absolute top-1 right-1 pointer-events-none">
          <OrnateCorner position="top-right" className="w-5 h-5 text-amber-500/70" />
        </div>
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <OrnateCorner position="bottom-left" className="w-5 h-5 text-amber-500/70" />
        </div>
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <OrnateCorner position="bottom-right" className="w-5 h-5 text-amber-500/70" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-stone-800/80">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-stone-950 border border-amber-500/70 text-amber-300 font-serif text-[10px] sm:text-[11px] font-bold rounded">
                マッチング待機中
              </span>
              <span className="text-[11px] sm:text-xs text-stone-400">5人固定の宴</span>
            </div>
            <h2 className="text-base sm:text-lg font-serif font-black tracking-wider text-amber-100 mt-0.5">
              屋敷の大広間
            </h2>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-950 hover:bg-stone-900 text-amber-300 text-xs font-serif font-bold rounded-xl border border-amber-600/70 transition active:scale-95 min-h-[38px] sm:min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">コピー完了</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>招待URL</span>
              </>
            )}
          </button>
        </div>

        {/* 5-Seat Participant Cards with Character Avatars (Side-by-side on all screens) */}
        <div className="my-2.5 sm:my-4">
          <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-300/90 mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              集まりし一族の血脈：
            </span>
            <span className="font-mono text-amber-300 font-bold">
              {players.length} / 5人
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {[0, 1, 2, 3, 4].map((index) => {
              const player: PlayerPublic | undefined = players[index];
              const isCurrent = player?.id === currentUserId;
              const previewCharacter = SIBLING_CHARACTERS[index] || SIBLING_CHARACTERS[0];
              const canKick = player && !isCurrent && !!onKickPlayer;

              if (player) {
                return (
                  <div
                    key={player.id}
                    className={`p-1 sm:p-2 rounded-xl border transition flex flex-col items-center justify-center text-center relative ${
                      isCurrent
                        ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                        : 'bg-stone-950/80 border-stone-800'
                    }`}
                  >
                    {canKick && (
                      <button
                        onClick={() => onKickPlayer(player.id)}
                        title="この枠を空ける（退出させる）"
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-stone-900 border border-stone-700 hover:border-red-500 text-stone-400 hover:text-red-300 flex items-center justify-center text-[10px] cursor-pointer z-10"
                      >
                        ×
                      </button>
                    )}

                    <CharacterAvatar
                      variant={previewCharacter.id}
                      size="xs"
                      showNameplate={false}
                      isHost={player.isHost}
                      isConnected={player.isConnected}
                    />

                    {/* Player Name */}
                    <div className="mt-0.5 w-full">
                      <div className="font-serif font-bold text-stone-100 text-[10px] sm:text-xs truncate">
                        {player.name}
                      </div>
                      <div className="text-[9px] text-amber-400/80 mt-0.5 truncate">
                        {isCurrent ? '（あなた）' : player.isBot ? 'Bot' : player.isConnected ? '着席済' : '切断'}
                      </div>
                    </div>
                  </div>
                );
              }

              // Empty Seat Card
              return (
                <div
                  key={`empty_${index}`}
                  className="p-1 sm:p-2 rounded-xl border border-dashed border-stone-800 bg-stone-950/30 flex flex-col items-center justify-center text-center opacity-60 min-h-[64px] sm:min-h-[85px]"
                >
                  <CharacterAvatar
                    variant="unknown"
                    size="xs"
                    showNameplate={false}
                  />
                  <div className="mt-0.5 text-[9px] sm:text-[10px] text-stone-500 font-serif">
                    第{index + 1}席 空き
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Panel for Controls */}
        <div className="space-y-1.5 sm:space-y-2 pt-0.5 sm:pt-1">
          {/* Bot & Reset Toolbar (always available so user is never stuck) */}
          <div className="p-1.5 sm:p-2.5 bg-stone-950/80 rounded-xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-1.5">
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <span className="font-serif font-bold text-stone-300">
                1人プレイ・調整：
              </span>
              <span className="text-stone-500 hidden xs:inline">
                Botで枠を埋めてすぐ開始可能
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {!isReadyToStart && (
                <button
                  onClick={onFillBots}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-amber-600/60 hover:border-amber-500 text-amber-200 text-xs rounded-lg transition cursor-pointer min-h-[36px]"
                >
                  <Bot className="w-3.5 h-3.5 text-amber-400" />
                  <span>Botで5人にする</span>
                </button>
              )}
              {hasBots && (
                <button
                  onClick={onRemoveBots}
                  className="px-2 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 text-xs rounded-lg transition cursor-pointer min-h-[36px]"
                >
                  Bot解除
                </button>
              )}
              {onResetRoom && (
                <button
                  onClick={onResetRoom}
                  title="部屋の切断プレイヤーやBotをリセットして1人から再開"
                  className="px-2 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-amber-200 text-xs rounded-lg transition cursor-pointer min-h-[36px] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>部屋リセット</span>
                </button>
              )}
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={onStartGame}
            disabled={!isReadyToStart}
            className={`w-full py-2.5 sm:py-3.5 rounded-xl font-serif font-black text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 transition min-h-[42px] sm:min-h-[46px] ${
              isReadyToStart
                ? 'gold-btn cursor-pointer'
                : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {isReadyToStart
                ? '宴を開始する（ゲーム開始）'
                : '5人揃うまで開始できません（上の「Botで5人にする」で即開始可能）'}
            </span>
          </button>
        </div>
      </div>

      {/* Mansion Character Preview with 6 Sibling Avatars (No Head) */}
      <div className="relative dark-panel p-3 sm:p-4 border-amber-600/50 shadow-xl overflow-hidden">
        <div className="absolute inset-[3px] rounded-xl border border-amber-500/20 pointer-events-none" />
        <div className="absolute top-1 left-1 pointer-events-none">
          <OrnateCorner position="top-left" className="w-4 h-4 text-amber-500/60" />
        </div>
        <div className="absolute top-1 right-1 pointer-events-none">
          <OrnateCorner position="top-right" className="w-4 h-4 text-amber-500/60" />
        </div>
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <OrnateCorner position="bottom-left" className="w-4 h-4 text-amber-500/60" />
        </div>
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <OrnateCorner position="bottom-right" className="w-4 h-4 text-amber-500/60" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-1.5 mb-2">
          <h3 className="text-xs font-serif font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>屋敷の一族（６人の兄弟姉妹から5人が配役・１人は療養室へ）</span>
          </h3>
          {onOpenImageSheet && (
            <button
              onClick={onOpenImageSheet}
              className="text-[10px] sm:text-[11px] text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
            >
              <span>🖼️ 画像シート適用</span>
            </button>
          )}
        </div>
        <div className="relative z-10 grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
          {SIBLING_CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="p-1.5 sm:p-2 rounded-xl bg-stone-950/70 border border-stone-800 flex flex-col items-center text-center gap-1"
            >
              <CharacterAvatar
                variant={char.id}
                size="xs"
                showNameplate={false}
              />
              <div className="min-w-0 w-full">
                <div className="font-serif font-bold text-stone-200 text-[11px] sm:text-xs truncate">
                  {char.relation}
                </div>
                <div className="text-[9px] sm:text-[10px] text-amber-400 font-medium truncate">
                  📍 {char.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
