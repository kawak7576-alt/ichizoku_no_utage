import { useState, useEffect } from 'react';
import {
  GameStatePublic,
  PlayerPrivate,
  Role,
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
} from 'lucide-react';

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
        return '第一討論：一族の宴と祖父の回想';
      case 'word_wolf':
        return 'ワードウルフ：合言葉の化かし合い';
      case 'final_discussion':
        return '最終討論：怪盗と妖狐の告発前夜';
      default:
        return '討論フェーズ';
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-3 sm:my-6 px-4 space-y-4 sm:space-y-6 animate-fade-in pb-20">
      {/* Top Banner & Synchronized Timer */}
      <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 font-serif text-[11px] font-bold rounded">
                PHASE
              </span>
              {isExtensionActive && (
                <span className="px-2.5 py-0.5 bg-red-950/90 border border-red-600 text-red-400 text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1 shadow-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>延長中（2:00カウントダウン）</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-100 mt-1">
              {getPhaseTitle()}
            </h2>
          </div>

          {/* Large Countdown (赤文字でカウントダウン) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-black text-xl sm:text-2xl tracking-widest shadow-inner ${
                isExtensionActive
                  ? 'bg-red-950/90 border-2 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                  : secondsLeft <= 30
                  ? 'bg-amber-950/60 border-amber-600 text-amber-300 animate-pulse'
                  : 'bg-stone-950/80 border-stone-800 text-stone-100'
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

        {/* Ready to Advance Toggle */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <div className="text-xs text-stone-400 flex items-center gap-1.5">
            <span className="font-medium">全員が終了を押すと即時次に進みます：</span>
            <span className="font-mono text-amber-300 font-bold">
              {gameState.readyCount} / {gameState.totalPlayers}人
            </span>
          </div>

          <button
            onClick={onToggleReady}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-1.5 transition shadow-lg ${
              myPlayer?.isReadyNext
                ? 'bg-emerald-900/80 border border-emerald-600 text-emerald-200'
                : 'bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 active:scale-95'
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

      {/* Phase Specific Guidance Banner */}
      {isFirstDiscussion && (
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-stone-950/80 to-amber-950/40 border border-amber-900/50 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <MessageSquareQuote className="w-4 h-4 text-amber-400" />
            <span>祖父の助言：</span>
          </div>
          <p className="text-sm font-serif text-amber-100/90 italic leading-relaxed">
            「ワシについて話し合えば、なりすましがわかるやも知れん！」
          </p>
          <p className="text-xs text-stone-400 leading-relaxed">
            このフェーズではワードはまだ明かされません。各人の担当場所や屋敷での様子、祖父との思い出について自由に話し合ってみましょう。
          </p>
        </div>
      )}

      {isFinalDiscussion && (
        <div className="p-4 bg-purple-950/30 border border-purple-900/50 rounded-xl space-y-1.5 text-xs text-stone-300">
          <div className="font-serif font-bold text-purple-300 text-sm flex items-center gap-1.5">
            <span>🎭</span>
            <span>怪盗と妖狐の特定へ向けた最終推理</span>
          </div>
          <p className="leading-relaxed">
            これまでのワードウルフの違和感や発言を振り返り、怪盗（誤ワード）と妖狐（指定ワードを無理に入れた者）の候補を絞り込みましょう！
          </p>
        </div>
      )}

      {/* Secret Word & Role Card Area (Word Wolf & Final Discussion) */}
      {(isWordWolf || isFinalDiscussion) && (
        <div className="bg-stone-900/90 border border-amber-900/50 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              あなたの秘密のワード
            </span>
            <button
              onClick={() => setIsWordRevealed((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs transition"
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

          {/* Word display box */}
          <div
            onClick={() => setIsWordRevealed((prev) => !prev)}
            className="cursor-pointer p-6 rounded-xl border border-dashed border-amber-700/60 bg-stone-950 text-center transition-all hover:bg-stone-950/80 shadow-inner"
          >
            {isWordRevealed ? (
              <div className="space-y-1 animate-fade-in">
                <span className="text-xs text-amber-400/90 font-medium">
                  配布されたワード：
                </span>
                <div className="text-2xl sm:text-3xl font-serif font-black text-amber-200 tracking-wider">
                  {privateState.word || '配布中...'}
                </div>
                <p className="text-[11px] text-stone-500 pt-1">
                  ※あなたが正か誤かは役職の掟に依ります（タップで非表示）
                </p>
              </div>
            ) : (
              <div className="py-2 text-stone-500 text-xs flex flex-col items-center gap-1.5">
                <Eye className="w-5 h-5 text-amber-500/70" />
                <span>のぞき見防止中：ここをタップしてワードを確認</span>
              </div>
            )}
          </div>

          {/* Kitsune Secret Mission (Only for Kitsune) */}
          {isKitsune && (
            <div className="mt-4 p-4 rounded-xl border-2 border-amber-600/70 bg-gradient-to-br from-amber-950/60 to-stone-950 shadow-xl space-y-3">
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

              <div className="p-3 bg-stone-950/90 rounded-lg border border-amber-900/60 text-center">
                <span className="text-xs text-stone-400 block mb-0.5">
                  会話中に自然に発言すべき指定ワード：
                </span>
                <span className="text-xl font-serif font-black text-amber-300 tracking-wider">
                  【{privateState.kitsuneDesignatedWord || '???'}】
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                怪しまれずに会話の中にこの言葉を入れられたら、下のボタンを押してください（結果発表時に公開されます）。
              </p>

              {/* Toggle Declaration Button */}
              <button
                onClick={onKitsuneDeclare}
                className={`w-full py-2.5 rounded-xl text-xs font-serif font-bold tracking-wider flex items-center justify-center gap-2 transition ${
                  privateState.kitsuneDeclared
                    ? 'bg-amber-600 text-stone-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-800/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {privateState.kitsuneDeclared
                    ? '★ 指定ワードを言えた！（申告済み・解除可能）'
                    : '指定ワードを言えたらタップ（自己申告）'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Character & Role Summary */}
      <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900/50 border border-amber-600/40 flex items-center justify-center font-serif font-black text-amber-200 text-sm">
            {myChar?.relation.slice(0, 2) || '一族'}
          </div>
          <div>
            <div className="text-xs sm:text-sm font-serif font-bold text-stone-200">
              {myChar?.relation}（📍{myChar?.location}）
            </div>
            <div className="text-xs text-amber-400 font-medium">
              あなたの役職：【{myRole ? ROLE_INFO[myRole]?.name : '確認中'}】
            </div>
          </div>
        </div>

        <button
          onClick={onOpenRules}
          className="text-xs text-stone-400 hover:text-stone-200 p-2 rounded-lg bg-stone-900 border border-stone-800"
          title="掟と役職を確認"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Mansion Layout / Characters Accordion */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowMansionMap((prev) => !prev)}
          className="w-full px-4 py-3 bg-stone-950/60 flex items-center justify-between text-xs font-serif font-bold text-stone-300 hover:bg-stone-950 transition"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>屋敷の見取り図・一族の居場所</span>
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
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-lg border ${
                      isMe
                        ? 'bg-amber-950/30 border-amber-600/50'
                        : 'bg-stone-950/50 border-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200">
                        {char?.relation}（📍{char?.location}）
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {p.name} {isMe && '（自）'}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      {char?.description}
                    </div>
                  </div>
                );
              })}

              {/* Sickroom */}
              {gameState.sickroomCharacter && (
                <div className="p-2.5 rounded-lg border border-dashed border-stone-700 bg-stone-950/40 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-400">
                      療養室：{gameState.sickroomCharacter.relation}（📍
                      {gameState.sickroomCharacter.location}）
                    </span>
                    <span className="text-[10px] text-stone-500">
                      投票対象（会話には不参加）
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
