import React, { useState, useEffect } from 'react';
import { mockEngine } from '../utils/mockEngine';
import { Bell, Trash2, ShieldAlert } from 'lucide-react';

export default function AlertManager({ selectedTokenSymbol, currentPrice }) {
  const [alerts, setAlerts] = useState([]);
  const [alertPrice, setAlertPrice] = useState(currentPrice.toString());
  const [condition, setCondition] = useState('ABOVE'); // ABOVE or BELOW

  useEffect(() => {
    const unsubscribe = mockEngine.subscribeAlerts(data => {
      setAlerts(data);
    });
    return unsubscribe;
  }, []);

  // Update alert target default input price when token changes
  useEffect(() => {
    setAlertPrice(currentPrice.toString());
  }, [selectedTokenSymbol, currentPrice]);

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (!alertPrice || parseFloat(alertPrice) <= 0) return;
    mockEngine.createAlert(selectedTokenSymbol, condition, alertPrice);
  };

  const handleRemoveAlert = (id) => {
    mockEngine.removeAlert(id);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      <h3 style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <Bell size={16} className="text-cyan" /> SET PRICE ALERTS
      </h3>

      {/* Add Alert Form */}
      <form onSubmit={handleCreateAlert} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '0.75rem',
              borderColor: condition === 'ABOVE' ? 'var(--accent-cyan)' : 'var(--border-color)',
              color: condition === 'ABOVE' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
            }}
            onClick={() => setCondition('ABOVE')}
          >
            Goes ABOVE
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '0.75rem',
              borderColor: condition === 'BELOW' ? 'var(--accent-cyan)' : 'var(--border-color)',
              color: condition === 'BELOW' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
            }}
            onClick={() => setCondition('BELOW')}
          >
            Goes BELOW
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', minWidth: '40px' }}>
            {selectedTokenSymbol} @
          </span>
          <input
            type="number"
            step="any"
            className="input-field"
            style={{ height: '32px', padding: '6px 10px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', height: '32px', fontSize: '0.75rem' }}>
            Set
          </button>
        </div>
      </form>

      {/* Active Alerts List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Active Alerts ({alerts.length})
        </div>
        {alerts.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            No price alerts active
          </div>
        ) : (
          alerts.map(a => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={14} className={a.active ? "text-cyan" : "text-muted"} />
                <span>{a.symbol}</span>
                <span style={{ color: 'var(--text-muted)' }}>{a.condition.toLowerCase()}</span>
                <span style={{ color: a.condition === 'ABOVE' ? 'var(--color-buy)' : 'var(--color-sell)', fontWeight: 600 }}>
                  ${a.target.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </div>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                onClick={() => handleRemoveAlert(a.id)}
              >
                <Trash2 size={12} className="hover:text-red" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
