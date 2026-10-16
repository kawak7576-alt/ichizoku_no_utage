import { useState } from 'react';
import { GameStatePublic, PlayerPrivate, Role } from '../types/game.ts';
import { ROLE_INFO, CHARACTERS } from '../data/characters.ts';
import { Check, Shield, Sparkles, Send, Clock, AlertCircle } from 'lucide-react';

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

  const myPlayer = gameState.players.find((p) => p.id === currentUserId);
  const myChar = CHARACTERS.find((c) => c.id === myPlayer?.characterId);
  const myConfirmedRole = privateState.role;

  // The cards available to choose from right now (for active player)
  const availableCards = privateState.draftingCards || [];

  const handleConfirmChoice = () => {
    if (!selectedRole) return;
    onDraftAction(selectedRole);
    setSelectedRole(null);
  };

  const handleFirstPlayerPass = () => {
    if (myConfirmedRole) {
      onDraftAction(myConfirmedRole);
    }
  };

  const isFirstDiscoverer =
    gameState.firstDiscovererId === currentUserId &&
    gameState.currentDraftStep === 1;

  return (
    <div className="max-w-2xl mx-auto my-4 px-4 space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="text-center bg-stone-900/80 border border-amber-900/40 rounded-2xl p-5 shadow-xl">
        <span className="text-xs font-serif font-bold text-amber-400/90 tracking-widest uppercase">
          役職の密約・カード配布手順
        </span>
        <h2 className="text-xl font-serif font-bold text-stone-100 mt-1">
          山札の儀とカードの受け渡し
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          第一発見者から順に山札を引き、1枚を自分の役職に選び、もう1枚を次の者へ渡します。
        </p>

        {/* Turn order indicator */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 flex-wrap">
          {gameState.players
            .slice()
            .sort((a, b) => (a.draftOrder || 0) - (b.draftOrder || 0))
            .map((p, idx) => {
              const isCurrentTurn = p.id === gameState.currentDraftPlayerId;
              const isMe = p.id === currentUserId;
              const char = CHARACTERS.find((c) => c.id === p.characterId);

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition ${
                    isCurrentTurn
                      ? 'bg-amber-900/60 border-amber-500 text-amber-200 font-bold scale-105 shadow-md animate-pulse'
                      : 'bg-stone-950/40 border-stone-800 text-stone-400'
                  }`}
                >
                  <span className="font-mono text-[10px] text-stone-500">
                    {idx + 1}.
                  </span>
                  <span>{char?.relation || p.name}</span>
                  {isMe && <span className="text-[9px] text-amber-400">（自）</span>}
                </div>
              );
            })}
        </div>
      </div>

      {/* Main Action Area */}
      {isMyTurn ? (
        <div className="bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-950 border-2 border-amber-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-xs font-bold rounded">
                あなたの手番
              </span>
              <h3 className="text-base font-serif font-bold text-stone-100 mt-1">
                {isFirstDiscoverer
                  ? '【第一発見者】山札から役職を引きました'
                  : '手札から【自分の役職】を1枚選んでください'}
              </h3>
            </div>
            <Clock className="w-5 h-5 text-amber-400 animate-spin-slow" />
          </div>

          {/* First discoverer special step */}
          {isFirstDiscoverer ? (
            <div className="space-y-4">
              <div className="p-4 bg-stone-950/80 rounded-xl border border-stone-800 text-center">
                <p className="text-xs text-stone-400 mb-2">
                  あなたは第一発見者です。山札から引いたあなたの役職カードは：
                </p>

                {myConfirmedRole && (
                  <div className="inline-block p-4 bg-amber-950/40 border-2 border-amber-500 rounded-xl shadow-lg">
                    <span className="text-2xl font-serif font-black text-amber-200 block">
                      {ROLE_INFO[myConfirmedRole]?.name}
                    </span>
                    <span className="text-xs text-amber-400/90 font-medium">
                      陣営：{ROLE_INFO[myConfirmedRole]?.camp}
                    </span>
                    <p className="text-xs text-stone-300 mt-2 max-w-sm">
                      {ROLE_INFO[myConfirmedRole]?.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs text-amber-300/90 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  山札からさらに1枚を引き、次のプレイヤーに渡します。何が渡るかはあなただけが確認できます。
                </span>
              </div>

              <button
                onClick={handleFirstPlayerPass}
                className="w-full py-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 font-serif font-black text-sm tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>もう1枚引いて次のプレイヤーへ渡す</span>
              </button>
            </div>
          ) : (
            /* Steps for Player 2, 3, 4, 5 */
            <div className="space-y-4">
              <p className="text-xs text-stone-300 leading-relaxed">
                前のプレイヤーから受け取ったカードと、山札から引いたカードの2枚です。
                <br />
                <strong className="text-amber-300">
                  1枚を自分の役職に選び、選ばなかったもう1枚を次のプレイヤー（最後の人は療養室）へ渡します。
                </strong>
              </p>

              {/* Cards selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableCards.map((role, idx) => {
                  const info = ROLE_INFO[role];
                  const isSelected = selectedRole === role;

                  return (
                    <div
                      key={`${role}_${idx}`}
                      onClick={() => setSelectedRole(role)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)] scale-[1.02]'
                          : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full border ${info.badgeColor}`}
                          >
                            {info.camp}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                              <Check className="w-3.5 h-3.5" />
                              選択中
                            </span>
                          )}
                        </div>

                        <div className="text-lg font-serif font-bold text-stone-100 mb-1">
                          {info.name}
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          {info.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-800/80 text-[11px] text-stone-500">
                        {isSelected ? (
                          <span className="text-amber-300 font-medium">
                            この役職を自分の秘密にする
                          </span>
                        ) : (
                          <span>タップして選択</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleConfirmChoice}
                disabled={!selectedRole}
                className={`w-full py-3.5 rounded-xl font-serif font-black text-sm tracking-wider flex items-center justify-center gap-2 transition shadow-xl ${
                  selectedRole
                    ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-stone-950 active:scale-[0.99] cursor-pointer'
                    : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {selectedRole
                    ? `【${ROLE_INFO[selectedRole]?.name}】に決定して次の人へ渡す`
                    : '役職カードを1枚選んでください'}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* When waiting for another player's draft turn */
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/40 border border-amber-800/60 flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-400 animate-spin-slow" />
          </div>

          <div>
            <h3 className="text-base font-serif font-bold text-stone-200">
              【{activeChar?.relation || activePlayer?.name}】が役職を選別中……
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              秘密裏にカードの確認と選択を行っています。しばらくお待ちください。
            </p>
          </div>

          {/* Show what you chose already if you already drafted */}
          {myConfirmedRole && (
            <div className="mt-4 p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl text-left inline-block w-full max-w-sm">
              <span className="text-[10px] text-stone-500 block uppercase tracking-wider">
                あなたの秘密の役職（決定済み）
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-serif font-bold text-amber-200 text-sm">
                  {ROLE_INFO[myConfirmedRole]?.name}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full border ${ROLE_INFO[myConfirmedRole]?.badgeColor}`}
                >
                  {ROLE_INFO[myConfirmedRole]?.camp}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                {ROLE_INFO[myConfirmedRole]?.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
