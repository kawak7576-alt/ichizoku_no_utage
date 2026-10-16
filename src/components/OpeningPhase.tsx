import { useState } from 'react';
import { GameStatePublic } from '../types/game.ts';
import { CHARACTERS } from '../data/characters.ts';
import { Scroll, ShieldAlert, ArrowRight, UserCheck, Bed, MessageSquareQuote } from 'lucide-react';

interface OpeningPhaseProps {
  gameState: GameStatePublic;
  currentUserId: string;
  isHost: boolean;
  onProceedToDraft: () => void;
}

export function OpeningPhase({
  gameState,
  currentUserId,
  isHost,
  onProceedToDraft,
}: OpeningPhaseProps) {
  const currentPlayer = gameState.players.find((p) => p.id === currentUserId);
  const myCharacter = CHARACTERS.find((c) => c.id === currentPlayer?.characterId);
  const sickroomChar = gameState.sickroomCharacter;

  return (
    <div className="max-w-2xl mx-auto my-4 px-4 space-y-6 animate-fade-in pb-16">
      {/* Dramatic Title Banner */}
      <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-700/60 rounded-full text-xs text-amber-300 font-medium mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>事件発生：消えた家宝</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-amber-100 mb-2">
          祖父の誕生日の宴にて
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl mx-auto font-serif">
          月明かりが差し込む豪壮な屋敷。一族が祝宴に酔いしれる最中、
          代々受け継がれてきた大切な家宝が忽然と姿を消した――。
        </p>

        {/* Phantom Thief Letter */}
        <div className="mt-6 p-4 sm:p-5 bg-stone-950/90 border border-purple-900/60 rounded-xl text-left relative shadow-inner">
          <div className="flex items-center gap-2 text-xs font-serif font-bold text-purple-300 mb-2">
            <span>🎭</span>
            <span>怪盗からの予告状</span>
          </div>
          <p className="text-xs sm:text-sm font-serif italic text-purple-200/90 leading-relaxed">
            「今宵の家宝はボクが頂戴した。……フフ、慌てることはないよ。
            <strong className="text-amber-300 not-italic font-bold">
              ボクはキミたち一族の誰かに変装している、探し出してみなヨ。
            </strong>
            」
          </p>
        </div>

        {/* Grandfather's Hint */}
        <div className="mt-3 p-3.5 bg-stone-950/90 border border-amber-900/60 rounded-xl text-left flex items-start gap-3">
          <MessageSquareQuote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 font-serif leading-relaxed">
            <span className="font-bold text-amber-300 block mb-0.5">祖父の言葉：</span>
            「ワシについて話し合えば、なりすましがわかるやも知れん！」
          </div>
        </div>
      </div>

      {/* Your Assigned Character */}
      {myCharacter && (
        <div className="bg-gradient-to-r from-amber-950/60 via-stone-900/80 to-amber-950/60 border border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-amber-400" />
              あなたの一族における正体（続柄と場所）
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-amber-900/50 text-amber-200 border border-amber-700/50 rounded">
              担当場所：{myCharacter.location}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-800 to-stone-950 border border-amber-500/60 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-xl font-serif font-black text-amber-200">
                {myCharacter.relation.slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="text-base sm:text-lg font-serif font-bold text-stone-100">
                あなたは【{myCharacter.relation}】です
              </div>
              <div className="text-xs text-amber-300/90 font-medium mt-0.5">
                担当場所：{myCharacter.location}
              </div>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {myCharacter.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Characters & Sickroom */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold text-stone-300 tracking-wider flex items-center gap-1.5">
          <Scroll className="w-4 h-4 text-amber-400" />
          今宵集まりし一族と屋敷の配置
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {gameState.players.map((p) => {
            const char = CHARACTERS.find((c) => c.id === p.characterId);
            const isMe = p.id === currentUserId;
            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  isMe
                    ? 'bg-amber-950/40 border-amber-600/70'
                    : 'bg-stone-950/60 border-stone-800'
                }`}
              >
                <div>
                  <span className="font-bold text-stone-200 mr-2">
                    {char?.relation || '一族'}
                  </span>
                  <span className="text-amber-400/90 text-[11px]">
                    📍 {char?.location}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400">
                  {p.name} {isMe && '（あなた）'}
                </div>
              </div>
            );
          })}

          {/* Sickroom Person */}
          {sickroomChar && (
            <div className="p-2.5 rounded-lg border border-dashed border-stone-700 bg-stone-950/40 flex items-center justify-between sm:col-span-2">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-stone-500" />
                <span className="font-bold text-stone-400">
                  療養室：{sickroomChar.relation}（{sickroomChar.location}）
                </span>
              </div>
              <span className="text-[11px] text-stone-500">
                病床で寝込んでいる（投票対象）
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 text-center">
        {isHost ? (
          <button
            onClick={onProceedToDraft}
            className="w-full py-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-black text-sm tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
          >
            <span>配役フェーズ（役職カードの配布）へ進む</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl text-xs text-stone-400 text-center animate-pulse">
            ホストが配役フェーズへ進めるのを待っています...
          </div>
        )}
      </div>
    </div>
  );
}
