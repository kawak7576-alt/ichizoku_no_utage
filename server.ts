import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';
import { GameRoom } from './server/gameLogic.ts';
import { Role } from './src/types/game.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Rooms store in memory
const rooms = new Map<string, GameRoom>();

// Unified single room ID so all players gather in the same room automatically
const UNIFIED_ROOM_ID = 'MANSION';

function getOrCreateRoom(roomId: string = UNIFIED_ROOM_ID): GameRoom {
  let room = rooms.get(UNIFIED_ROOM_ID);
  if (!room) {
    room = new GameRoom(UNIFIED_ROOM_ID);
    room.onStateChange = () => {
      broadcastRoomState(room!);
    };
    rooms.set(UNIFIED_ROOM_ID, room);
  }
  return room;
}

function broadcastRoomState(room: GameRoom) {
  const publicState = room.getPublicState();
  io.to(`room_${room.id}`).emit('game_state', publicState);

  // Send personalized private state to each player's individual socket
  for (const player of room.players.values()) {
    if (player.isConnected && !player.isBot) {
      const privateState = room.getPrivateState(player.id);
      io.to(player.socketId).emit('private_state', privateState);
    }
  }
}

// REST API for room validation or quick health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

// Download source code ZIP endpoint for exporting to GitHub
app.get('/api/download-zip', (req, res) => {
  const zipPath = path.resolve(__dirname, 'ichizoku-no-utage.zip');
  try {
    // Regenerate zip fresh to capture any new edits
    execSync('python3 scripts/create_zip.py', { cwd: __dirname });
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="ichizoku-no-utage.zip"'
      );
      res.sendFile(zipPath);
    } else {
      res.status(500).send('ZIP file could not be generated.');
    }
  } catch (err) {
    console.error('Error generating zip:', err);
    res.status(500).send('Error generating zip');
  }
});

// Socket.io handling
io.on('connection', (socket: Socket) => {
  let currentPlayerId: string | null = null;
  let currentRoomId: string | null = null;

  socket.on(
    'join_room',
    (data: { roomId?: string; playerName: string; playerId?: string }) => {
      const { playerName, playerId } = data;
      const room = getOrCreateRoom(UNIFIED_ROOM_ID);

      // Reconnect check
      let player = playerId ? room.getPlayer(playerId) : undefined;

      if (player) {
        // Reconnection successful
        player.socketId = socket.id;
        player.isConnected = true;
        if (playerName && !player.isBot) {
          player.name = playerName.trim() || player.name;
        }
      } else {
        // New player
        if (room.phase !== 'lobby') {
          socket.emit('error_message', 'ゲームが既に進行中のため参加できません');
          return;
        }
        if (room.players.size >= 5) {
          socket.emit('error_message', '定員（5名）に達しています');
          return;
        }

        const cleanName = (playerName || '客人').trim().substring(0, 12);
        player = room.addPlayer(cleanName, socket.id, false);
      }

      currentPlayerId = player.id;
      currentRoomId = room.id;

      socket.join(`room_${room.id}`);

      socket.emit('room_joined', {
        roomId: room.id,
        playerId: player.id,
        isHost: player.isHost,
      });

      // Send recent chat
      socket.emit('chat_history', room.chatMessages);

      broadcastRoomState(room);
    }
  );

  socket.on('reset_room', () => {
    const room = getOrCreateRoom(UNIFIED_ROOM_ID);
    room.resetForRematch();
    room.addSystemMessage('ゲームがリセットされ、マッチング画面に戻りました。');
    broadcastRoomState(room);
  });

  socket.on('start_game', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player || !player.isHost) return;

    if (room.players.size !== 5) {
      socket.emit('error_message', '5人揃うまでゲームを開始できません');
      return;
    }

    if (room.startGame()) {
      broadcastRoomState(room);
    }
  });

  socket.on('fill_bots', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player || !player.isHost) return;

    room.fillWithBots();
    broadcastRoomState(room);
  });

  socket.on('remove_bots', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player || !player.isHost) return;

    room.removeBots();
    broadcastRoomState(room);
  });

  socket.on('proceed_to_draft', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.proceedToDrafting();
    broadcastRoomState(room);
  });

  socket.on('draft_action', (data: { chosenRole: Role }) => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const ok = room.handleDraftAction(currentPlayerId, data.chosenRole);
    if (ok) {
      broadcastRoomState(room);
    }
  });

  socket.on('toggle_ready', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.toggleReady(currentPlayerId);
    broadcastRoomState(room);
  });

  socket.on('kitsune_declare', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.toggleKitsuneDeclared(currentPlayerId);
    // Send updated private state
    const privateState = room.getPrivateState(currentPlayerId);
    socket.emit('private_state', privateState);
  });

  socket.on(
    'submit_vote',
    (data: { thiefTarget: string; kitsuneTarget: string }) => {
      if (!currentRoomId || !currentPlayerId) return;
      const room = rooms.get(currentRoomId);
      if (!room) return;

      const ok = room.submitVote(
        currentPlayerId,
        data.thiefTarget,
        data.kitsuneTarget
      );
      if (ok) {
        broadcastRoomState(room);
      }
    }
  );

  socket.on('submit_salvation_guess', (data: { guess: string }) => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    const ok = room.submitSalvationGuess(currentPlayerId, data.guess);
    if (ok) {
      broadcastRoomState(room);
    }
  });

  socket.on('rematch', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    room.resetForRematch();
    broadcastRoomState(room);
  });

  socket.on('send_chat', (data: { text: string }) => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player) return;

    const cleanText = (data.text || '').trim();
    if (!cleanText) return;

    const msg = room.addMessage(player.id, player.name, cleanText);
    io.to(`room_${room.id}`).emit('new_message', msg);
  });

  socket.on('disconnect', () => {
    if (currentRoomId && currentPlayerId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        const player = room.getPlayer(currentPlayerId);
        if (player) {
          player.isConnected = false;
          broadcastRoomState(room);
        }
      }
    }
  });
});

// Setup Vite or static serving
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} (prod=${isProd})`);
});
