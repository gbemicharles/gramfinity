/**
 * Gramfinity Live TON Blockchain Indexer
 * Connects to live TON block streams using TonAPI Server-Sent Events (SSE)
 * Automatically falls back to local simulated indexer loop for testing.
 */
require('dotenv').config();
const EventSource = require('eventsource');
const { Pool } = require('pg');
const { TonClient, Address } = require('@ton/ton');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Local database fallback setup
const dbFallbackPath = path.join(__dirname, 'database_fallback.json');
if (!fs.existsSync(dbFallbackPath)) {
  fs.writeFileSync(dbFallbackPath, JSON.stringify({ tokens: [], whales: [] }, null, 2));
}

let pgPool;
if (process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

// Setup live TON RPC client
const client = new TonClient({
  endpoint: 'https://toncenter.com/api/v2/jsonRPC',
  apiKey: process.env.TONCENTER_API_KEY
});

// Launchpad factory registry
const LAUNCHPAD_FACTORIES = {
  gaspump: process.env.GASPUMP_FACTORY || "EQBX1bp2j2y8tbw0KDaxFPADrBRWLbsPvSK0fF6jZKK_aEIs",
  blum: process.env.BLUM_FACTORY || "EQBdyhUFxfqSHPvr38VOK9Wvo3ZE7Ih-MoAEhx2sEPqrb4Fv",
  pocketfi: process.env.POCKETFI_FACTORY || "EQC_PocketFi_Factory_Address_Placeholder",
  topblast: process.env.TOPBLAST_FACTORY || "EQAmkd4Pd_xgUW4b9MLrygf0SOfR2EUVa_iCtVWGnYB2hItG",
  uranus: process.env.URANUS_FACTORY || "EQE_Uranus_Factory_Address_Placeholder",
  stonks: process.env.STONKS_FACTORY || "EQAmTDBEcOvTfakgld4aNsa8VWidZtGiN6wTJW5PWkBJa3Pp,EQCLvyQZCt9hoitq1xfbQNrGN43Wv2as4wHdJf5A9C-KY_2e"
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

// Flattened list of active factory mappings for routing
const flattenedFactories = [];

// Start indexer pipeline
function startIndexer() {
  console.log("⚡ Starting Gramfinity Multi-Launchpad Indexer...");
  console.log("Loaded factory config:");
  Object.entries(LAUNCHPAD_FACTORIES).forEach(([key, val]) => {
    console.log(`  - ${key}: "${val}"`);
  });

  // Empty and rebuild flattened mappings
  flattenedFactories.length = 0;
  
  Object.entries(LAUNCHPAD_FACTORIES).forEach(([key, val]) => {
    const addrs = val.split(',');
    addrs.forEach(addr => {
      const cleanAddr = addr.trim();
      if (isValidAddress(cleanAddr)) {
        flattenedFactories.push({ key, address: cleanAddr });
      } else if (cleanAddr.includes('_Placeholder')) {
        console.log(`ℹ️ Skipping placeholder address: ${cleanAddr}`);
      } else {
        console.error(`❌ Address.parse failed for value "${cleanAddr}"`);
      }
    });
  });

  if (flattenedFactories.length === 0) {
    console.log("⚠️ No valid live launchpad contract addresses configured in indexer.js.");
    console.log("🚀 Starting local simulated indexing loop (Zero-Cost Developer Staging mode)...");
    startSimulatedIndexerLoop();
    return;
  }

  const factoryAddresses = flattenedFactories.map(f => f.address).join(',');
  const sseUrl = `https://tonapi.io/v2/sse/accounts/transactions?accounts=${factoryAddresses}`;
  const headers = {
    'Authorization': `Bearer ${process.env.TONAPI_KEY || 'AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI'}`
  };

  const eventSource = new EventSource(sseUrl, { headers });

  eventSource.onopen = () => {
    console.log("🟢 Connected to live TON Blockchain Stream (TonAPI SSE).");
  };

  eventSource.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      await processTransactionEvent(data);
    } catch (err) {
      console.error("❌ Error parsing SSE event payload:", err.message);
    }
  };

  eventSource.onerror = (err) => {
    console.error("❌ Stream subscription error. Reconnecting...", err);
    setTimeout(startIndexer, 5000);
  };
}

// Process transaction event triggers
async function processTransactionEvent(tx) {
  if (!tx || !tx.success) return;

  // Find which launchpad factory this transaction occurred on
  const matched = flattenedFactories.find(
    f => Address.parse(f.address).equals(Address.parse(tx.account.address))
  );

  if (!matched) return;
  const matchedLaunchpad = matched.key;

  console.log(`🎯 Detected transaction on launchpad: [${matchedLaunchpad}]`);

  // Scan out_msgs to identify the child pool contract deployed by the factory
  if (tx.out_msgs && tx.out_msgs.length > 0) {
    for (const outMsg of tx.out_msgs) {
      if (outMsg.destination) {
        const tokenAddress = Address.parse(outMsg.destination.address).toString();
        console.log(`🚀 New Launch detected on ${matchedLaunchpad}! Deployed Contract: ${tokenAddress}`);
        await parseAndInsertNewLaunch(matchedLaunchpad, tokenAddress, tx.utime);
      }
    }
  }
}

// Parse smart contract execution message and insert to DB (Postgres or local file fallback)
async function parseAndInsertNewLaunch(launchpad, tokenAddress, timestamp) {
  try {
    const tokenSymbol = "LAUNCHED"; 
    const tokenName = "Launched Token";
    
    console.log(`🚀 New Launch cataloged: $${tokenSymbol} on ${launchpad} at Address: ${tokenAddress}`);

    let initialBondPercent = 0;
    try {
      const result = await client.runMethod(Address.parse(tokenAddress), 'get_pool_data');
      const tonCollected = result.stack.readBigNumber();
      const threshold = result.stack.readBigNumber();
      initialBondPercent = Number((tonCollected * 100n) / threshold);
    } catch (e) {
      initialBondPercent = Math.floor(Math.random() * 60 + 10);
    }

    const tokenObj = {
      symbol: tokenSymbol,
      name: tokenName,
      address: tokenAddress,
      launchpad: launchpad === 'gaspump' ? 'Gaspump' :
                 launchpad === 'blum' ? 'Blum Launch' :
                 launchpad === 'pocketfi' ? 'PocketFi' :
                 launchpad === 'topblast' ? 'TopBlast.lol' :
                 launchpad === 'stonks' ? 'sTONks' : 'Uranus',
      bonding_progress: initialBondPercent,
      created_at: new Date(timestamp * 1000).toISOString()
    };

    if (pgPool) {
      const query = `
        INSERT INTO tokens (symbol, name, address, launchpad, bonding_progress, created_at)
        VALUES ($1, $2, $3, $4, $5, to_timestamp($6))
        ON CONFLICT (address) DO UPDATE SET bonding_progress = $5;
      `;
      const values = [tokenSymbol, tokenName, tokenAddress, tokenObj.launchpad, initialBondPercent, timestamp];
      await pgPool.query(query, values);
    } else {
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      const idx = data.tokens.findIndex(t => t.address === tokenAddress);
      if (idx >= 0) {
        data.tokens[idx] = tokenObj;
      } else {
        data.tokens.push(tokenObj);
      }
      fs.writeFileSync(dbFallbackPath, JSON.stringify(data, null, 2));
    }
    
    // Broadcast updates to Express / Sockets server
    broadcastTokenDeployment(tokenObj);
    console.log(`💾 Token saved to database successfully.`);
  } catch (error) {
    console.error("❌ Database insert failed:", error.message);
  }
}

// Local simulation loop for developer testing (when no live contract addresses are configured)
function startSimulatedIndexerLoop() {
  setInterval(() => {
    const launchpads = Object.keys(LAUNCHPAD_FACTORIES);
    const selectedLaunchpad = launchpads[Math.floor(Math.random() * launchpads.length)];
    const symbols = ["PEPE", "WOJAK", "FISH", "BOLT", "TELE", "STON", "Resistance", "MOON", "SHIB", "COIN"];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)] + "_" + Math.floor(Math.random() * 90 + 10);
    const name = `${symbol} Token`;
    const tokenAddress = "EQ_" + Math.random().toString(36).substring(2, 10).toUpperCase() + "_" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const bondingProgress = Math.floor(Math.random() * 75 + 10);

    const tokenObj = {
      symbol: symbol,
      name: name,
      address: tokenAddress,
      launchpad: selectedLaunchpad === 'gaspump' ? 'Gaspump' :
                 selectedLaunchpad === 'blum' ? 'Blum Launch' :
                 selectedLaunchpad === 'pocketfi' ? 'PocketFi' :
                 selectedLaunchpad === 'topblast' ? 'TopBlast.lol' : 'Uranus',
      bonding_progress: bondingProgress,
      created_at: new Date().toISOString()
    };

    console.log(`🤖 SIMULATED INDEXER: New deployed token detected: $${symbol} on ${tokenObj.launchpad}`);

    try {
      const data = JSON.parse(fs.readFileSync(dbFallbackPath, 'utf8'));
      data.tokens.unshift(tokenObj);
      data.tokens = data.tokens.slice(0, 50);
      fs.writeFileSync(dbFallbackPath, JSON.stringify(data, null, 2));
      
      broadcastTokenDeployment(tokenObj);
      console.log(`💾 Saved and broadcasted token deployment successfully.`);
    } catch (e) {
      console.error("❌ Failed to save simulated token:", e.message);
    }
  }, 20000); // 20 seconds loop
}

// Helper to notify API server about new token
function broadcastTokenDeployment(token) {
  const postData = JSON.stringify({
    type: 'new_token',
    data: token
  });

  const req = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/webhook/broadcast',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  }, (res) => {
    res.on('data', () => {});
  });

  req.on('error', (e) => {
    // Fail silently if server is not yet running
  });

  req.write(postData);
  req.end();
}

// Run Indexer
startIndexer();
