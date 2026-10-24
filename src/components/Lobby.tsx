import React, { useState } from 'react';
import {
  Users,
  Play,
  Bot,
  Share2,
  Check,
  Sparkles,
  HelpCircle,
  Download,
  RotateCcw,
  Sliders,
  Hash,
  Shuffle,
  DoorOpen,
} from 'lucide-react';
import { GameStatePublic, PlayerPublic, RoomSummary } from '../types/game.ts';
import { SIBLING_CHARACTERS } from '../data/characters.ts';
import { CharacterAvatar } from './CharacterAvatar.tsx';
import { OrnateCorner } from './OrnateFrame.tsx';
import { PhantomThiefIcon } from './PhantomThiefIcon.tsx';
import { useCharacterAvatars } from '../hooks/useCharacterAvatars.ts';
import { RoomSelectModal } from './RoomSelectModal.tsx';

interface LobbyProps {
  gameState: GameStatePublic | null;
  currentUserId: string;
  isHost: boolean;
  roomId: string;
  roomsSummary?: RoomSummary[];
  onJoinRoom: (name: string, targetRoomId?: string) => void;
  onChangeRoom?: (newRoomId: string) => void;
  onStartGame: () => void;
  onFillBots: () => void;
  onRemoveBots: () => void;
  onKickPlayer?: (id: string) => void;
  onOpenRules: () => void;
  onOpenImageSheet?: () => void;
  onResetRoom?: () => void;
  onOpenRoleSettings?: () => void;
}

export function Lobby({
  gameState,
  currentUserId,
  isHost,
  roomId,
  roomsSummary = [],
  onJoinRoom,
  onChangeRoom,
  onStartGame,
  onFillBots,
  onRemoveBots,
  onKickPlayer,
  onOpenRules,
  onResetRoom,
  onOpenRoleSettings,
}: LobbyProps) {
  const { avatars } = useCharacterAvatars();
  const customThiefAvatar = avatars['phantom_thief'];

  const [inputName, setInputName] = useState(() => {
    return (
      sessionStorage.getItem('mansion_player_name') ||
      localStorage.getItem('mansion_player_name') ||
      '探偵'
    );
  });
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomId || '01');
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. If not yet joined to room (no current player id or not in players list)
  const isJoined =
    !!currentUserId &&
    !!gameState &&
    gameState.players.some((p) => p.id === currentUserId);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inputName.trim() || '探偵';
    sessionStorage.setItem('mansion_player_name', cleanName);
    localStorage.setItem('mansion_player_name', cleanName);
    onJoinRoom(cleanName, selectedRoomId);
  };

  const handleRandomRoom = () => {
    const rand = Math.floor(Math.random() * 10) + 1;
    const formatted = rand < 10 ? `0${rand}` : `${rand}`;
    setSelectedRoomId(formatted);
  };

  const allRooms = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

  // If user has not joined yet, show the Join Screen
  if (!isJoined || !gameState) {
    const activeRoomsWithPlayers = roomsSummary.filter((r) => r.playerCount > 0);

    return (
      <div className="max-w-md mx-auto my-auto px-3 sm:px-4 py-3 sm:py-6 animate-fade-in w-full">
        <div className="relative dark-panel p-5 sm:p-7 text-center overflow-hidden space-y-4 border-amber-600/70 shadow-2xl">
          {/* Ornate corners */}
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

          {/* Crest / Emblem: 怪盗のアイコン */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-purple-950 via-stone-950 to-amber-900 border-2 border-amber-500/60 flex items-center justify-center shadow-xl overflow-hidden">
            {customThiefAvatar ? (
              <img src={customThiefAvatar} alt="怪盗" className="w-full h-full object-cover" />
            ) : (
              <PhantomThiefIcon className="w-12 h-12 text-amber-300" />
            )}
          </div>

          {/* Central Grand Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-widest text-amber-100 gold-gradient-text">
              一族の宴
            </h2>
            <p className="text-xs text-amber-400/90 font-serif tracking-wider mt-1">
              ― 消えた家宝と怪盗と ―
            </p>
            <p className="text-xs text-stone-400 mt-2.5 leading-relaxed max-w-xs mx-auto font-serif">
              正体隠匿 × ワードウルフ推理ゲーム
              <br />
              一族の誰かに変装した怪盗、そして妖狐の化かし合いを見破れ。
            </p>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoinSubmit} className="space-y-4 pt-1">
            {/* 1. Name Input */}
            <div className="text-left space-y-1">
              <label className="block text-xs font-serif font-bold text-amber-300">
                あなたの名前
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                maxLength={12}
                placeholder="例: 名探偵アリス"
                className="w-full px-4 py-2.5 bg-stone-950 border border-amber-900/60 focus:border-amber-400 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none transition min-h-[44px]"
                required
              />
            </div>

            {/* 2. Room Selection Box (01 to 10, default 01) */}
            <div className="text-left p-3.5 rounded-xl bg-stone-950/80 border border-amber-800/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>部屋番号の選択（01〜10）</span>
                </label>
                <button
                  type="button"
                  onClick={handleRandomRoom}
                  className="text-[10px] text-amber-400/80 hover:text-amber-200 flex items-center gap-1 font-serif underline cursor-pointer"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>ランダム</span>
                </button>
              </div>

              {/* Number display / input */}
              <div className="flex items-center justify-between gap-2 bg-stone-900/90 p-2 rounded-lg border border-amber-600/40">
                <span className="text-xs text-stone-400 font-serif">選択中の部屋：</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-lg font-bold text-amber-400">#</span>
                  <input
                    type="text"
                    value={selectedRoomId}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length <= 2) {
                        setSelectedRoomId(val);
                      }
                    }}
                    onBlur={() => {
                      let num = parseInt(selectedRoomId, 10);
                      if (isNaN(num) || num < 1) num = 1;
                      if (num > 10) num = 10;
                      setSelectedRoomId(num < 10 ? `0${num}` : `${num}`);
                    }}
                    maxLength={2}
                    className="w-10 bg-stone-950 border border-amber-600/60 rounded text-center text-base font-mono font-black text-amber-200 focus:outline-none py-0.5"
                  />
                  <span className="text-[11px] text-stone-400 ml-1">号室</span>
                </div>
              </div>

              {/* Quick Select Buttons 01-10 */}
              <div className="space-y-1">
                <div className="text-[10px] text-stone-400 font-serif">
                  番号をタップして選択：
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {allRooms.map((r) => {
                    const summary = roomsSummary.find((s) => s.roomId === r);
                    const count = summary ? summary.playerCount : 0;
                    const isSelected = selectedRoomId === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRoomId(r)}
                        className={`py-1.5 px-1 rounded-lg font-mono text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-stone-950 border-amber-300 shadow font-black'
                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-600/60'
                        }`}
                      >
                        <span>#{r}</span>
                        <span
                          className={`text-[9px] ${
                            isSelected
                              ? 'text-stone-950'
                              : count > 0
                              ? 'text-amber-400 font-bold'
                              : 'text-stone-600'
                          }`}
                        >
                          {count > 0 ? `${count}人` : '空'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Rooms hint */}
              {activeRoomsWithPlayers.length > 0 && (
                <div className="pt-1 text-[11px] text-stone-400 flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-300/90 font-serif">👥 待機中の部屋:</span>
                  {activeRoomsWithPlayers.map((r) => (
                    <button
                      key={r.roomId}
                      type="button"
                      onClick={() => setSelectedRoomId(r.roomId)}
                      className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-600/60 text-amber-300 font-mono text-[10px] hover:border-amber-400 cursor-pointer"
                    >
                      #{r.roomId}（{r.playerCount}人）
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full gold-btn py-3.5 rounded-xl font-serif text-sm tracking-widest flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98] shadow-lg"
            >
              <DoorOpen className="w-4 h-4 stroke-[2.5]" />
              <span>部屋 #{selectedRoomId} に参加する</span>
            </button>
          </form>

          {/* Footer links */}
          <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <button
              onClick={onOpenRules}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 flex items-center gap-1 cursor-pointer"
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

  // 2. Waiting Room (Matching screen)
  const players = gameState.players;
  const isReadyToStart = players.length === 5;
  const hasBots = players.some((p) => p.isBot);

  const handleShare = async () => {
    const cleanUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    const shareTitle = `一族の宴 ― 消えた家宝と怪盗と ―【部屋 #${roomId}】`;
    const shareText = `5人オンライン対戦型・正体隠匿×ワードウルフ推理ゲーム【一族の宴】の部屋 #${roomId} へ招待されました！`;
    const fullCopy = `【${shareTitle}】\n${shareText}\n部屋番号: #${roomId}\n招待URL: ${cleanUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `${shareText}\n部屋番号: #${roomId}`,
          url: cleanUrl,
        });
      } else {
        await navigator.clipboard.writeText(fullCopy);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(fullCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-1.5 sm:my-4 px-2.5 sm:px-4 space-y-2.5 sm:space-y-4 animate-fade-in pb-4 sm:pb-8">
      {/* Room Selection Modal */}
      <RoomSelectModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        currentRoomId={roomId}
        roomsSummary={roomsSummary}
        onSelectRoom={(newRoomId) => {
          if (onChangeRoom) {
            onChangeRoom(newRoomId);
          } else {
            onJoinRoom(inputName, newRoomId);
          }
        }}
      />

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
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 bg-stone-950 border border-amber-500/70 text-amber-300 font-serif text-[10px] sm:text-[11px] font-bold rounded">
                マッチング待機中
              </span>
              <button
                type="button"
                onClick={() => setRoomModalOpen(true)}
                title="部屋番号を変更する"
                className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/60 text-amber-300 font-mono text-[11px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <span>部屋</span>
                <span className="text-amber-200 font-black">#{roomId}</span>
                <span className="text-[10px] text-amber-400/80 underline font-serif ml-0.5">変更</span>
              </button>
              <span className="text-[11px] sm:text-xs text-stone-400">5人固定の宴</span>
            </div>
            <h2 className="text-base sm:text-lg font-serif font-black tracking-wider text-amber-100 mt-0.5">
              屋敷の大広間
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 役職設定ボタン（招待URLの左側、四角の秀才マークなし） */}
            {onOpenRoleSettings && (
              <button
                onClick={onOpenRoleSettings}
                title="役職構成を設定（秀才あり / 秀才なし学生4人）"
                className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-950 hover:bg-stone-900 text-amber-200 text-xs font-serif font-bold rounded-xl border border-amber-600/70 transition active:scale-95 min-h-[38px] sm:min-h-[44px] cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>役職設定</span>
              </button>
            )}

            <button
              onClick={handleShare}
              title={`部屋 #${roomId} の招待URLを送信・コピー`}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-stone-950 hover:bg-stone-900 text-amber-300 text-xs font-serif font-bold rounded-xl border border-amber-600/70 transition active:scale-95 min-h-[38px] sm:min-h-[44px] cursor-pointer"
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
                      <div className="text-[9px] text-amber-400/80 mt-0.5 truncate flex items-center justify-center gap-0.5">
                        {player.isHost && <span title="ホスト">👑</span>}
                        <span>{isCurrent ? '（あなた）' : player.isBot ? 'Bot' : player.isConnected ? '着席済' : '切断'}</span>
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
          {/* Bot & Reset Toolbar */}
          <div className="p-1.5 sm:p-2.5 bg-stone-950/80 rounded-xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-1.5">
            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 flex-wrap">
              <span className="font-serif font-bold text-stone-300">
                1人プレイ・調整：
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-600/60 text-amber-300 font-mono text-[10px]">
                役職：{gameState.includeProdigy !== false ? '秀才あり' : '学生4人'}
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
                  title="部屋をリセットして全員退出・名前入力画面に戻る"
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
                ? 'gold-btn cursor-pointer shadow-lg'
                : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {isReadyToStart
                ? '宴を開始する（ゲーム開始）'
                : `5人揃うまで開始できません（現在 ${players.length}/5人・「Botで5人にする」で即開始可能）`}
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
