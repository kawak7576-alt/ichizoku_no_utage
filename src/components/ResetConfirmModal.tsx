import { RotateCcw, AlertTriangle, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-stone-900 border border-red-900/70 rounded-2xl p-6 shadow-2xl text-stone-200 space-y-4">
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-950 border border-red-700/80 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-100 text-base">
              ゲームのリセット確認
            </h3>
            <p className="text-[11px] text-red-400/90 font-medium">
              マッチング画面へ戻る
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-300 leading-relaxed">
          進行中のゲームを中止して、全員を<strong>マッチング待機画面</strong>に戻しますか？
          <br />
          <span className="text-stone-400 text-[11px] mt-1 block">
            ※現在の配役・ワード・投票・タイマー状況は破棄されます。
          </span>
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-medium text-stone-300 transition"
          >
            キャンセル
          </button>
          <button
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 border border-red-600 rounded-xl text-xs font-serif font-bold text-red-50 flex items-center justify-center gap-1.5 transition shadow-lg active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>リセットして戻る</span>
          </button>
        </div>
      </div>
    </div>
  );
}
