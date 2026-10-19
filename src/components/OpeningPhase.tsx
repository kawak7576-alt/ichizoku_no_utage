import { GameStatePublic } from '../types/game.ts';
import { CHARACTERS } from '../data/characters.ts';
import { Scroll, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar.tsx';
import { OrnateCorner } from './OrnateFrame.tsx';

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
    <div className="max-w-2xl mx-auto my-1.5 sm:my-3 px-2.5 sm:px-4 space-y-2 sm:space-y-3 animate-fade-in pb-4 sm:pb-8">
      {/* Title & Thief Challenge Banner */}
      <div className="relative dark-panel p-3 sm:p-4 text-center overflow-hidden space-y-2 border-amber-600/60 shadow-xl">
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

        <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-stone-800/80">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-950 border border-amber-600/70 rounded-full text-[10px] sm:text-xs text-amber-300 font-serif font-bold shadow">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>事件発生：消えた家宝</span>
          </div>
          <span className="text-[11px] text-stone-400 font-serif">当主の誕生日の宴</span>
        </div>

        {/* Phantom Thief Challenge with Thief Avatar */}
        <div className="relative z-10 p-2.5 sm:p-3 bg-stone-950/90 border border-purple-900/70 rounded-xl text-left shadow-inner flex items-start gap-2.5 sm:gap-3">
          <CharacterAvatar
            variant="phantom_thief"
            size="sm"
            showNameplate={false}
          />
          <div className="space-y-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-purple-300">
              <span>🎭</span>
              <span>怪盗からの挑戦状</span>
            </div>
            <p className="text-[11px] sm:text-xs font-serif italic text-purple-200/90 leading-relaxed">
              「今宵の家宝はボクが頂戴した。……フフ、慌てることはないよ。
              <strong className="text-amber-300 not-italic font-bold ml-1">
                ボクはキミたち一族の誰かに変装している、探し出してみなヨ。
              </strong>
              」
            </p>
          </div>
        </div>
      </div>

      {/* Your Assigned Character Display */}
      {myCharacter && (
        <div className="relative dark-panel p-3 sm:p-4 border-amber-500/70 shadow-xl overflow-hidden">
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

          <div className="relative z-10 flex items-center justify-between mb-2 pb-1.5 border-b border-stone-800">
            <span className="text-[11px] sm:text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              あなたの一族における続柄
            </span>
            <span className="text-[10px] text-amber-400 font-medium">
              📍 担当：{myCharacter.location}
            </span>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-left">
            <CharacterAvatar
              variant={myCharacter.id}
              size="md"
              showNameplate={false}
            />

            <div className="flex-1 min-w-0">
              <div className="text-sm sm:text-base font-serif font-black text-amber-100 flex items-center gap-2">
                <span>あなたは【{myCharacter.relation}】です</span>
                <span className="text-xs text-amber-400/90 font-medium font-sans">
                  （📍{myCharacter.location}）
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5 leading-tight">
                {myCharacter.description}
              </p>
              <div className="mt-1.5 text-[10px] text-stone-400 bg-stone-950/70 px-2 py-1 rounded border border-stone-800/80">
                ※この続柄は全員に公開されますが、この後の【役職カード】は秘密です。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All 6 Characters (5 players + 1 sickroom) in Uniform Style */}
      <div className="relative dark-panel p-3 sm:p-4 space-y-2 border-amber-600/50 shadow-xl overflow-hidden">
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

        <div className="relative z-10 flex items-center justify-between">
          <h3 className="text-xs font-serif font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span>今宵集まりし一族の続柄（全6名）</span>
          </h3>
          <span className="text-[10px] text-stone-400">5人参加＋1人療養室</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs">
          {gameState.players.map((p) => {
            const char = CHARACTERS.find((c) => c.id === p.characterId);
            const isMe = p.id === currentUserId;
            if (!char) return null;

            return (
              <div
                key={p.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                  isMe
                    ? 'bg-amber-950/30 border-amber-500/80 shadow'
                    : 'bg-stone-950/80 border-stone-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CharacterAvatar
                    variant={char.id}
                    size="xs"
                    showNameplate={false}
                  />
                  <div className="truncate">
                    <span className="font-serif font-bold text-stone-200 mr-1.5">
                      {char.relation}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      📍 {char.location}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-400 shrink-0 font-serif">
                  {p.name} {isMe && '（自）'}
                </div>
              </div>
            );
          })}

          {/* Sickroom Person - formatted identically to other 5 players */}
          {sickroomChar && (
            <div className="p-2 rounded-xl border border-stone-800 bg-stone-950/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CharacterAvatar
                  variant={sickroomChar.id}
                  size="xs"
                  showNameplate={false}
                />
                <div className="truncate">
                  <span className="font-serif font-bold text-stone-300 mr-1.5">
                    {sickroomChar.relation}
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">
                    📍 療養室
                  </span>
                </div>
              </div>
              <div className="text-[10px] sm:text-[11px] text-stone-400 shrink-0 font-serif">
                ノンプレイヤー
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-1 text-center">
        {isHost ? (
          <button
            onClick={onProceedToDraft}
            className="w-full gold-btn py-3 sm:py-3.5 rounded-xl font-serif text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 cursor-pointer transition min-h-[44px]"
          >
            <span>配役フェーズ（役職カードの配布）へ進む</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-stone-400 text-center animate-pulse font-serif">
            ホストが配役フェーズへ進めるのを待っています...
          </div>
        )}
      </div>
    </div>
  );
}
