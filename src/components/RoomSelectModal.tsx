import { useState } from 'react';
import { X, Hash, Shuffle, Users, Check, ArrowRight } from 'lucide-react';
import { RoomSummary } from '../types/game.ts';

interface RoomSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  roomsSummary?: RoomSummary[];
}

export function RoomSelectModal({
  isOpen,
  onClose,
  currentRoomId,
  onSelectRoom,
  roomsSummary = [],
}: RoomSelectModalProps) {
  const [selectedNum, setSelectedNum] = useState<string>(currentRoomId || '01');

  if (!isOpen) return null;

  const allRooms = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

  const handleConfirm = () => {
    onSelectRoom(selectedNum);
    onClose();
  };

  const handleRandom = () => {
    // Pick random room from 01 to 10
    const rand = Math.floor(Math.random() * 10) + 1;
    const formatted = rand < 10 ? `0${rand}` : `${rand}`;
    setSelectedNum(formatted);
  };

  const activeRoomsWithPlayers = roomsSummary.filter((r) => r.playerCount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl border-2 border-amber-500/70 p-4 sm:p-6 shadow-2xl relative overflow-hidden text-stone-100 space-y-4"
        style={{
          background: 'linear-gradient(180deg, #131722 0%, #0c0f17 100%)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(245, 158, 11, 0.4)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900/80 border border-stone-700 text-stone-400 hover:text-stone-100 hover:border-amber-400 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header Badge */}
        <div className="text-center space-y-2 pt-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-950/60 border border-amber-500/70 flex items-center justify-center shadow-lg">
            <span className="text-amber-400 font-mono text-2xl font-black">#</span>
          </div>
          <div>
            <h3 className="text-lg font-serif font-black tracking-wider text-amber-100">
              部屋番号の選択・変更
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              友達と同じ<strong className="text-amber-300 font-bold">2桁の番号（01〜10）</strong>を入力すると合流できます
            </p>
          </div>
        </div>

        {/* Big Input Card */}
        <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 space-y-3">
          <div className="text-center text-xs text-stone-400 font-medium">
            部屋番号を入力（01〜10）
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center bg-stone-900/90 border-2 border-amber-500/80 rounded-xl px-4 py-2 shadow-inner focus-within:border-amber-400">
              <span className="text-stone-400 font-mono text-xl font-bold mr-2">#</span>
              <input
                type="text"
                value={selectedNum}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 2) {
                    setSelectedNum(val);
                  }
                }}
                onBlur={() => {
                  let num = parseInt(selectedNum, 10);
                  if (isNaN(num) || num < 1) num = 1;
                  if (num > 10) num = 10;
                  setSelectedNum(num < 10 ? `0${num}` : `${num}`);
                }}
                maxLength={2}
                className="w-14 bg-transparent text-2xl font-mono font-black text-amber-300 focus:outline-none tracking-widest text-center"
              />
            </div>

            <button
              onClick={handleConfirm}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-serif font-black text-sm flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
            >
              <span>決定</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <button
            onClick={handleRandom}
            className="w-full py-2 px-3 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-stone-700/80 text-stone-300 text-xs font-serif flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>ランダムな部屋番号にする</span>
          </button>
        </div>

        {/* Quick Room Buttons */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-stone-400 font-medium">
            部屋一覧（01〜10）：
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {allRooms.map((r) => {
              const summary = roomsSummary.find((s) => s.roomId === r);
              const count = summary ? summary.playerCount : 0;
              const isSelected = selectedNum === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedNum(r)}
                  className={`py-2 px-1 rounded-xl font-mono text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-stone-900/80 hover:bg-stone-850 text-stone-300 border-stone-800 hover:border-amber-600/60'
                  }`}
                >
                  <span>#{r}</span>
                  {count > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full ${
                        isSelected ? 'bg-stone-950/20 text-stone-900' : 'text-amber-400'
                      }`}
                    >
                      {count}人
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rooms with Active Players */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-stone-400 font-medium">
            プレイヤーがいる部屋：
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
            {activeRoomsWithPlayers.length === 0 ? (
              <div className="p-2.5 rounded-xl border border-stone-800/80 bg-stone-950/40 text-[11px] text-stone-500 text-center">
                現在待機中の他の部屋はありません
              </div>
            ) : (
              activeRoomsWithPlayers.map((r) => {
                const isCurrent = r.roomId === currentRoomId;
                const isTargetSelected = r.roomId === selectedNum;
                return (
                  <div
                    key={r.roomId}
                    onClick={() => setSelectedNum(r.roomId)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                      isTargetSelected
                        ? 'border-amber-500 bg-amber-950/30'
                        : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300">
                        #{r.roomId}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {r.phase === 'lobby' ? '待機中' : '対戦中'}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-600/50 text-[10px] font-bold">
                          現在地
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 font-mono text-stone-300">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>{r.playerCount}人</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
