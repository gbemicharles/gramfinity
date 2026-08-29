import React, { useState, useEffect } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { Brain, Users, GitCommit, BarChart2, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export default function Intelligence({ onSelectTokenForTrade }) {
  const [tokens, setTokens] = useState({});
  const [whales, setWhales] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('SMART_MONEY'); // SMART_MONEY, CLUSTERS, COMPARISON, LOOKUP

  // Wallet Lookup States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedProfile, setSearchedProfile] = useState(null);

  const MOCK_PROFILES = {
    '@defi_ninja': {
      address: 'EQC5a7d3_dogs_community_top_whale',
      username: '@DeFi_Ninja',
      name: 'High-Performance Trader',
      score: 92,
      portfolioVal: 184230,
      pnl30d: 42810,
      winRate: 71,
      volTraded: '1.8M GRAM',
      tokensTraded: 143,
      avgEntry: '8.4 min',
      avgHolding: '3.2 hours',
      preferredMC: '$50K–$500K',
      assets: [
        { symbol: 'GRAM', balance: '12,500', value: 90500 },
        { symbol: 'REDO', balance: '45,000', value: 38430 },
        { symbol: 'TONY', balance: '8,500,000', value: 382.50 }
      ]
    },
    '@sniper_giga': {
      address: 'EQD4v9b2_gramfinity_insider_whale',
      username: '@Sniper_Giga',
      name: 'Smart Money Jetton',
      score: 85,
      portfolioVal: 68200,
      pnl30d: 15400,
      winRate: 74,
      volTraded: '840K GRAM',
      tokensTraded: 89,
      avgEntry: '11 min',
      avgHolding: '1.8 hours',
      preferredMC: '$20K–$200K',
      assets: [
        { symbol: 'GRAM', balance: '4,200', value: 30408 },
        { symbol: 'NOT', balance: '1,200,000', value: 15000 }
      ]
    },
    '@tony_whale_alpha': {
      address: 'EQB8v9c2_gram_pow_jetton_whale',
      username: '@Tony_Whale_Alpha',
      name: 'Meme Degen 99',
      score: 94,
      portfolioVal: 215600,
      pnl30d: 125600,
      winRate: 60,
      volTraded: '3.2M GRAM',
      tokensTraded: 412,
      avgEntry: '4 min',
      avgHolding: '4.5 hours',
      preferredMC: '$10K–$100K',
      assets: [
        { symbol: 'GRAM', balance: '18,200', value: 131768 },
        { symbol: 'TONY', balance: '25,000,000', value: 1125.00 }
      ]
    },
    '@traderdurov': {
      address: 'EQA2a89d1_durov_pocket_top_wallet',
      username: '@TraderDurov',
      name: 'Durov Pocket Tracker',
      score: 87,
      portfolioVal: 382400,
      pnl30d: 82400,
      winRate: 91,
      volTraded: '5.4M GRAM',
      tokensTraded: 34,
      avgEntry: '35 min',
      avgHolding: '12 hours',
      preferredMC: '$1M–$10M',
      assets: [
        { symbol: 'GRAM', balance: '52,000', value: 376480 }
      ]
    }
  };

  const handleProfileSearch = (queryStr) => {
    const q = queryStr.toLowerCase().trim();
    if (!q) return;

    let foundKey = Object.keys(MOCK_PROFILES).find(k => k.includes(q) || MOCK_PROFILES[k].address.toLowerCase().includes(q));

    if (foundKey) {
      setSearchedProfile(MOCK_PROFILES[foundKey]);
      mockEngine.triggerToast(`Footprint loaded for ${MOCK_PROFILES[foundKey].username}!`, "success");
    } else {
      const randomScore = Math.floor(Math.random() * 35) + 60;
      const generated = {
        address: q.startsWith('eq') ? q : 'EQ' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        username: q.startsWith('@') ? q : '@Unnamed_Degen_' + Math.floor(Math.random() * 900 + 100),
        name: 'Simulated Trader Account',
        score: randomScore,
        portfolioVal: Math.floor(Math.random() * 85000) + 5000,
        pnl30d: Math.floor(Math.random() * 25000) - 5000,
        winRate: Math.floor(Math.random() * 40) + 45,
        volTraded: Math.floor(Math.random() * 500) + 'K GRAM',
        tokensTraded: Math.floor(Math.random() * 50) + 5,
        avgEntry: (Math.random() * 15 + 2).toFixed(1) + ' min',
        avgHolding: (Math.random() * 6 + 1).toFixed(1) + ' hours',
        preferredMC: '$50K–$500K',
        assets: [
          { symbol: 'GRAM', balance: '500', value: 3620 },
          { symbol: 'REDO', balance: '2,500', value: 2135 }
        ]
      };
      setSearchedProfile(generated);
      mockEngine.triggerToast(`Mock footprint generated for address search!`, "info");
    }
  };

  // Comparison State
  const [tokenA, setTokenA] = useState('NOT');
  const [tokenB, setTokenB] = useState('TONY');
  
  // Hover/Explanation Modals state
  const [explainWallet, setExplainWallet] = useState(null);

  useEffect(() => {
    const unsubPrices = mockEngine.subscribePrices(p => setTokens(p));
    const unsubWhales = mockEngine.subscribeWhales(w => setWhales(w));
    return () => {
      unsubPrices();
      unsubWhales();
    };
  }, []);

  const selectList = Object.keys(tokens).filter(s => s !== 'TON');

  // Render Smart Money Tab
  const renderSmartMoney = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>💡 TON Smart Money Index</h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Whales and snipers scored by win-rates, pump entries, and average profit multipliers.</p>
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.05)' }}>
            4 WALLETS MONITORED
          </span>
        </div>

        {/* Whales Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ fontSize: '0.78rem' }}>
            <thead>
              <tr>
                <th>Wallet Identity</th>
                <th style={{ textAlign: 'center' }}>Win Rate Tier</th>
                <th style={{ textAlign: 'right' }}>Win Rate (%)</th>
                <th style={{ textAlign: 'right' }}>30D ROI</th>
                <th style={{ textAlign: 'right' }}>30D Profit</th>
                <th style={{ textAlign: 'center' }}>Avg Entry Delay</th>
                <th style={{ textAlign: 'center' }}>Audit Detail</th>
              </tr>
            </thead>
            <tbody>
              {whales.map(w => (
                <tr key={w.address}>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: w.avatarColor }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{w.name}</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{w.address.slice(0, 8)}...{w.address.slice(-6)}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: w.winRateTier === 'Elite' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(0, 229, 255, 0.08)',
                      color: w.winRateTier === 'Elite' ? 'var(--accent-green)' : 'var(--accent-cyan)',
                      border: '1px solid currentColor'
                    }}>
                      {w.winRateTier}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-buy)' }}>
                    {w.winRate}%
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                    +{w.roi30d}%
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                    ${w.pnl30d.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    ⚡ {w.avgEntryTime}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '2px 8px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                        onClick={() => setExplainWallet(w)}
                      >
                        <HelpCircle size={10} /> Explain
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '2px 8px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => {
                          const targetToken = w.name.includes("Durov") ? "GRAM" : w.name.includes("Meme") ? "TONY" : w.name.includes("Smart") ? "NOT" : "REDO";
                          mockEngine.swap("BUY", targetToken, "10");
                        }}
                      >
                        ⚡ Ape In (10 GRAM)
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Explain Popup modal */}
        {explainWallet && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 7, 18, 0.8)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)'
          }}>
            <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ color: '#ffffff', fontSize: '0.9rem', fontWeight: 600 }}>Forensic Scorecard: {explainWallet.name}</h4>
                <button className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setExplainWallet(null)}>Close</button>
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Wallet CA:</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{explainWallet.address}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Smart Money Tier:</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{explainWallet.tag}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Avg entry speed:</span>
                  <span>{explainWallet.avgEntryTime} before large pumps</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Active holdings:</span>
                  <span>{explainWallet.holdingsCount} GRAM tokens</span>
                </div>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                💡 <strong>Why this wallet is flagged:</strong> Historical tracker analysis shows this wallet has sniped {explainWallet.trades30d} newly launched tokens. It maintains a win rate of {explainWallet.winRate}% and has entered early liquidity pools on STON.fi within {explainWallet.avgEntryTime} of migration, producing a total 30D profit of ${explainWallet.pnl30d.toLocaleString()}.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Wallet Clusters Tab
  const renderWalletClusters = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>⚠️ Detected Coordinated Wallet Clusters</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automatic grouping of wallets funding each other or executing coordinated buy/sell strategies (insider bundles).</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {/* Cluster Card 1 */}
          <div className="glass-panel" style={{ padding: '14px', borderLeft: '3px solid var(--color-sell)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-sell)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                HIGH RISK CLUSTER
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>4 Wallets linked</span>
            </div>
            <h4 style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>Deployer Sniper Bundle: $TONY</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Our system detected 4 separate sniper wallets funded by the same Deployer Deposit address (`EQA_Creator...92a3`). These wallets coordinated and sniped 45% of the **$TONY** token supply in the exact same block.
            </p>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <span style={{ fontSize: '0.55rem', background: 'var(--bg-primary)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>EQA_Sniper1...3a9f</span>
              <span style={{ fontSize: '0.55rem', background: 'var(--bg-primary)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>EQB_Sniper2...f201</span>
              <span style={{ fontSize: '0.55rem', background: 'var(--bg-primary)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>EQC_Sniper3...d772</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-sell)', fontWeight: 600 }}>
                ⚠️ Dumping potential: 45% ($TONY)
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                onClick={() => {
                  if (onSelectTokenForTrade) onSelectTokenForTrade('TONY');
                }}
              >
                ⚡ Trade $TONY
              </button>
            </div>
          </div>

          {/* Cluster Card 2 */}
          <div className="glass-panel" style={{ padding: '14px', borderLeft: '3px solid var(--accent-gold)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', background: 'rgba(255, 183, 0, 0.1)', color: 'var(--accent-gold)', border: '1px solid rgba(255,183,0,0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                MODERATE RISK
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>15 Wallets linked</span>
            </div>
            <h4 style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>Sybil Claimer Network: $REDO</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
              Group of 15 wallets funded sequentially by a single bridge wallet. They exhibit a 95% correlation in dumping claimed **$REDO** tokens immediately upon launchpad migration.
            </p>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <span style={{ fontSize: '0.55rem', background: 'var(--bg-primary)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>EQX_Sybil01...2a9d</span>
              <span style={{ fontSize: '0.55rem', background: 'var(--bg-primary)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>EQX_Sybil02...d91c</span>
              <span style={{ fontSize: '0.55rem', background: 'var(--bg-primary)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>EQX_Sybil03...41aa</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                ⚠️ Dumping pressure on DEX ($REDO)
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                onClick={() => {
                  if (onSelectTokenForTrade) onSelectTokenForTrade('REDO');
                }}
              >
                ⚡ Trade $REDO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Token Comparison Tab
  const renderComparison = () => {
    const tA = tokens[tokenA];
    const tB = tokens[tokenB];

    if (!tA || !tB) return null;

    const mcapA = tA.price * tA.supply;
    const mcapB = tB.price * tB.supply;

    const riskA = tA.security?.rugScore || 50;
    const riskB = tB.security?.rugScore || 50;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>⚖️ Side-by-Side Token Comparison</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contrast token statistics, liquidity, holding risks, and Telegram community velocity side-by-side.</p>
        </div>

        {/* Dropdowns row */}
        <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>TOKEN A</span>
            <select
              value={tokenA}
              onChange={(e) => setTokenA(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.75rem', height: '28px', padding: '0 6px', background: 'var(--bg-primary)' }}
            >
              {selectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>VS</span>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>TOKEN B</span>
            <select
              value={tokenB}
              onChange={(e) => setTokenB(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.75rem', height: '28px', padding: '0 6px', background: 'var(--bg-primary)' }}
            >
              {selectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Matrix comparison table */}
        <table className="custom-table" style={{ fontSize: '0.78rem' }}>
          <thead>
            <tr>
              <th>Comparison Metric</th>
              <th style={{ width: '40%', color: 'var(--accent-cyan)' }}>{tA.symbol}</th>
              <th style={{ width: '40%', color: 'var(--accent-green)' }}>{tB.symbol}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Market Cap</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>${mcapA.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>${mcapB.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Liquidity (DEX/Launch)</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>${tA.liquidity.toLocaleString()}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>${tB.liquidity.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Token Price (USD)</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>${tA.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>${tB.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Holders Count</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{tA.holders.toLocaleString()}</td>
              <td style={{ fontFamily: 'var(--font-mono)' }}>{tB.holders.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Rug Risk Rating</td>
              <td>
                <span style={{
                  color: riskA > 50 ? 'var(--color-sell)' : riskA > 20 ? 'var(--accent-gold)' : 'var(--color-buy)',
                  fontWeight: 600
                }}>
                  {riskA} / 100 ({tA.security?.rugRisk})
                </span>
              </td>
              <td>
                <span style={{
                  color: riskB > 50 ? 'var(--color-sell)' : riskB > 20 ? 'var(--accent-gold)' : 'var(--color-buy)',
                  fontWeight: 600
                }}>
                  {riskB} / 100 ({tB.security?.rugRisk})
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Telegram Growth (24h)</td>
              <td style={{ fontFamily: 'var(--font-mono)', color: tA.telegramGrowth >= 0 ? 'var(--color-buy)' : 'var(--color-sell)' }}>
                {tA.telegramGrowth >= 0 ? '+' : ''}{tA.telegramGrowth}%
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: tB.telegramGrowth >= 0 ? 'var(--color-buy)' : 'var(--color-sell)' }}>
                {tB.telegramGrowth >= 0 ? '+' : ''}{tB.telegramGrowth}%
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>Smart Money score</td>
              <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {tA.symbol === 'TONY' ? 'High' : tA.symbol === 'REDO' ? 'Moderate' : 'Low'}
              </td>
              <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                {tB.symbol === 'TONY' ? 'High' : tB.symbol === 'REDO' ? 'Moderate' : 'Low'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render Wallet Lookup Tab
  const renderWalletLookup = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>🔍 Wallet Intelligence Look-Up</h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Enter any TON/GRAM wallet address or Telegram @username to scan footprint, smart score, and aggregated portfolio asset holdings.</p>
        </div>

        {/* Search bar block */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', background: 'var(--bg-primary)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter wallet address or @username (e.g. @DeFi_Ninja)..."
            />
            <button
              className="btn btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => handleProfileSearch(searchQuery)}
            >
              Analyze Profile
            </button>
          </div>
          
          {/* Quick tags */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>POPULAR TARGETS:</span>
            {['@DeFi_Ninja', '@Sniper_Giga', '@Tony_Whale_Alpha', '@TraderDurov'].map(t => (
              <button
                key={t}
                className="btn btn-secondary"
                style={{ padding: '2px 8px', fontSize: '0.62rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => {
                  setSearchQuery(t);
                  handleProfileSearch(t);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {searchedProfile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header info / Smart Wallet Score overview */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #0088cc, #00ff87)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem'
                }}>
                  🐋
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 style={{ margin: 0, color: '#ffffff', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {searchedProfile.name}
                    <span style={{ fontSize: '0.72rem', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.2)' }}>Verified</span>
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{searchedProfile.username}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CA: {searchedProfile.address}</span>
                </div>
              </div>

              {/* Score Indicator */}
              <div style={{
                background: 'rgba(0, 255, 135, 0.05)', border: '1px solid rgba(0, 255, 135, 0.2)', borderRadius: '8px',
                padding: '8px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px'
              }}>
                <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Smart Wallet Score</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                  {searchedProfile.score} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/100</span>
                </span>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>Based on profitability & entry speed</span>
              </div>
            </div>

            {/* Stats list */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block' }}>PORTFOLIO VALUE</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>${searchedProfile.portfolioVal.toLocaleString()}</span>
              </div>
              <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block' }}>30D PNL</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: searchedProfile.pnl30d >= 0 ? 'var(--color-buy)' : 'var(--color-sell)', fontFamily: 'var(--font-mono)' }}>
                  {searchedProfile.pnl30d >= 0 ? '+' : ''}${searchedProfile.pnl30d.toLocaleString()}
                </span>
              </div>
              <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block' }}>WIN RATE</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{searchedProfile.winRate}%</span>
              </div>
              <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block' }}>GRAM TRADED</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{searchedProfile.volTraded}</span>
              </div>
              <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', display: 'block' }}>TOKENS TRADED</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{searchedProfile.tokensTraded}</span>
              </div>
            </div>

            {/* Trading behavior layout */}
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: 0 }}>
                ⚡ Trading Behavior & Timing footprints
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>AVG ENTRY TIME</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{searchedProfile.avgEntry} before pump</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>AVG HOLDING PERIOD</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{searchedProfile.avgHolding}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>PREFERRED CAP</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)' }}>{searchedProfile.preferredMC}</span>
                </div>
              </div>
            </div>

            {/* DeBank Holdings layout */}
            <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: 0 }}>
                💳 Portfolio Asset Footprint
              </h4>
              <table className="custom-table" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                    <th style={{ textAlign: 'right' }}>Est. Value (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedProfile.assets.map(asset => (
                    <tr key={asset.symbol}>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{asset.symbol}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{asset.balance}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  const targetToken = searchedProfile.assets.find(a => a.symbol !== 'GRAM')?.symbol || "REDO";
                  mockEngine.swap("BUY", targetToken, "10");
                  mockEngine.triggerToast(`Copied buy order: Mimicking ${searchedProfile.username}`, "success");
                }}
              >
                ⚡ Ape In (10 GRAM)
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  mockEngine.triggerToast(`Following alerts activated for ${searchedProfile.username}!`, "success");
                }}
              >
                🔔 Follow Wallet Activity
              </button>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            🔍 Enter an address or select a popular whale profile tag above to scan footprints.
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
      
      {/* Tab select header */}
      <div className="glass-panel" style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <h2 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Brain className="text-cyan animate-pulse" size={18} /> TON Intelligence Dashboard
        </h2>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveSubTab('SMART_MONEY')}
            className="btn"
            style={{
              fontSize: '0.7rem', padding: '4px 10px', height: '24px', borderRadius: '6px', cursor: 'pointer',
              background: activeSubTab === 'SMART_MONEY' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              color: activeSubTab === 'SMART_MONEY' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderColor: activeSubTab === 'SMART_MONEY' ? 'rgba(0, 229, 255, 0.2)' : 'transparent'
            }}
          >
            <Users size={12} style={{ display: 'inline', marginRight: '3px' }} /> Smart Money
          </button>
          <button
            onClick={() => setActiveSubTab('LOOKUP')}
            className="btn"
            style={{
              fontSize: '0.7rem', padding: '4px 10px', height: '24px', borderRadius: '6px', cursor: 'pointer',
              background: activeSubTab === 'LOOKUP' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              color: activeSubTab === 'LOOKUP' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderColor: activeSubTab === 'LOOKUP' ? 'rgba(0, 229, 255, 0.2)' : 'transparent'
            }}
          >
            <HelpCircle size={12} style={{ display: 'inline', marginRight: '3px' }} /> Wallet Lookup
          </button>
          <button
            onClick={() => setActiveSubTab('CLUSTERS')}
            className="btn"
            style={{
              fontSize: '0.7rem', padding: '4px 10px', height: '24px', borderRadius: '6px', cursor: 'pointer',
              background: activeSubTab === 'CLUSTERS' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              color: activeSubTab === 'CLUSTERS' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderColor: activeSubTab === 'CLUSTERS' ? 'rgba(0, 229, 255, 0.2)' : 'transparent'
            }}
          >
            <GitCommit size={12} style={{ display: 'inline', marginRight: '3px' }} /> Wallet Clusters
          </button>
          <button
            onClick={() => setActiveSubTab('COMPARISON')}
            className="btn"
            style={{
              fontSize: '0.7rem', padding: '4px 10px', height: '24px', borderRadius: '6px', cursor: 'pointer',
              background: activeSubTab === 'COMPARISON' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
              color: activeSubTab === 'COMPARISON' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderColor: activeSubTab === 'COMPARISON' ? 'rgba(0, 229, 255, 0.2)' : 'transparent'
            }}
          >
            <BarChart2 size={12} style={{ display: 'inline', marginRight: '3px' }} /> Token Compare
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        {activeSubTab === 'SMART_MONEY' && renderSmartMoney()}
        {activeSubTab === 'LOOKUP' && renderWalletLookup()}
        {activeSubTab === 'CLUSTERS' && renderWalletClusters()}
        {activeSubTab === 'COMPARISON' && renderComparison()}
      </div>

    </div>
  );
}
