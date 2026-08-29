import React, { useState, useEffect } from 'react';
import { mockEngine } from '../utils/mockEngine';
import CandlestickChart from '../components/CandlestickChart';
import TradeWidget from '../components/TradeWidget';
import OrderBook from '../components/OrderBook';
import AlertManager from '../components/AlertManager';
import HolderAnalysis from '../components/HolderAnalysis';
import SecurityScoreCard from '../components/SecurityScoreCard';
import { ShieldCheck, RefreshCw, Star, Info } from 'lucide-react';

export default function Terminal({ initialSymbol = "TON" }) {
  const [tokens, setTokens] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol === "TON" ? "NOT" : initialSymbol);
  const [showWhaleOverlay, setShowWhaleOverlay] = useState(false);
  const [whaleTxFeed, setWhaleTxFeed] = useState([]);

  useEffect(() => {
    // If native TON is selected, let's auto-switch to an active token so we can swap TON->Token.
    if (initialSymbol !== "TON" && tokens[initialSymbol]) {
      setSelectedSymbol(initialSymbol);
    } else {
      const keys = Object.keys(tokens).filter(s => s !== 'TON');
      if (keys.length > 0 && (!selectedSymbol || !tokens[selectedSymbol])) {
        setSelectedSymbol(keys[0]);
      }
    }
  }, [initialSymbol, tokens, selectedSymbol]);

  useEffect(() => {
    const unsubscribe = mockEngine.subscribePrices(data => {
      setTokens(data);
    });
    const unsubscribeWhaleTx = mockEngine.subscribeWhaleTxFeed(feed => {
      setWhaleTxFeed(feed);
    });
    return () => {
      unsubscribe();
      unsubscribeWhaleTx();
    };
  }, []);

  const activeToken = tokens[selectedSymbol];

  if (!activeToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="animate-spin" />
        <span style={{ marginLeft: '10px' }}>Loading terminal data...</span>
      </div>
    );
  }

  // Candlestick data helper
  const chartData = mockEngine.charts[selectedSymbol] || [];

  return (
    <div className="dashboard-grid grid-cols-12" style={{ height: 'calc(100vh - var(--header-height) - var(--statsbar-height))', padding: '12px' }}>
      
      {/* LEFT HALF: Chart & Order Book & Holder analytics (Col span 9) */}
      <div className="col-span-9" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
        
        {/* Token Header Row */}
        <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifycontent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Select Token */}
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.keys(tokens).filter(s => s !== 'TON').map(symbol => (
                  <option key={symbol} value={symbol}>
                    {symbol} / GRAM
                  </option>
                ))}
              </select>
              <Star size={16} style={{ color: 'var(--accent-gold)', cursor: 'pointer', fill: 'var(--accent-gold)' }} />
            </div>
            
            {/* Price Info */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="text-mono" style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                ${activeToken.price.toLocaleString(undefined, { minimumFractionDigits: selectedSymbol === "TONY" ? 6 : 4, maximumFractionDigits: selectedSymbol === "TONY" ? 6 : 4 })}
              </span>
              <span style={{ fontSize: '0.75rem', color: activeToken.change24h >= 0 ? 'var(--color-buy)' : 'var(--color-sell)', fontWeight: 500 }}>
                {activeToken.change24h >= 0 ? '+' : ''}{activeToken.change24h}% (24h)
              </span>
            </div>

            {/* Whale Feed Toggler */}
            <button
              className="btn btn-secondary"
              style={{
                padding: '4px 10px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: showWhaleOverlay ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                color: showWhaleOverlay ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                marginLeft: '8px'
              }}
              onClick={() => setShowWhaleOverlay(prev => !prev)}
            >
              🐳 Whale Feed {showWhaleOverlay ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)' }}>24H VOLUME</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${activeToken.volume24h.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)' }}>LIQUIDITY</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>${activeToken.liquidity.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)' }}>MARKET CAP</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                ${(activeToken.price * activeToken.supply).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'var(--text-muted)' }}>HOLDERS</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activeToken.holders.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Chart View (Flex 1.8) */}
        <div className="glass-panel" style={{ flex: 1.8, minHeight: '300px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CandlestickChart data={chartData} symbol={selectedSymbol} />
        </div>

        {/* Lower row: Orderbook, Holder Analytics, and DEX Safety Audit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.9fr', gap: '12px', flex: 1.2, minHeight: '230px', overflowX: 'auto', paddingBottom: '6px', flexShrink: 0 }}>
          <OrderBook selectedTokenSymbol={selectedSymbol} currentPrice={activeToken.price} />
          <HolderAnalysis selectedTokenSymbol={selectedSymbol} tokensList={tokens} />
          <SecurityScoreCard activeToken={activeToken} />
        </div>

      </div>

      {/* RIGHT HALF: Trade Widget & Alerts (Col span 3) */}
      <div className="col-span-3" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ flexShrink: 0 }}>
          <TradeWidget selectedTokenSymbol={selectedSymbol} tokensList={tokens} />
        </div>
        <div style={{ flexShrink: 0 }}>
          <AlertManager selectedTokenSymbol={selectedSymbol} currentPrice={activeToken.price} />
        </div>
      </div>

      {/* Floating Whale Transactions Overlay Drawer */}
      {showWhaleOverlay && (
        <div style={{
          position: 'fixed',
          top: 'calc(var(--header-height) + var(--statsbar-height) + 16px)',
          right: '16px',
          width: '320px',
          height: 'calc(100vh - var(--header-height) - var(--statsbar-height) - 48px)',
          background: 'rgba(6, 9, 15, 0.95)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          zIndex: 999,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <span>🐳</span> Whale Swaps: ${selectedSymbol}
            </h3>
            <button 
              className="btn" 
              style={{ padding: '2px 8px', fontSize: '0.65rem' }} 
              onClick={() => setShowWhaleOverlay(false)}
            >
              Hide
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {whaleTxFeed
              .filter(tx => tx.token === selectedSymbol)
              .slice(0, 15)
              .map(tx => {
                const isBuy = tx.type === 'BUY';
                return (
                  <div 
                    key={tx.id} 
                    style={{ 
                      background: 'var(--bg-secondary)', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      borderLeft: `3px solid ${isBuy ? 'var(--color-buy)' : 'var(--color-sell)'}`,
                      padding: '8px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.whaleName}</span>
                      <span>{new Date(tx.time).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isBuy ? 'var(--color-buy)' : 'var(--color-sell)' }}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#ffffff' }}>
                        {tx.amountToken.toLocaleString(undefined, { maximumFractionDigits: 0 })} {tx.token}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {tx.tonEquivalent.toLocaleString()} GRAM
                      </span>
                      {isBuy && (
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '2px 8px', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => {
                            mockEngine.swap("BUY", tx.token, "10");
                          }}
                        >
                          ⚡ Copy Buy (10 G)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            {whaleTxFeed.filter(tx => tx.token === selectedSymbol).length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', padding: '40px 0' }}>
                No recent whale trades for ${selectedSymbol}.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
