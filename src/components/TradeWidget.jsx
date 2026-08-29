import React, { useState, useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { mockEngine } from '../utils/mockEngine';
import { ArrowDownUp, ShieldCheck, Flame, Zap } from 'lucide-react';

export default function TradeWidget({ selectedTokenSymbol, tokensList = {} }) {
  const [tradeType, setTradeType] = useState('BUY'); // BUY or SELL
  const [amount, setAmount] = useState('10');
  const [slippage, setSlippage] = useState('1.0');
  const [wallet, setWallet] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [tonConnectUI] = useTonConnectUI();
  const [selectedDex, setSelectedDex] = useState('STONFI'); // STONFI or DEDUST
  const [mode, setMode] = useState('bot'); // 'bot', 'market', 'limit', 'dca'
  
  // TP/SL limits state
  const [tpslActive, setTpslActive] = useState(false);
  const [tpPercent, setTpPercent] = useState('100');
  const [slPercent, setSlPercent] = useState('50');

  // Limit Order parameters
  const [limitPrice, setLimitPrice] = useState('');
  const [limitType, setLimitType] = useState('BUY');

  // DCA order parameters
  const [dcaAmount, setDcaAmount] = useState('10');
  const [dcaInterval, setDcaInterval] = useState('5');
  const [dcaIterations, setDcaIterations] = useState('3');

  const handleBotInstantTrade = (type, amt) => {
    setErrorMsg('');
    setSuccessMsg('');
    
    // Check mainnet connection
    if (mockEngine.networkMode === 'mainnet') {
      if (!tonConnectUI.wallet) {
        setErrorMsg('Please connect your TON wallet first');
        mockEngine.triggerToast('Please connect your TON wallet first', 'error');
        return;
      }
      
      const txValue = type === 'BUY' ? (parseFloat(amt) * 1000000000).toString() : "50000000";
      const stonfiRouter = "EQB3nN1FF82K_CLZu51nKC11K39u78923NCA119b9bc88a1a";
      const dedustRouter = "EQD26g3354s6q7729bc221aa8fdde901aa290b33bca1128c";
      const selectedRouter = selectedDex === 'DEDUST' ? dedustRouter : stonfiRouter;
      
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: activeToken.address.startsWith("EQ") ? activeToken.address : selectedRouter,
            amount: txValue,
            payload: "" 
          }
        ]
      };

      mockEngine.triggerToast(`Sending instant bot transaction to TON wallet...`, 'info');
      tonConnectUI.sendTransaction(transaction)
        .then(() => {
          setSuccessMsg('Swap broadcast successfully!');
          mockEngine.triggerToast('Instant transaction broadcast successfully!', 'success');
        })
        .catch(err => {
          setErrorMsg(err.message || 'Transaction rejected by wallet');
          mockEngine.triggerToast('Transaction failed.', 'error');
        });
      return;
    }

    // Sandbox execution
    if (type === 'BUY') {
      mockEngine.triggerToast(`Bot Instant Executing: Buy ${amt} GRAM of $${selectedTokenSymbol}...`, 'info');
      const res = mockEngine.swap('BUY', selectedTokenSymbol, amt.toString());
      if (res.success) {
        mockEngine.triggerToast(`Bot Success: Bought ${parseFloat(res.amountToken).toLocaleString()} $${selectedTokenSymbol}!`, 'success');
        setSuccessMsg(`Bought $${selectedTokenSymbol} successfully!`);
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } else {
        setErrorMsg(res.error);
        mockEngine.triggerToast(`Bot Error: ${res.error}`, 'error');
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      }
    } else {
      const balance = wallet?.balances[selectedTokenSymbol] || 0;
      if (balance <= 0) {
        setErrorMsg(`No $${selectedTokenSymbol} balance to sell`);
        mockEngine.triggerToast(`Bot Error: No $${selectedTokenSymbol} balance to sell.`, 'error');
        return;
      }
      const sellAmt = (balance * amt) / 100;
      mockEngine.triggerToast(`Bot Instant Executing: Sell ${amt}% of $${selectedTokenSymbol}...`, 'info');
      const res = mockEngine.swap('SELL', selectedTokenSymbol, sellAmt.toString());
      if (res.success) {
        mockEngine.triggerToast(`Bot Success: Sold for ${parseFloat(res.amountTON).toLocaleString()} GRAM!`, 'success');
        setSuccessMsg(`Sold $${selectedTokenSymbol} successfully!`);
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } else {
        setErrorMsg(res.error);
        mockEngine.triggerToast(`Bot Error: ${res.error}`, 'error');
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      }
    }
  };

  const activeToken = tokensList[selectedTokenSymbol];
  const tonPrice = tokensList.TON?.price || 7.24;

  useEffect(() => {
    const unsubscribe = mockEngine.subscribeWallet(w => {
      setWallet(w);
    });
    return unsubscribe;
  }, []);

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
    setErrorMsg('');
  };

  const handleSwap = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Enter a valid amount');
      return;
    }

    if (mockEngine.networkMode === 'mainnet') {
      if (!tonConnectUI.wallet) {
        setErrorMsg('Please connect your TON wallet first');
        mockEngine.triggerToast('Please connect your TON wallet first', 'error');
        return;
      }

      // Build real or template transaction request to TON wallet
      const txValue = (parseFloat(amount) * 1000000000).toString(); // in nanotons
      
      const stonfiRouter = "EQB3nN1FF82K_CLZu51nKC11K39u78923NCA119b9bc88a1a";
      const dedustRouter = "EQD26g3354s6q7729bc221aa8fdde901aa290b33bca1128c";
      const selectedRouter = selectedDex === 'DEDUST' ? dedustRouter : stonfiRouter;
      
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
        messages: [
          {
            address: activeToken.address.startsWith("EQ") ? activeToken.address : selectedRouter,
            amount: tradeType === 'BUY' ? txValue : "50000000", // Send TON if BUY, otherwise 0.05 TON gas
            payload: "" 
          }
        ]
      };

      try {
        mockEngine.triggerToast('Sending swap transaction request to TON wallet...', 'info');
        const result = await tonConnectUI.sendTransaction(transaction);
        setSuccessMsg('Swap broadcast successfully!');
        mockEngine.triggerToast('Transaction broadcast successfully! Check your TON wallet history.', 'success');
      } catch (error) {
        console.error("Mainnet swap transaction error", error);
        setErrorMsg(error.message || 'Transaction rejected by wallet');
        mockEngine.triggerToast('Transaction rejected or failed.', 'error');
      }
      return;
    }

    const res = mockEngine.swap(
      tradeType, 
      selectedTokenSymbol, 
      amount,
      tpslActive ? { tp: parseFloat(tpPercent), active: true } : null,
      tpslActive ? { sl: parseFloat(slPercent), active: true } : null
    );
    if (!res.success) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Trade executed!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (!activeToken) return null;

  const currentPrice = activeToken.price;
  const userBalance = wallet?.balances[selectedTokenSymbol] || 0;
  const userTonBalance = wallet?.balances.TON || 0;

  // Calculators
  let calculatedReceive = 0;
  const dexSlipFactor = selectedDex === 'DEDUST' ? 0.9975 : 1.0;
  if (tradeType === 'BUY') {
    const inputTon = parseFloat(amount) || 0;
    calculatedReceive = ((inputTon * tonPrice) / currentPrice) * dexSlipFactor;
  } else {
    const inputToken = parseFloat(amount) || 0;
    calculatedReceive = ((inputToken * currentPrice) / tonPrice) * dexSlipFactor;
  }

  // Price impact calculation
  const inputNum = parseFloat(amount) || 0;
  const tradeValueUSD = inputNum * (tradeType === 'BUY' ? tonPrice : currentPrice);
  const poolLiquidity = activeToken.liquidity || 10000;
  const priceImpact = Math.min(99.9, (tradeValueUSD / poolLiquidity) * 100 * 1.2);

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Interface Mode selector (Tabs) */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>
        {['bot', 'market', 'limit', 'dca'].map(m => (
          <button
            key={m}
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: '4px 0',
              background: mode === m ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
              borderColor: mode === m ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
              color: mode === m ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '0.62rem',
              height: '24px',
              borderRadius: '6px',
              fontWeight: mode === m ? 600 : 400,
              cursor: 'pointer'
            }}
            onClick={() => { setMode(m); setErrorMsg(''); setSuccessMsg(''); }}
          >
            {m === 'bot' ? 'INSTANT' : m.toUpperCase()}
          </button>
        ))}
      </div>

      {mode === 'bot' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Token Specs Header info */}
          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>ACTIVE PAIR</span>
              <span>Balance</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedTokenSymbol} / GRAM</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#ffffff' }}>
                {wallet?.balances[selectedTokenSymbol]?.toLocaleString() || 0} {selectedTokenSymbol}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border-color)', paddingTop: '4px', marginTop: '4px' }}>
              <span>GRAM Balance: {wallet?.balances.TON.toFixed(2)} GRAM</span>
              <span>Price: ${activeToken.price.toLocaleString(undefined, { minimumFractionDigits: 4 })}</span>
            </div>
          </div>

          {/* Buy Presets Title */}
          <span style={{ fontSize: '0.72rem', color: 'var(--color-buy)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            ■ INSTANT BUY Presets (Single-tap)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[5, 20, 50].map(gramAmt => (
              <button
                key={gramAmt}
                type="button"
                className="btn btn-buy hover-scale"
                style={{ padding: '8px 0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleBotInstantTrade('BUY', gramAmt)}
              >
                Buy {gramAmt} GRAM
              </button>
            ))}
            {[100, 250, 500].map(gramAmt => (
              <button
                key={gramAmt}
                type="button"
                className="btn btn-buy hover-scale"
                style={{ padding: '8px 0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleBotInstantTrade('BUY', gramAmt)}
              >
                Buy {gramAmt} GRAM
              </button>
            ))}
          </div>

          {/* Sell Presets Title */}
          <span style={{ fontSize: '0.72rem', color: 'var(--color-sell)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            ■ INSTANT SELL Presets (Single-tap)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[25, 50, 100].map(pct => (
              <button
                key={pct}
                type="button"
                className="btn btn-sell hover-scale"
                style={{ padding: '8px 0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleBotInstantTrade('SELL', pct)}
              >
                Sell {pct}%
              </button>
            ))}
          </div>

          {/* Settings Grid */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.01)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '10px', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '8px' 
          }}>
            {/* DEX selector toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>ROUTING DEX</span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 0', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                onClick={() => setSelectedDex(prev => prev === 'STONFI' ? 'DEDUST' : 'STONFI')}
              >
                {selectedDex === 'STONFI' ? 'STON.fi' : 'DeDust'}
              </button>
            </div>
            {/* Slippage preset toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>SLIPPAGE</span>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '4px 0', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                onClick={() => setSlippage(prev => prev === '1.0' ? '3.0' : prev === '3.0' ? '0.5' : '1.0')}
              >
                {slippage}%
              </button>
            </div>
          </div>

          {/* Error and Success Indicators */}
          {errorMsg && (
            <div style={{ color: 'var(--color-sell)', fontSize: '0.75rem', padding: '6px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ color: 'var(--color-buy)', fontSize: '0.75rem', padding: '6px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ✅ {successMsg}
            </div>
          )}
        </div>
      ) : mode === 'market' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Header Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <button
              type="button"
              className="btn"
              style={{
                background: tradeType === 'BUY' ? 'var(--color-buy-bg)' : 'transparent',
                borderColor: tradeType === 'BUY' ? 'var(--color-buy)' : 'var(--border-color)',
                color: tradeType === 'BUY' ? 'var(--color-buy)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => { setTradeType('BUY'); setErrorMsg(''); }}
            >
              BUY
            </button>
            <button
              type="button"
              className="btn"
              style={{
                background: tradeType === 'SELL' ? 'var(--color-sell-bg)' : 'transparent',
                borderColor: tradeType === 'SELL' ? 'var(--color-sell)' : 'var(--border-color)',
                color: tradeType === 'SELL' ? 'var(--color-sell)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => { setTradeType('SELL'); setErrorMsg(''); }}
            >
              SELL
            </button>
          </div>

          <form onSubmit={handleSwap} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Input Card */}
            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>PAYING</span>
                <span style={{ cursor: 'pointer' }} onClick={() => handleQuickAmount(tradeType === 'BUY' ? Math.floor(userTonBalance) : userBalance)}>
                  Balance: {tradeType === 'BUY' ? `${userTonBalance.toLocaleString()} GRAM` : `${userBalance.toLocaleString()} ${selectedTokenSymbol}`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  step="any"
                  className="input-field"
                  style={{ border: 'none', background: 'transparent', padding: '0', fontSize: '1.25rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrorMsg(''); }}
                  placeholder="0.0"
                />
                <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {tradeType === 'BUY' ? 'GRAM' : selectedTokenSymbol}
                </span>
              </div>
            </div>

            {/* Direction indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-6px 0' }}>
              <button
                type="button"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  padding: '8px',
                  display: 'flex',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-sm)'
                }}
                className="hover-scale hover:border-cyan"
                onClick={() => {
                  setTradeType(prev => prev === 'BUY' ? 'SELL' : 'BUY');
                  setErrorMsg('');
                }}
              >
                <ArrowDownUp size={14} />
              </button>
            </div>

            {/* Output Card */}
            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>RECEIVING (ESTIMATED)</span>
                <span>
                  Balance: {tradeType === 'BUY' ? `${userBalance.toLocaleString()} ${selectedTokenSymbol}` : `${userTonBalance.toLocaleString()} GRAM`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, fontFamily: 'var(--font-mono)', color: tradeType === 'BUY' ? 'var(--color-buy)' : 'var(--accent-cyan)' }}>
                  {calculatedReceive.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {tradeType === 'BUY' ? selectedTokenSymbol : 'GRAM'}
                </span>
              </div>
            </div>

            {/* Auto TP/SL checkbox parameters */}
            <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#ffffff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={tpslActive}
                  onChange={(e) => setTpslActive(e.target.checked)}
                  style={{ accentColor: 'var(--accent-cyan)' }}
                />
                🛡️ Auto TP / SL Protection
              </label>
              {tpslActive && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>TAKE PROFIT %</span>
                    <input
                      type="number"
                      className="input-field"
                      style={{ height: '24px', fontSize: '0.7rem', padding: '0 6px', background: 'var(--bg-primary)' }}
                      value={tpPercent}
                      onChange={(e) => setTpPercent(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>STOP LOSS %</span>
                    <input
                      type="number"
                      className="input-field"
                      style={{ height: '24px', fontSize: '0.7rem', padding: '0 6px', background: 'var(--bg-primary)' }}
                      value={slPercent}
                      onChange={(e) => setSlPercent(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Specs card */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Gas:</span>
                <span style={{ color: 'var(--text-primary)' }}>0.05 GRAM (~$0.36)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Price Impact:</span>
                <span style={{
                  color: priceImpact > 5 ? 'var(--color-sell)' :
                         priceImpact > 2 ? 'var(--accent-gold)' : 'var(--color-buy)',
                  fontWeight: 600
                }}>
                  {priceImpact.toFixed(2)}% {priceImpact > 5 ? '(High)' : priceImpact > 2 ? '(Medium)' : '(Low)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Route Aggregator:</span>
                <span style={{ fontSize: '0.62rem', background: 'rgba(0, 255, 135, 0.08)', color: 'var(--accent-green)', padding: '1px 5px', borderRadius: '4px', border: '1px solid rgba(0,255,135,0.2)', fontWeight: 600 }}>
                  ⚡ Omniston RFQ Resolved
                </span>
              </div>

              {/* Comparative Arbitrage Indicators */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>STON.fi Pool Price:</span>
                  <span style={{ color: selectedDex === 'STONFI' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: selectedDex === 'STONFI' ? 600 : 400 }}>
                    ${(currentPrice * 1.002).toFixed(selectedTokenSymbol === 'TONY' ? 6 : 4)} {selectedDex === 'STONFI' && '🏆 (Best)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>DeDust Pool Price:</span>
                  <span style={{ color: selectedDex === 'DEDUST' ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: selectedDex === 'DEDUST' ? 600 : 400 }}>
                    ${(currentPrice * 1.0045).toFixed(selectedTokenSymbol === 'TONY' ? 6 : 4)} {selectedDex === 'DEDUST' && '🏆 (Best)'}
                  </span>
                </div>
              </div>

              {/* Graphical Routing Hops flowchart */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', fontSize: '0.65rem' }}>
                {/* Node A */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px', fontWeight: 600 }}>
                  {tradeType === 'BUY' ? 'GRAM' : selectedTokenSymbol}
                </div>
                
                {/* Flow lines */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', margin: '0 8px' }}>
                  <div style={{ height: '1.5px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))', width: '100%' }} />
                  <span style={{ fontSize: '0.52rem', color: 'var(--accent-cyan)', background: 'var(--bg-primary)', padding: '0 4px', zIndex: 1, position: 'absolute', top: '-6px', borderRadius: '3px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                    Gramfinity Router
                  </span>
                </div>

                {/* Node B */}
                <div style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid var(--accent-cyan)', borderRadius: '4px', padding: '2px 6px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {selectedDex === 'STONFI' ? 'STON.fi AMM' : 'DeDust Pool'}
                </div>

                {/* Flow lines */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', margin: '0 8px' }}>
                  <div style={{ height: '1.5px', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))', width: '100%' }} />
                </div>

                {/* Node C */}
                <div style={{ background: 'rgba(0, 255, 135, 0.08)', border: '1px solid var(--accent-green)', borderRadius: '4px', padding: '2px 6px', fontWeight: 600, color: 'var(--accent-green)' }}>
                  {tradeType === 'BUY' ? selectedTokenSymbol : 'GRAM'}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px 0', fontSize: '0.85rem', fontWeight: 600 }}>
              Confirm Swap Trade
            </button>
          </form>

          {/* Error and Success Indicators */}
          {errorMsg && (
            <div style={{ color: 'var(--color-sell)', fontSize: '0.75rem', padding: '6px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ color: 'var(--color-buy)', fontSize: '0.75rem', padding: '6px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ✅ {successMsg}
            </div>
          )}
        </div>
      ) : mode === 'limit' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, background: limitType === 'BUY' ? 'var(--color-buy-bg)' : 'transparent', color: limitType === 'BUY' ? 'var(--color-buy)' : 'var(--text-muted)', borderColor: limitType === 'BUY' ? 'var(--color-buy)' : 'var(--border-color)', fontSize: '0.72rem' }}
              onClick={() => setLimitType('BUY')}
            >
              LIMIT BUY
            </button>
            <button
              type="button"
              className="btn"
              style={{ flex: 1, background: limitType === 'SELL' ? 'var(--color-sell-bg)' : 'transparent', color: limitType === 'SELL' ? 'var(--color-sell)' : 'var(--text-muted)', borderColor: limitType === 'SELL' ? 'var(--color-sell)' : 'var(--border-color)', fontSize: '0.72rem' }}
              onClick={() => setLimitType('SELL')}
            >
              LIMIT SELL
            </button>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>TRIGGER PRICE (USD)</span>
              <input
                type="number"
                step="any"
                className="input-field"
                style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder={`Current: $${currentPrice.toFixed(6)}`}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>AMOUNT (GRAM)</span>
              <input
                type="number"
                step="any"
                className="input-field"
                style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to spend"
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', padding: '8px 0', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => {
              if (!amount || parseFloat(amount) <= 0 || !limitPrice || parseFloat(limitPrice) <= 0) {
                setErrorMsg('Enter valid trigger price & amount');
                return;
              }
              mockEngine.addLimitOrder(selectedTokenSymbol, limitType, amount, limitPrice);
              setSuccessMsg('Limit order set!');
              setTimeout(() => setSuccessMsg(''), 3000);
            }}
          >
            🎯 Set Limit {limitType} Order
          </button>

          {/* Error and Success Indicators */}
          {errorMsg && (
            <div style={{ color: 'var(--color-sell)', fontSize: '0.75rem', padding: '6px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ color: 'var(--color-buy)', fontSize: '0.75rem', padding: '6px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ✅ {successMsg}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>BUY AMOUNT PER RUN (GRAM)</span>
              <input
                type="number"
                step="any"
                className="input-field"
                style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}
                value={dcaAmount}
                onChange={(e) => setDcaAmount(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>INTERVAL (MINUTES)</span>
                <input
                  type="number"
                  className="input-field"
                  style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}
                  value={dcaInterval}
                  onChange={(e) => setDcaInterval(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>ITERATIONS</span>
                <input
                  type="number"
                  className="input-field"
                  style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}
                  value={dcaIterations}
                  onChange={(e) => setDcaIterations(e.target.value)}
                  placeholder="e.g. 3"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', padding: '8px 0', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => {
              if (!dcaAmount || parseFloat(dcaAmount) <= 0 || !dcaInterval || parseInt(dcaInterval) <= 0 || !dcaIterations || parseInt(dcaIterations) <= 0) {
                setErrorMsg('Enter valid DCA parameters');
                return;
              }
              mockEngine.addDcaOrder(selectedTokenSymbol, dcaAmount, dcaInterval, dcaIterations);
              setSuccessMsg('DCA Accumulator started!');
              setTimeout(() => setSuccessMsg(''), 3000);
            }}
          >
            🔁 Start DCA Purchases
          </button>

          {/* Error and Success Indicators */}
          {errorMsg && (
            <div style={{ color: 'var(--color-sell)', fontSize: '0.75rem', padding: '6px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ color: 'var(--color-buy)', fontSize: '0.75rem', padding: '6px', background: 'rgba(16,185,129,0.1)', borderRadius: '4px', textAlign: 'center' }}>
              ✅ {successMsg}
            </div>
          )}
        </div>
      )}

        {/* Quick Amount Picks */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(tradeType === 'BUY' ? [10, 50, 100, 500] : [1000, 10000, 50000, 100000]).map(val => (
            <button
              key={val}
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, padding: '6px 0', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
              onClick={() => handleQuickAmount(val)}
            >
              +{val.toLocaleString()}
            </button>
          ))}
        </div>

        {/* DEX Router Selection Row */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>DEX ROUTING (Best Price Aggregator)</span>
            <span style={{ color: 'var(--color-buy)', fontWeight: 600 }}>{selectedDex === 'STONFI' ? 'STON.fi is best rate' : 'DeDust +0.25% premium'}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                borderColor: selectedDex === 'STONFI' ? 'var(--accent-cyan)' : 'var(--border-color)',
                color: selectedDex === 'STONFI' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedDex('STONFI')}
            >
              STON.fi {selectedDex === 'STONFI' && <span style={{ fontSize: '0.6rem', background: 'rgba(0, 229, 255, 0.15)', padding: '2px 4px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>Best</span>}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                borderColor: selectedDex === 'DEDUST' ? 'var(--accent-cyan)' : 'var(--border-color)',
                color: selectedDex === 'DEDUST' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedDex('DEDUST')}
            >
              DeDust {selectedDex === 'DEDUST' && <span style={{ fontSize: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 4px', borderRadius: '4px' }}>+0.25%</span>}
            </button>
          </div>
        </div>

        {/* Slippage Settings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>SLIPPAGE TOLERANCE</span>
            <span>Fee: ~0.05 TON</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['0.1', '0.5', '1.0', '3.0'].map(val => (
              <button
                key={val}
                type="button"
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '4px 0',
                  fontSize: '0.75rem',
                  borderColor: slippage === val ? 'var(--accent-cyan)' : 'var(--border-color)',
                  color: slippage === val ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => setSlippage(val)}
              >
                {val}%
              </button>
            ))}
            <input
              type="text"
              className="input-field"
              style={{ flex: 1.5, padding: '4px 6px', fontSize: '0.75rem', textAlign: 'center', height: '28px' }}
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              placeholder="Custom"
            />
          </div>
        </div>



      {/* Safety Badges */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Contract Audit:</span>
          {activeToken.security?.verified ? (
            <span style={{ color: 'var(--color-buy)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Audited
            </span>
          ) : (
            <span style={{ color: 'var(--accent-gold)' }}>Unverified</span>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Rug Risk Score:</span>
          <span style={{
            color: activeToken.security?.rugScore > 50 ? 'var(--color-sell)' : 
                   activeToken.security?.rugScore > 20 ? 'var(--accent-gold)' : 'var(--color-buy)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Flame size={14} /> {activeToken.security?.rugScore} / 100 ({activeToken.security?.rugRisk})
          </span>
        </div>
      </div>
    </div>
  );
}
