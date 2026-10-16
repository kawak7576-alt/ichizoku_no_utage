import React, { useState } from 'react';
import { GameStatePublic, PlayerPrivate } from '../types/game.ts';
import { CHARACTERS } from '../data/characters.ts';
import { Send, Clock, Key, ShieldAlert } from 'lucide-react';

interface SalvationPhaseProps {
  gameState: GameStatePublic;
  privateState: PlayerPrivate;
  currentUserId: string;
  onSubmitSalvationGuess: (guess: string) => void;
}

export function SalvationPhase({
  gameState,
  privateState,
  currentUserId,
  onSubmitSalvationGuess,
}: SalvationPhaseProps) {
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isThief = gameState.salvation?.thiefPlayerId === currentUserId;
  const secondsRemaining = gameState.salvation?.secondsRemaining ?? 30;

  const thiefPlayer = gameState.players.find(
    (p) => p.id === gameState.salvation?.thiefPlayerId
  );
  const thiefChar = CHARACTERS.find((c) => c.id === thiefPlayer?.characterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || submitted) return;
    setSubmitted(true);
    onSubmitSalvationGuess(guess.trim());
  };

  return (
    <div className="max-w-xl mx-auto my-6 px-4 space-y-6 animate-fade-in pb-16">
      <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-purple-950/60 border-2 border-purple-600/70 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-700/80 rounded-full text-xs text-purple-300 font-bold mb-3">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span>怪盗の救済措置発動！</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wide text-purple-100 mb-2">
          正体を見抜かれた怪盗の足掻き
        </h2>

        {/* Countdown */}
        <div className="my-4 inline-flex items-center gap-2 px-4 py-2 bg-stone-950/90 border border-purple-900/80 rounded-xl font-mono text-2xl font-black text-purple-300">
          <Clock className="w-5 h-5 text-purple-400 animate-spin-slow" />
          <span>{secondsRemaining} 秒</span>
        </div>

        {/* Narrative */}
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif max-w-md mx-auto">
          怪盗の変装は一族に見破られた！
          しかし、怪盗は正のワード（一族の合言葉）を言い当てることができれば、
          煙幕と共に逃げ去り【引き分け】に持ち込むことができる！
        </p>

        {/* Thief view or spectator view */}
        {isThief ? (
          <div className="mt-6 pt-5 border-t border-purple-900/60 space-y-4">
            <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-xl text-left text-xs text-purple-200">
              <span className="font-bold text-amber-300 block mb-1">
                怪盗のあなたへ：
              </span>
              会話の中で一族（正のワード）が何について語っていたかを推測し、正のワードを入力してください！（1度のみ回答可能）
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={submitted}
                  maxLength={30}
                  placeholder="正のワードを入力（例: カレー）"
                  className="w-full px-4 py-3 bg-stone-950 border border-purple-600 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-400 font-serif font-bold text-center text-lg transition"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!guess.trim() || submitted}
                className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-amber-600 to-purple-700 hover:from-purple-600 hover:to-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-serif font-black text-sm tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>{submitted ? '回答送信済み...' : '正のワードを回答する'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-stone-800 space-y-3">
            <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-xl text-center">
              <p className="text-sm font-serif font-bold text-stone-200">
                怪盗【{thiefChar?.relation || thiefPlayer?.name}】がワードを推測中……
              </p>
              <p className="text-xs text-stone-400 mt-1">
                怪盗が正のワードを当てれば「引き分け」、外せば「一族の勝利判定」へ進みます。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
