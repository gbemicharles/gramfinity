import React, { useState, useEffect } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { Eye, ShieldAlert, Zap, TrendingUp, Settings, Check, X, ShieldX } from 'lucide-react';

export default function WhaleTracker() {
  const [whales, setWhales] = useState([]);
  const [whaleTxFeed, setWhaleTxFeed] = useState([]);
  const [selectedWhaleForCopy, setSelectedWhaleForCopy] = useState(null);
  const [selectedWhaleForTxs, setSelectedWhaleForTxs] = useState(null);
  const [allocationAmount, setAllocationAmount] = useState('50');
  const [slippageLimit, setSlippageLimit] = useState('1.5');
  const [copyLogs, setCopyLogs] = useState([]);

  useEffect(() => {
    // Subscribe to whale wallets configuration state
    const unsubscribeWhales = mockEngine.subscribeWhales(data => {
      setWhales(data);
    });

    // Subscribe to persistent whale transaction feed
    const unsubscribeWhaleTx = mockEngine.subscribeWhaleTxFeed(feed => {
      setWhaleTxFeed(feed);
    });

    // Subscribe to persistent copy trading logs
    const unsubscribeCopyLogs = mockEngine.subscribeCopyLogs(logs => {
      setCopyLogs(logs);
    });

    return () => {
      unsubscribeWhales();
      unsubscribeWhaleTx();
      unsubscribeCopyLogs();
    };
  }, []);

  const openCopyModal = (whale) => {
    setSelectedWhaleForCopy(whale);
    setAllocationAmount('50');
    setSlippageLimit('1.5');
  };

  const handleConfirmCopy = (e) => {
    e.preventDefault();
    if (!selectedWhaleForCopy) return;
    
    mockEngine.toggleCopyTrading(
      selectedWhaleForCopy.address,
      parseFloat(allocationAmount),
      parseFloat(slippageLimit)
    );
    setSelectedWhaleForCopy(null);
  };

  const handleStopCopy = (whaleAddress) => {
    mockEngine.toggleCopyTrading(whaleAddress);
  };

  const activeCopiesCount = whales.filter(w => w.copied).length;
  const totalAllocation = whales.filter(w => w.copied).reduce((sum, w) => sum + (w.allocation || 0), 0);
  const topWhale = whales.length > 0 ? [...whales].sort((a, b) => b.roi30d - a.roi30d)[0] : null;
  const latestTx = whaleTxFeed[0];

  return (
    <div className="dashboard-grid grid-cols-12" style={{
      height: 'calc(100vh - var(--header-height) - var(--statsbar-height))',
      gridTemplateRows: 'auto 1fr',
      overflow: 'hidden',
      padding: '12px'
    }}>
      
      {/* TOP ROW: Stats Cards (Col span 12) */}
      <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', flexShrink: 0 }}>
        {/* Card 1: Active Copy Trades */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, rgba(12, 16, 23, 0.9), rgba(4, 6, 10, 0.9))' }}>
          <div style={{ padding: '8px', background: 'rgba(0, 255, 135, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 255, 135, 0.2)', color: 'var(--accent-green)' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Copy Trading</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {activeCopiesCount} Whales <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({totalAllocation} GRAM allocated)</span>
            </div>
          </div>
        </div>

        {/* Card 2: Top Performing Whale */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, rgba(12, 16, 23, 0.9), rgba(4, 6, 10, 0.9))' }}>
          <div style={{ padding: '8px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)', color: 'var(--accent-cyan)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Top Whale (ROI 30d)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {topWhale ? `${topWhale.name}` : '—'} <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>+{topWhale ? topWhale.roi30d : 0}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Latest Whale Action */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, rgba(12, 16, 23, 0.9), rgba(4, 6, 10, 0.9))' }}>
          <div style={{ padding: '8px', background: 'rgba(255, 183, 0, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 183, 0, 0.2)', color: 'var(--accent-gold)' }}>
            <Eye size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Latest Whale Activity</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {latestTx ? (
                <>
                  <span style={{ color: latestTx.type === 'BUY' ? 'var(--color-buy)' : 'var(--color-sell)', fontWeight: 600 }}>
                    {latestTx.type}
                  </span>{' '}
                  {latestTx.amountToken.toLocaleString(undefined, { maximumFractionDigits: 0 })}{' '}
                  {latestTx.token}
                </>
              ) : (
                'Waiting for activity...'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LEFT SECTION: Whale List & Copy Leaderboard (Col span 8) */}
      <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflow: 'hidden' }}>
        
        {/* Copy Trading Leaderboard Card */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1.2, overflow: 'hidden' }}>
          <h2 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <TrendingUp className="text-cyan" size={18} /> Profitable Whale Wallets Leaderboard
          </h2>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table className="custom-table" style={{ fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Trader Wallet</th>
                  <th style={{ textAlign: 'right' }}>Win Rate (30d)</th>
                  <th style={{ textAlign: 'right' }}>ROI (30d)</th>
                  <th style={{ textAlign: 'right' }}>Net Profit (30d)</th>
                  <th style={{ textAlign: 'right' }}>Trades (30d)</th>
                  <th style={{ textAlign: 'center' }}>Copy Action</th>
                </tr>
              </thead>
              <tbody>
                {whales.map(w => (
                  <tr 
                    key={w.address} 
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }} 
                    className="hover-row"
                    onClick={() => setSelectedWhaleForTxs(w)}
                    title="Click to view detailed transaction feed overlay"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: w.avatarColor }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{w.address}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-green)' }}>
                      {w.winRate}%
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      +{w.roi30d}%
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      +${w.pnl30d.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {w.trades30d}
                    </td>
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      {w.copied ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span className="tag tag-buy" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>COPYING ({w.allocation} GRAM)</span>
                          <button
                            className="btn btn-sell"
                            style={{ padding: '2px 6px', fontSize: '0.65rem', borderRadius: '4px' }}
                            onClick={() => handleStopCopy(w.address)}
                          >
                            STOP
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                          onClick={() => openCopyModal(w)}
                        >
                          COPY WALLET
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Copy Trade Action Log (Col span 8, bottom) */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 0.8, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} className="text-green" /> Virtual Copy Trading Logs
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {copyLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                Waiting for copy executions... (Enable copy trading above to clone whale trades automatically)
              </div>
            ) : (
              copyLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {new Date(log.time).toLocaleTimeString()}
                  </span>
                  <span style={{ color: 'var(--accent-green)' }}>
                    {log.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Whale Transactions Stream Feed (Col span 4) */}
      <div className="col-span-4 glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <Eye className="text-gold" size={18} /> Live Whale Transactions Feed (TON)
        </h2>

        {/* Live Feed Items */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {whaleTxFeed.map(tx => {
            const isBuy = tx.type === 'BUY';
            return (
              <div
                key={tx.id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual indicator bar */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  background: isBuy ? 'var(--color-buy)' : 'var(--color-sell)'
                }} />

                {/* Top Row: Whale name + Tx Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.whaleName}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{tx.txHash}</span>
                </div>

                {/* Mid Row: Action details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isBuy ? 'var(--color-buy)' : 'var(--color-sell)',
                    background: isBuy ? 'var(--color-buy-bg)' : 'var(--color-sell-bg)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {isBuy ? 'SWAP BUY' : 'SWAP SELL'}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {tx.amountToken.toLocaleString(undefined, { maximumFractionDigits: 0 })} {tx.token}
                  </span>
                </div>

                {/* Bottom Row: Values in USD / TON */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '2px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span>Value: ${tx.amountUSD.toLocaleString()}</span>
                    <span>Spent: ~{tx.tonEquivalent.toLocaleString()} GRAM</span>
                  </div>
                  {isBuy && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '1px 6px', fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => {
                        mockEngine.swap("BUY", tx.token, "10");
                      }}
                    >
                      ⚡ Ape In (10 GRAM)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy Modal Dialog */}
      {selectedWhaleForCopy && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{
            width: '400px',
            padding: '20px',
            background: 'var(--bg-secondary)',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '1rem', color: '#ffffff' }}>Setup Copy Trading</h3>
              <button
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setSelectedWhaleForCopy(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCopy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>COPING ADDRESS</span>
                <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{selectedWhaleForCopy.name} ({selectedWhaleForCopy.address})</span>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>MAX ALLOCATION (GRAM)</label>
                <input
                  type="number"
                  className="input-field"
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(e.target.value)}
                  placeholder="e.g. 50"
                  required
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Maximum size of GRAM tokens to invest in any trade triggered by this whale.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SLIPPAGE BOUND (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={slippageLimit}
                  onChange={(e) => setSlippageLimit(e.target.value)}
                  placeholder="e.g. 1.5"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedWhaleForCopy(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Activate Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Whale Transactions Feed Overlay Modal */}
      {selectedWhaleForTxs && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(3,7,18,0.85)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)'
        }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🐳</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff' }}>Profile & Tx History: {selectedWhaleForTxs.name}</h3>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CA: {selectedWhaleForTxs.address}</span>
                </div>
              </div>
              <button className="btn" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => setSelectedWhaleForTxs(null)}>Close</button>
            </div>

            {/* Performance metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.75rem', textAlign: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block' }}>30D WIN RATE</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{selectedWhaleForTxs.winRate}%</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block' }}>30D ROI</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>+{selectedWhaleForTxs.roi30d}%</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block' }}>NET PROFIT</span>
                <span style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>+${selectedWhaleForTxs.pnl30d.toLocaleString()}</span>
              </div>
            </div>

            {/* Transactions stream for this specific whale */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Recent Swap Transactions Stream:</strong>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {whaleTxFeed
                .filter(tx => tx.whaleName === selectedWhaleForTxs.name)
                .map(tx => {
                  const isBuy = tx.type === 'BUY';
                  return (
                    <div 
                      key={tx.id} 
                      style={{ 
                        background: 'var(--bg-primary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '6px', 
                        padding: '8px 10px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderLeft: `3px solid ${isBuy ? 'var(--color-buy)' : 'var(--color-sell)'}`
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: isBuy ? 'var(--color-buy)' : 'var(--color-sell)' }}>
                          {isBuy ? 'SWAP BUY' : 'SWAP SELL'} ${tx.token}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Tx: {tx.txHash} • {new Date(tx.time).toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                          {tx.amountToken.toLocaleString(undefined, { maximumFractionDigits: 0 })} {tx.token}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {tx.tonEquivalent.toLocaleString()} GRAM
                        </span>
                      </div>
                    </div>
                  );
                })}
              {whaleTxFeed.filter(tx => tx.whaleName === selectedWhaleForTxs.name).length === 0 && (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '0.7rem' }}>
                  No recent transactions recorded for this whale in this session.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '8px 0', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setSelectedWhaleForTxs(null)}
              >
                Close
              </button>
              {selectedWhaleForTxs.copied ? (
                <button 
                  className="btn btn-sell" 
                  style={{ flex: 1, padding: '8px 0', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => {
                    handleStopCopy(selectedWhaleForTxs.address);
                    setSelectedWhaleForTxs(null);
                  }}
                >
                  🛑 Stop Copying
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '8px 0', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => {
                    openCopyModal(selectedWhaleForTxs);
                    setSelectedWhaleForTxs(null);
                  }}
                >
                  ⚡ Setup Copy Trade
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
