import { useState } from 'react';
import { GameStatePublic } from '../types/game.ts';
import { CHARACTERS } from '../data/characters.ts';
import { Check, ShieldAlert, Users, Bed, HelpCircle } from 'lucide-react';

interface VotingPhaseProps {
  gameState: GameStatePublic;
  currentUserId: string;
  onSubmitVote: (thiefTarget: string, kitsuneTarget: string) => void;
  onOpenRules: () => void;
}

export function VotingPhase({
  gameState,
  currentUserId,
  onSubmitVote,
  onOpenRules,
}: VotingPhaseProps) {
  const [selectedThief, setSelectedThief] = useState<string | null>(null);
  const [selectedKitsune, setSelectedKitsune] = useState<string | null>(null);

  const currentPlayer = gameState.players.find((p) => p.id === currentUserId);
  const hasVoted = !!currentPlayer?.hasVoted;

  // Candidates: 5 players + 'sickroom'
  const candidates = [
    ...gameState.players.map((p) => {
      const char = CHARACTERS.find((c) => c.id === p.characterId);
      return {
        id: p.id,
        name: p.name,
        relation: char?.relation || '一族',
        location: char?.location || '屋敷',
        isMe: p.id === currentUserId,
        isSickroom: false,
      };
    }),
    {
      id: 'sickroom',
      name: '療養室の人物',
      relation: gameState.sickroomCharacter?.relation || '療養室',
      location: gameState.sickroomCharacter?.location || '療養室',
      isMe: false,
      isSickroom: true,
    },
  ];

  const handleConfirmVote = () => {
    if (!selectedThief || !selectedKitsune) return;
    onSubmitVote(selectedThief, selectedKitsune);
  };

  const votedCount = gameState.players.filter((p) => p.hasVoted).length;

  return (
    <div className="max-w-2xl mx-auto my-4 px-4 space-y-6 animate-fade-in pb-20">
      {/* Top Banner */}
      <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-center">
        <span className="px-2.5 py-0.5 bg-red-950 border border-red-800 text-red-300 font-serif text-xs font-bold rounded">
          告発の時
        </span>
        <h2 className="text-xl font-serif font-black tracking-wide text-stone-100 mt-1">
          怪盗と妖狐の告発・投票
        </h2>
        <p className="text-xs text-stone-400 mt-1 max-w-lg mx-auto">
          会話の違和感やワードをもとに、【怪盗】と【妖狐】の候補をそれぞれ1人選んでください。
          <br />
          <span className="text-amber-400/90 font-medium">
            ※対象はプレイヤー5人と療養室（自分自身も選択可能）です。
          </span>
        </p>

        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-center gap-2 text-xs text-stone-400">
          <Users className="w-4 h-4 text-amber-400" />
          <span>投票状況：</span>
          <span className="font-mono text-amber-300 font-bold">
            {votedCount} / {gameState.totalPlayers}人 完了
          </span>
        </div>
      </div>

      {hasVoted ? (
        /* Voted waiting card */
        <div className="bg-stone-900/90 border border-emerald-900/50 rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/60 border border-emerald-600/70 flex items-center justify-center text-emerald-400">
            <Check className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-serif font-bold text-emerald-200">
              あなたの投票を受け付けました
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              他のプレイヤーの投票完了を待っています（{votedCount} /{' '}
              {gameState.totalPlayers}人）
            </p>
          </div>

          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-xs text-stone-500 max-w-sm mx-auto">
            全員の投票が確定すると、結果が一斉に開示されます。
          </div>
        </div>
      ) : (
        /* Voting Form */
        <div className="space-y-6">
          {/* Section 1: Phantom Thief Vote */}
          <div className="bg-stone-900/80 border border-purple-900/50 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                <h3 className="font-serif font-bold text-stone-100 text-sm sm:text-base">
                  1. 【怪盗】だと思う対象を1つ選択
                </h3>
              </div>
              <span className="text-[11px] text-purple-300 font-medium">
                必ず誤のワード
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {candidates.map((c) => {
                const isSelected = selectedThief === c.id;
                return (
                  <button
                    key={`thief_${c.id}`}
                    type="button"
                    onClick={() => setSelectedThief(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/80 border-purple-400 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.3)] scale-[1.02]'
                        : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-stone-400">
                          📍 {c.location}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-purple-400" />
                        )}
                      </div>
                      <div className="font-serif font-bold text-sm">
                        {c.relation}
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-2 truncate">
                      {c.name} {c.isMe && '（自）'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Kitsune Vote */}
          <div className="bg-stone-900/80 border border-amber-900/50 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                <h3 className="font-serif font-bold text-stone-100 text-sm sm:text-base">
                  2. 【妖狐】だと思う対象を1つ選択
                </h3>
              </div>
              <span className="text-[11px] text-amber-300 font-medium">
                正のワード＋指定ワード
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {candidates.map((c) => {
                const isSelected = selectedKitsune === c.id;
                return (
                  <button
                    key={`kitsune_${c.id}`}
                    type="button"
                    onClick={() => setSelectedKitsune(c.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-[1.02]'
                        : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-stone-400">
                          📍 {c.location}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <div className="font-serif font-bold text-sm">
                        {c.relation}
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-2 truncate">
                      {c.name} {c.isMe && '（自）'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleConfirmVote}
            disabled={!selectedThief || !selectedKitsune}
            className={`w-full py-4 rounded-xl font-serif font-black text-sm tracking-widest flex items-center justify-center gap-2 transition shadow-2xl ${
              selectedThief && selectedKitsune
                ? 'bg-gradient-to-r from-red-700 via-amber-600 to-red-700 hover:from-red-600 hover:to-amber-500 text-stone-950 active:scale-[0.99] cursor-pointer'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {selectedThief && selectedKitsune
                ? '告発投票を確定する（送信後は変更不可）'
                : '怪盗と妖狐の双方を選択してください'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
