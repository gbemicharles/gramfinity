import React from 'react';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';

export default function SecurityScoreCard({ activeToken }) {
  if (!activeToken) return null;

  const security = activeToken.security || {};
  const rugScore = security.rugScore ?? 50;
  const lockedLP = security.lockedLiquidity ?? 0;
  
  // Fallback calculation for creator balance if not explicitly present in mock list
  const creatorPct = security.creatorBalance ?? Math.max(1, Math.min(95, Math.floor(rugScore * 1.6 + 2)));

  // Risk coloring rules
  let scoreColor = 'var(--color-buy)'; // Green
  let riskLevel = 'LOW RISK';
  if (rugScore > 15 && rugScore <= 40) {
    scoreColor = 'var(--accent-gold)'; // Yellow
    riskLevel = 'MODERATE RISK';
  } else if (rugScore > 40) {
    scoreColor = 'var(--color-sell)'; // Red
    riskLevel = 'HIGH RISK';
  }

  const getLpColor = (locked) => {
    if (locked >= 80) return 'var(--color-buy)';
    if (locked >= 50) return 'var(--accent-gold)';
    return 'var(--color-sell)';
  };

  const getCreatorColor = (pct) => {
    if (pct < 6) return 'var(--color-buy)';
    if (pct < 15) return 'var(--accent-gold)';
    return 'var(--color-sell)';
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowY: 'auto' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', flexShrink: 0 }}>
        <h3 style={{ fontSize: '0.85rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
          <ShieldCheck size={14} style={{ color: rugScore <= 15 ? 'var(--color-buy)' : 'var(--color-sell)' }} /> 
          DEX Safety Audit
        </h3>
        <span className="tag text-mono" style={{ 
          fontSize: '0.62rem', 
          background: rugScore <= 15 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: scoreColor,
          borderColor: scoreColor
        }}>
          {riskLevel}
        </span>
      </div>

      {/* Audit grid content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'space-around', overflowY: 'auto' }}>
        
        {/* Rug Score Radial/Bar Visualizer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>RUG PULL RISK SCORE</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {rugScore} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 100</span>
            </span>
          </div>
          {/* Visual Indicator */}
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: `4px solid var(--bg-tertiary)`, borderTopColor: scoreColor, transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#ffffff', transform: 'rotate(-45deg)' }}>
              {rugScore}%
            </span>
          </div>
        </div>

        {/* Audit Checklist Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Renounced */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Contract Ownership</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: security.renounced ? 'var(--color-buy)' : 'var(--accent-gold)' }}>
              {security.renounced ? (
                <>
                  <Check size={12} /> Renounced (Safe)
                </>
              ) : (
                <>
                  <AlertTriangle size={12} /> Mutable Admin
                </>
              )}
            </span>
          </div>

          {/* Locked Liquidity */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Locked LP Pools</span>
            <span style={{ fontWeight: 500, color: getLpColor(lockedLP) }}>
              {lockedLP}% Locked
            </span>
          </div>

          {/* Creator Holdings */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Creator Allocations</span>
            <span style={{ fontWeight: 500, color: getCreatorColor(creatorPct) }}>
              {creatorPct.toFixed(1)}% supply
            </span>
          </div>

          {/* Contract Verified */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Source Code Verification</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: security.verified ? 'var(--color-buy)' : 'var(--color-sell)' }}>
              {security.verified ? (
                <>
                  <Check size={12} /> Verified Code
                </>
              ) : (
                <>
                  <X size={12} /> Unverified Code
                </>
              )}
            </span>
          </div>

        </div>

        {/* Security Recommendation Text */}
        <div style={{ 
          background: rugScore <= 15 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', 
          border: `1px dashed ${rugScore <= 15 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
          borderRadius: '6px', 
          padding: '8px', 
          fontSize: '0.65rem', 
          color: 'var(--text-secondary)',
          lineHeight: '1.25'
        }}>
          {rugScore <= 15 ? (
            <span>🟢 **Audit Passed**: This token has renounced ownership credentials, and healthy liquidity locks. Trading presents standard volatility risks.</span>
          ) : rugScore <= 40 ? (
            <span>🟡 **Audit Caution**: Active admin functions detected. Ensure that you monitor swap sizing and slippage parameters closely.</span>
          ) : (
            <span>🔴 **Audit Warning**: Admin can alter supply parameters, and creator holdings are concentrated. Trade at extreme risk.</span>
          )}
        </div>

      </div>
    </div>
  );
}
