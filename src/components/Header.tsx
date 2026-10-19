import { useState } from 'react';
import { Copy, Check, BookOpen, Crown, Users, RotateCcw, Download, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  playerCount: number;
  isHost: boolean;
  onOpenRules: () => void;
  onOpenResetConfirm: () => void;
  onOpenImageSheet?: () => void;
}

export function Header({
  isConnected,
  playerCount,
  isHost,
  onOpenRules,
  onOpenResetConfirm,
  onOpenImageSheet,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const cleanUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(cleanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-amber-900/40 px-2.5 sm:px-5 py-1 sm:py-2 transition shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Side: Crest & App Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-stone-950 border border-amber-500/60 flex items-center justify-center shadow-inner">
            <span className="text-xs sm:text-sm font-serif font-black text-amber-200">宴</span>
          </div>
          <div>
            <h1 className="text-xs sm:text-base font-serif font-black tracking-widest text-amber-100">
              一族の宴
            </h1>
            <p className="text-[10px] text-amber-500/80 hidden sm:block font-serif tracking-tight">
              消えた家宝と怪盗と
            </p>
          </div>
        </div>

        {/* Right controls: Image Sheet, Invite, Reset, Count, Status, Rules, Download */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Image Sheet Upload button */}
          {onOpenImageSheet && (
            <button
              onClick={onOpenImageSheet}
              title="添付のimage.pngを9人に自動切り抜き反映"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 rounded-lg text-xs font-serif font-bold border border-amber-600/70 transition active:scale-95 cursor-pointer min-h-[32px] sm:min-h-[38px] shadow-sm"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">画像シート適用</span>
            </button>
          )}

          {/* Invite URL button */}
          <button
            onClick={handleCopy}
            title="招待URLをコピー"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-stone-900/90 hover:bg-stone-800 text-amber-300 rounded-lg text-xs font-medium border border-amber-800/80 transition active:scale-95 cursor-pointer min-h-[32px] sm:min-h-[38px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">コピー済</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">招待</span>
              </>
            )}
          </button>

          {/* Reset button: Black background with gold border, prominently on the top-right */}
          <button
            onClick={onOpenResetConfirm}
            title="ゲームをリセットして初期マッチング画面に戻る"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-stone-950 hover:bg-stone-900 border border-amber-500/80 hover:border-amber-400 text-amber-200 rounded-lg text-xs font-serif font-bold transition shadow-sm active:scale-95 cursor-pointer min-h-[32px] sm:min-h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xs:inline">リセット</span>
          </button>

          {/* Player Count & Host badge */}
          <div className="flex items-center gap-1 text-xs px-1.5 sm:px-2 py-1 bg-stone-900/80 rounded-lg border border-stone-800 min-h-[32px] sm:min-h-[38px]">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-amber-200 font-mono text-[11px] font-bold">
              {playerCount}/5
            </span>
            {isHost && (
              <span title="ホスト">
                <Crown className="w-3 h-3 text-amber-400 ml-0.5" />
              </span>
            )}
          </div>

          {/* Rules modal button */}
          <button
            onClick={onOpenRules}
            title="掟と役職を確認"
            className="flex items-center gap-1 p-1 sm:px-2.5 sm:py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-800 text-xs transition cursor-pointer min-h-[32px] sm:min-h-[38px]"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">掟と役職</span>
          </button>

          {/* Source Code ZIP Download link */}
          <a
            href="/api/download-zip"
            download="ichizoku-no-utage.zip"
            title="GitHub移行用：ソースコード一式(ZIP)をダウンロード"
            className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-800 text-xs transition cursor-pointer min-h-[38px] sm:min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-[11px]">ZIP保存</span>
          </a>

          {/* Connection status dot */}
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isConnected
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                : 'bg-red-500'
            }`}
            title={isConnected ? 'オンライン' : '切断中'}
          />
        </div>
      </div>
    </header>
  );
}
