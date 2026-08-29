import React, { useState, useEffect } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { MessageSquare, Flame, TrendingUp, Sparkles, MessageCircle, BarChart2, Share2 } from 'lucide-react';

export default function Social() {
  const [tokens, setTokens] = useState({});
  const [activeNarrative, setActiveNarrative] = useState('ALL');

  useEffect(() => {
    const unsubscribe = mockEngine.subscribePrices(p => {
      setTokens(p);
    });
    return unsubscribe;
  }, []);

  const tokensList = Object.keys(tokens)
    .filter(s => s !== 'TON')
    .map(symbol => {
      const t = tokens[symbol];
      // Calculate composite momentum index (0-100)
      const onChainWeight = Math.min(25, (t.change24h > 0 ? t.change24h : 0) * 0.2 + (t.volume24h > 100000 ? 15 : 5));
      const socialWeight = Math.min(35, (t.telegramVelocity || 0) * 0.4 + (t.telegramGrowth > 0 ? t.telegramGrowth : 0) * 0.15);
      const riskWeight = Math.min(20, 20 - (t.security?.rugScore || 50) * 0.15);
      const liqWeight = Math.min(20, (t.liquidity > 500000 ? 20 : t.liquidity > 100000 ? 15 : 10));

      const momentumScore = Math.min(99, Math.round(onChainWeight + socialWeight + riskWeight + liqWeight + 15));
      
      return {
        symbol,
        ...t,
        momentumScore
      };
    })
    .sort((a, b) => b.momentumScore - a.momentumScore);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
      
      {/* Header bar */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <MessageSquare className="text-cyan animate-pulse" size={18} /> Telegram Social Sentiment Index
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>On-chain metrics combined with message velocity, subscriber growth, and influencer trackers.</p>
        </div>
        <span style={{ fontSize: '0.62rem', color: 'var(--accent-green)', background: 'rgba(0, 255, 135, 0.05)', border: '1px solid rgba(0, 255, 135, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
          LIVE SENTIMENT SCANNING
        </span>
      </div>

      {/* Narrative & Sentiment Heatmap Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px', flexShrink: 0 }}>
        {/* Narrative selection list */}
        <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={12} className="text-red" /> Trending Blockchain Narratives
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'MEME', label: '🐶 Meme Culture Tokens', score: '92% Heat index', color: 'var(--color-sell)' },
              { id: 'GAME', label: '🎮 Tap-To-Earn Gaming', score: '78% Heat index', color: 'var(--accent-gold)' },
              { id: 'DEFI', label: '🏦 POW Jettons & Yield Pools', score: '64% Heat index', color: 'var(--accent-cyan)' }
            ].map(nar => (
              <div 
                key={nar.id}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '8px 10px', 
                  borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                  fontSize: '0.72rem', cursor: 'pointer'
                }}
                className="hover-scale"
              >
                <span style={{ fontWeight: 500, color: '#ffffff' }}>{nar.label}</span>
                <span style={{ color: nar.color, fontWeight: 600 }}>{nar.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global social indicators stats */}
        <div className="glass-panel" style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>GLOBAL TELEGRAM MENTIONS (24h)</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>14,842</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-buy)' }}>📈 +32.4% vs yesterday</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>GLOBAL MESSAGES VELOCITY</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>84 msgs/min</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>🔥 Surge during Moscow peak hour</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>AVERAGE RUG FRAUD RISK</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>Moderate (42)</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-buy)' }}>🛡️ verified contracts +12%</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>BULLISH SENTIMENT RATE</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-buy)', fontFamily: 'var(--font-mono)' }}>74.2%</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Based on NLP parser</span>
          </div>
        </div>
      </div>

      {/* TONIQ Momentum Composite Score Grid */}
      <h3 style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <Sparkles size={14} className="text-cyan animate-pulse" /> TONIQ Momentum Leaderboard
      </h3>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {tokensList.map(token => {
            const indexColor = token.momentumScore > 80 ? 'var(--color-buy)' :
                               token.momentumScore > 60 ? 'var(--accent-cyan)' : 'var(--text-muted)';
            
            return (
              <div 
                key={token.symbol} 
                className="glass-panel"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderTop: `2px solid ${indexColor}`
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: token.logoBg || 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifySelf: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff', justifyContent: 'center' }}>
                      {token.symbol.charAt(0)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.78rem' }}>${token.symbol}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{token.name}</span>
                    </div>
                  </div>

                  {/* Momentum score display */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>MOMENTUM</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: indexColor, fontFamily: 'var(--font-mono)' }}>
                      {token.momentumScore}
                    </span>
                  </div>
                </div>

                {/* Score Progress indicators bar */}
                <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${token.momentumScore}%`, height: '100%', background: indexColor }} />
                </div>

                {/* Grid details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.1)', padding: '6px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>TG MENTIONS</span>
                    <span>💬 {token.telegramMentions}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>VELOCITY</span>
                    <span>📈 {token.telegramVelocity} / min</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>COMMUNITY</span>
                    <span style={{ color: token.telegramGrowth >= 0 ? 'var(--color-buy)' : 'var(--color-sell)' }}>
                      {token.telegramGrowth >= 0 ? '+' : ''}{token.telegramGrowth}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>ON-CHAIN 24H</span>
                    <span style={{ color: token.change24h >= 0 ? 'var(--color-buy)' : 'var(--color-sell)' }}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                    </span>
                  </div>
                </div>

                {/* Telegram channels mention narrative */}
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', background: 'rgba(0,229,255,0.02)', padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.05)', display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                  <span>📢</span>
                  <span>{token.whyTrending}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
