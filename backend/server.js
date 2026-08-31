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

  // Automatically initialize database schema tables
  const initDb = async () => {
    try {
      // Create tokens table (platform launchpad tokens being built)
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS tokens (
          id SERIAL PRIMARY KEY,
          symbol VARCHAR(50) NOT NULL,
          name VARCHAR(100) NOT NULL,
          address VARCHAR(100) UNIQUE NOT NULL,
          launchpad VARCHAR(100) NOT NULL,
          image TEXT DEFAULT '',
          price NUMERIC(30, 12) DEFAULT 0,
          change24h NUMERIC(10, 2) DEFAULT 0,
          volume24h NUMERIC(20, 2) DEFAULT 0,
          liquidity NUMERIC(20, 2) DEFAULT 0,
          holders INT DEFAULT 0,
          supply NUMERIC(30, 0) DEFAULT 0,
          bonding_progress INT DEFAULT 0,
          is_platform_launchpad_token BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create bonded_tokens table (platform launchpad tokens that hit 100% bonding and graduated to DEX)
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS bonded_tokens (
          id SERIAL PRIMARY KEY,
          symbol VARCHAR(50) NOT NULL,
          name VARCHAR(100) NOT NULL,
          address VARCHAR(100) UNIQUE NOT NULL,
          launchpad VARCHAR(100) NOT NULL,
          image TEXT DEFAULT '',
          price NUMERIC(30, 12) DEFAULT 0,
          change24h NUMERIC(10, 2) DEFAULT 0,
          volume24h NUMERIC(20, 2) DEFAULT 0,
          liquidity NUMERIC(20, 2) DEFAULT 0,
          holders INT DEFAULT 0,
          supply NUMERIC(30, 0) DEFAULT 0,
          dex_address VARCHAR(200) DEFAULT '',
          graduated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create whales table with CamelCase fields matching frontend
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS whales (
          id SERIAL PRIMARY KEY,
          address VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          "winRate" NUMERIC(5, 2) DEFAULT 0,
          "roi30d" NUMERIC(10, 2) DEFAULT 0,
          "pnl30d" NUMERIC(15, 2) DEFAULT 0,
          "trades30d" INT DEFAULT 0,
          tag VARCHAR(100) DEFAULT '',
          "avgEntryTime" VARCHAR(50) DEFAULT ''
        );
      `);
      
      console.log("🟢 PostgreSQL database schema initialized successfully.");
      
      // Seed initial whales if empty
      const whaleCountRes = await pgPool.query('SELECT COUNT(*) FROM whales');
      if (parseInt(whaleCountRes.rows[0].count, 10) === 0) {
        console.log("🌱 Seeding initial smart money whale profiles into Postgres...");
        const seedWhalesQuery = `
          INSERT INTO whales (address, name, "winRate", "roi30d", "pnl30d", "trades30d", tag, "avgEntryTime")
          VALUES 
            ('EQC5a7d3_dogs_community_top_whale', 'TON Whale Alpha', 88.5, 245.2, 142500, 142, 'Early Sniper', '11 mins'),
            ('EQD4v9b2_gramfinity_insider_whale', 'Smart Money Jetton', 74.2, 118.4, 68200, 89, 'High Yield Maker', '17 mins'),
            ('EQB8v9c2_gram_pow_jetton_whale', 'Meme Degen 99', 59.8, 582.1, 215600, 412, 'Degen Master', '6 mins'),
            ('EQC2a4b2_notcoin_early_whale', 'Venture Insider', 67.5, 42.8, 38100, 54, 'Position Holder', '34 mins')
          ON CONFLICT DO NOTHING;
        `;
        await pgPool.query(seedWhalesQuery);
      }
    } catch (err) {
      console.error("❌ Failed to initialize database schema:", err.message);
    }
  };
  initDb();
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
      const result = await pgPool.query(`
        SELECT
          id, symbol, name, address, launchpad,
          COALESCE(image, '') AS image,
          COALESCE(price, 0) AS price,
          COALESCE(change24h, 0) AS change24h,
          COALESCE(volume24h, 0) AS volume24h,
          COALESCE(liquidity, 0) AS liquidity,
          COALESCE(holders, 0) AS holders,
          COALESCE(supply, 0) AS supply,
          COALESCE(bonding_progress, 0) AS bonding_progress,
          COALESCE(is_platform_launchpad_token, TRUE) AS is_platform_launchpad_token,
          created_at
        FROM tokens
        ORDER BY created_at DESC
        LIMIT 100
      `);
      res.json(result.rows);
    } else {
      if (!fs.existsSync(dbFallbackPath)) return res.json([]);
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      res.json(data.tokens || []);
    }
  } catch (error) {
    console.error("❌ Failed to query tokens:", error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: Get Bonded Tokens (platform launchpad tokens that graduated to DEX at 100% bonding)
app.get('/api/bonded', async (req, res) => {
  try {
    if (pgPool) {
      const result = await pgPool.query(`
        SELECT
          id, symbol, name, address, launchpad,
          COALESCE(image, '') AS image,
          COALESCE(price, 0) AS price,
          COALESCE(change24h, 0) AS change24h,
          COALESCE(volume24h, 0) AS volume24h,
          COALESCE(liquidity, 0) AS liquidity,
          COALESCE(holders, 0) AS holders,
          COALESCE(supply, 0) AS supply,
          COALESCE(dex_address, '') AS dex_address,
          graduated_at
        FROM bonded_tokens
        ORDER BY graduated_at DESC
        LIMIT 100
      `);
      res.json(result.rows);
    } else {
      if (!fs.existsSync(dbFallbackPath)) return res.json([]);
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      res.json(data.bonded_tokens || []);
    }
  } catch (error) {
    console.error('❌ Failed to query bonded_tokens:', error.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// API: Get Whale details
app.get('/api/whales', async (req, res) => {
  try {
    if (pgPool) {
      const result = await pgPool.query('SELECT * FROM whales ORDER BY "roi30d" DESC');
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

// Serve static files from the React frontend app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve index.html for frontend single-page routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
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
