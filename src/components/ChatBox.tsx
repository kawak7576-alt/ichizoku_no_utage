import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { ChatMessage } from '../types/game.ts';

interface ChatBoxProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  defaultExpanded?: boolean;
}

export function ChatBox({
  messages,
  currentUserId,
  onSendMessage,
  defaultExpanded = false,
}: ChatBoxProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgLength = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMsgLength.current) {
      if (!isExpanded) {
        setUnreadCount((c) => c + (messages.length - prevMsgLength.current));
      }
    }
    prevMsgLength.current = messages.length;

    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      setUnreadCount(0);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="fixed bottom-3 right-3 z-30 w-[92vw] max-w-sm sm:max-w-md transition-all">
      <div className="bg-stone-900/95 border border-stone-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
        {/* Toggle Bar */}
        <button
          onClick={handleToggle}
          className="w-full px-3.5 py-2.5 bg-stone-950/80 hover:bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs text-stone-300 font-medium transition"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span className="font-serif">屋敷の対話記録 / ログ</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-stone-950 text-[10px] font-bold rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-stone-500">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Chat Body */}
        {isExpanded && (
          <div className="flex flex-col h-64 sm:h-72">
            {/* Messages list */}
            <div
              ref={scrollRef}
              className="flex-1 p-3 overflow-y-auto space-y-2 text-xs"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-stone-600 text-[11px] italic">
                  まだ対話はありません。
                </div>
              ) : (
                messages.map((msg) => {
                  if (msg.isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="p-1.5 rounded bg-amber-950/30 border border-amber-900/40 text-[11px] text-amber-300/90 flex items-start gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{msg.text}</span>
                      </div>
                    );
                  }

                  const isMe = msg.senderId === currentUserId;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-stone-500 mb-0.5">
                        <span className="font-bold text-stone-400">
                          {msg.characterRelation ? `[${msg.characterRelation}] ` : ''}
                          {msg.senderName}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] px-3 py-1.5 rounded-lg text-xs break-words ${
                          isMe
                            ? 'bg-amber-700/80 text-amber-50 border border-amber-600/40'
                            : 'bg-stone-800 text-stone-200 border border-stone-700/60'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-2 border-t border-stone-800/80 bg-stone-950/60 flex items-center gap-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力..."
                maxLength={80}
                className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 rounded-lg transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
