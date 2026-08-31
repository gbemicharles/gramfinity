import React, { useState, useEffect, useMemo, useRef } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { 
  Search, Flame, Rocket, Activity, ShieldCheck, TrendingUp, Cpu, 
  MessageSquare, Twitter, Globe, Copy, Check, Filter, Zap, ExternalLink,
  Table, LayoutGrid, Maximize2, Minimize2, PanelRightClose, PanelRightOpen
} from 'lucide-react';

export default function Discover({ onSelectTokenForTrade }) {
  const [tokens, setTokens] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Layout and View mode states
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [feedCollapsed, setFeedCollapsed] = useState(false);

  // Advanced filter states
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // ALL, Meme, DeFi, Gaming
  const [timeframeFilter, setTimeframeFilter] = useState('ALL'); // ALL, NEW_5M
  const [mcapFilter, setMcapFilter] = useState('ALL'); // ALL, UNDER_100K, OVER_100K
  const [selectedLaunchpad, setSelectedLaunchpad] = useState('ALL'); // ALL, Gaspump, Blum Launch, PocketFi, TopBlast.lol, sTONks, Uranus, STON.fi Launch, DeDust Launch, Direct Mint
  const [sortBy, setSortBy] = useState('launchTime'); // launchTime, volume5m, volume1h, volume24h, holdersGrowth, liquidity, rugScore
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('JUST_LAUNCHED'); // JUST_LAUNCHED, TRENDING, BONDED
  
  const [copiedAddress, setCopiedAddress] = useState('');
  const [flashStates, setFlashStates] = useState({});
  const [tradesLog, setTradesLog] = useState([]);
  
  // Wallet Intelligence Details Overlay State
  const [selectedDetailsToken, setSelectedDetailsToken] = useState(null);
  const [analyzedToken, setAnalyzedToken] = useState(null);

  const getSmartMoneyActivityForToken = (symbol) => {
    const entries = mockEngine.tokenSmartMoneyEntries[symbol] || [];
    if (entries.length === 0) {
      return [
        { wallet: '@Meme_King_99', amount: '150 GRAM', entry: '$15K MC', roi: '+88%', score: 82 }
      ];
    }
    return entries.map(addr => {
      const whale = mockEngine.whales.find(w => w.address === addr) || {
        name: 'Smart Money Trader',
        winRate: 72,
        roi30d: 94
      };
      const username = whale.name.includes('@') ? whale.name : `@${whale.name.replace(/\s+/g, '_')}`;
      return {
        wallet: username,
        amount: Math.floor(Math.random() * 600 + 150) + ' GRAM',
        entry: '$' + Math.floor(Math.random() * 30 + 15) + 'K MC',
        roi: '+' + Math.floor(whale.roi30d) + '%',
        score: Math.floor(whale.winRate)
      };
    });
  };

  // Range filters (DexScreener style)
  const [minMcap, setMinMcap] = useState('');
  const [maxMcap, setMaxMcap] = useState('');
  const [minVolume, setMinVolume] = useState('');
  const [maxVolume, setMaxVolume] = useState('');
  const [minLiquidity, setMinLiquidity] = useState('');
  const [maxLiquidity, setMaxLiquidity] = useState('');
  const [minHolders, setMinHolders] = useState('');
  const [maxHolders, setMaxHolders] = useState('');
  const [minRugScore, setMinRugScore] = useState('');
  const [maxRugScore, setMaxRugScore] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const tokensRef = useRef({});
  const flashStatesRef = useRef({});
  const prevPricesRef = useRef({});

  // Sync tokens ref for trade simulator
  useEffect(() => {
    tokensRef.current = tokens;
  }, [tokens]);

  // Initial simulated micro-trades for feed
  useEffect(() => {
    const initialTrades = [];
    const buyers = ['Anon', 'Degen', 'Whale', 'Arbitrageur', 'EQB4...119b', 'EQD3...41aa', 'EQC8...d772', 'EQF2...0a91'];
    const initialSymbols = ['TONY', 'DOGS', 'REDO', 'HMSTR', 'NOT', 'GRAM'];
    const now = Date.now();
    
    for (let i = 0; i < 15; i++) {
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const tokenSymbol = initialSymbols[Math.floor(Math.random() * initialSymbols.length)];
      const type = Math.random() > 0.35 ? 'BUY' : 'SELL';
      const price = tokenSymbol === 'TONY' ? 0.000045 :
                    tokenSymbol === 'DOGS' ? 0.00085 :
                    tokenSymbol === 'REDO' ? 0.854 :
                    tokenSymbol === 'HMSTR' ? 0.0035 :
                    tokenSymbol === 'NOT' ? 0.0125 : 0.0092;
      
      let amountToken;
      if (price > 0.5) {
        amountToken = Math.round(Math.random() * 2000 + 50);
      } else if (price > 0.01) {
        amountToken = Math.round(Math.random() * 80000 + 1000);
      } else {
        amountToken = Math.round(Math.random() * 5000000 + 50000);
      }
      
      const amountTON = parseFloat(((amountToken * price) / 7.24).toFixed(2));
      initialTrades.push({
        id: `trade_init_${i}`,
        buyer,
        type,
        token: tokenSymbol,
        amountToken,
        amountTON,
        time: now - i * 15000
      });
    }
    
    setTradesLog(initialTrades);
  }, []);

  // Listen to mock prices & track border flashes
  useEffect(() => {
    const unsubscribe = mockEngine.subscribePrices(newTokens => {
      setTokens(newTokens);
      
      const nextFlashStates = { ...flashStatesRef.current };
      let updated = false;
      
      Object.keys(newTokens).forEach(symbol => {
        if (symbol === 'TON') return;
        const oldPrice = prevPricesRef.current[symbol];
        const newPrice = newTokens[symbol]?.price;
        if (oldPrice !== undefined && oldPrice !== newPrice) {
          nextFlashStates[symbol] = {
            type: newPrice > oldPrice ? 'up' : 'down',
            time: Date.now()
          };
          updated = true;
        }
        prevPricesRef.current[symbol] = newPrice;
      });
      
      if (updated) {
        flashStatesRef.current = nextFlashStates;
        setFlashStates(nextFlashStates);
      }
    });
    
    return unsubscribe;
  }, []);

  // Clear expired flashes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasExpired = false;
      const nextFlashes = { ...flashStatesRef.current };
      
      Object.keys(nextFlashes).forEach(symbol => {
        if (now - nextFlashes[symbol].time > 1000) {
          delete nextFlashes[symbol];
          hasExpired = true;
        }
      });
      
      if (hasExpired) {
        flashStatesRef.current = nextFlashes;
        setFlashStates(nextFlashes);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  // Simulated live micro-trade ticker interval
  useEffect(() => {
    const interval = setInterval(() => {
      const activeTokens = tokensRef.current;
      const symbols = Object.keys(activeTokens).filter(s => s !== 'TON');
      if (symbols.length === 0) return;
      
      const buyers = ['Anon', 'Degen', 'Whale', 'Arbitrageur', 'EQA7...d91c', 'EQD4...a82f', 'EQB2...88cc', 'EQC5...f220', 'EQF4...9091'];
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];
      const tokenSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const token = activeTokens[tokenSymbol];
      if (!token) return;
      
      const type = Math.random() > 0.3 ? 'BUY' : 'SELL';
      
      let amountToken;
      if (token.price > 0.5) {
        amountToken = Math.round(Math.random() * 4000 + 50);
      } else if (token.price > 0.01) {
        amountToken = Math.round(Math.random() * 120000 + 2000);
      } else {
        amountToken = Math.round(Math.random() * 6000000 + 40000);
      }
      
      const tonPrice = activeTokens.TON?.price || 7.24;
      const amountTON = parseFloat(((amountToken * token.price) / tonPrice).toFixed(2));
      
      const newTrade = {
        id: 'trade_' + Date.now() + Math.random(),
        buyer,
        type,
        token: tokenSymbol,
        amountToken,
        amountTON,
        time: Date.now()
      };
      
      setTradesLog(prev => [newTrade, ...prev].slice(0, 30));
    }, 2200);
    
    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = (timestamp) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d`;
  };

  const formatK = (val) => {
    if (!val || val === 0) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(2)}`;
  };

  const renderSparkline = (change24h, symbol) => {
    const isUp = change24h >= 0;
    const strokeColor = isUp ? '#00ff87' : '#ef4444';
    const glowColor = isUp ? 'rgba(0, 255, 135, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const y1 = isUp ? 22 : 6;
    const y2 = isUp ? 12 + (seed % 6) : 18 - (seed % 6);
    const y3 = isUp ? 18 - (seed % 5) : 10 + (seed % 5);
    const y4 = isUp ? 4 : 26;
    
    const pathD = `M 2 ${y1} Q 20 ${y2}, 38 ${y3} T 75 ${y4}`;
    
    return (
      <svg width="70" height="24" viewBox="0 0 80 30" style={{ overflow: 'visible' }}>
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
        />
      </svg>
    );
  };

  const getTokenImageUrl = (token) => {
    if (token.image) return token.image;
    if (token.logo) return token.logo;
    if (token.icon) return token.icon;
    if (token.imageUrl) return token.imageUrl;

    const symbolUpper = (token.symbol || '').toUpperCase();
    const map = {
      'TON': 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png',
      'NOT': 'https://assets.coingecko.com/coins/images/37855/large/notcoin.png',
      'DOGS': 'https://assets.coingecko.com/coins/images/39563/large/dogs.png',
      'HMSTR': 'https://assets.coingecko.com/coins/images/39209/large/hamster.png',
      'REDO': 'https://assets.coingecko.com/coins/images/37392/large/redo.png',
      'GRAM': 'https://raw.githubusercontent.com/telegramdesktop/tdesktop/dev/Telegram/Resources/art/icon256.png',
      'PEPE': 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png',
      'CATI': 'https://assets.coingecko.com/coins/images/39904/large/cati.png',
      'MAJOR': 'https://assets.coingecko.com/coins/images/40120/large/major.png',
      'PX': 'https://assets.coingecko.com/coins/images/40890/large/px.png',
      'MY': 'https://assets.coingecko.com/coins/images/38600/large/my.png',
    };

    if (map[symbolUpper]) return map[symbolUpper];

    // If valid mainnet contract address, query TonAPI's live jetton metadata image proxy
    if (token.address && (token.address.startsWith('EQ') || token.address.startsWith('UQ')) && !token.address.includes('gramfinity')) {
      return `https://cache.tonapi.io/imgproxy/${token.address}/image.png`;
    }

    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(symbolUpper || token.address || 'token')}`;
  };

  const copyToClipboard = (address, label) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(''), 2000);
    mockEngine.triggerToast(`Copied ${label} to clipboard!`, "info");
  };

  // Filter and sort tokens list
  const filteredTokens = useMemo(() => {
    let list = Object.keys(tokens)
      .filter(symbol => symbol !== 'TON')
      .map(symbol => {
        const t = tokens[symbol];
        const mcap = t.price * t.supply;
        // Non-DEX tokens: Gaspump, TonFun, TonRaffles
        const isDex = t.launchpad?.includes('STON.fi') || t.launchpad?.includes('DeDust') || t.launchpad === 'TON Mainnet' || t.launchpad === 'Direct Mint';
        const bondingProgress = isDex ? 100 : Math.min(99.9, (mcap / 100000) * 100);
        return {
          symbol,
          ...t,
          mcap,
          isDex,
          bondingProgress
        };
      });

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(t => 
        t.symbol.toLowerCase().includes(term) || 
        t.name.toLowerCase().includes(term) || 
        t.address.toLowerCase().includes(term) ||
        (t.launchpad && t.launchpad.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(t => t.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Timeframe Filter
    if (timeframeFilter === 'NEW_1M') {
      list = list.filter(t => t.launchTime >= Date.now() - 1 * 60 * 1000);
    } else if (timeframeFilter === 'NEW_5M') {
      list = list.filter(t => t.launchTime >= Date.now() - 5 * 60 * 1000);
    } else if (timeframeFilter === 'NEW_1H') {
      list = list.filter(t => t.launchTime >= Date.now() - 60 * 60 * 1000);
    } else if (timeframeFilter === 'NEWLY_MIGRATED') {
      list = list.filter(t => t.lifecycle === 'Newly Migrated');
    }

    // Market Cap Filter
    if (mcapFilter !== 'ALL') {
      list = list.filter(t => {
        return mcapFilter === 'UNDER_100K' ? t.mcap < 100000 : t.mcap >= 100000;
      });
    }

    // Launchpad Filter
    if (selectedLaunchpad !== 'ALL') {
      list = list.filter(t => t.launchpad === selectedLaunchpad);
    }

    // Verification Filter
    if (verifiedOnly) {
      list = list.filter(t => t.security?.verified);
    }

    // MCAP Range Filter
    if (minMcap !== '') {
      list = list.filter(t => t.mcap >= parseFloat(minMcap));
    }
    if (maxMcap !== '') {
      list = list.filter(t => t.mcap <= parseFloat(maxMcap));
    }

    // Volume 24h Range Filter
    if (minVolume !== '') {
      list = list.filter(t => (t.volume24h || 0) >= parseFloat(minVolume));
    }
    if (maxVolume !== '') {
      list = list.filter(t => (t.volume24h || 0) <= parseFloat(maxVolume));
    }

    // Liquidity Range Filter
    if (minLiquidity !== '') {
      list = list.filter(t => (t.liquidity || 0) >= parseFloat(minLiquidity));
    }
    if (maxLiquidity !== '') {
      list = list.filter(t => (t.liquidity || 0) <= parseFloat(maxLiquidity));
    }

    // Holders Range Filter
    if (minHolders !== '') {
      list = list.filter(t => (t.holders || 0) >= parseInt(minHolders, 10));
    }
    if (maxHolders !== '') {
      list = list.filter(t => (t.holders || 0) <= parseInt(maxHolders, 10));
    }

    // Rug Score Range Filter
    if (minRugScore !== '') {
      list = list.filter(t => (t.security?.rugScore || 0) >= parseInt(minRugScore, 10));
    }
    if (maxRugScore !== '') {
      list = list.filter(t => (t.security?.rugScore || 0) <= parseInt(maxRugScore, 10));
    }

    // Tab Filter
    if (activeTab === 'JUST_LAUNCHED') {
      // Unbonded launchpad tokens currently building bonding curve
      const launchpadList = ['Gaspump', 'TonFun', 'TopBlast.lol', 'sTONks', 'TonRaffles'];
      list = list.filter(t => {
        const isLaunchpadToken = launchpadList.includes(t.launchpad) || !t.isDex;
        return isLaunchpadToken && (t.bondingProgress || 0) < 100;
      });
    } else if (activeTab === 'BONDED') {
      // Tokens from supported launchpads that hit 100% bonding and graduated to DEX
      const launchpadList = ['Gaspump', 'TonFun', 'TopBlast.lol', 'sTONks', 'TonRaffles', 'STON.fi Launch', 'DeDust Launch'];
      list = list.filter(t => {
        const isLaunchpadToken = launchpadList.includes(t.launchpad) || t.launchpad?.includes('Launch');
        const isFullyBonded = (t.bondingProgress >= 100) || (t.isDex && isLaunchpadToken);
        return isLaunchpadToken && isFullyBonded;
      });
    }

    // Sorting logic
    if (activeTab === 'TRENDING' && sortBy === 'launchTime') {
      // Sort by trending score: Holder growth + recent price volatility + small vol weights
      list.sort((a, b) => {
        const scoreA = (a.holdersGrowth || 0) * 4 + Math.abs(a.change1h || 0) * 2 + (a.volume5m || 0) / 1000;
        const scoreB = (b.holdersGrowth || 0) * 4 + Math.abs(b.change1h || 0) * 2 + (b.volume5m || 0) / 1000;
        return scoreB - scoreA;
      });
    } else {
      list.sort((a, b) => {
        if (sortBy === 'launchTime') {
          return b.launchTime - a.launchTime; // Newest first
        }
        if (sortBy === 'volume5m') {
          return (b.volume5m || 0) - (a.volume5m || 0);
        }
        if (sortBy === 'volume1h') {
          return (b.volume1h || 0) - (a.volume1h || 0);
        }
        if (sortBy === 'volume24h') {
          return (b.volume24h || 0) - (a.volume24h || 0);
        }
        if (sortBy === 'holdersGrowth') {
          return (b.holdersGrowth || 0) - (a.holdersGrowth || 0);
        }
        if (sortBy === 'liquidity') {
          return (b.liquidity || 0) - (a.liquidity || 0);
        }
        if (sortBy === 'rugScore') {
          return (a.security?.rugScore || 0) - (b.security?.rugScore || 0);
        }
        return 0;
      });
    }

    return list;
  }, [tokens, searchTerm, selectedCategory, timeframeFilter, mcapFilter, selectedLaunchpad, sortBy, verifiedOnly, activeTab, minMcap, maxMcap, minVolume, maxVolume, minLiquidity, maxLiquidity, minHolders, maxHolders, minRugScore, maxRugScore]);

  // Aggregate scanner metrics & Top 5 Trending Showcase tokens
  const statsSummary = useMemo(() => {
    const list = Object.keys(tokens).filter(s => s !== 'TON').map(s => tokens[s]);
    const totalVolume = list.reduce((sum, t) => sum + (t.volume24h || 0), 0);
    const totalLaunches = list.length;
    const hotGainer = [...list].sort((a, b) => b.change24h - a.change24h)[0];
    return { totalVolume, totalLaunches, hotGainer };
  }, [tokens]);

  const trendingShowcaseTokens = useMemo(() => {
    const list = Object.keys(tokens).filter(s => s !== 'TON').map(s => tokens[s]);
    return list.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0)).slice(0, 5);
  }, [tokens]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))', overflow: 'hidden', padding: '10px 14px' }}>
      
      {/* TOP TRENDING SHOWCASE CARDS (TopBlast Reference Design) */}
      <div style={{ flexShrink: 0, marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>TRENDING ON</span>
          <span style={{ color: '#00ff87', fontWeight: 900 }}>GRAMFINITY</span>
        </div>

        <div className="trending-showcase-grid">
          {trendingShowcaseTokens.map(token => {
            const isUp = (token.change24h || 0) >= 0;
            const strokeColor = isUp ? '#00ff87' : '#ef4444';
            const glowColor = isUp ? 'rgba(0, 255, 135, 0.4)' : 'rgba(239, 68, 68, 0.4)';
            const seed = (token.symbol || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            
            const y1 = isUp ? 110 : 20;
            const y2 = isUp ? 50 + (seed % 20) : 90 - (seed % 20);
            const y3 = isUp ? 80 - (seed % 15) : 40 + (seed % 15);
            const y4 = isUp ? 15 : 125;
            const chartPathD = `M 0 ${y1} Q 50 ${y2}, 100 ${y3} T 200 ${y4}`;

            return (
              <div 
                key={token.symbol}
                className="trending-card"
                onClick={() => setSelectedDetailsToken(token)}
              >
                {/* Full Card Chart Wave Background */}
                <svg className="trending-card-chart-bg" viewBox="0 0 200 140" preserveAspectRatio="none">
                  <path
                    d={chartPathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="3.2"
                    style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
                  />
                </svg>

                {/* Card Content Overlay */}
                <div className="trending-card-content">
                  <div className="trending-card-mcap">
                    {formatK(token.mcap)}
                  </div>

                  <div className="trending-card-footer">
                    <div className="trending-card-avatar">
                      <img
                        src={getTokenImageUrl(token)}
                        alt={token.symbol}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="trending-card-meta">
                      <span className="trending-card-ticker">${token.symbol}</span>
                      <span className="trending-card-name">{token.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SCANNER WORKSPACE */}
      <div className={`scanner-split-container ${feedCollapsed ? 'feed-collapsed' : ''}`}>
        
        {/* LEFT PANEL: Filters, Tabs, Table/Cards View */}
        <div className="scanner-left-panel" style={{ padding: '0', borderRight: feedCollapsed ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
          
          {/* Single High-Density Consolidated Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '8px',
            background: '#060911',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '6px 10px',
            borderRadius: '10px',
            flexShrink: 0
          }}>
            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('JUST_LAUNCHED')}
                className={`tab-btn ${activeTab === 'JUST_LAUNCHED' ? 'emerald-pill' : ''}`}
                style={{ fontSize: '0.68rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '16px' }}
              >
                <Rocket size={11} /> Just Launched
              </button>
              <button
                onClick={() => setActiveTab('TRENDING')}
                className={`tab-btn ${activeTab === 'TRENDING' ? 'emerald-pill' : ''}`}
                style={{ fontSize: '0.68rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '16px' }}
              >
                <Flame size={11} /> Trending
              </button>
              <button
                onClick={() => setActiveTab('BONDED')}
                className={`tab-btn ${activeTab === 'BONDED' ? 'emerald-pill' : ''}`}
                style={{ fontSize: '0.68rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '16px' }}
              >
                <ShieldCheck size={11} /> Bonded
              </button>
            </div>

            {/* Search Box & Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, maxWidth: '420px', minWidth: '200px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Search symbol, CA..."
                  className="input-field"
                  style={{ paddingLeft: '26px', height: '26px', fontSize: '0.68rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={11} style={{ position: 'absolute', left: '8px', top: '7px', color: 'var(--text-muted)' }} />
              </div>

              <select
                value={selectedLaunchpad}
                onChange={(e) => setSelectedLaunchpad(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  height: '26px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Sources</option>
                <option value="Gaspump">Gaspump</option>
                <option value="Blum Launch">Blum Launch</option>
                <option value="PocketFi">PocketFi</option>
                <option value="TopBlast.lol">TopBlast.lol</option>
                <option value="sTONks">sTONks</option>
                <option value="Uranus">Uranus</option>
                <option value="STON.fi Launch">STON.fi Launch</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  height: '26px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="launchTime">Newest</option>
                <option value="volume24h">24h Vol</option>
                <option value="volume5m">5m Vol</option>
                <option value="holdersGrowth">Holders</option>
                <option value="rugScore">Rug Score</option>
              </select>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(prev => !prev)}
                className="btn btn-secondary"
                style={{
                  height: '26px',
                  padding: '0 6px',
                  fontSize: '0.65rem',
                  borderColor: showAdvancedFilters ? 'var(--accent-cyan)' : 'var(--border-color)',
                  color: showAdvancedFilters ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                <Filter size={10} /> Ranges
              </button>
            </div>

            {/* Metric Chips & Layout Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Active: <strong style={{ color: '#ffffff' }}>{statsSummary.totalLaunches}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Vol: <strong style={{ color: 'var(--accent-cyan)' }}>{formatK(statsSummary.totalVolume)}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-primary)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`view-switcher-btn ${viewMode === 'table' ? 'active' : ''}`}
                  style={{ border: 'none', padding: '2px 6px', fontSize: '0.65rem' }}
                >
                  <Table size={11} /> Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`view-switcher-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  style={{ border: 'none', padding: '2px 6px', fontSize: '0.65rem' }}
                >
                  <LayoutGrid size={11} /> Grid
                </button>
              </div>

              <button
                type="button"
                onClick={() => setFeedCollapsed(prev => !prev)}
                className="view-switcher-btn"
                style={{
                  padding: '2px 6px',
                  fontSize: '0.65rem',
                  borderColor: feedCollapsed ? 'var(--accent-cyan)' : 'var(--border-color)',
                  color: feedCollapsed ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}
                title={feedCollapsed ? "Show Live Feed" : "Full Width Workspace"}
              >
                {feedCollapsed ? <PanelRightOpen size={11} /> : <PanelRightClose size={11} />}
                {feedCollapsed ? 'Show Feed' : 'Full Width'}
              </button>
            </div>
          </div>

          {/* Advanced Range Filters Panel */}
          {showAdvancedFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 10px',
              marginBottom: '8px',
              animation: 'slideIn 0.25s ease-out forwards',
              flexShrink: 0
            }}>
              {/* Market Cap Min/Max */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Market Cap ($)</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field"
                    style={{ height: '22px', padding: '2px 4px', fontSize: '0.65rem' }}
                    value={minMcap}
                    onChange={(e) => setMinMcap(e.target.value)}
                  />
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field"
                    style={{ height: '22px', padding: '2px 4px', fontSize: '0.65rem' }}
                    value={maxMcap}
                    onChange={(e) => setMaxMcap(e.target.value)}
                  />
                </div>
              </div>

              {/* Volume 24h Min/Max */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600 }}>24h Volume ($)</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field"
                    style={{ height: '22px', padding: '2px 4px', fontSize: '0.65rem' }}
                    value={minVolume}
                    onChange={(e) => setMinVolume(e.target.value)}
                  />
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field"
                    style={{ height: '22px', padding: '2px 4px', fontSize: '0.65rem' }}
                    value={maxVolume}
                    onChange={(e) => setMaxVolume(e.target.value)}
                  />
                </div>
              </div>

              {/* Holders Min/Max */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Holders Count</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field"
                    style={{ height: '22px', padding: '2px 4px', fontSize: '0.65rem' }}
                    value={minHolders}
                    onChange={(e) => setMinHolders(e.target.value)}
                  />
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field"
                    style={{ height: '22px', padding: '2px 4px', fontSize: '0.65rem' }}
                    value={maxHolders}
                    onChange={(e) => setMaxHolders(e.target.value)}
                  />
                </div>
              </div>

              {/* Clear Button */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '22px', fontSize: '0.62rem', padding: '0', cursor: 'pointer' }}
                  onClick={() => {
                    setMinMcap(''); setMaxMcap('');
                    setMinVolume(''); setMaxVolume('');
                    setMinHolders(''); setMaxHolders('');
                  }}
                >
                  Clear Ranges
                </button>
              </div>
            </div>
          )}

          {/* TOKEN SCANNER MAIN CONTENT AREA */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
            {filteredTokens.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                No active launchpad contracts found matching your filters.
              </div>
            ) : viewMode === 'table' ? (
              /* High Density DexScreener/GeckoTerminal-style Table View */
              <div className="scanner-table-wrapper">
                <table className="scanner-table">
                  <thead>
                    <tr>
                      <th style={{ width: '28px', padding: '10px 8px', textAlign: 'center' }}>#</th>
                      <th style={{ width: '42px', padding: '10px 4px' }}>TOKEN</th>
                      <th style={{ padding: '10px 8px' }}>NAME & SAFETY</th>
                      <th style={{ textAlign: 'right', padding: '10px 10px' }}>MCAP ↑↓</th>
                      <th style={{ textAlign: 'center', padding: '10px 8px', width: '85px' }}>CHART</th>
                      <th style={{ textAlign: 'right', padding: '10px 10px' }}>VOL 24H ↑↓</th>
                      <th style={{ padding: '10px 10px', width: '100px' }}>BONDING %</th>
                      <th style={{ textAlign: 'right', padding: '10px 10px' }}>HOLDERS ↑↓</th>
                      <th style={{ textAlign: 'right', padding: '10px 10px' }}>AGE ↑↓</th>
                      <th style={{ textAlign: 'center', padding: '10px 8px', width: '110px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTokens.map((token, index) => {
                      const flash = flashStates[token.symbol];
                      const flashBg = flash ? (flash.type === 'up' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(239, 68, 68, 0.08)') : 'transparent';
                      const isHighRisk = (token.security?.rugScore || 15) > 50;

                      return (
                        <tr 
                          key={token.symbol}
                          onClick={() => setSelectedDetailsToken(token)}
                          style={{ cursor: 'pointer', background: flashBg }}
                        >
                          {/* Index */}
                          <td style={{ color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center', padding: '10px 6px' }}>
                            {index + 1}
                          </td>

                          {/* Token Logo Avatar */}
                          <td style={{ padding: '10px 4px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: '#0a0e17',
                              border: '1.5px solid rgba(255, 255, 255, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <img
                                src={getTokenImageUrl(token)}
                                alt={token.symbol}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div style={{
                                display: 'none',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                color: '#ffffff',
                                background: token.logoBg || 'linear-gradient(135deg, #1e293b, #0f172a)'
                              }}>
                                {token.symbol?.charAt(0)}
                              </div>
                            </div>
                          </td>

                          {/* Token Name, Ticker & Safety Risk Badge */}
                          <td style={{ padding: '10px 8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.88rem', letterSpacing: '-0.01em' }}>
                                {token.name}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  ${token.symbol}
                                </span>
                                <span 
                                  className="tag"
                                  style={{
                                    fontSize: '0.52rem',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                    background: token.isDex ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 229, 255, 0.12)',
                                    color: token.isDex ? '#10b981' : '#00e5ff',
                                    border: '1px solid currentColor'
                                  }}
                                >
                                  {token.launchpad}
                                </span>
                                {/* Safety Scan Rug Risk Indicator */}
                                <span style={{
                                  fontSize: '0.52rem',
                                  padding: '1px 4px',
                                  borderRadius: '3px',
                                  fontWeight: 700,
                                  background: isHighRisk ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                  color: isHighRisk ? 'var(--color-sell)' : 'var(--color-buy)',
                                  border: '1px solid currentColor',
                                  fontFamily: 'var(--font-mono)'
                                }}>
                                  {isHighRisk ? '⚠️ High Risk' : '🛡️ Safe'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); copyToClipboard(token.address, 'Contract Address'); }}
                                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                                  className="hover:text-cyan"
                                  title="Copy CA"
                                >
                                  {copiedAddress === token.address ? <Check size={10} className="text-green" /> : <Copy size={10} />}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* MCAP */}
                          <td style={{ textAlign: 'right', padding: '10px' }}>
                            <span className="bold-metric">
                              {formatK(token.mcap)}
                            </span>
                          </td>

                          {/* CHART (Inline Mini SVG Sparkline) */}
                          <td style={{ textAlign: 'center', padding: '10px 6px' }}>
                            {renderSparkline(token.change24h || 5, token.symbol)}
                          </td>

                          {/* VOL 24H */}
                          <td style={{ textAlign: 'right', padding: '10px' }}>
                            <span className="bold-metric">
                              {formatK(token.volume24h || 1200)}
                            </span>
                          </td>

                          {/* BONDING % */}
                          <td style={{ padding: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: token.isDex ? 'var(--accent-green)' : 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                                {token.isDex ? '100% DEX' : `${token.bondingProgress.toFixed(0)}%`}
                              </span>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${token.bondingProgress}%`,
                                  height: '100%',
                                  background: token.isDex ? 'linear-gradient(90deg, #00ff87, #10b981)' : 'linear-gradient(90deg, #00e5ff, #00a8ff)',
                                  borderRadius: '2px'
                                }} />
                              </div>
                            </div>
                          </td>

                          {/* HOLDERS */}
                          <td style={{ textAlign: 'right', padding: '10px' }}>
                            <span className="bold-metric">
                              {(token.holders || 100).toLocaleString()}
                            </span>
                          </td>

                          {/* AGE */}
                          <td style={{ textAlign: 'right', padding: '10px' }}>
                            <span className="bold-metric">
                              {getRelativeTime(token.launchTime)}
                            </span>
                          </td>

                          {/* Quick Action Button */}
                          <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onSelectTokenForTrade(token.symbol); }}
                                className="btn ape-in-btn"
                                style={{ padding: '4px 8px', fontSize: '0.65rem', borderRadius: '6px', height: '26px', flex: 1, whiteSpace: 'nowrap' }}
                              >
                                <Zap size={10} fill="currentColor" /> APE
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedDetailsToken(token); }}
                                className="btn btn-secondary"
                                style={{ padding: '4px 6px', fontSize: '0.62rem', borderRadius: '6px', height: '26px' }}
                                title="Safety Audit & Details"
                              >
                                Scan
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Compact Cards Grid View */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px',
                paddingBottom: '16px'
              }}>
                {filteredTokens.map(token => {
                  const buyPct = Math.round(token.buySellRatio * 100);
                  const sellPct = 100 - buyPct;
                  const flash = flashStates[token.symbol];
                  const flashClass = flash ? (flash.type === 'up' ? 'flash-green' : 'flash-red') : '';

                  return (
                    <div 
                      key={token.symbol} 
                      className={`meme-card ${flashClass}`}
                      style={{
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedDetailsToken(token)}
                    >
                      {/* Avatar / Identity */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: token.logoBg || 'linear-gradient(135deg, #1e293b, #0f172a)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            color: '#ffffff',
                            border: '1.5px solid var(--border-color)',
                            flexShrink: 0
                          }}>
                            {token.symbol.charAt(0)}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.82rem' }}>
                              {token.name}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              ${token.symbol}
                            </span>
                          </div>
                        </div>

                        {/* Origin Badge */}
                        <span 
                          className="tag"
                          style={{
                            fontSize: '0.58rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 
                              token.launchpad === 'Gaspump' ? 'rgba(245, 158, 11, 0.12)' :
                              token.launchpad === 'Blum Launch' ? 'rgba(16, 185, 129, 0.12)' :
                              token.launchpad === 'PocketFi' ? 'rgba(167, 139, 250, 0.12)' :
                              token.launchpad === 'TopBlast.lol' ? 'rgba(234, 179, 8, 0.12)' :
                              token.launchpad === 'sTONks' ? 'rgba(59, 130, 246, 0.12)' :
                              token.launchpad === 'Uranus' ? 'rgba(236, 72, 153, 0.12)' :
                              token.launchpad?.includes('STON.fi') ? 'rgba(6, 182, 212, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                            color: 
                              token.launchpad === 'Gaspump' ? '#f59e0b' :
                              token.launchpad === 'Blum Launch' ? '#10b981' :
                              token.launchpad === 'PocketFi' ? '#a78bfa' :
                              token.launchpad === 'TopBlast.lol' ? '#eab308' :
                              token.launchpad === 'sTONks' ? '#3b82f6' :
                              token.launchpad === 'Uranus' ? '#ec4899' :
                              token.launchpad?.includes('STON.fi') ? '#22d3ee' : '#f472b6',
                            border: '1px solid currentColor'
                          }}
                        >
                          {token.launchpad}
                        </span>
                      </div>

                      {/* Key Stats Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4px',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem' }}>PRICE</span>
                          <span style={{ color: token.change24h >= 0 ? 'var(--color-buy)' : 'var(--color-sell)', fontWeight: 600 }}>
                            ${token.price.toLocaleString(undefined, { minimumFractionDigits: token.price < 0.01 ? 6 : 4, maximumFractionDigits: token.price < 0.01 ? 6 : 4 })}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.55rem' }}>MCAP</span>
                          <span style={{ color: '#ffffff', fontWeight: 600 }}>
                            ${token.mcap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                      {/* Bonding Curve Progress */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Bonding:</span>
                          <span style={{ fontWeight: 600, color: token.isDex ? 'var(--accent-green)' : 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                            {token.isDex ? '100% DEX' : `${token.bondingProgress.toFixed(1)}%`}
                          </span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${token.bondingProgress}%`,
                            height: '100%',
                            background: token.isDex ? 'linear-gradient(90deg, #00ff87, #10b981)' : 'linear-gradient(90deg, #00e5ff, #00a8ff)',
                            borderRadius: '2px'
                          }} />
                        </div>
                      </div>

                      {/* Prominent APE IN Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectTokenForTrade(token.symbol); }}
                        className="btn ape-in-btn"
                        style={{
                          width: '100%',
                          padding: '5px 0',
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Zap size={12} fill="currentColor" /> APE IN
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: Live Action Activity Feed Panel */}
        <div className="scanner-right-panel">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '10px',
            marginBottom: '12px',
            flexShrink: 0
          }}>
            <h3 style={{ fontSize: '0.85rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={14} className="text-cyan animate-pulse" /> Live Activity Feed
            </h3>
            <span style={{
              fontSize: '0.6rem',
              background: 'rgba(0, 255, 135, 0.08)',
              color: 'var(--accent-green)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(0, 255, 135, 0.15)',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}>
              SCANNING
            </span>
          </div>

          {/* Running list of transactions */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
            {tradesLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                Connecting to GRAM price feed pipeline...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tradesLog.map((trade) => (
                  <div
                    key={trade.id}
                    onClick={() => onSelectTokenForTrade(trade.token)}
                    className="feed-item-enter glass-panel hover:border-cyan"
                    style={{
                      padding: '8px 10px',
                      background: 'rgba(18, 24, 36, 0.4)',
                      borderLeft: `2.5px solid ${trade.type === 'BUY' ? 'var(--color-buy)' : 'var(--color-sell)'}`,
                      fontSize: '0.72rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, transform 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {trade.buyer}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        {getRelativeTime(trade.time)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexWrap: 'wrap' }}>
                      <span style={{
                        color: trade.type === 'BUY' ? 'var(--color-buy)' : 'var(--color-sell)',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        textTransform: 'uppercase'
                      }}>
                        {trade.type === 'BUY' ? 'BUY' : 'SELL'}
                      </span>
                      <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                        {trade.amountToken.toLocaleString()} ${trade.token}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>for</span>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {trade.amountTON.toFixed(2)} GRAM
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Wallet Intelligence / Smart Money Activity Modal */}
      {selectedDetailsToken && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3,7,18,0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)'
        }}>
          <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🧠</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>Smart Money Activity: ${selectedDetailsToken.symbol}</h3>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Contract: {selectedDetailsToken.address}</span>
                </div>
              </div>
              <button className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setSelectedDetailsToken(null)}>Close</button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>{getSmartMoneyActivityForToken(selectedDetailsToken.symbol).length} wallets entered early:</strong>
            </div>

            <table className="custom-table" style={{ fontSize: '0.72rem' }}>
              <thead>
                <tr>
                  <th>Wallet</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Entry</th>
                  <th style={{ textAlign: 'right' }}>Historical ROI</th>
                </tr>
              </thead>
              <tbody>
                {getSmartMoneyActivityForToken(selectedDetailsToken.symbol).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>
                      <span style={{ color: 'var(--accent-cyan)', marginRight: '3px' }}>✓</span>
                      {item.wallet}
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginLeft: '4px' }}>Score: {item.score}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{item.amount}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{item.entry}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-buy)', fontWeight: 600 }}>{item.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '4px', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, minWidth: '80px', padding: '6px 0', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  mockEngine.triggerToast("Smart money wallets registered for tracking alerts!", "success");
                }}
              >
                🔔 Track
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, minWidth: '80px', padding: '6px 0', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  setAnalyzedToken(selectedDetailsToken);
                  setSelectedDetailsToken(null);
                }}
              >
                🔬 Analyze
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, minWidth: '80px', padding: '6px 0', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  mockEngine.swap("BUY", selectedDetailsToken.symbol, "10");
                  setSelectedDetailsToken(null);
                }}
              >
                ⚡ Ape In (10 GRAM)
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, minWidth: '80px', padding: '6px 0', fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                onClick={() => {
                  onSelectTokenForTrade(selectedDetailsToken.symbol);
                  setSelectedDetailsToken(null);
                }}
              >
                📈 Trade
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Forensic Security Analyzer Modal */}
      {analyzedToken && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3,7,18,0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001, padding: '16px', backdropFilter: 'blur(6px)'
        }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🔬</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>Forensic Audit: ${analyzedToken.symbol}</h3>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Contract: {analyzedToken.address}</span>
                </div>
              </div>
              <button className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setAnalyzedToken(null)}>Close</button>
            </div>

            {/* Score circle */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: analyzedToken.security?.rugScore > 50 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
              border: analyzedToken.security?.rugScore > 50 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px', padding: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>RUG RISK RATING</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: analyzedToken.security?.rugScore > 50 ? 'var(--color-sell)' : 'var(--color-buy)' }}>
                  {analyzedToken.security?.rugRisk || 'Safe'} ({analyzedToken.security?.rugScore || 15}/100)
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                Verified Contract: {analyzedToken.security?.verified ? '✅ YES' : '❌ NO'}<br />
                Ownership: {analyzedToken.security?.renounced ? '✅ Renounced' : '❌ Active Admin'}
              </div>
            </div>

            {/* Detailed audit list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liquidity Locked:</span>
                <span style={{ fontWeight: 600, color: (analyzedToken.security?.lockedLiquidity || 80) > 50 ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
                  {analyzedToken.security?.lockedLiquidity || 80}% Locked
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>HoneyPot Risk check:</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>Passed (0% Buy/Sell Taxes)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Deployer Wallet Balance:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {analyzedToken.symbol === 'TONY' ? '45%' : '1.5%'} of supply
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mintable Capability:</span>
                <span style={{ fontWeight: 600, color: analyzedToken.security?.renounced ? 'var(--accent-green)' : 'var(--color-sell)' }}>
                  {analyzedToken.security?.renounced ? 'Disabled' : 'Enabled'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '4px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px 0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  setAnalyzedToken(null);
                }}
              >
                Back
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '8px 0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  mockEngine.swap("BUY", analyzedToken.symbol, "10");
                  setAnalyzedToken(null);
                }}
              >
                ⚡ Ape In (10 GRAM)
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px 0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                onClick={() => {
                  onSelectTokenForTrade(analyzedToken.symbol);
                  setAnalyzedToken(null);
                }}
              >
                📈 Trade
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
