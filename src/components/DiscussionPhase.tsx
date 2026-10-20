import { useState, useEffect } from 'react';
import {
  GameStatePublic,
  PlayerPrivate,
} from '../types/game.ts';
import { ROLE_INFO, CHARACTERS } from '../data/characters.ts';
import {
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  HelpCircle,
  MessageSquareQuote,
  Flame,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar.tsx';
import { OrnateCorner } from './OrnateFrame.tsx';

interface DiscussionPhaseProps {
  gameState: GameStatePublic;
  privateState: PlayerPrivate;
  currentUserId: string;
  onToggleReady: () => void;
  onKitsuneDeclare: () => void;
  onOpenRules: () => void;
}

export function DiscussionPhase({
  gameState,
  privateState,
  currentUserId,
  onToggleReady,
  onKitsuneDeclare,
  onOpenRules,
}: DiscussionPhaseProps) {
  const [isWordRevealed, setIsWordRevealed] = useState(false);
  const [showMansionMap, setShowMansionMap] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const phase = gameState.phase;
  const isWordWolf = phase === 'word_wolf';
  const isFirstDiscussion = phase === 'first_discussion';
  const isFinalDiscussion = phase === 'final_discussion';

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  const myChar = CHARACTERS.find((c) => c.id === myPlayer?.characterId);
  const myRole = privateState.role;
  const isKitsune = myRole === 'kitsune';

  // Extension is active if server says so or if base duration has elapsed
  const elapsedSeconds = Math.floor((Date.now() - gameState.phaseStartTime) / 1000);
  const isExtensionActive =
    gameState.isExtended ||
    (!gameState.isExtended && elapsedSeconds >= gameState.phaseDurationSeconds);

  // Synchronized countdown timer based on server phaseStartTime and phaseDurationSeconds
  useEffect(() => {
    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - gameState.phaseStartTime) / 1000);

      if (gameState.isExtended) {
        // Extension mode: counts down from phaseDurationSeconds (120s = 2:00) down to 0:00
        const remaining = Math.max(0, gameState.phaseDurationSeconds - elapsed);
        setSecondsLeft(remaining);
      } else {
        if (elapsed >= gameState.phaseDurationSeconds) {
          // Base time 0:00 reached: smoothly start 2:00 countdown in red
          const extElapsed = elapsed - gameState.phaseDurationSeconds;
          const extRemaining = Math.max(0, 120 - extElapsed);
          setSecondsLeft(extRemaining);
        } else {
          const remaining = Math.max(0, gameState.phaseDurationSeconds - elapsed);
          setSecondsLeft(remaining);
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 200);
    return () => clearInterval(interval);
  }, [gameState.phaseStartTime, gameState.phaseDurationSeconds, gameState.isExtended]);

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseTitle = () => {
    switch (phase) {
      case 'first_discussion':
        return '第一討論：一族の集い';
      case 'word_wolf':
        return 'ワードウルフ：合言葉の化かし合い';
      case 'final_discussion':
        return '最終討論：怪盗と妖狐の告発前夜';
      default:
        return '討論フェーズ';
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-1.5 sm:my-3 px-2.5 sm:px-4 space-y-2 sm:space-y-3 animate-fade-in pb-12">
      {/* Top Banner & Synchronized Timer */}
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

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-stone-950 border border-amber-500/70 text-amber-300 font-serif text-[11px] font-bold rounded">
                PHASE
              </span>
              {isExtensionActive && (
                <span className="px-2.5 py-0.5 bg-red-950 border border-red-600 text-red-400 text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>延長中（2:00カウントダウン）</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-serif font-black tracking-wide text-amber-100 mt-1">
              {getPhaseTitle()}
            </h2>
          </div>

          {/* Large Countdown (0秒到達後、赤文字で2:00カウントダウン) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-black text-xl sm:text-2xl tracking-widest shadow-inner min-h-[48px] ${
                isExtensionActive
                  ? 'bg-red-950/90 border-2 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                  : secondsLeft <= 30
                  ? 'bg-amber-950/60 border-amber-600 text-amber-300 animate-pulse'
                  : 'bg-stone-950 border-stone-800 text-stone-100'
              }`}
            >
              <Clock
                className={`w-5 h-5 ${
                  isExtensionActive ? 'text-red-500' : 'text-amber-400'
                }`}
              />
              <span className={isExtensionActive ? 'text-red-500 font-black' : ''}>
                {formatTimer(secondsLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* 4-4: 参加者のキャラクターアイコン一覧表示 */}
        <div className="pt-3 pb-2 flex items-center justify-around sm:justify-center gap-2 sm:gap-4 overflow-x-auto">
          {gameState.players.map((p) => {
            const char = CHARACTERS.find((c) => c.id === p.characterId);
            const isMe = p.id === currentUserId;
            if (!char) return null;

            return (
              <div
                key={p.id}
                className={`flex flex-col items-center p-1 rounded-xl transition ${
                  isMe ? 'ring-1 ring-amber-500/80 bg-amber-950/20' : ''
                }`}
              >
                <CharacterAvatar
                  variant={char.id}
                  size="xs"
                  showNameplate={true}
                  nameplateText={char.relation}
                  isReady={p.isReadyNext}
                  isConnected={p.isConnected}
                />
              </div>
            );
          })}
        </div>

        {/* Ready to Advance Toggle */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-stone-800/80">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <span className="font-medium">全員が終了を押すと即時次に進みます：</span>
            <span className="font-mono text-amber-300 font-bold">
              {gameState.readyCount} / {gameState.totalPlayers}人
            </span>
          </div>

          <button
            onClick={onToggleReady}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg min-h-[44px] cursor-pointer ${
              myPlayer?.isReadyNext
                ? 'bg-emerald-950 border border-emerald-500 text-emerald-200'
                : 'bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 active:scale-95'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 ${
                myPlayer?.isReadyNext ? 'text-emerald-400' : 'text-stone-400'
              }`}
            />
            <span>
              {myPlayer?.isReadyNext
                ? '準備完了（待機中）'
                : '話し合い終了（次へ進む）'}
            </span>
          </button>
        </div>
      </div>

      {/* 最終討論：怪盗と妖狐の推理 */}
      {isFinalDiscussion && (
        <div className="dark-panel p-4 sm:p-5 border-purple-900/60 space-y-1.5 text-xs text-stone-300">
          <div className="font-serif font-bold text-purple-300 text-sm flex items-center gap-1.5">
            <span>🎭</span>
            <span>怪盗と妖狐の特定へ向けた最終推理</span>
          </div>
          <p className="leading-relaxed">
            これまでのワードウルフの違和感や発言を振り返り、怪盗（誤ワード）と妖狐（指定ワードを無理に入れた者）の候補を絞り込みましょう！
          </p>
        </div>
      )}

      {/* ワードウルフフェーズのみ：当主の言葉を表示 */}
      {isWordWolf && (
        <div className="dark-panel p-4 sm:p-5 flex items-start gap-3.5 border-amber-600/60 shadow-lg animate-fade-in">
          <CharacterAvatar
            variant="head"
            size="sm"
            showNameplate={true}
            nameplateText="当主"
          />
          <div className="space-y-1 flex-1">
            <div className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
              <MessageSquareQuote className="w-4 h-4 text-amber-400" />
              <span>当主の言葉：</span>
            </div>
            <p className="text-sm font-serif text-amber-100 italic leading-relaxed">
              「ワシについて話し合えば、なりすましがわかるやも知れん！」
            </p>
            <p className="text-xs text-stone-400 leading-relaxed pt-1">
              会話の中でワードを探り合い、怪しい発言や不自然な言動を見極めましょう。
            </p>
          </div>
        </div>
      )}

      {/* 4-5: ワードウルフ画面 (ワードウルフ & 最終討論) */}
      {(isWordWolf || isFinalDiscussion) && (
        <div className="dark-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="text-xs font-serif font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              あなたの秘密のワード
            </span>
            <button
              onClick={() => setIsWordRevealed((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg text-xs transition cursor-pointer min-h-[36px]"
            >
              {isWordRevealed ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                  <span>隠す</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>タップして表示</span>
                </>
              )}
            </button>
          </div>

          {/* Word display card (画面中央付近に大きく表示・のぞき見防止) */}
          <div
            onClick={() => setIsWordRevealed((prev) => !prev)}
            className="cursor-pointer p-6 rounded-2xl border-2 border-dashed border-amber-600/60 bg-stone-950 text-center transition-all hover:bg-stone-950/80 shadow-inner min-h-[110px] flex items-center justify-center"
          >
            {isWordRevealed ? (
              <div className="space-y-1 animate-fade-in">
                <span className="text-xs text-amber-400/90 font-serif font-medium">
                  配布されたワード：
                </span>
                <div className="text-2xl sm:text-3xl font-serif font-black text-amber-100 tracking-wider">
                  {privateState.word || '配布中...'}
                </div>
                <p className="text-[11px] text-stone-500 pt-1">
                  ※あなたが正か誤かは役職の掟に依ります（タップで非表示）
                </p>
              </div>
            ) : (
              <div className="py-2 text-stone-400 text-xs flex flex-col items-center gap-1.5 font-serif">
                <Eye className="w-6 h-6 text-amber-400/80 animate-pulse" />
                <span>のぞき見防止中：ここをタップしてワードを確認</span>
              </div>
            )}
          </div>

          {/* 妖狐の指定ワード & 自己申告ボタン */}
          {isKitsune && (
            <div className="p-4 rounded-xl border-2 border-amber-500/70 bg-gradient-to-br from-amber-950/60 via-stone-950 to-stone-950 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="font-serif font-bold text-amber-300 text-xs sm:text-sm">
                    妖狐の秘密指令：指定ワード
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500 text-stone-950 font-bold rounded-full">
                  妖狐本人限定
                </span>
              </div>

              <div className="p-3 bg-stone-950 rounded-lg border border-amber-700/60 text-center">
                <span className="text-xs text-stone-400 block mb-0.5 font-serif">
                  会話中に自然に発言すべき指定ワード：
                </span>
                <span className="text-xl font-serif font-black text-amber-300 tracking-wider">
                  【{privateState.kitsuneDesignatedWord || '???'}】
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed font-serif">
                怪しまれずに会話の中にこの言葉を入れられたら、下のボタンを押してください（結果発表時に公開されます）。
              </p>

              {/* Toggle Declaration Button */}
              <button
                onClick={onKitsuneDeclare}
                className={`w-full py-3.5 rounded-xl text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-2 transition min-h-[48px] cursor-pointer ${
                  privateState.kitsuneDeclared
                    ? 'bg-amber-600 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-700/80'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {privateState.kitsuneDeclared
                    ? '★ 指定ワードを言えた！（申告済み・タップで解除可能）'
                    : '指定ワードを言えたらタップ（自己申告）'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Character & Role Summary */}
      {myChar && (
        <div className="dark-panel p-3.5 sm:p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CharacterAvatar
                variant={myChar.id}
                size="sm"
                showNameplate={false}
              />
              <div className="truncate">
                <div className="text-xs sm:text-sm font-serif font-bold text-stone-200">
                  {myChar.relation}
                </div>
                <div className="text-xs text-amber-400 font-serif font-medium">
                  あなたの役職：【{myRole ? ROLE_INFO[myRole]?.name : '確認中'}】
                </div>
              </div>
            </div>

            <button
              onClick={onOpenRules}
              className="text-xs text-stone-400 hover:text-stone-200 p-2.5 rounded-xl bg-stone-950 border border-stone-800 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
              title="掟と役職を確認"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Show passedCard record during discussion */}
          {privateState.passedCard && (
            <div className="pt-2 border-t border-stone-800/80 text-[11px] text-stone-300 flex items-center gap-1.5 flex-wrap">
              <span className="text-amber-400 font-medium">✉️ あなたが配役時に渡した役職：</span>
              <span className="font-serif font-bold text-amber-200">
                【{privateState.passedCard.targetCharacterRelation}】（{privateState.passedCard.targetPlayerName}）
              </span>
              <span className="text-stone-400">へ</span>
              <span className="px-2 py-0.5 bg-stone-950 border border-amber-600/70 rounded font-serif font-bold text-amber-300 text-xs">
                【{ROLE_INFO[privateState.passedCard.role]?.name}】
              </span>
            </div>
          )}
        </div>
      )}

      {/* Participants Accordion */}
      <div className="dark-panel overflow-hidden">
        <button
          onClick={() => setShowMansionMap((prev) => !prev)}
          className="w-full px-4 py-3 bg-stone-950/70 flex items-center justify-between text-xs font-serif font-bold text-stone-300 hover:bg-stone-900 transition min-h-[44px]"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>一族の参加者一覧</span>
          </div>
          {showMansionMap ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {showMansionMap && (
          <div className="p-4 space-y-2 border-t border-stone-800 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gameState.players.map((p) => {
                const char = CHARACTERS.find((c) => c.id === p.characterId);
                const isMe = p.id === currentUserId;
                if (!char) return null;

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      isMe
                        ? 'bg-amber-950/30 border-amber-500/80'
                        : 'bg-stone-950/70 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CharacterAvatar
                        variant={char.id}
                        size="xs"
                        showNameplate={false}
                      />
                      <span className="font-serif font-bold text-stone-200">
                        {char.relation}
                      </span>
                      <span className="text-[10px] text-amber-400 font-medium">
                        📍 {char.location}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-serif">
                      {p.name} {isMe && '（自）'}
                    </span>
                  </div>
                );
              })}

              {/* Sickroom */}
              {gameState.sickroomCharacter && (
                <div className="p-2 sm:p-2.5 rounded-xl border border-stone-800 bg-stone-950/70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CharacterAvatar
                      variant={gameState.sickroomCharacter.id}
                      size="xs"
                      showNameplate={false}
                    />
                    <div className="truncate">
                      <span className="font-serif font-bold text-stone-200 mr-1.5">
                        {gameState.sickroomCharacter.relation}
                      </span>
                      <span className="text-[10px] text-amber-400 font-medium">
                        📍 療養室
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-stone-400 font-serif shrink-0">
                    ノンプレイヤー
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
