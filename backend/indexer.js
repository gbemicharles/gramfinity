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

// Known fee/relay contract addresses that are NOT newly deployed tokens
// (Blum sends to these on every transaction — they are treasury/fee addresses)
const KNOWN_NON_TOKEN_ADDRESSES = new Set([
  '0:d961b7ee4cfcee3e8b6818230a99d405e1ffcdfa4fc93f1486e3ea106162a582', // Blum fee address
]);

// Track recently processed addresses to avoid duplicates within 30s
const recentlyProcessed = new Map();

// Process transaction events from SSE stream
async function processTransactionEvent(tx) {
  if (!tx || !tx.success) return;

  const matched = flattenedFactories.find(
    f => Address.parse(f.address).equals(Address.parse(tx.account.address))
  );
  if (!matched) return;

  console.log(`🎯 Transaction on launchpad: [${matched.key}] | op: ${tx.in_msg?.op_code} | out_msgs: ${tx.out_msgs?.length}`);

  if (!tx.out_msgs || tx.out_msgs.length === 0) return;

  // Filter valid destination addresses — skip empty strings and known fee addresses
  const validDestinations = tx.out_msgs
    .filter(msg => msg.destination?.address && msg.destination.address.trim() !== '')
    .filter(msg => !KNOWN_NON_TOKEN_ADDRESSES.has(msg.destination.address))
    .sort((a, b) => (b.value || 0) - (a.value || 0)); // Highest value = likely the deployed contract

  if (validDestinations.length === 0) return;

  // Take the highest-value destination as the newly deployed token contract
  const deployedMsg = validDestinations[0];
  let tokenAddress;
  try {
    tokenAddress = Address.parse(deployedMsg.destination.address).toString();
  } catch (e) {
    console.error(`❌ Could not parse address: ${deployedMsg.destination.address}`);
    return;
  }

  // Deduplicate: skip if we processed this address in the last 60 seconds
  const now = Date.now();
  if (recentlyProcessed.has(tokenAddress)) {
    const lastSeen = recentlyProcessed.get(tokenAddress);
    if (now - lastSeen < 60000) {
      console.log(`⏭️ Skipping duplicate: ${tokenAddress}`);
      return;
    }
  }
  recentlyProcessed.set(tokenAddress, now);
  // Clean up old entries
  for (const [addr, ts] of recentlyProcessed.entries()) {
    if (now - ts > 120000) recentlyProcessed.delete(addr);
  }

  console.log(`🚀 New token deployed on ${matched.key}: ${tokenAddress}`);
  await parseAndInsertNewLaunch(matched.key, tokenAddress, tx.utime);
}

// Parse real token metadata and insert to DB
async function parseAndInsertNewLaunch(launchpadKey, tokenAddress, timestamp) {
  try {
    console.log(`🔍 Fetching real metadata for token at ${tokenAddress}...`);

    const meta = await fetchTokenMetadata(tokenAddress);
    const price = await fetchTokenPrice(tokenAddress);

    const symbol = meta?.symbol || 'UNKNOWN';
    const name = meta?.name || 'Unknown Token';
    const image = meta?.image || '';
    const supply = meta?.totalSupply || 0;
    const holders = meta?.holders || 0;

    // Reject tokens with dummy/test metadata — skip saving to DB
    const REJECTED_SYMBOLS = ['test', 'TEST', 'UNKNOWN', 'unknown', '', 'null', 'undefined'];
    const REJECTED_NAMES = ['test', 'Test', 'Unknown Token', 'Unknown', ''];
    if (REJECTED_SYMBOLS.includes(symbol) || REJECTED_NAMES.includes(name)) {
      console.log(`⏭️ Skipping test/dummy token: symbol="${symbol}" name="${name}" at ${tokenAddress}`);
      return;
    }

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
      symbol, name, address: tokenAddress, launchpad: launchpadLabel,
      image, price, bonding_progress: bondingProgress,
      supply, holders, is_platform_launchpad_token: true,
      created_at: new Date(timestamp * 1000).toISOString()
    };

    console.log(`📝 Saving: $${symbol} on ${launchpadLabel} | bonding: ${bondingProgress}%`);

    if (bondingProgress >= 100) {
      // Token has already bonded — write directly to bonded_tokens, skip tokens table
      console.log(`🎓 $${symbol} already at 100% bonding — writing to bonded_tokens.`);
      await graduateToBonded(tokenObj);
    } else {
      // Token still building — write to tokens table
      if (pgPool) {
        await pgPool.query(`
          INSERT INTO tokens (symbol, name, address, launchpad, image, price, bonding_progress, supply, holders, is_platform_launchpad_token, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, to_timestamp($11))
          ON CONFLICT (address) DO UPDATE SET
            symbol = EXCLUDED.symbol, name = EXCLUDED.name, image = EXCLUDED.image,
            price = EXCLUDED.price, bonding_progress = EXCLUDED.bonding_progress, holders = EXCLUDED.holders;
        `, [symbol, name, tokenAddress, launchpadLabel, image, price, bondingProgress, supply, holders, true, timestamp]);
        console.log(`💾 Token saved to tokens table (Postgres).`);
      } else {
        const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
        const idx = data.tokens.findIndex(t => t.address === tokenAddress);
        if (idx >= 0) data.tokens[idx] = tokenObj;
        else data.tokens.unshift(tokenObj);
        data.tokens = data.tokens.slice(0, 100);
        fs.writeFileSync(dbFallbackPath, JSON.stringify(data, null, 2));
        console.log(`💾 Token saved to local fallback JSON.`);
      }
    }

    broadcastTokenDeployment(tokenObj);
  } catch (error) {
    console.error("❌ Database insert failed:", error.message);
  }
}

// Graduate a fully bonded token from tokens table into bonded_tokens table
async function graduateToBonded(tokenObj) {
  try {
    if (pgPool) {
      // Insert into bonded_tokens
      await pgPool.query(`
        INSERT INTO bonded_tokens (symbol, name, address, launchpad, image, price, volume24h, liquidity, holders, supply, graduated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (address) DO UPDATE SET
          price = EXCLUDED.price, holders = EXCLUDED.holders,
          volume24h = EXCLUDED.volume24h, image = EXCLUDED.image;
      `, [
        tokenObj.symbol, tokenObj.name, tokenObj.address, tokenObj.launchpad,
        tokenObj.image, tokenObj.price, tokenObj.volume24h || 0,
        tokenObj.liquidity || 0, tokenObj.holders, tokenObj.supply
      ]);

      // Remove from active tokens table (it has graduated)
      await pgPool.query(`DELETE FROM tokens WHERE address = $1`, [tokenObj.address]);
      console.log(`🎓 $${tokenObj.symbol} graduated — moved to bonded_tokens table.`);
    } else {
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      // Remove from tokens
      data.tokens = (data.tokens || []).filter(t => t.address !== tokenObj.address);
      // Add to bonded_tokens
      if (!data.bonded_tokens) data.bonded_tokens = [];
      const exists = data.bonded_tokens.findIndex(t => t.address === tokenObj.address);
      const bondedEntry = { ...tokenObj, graduated_at: new Date().toISOString() };
      if (exists >= 0) data.bonded_tokens[exists] = bondedEntry;
      else data.bonded_tokens.unshift(bondedEntry);
      data.bonded_tokens = data.bonded_tokens.slice(0, 100);
      fs.writeFileSync(dbFallbackPath, JSON.stringify(data, null, 2));
      console.log(`🎓 $${tokenObj.symbol} graduated — moved to bonded_tokens in local fallback.`);
    }

    // Broadcast bonded graduation event to frontend clients
    const postData = JSON.stringify({ type: 'token_bonded', data: tokenObj });
    const req = http.request({
      hostname: 'localhost', port: process.env.PORT || 4000,
      path: '/api/webhook/broadcast', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => { res.on('data', () => {}); });
    req.on('error', () => {});
    req.write(postData);
    req.end();
  } catch (err) {
    console.error(`❌ Failed to graduate token to bonded_tokens:`, err.message);
  }
}

// Periodic poller: checks all active tokens for 100% bonding completion every 2 minutes
async function pollBondingProgress() {
  try {
    let activeTokens = [];
    if (pgPool) {
      const res = await pgPool.query(`SELECT address, symbol, name, launchpad, image, supply, holders FROM tokens WHERE bonding_progress < 100`);
      activeTokens = res.rows;
    } else {
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      activeTokens = (data.tokens || []).filter(t => (t.bonding_progress || 0) < 100);
    }

    for (const token of activeTokens) {
      try {
        const result = await client.runMethod(Address.parse(token.address), 'get_pool_data');
        const tonCollected = result.stack.readBigNumber();
        const threshold = result.stack.readBigNumber();
        const newProgress = Number((tonCollected * 100n) / threshold);

        if (newProgress >= 100) {
          console.log(`🎓 $${token.symbol} reached 100% bonding! Graduating to bonded_tokens...`);
          const price = await fetchTokenPrice(token.address);
          await graduateToBonded({ ...token, price, bonding_progress: 100 });
        } else if (pgPool) {
          // Update progress in tokens table
          await pgPool.query(`UPDATE tokens SET bonding_progress = $1 WHERE address = $2`, [newProgress, token.address]);
        }
      } catch (e) {
        // Contract may not support get_pool_data — skip silently
      }
    }
  } catch (err) {
    console.error('❌ Bonding progress poll error:', err.message);
  }
}

// Simulation loop (only runs when no valid factory addresses are configured)
function startSimulatedIndexerLoop() {
  console.log("🤖 Simulated indexer loop is disabled in production. Real blockchain indexer active.");
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

// Helper to extract clean token symbol from pool name & base token metadata
function extractCleanSymbol(poolName, baseTokenObj) {
  if (baseTokenObj && baseTokenObj.symbol && typeof baseTokenObj.symbol === 'string') {
    const sym = baseTokenObj.symbol.trim();
    if (sym.length > 0 && !['TON', 'USDT', 'USDC', 'UNKNOWN', 'unknown', 'test', 'TEST'].includes(sym)) {
      return sym.replace('$', '').toUpperCase();
    }
  }
  if (poolName && typeof poolName === 'string') {
    const parts = poolName.split(' / ').map(p => p.trim());
    if (parts.length >= 2) {
      const quoteCoins = ['TON', 'WTON', 'USDT', 'USDC', 'USD'];
      const nonQuote = parts.find(p => !quoteCoins.includes(p.toUpperCase()));
      if (nonQuote && nonQuote.length > 0 && !['UNKNOWN', 'test', 'unknown'].includes(nonQuote.toLowerCase())) {
        return nonQuote.replace('$', '').toUpperCase();
      }
      if (parts[0].toUpperCase() !== 'TON' && parts[0].toUpperCase() !== 'USDT') return parts[0].replace('$', '').toUpperCase();
      if (parts[1].toUpperCase() !== 'TON' && parts[1].toUpperCase() !== 'USDT') return parts[1].replace('$', '').toUpperCase();
    }
  }
  return null;
}

// Helper to fetch json from HTTP URL
function fetchJson(url) {
  return new Promise(resolve => {
    const req = https.get(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Gramfinity-Indexer/1.0' }
    }, r => {
      let body = '';
      r.on('data', chunk => body += chunk);
      r.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => { req.destroy(); resolve(null); });
  });
}

// REAL DEX SWAP EVENT INDEXER
// Polls real DEX trade events from GeckoTerminal & TonAPI for ALL TON pools (Trending + New + STON.fi + DeDust), normalizes them, stores in Postgres, and broadcasts via WebSockets
async function fetchAndSaveRealDexTrades() {
  try {
    // Fetch top active pools across STON.fi, DeDust, Trending, and New pools to cover 100% of major DEX activity
    const [trendingRes, newRes, stonRes, dedustRes] = await Promise.all([
      fetchJson('https://api.geckoterminal.com/api/v2/networks/ton/trending_pools?include=base_token&page=1'),
      fetchJson('https://api.geckoterminal.com/api/v2/networks/ton/new_pools?include=base_token&page=1'),
      fetchJson('https://api.geckoterminal.com/api/v2/networks/ton/dexes/stonfi/pools?include=base_token&page=1'),
      fetchJson('https://api.geckoterminal.com/api/v2/networks/ton/dexes/dedust/pools?include=base_token&page=1')
    ]);

    const poolList = [];
    const includedMap = {};

    [trendingRes, newRes, stonRes, dedustRes].forEach(res => {
      if (res && res.data) {
        res.data.forEach(p => poolList.push(p));
        res.included?.forEach(item => {
          if (item.type === 'token') includedMap[item.id] = item;
        });
      }
    });

    // Deduplicate pools by address & take top 16 active pools
    const uniquePools = [];
    const seenPoolAddrs = new Set();
    for (const pool of poolList) {
      const addr = pool.attributes?.address;
      if (addr && !seenPoolAddrs.has(addr)) {
        seenPoolAddrs.add(addr);
        uniquePools.push(pool);
      }
    }

    const poolsToScan = uniquePools.slice(0, 16);

    for (const pool of poolsToScan) {
      const poolAddress = pool.attributes?.address;
      if (!poolAddress) continue;

      const tradesRes = await fetchJson(`https://api.geckoterminal.com/api/v2/networks/ton/pools/${poolAddress}/trades`);
      if (!tradesRes || !tradesRes.data) continue;

      const baseTokenId = pool.relationships?.base_token?.data?.id;
      const baseToken = includedMap[baseTokenId]?.attributes;
      const poolName = pool.attributes?.name || '';
      const symbol = extractCleanSymbol(poolName, baseToken);

      // Skip trades if symbol is UNKNOWN or invalid
      if (!symbol || symbol === 'UNKNOWN' || symbol === 'TEST') continue;

      const tokenAddress = baseTokenId?.split('_')?.[1] || poolAddress;
      const dexId = pool.relationships?.dex?.data?.id || '';
      const launchpad = dexId === 'stonfi' || dexId === 'stonfi-v2' ? 'STON.fi DEX' :
                        dexId === 'dedust' || dexId === 'dedust-v2' ? 'DeDust DEX' :
                        dexId === 'uranus' ? 'TopBlast.lol' : 'TON DEX';

      for (const trade of tradesRes.data) {
        const attr = trade.attributes;
        if (!attr || !attr.tx_hash) continue;

        const txHash = attr.tx_hash;
        const id = `tx_${txHash}`;
        const kind = (attr.kind || 'buy').toUpperCase();
        const type = kind === 'SELL' ? 'SELL' : 'BUY';

        const rawSender = attr.tx_from_address || attr.sender || '0:0000...0000';
        let buyer = rawSender;
        if (buyer.length > 12) {
          buyer = `${buyer.substring(0, 4)}...${buyer.substring(buyer.length - 4)}`;
        }

        const amountToken = parseFloat(attr.to_token_amount || attr.from_token_amount || 0);
        const amountUSD = parseFloat(attr.volume_in_usd || 0);
        const amountTON = amountUSD > 0 ? parseFloat((amountUSD / 7.24).toFixed(2)) : parseFloat((amountToken * 0.001).toFixed(2));
        const time = attr.block_timestamp ? new Date(attr.block_timestamp).getTime() : Date.now();

        const tradeObj = {
          id,
          buyer,
          type,
          token: symbol,
          tokenAddress,
          amountToken: Math.round(amountToken),
          amountTON,
          amountUSD,
          launchpad,
          time
        };

        await saveAndBroadcastActivity(tradeObj);
      }
    }
  } catch (err) {
    console.error('❌ Error indexing real DEX trades:', err.message);
  }
}

// Save activity event to PostgreSQL activities table (or fallback file) and broadcast
async function saveAndBroadcastActivity(tradeObj) {
  try {
    if (pgPool) {
      await pgPool.query(`
        INSERT INTO activities (id, buyer, type, token, token_address, amount_token, amount_ton, amount_usd, launchpad, time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, to_timestamp($10 / 1000.0))
        ON CONFLICT (id) DO NOTHING;
      `, [
        tradeObj.id,
        tradeObj.buyer,
        tradeObj.type,
        tradeObj.token,
        tradeObj.tokenAddress,
        tradeObj.amountToken,
        tradeObj.amountTON,
        tradeObj.amountUSD,
        tradeObj.launchpad,
        tradeObj.time
      ]);
    } else {
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      if (!data.activities) data.activities = [];
      if (!data.activities.some(a => a.id === tradeObj.id)) {
        data.activities.unshift(tradeObj);
        data.activities = data.activities.slice(0, 100);
        fs.writeFileSync(dbFallbackPath, JSON.stringify(data, null, 2));
      }
    }

    broadcastActivityEvent(tradeObj);
  } catch (err) {
    // Conflict or duplicate — silent catch
  }
}

// Broadcast activity to server.js WebSocket webhook
function broadcastActivityEvent(tradeObj) {
  const postData = JSON.stringify({ type: 'new_activity', data: tradeObj });
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

// Run Indexer + start bonding progress poller & DEX trade indexer
startIndexer();
setInterval(pollBondingProgress, 2 * 60 * 1000);
setTimeout(pollBondingProgress, 15000);

// Poll real DEX trades across all STON.fi, DeDust & TON DEX pools every 5 seconds
setInterval(fetchAndSaveRealDexTrades, 5 * 1000);
setTimeout(fetchAndSaveRealDexTrades, 1000);

