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
app.use(express.json({ limit: '50mb' }));

// Ensure public/characters directory exists
const charactersDir = path.resolve(__dirname, 'public', 'characters');
if (!fs.existsSync(charactersDir)) {
  fs.mkdirSync(charactersDir, { recursive: true });
}

// Permanent avatar storage file path (included in git and zip)
const savedAvatarsJsonPath = path.resolve(__dirname, 'server', 'saved_avatars.json');
let memoryCustomAvatars: Record<string, string> = {};

function loadSavedAvatars() {
  try {
    if (fs.existsSync(savedAvatarsJsonPath)) {
      const content = fs.readFileSync(savedAvatarsJsonPath, 'utf-8');
      const data = JSON.parse(content);
      if (data && typeof data === 'object') {
        memoryCustomAvatars = data;
        const distCharsDir = path.resolve(__dirname, 'dist', 'characters');
        const hasDist = fs.existsSync(path.resolve(__dirname, 'dist'));
        if (hasDist && !fs.existsSync(distCharsDir)) {
          fs.mkdirSync(distCharsDir, { recursive: true });
        }
        for (const [id, dataUrl] of Object.entries(memoryCustomAvatars)) {
          if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
            const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
            const buf = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(path.join(charactersDir, `${id}.png`), buf);
            if (hasDist) {
              fs.writeFileSync(path.join(distCharsDir, `${id}.png`), buf);
            }
          }
        }
        console.log(`Loaded ${Object.keys(memoryCustomAvatars).length} avatars from saved_avatars.json`);
      }
    }
  } catch (err) {
    console.error('Error loading saved avatars:', err);
  }
}
loadSavedAvatars();

function persistAvatars(characters: Record<string, string>) {
  memoryCustomAvatars = { ...memoryCustomAvatars, ...characters };
  const distCharsDir = path.resolve(__dirname, 'dist', 'characters');
  const hasDist = fs.existsSync(path.resolve(__dirname, 'dist'));
  if (hasDist && !fs.existsSync(distCharsDir)) {
    fs.mkdirSync(distCharsDir, { recursive: true });
  }

  const savedKeys: string[] = [];
  for (const [id, dataUrl] of Object.entries(characters)) {
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buf = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(path.join(charactersDir, `${id}.png`), buf);
      if (hasDist) {
        fs.writeFileSync(path.join(distCharsDir, `${id}.png`), buf);
      }
      savedKeys.push(id);
    }
  }

  try {
    const sDir = path.dirname(savedAvatarsJsonPath);
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir, { recursive: true });
    fs.writeFileSync(savedAvatarsJsonPath, JSON.stringify(memoryCustomAvatars));
  } catch (e) {
    console.error('Failed to write saved_avatars.json:', e);
  }

  io.emit('characters_updated', {
    timestamp: Date.now(),
    available: Object.keys(memoryCustomAvatars),
    characters: memoryCustomAvatars,
  });

  return savedKeys;
}

// Serve static assets from public folder
app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/characters', express.static(charactersDir));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
  pingInterval: 25000,
  pingTimeout: 45000,
  connectTimeout: 45000,
});

const isSocketAlive = (socketId: string) => io.sockets.sockets.has(socketId);

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Rooms store in memory (Rooms '01' to '10')
const rooms = new Map<string, GameRoom>();

// Normalize room number: '01' to '10', default '01'
function normalizeRoomId(raw?: string): string {
  if (!raw) return '01';
  const clean = String(raw).replace(/[^0-9]/g, '');
  if (!clean) return '01';
  let num = parseInt(clean, 10);
  if (isNaN(num) || num < 1) num = 1;
  if (num > 10) num = 10;
  return num < 10 ? `0${num}` : `${num}`;
}

function getOrCreateRoom(rawId?: string): GameRoom {
  const normId = normalizeRoomId(rawId);
  let room = rooms.get(normId);
  if (!room) {
    room = new GameRoom(normId);
    room.onStateChange = () => {
      broadcastRoomState(room!);
      broadcastRoomsSummary();
    };
    rooms.set(normId, room);
  }
  return room;
}

function getRoomsSummary() {
  const summary = [];
  for (let i = 1; i <= 10; i++) {
    const rId = i < 10 ? `0${i}` : `${i}`;
    const room = rooms.get(rId);
    summary.push({
      roomId: rId,
      playerCount: room ? room.players.size : 0,
      phase: room ? room.phase : 'lobby',
    });
  }
  return summary;
}

function broadcastRoomsSummary() {
  io.emit('rooms_summary', getRoomsSummary());
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

// Rooms status list (01 to 10)
app.get('/api/rooms', (req, res) => {
  res.json({ rooms: getRoomsSummary() });
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

// Upload cropped character sheet images (9 characters)
app.post('/api/upload-character-sheet', (req, res) => {
  try {
    const { characters } = req.body; // Record<string, string (dataURL)>
    if (!characters || typeof characters !== 'object') {
      return res.status(400).json({ error: 'Invalid characters object' });
    }

    const savedKeys = persistAvatars(characters);
    console.log(`Saved ${savedKeys.length} character images into ${charactersDir}`);
    res.json({ success: true, count: savedKeys.length, saved: savedKeys });
  } catch (err) {
    console.error('Error saving character sheet:', err);
    res.status(500).json({ error: 'Failed to save character images' });
  }
});

// Get all uploaded character data URLs (for instant sync on mobile)
app.get('/api/characters/all', (req, res) => {
  res.json({ characters: memoryCustomAvatars });
});

// List available uploaded character images
app.get('/api/characters/list', (req, res) => {
  try {
    if (!fs.existsSync(charactersDir)) {
      return res.json({ available: [] });
    }
    const files = fs.readdirSync(charactersDir);
    const available = files
      .filter((f) => f.endsWith('.png') || f.endsWith('.jpg'))
      .map((f) => path.parse(f).name);
    res.json({ available });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list character images' });
  }
});

// Socket.io handling
io.on('connection', (socket: Socket) => {
  let currentPlayerId: string | null = null;
  let currentRoomId: string | null = null;

  // Immediately send initial rooms status (01 to 10)
  socket.emit('rooms_summary', getRoomsSummary());

  socket.on('request_rooms_summary', () => {
    socket.emit('rooms_summary', getRoomsSummary());
  });

  // Immediately inform new connection of all custom avatars
  if (Object.keys(memoryCustomAvatars).length > 0) {
    socket.emit('characters_updated', {
      timestamp: Date.now(),
      available: Object.keys(memoryCustomAvatars),
      characters: memoryCustomAvatars,
    });
  }

  // Client syncs its local storage avatars to server (handles server reboot / waking up from sleep)
  socket.on('sync_avatars', (data: { characters: Record<string, string> }) => {
    if (data?.characters && typeof data.characters === 'object') {
      const keys = Object.keys(data.characters);
      if (keys.length > 0) {
        // If server has fewer avatars, persist and broadcast
        persistAvatars(data.characters);
        console.log(`Synced ${keys.length} avatars from client`);
      }
    }
  });

  socket.on('request_avatars', () => {
    socket.emit('characters_updated', {
      timestamp: Date.now(),
      available: Object.keys(memoryCustomAvatars),
      characters: memoryCustomAvatars,
    });
  });

  socket.on(
    'join_room',
    (data: { roomId?: string; playerName: string; playerId?: string }) => {
      const targetRoomId = normalizeRoomId(data?.roomId);
      const room = getOrCreateRoom(targetRoomId);

      // Leave previous room if changing room
      if (currentRoomId && currentRoomId !== room.id) {
        socket.leave(`room_${currentRoomId}`);
        const prevRoom = rooms.get(currentRoomId);
        if (prevRoom && prevRoom.phase === 'lobby' && currentPlayerId) {
          prevRoom.removePlayer(currentPlayerId);
          prevRoom.ensureActiveHost();
          broadcastRoomState(prevRoom);
        }
      }

      // In lobby phase, clean up stale disconnected ghost players first
      if (room.phase === 'lobby') {
        room.cleanDisconnectedInLobby(isSocketAlive);
      }

      // Reconnect check
      let player = data.playerId ? room.getPlayer(data.playerId) : undefined;

      if (player) {
        // Reconnection successful
        player.socketId = socket.id;
        player.isConnected = true;
        if (data.playerName && !player.isBot) {
          player.name = data.playerName.trim() || player.name;
        }
        room.ensureActiveHost();
      } else {
        // New player
        if (room.phase !== 'lobby') {
          // If room has no active connected humans, auto-reset so returning user can play
          const hasConnectedHuman = Array.from(room.players.values()).some(
            (p) => p.isConnected && !p.isBot && isSocketAlive(p.socketId)
          );
          if (!hasConnectedHuman) {
            room.resetForRematch();
            room.players.clear();
          } else {
            socket.emit('error_message', `部屋 #${room.id} はゲームが既に進行中のため参加できません`);
            return;
          }
        }

        // If bots filled the room in lobby, kick bots to make space for humans
        if (room.players.size >= 5) {
          const bots = Array.from(room.players.values()).filter((p) => p.isBot);
          if (bots.length > 0) {
            room.removePlayer(bots[bots.length - 1].id);
          } else {
            // Also check if any inactive humans can be cleaned
            room.cleanDisconnectedInLobby(isSocketAlive);
            if (room.players.size >= 5) {
              socket.emit('error_message', `部屋 #${room.id} は定員（5名）に達しています`);
              return;
            }
          }
        }

        const cleanName = (data.playerName || '客人').trim().substring(0, 12);
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
      broadcastRoomsSummary();
    }
  );

  socket.on('leave_room', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (room) {
      socket.leave(`room_${room.id}`);
      if (room.phase === 'lobby') {
        room.removePlayer(currentPlayerId);
        room.ensureActiveHost();
        broadcastRoomState(room);
        broadcastRoomsSummary();
      }
    }
    currentRoomId = null;
    currentPlayerId = null;
  });

  socket.on('reset_room', () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;

    // Reset game state and clear all players so everyone exits and re-enters
    room.resetForRematch();
    room.players.clear();

    const resetMsg = `部屋 #${room.id} がリセットされました。全員一度退出しました。再入室してください。`;
    io.to(`room_${room.id}`).emit('room_reset', {
      roomId: room.id,
      message: resetMsg,
    });

    // Make all connected clients in this room leave the socket room
    io.in(`room_${room.id}`).socketsLeave(`room_${room.id}`);

    currentRoomId = null;
    currentPlayerId = null;

    broadcastRoomState(room);
    broadcastRoomsSummary();
  });

  socket.on('start_game', () => {
    if (!currentRoomId || !currentPlayerId) {
      socket.emit('error_message', '部屋に参加していません');
      return;
    }
    const room = rooms.get(currentRoomId);
    if (!room) {
      socket.emit('error_message', '部屋が見つかりません');
      return;
    }
    const player = room.getPlayer(currentPlayerId);
    if (!player) {
      socket.emit('error_message', 'プレイヤー情報が見つかりません');
      return;
    }

    room.ensureActiveHost();

    if (room.players.size !== 5) {
      socket.emit(
        'error_message',
        `5人揃うまで開始できません（現在 ${room.players.size}/5人）`
      );
      return;
    }

    if (room.startGame()) {
      room.addSystemMessage('屋敷の宴が開始されました！');
      broadcastRoomState(room);
      broadcastRoomsSummary();
    } else {
      socket.emit('error_message', 'ゲームを開始できませんでした');
    }
  });

  socket.on('fill_bots', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player) return;

    room.cleanDisconnectedInLobby(isSocketAlive);
    if (room.phase === 'lobby') {
      player.isHost = true;
      room.ensureActiveHost();
      room.fillWithBots();
      broadcastRoomState(room);
    }
  });

  socket.on('remove_bots', () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    const player = room.getPlayer(currentPlayerId);
    if (!player) return;

    if (room.phase === 'lobby') {
      room.removeBots();
      room.ensureActiveHost();
      broadcastRoomState(room);
    }
  });

  socket.on('kick_player', (data: { targetPlayerId: string }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room || room.phase !== 'lobby') return;
    if (data?.targetPlayerId) {
      room.removePlayer(data.targetPlayerId);
      room.cleanDisconnectedInLobby(isSocketAlive);
      broadcastRoomState(room);
    }
  });

  socket.on('set_role_config', (data: { includeProdigy: boolean }) => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.includeProdigy = !!data.includeProdigy;
    const msg = room.includeProdigy
      ? '【役職設定】秀才あり（秀才1 / 学生3 / 怪盗1 / 妖狐1）に設定されました。'
      : '【役職設定】秀才なし（学生4 / 怪盗1 / 妖狐1）に設定されました。';
    room.addSystemMessage(msg);
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

          // Grace period for mobile reconnections: wait 15 seconds before cleaning up lobby seats
          const pId = currentPlayerId;
          setTimeout(() => {
            if (room.phase === 'lobby') {
              const curP = room.getPlayer(pId);
              if (curP && !curP.isConnected && !curP.isBot) {
                room.removePlayer(pId);
                room.cleanDisconnectedInLobby(isSocketAlive);
                broadcastRoomState(room);
              }
            } else {
              room.ensureActiveHost();
              broadcastRoomState(room);
            }
          }, 15000);
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
