import { useState } from 'react';
import { GameStatePublic } from '../types/game.ts';
import { ROLE_INFO, CHARACTERS } from '../data/characters.ts';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Users,
  Check,
  X,
  Bed,
  Flame,
  Shield,
  Award,
} from 'lucide-react';

interface ResultPhaseProps {
  gameState: GameStatePublic;
  currentUserId: string;
  onRematch: () => void;
}

export function ResultPhase({
  gameState,
  currentUserId,
  onRematch,
}: ResultPhaseProps) {
  const result = gameState.result;
  const voteRecord = gameState.voteRecord;

  if (!result) {
    return (
      <div className="text-center p-8 text-stone-400">
        結果を集計中……
      </div>
    );
  }

  const getWinnerBanner = () => {
    switch (result.winner) {
      case 'kitsune':
        return {
          bg: 'from-amber-950 via-stone-900 to-amber-950',
          border: 'border-amber-500',
          textColor: 'text-amber-200',
          badgeColor: 'bg-amber-500 text-stone-950',
          icon: '🦊',
        };
      case 'draw':
        return {
          bg: 'from-purple-950 via-stone-900 to-amber-950',
          border: 'border-purple-500',
          textColor: 'text-purple-200',
          badgeColor: 'bg-purple-600 text-purple-100',
          icon: '💨',
        };
      case 'family':
        return {
          bg: 'from-emerald-950 via-stone-900 to-blue-950',
          border: 'border-emerald-500',
          textColor: 'text-emerald-200',
          badgeColor: 'bg-emerald-600 text-emerald-100',
          icon: '🏰',
        };
      case 'phantom_thief':
        return {
          bg: 'from-purple-950 via-stone-900 to-purple-950',
          border: 'border-purple-600',
          textColor: 'text-purple-200',
          badgeColor: 'bg-purple-600 text-purple-100',
          icon: '🎭',
        };
      default:
        return {
          bg: 'from-stone-900 via-stone-900 to-stone-950',
          border: 'border-stone-700',
          textColor: 'text-stone-200',
          badgeColor: 'bg-stone-700 text-stone-200',
          icon: '⚖️',
        };
    }
  };

  const banner = getWinnerBanner();

  return (
    <div className="max-w-2xl mx-auto my-4 px-4 space-y-6 animate-fade-in pb-20">
      {/* Victory Announcement Card */}
      <div
        className={`bg-gradient-to-b ${banner.bg} border-2 ${banner.border} rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4`}
      >
        <div className="text-4xl mb-1">{banner.icon}</div>
        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-serif font-black tracking-widest uppercase ${banner.badgeColor}`}
        >
          {result.winnerTitle}
        </div>

        <p className="text-sm sm:text-base font-serif italic text-stone-200 leading-relaxed max-w-lg mx-auto">
          「{result.narrative}」
        </p>

        {/* Rematch Button in Top Card */}
        <div className="pt-2">
          <button
            onClick={onRematch}
            className="px-6 py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-black text-sm tracking-wider rounded-xl shadow-xl inline-flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>同じルームでもう一度遊ぶ（再戦）</span>
          </button>
        </div>
      </div>

      {/* Words Revelation */}
      <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2 pb-2 border-b border-stone-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>合言葉（ワードウルフ）の全貌</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-stone-950 rounded-xl border border-blue-900/60">
            <span className="text-[11px] text-blue-400 font-bold block mb-1">
              正のワード（一族側・3名）
            </span>
            <div className="text-xl font-serif font-black text-blue-200">
              {result.positiveWord}
            </div>
          </div>

          <div className="p-3 bg-stone-950 rounded-xl border border-purple-900/60">
            <span className="text-[11px] text-purple-400 font-bold block mb-1">
              誤のワード（怪盗側・2名）
            </span>
            <div className="text-xl font-serif font-black text-purple-200">
              {result.negativeWord}
            </div>
          </div>
        </div>

        {/* Kitsune designated word result */}
        <div className="p-3 bg-stone-950/80 rounded-xl border border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-stone-300">
              妖狐の指定ワード：
              <strong className="text-amber-300 font-bold ml-1">
                【{result.kitsuneDesignatedWord}】
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400">自己申告：</span>
            {result.kitsuneDeclared ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                言えた（成功）
              </span>
            ) : (
              <span className="flex items-center gap-1 text-stone-500">
                <X className="w-3.5 h-3.5" />
                未申告（不発）
              </span>
            )}
          </div>
        </div>

        {/* Phantom Thief Salvation result if occurred */}
        {result.salvationAttempted && (
          <div className="p-3 bg-stone-950/80 rounded-xl border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-purple-300">
              怪盗の救済回答：
              <strong className="text-stone-100 ml-1">
                「{result.salvationGuess || '無回答'}」
              </strong>
            </span>

            {result.salvationSuccess ? (
              <span className="flex items-center gap-1 text-purple-400 font-bold">
                <Check className="w-3.5 h-3.5" />
                救済成功（引き分け）
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 font-bold">
                <X className="w-3.5 h-3.5" />
                救済失敗（逮捕）
              </span>
            )}
          </div>
        )}
      </div>

      {/* Players and Sickroom True Roles Table */}
      <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2 pb-2 border-b border-stone-800">
          <Users className="w-4 h-4 text-amber-400" />
          <span>全員の役職・居場所・配布ワード一覧</span>
        </h3>

        <div className="space-y-2 text-xs">
          {gameState.players.map((p) => {
            const char = CHARACTERS.find((c) => c.id === p.characterId);
            const role = result.roles[p.id];
            const roleInfo = role ? ROLE_INFO[role] : null;
            const word = result.words[p.id];
            const isMe = p.id === currentUserId;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isMe
                    ? 'bg-amber-950/30 border-amber-600/50'
                    : 'bg-stone-950/70 border-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="font-serif font-bold text-stone-200">
                    {char?.relation}（📍{char?.location}）
                  </div>
                  <div className="text-stone-400 text-[11px]">
                    {p.name} {isMe && '（あなた）'}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {roleInfo && (
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${roleInfo.badgeColor}`}
                    >
                      {roleInfo.name}
                    </span>
                  )}
                  {word && (
                    <span className="px-2 py-0.5 bg-stone-900 border border-stone-700 rounded text-stone-200 font-mono text-[11px]">
                      ワード：{word}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Sickroom Person */}
          {gameState.sickroomCharacter && (
            <div className="p-3 rounded-xl border border-dashed border-stone-700 bg-stone-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-stone-500" />
                <span className="font-bold text-stone-400">
                  療養室：{gameState.sickroomCharacter.relation}（📍
                  {gameState.sickroomCharacter.location}）
                </span>
              </div>

              <div>
                {result.roles['sickroom'] && (
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${
                      ROLE_INFO[result.roles['sickroom']]?.badgeColor
                    }`}
                  >
                    療養室の役職：{ROLE_INFO[result.roles['sickroom']]?.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voting Breakdown */}
      {voteRecord && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="font-serif font-bold text-stone-300 text-sm pb-2 border-b border-stone-800 flex items-center justify-between">
            <span>投票と指名結果</span>
            <div className="flex items-center gap-2 text-xs font-normal">
              <span>怪盗指名：</span>
              <strong className="text-purple-300 font-bold">
                {voteRecord.thiefNominee
                  ? voteRecord.thiefNominee === 'sickroom'
                    ? '療養室'
                    : gameState.players.find((p) => p.id === voteRecord.thiefNominee)?.name
                  : 'なし（同票）'}
              </strong>
              <span className="ml-2">妖狐指名：</span>
              <strong className="text-amber-300 font-bold">
                {voteRecord.kitsuneNominee
                  ? voteRecord.kitsuneNominee === 'sickroom'
                    ? '療養室'
                    : gameState.players.find((p) => p.id === voteRecord.kitsuneNominee)?.name
                  : 'なし（同票）'}
              </strong>
            </div>
          </h3>

          <div className="space-y-1.5 text-xs">
            {gameState.players.map((p) => {
              const tv = voteRecord.thiefVotes[p.id];
              const kv = voteRecord.kitsuneVotes[p.id];

              const targetThiefName =
                tv === 'sickroom'
                  ? '療養室'
                  : gameState.players.find((pl) => pl.id === tv)?.name || tv;

              const targetKitsuneName =
                kv === 'sickroom'
                  ? '療養室'
                  : gameState.players.find((pl) => pl.id === kv)?.name || kv;

              return (
                <div
                  key={p.id}
                  className="p-2 rounded-lg bg-stone-950/50 border border-stone-800/80 flex items-center justify-between"
                >
                  <span className="font-medium text-stone-300">{p.name}：</span>
                  <div className="flex items-center gap-3 text-stone-400">
                    <span>
                      怪盗へ → <strong className="text-purple-300">{targetThiefName}</strong>
                    </span>
                    <span>
                      妖狐へ → <strong className="text-amber-300">{targetKitsuneName}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
