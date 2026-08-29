/**
 * Gramfinity Express API & WebSockets Broadcast Server
 * Automatically falls back to local JSON database for zero-config testing.
 */
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// Local fallback DB setup
const dbFallbackPath = path.join(__dirname, 'database_fallback.json');

let pgPool;
if (process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: pgPool ? 'postgres' : 'local-json', timestamp: new Date() });
});

// API: Get Deployed Tokens list (Discovery)
app.get('/api/tokens', async (req, res) => {
  try {
    if (pgPool) {
      const result = await pgPool.query('SELECT * FROM tokens ORDER BY created_at DESC LIMIT 50');
      res.json(result.rows);
    } else {
      if (!fs.existsSync(dbFallbackPath)) {
        return res.json([]);
      }
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      res.json(data.tokens || []);
    }
  } catch (error) {
    console.error("❌ Failed to query tokens:", error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: Get Whale details
app.get('/api/whales', async (req, res) => {
  try {
    if (pgPool) {
      const result = await pgPool.query('SELECT * FROM whales ORDER BY roi_30d DESC');
      res.json(result.rows);
    } else {
      if (!fs.existsSync(dbFallbackPath)) {
        return res.json([]);
      }
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      res.json(data.whales || []);
    }
  } catch (error) {
    console.error("❌ Failed to query whales:", error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// WebSocket connection events
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to WebSockets: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Broadcast event to all listening clients (Triggered by indexer webhook updates)
app.post('/api/webhook/broadcast', (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) {
    return res.status(400).json({ error: 'Missing broadcast parameters' });
  }

  // Push new updates directly to all active frontend browsers
  io.emit(type, data);
  console.log(`📢 Broadcasted WebSocket event type [${type}] to client instances.`);
  res.json({ success: true });
});

// Spawn block indexer child process by default
if (process.env.DISABLE_INDEXER !== 'true') {
  const { fork } = require('child_process');
  console.log('🤖 Spawning block indexer child process...');
  const spawnIndexer = () => {
    const indexerProcess = fork(path.join(__dirname, 'indexer.js'));
    indexerProcess.on('error', (err) => {
      console.error('❌ Indexer child process error:', err.message);
    });
    indexerProcess.on('exit', (code) => {
      console.warn(`⚠️ Indexer child process exited with code ${code}. Re-spawning in 5 seconds...`);
      setTimeout(spawnIndexer, 5000);
    });
  };
  spawnIndexer();
}

// Start listening
server.listen(PORT, () => {
  console.log(`🚀 Gramfinity server running in ${pgPool ? 'Production Postgres' : 'Local JSON Fallback'} mode on port ${PORT}`);
});
