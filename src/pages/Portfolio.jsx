import React, { useState, useEffect, useMemo, useRef } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { Wallet, ArrowDownRight, ArrowUpRight, ExternalLink, RefreshCw, Layers, Share2, X } from 'lucide-react';

// Canvas-based Donut Chart Component
function AssetDonutChart({ assetsList }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const size = 110;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.45;
    const innerRadius = radius * 0.62;
    
    ctx.clearRect(0, 0, size, size);
    
    const totalVal = assetsList.reduce((sum, a) => sum + a.valueUSD, 0);
    if (totalVal <= 0) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = radius - innerRadius;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius + innerRadius)/2, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    
    const colors = {
      TON: '#0088cc',
      NOT: '#eab308',
      DOGS: '#6b7280',
      HMSTR: '#f97316',
      GRAM: '#a855f7',
      REDO: '#dc2626',
      TONY: '#10b981'
    };
    const fallbackColors = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    
    let currentAngle = -Math.PI / 2;
    
    assetsList.forEach((asset, idx) => {
      const pct = asset.valueUSD / totalVal;
      if (pct <= 0) return;
      
      const angle = pct * Math.PI * 2;
      const color = colors[asset.symbol] || fallbackColors[idx % fallbackColors.length];
      
      ctx.strokeStyle = color;
      ctx.lineWidth = radius - innerRadius;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius + innerRadius)/2, currentAngle, currentAngle + angle);
      ctx.stroke();
      
      currentAngle += angle;
    });

    // Outer border ring for detail
    ctx.strokeStyle = 'rgba(6, 9, 15, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }, [assetsList]);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '110px', height: '110px' }}>
      <canvas ref={canvasRef} />
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        textAlign: 'center',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Jettons</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
          {assetsList.length}
        </span>
      </div>
    </div>
  );
}

export default function Portfolio({ onSelectTokenForTrade }) {
  const [wallet, setWallet] = useState(null);
  const [tokens, setTokens] = useState({});
  const [activeShareAsset, setActiveShareAsset] = useState(null);
  const [shareImageUri, setShareImageUri] = useState('');
  const [networkMode, setNetworkMode] = useState(localStorage.getItem('gramfinity_network_mode') || 'sandbox');

  useEffect(() => {
    const unsubWallet = mockEngine.subscribeWallet(w => {
      setWallet(w);
    });
    const unsubPrices = mockEngine.subscribePrices(p => {
      setTokens(p);
    });

    // Track network mode changes
    const onStorage = () => setNetworkMode(localStorage.getItem('gramfinity_network_mode') || 'sandbox');
    window.addEventListener('storage', onStorage);

    return () => {
      unsubWallet();
      unsubPrices();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Derive mainnet/wallet state reactively from subscriptions.
  // wallet.address from mockEngine is the sandbox mock address when no real wallet is connected.
  // When a real wallet is connected, fetchRealWalletBalances replaces it with the real address.
  const isMainnet = mockEngine.networkMode === 'mainnet';
  // The sandbox mock wallet address always contains 'gramfinity' - real addresses are never that
  const hasSandboxAddress = !wallet || wallet.address?.includes('gramfinity') || wallet.address?.includes('EQD3a9b2');
  const isRealWalletConnected = isMainnet && !hasSandboxAddress;

  const handleShareCard = (asset) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // 1. Dark Neon Degen Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 600, 360);
    grad.addColorStop(0, '#0f172a'); // slate-900
    grad.addColorStop(0.5, '#06090f'); // deep dark
    grad.addColorStop(1, '#083344'); // cyan-950
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 360);

    // Subtle decorative grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 600; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 360);
      ctx.stroke();
    }
    for (let j = 0; j < 360; j += 30) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(600, j);
      ctx.stroke();
    }

    // Outer glow border
    ctx.strokeStyle = asset.pnlPct >= 0 ? '#10b981' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 600, 360);

    // Decorative corner accents
    ctx.fillStyle = asset.pnlPct >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    ctx.fillRect(10, 10, 20, 4);
    ctx.fillRect(10, 10, 4, 20);
    ctx.fillRect(570, 10, 20, 4);
    ctx.fillRect(586, 10, 4, 20);
    ctx.fillRect(10, 346, 20, 4);
    ctx.fillRect(10, 330, 4, 20);
    ctx.fillRect(570, 346, 20, 4);
    ctx.fillRect(586, 330, 4, 20);

    // 2. Brand Label
    ctx.fillStyle = '#00e5ff'; // neon cyan
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillText('GRAMFINITY DEGEN TERMINAL', 32, 40);

    // 3. Token Info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText(`$${asset.symbol}`, 32, 90);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px "Space Grotesk", sans-serif';
    ctx.fillText(asset.name, 32, 112);

    // 4. Large PnL Display
    const isGainer = asset.pnlPct >= 0;
    ctx.fillStyle = isGainer ? '#10b981' : '#ef4444';
    ctx.font = 'bold 64px "Space Grotesk", sans-serif';
    const pnlText = `${isGainer ? '+' : ''}${asset.pnlPct.toFixed(1)}%`;
    ctx.fillText(pnlText, 32, 210);

    // PnL USD Value
    ctx.font = '600 20px "Space Grotesk", sans-serif';
    ctx.fillText(`${isGainer ? '+' : ''}$${asset.pnlUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`, 32, 245);

    // 5. Entry / Current stats column
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillText('ENTRY PRICE', 420, 160);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillText(`$${asset.costBasis.toLocaleString(undefined, { minimumFractionDigits: 4 })}`, 420, 185);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillText('CURRENT PRICE', 420, 220);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Space Grotesk", sans-serif';
    ctx.fillText(`$${asset.priceUSD.toLocaleString(undefined, { minimumFractionDigits: 4 })}`, 420, 245);

    // 6. Bottom row decoration & QR placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(0, 290, 600, 70);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px "Space Grotesk", sans-serif';
    ctx.fillText('Scan to swap instantly on Telegram Mini App', 32, 330);

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillText('t.me/gramfinity_bot', 460, 330);

    // Save as Data URI
    setShareImageUri(canvas.toDataURL('image/png'));
    setActiveShareAsset(asset);
  };

  // State hooks for TP/SL positions editors
  const [editingTpSlAsset, setEditingTpSlAsset] = useState(null);
  const [editTpVal, setEditTpVal] = useState('100');
  const [editSlVal, setEditSlVal] = useState('50');
  const [editTpActive, setEditTpActive] = useState(false);
  const [editSlActive, setEditSlActive] = useState(false);

  const handleOpenTpSlEditor = (asset) => {
    setEditingTpSlAsset(asset);
    const currentSetting = wallet.positionsSettings?.[asset.symbol] || { tp: 100, sl: 50, tpActive: false, slActive: false };
    setEditTpVal(currentSetting.tp.toString());
    setEditSlVal(currentSetting.sl.toString());
    setEditTpActive(currentSetting.tpActive);
    setEditSlActive(currentSetting.slActive);
  };

  const handleSaveTpSl = () => {
    mockEngine.updatePositionTpSl(editingTpSlAsset.symbol, editTpVal, editSlVal, editTpActive, editSlActive);
    setEditingTpSlAsset(null);
  };

  const handlePanicExit = (symbol, balance) => {
    mockEngine.triggerToast(`Panic Exiting $${symbol}... Selling 100% position`, "warning");
    mockEngine.swap("SELL", symbol, balance.toString());
  };

  // Calculate stats based on current token prices and cost basis
  const portfolioStats = useMemo(() => {
    if (!wallet || Object.keys(tokens).length === 0) return { netWorthUSD: 0, assetsList: [], realizedPnL: 0, unrealizedPnL: 0 };

    let netWorthUSD = 0;
    const assetsList = [];
    let unrealizedPnL = 0;

    // Calculate balances
    Object.keys(wallet.balances).forEach(symbol => {
      const balance = wallet.balances[symbol] || 0;
      if (balance <= 0) return;

      const tokenPrice = tokens[symbol]?.price || 0;
      const valueUSD = balance * tokenPrice;
      netWorthUSD += valueUSD;

      let costBasis = tokens[symbol]?.price || 0;
      let pnlUSD = 0;
      let pnlPct = 0;

      if (symbol !== 'TON') {
        costBasis = wallet.costBasis[symbol] || tokenPrice;
        const totalCost = balance * costBasis;
        pnlUSD = valueUSD - totalCost;
        pnlPct = costBasis > 0 ? ((tokenPrice - costBasis) / costBasis) * 100 : 0;
        unrealizedPnL += pnlUSD;
      }

      assetsList.push({
        symbol,
        name: tokens[symbol]?.name || symbol,
        balance,
        priceUSD: tokenPrice,
        valueUSD,
        change24h: tokens[symbol]?.change24h || 0,
        costBasis,
        pnlUSD,
        pnlPct
      });
    });

    // Sort by USD value
    assetsList.sort((a, b) => b.valueUSD - a.valueUSD);

    const realizedPnL = wallet.realizedPnL || 0;

    return {
      netWorthUSD,
      assetsList,
      realizedPnL,
      unrealizedPnL
    };
  }, [wallet, tokens]);

  // In mainnet mode without a connected wallet, show a connect-wallet prompt
  if (isMainnet && !isRealWalletConnected) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        gap: '16px',
        color: 'var(--text-muted)',
        padding: '40px'
      }}>
        <div style={{ fontSize: '3rem' }}>💳</div>
        <h2 style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0 }}>Connect Your TON Wallet</h2>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', maxWidth: '360px', lineHeight: 1.6 }}>
          You are in <strong style={{ color: 'var(--accent-green)' }}>Live Mainnet</strong> mode.
          Connect your TON wallet using the button in the top-right to view your real GRAM balance, jetton holdings, and live USD net worth.
        </p>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Supports: Tonkeeper · MyTonWallet · TonSpace · OpenMask
        </div>
      </div>
    );
  }

  if (!wallet || Object.keys(tokens).length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="animate-spin" />
        <span style={{ marginLeft: '10px' }}>Loading portfolio data...</span>
      </div>
    );
  }

  const { netWorthUSD, assetsList, realizedPnL, unrealizedPnL } = portfolioStats;

  return (
    <div className="dashboard-grid grid-cols-12" style={{
      height: 'calc(100vh - var(--header-height) - var(--statsbar-height))',
      gridTemplateRows: 'auto auto 1fr',
      overflow: 'hidden',
      padding: '12px'
    }}>
      
      {/* TOP HEADER: Wallet Card & Net Worth (Col span 12) */}
      <div className="col-span-12 glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(12, 16, 23, 0.95), rgba(6, 9, 15, 0.95))', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--accent-cyan)' }}>
            <Wallet size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', color: '#ffffff' }}>TON Wallet</h1>
              <span className="tag tag-neutral" style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-6)}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              TON Blockchain Net Worth (Unified Asset visualizer)
            </div>
          </div>
        </div>

        {/* Net Worth value */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Net Worth Value</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            ${netWorthUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* PnL & Allocation Row (Col span 12) */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', flexShrink: 0 }}>
        {/* Card 1: Realized P&L */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>REALIZED PROFIT & LOSS</span>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: realizedPnL > 0 ? 'var(--color-buy)' : realizedPnL < 0 ? 'var(--color-sell)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: '2px'
            }}>
              {realizedPnL >= 0 ? '+' : ''}${realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          {realizedPnL >= 0 ? (
            <ArrowUpRight size={24} className="text-green" style={{ opacity: 0.3 }} />
          ) : (
            <ArrowDownRight size={24} className="text-red" style={{ opacity: 0.3 }} />
          )}
        </div>

        {/* Card 2: Unrealized holding PnL */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>UNREALIZED HOLDING PnL</span>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: unrealizedPnL > 0 ? 'var(--color-buy)' : unrealizedPnL < 0 ? 'var(--color-sell)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: '2px'
            }}>
              {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          {unrealizedPnL >= 0 ? (
            <ArrowUpRight size={24} className="text-green" style={{ opacity: 0.3 }} />
          ) : (
            <ArrowDownRight size={24} className="text-red" style={{ opacity: 0.3 }} />
          )}
        </div>

        {/* Card 3: Donut Chart visualizer */}
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASSET DISTRIBUTION</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.2' }}>
              {assetsList.length} held tokens allocated on TON chain
            </span>
          </div>
          <div style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
            <AssetDonutChart assetsList={assetsList} />
          </div>
        </div>
      </div>

      {/* LEFT PANEL: Assets Breakdown (Col span 8) */}
      <div className="col-span-8 glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflow: 'hidden' }}>
        
        <h2 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexShrink: 0 }}>
          <Layers className="text-cyan" size={18} /> Balances & Jettons Portfolio
        </h2>

        {/* Assets Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="custom-table" style={{ fontSize: '0.78rem' }}>
            <thead>
              <tr>
                <th>Asset</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th style={{ textAlign: 'right' }}>Avg Buy Price</th>
                <th style={{ textAlign: 'right' }}>Current Price</th>
                <th style={{ textAlign: 'right' }}>Value (USD)</th>
                <th style={{ textAlign: 'right' }}>PnL Return</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {assetsList.map(asset => {
                const isTON = asset.symbol === 'TON';
                return (
                  <tr key={asset.symbol}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{asset.symbol}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{asset.name}</span>
                        {!isTON && wallet.positionsSettings?.[asset.symbol] && (
                          <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', marginTop: '2px', display: 'flex', gap: '4px' }}>
                            {wallet.positionsSettings[asset.symbol].tpActive && `🛡️ TP: +${wallet.positionsSettings[asset.symbol].tp}%`}
                            {wallet.positionsSettings[asset.symbol].slActive && ` SL: -${wallet.positionsSettings[asset.symbol].sl}%`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {asset.balance.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {isTON ? '—' : `$${asset.costBasis.toLocaleString(undefined, { minimumFractionDigits: asset.costBasis < 0.01 ? 6 : 4, maximumFractionDigits: asset.costBasis < 0.01 ? 6 : 4 })}`}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      ${asset.priceUSD.toLocaleString(undefined, { minimumFractionDigits: asset.priceUSD < 0.01 ? 6 : 4, maximumFractionDigits: asset.priceUSD < 0.01 ? 6 : 4 })}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${asset.valueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: isTON ? 'var(--text-muted)' : asset.pnlUSD > 0 ? 'var(--color-buy)' : asset.pnlUSD < 0 ? 'var(--color-sell)' : 'var(--text-muted)'
                    }}>
                      {isTON ? '—' : (
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.72rem' }}>
                          <span>{asset.pnlUSD >= 0 ? '+' : ''}${asset.pnlUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>({asset.pnlUSD >= 0 ? '+' : ''}{asset.pnlPct.toFixed(1)}%)</span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {!isTON ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                            onClick={() => onSelectTokenForTrade(asset.symbol)}
                          >
                            Trade
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '0.65rem', border: '1px solid rgba(0,229,255,0.2)', color: 'var(--accent-cyan)' }}
                            onClick={() => handleOpenTpSlEditor(asset)}
                            title="Configure Auto TP/SL Triggers"
                          >
                            🛡️ TP/SL
                          </button>
                          <button
                            className="btn btn-sell"
                            style={{ padding: '2px 6px', fontSize: '0.65rem', fontWeight: 600 }}
                            onClick={() => handlePanicExit(asset.symbol, asset.balance)}
                            title="Sell 100% position immediately"
                          >
                            ⚡ Exit
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                            onClick={() => handleShareCard(asset)}
                          >
                            <Share2 size={10} /> Share
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Base</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PANEL: History Tracker (Col span 4) */}
      <div className="col-span-4 glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>GRAM Transaction History</span>
          {mockEngine.networkMode === 'mainnet' && wallet.address && (
            <a 
              href={`https://tonscan.org/address/${wallet.address}`} 
              target="_blank" 
              rel="noreferrer" 
              style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
            >
              Tonscan <ExternalLink size={10} />
            </a>
          )}
        </h2>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mockEngine.networkMode === 'mainnet' ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span>Live Mainnet transactions are queried directly on-chain.</span>
              <a 
                href={`https://tonscan.org/address/${wallet.address}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '0.7rem', padding: '6px 12px', color: 'var(--accent-cyan)' }}
              >
                Open Tonscan Explorer
              </a>
            </div>
          ) : wallet.history.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0', fontSize: '0.85rem' }}>
              No transactions recorded yet.
            </div>
          ) : (
            wallet.history.map(tx => {
              const isBuy = tx.type === 'BUY';
              return (
                <div
                  key={tx.id}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {/* Top Row: Type & Hash Link */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontWeight: 600,
                      color: isBuy ? 'var(--color-buy)' : 'var(--color-sell)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {isBuy ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />} {tx.type} SWAP
                    </span>
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      {tx.txHash.slice(0, 8)}... <ExternalLink size={10} />
                    </a>
                  </div>

                  {/* Mid Row: Token Swaps details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffffff', fontWeight: 500 }}>
                    <span>{isBuy ? `Spent ${tx.amountTON.toLocaleString()} GRAM` : `Sold ${tx.amountToken.toLocaleString()} ${tx.token}`}</span>
                    <span>{isBuy ? `Got ${tx.amountToken.toLocaleString()} ${tx.token}` : `Got ${tx.amountTON.toLocaleString()} GRAM`}</span>
                  </div>

                  {/* Bottom Row: Timestamp & gas */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    <span>{new Date(tx.time).toLocaleTimeString()}</span>
                    <span>Gas: {tx.gasTON} TON</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Share PnL Card Modal Overlay */}
      {activeShareAsset && shareImageUri && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3, 7, 18, 0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 600 }}>Share Profit Card</h3>
              <button onClick={() => setActiveShareAsset(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: '#06090f' }}>
              <img src={shareImageUri} alt="PnL Profit Card" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, height: '36px', fontSize: '0.85rem', cursor: 'pointer' }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${activeShareAsset.symbol}_PnL_Card.png`;
                  link.href = shareImageUri;
                  link.click();
                  mockEngine.triggerToast("PnL Image downloaded!", "success");
                }}
              >
                Download PNG
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, height: '36px', fontSize: '0.85rem', cursor: 'pointer' }}
                onClick={() => {
                  mockEngine.triggerToast("Posted share card to TG Story!", "success");
                  setActiveShareAsset(null);
                }}
              >
                Post to Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TP/SL Advanced Configuration Modal */}
      {editingTpSlAsset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3,7,18,0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)'
        }}>
          <div className="glass-panel" style={{ maxWidth: '380px', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#ffffff' }}>🛡️ TP/SL Settings: ${editingTpSlAsset.symbol}</h3>
              <button className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setEditingTpSlAsset(null)}>Cancel</button>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '6px', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={editTpActive} onChange={(e) => setEditTpActive(e.target.checked)} style={{ accentColor: 'var(--accent-cyan)' }} />
                    Take Profit % Trigger
                  </label>
                  <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>+{editTpVal}% ROI</span>
                </div>
                <input type="range" min="10" max="500" step="5" value={editTpVal} onChange={(e) => setEditTpVal(e.target.value)} style={{ width: '100%', accentColor: 'var(--accent-cyan)' }} disabled={!editTpActive} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={editSlActive} onChange={(e) => setEditSlActive(e.target.checked)} style={{ accentColor: 'var(--color-sell)' }} />
                    Stop Loss % Trigger
                  </label>
                  <span style={{ fontWeight: 600, color: 'var(--color-sell)' }}>-${editSlVal}% ROI</span>
                </div>
                <input type="range" min="5" max="95" step="5" value={editSlVal} onChange={(e) => setEditSlVal(e.target.value)} style={{ width: '100%', accentColor: 'var(--color-sell)' }} disabled={!editSlActive} />
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '8px 0', fontSize: '0.78rem', fontWeight: 600 }}
              onClick={handleSaveTpSl}
            >
              Save Protection Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
