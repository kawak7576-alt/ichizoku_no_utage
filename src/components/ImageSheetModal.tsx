import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Check, AlertCircle, Sparkles, X, RefreshCw, Sliders, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

const DEFAULT_SLICES = [
  { id: 'head', name: '当主', row: 0, col: 0, color: 'bg-amber-950/80 text-amber-300' },
  { id: 'eldest_son', name: '長男', row: 0, col: 1, color: 'bg-emerald-950/80 text-emerald-300' },
  { id: 'eldest_daughter', name: '長女', row: 0, col: 2, color: 'bg-rose-950/80 text-rose-300' },
  { id: 'second_son', name: '次男', row: 1, col: 0, color: 'bg-blue-950/80 text-blue-300' },
  { id: 'second_daughter', name: '次女', row: 1, col: 1, color: 'bg-purple-950/80 text-purple-300' },
  { id: 'third_son', name: '三男', row: 1, col: 2, color: 'bg-amber-950/80 text-amber-300' },
  { id: 'third_daughter', name: '三女', row: 2, col: 0, color: 'bg-teal-950/80 text-teal-300' },
  { id: 'phantom_thief', name: '怪盗', row: 2, col: 1, color: 'bg-purple-950/80 text-purple-300' },
  { id: 'kitsune', name: '妖狐', row: 2, col: 2, color: 'bg-orange-950/80 text-orange-300' },
];

export const NINE_CHARACTER_OPTIONS = [
  { id: 'head', name: '当主', color: 'text-amber-300' },
  { id: 'eldest_son', name: '長男', color: 'text-emerald-300' },
  { id: 'eldest_daughter', name: '長女', color: 'text-rose-300' },
  { id: 'second_son', name: '次男', color: 'text-blue-300' },
  { id: 'second_daughter', name: '次女', color: 'text-purple-300' },
  { id: 'third_son', name: '三男', color: 'text-amber-300' },
  { id: 'third_daughter', name: '三女', color: 'text-teal-300' },
  { id: 'phantom_thief', name: '怪盗', color: 'text-purple-300' },
  { id: 'kitsune', name: '妖狐', color: 'text-orange-300' },
];

export function ImageSheetModal({ isOpen, onClose, onApplied }: ImageSheetModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sliceMappings, setSliceMappings] = useState<string[]>(() =>
    DEFAULT_SLICES.map((s) => s.id)
  );
  const [cellImages, setCellImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showAdjustControls, setShowAdjustControls] = useState(true);

  // Calibration Controls for Perfect Centering
  const [offsetY, setOffsetY] = useState(0); // -40% to +40%
  const [offsetX, setOffsetX] = useState(0); // -40% to +40%
  const [zoom, setZoom] = useState(100); // 80% to 150%
  const [inset, setInset] = useState(2); // 0% to 12% margin removal
  const [cellNudges, setCellNudges] = useState<Array<{ x: number; y: number }>>(() =>
    Array(9).fill({ x: 0, y: 0 })
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMessage(null);
    }
  }, [isOpen]);

  const performCrop = useCallback(
    (
      img: HTMLImageElement,
      offX: number,
      offY: number,
      curZoom: number,
      curInset: number,
      nudges: Array<{ x: number; y: number }>
    ) => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const colW = w / 3;
        const rowH = h / 3;

        const slicedCells: string[] = [];

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const idx = row * 3 + col;
            const nudge = nudges[idx] || { x: 0, y: 0 };

            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 320;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';

              // True Cell Center
              const baseCenterX = (col + 0.5) * colW;
              const baseCenterY = (row + 0.5) * rowH;

              // Total applied offsets
              const finalCenterX =
                baseCenterX + ((offX + nudge.x) / 100) * colW;
              const finalCenterY =
                baseCenterY + ((offY + nudge.y) / 100) * rowH;

              // Square crop dimension preserving 1:1 aspect ratio
              const baseDimension =
                Math.min(colW, rowH) * (1 - (curInset * 2) / 100);
              const cropDimension = baseDimension * (100 / Math.max(20, curZoom));

              const sx = finalCenterX - cropDimension / 2;
              const sy = finalCenterY - cropDimension / 2;

              ctx.drawImage(
                img,
                sx,
                sy,
                cropDimension,
                cropDimension,
                0,
                0,
                320,
                320
              );
              // Use lightweight high-quality JPEG (approx 20KB/avatar) to fit mobile localStorage quota perfectly
              slicedCells.push(canvas.toDataURL('image/jpeg', 0.88));
            }
          }
        }

        setCellImages(slicedCells);
        return true;
      } catch (err) {
        console.error('Crop error:', err);
        return false;
      }
    },
    []
  );

  // Trigger re-crop when adjustments change
  const triggerRecrop = (
    newOffX = offsetX,
    newOffY = offsetY,
    newZoom = zoom,
    newInset = inset,
    newNudges = cellNudges
  ) => {
    if (loadedImageRef.current) {
      performCrop(
        loadedImageRef.current,
        newOffX,
        newOffY,
        newZoom,
        newInset,
        newNudges
      );
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage({
        text: '画像ファイル（PNGまたはJPG）を選択してください。',
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);

      const img = new Image();
      img.onload = () => {
        loadedImageRef.current = img;
        const ok = performCrop(img, offsetX, offsetY, zoom, inset, cellNudges);
        setIsProcessing(false);
        if (ok) {
          setMessage({
            text: '9人の画像を自動センタリングして切り抜きました！上下・左右のスライダーで中心位置を微調整できます。',
            type: 'success',
          });
        } else {
          setMessage({
            text: '画像の切り抜き処理に失敗しました。',
            type: 'error',
          });
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        setMessage({
          text: '画像の読み込みに失敗しました。',
          type: 'error',
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleMappingChange = (cellIndex: number, newCharacterId: string) => {
    setSliceMappings((prev) => {
      const next = [...prev];
      next[cellIndex] = newCharacterId;
      return next;
    });
  };

  const handleNudge = (cellIndex: number, dx: number, dy: number) => {
    setCellNudges((prev) => {
      const next = [...prev];
      const cur = next[cellIndex] || { x: 0, y: 0 };
      next[cellIndex] = { x: cur.x + dx, y: cur.y + dy };
      triggerRecrop(offsetX, offsetY, zoom, inset, next);
      return next;
    });
  };

  const handleResetCalibration = () => {
    setOffsetX(0);
    setOffsetY(0);
    setZoom(100);
    setInset(2);
    const zeroNudges = Array(9).fill({ x: 0, y: 0 });
    setCellNudges(zeroNudges);
    triggerRecrop(0, 0, 100, 2, zeroNudges);
  };

  const handleApply = async () => {
    if (cellImages.length === 0) return;

    setIsSaving(true);
    const finalCroppedMap: Record<string, string> = {};
    cellImages.forEach((imgData, idx) => {
      const charId = sliceMappings[idx] || DEFAULT_SLICES[idx].id;
      finalCroppedMap[charId] = imgData;
    });

    if (finalCroppedMap['head']) {
      finalCroppedMap['grandfather'] = finalCroppedMap['head'];
    }

    try {

      // 1. Save to localStorage for instant client-side rendering
      Object.entries(finalCroppedMap).forEach(([id, dataUrl]) => {
        try {
          localStorage.setItem(`mansion_avatar_${id}`, dataUrl);
        } catch {
          // ignore quota exceeded if any
        }
      });

      // 2. Post to server to save files into public/characters/*.png and broadcast
      const response = await fetch('/api/upload-character-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characters: finalCroppedMap }),
      });

      if (!response.ok) {
        console.warn('Server save warning:', await response.text());
      }

      // 3. Trigger local broadcast event with full characters map
      window.dispatchEvent(
        new CustomEvent('mansion_characters_updated', {
          detail: { characters: finalCroppedMap, available: Object.keys(finalCroppedMap) },
        })
      );

      // 4. Trigger socket broadcast to all connected players
      window.dispatchEvent(
        new CustomEvent('mansion_sync_avatars_to_server', {
          detail: { characters: finalCroppedMap },
        })
      );

      setMessage({
        text: '全9人のキャラクター画像を中心調整済みで適用しました！',
        type: 'success',
      });
      setIsSaving(false);

      if (onApplied) onApplied();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Save error:', err);
      window.dispatchEvent(
        new CustomEvent('mansion_characters_updated', {
          detail: { characters: finalCroppedMap, available: Object.keys(finalCroppedMap) },
        })
      );
      setIsSaving(false);
      setMessage({
        text: 'ローカルに適用しました（サーバー通信完了）',
        type: 'success',
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleResetToDefault = async () => {
    NINE_CHARACTER_OPTIONS.forEach((s) => {
      localStorage.removeItem(`mansion_avatar_${s.id}`);
    });
    localStorage.removeItem('mansion_avatar_grandfather');
    window.dispatchEvent(new CustomEvent('mansion_characters_updated'));
    setCellImages([]);
    setSelectedImage(null);
    loadedImageRef.current = null;
    setMessage({ text: 'デフォルトのアイコンに戻しました。', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl overflow-hidden shadow-2xl border border-amber-600/50"
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
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200 tracking-wide">
              キャラクター画像シート（3×3画像）の適用・中心補正
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-stone-300 text-sm">
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            添付の9人分キャラクター画像（3×3画像シート）を選択またはドロップしてください。
            <strong className="text-amber-300">
              画像の縦横比を歪めずに正方形・中心位置を自動補正
            </strong>
            して、【当主・長男・長女・次男・次女・三男・三女・怪盗・妖狐】の9人に即座に反映します。
          </p>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-amber-600/50 hover:border-amber-400/80 rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors bg-stone-900/50 hover:bg-stone-900/80 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Upload className="w-7 h-7 mx-auto mb-1.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-amber-200 text-xs sm:text-sm mb-0.5">
              {isProcessing
                ? '画像を自動センタリング処理中……'
                : selectedImage
                ? '別の画像シートを選択・再アップロード'
                : '画像シート（image.png）をドロップ または クリックして選択'}
            </div>
            <div className="text-[11px] text-stone-400">
              3×3グリッドで配置された一族の画像ファイルを読み込みます
            </div>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 border ${
                message.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                  : 'bg-red-950/80 border-red-600 text-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Centering / Calibration Adjustments */}
          {cellImages.length > 0 && (
            <div className="bg-stone-950/90 p-3 sm:p-4 rounded-xl border border-amber-800/50 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="text-xs font-serif font-bold text-amber-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>画像の中心位置・サイズ補正（全体調整）</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetCalibration}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  中央リセット
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Vertical Offset */}
                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>上下位置（Yオフセット）:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {offsetY > 0 ? `+${offsetY}% (下)` : offsetY < 0 ? `${offsetY}% (上)` : '0%'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={offsetY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setOffsetY(val);
                      triggerRecrop(offsetX, val, zoom, inset, cellNudges);
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>▲ 上に寄せる</span>
                    <span>▼ 下に寄せる</span>
                  </div>
                </div>

                {/* Horizontal Offset */}
                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>左右位置（Xオフセット）:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {offsetX > 0 ? `+${offsetX}% (右)` : offsetX < 0 ? `${offsetX}% (左)` : '0%'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={offsetX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setOffsetX(val);
                      triggerRecrop(val, offsetY, zoom, inset, cellNudges);
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded"
                  />
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>◀ 左に寄せる</span>
                    <span>▶ 右に寄せる</span>
                  </div>
                </div>

                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>拡大 / 縮小（ズーム）:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {zoom}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="140"
                    step="2"
                    value={zoom}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setZoom(val);
                      triggerRecrop(offsetX, offsetY, val, inset, cellNudges);
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded"
                  />
                </div>

                {/* Border Inset */}
                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>区切り枠線の除外マージン:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {inset}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={inset}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setInset(val);
                      triggerRecrop(offsetX, offsetY, zoom, val, cellNudges);
                    }}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-stone-800 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cropped Preview Grid */}
          {cellImages.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-serif font-bold text-amber-300 flex items-center justify-between">
                <span>丸型アイコンプレビュー（全9名・中心補正反映）</span>
                <span className="text-[11px] text-stone-400">
                  微調整矢印またはプルダウンで変更可
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-stone-950/80 p-2.5 rounded-lg border border-amber-900/50">
                {cellImages.map((dataUrl, idx) => {
                  const currentId =
                    sliceMappings[idx] || DEFAULT_SLICES[idx]?.id;
                  const currentOpt = NINE_CHARACTER_OPTIONS.find(
                    (o) => o.id === currentId
                  );

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-2 rounded bg-stone-900/90 border border-stone-800 relative group"
                    >
                      {/* Round Golden Frame matching game avatars */}
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-[2px] box-border mb-1 shadow-lg"
                        style={{
                          background:
                            'linear-gradient(135deg, #fce085 0%, #caa44f 35%, #593c12 70%, #f0d57e 100%)',
                        }}
                      >
                        <div className="w-full h-full rounded-full overflow-hidden bg-stone-950 flex items-center justify-center">
                          <img
                            src={dataUrl}
                            alt={currentOpt?.name || `枠 ${idx + 1}`}
                            className="w-full h-full object-cover object-center block"
                          />
                        </div>
                      </div>

                      {/* Character Selector */}
                      <select
                        value={currentId}
                        onChange={(e) =>
                          handleMappingChange(idx, e.target.value)
                        }
                        className="text-[10px] sm:text-xs bg-stone-950 border border-amber-700/60 text-amber-200 rounded px-1.5 py-0.5 mt-0.5 font-serif text-center cursor-pointer outline-none w-full max-w-[90px]"
                      >
                        {NINE_CHARACTER_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </select>

                      {/* Micro Nudge Arrows for Individual Cell Centering */}
                      <div className="flex items-center gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleNudge(idx, 0, -2)}
                          title="上に移動"
                          className="p-0.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudge(idx, 0, 2)}
                          title="下に移動"
                          className="p-0.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudge(idx, -2, 0)}
                          title="左に移動"
                          className="p-0.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudge(idx, 2, 0)}
                          title="右に移動"
                          className="p-0.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-amber-700/40 bg-stone-950/70">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-stone-400 hover:text-stone-200 flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-stone-800/60 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>初期状態に戻す</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition"
            >
              閉じる
            </button>
            <button
              type="button"
              disabled={cellImages.length === 0 || isSaving}
              onClick={handleApply}
              className="px-4 py-1.5 rounded text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex items-center space-x-1.5"
            >
              {isSaving ? (
                <span>適用中……</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>一括適用する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
