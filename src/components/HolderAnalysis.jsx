import React, { useMemo } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { AlertTriangle, Info, ShieldCheck, UserCheck } from 'lucide-react';

export default function HolderAnalysis({ selectedTokenSymbol, tokensList = {} }) {
  const activeToken = tokensList[selectedTokenSymbol];
  
  const holders = useMemo(() => {
    return mockEngine.getHolderAnalysis(selectedTokenSymbol);
  }, [selectedTokenSymbol]);

  // Aggregate holder types
  const aggregates = useMemo(() => {
    let pool = 0;
    let creator = 0;
    let locked = 0;
    let whale = 0;
    let retail = 0;

    holders.forEach(h => {
      if (h.type === 'pool') pool += h.percentage;
      else if (h.type === 'creator') creator += h.percentage;
      else if (h.type === 'locked') locked += h.percentage;
      else if (h.type === 'whale') whale += h.percentage;
      else if (h.type === 'retail') retail += h.percentage;
    });

    return { pool, creator, locked, whale, retail };
  }, [holders]);

  if (!activeToken) return null;

  // Calculate Gini / concentration factor (simple proxy)
  const top10Concentration = holders
    .filter(h => h.type !== 'retail')
    .slice(0, 10)
    .reduce((sum, h) => sum + h.percentage, 0);

  const getRiskLabel = (val) => {
    if (val > 60) return { label: 'CRITICAL', color: 'var(--color-sell)', icon: <AlertTriangle size={14} /> };
    if (val > 40) return { label: 'MEDIUM RISK', color: 'var(--accent-gold)', icon: <AlertTriangle size={14} /> };
    return { label: 'SAFE / HEALTHY', color: 'var(--color-buy)', icon: <ShieldCheck size={14} /> };
  };

  const concentrationRisk = getRiskLabel(top10Concentration);

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        HOLDER ANALYTICS & SECURITY — {selectedTokenSymbol}
      </h3>

      {/* Aggregate Concentration Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TOP 10 WALLETS HODL</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: concentrationRisk.color }}>
            {top10Concentration.toFixed(1)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CONCENTRATION RISK</div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: concentrationRisk.color,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: `1px solid ${concentrationRisk.color}`,
            padding: '2px 8px',
            borderRadius: '4px',
            marginTop: '2px'
          }}>
            {concentrationRisk.icon} {concentrationRisk.label}
          </div>
        </div>
      </div>

      {/* Distribution visual bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>HOLDER DISTRIBUTION</span>
          <span>Total Holders: {activeToken.holders.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', height: '18px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {aggregates.pool > 0 && <div style={{ width: `${aggregates.pool}%`, background: 'var(--accent-cyan)' }} title={`Liquidity Pools: ${aggregates.pool.toFixed(1)}%`} />}
          {aggregates.creator > 0 && <div style={{ width: `${aggregates.creator}%`, background: 'var(--color-sell)' }} title={`Creator: ${aggregates.creator.toFixed(1)}%`} />}
          {aggregates.locked > 0 && <div style={{ width: `${aggregates.locked}%`, background: 'var(--text-muted)' }} title={`Locked Vesting: ${aggregates.locked.toFixed(1)}%`} />}
          {aggregates.whale > 0 && <div style={{ width: `${aggregates.whale}%`, background: 'var(--accent-gold)' }} title={`Whales: ${aggregates.whale.toFixed(1)}%`} />}
          {aggregates.retail > 0 && <div style={{ width: `${aggregates.retail}%`, background: 'var(--accent-green)' }} title={`Retail: ${aggregates.retail.toFixed(1)}%`} />}
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} /> LP Pools ({aggregates.pool.toFixed(0)}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-sell)' }} /> Creator ({aggregates.creator.toFixed(0)}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }} /> Locked ({aggregates.locked.toFixed(0)}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)' }} /> Whales ({aggregates.whale.toFixed(0)}%)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} /> Retail ({aggregates.retail.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Top Holders List */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '180px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
        <table className="custom-table" style={{ fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 10px' }}>Address</th>
              <th style={{ padding: '8px 10px' }}>Label</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Share</th>
            </tr>
          </thead>
          <tbody>
            {holders.map((holder, idx) => (
              <tr key={holder.address + idx}>
                <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)' }}>
                  {holder.address}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    color: holder.type === 'pool' ? 'var(--accent-cyan)' :
                           holder.type === 'creator' ? 'var(--color-sell)' :
                           holder.type === 'locked' ? 'var(--text-muted)' :
                           holder.type === 'whale' ? 'var(--accent-gold)' : 'var(--accent-green)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {holder.name}
                  </span>
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {holder.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Security Rug Check details */}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Liquidity status:</span>
          <span style={{ color: 'var(--text-primary)' }}>{activeToken.security?.lockedLiquidity}% Locked (DeDust / Ston.fi)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Contract Ownership:</span>
          <span style={{ color: activeToken.security?.renounced ? 'var(--color-buy)' : 'var(--accent-gold)' }}>
            {activeToken.security?.renounced ? 'Renounced / Immutable' : 'Developer Admin Active'}
          </span>
        </div>
      </div>
    </div>
  );
}
