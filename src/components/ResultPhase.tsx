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
import { CharacterAvatar, AvatarVariant } from './CharacterAvatar.tsx';
import { OrnateCorner, OrnateDivider } from './OrnateFrame.tsx';

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
          bg: 'from-amber-950/90 via-stone-950/95 to-amber-950/90',
          border: 'border-amber-500/80',
          innerBorder: 'border-amber-500/30',
          textColor: 'text-amber-200',
          badgeColor: 'bg-amber-500 text-stone-950',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
          avatarVariant: 'kitsune' as AvatarVariant,
          campName: '妖狐陣営の単独完全勝利',
          symbol: '🦊',
        };
      case 'draw':
        return {
          bg: 'from-purple-950/90 via-stone-950/95 to-amber-950/90',
          border: 'border-purple-500/80',
          innerBorder: 'border-purple-500/30',
          textColor: 'text-purple-200',
          badgeColor: 'bg-purple-600 text-purple-100',
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
          avatarVariant: 'phantom_thief' as AvatarVariant,
          campName: '引き分け（怪盗の救済逃走）',
          symbol: '💨',
        };
      case 'family':
        return {
          bg: 'from-emerald-950/90 via-stone-950/95 to-amber-950/90',
          border: 'border-amber-500/90',
          innerBorder: 'border-amber-400/30',
          textColor: 'text-amber-200',
          badgeColor: 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white',
          glow: 'shadow-[0_0_30px_rgba(234,179,8,0.35)]',
          avatarVariant: 'eldest_son' as AvatarVariant, // 一族陣営の勝利：長男のアイコン！
          campName: '一族陣営の勝利（家宝奪還）',
          symbol: '🏰',
        };
      case 'phantom_thief':
        return {
          bg: 'from-purple-950/90 via-stone-950/95 to-stone-950/95',
          border: 'border-purple-500/90',
          innerBorder: 'border-purple-400/30',
          textColor: 'text-purple-200',
          badgeColor: 'bg-purple-600 text-purple-100',
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.35)]',
          avatarVariant: 'phantom_thief' as AvatarVariant, // 怪盗の勝利：怪盗のアイコン！
          campName: '怪盗の勝利（変装逃亡）',
          symbol: '🎭',
        };
      default:
        return {
          bg: 'from-stone-900/90 via-stone-950/95 to-stone-900/90',
          border: 'border-stone-700',
          innerBorder: 'border-stone-800',
          textColor: 'text-stone-200',
          badgeColor: 'bg-stone-700 text-stone-200',
          glow: 'shadow-lg',
          avatarVariant: 'eldest_son' as AvatarVariant,
          campName: '決着',
          symbol: '⚖️',
        };
    }
  };

  const banner = getWinnerBanner();

  return (
    <div className="max-w-2xl mx-auto my-2 sm:my-4 px-2.5 sm:px-4 space-y-3 sm:space-y-4 animate-fade-in pb-16">
      {/* Victory Announcement Card with Ornate Victorian Framing & Winner Avatar */}
      <div
        className={`relative bg-gradient-to-b ${banner.bg} border-2 ${banner.border} rounded-2xl p-4 sm:p-7 ${banner.glow} text-center space-y-3 overflow-hidden backdrop-blur-md`}
      >
        {/* Inner concentric hairline border */}
        <div
          className={`absolute inset-[4px] rounded-xl border pointer-events-none ${banner.innerBorder}`}
        />

        {/* 4 Victorian corner flourishes */}
        <div className="absolute top-1.5 left-1.5 pointer-events-none">
          <OrnateCorner position="top-left" className="w-6 h-6 text-amber-400/90" />
        </div>
        <div className="absolute top-1.5 right-1.5 pointer-events-none">
          <OrnateCorner position="top-right" className="w-6 h-6 text-amber-400/90" />
        </div>
        <div className="absolute bottom-1.5 left-1.5 pointer-events-none">
          <OrnateCorner position="bottom-left" className="w-6 h-6 text-amber-400/90" />
        </div>
        <div className="absolute bottom-1.5 right-1.5 pointer-events-none">
          <OrnateCorner position="bottom-right" className="w-6 h-6 text-amber-400/90" />
        </div>

        {/* Prominent Camp Winner Avatar */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-1">
          <div className="relative p-2 rounded-full border-2 border-amber-400/80 bg-stone-950/90 shadow-[0_0_24px_rgba(245,158,11,0.4)] animate-fade-in">
            <CharacterAvatar
              variant={banner.avatarVariant}
              size="lg"
              showNameplate={false}
            />
          </div>

          <div className="mt-2.5">
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-serif font-black tracking-widest uppercase shadow-md ${banner.badgeColor}`}
            >
              {banner.campName}
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-black tracking-wider text-amber-100 gold-gradient-text mt-1">
              {result.winnerTitle}
            </h2>
          </div>
        </div>

        {/* Ornate Flourish Divider */}
        <OrnateDivider symbol="❖" className="my-1.5" />

        <p className="relative z-10 text-xs sm:text-sm font-serif italic text-stone-200 leading-relaxed max-w-lg mx-auto">
          「{result.narrative}」
        </p>

        {/* Rematch Button in Top Card */}
        <div className="relative z-10 pt-1">
          <button
            onClick={onRematch}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-black text-xs sm:text-sm tracking-wider rounded-xl shadow-xl inline-flex items-center gap-2 transition active:scale-95 cursor-pointer min-h-[42px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>同じルームでもう一度遊ぶ（再戦）</span>
          </button>
        </div>
      </div>

      {/* Words Revelation */}
      <div className="relative bg-stone-950/90 border border-amber-600/50 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-2.5 backdrop-blur-md">
        <div className="absolute inset-[3px] rounded-xl border border-amber-500/20 pointer-events-none" />
        <div className="absolute top-1 left-1 pointer-events-none">
          <OrnateCorner position="top-left" className="w-4 h-4 text-amber-500/70" />
        </div>
        <div className="absolute top-1 right-1 pointer-events-none">
          <OrnateCorner position="top-right" className="w-4 h-4 text-amber-500/70" />
        </div>
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <OrnateCorner position="bottom-left" className="w-4 h-4 text-amber-500/70" />
        </div>
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <OrnateCorner position="bottom-right" className="w-4 h-4 text-amber-500/70" />
        </div>

        <h3 className="relative z-10 font-serif font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-2 pb-1.5 border-b border-stone-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>合言葉（ワードウルフ）の全貌</span>
        </h3>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
          <div className="p-2.5 bg-stone-950 rounded-xl border border-blue-900/60">
            <span className="text-[10px] text-blue-400 font-bold block mb-0.5">
              正のワード（一族側・3名）
            </span>
            <div className="text-lg sm:text-xl font-serif font-black text-blue-200">
              {result.positiveWord}
            </div>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-xl border border-purple-900/60">
            <span className="text-[10px] text-purple-400 font-bold block mb-0.5">
              誤のワード（怪盗側・2名）
            </span>
            <div className="text-lg sm:text-xl font-serif font-black text-purple-200">
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
      <div className="relative bg-stone-950/90 border border-amber-600/50 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-2.5 backdrop-blur-md">
        <div className="absolute inset-[3px] rounded-xl border border-amber-500/20 pointer-events-none" />
        <div className="absolute top-1 left-1 pointer-events-none">
          <OrnateCorner position="top-left" className="w-4 h-4 text-amber-500/70" />
        </div>
        <div className="absolute top-1 right-1 pointer-events-none">
          <OrnateCorner position="top-right" className="w-4 h-4 text-amber-500/70" />
        </div>
        <div className="absolute bottom-1 left-1 pointer-events-none">
          <OrnateCorner position="bottom-left" className="w-4 h-4 text-amber-500/70" />
        </div>
        <div className="absolute bottom-1 right-1 pointer-events-none">
          <OrnateCorner position="bottom-right" className="w-4 h-4 text-amber-500/70" />
        </div>

        <h3 className="relative z-10 font-serif font-bold text-amber-300 text-xs sm:text-sm flex items-center gap-2 pb-1.5 border-b border-stone-800">
          <Users className="w-4 h-4 text-amber-400" />
          <span>全員の役職・居場所・配布ワード一覧</span>
        </h3>

        <div className="relative z-10 space-y-2 text-xs">
          {gameState.players.map((p) => {
            const char = CHARACTERS.find((c) => c.id === p.characterId);
            const role = result.roles[p.id];
            const roleInfo = role ? ROLE_INFO[role] : null;
            const word = result.words[p.id];
            const isMe = p.id === currentUserId;

            return (
              <div
                key={p.id}
                className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isMe
                    ? 'bg-amber-950/30 border-amber-600/60 shadow-sm'
                    : 'bg-stone-950/80 border-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {char && (
                    <CharacterAvatar
                      variant={char.id}
                      size="xs"
                      showNameplate={false}
                    />
                  )}
                  <div>
                    <div className="font-serif font-bold text-stone-200">
                      {char?.relation}（📍{char?.location}）
                    </div>
                    <div className="text-stone-400 text-[10px] sm:text-[11px]">
                      {p.name} {isMe && '（あなた）'}
                    </div>
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
            <div className="p-2.5 sm:p-3 rounded-xl border border-stone-800 bg-stone-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <CharacterAvatar
                  variant={gameState.sickroomCharacter.id}
                  size="xs"
                  showNameplate={false}
                />
                <div>
                  <div className="font-serif font-bold text-stone-200">
                    {gameState.sickroomCharacter.relation}（📍療養室）
                  </div>
                  <div className="text-stone-400 text-[10px] sm:text-[11px]">
                    ノンプレイヤー
                  </div>
                </div>
              </div>

              <div>
                {result.roles['sickroom'] && (
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${
                      ROLE_INFO[result.roles['sickroom']]?.badgeColor
                    }`}
                  >
                    役職：{ROLE_INFO[result.roles['sickroom']]?.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voting Breakdown */}
      {voteRecord && (
        <div className="relative bg-stone-950/90 border border-amber-600/50 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-2.5 backdrop-blur-md">
          <div className="absolute inset-[3px] rounded-xl border border-amber-500/20 pointer-events-none" />
          <div className="absolute top-1 left-1 pointer-events-none">
            <OrnateCorner position="top-left" className="w-4 h-4 text-amber-500/70" />
          </div>
          <div className="absolute top-1 right-1 pointer-events-none">
            <OrnateCorner position="top-right" className="w-4 h-4 text-amber-500/70" />
          </div>
          <div className="absolute bottom-1 left-1 pointer-events-none">
            <OrnateCorner position="bottom-left" className="w-4 h-4 text-amber-500/70" />
          </div>
          <div className="absolute bottom-1 right-1 pointer-events-none">
            <OrnateCorner position="bottom-right" className="w-4 h-4 text-amber-500/70" />
          </div>

          <h3 className="relative z-10 font-serif font-bold text-stone-200 text-xs sm:text-sm pb-1.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-1">
            <span className="text-amber-300">投票と指名結果</span>
            <div className="flex items-center gap-2 text-[11px] font-normal">
              <span>怪盗指名：</span>
              <strong className="text-purple-300 font-bold">
                {voteRecord.thiefNominee
                  ? voteRecord.thiefNominee === 'sickroom'
                    ? '療養室'
                    : gameState.players.find((p) => p.id === voteRecord.thiefNominee)?.name
                  : 'なし（同票）'}
              </strong>
              <span className="ml-1">妖狐指名：</span>
              <strong className="text-amber-300 font-bold">
                {voteRecord.kitsuneNominee
                  ? voteRecord.kitsuneNominee === 'sickroom'
                    ? '療養室'
                    : gameState.players.find((p) => p.id === voteRecord.kitsuneNominee)?.name
                  : 'なし（同票）'}
              </strong>
            </div>
          </h3>

          <div className="relative z-10 space-y-1.5 text-xs">
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
                  className="p-1.5 sm:p-2 rounded-lg bg-stone-950/70 border border-stone-800 flex items-center justify-between text-[11px]"
                >
                  <span className="font-medium text-stone-300">{p.name}：</span>
                  <div className="flex items-center gap-2 sm:gap-3 text-stone-400">
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
