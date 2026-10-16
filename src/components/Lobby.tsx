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
} from 'lucide-react';
import { GameStatePublic, PlayerPublic } from '../types/game.ts';
import { CHARACTERS } from '../data/characters.ts';

interface LobbyProps {
  gameState: GameStatePublic | null;
  currentUserId: string;
  isHost: boolean;
  onJoinRoom: (name: string) => void;
  onStartGame: () => void;
  onFillBots: () => void;
  onRemoveBots: () => void;
  onOpenRules: () => void;
}

export function Lobby({
  gameState,
  currentUserId,
  isHost,
  onJoinRoom,
  onStartGame,
  onFillBots,
  onRemoveBots,
  onOpenRules,
}: LobbyProps) {
  const [inputName, setInputName] = useState(() => {
    return sessionStorage.getItem('mansion_player_name') || '探偵';
  });
  const [copied, setCopied] = useState(false);

  // If not joined yet
  if (!gameState) {
    const handleJoinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputName.trim()) return;
      onJoinRoom(inputName.trim());
    };

    return (
      <div className="max-w-md mx-auto my-6 px-4 py-8 animate-fade-in">
        <div className="bg-stone-900/90 border border-amber-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Mansion Emblem */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-amber-900 via-stone-900 to-amber-700 border border-amber-500/50 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-serif text-amber-200">宴</span>
            </div>
            <h2 className="text-2xl font-serif font-black tracking-wider text-amber-100 mb-1">
              一族の宴
            </h2>
            <p className="text-xs text-amber-400/80 font-serif">
              ― 消えた家宝と変装者 ―
            </p>
            <p className="text-[12px] text-stone-400 mt-2 leading-relaxed">
              5人対戦型・正体隠匿 × ワードウルフ推理ゲーム
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                あなたの名前
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                maxLength={12}
                placeholder="例: 名探偵アリス"
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-black text-sm tracking-wider rounded-xl shadow-lg transition active:scale-[0.99] cursor-pointer"
            >
              屋敷に入る（マッチング開始）
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
            <button
              onClick={onOpenRules}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center justify-center gap-1 mx-auto sm:mx-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              ゲームのルール・役職一覧
            </button>

            <a
              href="/api/download-zip"
              download="ichizoku-no-utage.zip"
              className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-4 flex items-center justify-center gap-1 mx-auto sm:mx-0"
            >
              <Download className="w-3.5 h-3.5" />
              コード(ZIP)ダウンロード
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Already in room -> Lobby / Matching Waiting Room
  const players = gameState.players;
  const isReadyToStart = players.length === 5;
  const hasBots = players.some((p) => p.isBot);

  const handleShare = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto my-4 sm:my-8 px-4 space-y-6 animate-fade-in">
      {/* Lobby Card */}
      <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-950 border border-amber-800/80 text-amber-300 font-serif text-xs font-bold rounded">
                マッチング待機中
              </span>
              <span className="text-xs text-stone-400">一族の集い</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-100 mt-1">
              屋敷の大広間
            </h2>
          </div>

          <button
            onClick={handleShare}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium rounded-lg border border-stone-700 transition active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>招待URLをコピーしました！</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>招待URLをコピー</span>
              </>
            )}
          </button>
        </div>

        {/* Player slots (5 fixed) */}
        <div className="my-6">
          <div className="flex items-center justify-between text-xs font-medium text-stone-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              集まった一族（5人固定）：
            </span>
            <span className="font-mono text-amber-300 font-bold">
              {players.length} / 5人
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {[0, 1, 2, 3, 4].map((index) => {
              const player: PlayerPublic | undefined = players[index];
              const isCurrent = player?.id === currentUserId;

              if (player) {
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      isCurrent
                        ? 'bg-amber-950/40 border-amber-600/70'
                        : 'bg-stone-950/60 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          player.isBot
                            ? 'bg-stone-800 text-stone-400 border border-stone-700'
                            : 'bg-amber-800/80 text-amber-100 border border-amber-600/60'
                        }`}
                      >
                        {player.isBot ? <Bot className="w-4 h-4" /> : index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-100 text-sm">
                            {player.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-stone-950 font-bold rounded">
                              あなた
                            </span>
                          )}
                          {player.isHost && (
                            <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 rounded font-medium">
                              <Crown className="w-2.5 h-2.5" />
                              ホスト
                            </span>
                          )}
                          {player.isBot && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-stone-800 text-stone-400 rounded">
                              Bot
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] flex items-center gap-1 ${
                          player.isConnected ? 'text-emerald-400' : 'text-stone-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            player.isConnected ? 'bg-emerald-400' : 'bg-stone-600'
                          }`}
                        />
                        {player.isConnected ? '準備中' : '切断中'}
                      </span>
                    </div>
                  </div>
                );
              }

              // Empty slot
              return (
                <div
                  key={`empty_${index}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-dashed border-stone-800 bg-stone-950/20 text-stone-600 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-dashed border-stone-800 flex items-center justify-center font-mono">
                      {index + 1}
                    </div>
                    <span>参加者を待っています（招待URLを共有）...</span>
                  </div>
                  <UserPlus className="w-4 h-4 text-stone-700" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Host action panel */}
        {isHost ? (
          <div className="space-y-3 pt-2">
            {/* Solo Testing Tool (Bot toggle) */}
            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/90 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-stone-400">
                <span className="font-bold text-stone-300">ソロテスト・動作確認用：</span>
                <p className="text-[11px] text-stone-500">
                  1人でもすぐに5人揃えてプレイテストできます
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isReadyToStart && (
                  <button
                    onClick={onFillBots}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg border border-stone-600 transition cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-400" />
                    <span>Botで5人にする</span>
                  </button>
                )}
                {hasBots && (
                  <button
                    onClick={onRemoveBots}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs rounded-lg transition cursor-pointer"
                  >
                    Bot解除
                  </button>
                )}
              </div>
            </div>

            {/* Start Game Button */}
            <button
              onClick={onStartGame}
              disabled={!isReadyToStart}
              className={`w-full py-3.5 rounded-xl font-serif font-black text-sm tracking-wider flex items-center justify-center gap-2 transition shadow-xl ${
                isReadyToStart
                  ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 active:scale-[0.99] cursor-pointer'
                  : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {isReadyToStart
                  ? '宴を開始する（ゲーム開始）'
                  : '5人揃うまで開始できません'}
              </span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800 text-center">
            <p className="text-sm font-medium text-amber-300 animate-pulse">
              ホストのゲーム開始を待っています...
            </p>
            <p className="text-xs text-stone-500 mt-1">
              5人揃うとホストがゲームを開始できます
            </p>
          </div>
        )}
      </div>

      {/* Mansion Character Preview */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-4 sm:p-5">
        <h3 className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          屋敷に集いし6つの血脈（5人が配役され、1人は療養室へ）
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CHARACTERS.map((char) => (
            <div
              key={char.id}
              className="bg-stone-950/50 p-2.5 rounded-lg border border-stone-800/80 text-xs"
            >
              <div className="font-bold text-stone-200">{char.relation}</div>
              <div className="text-[11px] text-amber-400/90 font-medium">
                📍 {char.location}
              </div>
              <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">
                {char.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Export / Source Code Download Card */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-950 border border-stone-700 flex items-center justify-center text-emerald-400 shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-stone-200">GitHub移行用：ソースコードダウンロード</div>
            <div className="text-[11px] text-stone-400">
              README・設定ファイルを含むプロジェクト一式をZIP形式で保存
            </div>
          </div>
        </div>
        <a
          href="/api/download-zip"
          download="ichizoku-no-utage.zip"
          className="w-full sm:w-auto px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-200 font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ZIPを保存する</span>
        </a>
      </div>
    </div>
  );
}
