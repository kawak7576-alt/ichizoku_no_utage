import { useState } from 'react';
import { GameStatePublic } from '../types/game.ts';
import { CHARACTERS } from '../data/characters.ts';
import { Check, Users, HelpCircle, ShieldAlert } from 'lucide-react';
import { CharacterAvatar, AvatarVariant } from './CharacterAvatar.tsx';

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
  const candidates: Array<{
    id: string;
    name: string;
    relation: string;
    location: string;
    isMe: boolean;
    isSickroom: boolean;
    avatarVariant: AvatarVariant;
  }> = [
    ...gameState.players.map((p) => {
      const char = CHARACTERS.find((c) => c.id === p.characterId);
      return {
        id: p.id,
        name: p.name,
        relation: char?.relation || '一族',
        location: '',
        isMe: p.id === currentUserId,
        isSickroom: false,
        avatarVariant: (p.characterId as AvatarVariant) || 'unknown',
      };
    }),
    {
      id: 'sickroom',
      name: 'ノンプレイヤー',
      relation: gameState.sickroomCharacter ? `${gameState.sickroomCharacter.relation}（📍療養室）` : '療養室',
      location: '療養室',
      isMe: false,
      isSickroom: true,
      avatarVariant: (gameState.sickroomCharacter?.id as AvatarVariant) || 'sickroom',
    },
  ];

  const handleConfirmVote = () => {
    if (!selectedThief || !selectedKitsune) return;
    onSubmitVote(selectedThief, selectedKitsune);
  };

  const votedCount = gameState.players.filter((p) => p.hasVoted).length;

  const chosenThiefObj = candidates.find((c) => c.id === selectedThief);
  const chosenKitsuneObj = candidates.find((c) => c.id === selectedKitsune);

  return (
    <div className="max-w-2xl mx-auto my-1.5 sm:my-3 px-2 sm:px-4 space-y-2 sm:space-y-3 animate-fade-in pb-8">
      {/* Top Banner */}
      <div className="dark-panel p-2.5 sm:p-4 text-center">
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-800/80">
          <span className="px-2 py-0.5 bg-stone-950 border border-red-600/80 text-red-300 font-serif text-[10px] sm:text-xs font-bold rounded-full">
            告発の時
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>投票状況：</span>
            <span className="font-mono text-amber-300 font-bold">
              {votedCount} / {gameState.totalPlayers}人
            </span>
          </div>
        </div>
        <h2 className="text-sm sm:text-base font-serif font-black tracking-wider text-amber-100 gold-gradient-text mt-1">
          怪盗と妖狐の告発・投票
        </h2>
        <p className="text-[11px] text-stone-300 mt-0.5 leading-tight">
          会話の違和感やワードをもとに、怪盗と妖狐をそれぞれ1人選んでください。
        </p>
      </div>

      {hasVoted ? (
        /* Voted waiting card */
        <div className="dark-panel p-6 sm:p-8 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-950 border-2 border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-xl">
            <Check className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-serif font-black text-amber-200">
              あなたの告発投票を受け付けました
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              他のプレイヤーの投票完了を待っています（{votedCount} /{' '}
              {gameState.totalPlayers}人）
            </p>
          </div>

          <div className="p-2.5 bg-stone-950/80 rounded-xl border border-stone-800 text-[11px] text-stone-400 max-w-sm mx-auto font-serif">
            全員の投票が確定すると、一斉に結果が開示されます。
          </div>
        </div>
      ) : (
        /* Voting Form */
        <div className="space-y-2.5 sm:space-y-3">
          {/* Section 1: Phantom Thief Vote */}
          <div className="dark-panel p-2.5 sm:p-4 border-purple-900/60 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                <h3 className="font-serif font-black text-amber-100 text-xs sm:text-sm">
                  1. 【怪盗】だと思う対象を1つ選択
                </h3>
              </div>
              <span className="text-[10px] text-purple-300 font-serif">
                必ず誤のワード
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {candidates.map((c) => {
                const isSelected = selectedThief === c.id;
                return (
                  <button
                    key={`thief_${c.id}`}
                    type="button"
                    onClick={() => setSelectedThief(c.id)}
                    className={`p-1.5 sm:p-2.5 rounded-xl transition-all text-left flex items-center gap-1.5 min-h-[46px] cursor-pointer ${
                      isSelected
                        ? 'gold-border-strong bg-purple-950/50 scale-[1.02]'
                        : 'gold-border bg-stone-950/80 hover:border-amber-500/50'
                    }`}
                  >
                    <CharacterAvatar
                      variant={c.avatarVariant}
                      size="xs"
                      showNameplate={false}
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="font-serif font-bold text-[11px] sm:text-xs text-stone-200 truncate flex items-center justify-between">
                        <span>{c.relation}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
                        )}
                      </div>
                      <div className="text-[9px] text-stone-400 truncate mt-0.5">
                        {c.isSickroom ? 'ノンプレイヤー' : (c.isMe ? `${c.name}（自）` : c.name)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Kitsune Vote */}
          <div className="dark-panel p-2.5 sm:p-4 border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                <h3 className="font-serif font-black text-amber-100 text-xs sm:text-sm">
                  2. 【妖狐】だと思う対象を1つ選択
                </h3>
              </div>
              <span className="text-[10px] text-amber-300 font-serif">
                正ワード＋指定ワード
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {candidates.map((c) => {
                const isSelected = selectedKitsune === c.id;
                return (
                  <button
                    key={`kitsune_${c.id}`}
                    type="button"
                    onClick={() => setSelectedKitsune(c.id)}
                    className={`p-1.5 sm:p-2.5 rounded-xl transition-all text-left flex items-center gap-1.5 min-h-[46px] cursor-pointer ${
                      isSelected
                        ? 'gold-border-strong bg-amber-950/50 scale-[1.02]'
                        : 'gold-border bg-stone-950/80 hover:border-amber-500/50'
                    }`}
                  >
                    <CharacterAvatar
                      variant={c.avatarVariant}
                      size="xs"
                      showNameplate={false}
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="font-serif font-bold text-[11px] sm:text-xs text-stone-200 truncate flex items-center justify-between">
                        <span>{c.relation}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-amber-400 shrink-0 ml-0.5" />
                        )}
                      </div>
                      <div className="text-[9px] text-stone-400 truncate mt-0.5">
                        {c.isSickroom ? 'ノンプレイヤー' : (c.isMe ? `${c.name}（自）` : c.name)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-6: 投票確定前に選択内容を確認できるようにする */}
          {(selectedThief || selectedKitsune) && (
            <div className="p-2 sm:p-2.5 bg-stone-950/90 border border-amber-900/60 rounded-xl text-[11px] flex items-center justify-between gap-1 text-stone-200 font-serif font-bold">
              <div>
                怪盗：
                <span className="text-purple-300 ml-1">
                  {chosenThiefObj ? chosenThiefObj.relation : '未選択'}
                </span>
              </div>
              <div>
                妖狐：
                <span className="text-amber-300 ml-1">
                  {chosenKitsuneObj ? chosenKitsuneObj.relation : '未選択'}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleConfirmVote}
            disabled={!selectedThief || !selectedKitsune}
            className={`w-full py-3 sm:py-3.5 rounded-xl font-serif font-black text-xs sm:text-sm tracking-widest flex items-center justify-center gap-2 transition min-h-[44px] ${
              selectedThief && selectedKitsune
                ? 'gold-btn cursor-pointer'
                : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {selectedThief && selectedKitsune
                ? '告発投票を確定する'
                : '怪盗と妖狐の双方を選択してください'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
