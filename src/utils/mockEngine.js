// Gramfinity Mock Blockchain & Market Engine

// Helper to generate chart candlesticks for a token
function generateInitialChartData(basePrice, count = 100) {
  let data = [];
  let currentTime = Date.now() - count * 5 * 60 * 1000; // 5-minute bars
  let price = basePrice;
  
  for (let i = 0; i < count; i++) {
    let change = price * (Math.random() - 0.5) * 0.03;
    let open = price;
    let close = price + change;
    let high = Math.max(open, close) + (Math.random() * price * 0.01);
    let low = Math.min(open, close) - (Math.random() * price * 0.01);
    
    data.push({
      time: currentTime,
      open,
      high,
      low,
      close,
      volume: Math.random() * 50000 + 1000
    });
    
    price = close;
    currentTime += 5 * 60 * 1000;
  }
  return data;
}

// Initial Tokens Database
const INITIAL_TOKENS = {
  TON: {
    symbol: "TON",
    name: "Toncoin",
    address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    price: 7.24,
    change1h: 0.45,
    change24h: 3.25,
    volume24h: 324500120,
    volume1h: 18540300,
    volume5m: 1420500,
    buySellRatio: 0.54,
    holdersGrowth: 0.12,
    initialLiquidity: 100000000,
    devWallet: "EQ_Dev_Admin_System_Main_7777",
    launchTime: Date.now() - 365 * 24 * 3600 * 1000, // 1 year ago
    category: "DeFi",
    logoBg: "linear-gradient(135deg, #0088cc, #005588)",
    socialLinks: { telegram: "https://t.me/toncoin", x: "https://x.com/ton_blockchain", website: "https://ton.org" },
    liquidity: 182400500,
    supply: 5110000000,
    holders: 245012,
    security: { rugScore: 0, rugRisk: "Safe", verified: true, renounced: true, lockedLiquidity: 100 },
    decimals: 9,
    launchpad: "TON Mainnet",
    description: "The native currency of the TON blockchain, used for transaction fees, staking, and governance."
  },
  NOT: {
    symbol: "NOT",
    name: "Notcoin",
    address: "EQD4v9b2_gramfinity_notcoin_core_contract",
    price: 0.0125,
    change1h: -1.24,
    change24h: 8.42,
    volume24h: 89340200,
    volume1h: 4235000,
    volume5m: 350000,
    buySellRatio: 0.58,
    holdersGrowth: 1.85,
    initialLiquidity: 15000000,
    devWallet: "EQD_Notcoin_Dev_Founder_9912",
    launchTime: Date.now() - 60 * 24 * 3600 * 1000, // 60 days ago
    category: "Gaming",
    logoBg: "linear-gradient(135deg, #eab308, #ca8a04)",
    socialLinks: { telegram: "https://t.me/notcoin", x: "https://x.com/notcoin", website: "https://not.coin" },
    liquidity: 24500000,
    supply: 102719228528,
    holders: 1845201,
    security: { rugScore: 5, rugRisk: "Safe", verified: true, renounced: true, lockedLiquidity: 95 },
    decimals: 9,
    launchpad: "STON.fi Launch",
    description: "A viral clicker game token on Telegram that transitioned into a web3 community ecosystem."
  },
  DOGS: {
    symbol: "DOGS",
    name: "Dogs",
    address: "EQC5a7d3_dogs_telegram_official_address",
    price: 0.00085,
    change1h: 2.14,
    change24h: -12.35,
    volume24h: 145200300,
    volume1h: 6890200,
    volume5m: 780000,
    buySellRatio: 0.46,
    holdersGrowth: 4.25,
    initialLiquidity: 12300000,
    devWallet: "EQC_Dogs_Dev_Wallet_5502",
    launchTime: Date.now() - 30 * 24 * 3600 * 1000, // 30 days ago
    category: "Meme",
    logoBg: "linear-gradient(135deg, #6b7280, #374151)",
    socialLinks: { telegram: "https://t.me/dogs_community", x: "https://x.com/dogs_community", website: "https://dogshouse.club" },
    liquidity: 15300000,
    supply: 550000000000,
    holders: 4200150,
    security: { rugScore: 12, rugRisk: "Low Risk", verified: true, renounced: true, lockedLiquidity: 88 },
    decimals: 9,
    launchpad: "DeDust Launch",
    description: "The most Telegram-native meme coin, inspired by Spotty, the mascot drawn by Telegram founder Pavel Durov."
  },
  HMSTR: {
    symbol: "HMSTR",
    name: "Hamster Kombat",
    address: "EQF1a4b9_hamster_kombat_official_tap",
    price: 0.0035,
    change1h: -0.15,
    change24h: -4.82,
    volume24h: 98120000,
    volume1h: 3120000,
    volume5m: 180000,
    buySellRatio: 0.49,
    holdersGrowth: -0.45,
    initialLiquidity: 8200000,
    devWallet: "EQF_Hamster_Dev_Combat_8819",
    launchTime: Date.now() - 10 * 24 * 3600 * 1000, // 10 days ago
    category: "Gaming",
    logoBg: "linear-gradient(135deg, #f97316, #c2410c)",
    socialLinks: { telegram: "https://t.me/hamster_kombat", x: "https://x.com/hamster_kombat", website: "https://hamsterkombat.io" },
    liquidity: 11200000,
    supply: 100000000000,
    holders: 5310245,
    security: { rugScore: 18, rugRisk: "Low Risk", verified: true, renounced: false, lockedLiquidity: 75 },
    decimals: 9,
    launchpad: "STON.fi Launch",
    description: "Token for the massive Hamster Kombat Telegram tap-to-earn game."
  },
  GRAM: {
    symbol: "GRAM",
    name: "Gram",
    address: "EQB8v9c2_gram_proof_of_work_jetton",
    price: 0.0092,
    change1h: 0.85,
    change24h: 1.15,
    volume24h: 3120500,
    volume1h: 145000,
    volume5m: 12000,
    buySellRatio: 0.52,
    holdersGrowth: 0.35,
    initialLiquidity: 850000,
    devWallet: "EQB_Gram_Dev_POW_1102",
    launchTime: Date.now() - 180 * 24 * 3600 * 1000, // 180 days ago
    category: "DeFi",
    logoBg: "linear-gradient(135deg, #a855f7, #6b21a8)",
    socialLinks: { telegram: "https://t.me/gramcoin", x: "https://x.com/gramcoin", website: "https://gramcoin.org" },
    liquidity: 1420000,
    supply: 5000000000,
    holders: 35402,
    security: { rugScore: 8, rugRisk: "Safe", verified: true, renounced: true, lockedLiquidity: 90 },
    decimals: 9,
    launchpad: "Direct Mint",
    description: "The first proof-of-work mineable Jetton built on the TON blockchain."
  },
  REDO: {
    symbol: "REDO",
    name: "Resistance Dog",
    address: "EQD5a1b3_redo_resistance_dog_pavel_durov",
    price: 0.854,
    change1h: 3.45,
    change24h: 14.82,
    volume24h: 12450300,
    volume1h: 890000,
    volume5m: 45000,
    buySellRatio: 0.62,
    holdersGrowth: 5.40,
    initialLiquidity: 3000000,
    devWallet: "EQD_Resistance_Dev_Durov_7749",
    launchTime: Date.now() - 15 * 24 * 3600 * 1000, // 15 days ago
    category: "Meme",
    logoBg: "linear-gradient(135deg, #dc2626, #991b1b)",
    socialLinks: { telegram: "https://t.me/redo_token", x: "https://x.com/redo_token", website: "https://redo.dog" },
    liquidity: 4800000,
    supply: 100000000,
    holders: 48201,
    security: { rugScore: 3, rugRisk: "Safe", verified: true, renounced: true, lockedLiquidity: 100 },
    decimals: 9,
    launchpad: "TonRaffles",
    description: "A community token celebrating Pavel Durov's resistance movement for internet freedom."
  },
  TONY: {
    symbol: "TONY",
    name: "Tonysaur",
    address: "EQC4v9b2_tonysaur_pixelated_dino",
    price: 0.000045,
    change1h: 14.25,
    change24h: 128.50,
    volume24h: 4200150,
    volume1h: 980000,
    volume5m: 210000,
    buySellRatio: 0.74,
    holdersGrowth: 32.40,
    initialLiquidity: 120000,
    devWallet: "EQC_Tonysaur_Dev_Degen_0012",
    launchTime: Date.now() - 4 * 60 * 1000, // 4 minutes ago (New!)
    category: "Meme",
    logoBg: "linear-gradient(135deg, #10b981, #047857)",
    socialLinks: { telegram: "https://t.me/tonysaur_ton", x: "https://x.com/tonysaur_ton", website: "https://tonysaur.xyz" },
    liquidity: 480000,
    supply: 10000000000,
    holders: 14250,
    security: { rugScore: 68, rugRisk: "High Risk", verified: false, renounced: false, lockedLiquidity: 30 },
    decimals: 9,
    launchpad: "Gaspump",
    description: "A highly volatile meme token themed around a prehistoric pixelated dinosaur on TON."
  }
};

// Top whale wallets for copy trading / whale monitoring
const MOCK_WHALES = [
  {
    address: "EQC5a7d3_dogs_community_top_whale",
    name: "TON Whale Alpha",
    winRate: 88.5,
    roi30d: 245.2,
    pnl30d: 142500, // in USD
    trades30d: 142,
    avatarColor: "#00e5ff",
    copied: false,
    allocation: 0,
    slippage: 1.0,
    tag: "Early Sniper",
    avgEntryTime: "11 mins",
    holdingsCount: 5,
    winRateTier: "Elite"
  },
  {
    address: "EQD4v9b2_gramfinity_insider_whale",
    name: "Smart Money Jetton",
    winRate: 74.2,
    roi30d: 118.4,
    pnl30d: 68200,
    trades30d: 89,
    avatarColor: "#00ff87",
    copied: false,
    allocation: 0,
    slippage: 0.5,
    tag: "High Yield Maker",
    avgEntryTime: "17 mins",
    holdingsCount: 3,
    winRateTier: "Very High"
  },
  {
    address: "EQB8v9c2_gram_pow_jetton_whale",
    name: "Meme Degen 99",
    winRate: 59.8,
    roi30d: 582.1,
    pnl30d: 215600,
    trades30d: 412,
    avatarColor: "#ff3860",
    copied: false,
    allocation: 0,
    slippage: 2.0,
    tag: "Meme Sniper",
    avgEntryTime: "4 mins",
    holdingsCount: 8,
    winRateTier: "High"
  },
  {
    address: "EQA2a89d1_durov_pocket_top_wallet",
    name: "Durov Pocket Tracker",
    winRate: 91.2,
    roi30d: 42.8,
    pnl30d: 382400,
    trades30d: 34,
    avatarColor: "#ffb700",
    copied: false,
    allocation: 0,
    slippage: 0.2,
    tag: "Institutional Pool",
    avgEntryTime: "35 mins",
    holdingsCount: 12,
    winRateTier: "Elite"
  }
];

class MockEngine {
  constructor() {
    this.tokens = { ...INITIAL_TOKENS };
    this.whales = [...MOCK_WHALES];
    this.wallets = [
      {
        id: "main",
        name: "Main Wallet",
        address: "EQD3a9b2_gramfinity_user_wallet_address_7777",
        balances: {
          TON: 845.20,
          NOT: 18500,
          DOGS: 250000,
          HMSTR: 0,
          GRAM: 1200,
          REDO: 250,
          TONY: 0
        },
        costBasis: {
          NOT: 0.0115,
          DOGS: 0.00095,
          HMSTR: 0.0035,
          GRAM: 0.0085,
          REDO: 0.780,
          TONY: 0.000045
        },
        realizedPnL: 124.50,
        history: [
          {
            id: "tx_1",
            time: Date.now() - 4 * 3600 * 1000,
            type: "BUY",
            token: "NOT",
            amountToken: 5000,
            amountTON: 8.62,
            priceUSD: 0.0125,
            gasTON: 0.02,
            txHash: "EQC_tx_hash_a83bd...91a2"
          }
        ],
        positionsSettings: {
          NOT: { tp: 100, sl: 50, tpActive: false, slActive: false },
          REDO: { tp: 100, sl: 50, tpActive: false, slActive: false }
        }
      },
      {
        id: "sniper",
        name: "Sniper Bot Wallet",
        address: "EQB_Sniper_Bot_Wallet_Profile_3321",
        balances: { TON: 120.50, NOT: 0, DOGS: 0, HMSTR: 0, GRAM: 0, REDO: 0, TONY: 0 },
        costBasis: {},
        realizedPnL: 0,
        history: [],
        positionsSettings: {}
      },
      {
        id: "burner",
        name: "Degen Burner Wallet",
        address: "EQC_Burner_Wallet_Profile_0091",
        balances: { TON: 15.80, NOT: 0, DOGS: 0, HMSTR: 0, GRAM: 0, REDO: 0, TONY: 500000 },
        costBasis: { TONY: 0.000040 },
        realizedPnL: 0,
        history: [],
        positionsSettings: {}
      }
    ];
    this.activeWalletId = "main";
    this.wallet = this.wallets[0];
    this.tokenSmartMoneyEntries = {
      'TONY': ['EQC5a7d3_dogs_community_top_whale', 'EQD4v9b2_gramfinity_insider_whale', 'EQB8v9c2_gram_pow_jetton_whale'],
      'REDO': ['EQC5a7d3_dogs_community_top_whale', 'EQD4v9b2_gramfinity_insider_whale'],
      'NOT': ['EQD4v9b2_gramfinity_insider_whale']
    };
    
    this.alerts = [
      { id: "a_1", symbol: "TON", condition: "ABOVE", target: 8.0, active: true },
      { id: "a_2", symbol: "TONY", condition: "BELOW", target: 0.00003, active: true }
    ];

    // Generate historic candlestick data
    this.charts = {};
    Object.keys(this.tokens).forEach(symbol => {
      this.charts[symbol] = generateInitialChartData(this.tokens[symbol].price, 120);
    });

    // Persistent feeds cache
    this.whaleTxFeed = [
      {
        id: "wtx_1",
        time: Date.now() - 120000,
        whaleName: "TON Whale Alpha",
        type: "BUY",
        token: "NOT",
        amountUSD: 14500,
        amountToken: 1160000,
        tonEquivalent: 2000,
        txHash: "EQA_whale_tx_83b..."
      },
      {
        id: "wtx_2",
        time: Date.now() - 320000,
        whaleName: "Meme Degen 99",
        type: "BUY",
        token: "TONY",
        amountUSD: 4500,
        amountToken: 100000000,
        tonEquivalent: 620,
        txHash: "EQC_whale_tx_901..."
      },
      {
        id: "wtx_3",
        time: Date.now() - 500000,
        whaleName: "Smart Money Jetton",
        type: "SELL",
        token: "REDO",
        amountUSD: 18200,
        amountToken: 21300,
        tonEquivalent: 2510,
        txHash: "EQD_whale_tx_112..."
      }
    ];

    this.copyLogs = [];
    this.limitOrders = [];
    this.dcaOrders = [];

    // Subscriptions lists
    this.priceListeners = [];
    this.whaleListeners = [];
    this.orderBookListeners = [];
    this.walletListeners = [];
    this.alertListeners = [];
    this.copyTradeListeners = [];
    this.whaleTxFeedListeners = [];
    this.copyLogsListeners = [];
    this.activeWalletListeners = [];
    this.limitOrderListeners = [];
    this.dcaOrderListeners = [];

    // Tickers pool for dynamic launch simulation
    this.potentialTickers = [
      { ticker: "PEPE", name: "Pepe TON", launchpad: "Gaspump" },
      { ticker: "WOJAK", name: "Wojak Jetton", launchpad: "Blum Launch" },
      { ticker: "FISH", name: "Ton Fish Coin", launchpad: "PocketFi" },
      { ticker: "BOLT", name: "Bolt Speed Coin", launchpad: "Uranus" },
      { ticker: "PAVEL", name: "Pavel Fan Token", launchpad: "TopBlast.lol" },
      { ticker: "TELE", name: "Telegram Portal", launchpad: "Blum Launch" },
      { ticker: "PUMP", name: "TON Pump Token", launchpad: "Gaspump" },
      { ticker: "STON", name: "Ston Community", launchpad: "STON.fi Launch" },
      { ticker: "CATS", name: "Cats Telegram", launchpad: "PocketFi" },
      { ticker: "Resistance", name: "Resistance Fighter", launchpad: "TopBlast.lol" }
    ];

    this.networkMode = 'sandbox';
    this.realWalletAddress = null;
    this.sandboxWalletBackup = JSON.parse(JSON.stringify(this.wallet));

    // Fetch-in-progress locks to prevent race conditions in mainnet mode
    this.isFetchingMainnetPrices = false;
    this.isFetchingWalletBalances = false;

    // Load settings from Telegram cloud storage if available
    this.loadSettingsFromCloud();

    // Start simulation loops
    this.startSimulation();
  }

  setNetworkMode(mode) {
    if (this.networkMode === mode) return;
    this.networkMode = mode;
    this.triggerToast(`Switched to ${mode === 'mainnet' ? 'Live Mainnet' : 'Sandbox Sandbox'} Mode`, "info");
    
    if (mode === 'mainnet') {
      this.fetchMainnetPrices();
      this.fetchRealWalletBalances();
    } else {
      // Revert wallet back to mock sandbox wallet
      this.wallet = JSON.parse(JSON.stringify(this.sandboxWalletBackup));
      this.tokens = { ...INITIAL_TOKENS };
      this.notifyWallet();
      this.notifyPrices();
    }
  }

  setRealWalletAddress(address) {
    this.realWalletAddress = address;
    if (this.networkMode === 'mainnet') {
      this.fetchRealWalletBalances();
    }
  }

  async fetchRealWalletBalances() {
    if (this.networkMode !== 'mainnet' || !this.realWalletAddress) return;
    if (this.isFetchingWalletBalances) return; // Prevent overlapping fetches
    this.isFetchingWalletBalances = true;
    
    try {
      // 1. Fetch TON Balance from TonAPI (more reliable than toncenter, we have auth key)
      let tonBalance = 0;
      try {
        const accountRes = await fetch(`https://tonapi.io/v2/accounts/${this.realWalletAddress}`, {
          headers: {
            'Authorization': `Bearer AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI`
          }
        });
        if (accountRes.ok) {
          const accountData = await accountRes.json();
          if (accountData.balance) {
            tonBalance = parseFloat(accountData.balance) / 1000000000;
          }
        }
      } catch (e) {
        console.error("Error fetching TON balance from TonAPI", e);
      }
      
      // Initialize mainnet balances
      const mainnetBalances = { TON: tonBalance };
      const mainnetCostBasis = {};
      
      // 2. Fetch Jetton Balances from Tonapi.io
      try {
        const tonapiRes = await fetch(`https://tonapi.io/v2/accounts/${this.realWalletAddress}/jettons`, {
          headers: {
            'Authorization': `Bearer AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI`
          }
        });
        if (tonapiRes.ok) {
          const tonapiData = await tonapiRes.json();
          if (tonapiData.balances && tonapiData.balances.length > 0) {
            // Extract all jetton contract addresses to query rates in bulk
            const jettonAddresses = tonapiData.balances.map(b => b.jetton.address).join(',');
            let ratesMap = {};
            
            if (jettonAddresses) {
              try {
                const ratesRes = await fetch(`https://tonapi.io/v2/rates?tokens=${jettonAddresses}&currencies=usd`, {
                  headers: {
                    'Authorization': `Bearer AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI`
                  }
                });
                if (ratesRes.ok) {
                  const ratesData = await ratesRes.json();
                  if (ratesData.rates) {
                    Object.entries(ratesData.rates).forEach(([addr, rateInfo]) => {
                      ratesMap[addr.toLowerCase()] = {
                        price: rateInfo.prices?.USD || 0,
                        change24h: parseFloat(rateInfo.diff_24h?.USD) || 0
                      };
                    });
                  }
                }
              } catch (rateErr) {
                console.error("Error fetching rates from TonAPI", rateErr);
              }
            }
            
            tonapiData.balances.forEach(b => {
              const symbol = b.jetton.symbol;
              const decimals = b.jetton.decimals || 9;
              const jettonBalance = parseFloat(b.balance) / Math.pow(10, decimals);
              mainnetBalances[symbol] = jettonBalance;
              
              const cleanAddr = b.jetton.address.toLowerCase();
              const rate = ratesMap[cleanAddr] || { price: b.price?.prices?.USD || 0, change24h: parseFloat(b.price?.diff_24h?.USD) || 0 };
              const jettonPrice = rate.price;
              
              mainnetCostBasis[symbol] = jettonPrice ? jettonPrice / (this.tokens.TON?.price || 7.24) : 0; // estimate cost basis in TON
              
              // Register this jetton in this.tokens dynamically so the portfolio page shows its price and worth!
              this.tokens[symbol] = {
                symbol,
                name: b.jetton.name || symbol,
                address: b.jetton.address,
                price: jettonPrice,
                decimals,
                change24h: rate.change24h,
                volume24h: 0,
                liquidity: 0,
                supply: 0,
                holders: 0,
                launchpad: "TON Mainnet"
              };
            });
          }
        }
      } catch (err) {
        console.error("Error fetching jetton balances", err);
      }
      
      this.wallet = {
        address: this.realWalletAddress,
        balances: mainnetBalances,
        costBasis: mainnetCostBasis,
        realizedPnL: 0,
        history: [] // Clear sandbox history
      };
      
      // Notify prices FIRST: jetton prices must be registered before wallet state
      // triggers Portfolio useMemo recomputation (otherwise prices are 0)
      this.notifyPrices();
      this.notifyWallet();
    } catch (error) {
      console.error("Error fetching real wallet balance", error);
      this.triggerToast("Failed to fetch real wallet balances", "error");
    } finally {
      this.isFetchingWalletBalances = false;
    }
  }

  async fetchMainnetPrices() {
    if (this.networkMode !== 'mainnet') return;
    if (this.isFetchingMainnetPrices) return; // Prevent overlapping fetches
    this.isFetchingMainnetPrices = true;
    
    try {
      // 1. Fetch live TON price from TonAPI Rates
      try {
        const tonRes = await fetch("https://tonapi.io/v2/rates?tokens=ton&currencies=usd", {
          headers: {
            'Authorization': `Bearer AH65FSZB6ZIZB6IAAAAIUMSA2DWAEPRSXY456FBAL2AWTMGYEFQ7DTJXX6F5GDX27IRXLCI`
          }
        });
        if (tonRes.ok) {
          const tonData = await tonRes.json();
          if (tonData.rates?.TON?.prices?.USD) {
            const newTonPrice = parseFloat(tonData.rates.TON.prices.USD);
            if (newTonPrice > 0) {
              this.tokens.TON.price = newTonPrice;
            }
          }
        }
      } catch (e) {
        console.error("Error fetching TON price from TonAPI rates", e);
      }
      
      const mainnetTokens = { TON: this.tokens.TON };
      
      // Map GeckoTerminal DEX id to Gramfinity launchpad label
      const DEX_LAUNCHPAD_MAP = {
        'uranus':       'TopBlast.lol',
        'stonks-pump':  'sTONks',
        'stonfi':       'STON.fi Launch',
        'stonfi-v2':    'STON.fi Launch',
        'dedust':       'DeDust Launch',
        'dedust-v2':    'DeDust Launch',
        'swap-coffee':  'Swap Coffee',
        'tonco':        'Tonco',
      };
      
      // Helper to extract token entry from a pool object
      const extractPoolToken = (pool) => {
        const attributes = pool.attributes;
        const name = attributes.name || '';
        const parts = name.split(' / ');
        if (parts.length < 2) return null;
        
        let symbol = parts[0].trim();
        if (symbol === 'TON') symbol = parts[1].trim();
        if (!symbol || symbol === 'TON' || symbol === 'USDT' || symbol === 'USDC' || symbol === '[invalid]') return null;
        
        const dexId = pool.relationships?.dex?.data?.id || '';
        const price = parseFloat(attributes.base_token_price_usd || attributes.price_in_usd || 0);
        if (!price || price <= 0) return null;
        
        const volume24h = parseFloat(attributes.volume_usd?.h24 || 0);
        const liquidity = parseFloat(attributes.reserve_in_usd || 0);
        const change24h = parseFloat(attributes.price_percent_change?.h24 || 0);
        const launchpad = DEX_LAUNCHPAD_MAP[dexId] || 'TON Mainnet';
        const createdAt = attributes.pool_created_at ? new Date(attributes.pool_created_at).getTime() : Date.now();
        
        let address = pool.relationships?.base_token?.data?.id?.split('_').slice(1).join('_') || '';
        if (!address) address = 'EQ_mainnet_' + symbol;
        
        return {
          symbol,
          name: attributes.base_token_name || symbol,
          address,
          price,
          change1h: parseFloat(attributes.price_percent_change?.h1 || 0),
          change24h,
          volume24h,
          volume1h: volume24h / 24,
          volume5m: volume24h / 288,
          buySellRatio: 0.55,
          holdersGrowth: 0,
          initialLiquidity: liquidity * 0.8,
          devWallet: 'EQ_mainnet_dev_' + symbol,
          launchTime: createdAt,
          category: 'DeFi',
          logoBg: 'linear-gradient(135deg, #1e293b, #0f172a)',
          socialLinks: { telegram: 'https://t.me/toncoin', x: 'https://x.com', website: 'https://ton.org' },
          liquidity,
          supply: price > 0 ? liquidity / price : 0,
          holders: Math.round(liquidity / 10),
          security: { rugScore: Math.floor(Math.random() * 15), rugRisk: 'Low Risk', verified: true, renounced: true, lockedLiquidity: 90 },
          decimals: 9,
          launchpad
        };
      };
      
      // 2. Fetch new pools (last 24h launches across ALL DEXes on TON)
      try {
        const newPoolsRes = await fetch("https://api.geckoterminal.com/api/v2/networks/ton/new_pools?page=1");
        if (newPoolsRes.ok) {
          const newPoolsData = await newPoolsRes.json();
          newPoolsData.data?.forEach(pool => {
            const token = extractPoolToken(pool);
            if (token && !mainnetTokens[token.symbol]) {
              mainnetTokens[token.symbol] = token;
              if (!this.charts[token.symbol]) {
                this.charts[token.symbol] = generateInitialChartData(token.price, 60);
              }
            }
          });
        }
      } catch (e) {
        console.error("Error fetching new TON pools", e);
      }
      
      // 3. Fetch TopBlast.lol (Uranus DEX) pools specifically
      try {
        const tbRes = await fetch("https://api.geckoterminal.com/api/v2/networks/ton/dexes/uranus/pools?page=1");
        if (tbRes.ok) {
          const tbData = await tbRes.json();
          tbData.data?.forEach(pool => {
            const token = extractPoolToken(pool);
            if (token) {
              // Always label as TopBlast, prefer higher volume entry
              if (!mainnetTokens[token.symbol] || token.volume24h > (mainnetTokens[token.symbol].volume24h || 0)) {
                mainnetTokens[token.symbol] = { ...token, launchpad: 'TopBlast.lol' };
                if (!this.charts[token.symbol]) {
                  this.charts[token.symbol] = generateInitialChartData(token.price, 80);
                } else {
                  const cd = this.charts[token.symbol];
                  if (cd.length > 0) cd[cd.length - 1].close = token.price;
                }
              }
            }
          });
        }
      } catch (e) {
        console.error("Error fetching TopBlast (Uranus) pools", e);
      }
      
      // 4. Fetch sTONks pools
      try {
        const stonksRes = await fetch("https://api.geckoterminal.com/api/v2/networks/ton/dexes/stonks-pump/pools?page=1");
        if (stonksRes.ok) {
          const stonksData = await stonksRes.json();
          stonksData.data?.forEach(pool => {
            const token = extractPoolToken(pool);
            if (token) {
              if (!mainnetTokens[token.symbol] || token.volume24h > (mainnetTokens[token.symbol].volume24h || 0)) {
                mainnetTokens[token.symbol] = { ...token, launchpad: 'sTONks' };
                if (!this.charts[token.symbol]) {
                  this.charts[token.symbol] = generateInitialChartData(token.price, 80);
                }
              }
            }
          });
        }
      } catch (e) {
        console.error("Error fetching sTONks pools", e);
      }
      
      // 5. Fetch trending pools on TON network (fills in established tokens)
      try {
        const trendingRes = await fetch("https://api.geckoterminal.com/api/v2/networks/ton/trending_pools?page=1");
        if (trendingRes.ok) {
          const trendingData = await trendingRes.json();
          trendingData.data?.forEach(pool => {
            const token = extractPoolToken(pool);
            if (token && !mainnetTokens[token.symbol]) {
              mainnetTokens[token.symbol] = token;
              if (!this.charts[token.symbol]) {
                this.charts[token.symbol] = generateInitialChartData(token.price, 120);
              } else {
                const cd = this.charts[token.symbol];
                if (cd.length > 0) cd[cd.length - 1].close = token.price;
              }
            }
          });
        }
      } catch (e) {
        console.error("Error fetching trending TON pools", e);
      }

      // 6. Fetch dynamic live launches from backend indexer API if running
      try {
        const apiBase = window.location.port === '3000' ? 'http://localhost:4000' : '';
        const backendRes = await fetch(`${apiBase}/api/tokens`);
        if (backendRes.ok) {
          const backendTokens = await backendRes.json();
          backendTokens.forEach(token => {
            const price = token.price || 0.0092;
            mainnetTokens[token.symbol] = {
              symbol: token.symbol,
              name: token.name,
              address: token.address,
              price: price,
              change1h: 0,
              change24h: 0,
              volume24h: 12000,
              volume1h: 500,
              volume5m: 40,
              buySellRatio: 0.5,
              holdersGrowth: 0,
              initialLiquidity: 5000,
              devWallet: "EQ_indexer_dev",
              launchTime: new Date(token.created_at).getTime(),
              category: "DeFi",
              logoBg: "linear-gradient(135deg, #0f172a, #1e293b)",
              socialLinks: { telegram: "https://t.me/toncoin", x: "https://x.com" },
              liquidity: 8000,
              supply: 10000000,
              holders: 120,
              security: { rugScore: 12, rugRisk: "Low Risk", verified: true, renounced: true, lockedLiquidity: 80 },
              decimals: 9,
              launchpad: token.launchpad,
              isDex: false,
              bondingProgress: token.bonding_progress
            };
          });
        }
      } catch (err) {
        // Silence API fetch errors
      }

      // Merge into existing tokens in-place (never wipe the list between fetches)
      Object.assign(this.tokens, mainnetTokens);
      this.notifyPrices();
    } catch (e) {
      console.error("Error loading Mainnet prices", e);
    } finally {
      this.isFetchingMainnetPrices = false;
    }
  }

  subscribePrices(callback) {
    this.priceListeners.push(callback);
    callback(this.tokens);
    return () => {
      this.priceListeners = this.priceListeners.filter(cb => cb !== callback);
    };
  }

  subscribeWhales(callback) {
    this.whaleListeners.push(callback);
    callback(this.whales);
    return () => {
      this.whaleListeners = this.whaleListeners.filter(cb => cb !== callback);
    };
  }

  subscribeWallet(callback) {
    this.walletListeners.push(callback);
    callback(this.wallet);
    return () => {
      this.walletListeners = this.walletListeners.filter(cb => cb !== callback);
    };
  }

  subscribeAlerts(callback) {
    this.alertListeners.push(callback);
    callback(this.alerts);
    return () => {
      this.alertListeners = this.alertListeners.filter(cb => cb !== callback);
    };
  }

  subscribeCopyTrades(callback) {
    this.copyTradeListeners.push(callback);
    return () => {
      this.copyTradeListeners = this.copyTradeListeners.filter(cb => cb !== callback);
    };
  }

  subscribeWhaleTxFeed(callback) {
    this.whaleTxFeedListeners.push(callback);
    callback([...this.whaleTxFeed]);
    return () => {
      this.whaleTxFeedListeners = this.whaleTxFeedListeners.filter(cb => cb !== callback);
    };
  }

  subscribeCopyLogs(callback) {
    this.copyLogsListeners.push(callback);
    callback([...this.copyLogs]);
    return () => {
      this.copyLogsListeners = this.copyLogsListeners.filter(cb => cb !== callback);
    };
  }

  notifyCopyTrades(log) {
    this.copyTradeListeners.forEach(cb => cb(log));
  }

  notifyWhaleTxFeed() {
    this.whaleTxFeedListeners.forEach(cb => cb([...this.whaleTxFeed]));
  }

  notifyCopyLogs() {
    this.copyLogsListeners.forEach(cb => cb([...this.copyLogs]));
  }

  // Actions
  swap(type, tokenSymbol, quantity, tpSetting = null, slSetting = null) {
    const tonPrice = this.tokens.TON.price;
    const targetPrice = this.tokens[tokenSymbol].price;
    
    if (type === "BUY") {
      const tonAmount = parseFloat(quantity);
      if (isNaN(tonAmount) || tonAmount <= 0) return { success: false, error: "Invalid amount" };
      if (this.wallet.balances.TON < tonAmount + 0.05) return { success: false, error: "Insufficient GRAM balance (need 0.05 GRAM for gas)" };
      
      const tokensToReceive = (tonAmount * tonPrice) / targetPrice;
      
      // Calculate new weighted cost basis
      const currentBalance = this.wallet.balances[tokenSymbol] || 0;
      const currentCostBasis = this.wallet.costBasis[tokenSymbol] || targetPrice;
      const totalCost = (currentBalance * currentCostBasis) + (tokensToReceive * targetPrice);
      const newBalance = currentBalance + tokensToReceive;
      this.wallet.costBasis[tokenSymbol] = newBalance > 0 ? parseFloat((totalCost / newBalance).toFixed(8)) : targetPrice;

      this.wallet.balances.TON = parseFloat((this.wallet.balances.TON - tonAmount - 0.05).toFixed(4));
      this.wallet.balances[tokenSymbol] = parseFloat((newBalance).toFixed(2));

      // Save positions settings
      if (!this.wallet.positionsSettings) this.wallet.positionsSettings = {};
      this.wallet.positionsSettings[tokenSymbol] = {
        tp: tpSetting?.tp || 100,
        sl: slSetting?.sl || 50,
        tpActive: tpSetting?.active || false,
        slActive: slSetting?.active || false
      };
      
      const tx = {
        id: "tx_" + Date.now(),
        time: Date.now(),
        type: "BUY",
        token: tokenSymbol,
        amountToken: parseFloat(tokensToReceive.toFixed(4)),
        amountTON: tonAmount,
        priceUSD: targetPrice,
        gasTON: 0.05,
        txHash: "EQC_swap_" + Math.random().toString(36).substring(2, 15)
      };
      
      this.wallet.history = [tx, ...this.wallet.history];
      this.notifyWallet();
      this.triggerToast(`Successfully swapped ${tonAmount} GRAM for ${tx.amountToken.toLocaleString()} ${tokenSymbol}!`, "success");
      return { success: true };
    } else {
      // SELL
      const tokenAmount = parseFloat(quantity);
      if (isNaN(tokenAmount) || tokenAmount <= 0) return { success: false, error: "Invalid amount" };
      if ((this.wallet.balances[tokenSymbol] || 0) < tokenAmount) return { success: false, error: `Insufficient ${tokenSymbol} balance` };
      if (this.wallet.balances.TON < 0.05) return { success: false, error: "Insufficient GRAM for gas fees (0.05 GRAM)" };
      
      const tonToReceive = (tokenAmount * targetPrice) / tonPrice;
      
      // Calculate realized profit/loss
      const costBasis = this.wallet.costBasis[tokenSymbol] || targetPrice;
      const profitUSD = tokenAmount * (targetPrice - costBasis);
      this.wallet.realizedPnL = parseFloat(((this.wallet.realizedPnL || 0) + profitUSD).toFixed(2));

      this.wallet.balances[tokenSymbol] = parseFloat((this.wallet.balances[tokenSymbol] - tokenAmount).toFixed(4));
      this.wallet.balances.TON = parseFloat((this.wallet.balances.TON + tonToReceive - 0.05).toFixed(4));
      
      const tx = {
        id: "tx_" + Date.now(),
        time: Date.now(),
        type: "SELL",
        token: tokenSymbol,
        amountToken: tokenAmount,
        amountTON: parseFloat(tonToReceive.toFixed(4)),
        priceUSD: targetPrice,
        gasTON: 0.05,
        txHash: "EQC_swap_" + Math.random().toString(36).substring(2, 15)
      };
      
      this.wallet.history = [tx, ...this.wallet.history];
      this.notifyWallet();
      this.triggerToast(`Successfully swapped ${tokenAmount.toLocaleString()} ${tokenSymbol} for ${tx.amountTON.toLocaleString()} GRAM!`, "success");
      return { success: true };
    }
  }

  toggleCopyTrading(whaleAddress, allocation = 100, slippage = 1.0) {
    this.whales = this.whales.map(w => {
      if (w.address === whaleAddress) {
        const nextState = !w.copied;
        if (nextState) {
          this.triggerToast(`Started copy trading ${w.name} with ${allocation} GRAM max limit!`, "success");
        } else {
          this.triggerToast(`Stopped copy trading ${w.name}.`, "info");
        }
        return { ...w, copied: nextState, allocation, slippage };
      }
      return w;
    });
    this.notifyWhales();
    this.saveSettingsToCloud();
  }

  createAlert(symbol, condition, target) {
    const newAlert = {
      id: "a_" + Date.now(),
      symbol,
      condition,
      target: parseFloat(target),
      active: true
    };
    this.alerts = [...this.alerts, newAlert];
    this.notifyAlerts();
    this.triggerToast(`Alert set for ${symbol} going ${condition.toLowerCase()} $${target}!`, "success");
    this.saveSettingsToCloud();
  }

  removeAlert(id) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.notifyAlerts();
    this.saveSettingsToCloud();
  }

  saveSettingsToCloud() {
    try {
      const storage = window.Telegram?.WebApp?.CloudStorage;
      if (storage) {
        const payload = JSON.stringify({
          alerts: this.alerts,
          whales: this.whales.map(w => ({ address: w.address, copied: w.copied, allocation: w.allocation, slippage: w.slippage }))
        });
        storage.setItem('gramfinity_settings', payload, (err, success) => {
          if (success) console.log("Settings synced to Telegram cloud storage");
        });
      }
    } catch (e) {
      console.warn("Cloud save error", e);
    }
  }

  loadSettingsFromCloud() {
    try {
      const storage = window.Telegram?.WebApp?.CloudStorage;
      if (storage) {
        storage.getItem('gramfinity_settings', (err, value) => {
          if (!err && value) {
            try {
              const data = JSON.parse(value);
              if (data.alerts) {
                this.alerts = data.alerts;
                this.notifyAlerts();
              }
              if (data.whales) {
                this.whales = this.whales.map(w => {
                  const cloudWhale = data.whales.find(cw => cw.address === w.address);
                  return cloudWhale ? { ...w, ...cloudWhale } : w;
                });
                this.notifyWhales();
              }
              console.log("Settings loaded from Telegram cloud storage");
            } catch (pErr) {
              console.warn("Failed parsing cloud storage content", pErr);
            }
          }
        });
      }
    } catch (e) {
      console.warn("Cloud load error", e);
    }
  }

  // Internal trigger notifications
  notifyPrices() {
    // Only augment with sandbox metadata in sandbox mode — augmentation adds random values
    // that cause visible flicker in mainnet mode on every notify call
    if (this.networkMode !== 'mainnet') {
      Object.keys(this.tokens).forEach(symbol => {
        this.tokens[symbol] = this.augmentTokenMetadata(symbol, this.tokens[symbol]);
      });
    }
    this.priceListeners.forEach(cb => cb({ ...this.tokens }));
  }

  augmentTokenMetadata(symbol, token) {
    if (!token) return token;
    if (symbol === 'TON') return token;
    
    // Default mock data if not already set
    const ageMins = Math.floor((Date.now() - (token.launchTime || Date.now())) / (60 * 1000));
    
    // Determine lifecycle stage based on age and DEX status
    let lifecycle = "DEX Trading";
    if (token.launchpad === "Gaspump" || token.launchpad === "TonFun") {
      if (ageMins < 5) lifecycle = "Created";
      else if (ageMins < 15) lifecycle = "Launched";
      else if (token.liquidity < 150000) lifecycle = "First Liquidity";
      else lifecycle = "Newly Migrated";
    } else if (token.change24h < -10) {
      lifecycle = "Decline";
    } else if (token.change24h > 15) {
      lifecycle = "Growth";
    }

    const mockClusters = {
      TONY: ["Deployer Funding Hub (2 addresses)", "Sniper Group A (4 addresses)"],
      REDO: ["Core Dev Wallet Cluster (3 addresses)"],
      HMSTR: ["Vesting Allocation Cluster (15 addresses)"],
      DOGS: ["Sybil Claim Cluster (120 addresses)"],
      NOT: ["Pre-sale Snipers Cluster #3 (8 addresses)"],
      GRAM: ["PoW Mining Pool Clusters (6 addresses)"]
    };

    const mockWhyTrending = {
      TONY: "Mentions velocity surged +420% after Pavel Durov channel post. 3 Smart Wallets entered early.",
      REDO: "Narrative: Pavel Durov resistance fight support posts. Holders count +140% in 1h.",
      DOGS: "Volume surge +320% after major CEX migration announcement. 5 Whales entered.",
      NOT: "Activity spike +180% following new Telegram gaming launches announcement.",
      HMSTR: "DEX liquidity pool expansion pool launched +80% volume increase.",
      GRAM: "Proof-of-work mining volume increase +70% on STON.fi."
    };

    const tgMentionsBase = Math.round((token.volume24h || 1000) / 10000);
    
    return {
      ...token,
      telegramMentions: token.telegramMentions || Math.max(12, tgMentionsBase),
      telegramVelocity: token.telegramVelocity || Math.round(tgMentionsBase * 0.05 + 2 + (Math.random() * 5)),
      telegramGrowth: token.telegramGrowth || parseFloat(((token.holdersGrowth || 0) * 1.5 + (Math.random() - 0.5) * 5).toFixed(1)),
      whyTrending: token.whyTrending || mockWhyTrending[symbol] || "Volume spikes and on-chain whale activity increases.",
      lifecycle: token.lifecycle || lifecycle,
      clusters: token.clusters || mockClusters[symbol] || ["No coordinated wallet clustering detected"]
    };
  }

  notifyWhales() {
    this.whaleListeners.forEach(cb => cb([...this.whales]));
  }

  notifyWallet() {
    this.walletListeners.forEach(cb => cb({ ...this.wallet }));
  }

  notifyAlerts() {
    this.alertListeners.forEach(cb => cb([...this.alerts]));
  }

  registerToastEmitter(emitter) {
    this.toastEmitter = emitter;
  }

  triggerToast(message, type = "info") {
    if (this.toastEmitter) {
      this.toastEmitter(message, type);
    }
    
    // Native Telegram WebApp Haptic Feedback
    try {
      const haptic = window.Telegram?.WebApp?.HapticFeedback;
      if (haptic) {
        if (type === 'success' || type === 'buy') {
          haptic.notificationOccurred('success');
        } else if (type === 'error' || type === 'sell') {
          haptic.notificationOccurred('error');
        } else if (type === 'alert' || type === 'warning') {
          haptic.notificationOccurred('warning');
        } else {
          haptic.impactOccurred('light');
        }
      }
    } catch (e) {
      console.warn("Haptic feedback error", e);
    }
  }

  // Holder generation logic for any token
  getHolderAnalysis(symbol) {
    const token = this.tokens[symbol];
    if (!token) return [];
    
    const topHolders = [
      { address: "EQA_Creator_Wallet_92a3", name: "Creator / Deployer", percentage: symbol === "TONY" ? 45.0 : 1.5, type: "creator" },
      { address: "EQB_DeDust_Liquidity_Pool", name: "DeDust TON Pool", percentage: symbol === "TONY" ? 20.0 : 35.0, type: "pool" },
      { address: "EQC_StonFi_Liquidity_Pool", name: "STON.fi Pool", percentage: symbol === "TONY" ? 5.0 : 25.0, type: "pool" },
      { address: "EQD_Locked_Vesting_Wallet", name: "Locked Ecosystem Vesting", percentage: symbol === "TONY" ? 10.0 : 15.0, type: "locked" }
    ];
    
    let sumPercentage = topHolders.reduce((sum, h) => sum + h.percentage, 0);
    
    const whaleNames = ["Shark Degen", "Giga Whale", "TON Venture Pool", "Early Jetton Arbitrageur", "HODLer Telegram Premium", "Durov Friend"];
    for (let i = 0; i < 6; i++) {
      let percent = (100 - sumPercentage) * (Math.random() * 0.35 + 0.05);
      topHolders.push({
        address: `EQ${Math.floor(Math.random() * 10)}...${Math.random().toString(36).substring(2, 6)}`,
        name: whaleNames[i],
        percentage: parseFloat(percent.toFixed(2)),
        type: "whale"
      });
      sumPercentage += percent;
    }
    
    topHolders.push({
      address: "0x_retail",
      name: "Other retail addresses",
      percentage: parseFloat((100 - sumPercentage).toFixed(2)),
      type: "retail"
    });
    
    return topHolders.sort((a,b) => b.percentage - a.percentage);
  }

  // Get order book snapshot
  getOrderBook(symbol) {
    const price = this.tokens[symbol]?.price || 1.0;
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < 8; i++) {
      let bidPrice = price * (1 - (i + 1) * 0.0008);
      bids.push({
        price: bidPrice,
        size: Math.random() * 20000 + 500,
        total: 0
      });
      
      let askPrice = price * (1 + (i + 1) * 0.0008);
      asks.push({
        price: askPrice,
        size: Math.random() * 20000 + 500,
        total: 0
      });
    }
    
    bids.sort((a,b) => b.price - a.price);
    asks.sort((a,b) => a.price - b.price);
    
    let bidTotal = 0;
    bids.forEach(b => {
      bidTotal += b.price * b.size;
      b.total = bidTotal;
    });
    
    let askTotal = 0;
    asks.forEach(a => {
      askTotal += a.price * a.size;
      a.total = askTotal;
    });
    
    return { bids, asks };
  }

  // Simulate dynamically launching a new token on TON launchpads!
  simulateNewTokenLaunch() {
    if (this.potentialTickers.length === 0) return;
    
    // Pick a ticker to launch
    const idx = Math.floor(Math.random() * this.potentialTickers.length);
    const newLaunch = this.potentialTickers.splice(idx, 1)[0];
    
    const symbol = newLaunch.ticker;
    const initialPrice = parseFloat((Math.random() * 0.001 + 0.00001).toFixed(7));
    const randomAddress = "EQ" + Math.random().toString(36).substring(2, 7).toUpperCase() + "..." + Math.random().toString(36).substring(2, 6).toUpperCase() + `_${symbol.toLowerCase()}`;
    const devAddress = "EQ" + Math.random().toString(36).substring(2, 7).toUpperCase() + "..." + Math.random().toString(36).substring(2, 6).toUpperCase() + `_dev`;
    const rugScore = Math.floor(Math.random() * 80 + 5);
    let risk = "Low Risk";
    if (rugScore > 60) risk = "High Risk";
    else if (rugScore > 20) risk = "Medium Risk";
    else risk = "Safe";
    
    const categories = ["Meme", "DeFi", "Gaming"];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const colorBgs = [
      "linear-gradient(135deg, #ec4899, #be185d)", // pink/rose
      "linear-gradient(135deg, #3b82f6, #1d4ed8)", // blue
      "linear-gradient(135deg, #10b981, #047857)", // emerald
      "linear-gradient(135deg, #f59e0b, #d97706)", // amber
      "linear-gradient(135deg, #8b5cf6, #6d28d9)", // purple
      "linear-gradient(135deg, #ef4444, #b91c1c)"  // red
    ];
    const logoBg = colorBgs[Math.floor(Math.random() * colorBgs.length)];
    
    const initLiq = Math.round(Math.random() * 60000 + 8000);
    
    this.tokens[symbol] = {
      symbol,
      name: newLaunch.name,
      address: randomAddress,
      price: initialPrice,
      change1h: 0,
      change24h: 0,
      volume24h: Math.round(Math.random() * 15000 + 500),
      volume1h: Math.round(Math.random() * 3000 + 100),
      volume5m: Math.round(Math.random() * 200 + 5),
      buySellRatio: parseFloat((Math.random() * 0.3 + 0.35).toFixed(2)),
      holdersGrowth: parseFloat((Math.random() * 10 - 2).toFixed(1)),
      initialLiquidity: initLiq,
      devWallet: devAddress,
      launchTime: Date.now(),
      category: category,
      logoBg: logoBg,
      socialLinks: {
        telegram: `https://t.me/gramfinity_mock_${symbol.toLowerCase()}`,
        x: `https://x.com/gramfinity_mock_${symbol.toLowerCase()}`,
        website: `https://mock_${symbol.toLowerCase()}.xyz`
      },
      liquidity: initLiq,
      supply: Math.round(Math.random() * 900000000 + 100000000),
      holders: Math.round(Math.random() * 150 + 5),
      security: {
        rugScore,
        rugRisk: risk,
        verified: Math.random() > 0.4,
        renounced: Math.random() > 0.5,
        lockedLiquidity: Math.floor(Math.random() * 100),
        creatorBalance: Math.floor(Math.random() * 25)
      },
      decimals: 9,
      launchpad: newLaunch.launchpad,
      description: `Newly minted token on TON, originally compiled via ${newLaunch.launchpad} scanner.`
    };
    
    // Generate charts
    this.charts[symbol] = generateInitialChartData(initialPrice, 60);
    
    this.notifyPrices();
    this.triggerToast(`🚀 NEW TON LAUNCH: $${symbol} ($${initialPrice}) just launched via ${newLaunch.launchpad}! Trade instantly on Gramfinity.`, "success");
  }

  // Simulation runner
  startSimulation() {
    // Live price movements — sandbox updates every 3.5s, mainnet refreshes every 60s
    setInterval(() => {
      if (this.networkMode === 'mainnet') {
        // Mainnet: do NOT run the mock sandbox price simulation loop
        return;
      }

      const priceUpdatedSymbols = [];
      
      Object.keys(this.tokens).forEach(symbol => {
        const token = this.tokens[symbol];
        
        let volatility = 0.003;
        if (symbol === "TONY" || symbol === "PEPE" || symbol === "WOJAK" || symbol === "PUMP") volatility = 0.025; // High meme volatility
        if (symbol === "TON") volatility = 0.0008;
        if (symbol === "NOT" || symbol === "DOGS" || symbol === "HMSTR") volatility = 0.006;
        
        const direction = Math.random() - 0.485;
        const pct = direction * volatility;
        const oldPrice = token.price;
        token.price = parseFloat((token.price * (1 + pct)).toFixed(token.price < 0.01 ? 7 : 4));
        
        token.change1h = parseFloat((token.change1h + pct * 50).toFixed(2));
        token.change24h = parseFloat((token.change24h + pct * 15).toFixed(2));
        token.volume24h = Math.round(token.volume24h + (Math.random() - 0.2) * 50000);
        
        // Dynamic sub-volume timeframes
        token.volume1h = Math.round(token.volume24h * (0.05 + Math.random() * 0.08));
        token.volume5m = Math.round(token.volume1h * (0.04 + Math.random() * 0.06));
        
        // Buy/Sell Ratio changes slightly
        const ratioShift = (Math.random() - 0.5) * 0.04;
        token.buySellRatio = parseFloat(Math.max(0.15, Math.min(0.85, token.buySellRatio + ratioShift)).toFixed(2));
        
        // Holders change and holder growth updates
        const holderChange = Math.round((Math.random() - 0.45) * 15);
        if (symbol !== 'TON') {
          token.holders = Math.max(10, token.holders + holderChange);
          token.holdersGrowth = parseFloat((token.holdersGrowth + (Math.random() - 0.48) * 1.5).toFixed(2));
        }
        
        const chartData = this.charts[symbol];
        if (chartData && chartData.length > 0) {
          const lastBar = chartData[chartData.length - 1];
          const now = Date.now();
          
          if (now - lastBar.time < 1000 * 60 * 5) {
            lastBar.close = token.price;
            lastBar.high = Math.max(lastBar.high, token.price);
            lastBar.low = Math.min(lastBar.low, token.price);
          } else {
            chartData.push({
              time: lastBar.time + 1000 * 60 * 5,
              open: lastBar.close,
              high: Math.max(lastBar.close, token.price),
              low: Math.min(lastBar.close, token.price),
              close: token.price,
              volume: Math.random() * 50000 + 1000
            });
            if (chartData.length > 200) chartData.shift();
          }
        }
        
        priceUpdatedSymbols.push(symbol);
        this.checkAlertsForToken(symbol, oldPrice, token.price);
      });
      
      this.notifyPrices();
      this.checkDeFiOrdersAndTriggers();
      
      if (Math.random() < 0.15) {
        this.simulateWhaleTransaction();
      }
    }, 3500);

    // Periodically launch new tokens every 24 seconds (sandbox only)!
    setInterval(() => {
      if (this.networkMode === 'mainnet') return;
      this.simulateNewTokenLaunch();
    }, 24000);

    // Mainnet: refresh prices every 60 seconds to stay current without hammering APIs
    setInterval(() => {
      if (this.networkMode !== 'mainnet') return;
      this.fetchMainnetPrices();
    }, 60000);

    // Mainnet: refresh wallet balances every 90 seconds
    setInterval(() => {
      if (this.networkMode !== 'mainnet') return;
      this.fetchRealWalletBalances();
    }, 90000);
  }

  checkAlertsForToken(symbol, oldPrice, newPrice) {
    this.alerts = this.alerts.map(alert => {
      if (alert.active && alert.symbol === symbol) {
        const triggeredAbove = alert.condition === "ABOVE" && oldPrice < alert.target && newPrice >= alert.target;
        const triggeredBelow = alert.condition === "BELOW" && oldPrice > alert.target && newPrice <= alert.target;
        
        if (triggeredAbove || triggeredBelow) {
          this.triggerToast(`🚨 ALERT TRIGGERED: ${symbol} is now $${newPrice} (Target: ${alert.condition.toLowerCase()} $${alert.target})`, "alert");
          return { ...alert, active: false };
        }
      }
      return alert;
    });
    this.notifyAlerts();
  }

  simulateWhaleTransaction() {
    const whale = this.whales[Math.floor(Math.random() * this.whales.length)];
    const jettons = Object.keys(this.tokens).filter(k => k !== "TON");
    const targetSymbol = jettons[Math.floor(Math.random() * jettons.length)];
    const token = this.tokens[targetSymbol];
    
    const isBuy = Math.random() > 0.4;
    const amountUSD = Math.random() * 15000 + 2000;
    const quantity = amountUSD / token.price;
    const tonEquivalent = amountUSD / this.tokens.TON.price;
    
    if (whale.copied) {
      const copyAllocation = whale.allocation || 10;
      const userTonAmount = Math.min(tonEquivalent * 0.05, copyAllocation);
      
      if (isBuy) {
        this.swap("BUY", targetSymbol, userTonAmount);
        const logMsg = `COPY_TRADE_EXECUTION: Copied ${whale.name} buying ${targetSymbol} for ${userTonAmount.toFixed(2)} GRAM`;
        this.triggerToast(logMsg, "success");
        
        const newLog = {
          id: "copy_" + Date.now() + Math.random(),
          time: Date.now(),
          whaleName: whale.name,
          type: "BUY",
          token: targetSymbol,
          amountTON: userTonAmount,
          amountToken: parseFloat(((userTonAmount * this.tokens.TON.price) / token.price).toFixed(2)),
          priceUSD: token.price,
          txHash: "EQC_copy_" + Math.random().toString(36).substring(2, 8).toUpperCase()
        };
        
        this.notifyCopyTrades(newLog);
        this.copyLogs = [{
          id: newLog.id,
          time: newLog.time,
          text: `🤖 COPY: Cloned ${newLog.whaleName} BUY of ${newLog.amountToken.toLocaleString()} ${newLog.token} @ $${newLog.priceUSD.toFixed(newLog.priceUSD < 0.01 ? 6 : 4)} (${newLog.amountTON.toFixed(2)} GRAM, Tx: ${newLog.txHash})`
        }, ...this.copyLogs].slice(0, 50);
        this.notifyCopyLogs();
      } else {
        const userBalance = this.wallet.balances[targetSymbol] || 0;
        if (userBalance > 0) {
          const userSellAmount = Math.min(userBalance, quantity * 0.05);
          this.swap("SELL", targetSymbol, userSellAmount);
          const logMsg = `COPY_TRADE_EXECUTION: Copied ${whale.name} selling ${userSellAmount.toFixed(2)} ${targetSymbol}`;
          this.triggerToast(logMsg, "success");
          
          const newLog = {
            id: "copy_" + Date.now() + Math.random(),
            time: Date.now(),
            whaleName: whale.name,
            type: "SELL",
            token: targetSymbol,
            amountTON: parseFloat(((userSellAmount * token.price) / this.tokens.TON.price).toFixed(2)),
            amountToken: userSellAmount,
            priceUSD: token.price,
            txHash: "EQC_copy_" + Math.random().toString(36).substring(2, 8).toUpperCase()
          };
          
          this.notifyCopyTrades(newLog);
          this.copyLogs = [{
            id: newLog.id,
            time: newLog.time,
            text: `🤖 COPY: Cloned ${newLog.whaleName} SELL of ${newLog.amountToken.toLocaleString()} ${newLog.token} @ $${newLog.priceUSD.toFixed(newLog.priceUSD < 0.01 ? 6 : 4)} (${newLog.amountTON.toFixed(2)} GRAM, Tx: ${newLog.txHash})`
          }, ...this.copyLogs].slice(0, 50);
          this.notifyCopyLogs();
        }
      }
    }
    
    if (isBuy) {
      if (!this.tokenSmartMoneyEntries[targetSymbol]) {
        this.tokenSmartMoneyEntries[targetSymbol] = [];
      }
      if (!this.tokenSmartMoneyEntries[targetSymbol].includes(whale.address)) {
        this.tokenSmartMoneyEntries[targetSymbol].push(whale.address);
        const count = this.tokenSmartMoneyEntries[targetSymbol].length;
        if (count >= 2) {
          this.triggerToast(`🧠 Smart Money Concentration: ${count} tracked wallets have entered $${targetSymbol}!`, "alert");
        }
      }
    }
    
    const emoji = isBuy ? "🟢" : "🔴";
    const action = isBuy ? "BOUGHT" : "SOLD";
    const notificationText = `${emoji} WHALE TX: ${whale.name} ${action} $${amountUSD.toLocaleString(undefined, {maximumFractionDigits:0})} of $${targetSymbol} (${quantity.toLocaleString(undefined, {maximumFractionDigits:0})} tokens)`;
    
    // Add to persistent whale tx feed
    const newItem = {
      id: "wtx_" + Date.now() + Math.random(),
      time: Date.now(),
      whaleName: whale.name,
      type: isBuy ? "BUY" : "SELL",
      token: targetSymbol,
      amountUSD: Math.round(amountUSD),
      amountToken: Math.round(quantity),
      tonEquivalent: Math.round(tonEquivalent),
      txHash: "EQ_whale_" + Math.random().toString(36).substring(2, 7).toUpperCase()
    };
    this.whaleTxFeed = [newItem, ...this.whaleTxFeed].slice(0, 50);
    this.notifyWhaleTxFeed();

    this.triggerToast(notificationText, isBuy ? "buy" : "sell");
  }
  // Wallet profiles switcher methods
  subscribeActiveWalletId(cb) {
    this.activeWalletListeners.push(cb);
    cb(this.activeWalletId);
    return () => {
      this.activeWalletListeners = this.activeWalletListeners.filter(l => l !== cb);
    };
  }

  setActiveWalletId(id) {
    const selected = this.wallets.find(w => w.id === id);
    if (selected) {
      this.activeWalletId = id;
      this.wallet = selected;
      this.notifyWallet();
      this.activeWalletListeners.forEach(cb => cb(id));
      this.triggerToast(`Switched active wallet to ${selected.name}`, "info");
    }
  }

  // Advanced DeFi orders hooks
  subscribeLimitOrders(cb) {
    this.limitOrderListeners.push(cb);
    cb([...this.limitOrders]);
    return () => {
      this.limitOrderListeners = this.limitOrderListeners.filter(l => l !== cb);
    };
  }

  notifyLimitOrders() {
    this.limitOrderListeners.forEach(cb => cb([...this.limitOrders]));
  }

  subscribeDcaOrders(cb) {
    this.dcaOrderListeners.push(cb);
    cb([...this.dcaOrders]);
    return () => {
      this.dcaOrderListeners = this.dcaOrderListeners.filter(l => l !== cb);
    };
  }

  notifyDcaOrders() {
    this.dcaOrderListeners.forEach(cb => cb([...this.dcaOrders]));
  }

  addLimitOrder(symbol, type, amountTON, triggerPrice) {
    const newOrder = {
      id: 'limit_' + Date.now(),
      symbol,
      type,
      amountTON,
      triggerPrice: parseFloat(triggerPrice),
      active: true,
      time: Date.now()
    };
    this.limitOrders.push(newOrder);
    this.triggerToast(`Limit Order set: ${type} $${symbol} when price is $${triggerPrice}`, "success");
    this.notifyLimitOrders();
  }

  addDcaOrder(symbol, amountTON, intervalMins, iterations) {
    const newOrder = {
      id: 'dca_' + Date.now(),
      symbol,
      amountTON: parseFloat(amountTON),
      intervalMins: parseInt(intervalMins, 10),
      iterations: parseInt(iterations, 10),
      remainingIterations: parseInt(iterations, 10),
      lastExecuted: 0,
      active: true,
      time: Date.now()
    };
    this.dcaOrders.push(newOrder);
    this.triggerToast(`DCA Order set: Buy ${amountTON} GRAM of $${symbol} every ${intervalMins}m (${iterations} times)`, "success");
    this.notifyDcaOrders();
  }

  updatePositionTpSl(symbol, tp, sl, tpActive, slActive) {
    if (!this.wallet.positionsSettings) this.wallet.positionsSettings = {};
    this.wallet.positionsSettings[symbol] = {
      tp: parseFloat(tp),
      sl: parseFloat(sl),
      tpActive,
      slActive
    };
    this.notifyWallet();
    this.triggerToast(`Updated TP/SL thresholds for $${symbol}`, "success");
  }

  checkDeFiOrdersAndTriggers() {
    if (this.networkMode === 'mainnet') return;
    
    // 1. Process Limit Orders
    this.limitOrders = this.limitOrders.map(order => {
      if (!order.active) return order;
      
      const token = this.tokens[order.symbol];
      if (!token) return order;
      
      const currentPrice = token.price;
      const isHit = order.type === 'BUY' 
        ? currentPrice <= order.triggerPrice 
        : currentPrice >= order.triggerPrice;
        
      if (isHit) {
        order.active = false;
        this.swap(order.type, order.symbol, order.amountTON);
        this.triggerToast(`🎯 Limit Order Triggered: Executed ${order.type} of $${order.symbol} at trigger $${order.triggerPrice}!`, "success");
      }
      return order;
    });
    this.notifyLimitOrders();

    // 2. Process DCA Orders
    const now = Date.now();
    this.dcaOrders = this.dcaOrders.map(order => {
      if (!order.active || order.remainingIterations <= 0) return order;
      
      const timePassed = now - order.lastExecuted;
      const mockIntervalMs = order.intervalMins * 3000; // speed up time for simulator: 3s per minute
      
      if (timePassed >= mockIntervalMs) {
        order.remainingIterations -= 1;
        order.lastExecuted = now;
        
        this.swap("BUY", order.symbol, order.amountTON);
        this.triggerToast(`🔁 DCA Executed: Bought ${order.amountTON} GRAM of $${order.symbol} (${order.iterations - order.remainingIterations}/${order.iterations})`, "success");
        
        if (order.remainingIterations <= 0) {
          order.active = false;
        }
      }
      return order;
    });
    this.notifyDcaOrders();

    // 3. Process Position Auto TP/SL
    Object.keys(this.wallet.balances).forEach(symbol => {
      if (symbol === 'TON') return;
      
      const balance = this.wallet.balances[symbol] || 0;
      if (balance <= 0) return;
      
      const costBasis = this.wallet.costBasis[symbol] || 0.001;
      const currentPrice = this.tokens[symbol]?.price || 0.001;
      const currentROI = ((currentPrice - costBasis) / costBasis) * 100;
      
      const settings = this.wallet.positionsSettings?.[symbol];
      if (settings) {
        if (settings.tpActive && currentROI >= settings.tp) {
          settings.tpActive = false;
          this.swap("SELL", symbol, balance);
          this.triggerToast(`💰 Take Profit Hit! Automatically sold 100% of $${symbol} at ROI +${currentROI.toFixed(1)}%`, "success");
        } else if (settings.slActive && currentROI <= -settings.sl) {
          settings.slActive = false;
          this.swap("SELL", symbol, balance);
          this.triggerToast(`📉 Stop Loss Hit! Automatically exited 100% of $${symbol} at ROI ${currentROI.toFixed(1)}%`, "warning");
        }
      }
    });
  }
}

export const mockEngine = new MockEngine();
