import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ChatMessage,
  GameStatePublic,
  PlayerPrivate,
  Role,
} from '../types/game.ts';

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameStatePublic | null>(null);
  const [privateState, setPrivateState] = useState<PlayerPrivate>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playerId, setPlayerId] = useState<string>(() => {
    return sessionStorage.getItem('mansion_player_id') || '';
  });
  const [roomId, setRoomId] = useState<string>('MANSION');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const socket = io({
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Auto-reconnect if we have playerId & playerName
      const savedPlayer = sessionStorage.getItem('mansion_player_id');
      const savedName = sessionStorage.getItem('mansion_player_name');
      if (savedPlayer) {
        socket.emit('join_room', {
          playerName: savedName || '客人',
          playerId: savedPlayer,
        });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room_joined', (data: { roomId: string; playerId: string; isHost: boolean }) => {
      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      sessionStorage.setItem('mansion_room_id', data.roomId);
      sessionStorage.setItem('mansion_player_id', data.playerId);

      // Clean URL if any query param was present
      if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    });

    socket.on('game_state', (state: GameStatePublic) => {
      setGameState(state);
    });

    socket.on('private_state', (pState: PlayerPrivate) => {
      setPrivateState((prev) => ({ ...prev, ...pState }));
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

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback(
    (playerName: string) => {
      if (!socketRef.current) return;
      const cleanName = playerName.trim() || '客人';
      sessionStorage.setItem('mansion_player_name', cleanName);
      socketRef.current.emit('join_room', {
        playerName: cleanName,
        playerId: playerId || undefined,
      });
    },
    [playerId]
  );

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

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit('send_chat', { text });
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
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
    currentPlayer,
    isHost,
    errorMessage,
    joinRoom,
    startGame,
    fillBots,
    removeBots,
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
  };
}
