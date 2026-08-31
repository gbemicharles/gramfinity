/**
 * Gramfinity Live TON Blockchain Indexer
 * Connects to live TON block streams using TonAPI Server-Sent Events (SSE)
 * Fetches REAL token metadata (name, symbol, image, price) from TonAPI before saving to DB.
 */
require('dotenv').config();
const EventSource = require('eventsource');
const { Pool } = require('pg');
const { TonClient, Address } = require('@ton/ton');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Local database fallback setup
const dbFallbackPath = path.join(__dirname, 'database_fallback.json');
if (!fs.existsSync(dbFallbackPath)) {
  fs.writeFileSync(dbFallbackPath, JSON.stringify({ tokens: [], whales: [] }, null, 2));
}

let pgPool;
if (process.env.DATABASE_URL) {
  pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  // Ensure tokens table has full metadata columns
  pgPool.query(`
    ALTER TABLE tokens
      ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS price NUMERIC(30, 12) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS change24h NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS volume24h NUMERIC(20, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS liquidity NUMERIC(20, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS holders INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS supply NUMERIC(30, 0) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_platform_launchpad_token BOOLEAN DEFAULT TRUE;
  `).then(() => {
    console.log('🟢 tokens table schema up to date.');
  }).catch(err => {
    // Columns may already exist — safe to ignore
    console.log('ℹ️ tokens schema already has extended columns or DB not ready yet:', err.message);
  });
}

// Setup live TON RPC client
const client = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  apiKey: process.env.TONCENTER_API_KEY
});

const TONAPI_KEY = process.env.TONAPI_KEY || 'AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI';

// Launchpad factory registry
const LAUNCHPAD_FACTORIES = {
  gaspump: process.env.GASPUMP_FACTORY || "EQBX1bp2j2y8tbw0KDaxFPADrBRWLbsPvSK0fF6jZKK_aEIs",
  blum: process.env.BLUM_FACTORY || "EQBdyhUFxfqSHPvr38VOK9Wvo3ZE7Ih-MoAEhx2sEPqrb4Fv",
  pocketfi: process.env.POCKETFI_FACTORY || "EQC_PocketFi_Factory_Address_Placeholder",
  topblast: process.env.TOPBLAST_FACTORY || "EQAmkd4Pd_xgUW4b9MLrygf0SOfR2EUVa_iCtVWGnYB2hItG",
  uranus: process.env.URANUS_FACTORY || "EQE_Uranus_Factory_Address_Placeholder",
  stonks: process.env.STONKS_FACTORY || "EQAmTDBEcOvTfakgld4aNsa8VWidZtGiN6wTJW5PWkBJa3Pp,EQCLvyQZCt9hoitq1xfbQNrGN43Wv2as4wHdJf5A9C-KY_2e"
};

const LAUNCHPAD_LABEL = {
  gaspump: 'Gaspump',
  blum: 'Blum Launch',
  pocketfi: 'PocketFi',
  topblast: 'TopBlast.lol',
  uranus: 'Uranus',
  stonks: 'sTONks'
};

// Check if an address string is a valid TON address
const isValidAddress = (addr) => {
  try {
    Address.parse(addr.trim());
    return !addr.includes('_Placeholder');
  } catch (e) {
    return false;
  }
};

const flattenedFactories = [];

// Fetch real token metadata from TonAPI by jetton master address
async function fetchTokenMetadata(tokenAddress) {
  return new Promise((resolve) => {
    const url = `https://tonapi.io/v2/jettons/${encodeURIComponent(tokenAddress)}`;
    const req = https.get(url, {
      headers: { 'Authorization': `Bearer ${TONAPI_KEY}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const meta = data.metadata || {};
          resolve({
            symbol: meta.symbol || 'UNKNOWN',
            name: meta.name || meta.symbol || 'Unknown Token',
            image: meta.image || meta.image_data || '',
            decimals: parseInt(meta.decimals || '9', 10),
            description: meta.description || '',
            totalSupply: data.total_supply ? parseInt(data.total_supply) / Math.pow(10, parseInt(meta.decimals || '9')) : 0,
            holders: data.holders_count || 0,
          });
        } catch (e) {
          console.error('❌ Failed to parse TonAPI metadata response:', e.message);
          resolve(null);
        }
      });
    });
    req.on('error', (e) => {
      console.error('❌ TonAPI metadata fetch error:', e.message);
      resolve(null);
    });
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// Fetch token price from GeckoTerminal or TonAPI rates
async function fetchTokenPrice(tokenAddress) {
  return new Promise((resolve) => {
    const url = `https://tonapi.io/v2/rates?tokens=${encodeURIComponent(tokenAddress)}&currencies=usd`;
    const req = https.get(url, {
      headers: { 'Authorization': `Bearer ${TONAPI_KEY}` }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const rates = data.rates || {};
          const tokenRates = Object.values(rates)[0];
          const price = tokenRates?.prices?.USD || 0;
          resolve(parseFloat(price) || 0);
        } catch (e) {
          resolve(0);
        }
      });
    });
    req.on('error', () => resolve(0));
    req.setTimeout(6000, () => { req.destroy(); resolve(0); });
  });
}

// Start indexer pipeline
function startIndexer() {
  console.log("⚡ Starting Gramfinity Multi-Launchpad Indexer...");

  flattenedFactories.length = 0;
  Object.entries(LAUNCHPAD_FACTORIES).forEach(([key, val]) => {
    const addrs = val.split(',');
    addrs.forEach(addr => {
      const cleanAddr = addr.trim();
      if (isValidAddress(cleanAddr)) {
        flattenedFactories.push({ key, address: cleanAddr });
        console.log(`  ✅ Watching launchpad: ${key} @ ${cleanAddr}`);
      } else {
        console.log(`  ℹ️ Skipping placeholder: ${cleanAddr}`);
      }
    });
  });

  if (flattenedFactories.length === 0) {
    console.log("⚠️ No valid live launchpad contract addresses. Starting local simulation...");
    startSimulatedIndexerLoop();
    return;
  }

  const factoryAddresses = flattenedFactories.map(f => f.address).join(',');
  const sseUrl = `https://tonapi.io/v2/sse/accounts/transactions?accounts=${factoryAddresses}`;
  const headers = { 'Authorization': `Bearer ${TONAPI_KEY}` };

  const eventSource = new EventSource(sseUrl, { headers });

  eventSource.onopen = () => {
    console.log("🟢 Connected to live TON Blockchain Stream (TonAPI SSE).");
  };

  eventSource.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      await processTransactionEvent(data);
    } catch (err) {
      console.error("❌ Error parsing SSE event:", err.message);
    }
  };

  eventSource.onerror = (err) => {
    console.error("❌ Stream error. Reconnecting in 5s...", err);
    setTimeout(startIndexer, 5000);
  };
}

// Process transaction events from SSE stream
async function processTransactionEvent(tx) {
  if (!tx || !tx.success) return;

  const matched = flattenedFactories.find(
    f => Address.parse(f.address).equals(Address.parse(tx.account.address))
  );
  if (!matched) return;

  console.log(`🎯 Transaction on launchpad: [${matched.key}]`);

  if (tx.out_msgs && tx.out_msgs.length > 0) {
    for (const outMsg of tx.out_msgs) {
      if (outMsg.destination) {
        const tokenAddress = Address.parse(outMsg.destination.address).toString();
        console.log(`🚀 New launch on ${matched.key}: ${tokenAddress}`);
        await parseAndInsertNewLaunch(matched.key, tokenAddress, tx.utime);
      }
    }
  }
}

// Parse real token metadata and insert to DB
async function parseAndInsertNewLaunch(launchpadKey, tokenAddress, timestamp) {
  try {
    console.log(`🔍 Fetching real metadata for token at ${tokenAddress}...`);

    // Fetch real token metadata from TonAPI
    const meta = await fetchTokenMetadata(tokenAddress);
    const price = await fetchTokenPrice(tokenAddress);

    const symbol = meta?.symbol || 'UNKNOWN';
    const name = meta?.name || 'Unknown Token';
    const image = meta?.image || '';
    const supply = meta?.totalSupply || 0;
    const holders = meta?.holders || 0;

    // Try to get bonding progress from contract
    let bondingProgress = 0;
    try {
      const result = await client.runMethod(Address.parse(tokenAddress), 'get_pool_data');
      const tonCollected = result.stack.readBigNumber();
      const threshold = result.stack.readBigNumber();
      bondingProgress = Number((tonCollected * 100n) / threshold);
    } catch (e) {
      bondingProgress = 0;
    }

    const launchpadLabel = LAUNCHPAD_LABEL[launchpadKey] || launchpadKey;

    const tokenObj = {
      symbol,
      name,
      address: tokenAddress,
      launchpad: launchpadLabel,
      image,
      price,
      bonding_progress: bondingProgress,
      supply,
      holders,
      is_platform_launchpad_token: true,
      created_at: new Date(timestamp * 1000).toISOString()
    };

    console.log(`📝 Saving token: $${symbol} (${name}) on ${launchpadLabel} | bonding: ${bondingProgress}%`);

    if (pgPool) {
      await pgPool.query(`
        INSERT INTO tokens (symbol, name, address, launchpad, image, price, bonding_progress, supply, holders, is_platform_launchpad_token, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, to_timestamp($11))
        ON CONFLICT (address) DO UPDATE SET
          symbol = EXCLUDED.symbol,
          name = EXCLUDED.name,
          image = EXCLUDED.image,
          price = EXCLUDED.price,
          bonding_progress = EXCLUDED.bonding_progress,
          holders = EXCLUDED.holders;
      `, [symbol, name, tokenAddress, launchpadLabel, image, price, bondingProgress, supply, holders, true, timestamp]);
      console.log(`💾 Token saved to PostgreSQL.`);
    } else {
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      const idx = data.tokens.findIndex(t => t.address === tokenAddress);
      if (idx >= 0) data.tokens[idx] = tokenObj;
      else data.tokens.unshift(tokenObj);
      data.tokens = data.tokens.slice(0, 100);
      fs.writeFileSync(dbFallbackPath, JSON.stringify(data, null, 2));
      console.log(`💾 Token saved to local fallback JSON.`);
    }

    broadcastTokenDeployment(tokenObj);
  } catch (error) {
    console.error("❌ Database insert failed:", error.message);
  }
}

// Simulation loop (only runs when no valid factory addresses are configured)
function startSimulatedIndexerLoop() {
  console.log("🤖 Simulated indexer loop is disabled in production. Set valid factory addresses to enable live indexing.");
  // Do NOT run simulation on production — only log so nothing fake is inserted
}

// Notify Express server about new token deployment via WebSocket broadcast
function broadcastTokenDeployment(token) {
  const postData = JSON.stringify({ type: 'new_token', data: token });
  const req = http.request({
    hostname: 'localhost',
    port: process.env.PORT || 4000,
    path: '/api/webhook/broadcast',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
  }, (res) => { res.on('data', () => {}); });
  req.on('error', () => {});
  req.write(postData);
  req.end();
}

// Run Indexer
startIndexer();
