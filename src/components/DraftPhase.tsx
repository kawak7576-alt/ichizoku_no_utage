import { useState } from 'react';
import { GameStatePublic, PlayerPrivate, Role } from '../types/game.ts';
import { ROLE_INFO, CHARACTERS } from '../data/characters.ts';
import { Check, Send, Clock, AlertCircle } from 'lucide-react';
import { CharacterAvatar } from './CharacterAvatar.tsx';

interface DraftPhaseProps {
  gameState: GameStatePublic;
  privateState: PlayerPrivate;
  currentUserId: string;
  onDraftAction: (chosenRole: Role) => void;
}

export function DraftPhase({
  gameState,
  privateState,
  currentUserId,
  onDraftAction,
}: DraftPhaseProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const isMyTurn = gameState.currentDraftPlayerId === currentUserId;
  const activePlayer = gameState.players.find(
    (p) => p.id === gameState.currentDraftPlayerId
  );
  const activeChar = CHARACTERS.find((c) => c.id === activePlayer?.characterId);

  const myConfirmedRole = privateState.role;
  const availableCards = privateState.draftingCards || [];

  const handleConfirmChoice = () => {
    if (!selectedRole) return;
    onDraftAction(selectedRole);
    setSelectedRole(null);
  };

  const isFirstDiscoverer =
    gameState.firstDiscovererId === currentUserId &&
    gameState.currentDraftStep === 1;

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  const myOrder = myPlayer?.draftOrder || 1;
  const nextPlayer = gameState.players.find(
    (p) => p.draftOrder === (myOrder % 5) + 1
  );
  const nextChar = CHARACTERS.find((c) => c.id === nextPlayer?.characterId);
  const nextPlayerRelation = nextChar
    ? nextChar.relation
    : myOrder === 5
    ? '療養室'
    : '次のプレイヤー';
  const nextPlayerName = nextPlayer
    ? nextPlayer.name
    : myOrder === 5
    ? 'ノンプレイヤー'
    : '';

  const unselectedRole = selectedRole
    ? availableCards.find((r) => r !== selectedRole) ||
      (availableCards[0] === selectedRole ? availableCards[1] : availableCards[0])
    : null;

  return (
    <div className="max-w-2xl mx-auto my-1.5 sm:my-3 px-2.5 sm:px-4 space-y-2 sm:space-y-3 animate-fade-in pb-8">
      {/* Header Info Banner */}
      <div className="dark-panel p-2.5 sm:p-4 text-center">
        <div className="flex items-center justify-between pb-1 border-b border-stone-800/80">
          <span className="text-[10px] sm:text-xs font-serif font-bold text-amber-300 tracking-widest uppercase">
            役職カード配布
          </span>
          <span className="text-[10px] text-stone-400 font-serif">
            1枚を選んで次へ渡す
          </span>
        </div>
        <h2 className="text-sm sm:text-base font-serif font-black tracking-wider text-amber-100 gold-gradient-text mt-1">
          山札の儀とカードの受け渡し
        </h2>

        {/* Turn order indicator with Character Avatars */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 flex-wrap">
          {gameState.players
            .slice()
            .sort((a, b) => (a.draftOrder || 0) - (b.draftOrder || 0))
            .map((p, idx) => {
              const isCurrentTurn = p.id === gameState.currentDraftPlayerId;
              const isMe = p.id === currentUserId;
              const char = CHARACTERS.find((c) => c.id === p.characterId);
              if (!char) return null;

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl border transition ${
                    isCurrentTurn
                      ? 'bg-amber-950/50 border-amber-400 text-amber-200 font-bold scale-105 shadow-md animate-pulse'
                      : 'bg-stone-950/70 border-stone-800 text-stone-400'
                  }`}
                >
                  <CharacterAvatar
                    variant={char.id}
                    size="xs"
                    showNameplate={false}
                  />
                  <div className="text-left leading-tight">
                    <span className="text-[9px] text-stone-500 font-mono block">
                      {idx + 1}人目
                    </span>
                    <span className="text-[11px] font-serif">
                      {char.relation}
                      {isMe && <span className="text-amber-400 ml-0.5">（自）</span>}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Action Area */}
      {isMyTurn ? (
        <div className="dark-panel p-3 sm:p-5 border-amber-500/80 shadow-2xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div>
              <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] sm:text-xs font-bold rounded-full">
                あなたの手番
              </span>
              <h3 className="text-xs sm:text-sm font-serif font-black text-amber-100 mt-1">
                {isFirstDiscoverer
                  ? '【第一発見者】山札から2枚の役職カードを引きました'
                  : '手札から【自分の役職】を1枚選んでください'}
              </h3>
              <p className="text-[11px] text-amber-400/90 font-serif mt-0.5">
                1枚を自分の役職にし、残る1枚を【{myOrder === 1 ? '2番目のプレイヤー' : nextPlayerRelation}{nextPlayerName ? `（${nextPlayerName}）` : ''}】へ渡します。
              </p>
            </div>
            <Clock className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {/* Cards selection */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {availableCards.map((role, idx) => {
                const info = ROLE_INFO[role];
                const isSelected = selectedRole === role;

                return (
                  <div
                    key={`${role}_${idx}`}
                    onClick={() => setSelectedRole(role)}
                    className={`cursor-pointer p-2.5 sm:p-4 rounded-xl transition-all flex flex-col justify-between min-h-[120px] sm:min-h-[145px] ${
                      isSelected
                        ? 'gold-border-strong bg-amber-950/50 scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'gold-border bg-stone-950/80 hover:border-amber-500/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full border ${info.badgeColor}`}
                        >
                          {info.camp}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-0.5 text-[11px] text-amber-400 font-bold">
                            <Check className="w-3 h-3" />
                            選択中
                          </span>
                        )}
                      </div>

                      <div className="text-base sm:text-lg font-serif font-black text-amber-100 mb-0.5">
                        {info.name}
                      </div>
                      <p className="text-[10px] sm:text-xs text-stone-300 leading-tight">
                        {info.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-stone-800/80 text-[10px]">
                      {isSelected ? (
                        <span className="text-amber-300 font-serif font-bold">
                          ✓ 自分用にする
                        </span>
                      ) : (
                        <span className="text-stone-500">タップして選択</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected preview showing what you keep and what you pass */}
            {selectedRole && unselectedRole && (
              <div className="p-2.5 sm:p-3 bg-stone-950/90 rounded-xl border border-amber-600/60 text-xs text-left space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-serif font-bold text-amber-300">カード受け渡しの内訳：</span>
                  <span className="text-amber-400 font-mono text-[10px]">1枚保持 ⇄ 1枚引き渡し</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800">
                  <div className="p-2 bg-stone-900/60 rounded-lg border border-emerald-900/50">
                    <span className="text-[10px] text-emerald-400 block font-medium">自分の役職（秘密）：</span>
                    <span className="font-serif font-black text-emerald-200 text-sm">
                      【{ROLE_INFO[selectedRole]?.name}】
                    </span>
                  </div>
                  <div className="p-2 bg-stone-900/60 rounded-lg border border-amber-900/50">
                    <span className="text-[10px] text-amber-400 block font-medium">
                      {myOrder === 1 ? '2番目' : nextPlayerRelation}へ渡すカード：
                    </span>
                    <span className="font-serif font-black text-amber-300 text-sm">
                      【{ROLE_INFO[unselectedRole]?.name}】
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmChoice}
              disabled={!selectedRole}
              className={`w-full py-3 sm:py-3.5 rounded-xl font-serif font-black text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 transition min-h-[46px] ${
                selectedRole
                  ? 'gold-btn cursor-pointer'
                  : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {selectedRole && unselectedRole
                  ? `【${ROLE_INFO[selectedRole]?.name}】に決定し、【${ROLE_INFO[unselectedRole]?.name}】を${myOrder === 1 ? '2番目の人' : nextPlayerRelation}へ渡す`
                  : '役職カードを1枚選んでください'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* When waiting for another player's draft turn */
        <div className="dark-panel p-4 sm:p-6 text-center space-y-3.5">
          {activeChar ? (
            <CharacterAvatar
              variant={activeChar.id}
              size="lg"
              showNameplate={true}
              nameplateText={activeChar.relation}
              subText={activeChar?.location ? `📍 ${activeChar.location}` : ''}
            />
          ) : (
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-950 border border-amber-600/60 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
          )}

          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-amber-100">
              【{activeChar?.relation || activePlayer?.name}】が役職を選別中……
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5">
              秘密裏にカードの確認と選択を行っています。しばらくお待ちください。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto text-left pt-1">
            {/* Show what you chose already */}
            {myConfirmedRole && (
              <div className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl space-y-1">
                <span className="text-[10px] text-stone-500 block uppercase tracking-wider font-serif">
                  あなたの秘密の役職（決定済み）
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-amber-200 text-sm">
                    {ROLE_INFO[myConfirmedRole]?.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full border ${ROLE_INFO[myConfirmedRole]?.badgeColor}`}
                  >
                    {ROLE_INFO[myConfirmedRole]?.camp}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  {ROLE_INFO[myConfirmedRole]?.description}
                </p>
              </div>
            )}

            {/* Show what role you passed to the next player */}
            {privateState.passedCard && (
              <div className="p-3 bg-amber-950/30 border border-amber-600/70 rounded-xl space-y-1 shadow">
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-serif font-bold">
                  <Send className="w-3 h-3" />
                  <span>あなたが渡した役職の記録</span>
                </div>
                <div className="text-xs text-stone-200">
                  <span className="font-serif font-bold text-amber-200">
                    【{privateState.passedCard.targetCharacterRelation}】
                  </span>
                  <span className="text-[10px] text-stone-400 ml-0.5">
                    （{privateState.passedCard.targetPlayerName}）
                  </span>
                  <span className="text-stone-300"> へ：</span>
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 bg-stone-950 border border-amber-500/80 rounded font-serif font-bold text-amber-300 text-xs">
                      【{ROLE_INFO[privateState.passedCard.role]?.name}】
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-stone-400 pt-0.5">
                  ※あなただけの秘密情報です。
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
