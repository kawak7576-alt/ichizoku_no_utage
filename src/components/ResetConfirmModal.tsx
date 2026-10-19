import { RotateCcw, AlertCircle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export function ResetConfirmModal({
  isOpen,
  onClose,
  onConfirmReset,
}: ResetConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-stone-950 border border-amber-600/60 rounded-2xl p-6 shadow-2xl text-stone-200 space-y-4">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-amber-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-900 border border-amber-500/70 flex items-center justify-center text-amber-400 shrink-0 shadow">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-amber-200 text-base">
              ゲームのリセット確認
            </h3>
            <p className="text-[11px] text-stone-400">
              マッチング待機画面へ復帰
            </p>
          </div>
        </div>

        {/* Description conforming to exact specification */}
        <div className="p-3.5 bg-stone-900/80 rounded-xl border border-stone-800 text-xs text-stone-300 leading-relaxed">
          ゲームをリセットしますか？ すべてのプレイヤーの進行状況が初期化され、最初のマッチング画面に戻ります。
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl text-xs font-medium text-stone-300 transition min-h-[44px]"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="flex-1 py-3 px-3 bg-stone-900 hover:bg-red-950/80 border border-amber-500 text-amber-200 hover:text-red-300 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition shadow-lg active:scale-95 min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>リセットする</span>
          </button>
        </div>
      </div>
    </div>
  );
}
