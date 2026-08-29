import React, { useState } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { Bell, ShieldAlert, Play, Plus, RefreshCw, Send, Sparkles } from 'lucide-react';

export default function Alerts() {
  const [rules, setRules] = useState([
    { id: 1, type: 'Whale Purchase', param: 'Amount > 100 GRAM', active: true, desc: 'Triggers when a single transaction exceeds 100 GRAM' },
    { id: 2, type: 'Telegram Mentions Velocity', param: 'Velocity > +150% / 10m', active: true, desc: 'Triggers when message rate spikes on public chats' },
    { id: 3, type: 'Smart Money Wallet Entry', param: 'Win-rate > 70% sniper buys', active: true, desc: 'Triggers when a flagged elite smart money address sniper-buys' },
    { id: 4, type: 'Bonding Curve Migration', param: '100% Completed', active: false, desc: 'Triggers when a token graduates to STON.fi or DeDust DEX' }
  ]);

  const [simulatedAlerts, setSimulatedAlerts] = useState([
    {
      id: 'init_1',
      time: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString(),
      token: 'REDO',
      message: '🚨 $REDO ALERT\n\nWin-rate Elite sniper EQC5a7d3...top_whale just bought REDO worth 240 GRAM!\n\nVolume velocity: +180% in 5m\nLiquidity index: $4.8M',
      txHash: 'EQD5a1b3...redo'
    }
  ]);

  const [customRuleType, setCustomRuleType] = useState('Whale Purchase');
  const [customRuleParam, setCustomRuleParam] = useState('Amount > 50 GRAM');

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    mockEngine.triggerToast('Alert rule updated!', 'success');
  };

  const handleAddRule = () => {
    const newRule = {
      id: Date.now(),
      type: customRuleType,
      param: customRuleParam,
      active: true,
      desc: `Triggers when ${customRuleType.toLowerCase()} satisfies ${customRuleParam}`
    };
    setRules(prev => [...prev, newRule]);
    mockEngine.triggerToast('New alert rule added!', 'success');
  };

  const handleSimulateAlert = () => {
    // Generate a random alert simulation
    const alertMockList = [
      {
        token: 'TONY',
        message: '🚨 $TONY ALERT\n\nWin-rate Elite sniper EQC5a7d3...top_whale just sniped 4,500,000 $TONY worth 150 GRAM!\n\nVolume velocity: +340% in 5m\nHolders growth: +32%'
      },
      {
        token: 'DOGS',
        message: '🚨 $DOGS ALERT\n\nSocial Mentions Spike: Mentions surge +280% inside Dogs Telegram official channel.\n\nMessage Velocity: 142 msgs/min\nSmart wallets entered: 5 in 10m'
      },
      {
        token: 'GRAM',
        message: '🚨 $GRAM ALERT\n\nWhale Transfer: Wallet EQA2a89d...durov_pocket transferred 85,000 GRAM ($820 USD) to STON.fi liquidity pool.'
      }
    ];

    const randomPick = alertMockList[Math.floor(Math.random() * alertMockList.length)];
    const newAlert = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      token: randomPick.token,
      message: randomPick.message,
      txHash: 'EQ_simulated_' + Math.floor(Math.random() * 1000)
    };

    setSimulatedAlerts(prev => [newAlert, ...prev]);
    mockEngine.triggerToast(`🚨 Simulated telegram alert for $${randomPick.token}!`, 'alert');
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflow: 'hidden' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Bell className="text-cyan animate-pulse" size={18} /> Telegram Bot Alerts Center
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Configure notifications rules and monitor the push alert pipeline simulator.</p>
        </div>
        <span style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
          BOT RUNNING
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', flex: 1, overflow: 'hidden' }}>
        {/* LEFT COLUMN: Rule Configuration (Scrollable) */}
        <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', overflowY: 'auto' }}>
          
          <h3 style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, margin: 0 }}>
            ⚙️ Trigger Rules Configurator
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rules.map(rule => (
              <div 
                key={rule.id}
                style={{ 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px', 
                  padding: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.72rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%' }}>
                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{rule.type} ({rule.param})</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{rule.desc}</span>
                </div>
                
                {/* Switch checkbox toggle */}
                <label style={{ position: 'relative', display: 'inline-block', width: '32px', height: '18px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rule.active}
                    onChange={() => toggleRule(rule.id)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: rule.active ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                    borderRadius: '9px', transition: '0.2s',
                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3)'
                  }}>
                    <span style={{
                      position: 'absolute', left: rule.active ? '15px' : '2px', bottom: '2px',
                      width: '14px', height: '14px', background: '#ffffff', borderRadius: '50%', transition: '0.2s'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>

          {/* Quick Create Custom Rule Form */}
          <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>➕ Create custom alert rule</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>TRIGGER TYPE</span>
                <select 
                  value={customRuleType} 
                  onChange={(e) => setCustomRuleType(e.target.value)}
                  className="input-field" 
                  style={{ fontSize: '0.68rem', height: '24px', padding: '0 4px', background: 'var(--bg-primary)' }}
                >
                  <option value="Whale Purchase">Whale Purchase</option>
                  <option value="Telegram Mentions Velocity">Telegram Mentions Velocity</option>
                  <option value="Smart Money Wallet Entry">Smart Money Wallet Entry</option>
                  <option value="Bonding Curve Migration">Bonding Curve Migration</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>TRIGGER VALUE</span>
                <input 
                  type="text" 
                  value={customRuleParam}
                  onChange={(e) => setCustomRuleParam(e.target.value)}
                  className="input-field" 
                  style={{ fontSize: '0.68rem', height: '24px', padding: '2px 6px', background: 'var(--bg-primary)' }}
                  placeholder="e.g. Amount > 50 TON" 
                />
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ padding: '4px 0', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              onClick={handleAddRule}
            >
              <Plus size={12} /> Add Alert Rule
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Telegram DM Mock Alert Simulator */}
        <div className="glass-panel" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
              📢 TG Bot Simulator
            </h3>
            <button 
              className="btn btn-primary animate-pulse" 
              style={{ padding: '2px 8px', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
              onClick={handleSimulateAlert}
            >
              <Play size={10} fill="currentColor" /> Simulate Alert
            </button>
          </div>

          {/* Simulated Chat Feed */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '10px', paddingRight: '2px' }}>
            {simulatedAlerts.map(alert => (
              <div 
                key={alert.id}
                style={{ 
                  background: 'rgba(0, 136, 204, 0.08)', 
                  border: '1px solid rgba(0, 136, 204, 0.2)', 
                  borderRadius: '12px 12px 0 12px', 
                  padding: '10px 12px',
                  alignSelf: 'flex-end',
                  maxWidth: '90%',
                  fontSize: '0.72rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  animation: 'slideIn 0.25s ease-out forwards'
                }}
              >
                <div style={{ color: '#ffffff', whiteSpace: 'pre-wrap', lineHeight: '1.4', fontFamily: 'var(--font-mono)' }}>
                  {alert.message}
                </div>
                
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '2px 8px', fontSize: '0.62rem', fontWeight: 600, flex: 1, cursor: 'pointer' }}
                    onClick={() => {
                      mockEngine.swap("BUY", alert.token, "10");
                    }}
                  >
                    ⚡ Ape In (10 GRAM)
                  </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '4px' }}>
                  <span>Sent via Gramfinity Bot</span>
                  <span>{alert.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
