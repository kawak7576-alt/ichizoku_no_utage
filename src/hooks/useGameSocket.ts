import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ChatMessage,
  GameStatePublic,
  PlayerPrivate,
  Role,
  RoomSummary,
} from '../types/game.ts';

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameStatePublic | null>(null);
  const [privateState, setPrivateState] = useState<PlayerPrivate>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  // Only remember playerId in state if session says so, but default to empty so landing screen is shown
  const [playerId, setPlayerId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('room');
      if (urlRoom) {
        const clean = urlRoom.replace(/[^0-9]/g, '');
        const num = parseInt(clean, 10);
        if (!isNaN(num) && num >= 1 && num <= 10) {
          return num < 10 ? `0${num}` : `${num}`;
        }
      }
      return sessionStorage.getItem('mansion_room_id') || '01';
    }
    return '01';
  });
  const [roomsSummary, setRoomsSummary] = useState<RoomSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const socket = io({
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }
      setIsConnected(true);

      // Do NOT auto-join on connect! Keep the user on the join screen so they can choose name & room.

      // Auto-sync custom character avatars to server (handles server restarts and Render spin-ups)
      const localAvatars: Record<string, string> = {};
      const avatarKeys = [
        'head',
        'eldest_son',
        'eldest_daughter',
        'second_son',
        'second_daughter',
        'third_son',
        'third_daughter',
        'phantom_thief',
        'kitsune',
        'grandfather',
      ];
      for (const k of avatarKeys) {
        try {
          const val = localStorage.getItem(`mansion_avatar_${k}`);
          if (val && val.startsWith('data:image/')) {
            localAvatars[k] = val;
          }
        } catch {
          // ignore
        }
      }
      if (Object.keys(localAvatars).length > 0) {
        socket.emit('sync_avatars', { characters: localAvatars });
      } else {
        socket.emit('request_avatars');
      }

      // Request real-time room list
      socket.emit('request_rooms_summary');
    });

    socket.on('disconnect', () => {
      // Debounce visual disconnect so quick transport switches don't blink red
      if (!disconnectTimer) {
        disconnectTimer = setTimeout(() => {
          setIsConnected(false);
          disconnectTimer = null;
        }, 2000);
      }
    });

    socket.on('rooms_summary', (summary: RoomSummary[]) => {
      if (Array.isArray(summary)) {
        setRoomsSummary(summary);
      }
    });

    socket.on('room_joined', (data: { roomId: string; playerId: string; isHost: boolean }) => {
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      sessionStorage.setItem('mansion_room_id', data.roomId);
      sessionStorage.setItem('mansion_player_id', data.playerId);

      // Clean URL if room query param was present
      if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    socket.on('room_reset', (data: { roomId: string; message: string }) => {
      // When the room is reset by anyone, all players in the room are kicked out to join screen
      setPlayerId('');
      setGameState(null);
      setPrivateState({});
      sessionStorage.removeItem('mansion_player_id');
      localStorage.removeItem('mansion_player_id');
      setErrorMessage(data?.message || '部屋がリセットされました。再入室してください。');
      setTimeout(() => setErrorMessage(null), 6000);
      socket.emit('request_rooms_summary');
    });

    socket.on('game_state', (state: GameStatePublic) => {
      setGameState(state);
    });

    socket.on('private_state', (pState: PlayerPrivate) => {
      setPrivateState(pState || {});
    });

    socket.on('chat_history', (messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    socket.on('new_message', (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('error_message', (msg: string) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    });

    socket.on(
      'characters_updated',
      (data: {
        timestamp?: number;
        available?: string[];
        characters?: Record<string, string>;
      }) => {
        // Automatically persist received character images into client localStorage
        if (data?.characters && typeof data.characters === 'object') {
          for (const [id, dataUrl] of Object.entries(data.characters)) {
            if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
              try {
                localStorage.setItem(`mansion_avatar_${id}`, dataUrl);
              } catch {
                // ignore quota exceeded if any
              }
            }
          }
        }
        window.dispatchEvent(
          new CustomEvent('mansion_characters_updated', { detail: data })
        );
      }
    );

    const handleClientAvatarSync = (e: Event) => {
      const custom = e as CustomEvent<{ characters: Record<string, string> }>;
      if (custom.detail?.characters && socket.connected) {
        socket.emit('sync_avatars', { characters: custom.detail.characters });
      }
    };
    window.addEventListener('mansion_sync_avatars_to_server', handleClientAvatarSync);

    return () => {
      window.removeEventListener('mansion_sync_avatars_to_server', handleClientAvatarSync);
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback(
    (playerName: string, targetRoomId?: string) => {
      if (!socketRef.current) return;
      const cleanName = playerName.trim() || '客人';
      const cleanRoom = targetRoomId || roomId || '01';
      sessionStorage.setItem('mansion_player_name', cleanName);
      localStorage.setItem('mansion_player_name', cleanName);
      setRoomId(cleanRoom);
      socketRef.current.emit('join_room', {
        playerName: cleanName,
        roomId: cleanRoom,
      });
    },
    [roomId]
  );

  const leaveRoom = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave_room');
    setPlayerId('');
    setGameState(null);
    setPrivateState({});
    sessionStorage.removeItem('mansion_player_id');
    localStorage.removeItem('mansion_player_id');
    socketRef.current.emit('request_rooms_summary');
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('start_game');
  }, []);

  const fillBots = useCallback(() => {
    socketRef.current?.emit('fill_bots');
  }, []);

  const removeBots = useCallback(() => {
    socketRef.current?.emit('remove_bots');
  }, []);

  const proceedToDraft = useCallback(() => {
    socketRef.current?.emit('proceed_to_draft');
  }, []);

  const draftAction = useCallback((chosenRole: Role) => {
    socketRef.current?.emit('draft_action', { chosenRole });
  }, []);

  const toggleReady = useCallback(() => {
    socketRef.current?.emit('toggle_ready');
  }, []);

  const kitsuneDeclare = useCallback(() => {
    socketRef.current?.emit('kitsune_declare');
  }, []);

  const submitVote = useCallback((thiefTarget: string, kitsuneTarget: string) => {
    socketRef.current?.emit('submit_vote', { thiefTarget, kitsuneTarget });
  }, []);

  const submitSalvationGuess = useCallback((guess: string) => {
    socketRef.current?.emit('submit_salvation_guess', { guess });
  }, []);

  const rematch = useCallback(() => {
    socketRef.current?.emit('rematch');
  }, []);

  const resetRoom = useCallback(() => {
    socketRef.current?.emit('reset_room');
  }, []);

  const kickPlayer = useCallback((targetPlayerId: string) => {
    socketRef.current?.emit('kick_player', { targetPlayerId });
  }, []);

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit('send_chat', { text });
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const setRoleConfig = useCallback((includeProdigy: boolean) => {
    socketRef.current?.emit('set_role_config', { includeProdigy });
  }, []);

  const refreshRooms = useCallback(() => {
    socketRef.current?.emit('request_rooms_summary');
  }, []);

  const currentPlayer = gameState?.players.find((p) => p.id === playerId);
  const isHost = !!currentPlayer?.isHost;

  return {
    isConnected,
    gameState,
    privateState,
    chatMessages,
    playerId,
    roomId,
    setRoomId,
    roomsSummary,
    currentPlayer,
    isHost,
    errorMessage,
    joinRoom,
    leaveRoom,
    startGame,
    fillBots,
    removeBots,
    kickPlayer,
    proceedToDraft,
    draftAction,
    toggleReady,
    kitsuneDeclare,
    submitVote,
    submitSalvationGuess,
    rematch,
    resetRoom,
    sendChat,
    clearError,
    setRoleConfig,
    refreshRooms,
  };
}
