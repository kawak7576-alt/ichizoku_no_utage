import React from 'react';
import { X, Check, Sliders, Shield, Award, Users, AlertCircle } from 'lucide-react';

interface RoleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  includeProdigy: boolean;
  onSelectConfig: (includeProdigy: boolean) => void;
  isHost?: boolean;
  currentPhase?: string;
}

export function RoleSettingsModal({
  isOpen,
  onClose,
  includeProdigy,
  onSelectConfig,
  isHost = true,
  currentPhase = 'lobby',
}: RoleSettingsModalProps) {
  if (!isOpen) return null;

  const canChangeNow = currentPhase === 'lobby' || currentPhase === 'opening';

  const handleSelect = (choice: boolean) => {
    onSelectConfig(choice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg flex flex-col rounded-xl overflow-hidden shadow-2xl border border-amber-600/50"
        style={{
          background:
            'linear-gradient(180deg, #181411 0%, #100d0b 60%, #080605 100%)',
          boxShadow:
            '0 0 35px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(234, 179, 8, 0.3)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-700/40 bg-stone-950/70">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-serif font-bold text-amber-200 tracking-wide">
              役職カード構成の設定
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 text-stone-200 text-xs">
          <p className="text-stone-300 leading-relaxed font-serif">
            ゲームで配役に用いられる6枚の役職カード構成を選択できます。
            【秀才】を入れるか、秀才を抜いて【学生4人】にするかをいつでも切り替え可能です。
          </p>

          {!canChangeNow && (
            <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-600/70 text-amber-200 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                現在は配役進行中のため、設定変更は次のゲーム（またはリセット後）から適用されます。
              </span>
            </div>
          )}

          {/* Option 1: 秀才あり (標準) */}
          <div
            onClick={() => handleSelect(true)}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative ${
              includeProdigy
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/80'
                : 'bg-stone-950/70 border-stone-800 hover:border-amber-700/60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-500/70 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-sm text-amber-100">
                      秀才あり（標準ルール）
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-600/50">
                      推奨
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    秀才 1枚 ＋ 学生 3枚 ＋ 怪盗 1枚 ＋ 妖狐 1枚（計6枚）
                  </span>
                </div>
              </div>

              {includeProdigy && (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="mt-2.5 pt-2 border-t border-stone-800/80 space-y-1 text-stone-300 leading-relaxed text-[11px]">
              <p>
                ・<strong className="text-blue-300">【秀才】</strong>は必ず【正のワード】を受け取り、一族の真実の柱となります。
              </p>
              <p className="text-stone-400">
                ・推理の手がかりが多く、初心者からベテランまでバランスよく楽しめる公式スタンダード構成です。
              </p>
            </div>
          </div>

          {/* Option 2: 秀才なし (学生4人) */}
          <div
            onClick={() => handleSelect(false)}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative ${
              !includeProdigy
                ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/80'
                : 'bg-stone-950/70 border-stone-800 hover:border-amber-700/60'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/70 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-sm text-amber-100">
                      秀才なし（学生4人）
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-600/50">
                      上級者向け
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    学生 4枚 ＋ 怪盗 1枚 ＋ 妖狐 1枚（計6枚）
                  </span>
                </div>
              </div>

              {!includeProdigy && (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div className="mt-2.5 pt-2 border-t border-stone-800/80 space-y-1 text-stone-300 leading-relaxed text-[11px]">
              <p>
                ・秀才を抜いて一般<strong className="text-emerald-300">【学生】を4人</strong>に増員します。
              </p>
              <p className="text-stone-400">
                ・一族側全員が「自分が正負どちらのワードを受け取ったか」分からないため、ワードウルフの疑心暗鬼と駆け引きがより深まります。
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between">
          <div className="text-[11px] text-stone-400 font-serif">
            現在の設定：
            <span className="text-amber-300 font-bold ml-1">
              {includeProdigy ? '【秀才あり】' : '【秀才なし（学生4人）】'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 gold-btn rounded-xl text-xs font-serif font-bold cursor-pointer transition"
          >
            決定して閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
