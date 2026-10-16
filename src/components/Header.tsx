import { useState } from 'react';
import { Copy, Check, BookOpen, Crown, Users, RotateCcw, Download } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  playerCount: number;
  isHost: boolean;
  onOpenRules: () => void;
  onOpenResetConfirm: () => void;
}

export function Header({
  isConnected,
  playerCount,
  isHost,
  onOpenRules,
  onOpenResetConfirm,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Copy clean base URL so whoever clicks it joins automatically
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-amber-900/40 px-3 sm:px-6 py-2.5 transition">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left Side: Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-700 to-amber-950 border border-amber-500/40 flex items-center justify-center shadow-inner">
            <span className="text-base font-serif">宴</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-serif font-black tracking-wider text-amber-200">
              一族の宴
            </h1>
            <p className="text-[10px] text-amber-500/70 hidden sm:block">
              消えた家宝と変装者
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Invite URL button (No room code needed) */}
          <button
            onClick={handleCopy}
            title="招待URLをコピー（リンクを開くだけで全員同じ部屋に合流）"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded-lg text-xs font-medium border border-amber-800/80 transition shadow-sm active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">招待URLを共有</span>
                <span className="xs:hidden">招待</span>
              </>
            )}
          </button>

          {/* Reset button (招待ボタンの右に配置) */}
          <button
            onClick={onOpenResetConfirm}
            title="ゲームをリセットしてマッチング画面に戻る"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 rounded-lg text-xs font-serif font-bold transition shadow active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="hidden xs:inline">リセット</span>
          </button>

          {/* Player Count & Host tag */}
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-stone-900/80 rounded-lg border border-stone-800">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-300 font-mono text-[11px]">
              {playerCount}/5
            </span>
            {isHost && (
              <span title="ホスト">
                <Crown className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
              </span>
            )}
          </div>

          {/* Connection status */}
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isConnected
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                : 'bg-red-500'
            }`}
            title={isConnected ? 'オンライン' : '切断中'}
          />

          {/* Rules modal button */}
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-700/80 text-xs transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">掟と役職</span>
          </button>

          {/* GitHub Export ZIP Download button */}
          <a
            href="/api/download-zip"
            download="ichizoku-no-utage.zip"
            title="GitHub移行用：ソースコード一式(ZIP)をダウンロード"
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-700/80 text-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">ZIP保存</span>
          </a>
        </div>
      </div>
    </header>
  );
}
