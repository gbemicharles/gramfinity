import React, { useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { mockEngine } from './utils/mockEngine';
import Terminal from './pages/Terminal';
import Discover from './pages/Discover';
import WhaleTracker from './pages/WhaleTracker';
import Portfolio from './pages/Portfolio';
import Intelligence from './pages/Intelligence';
import Social from './pages/Social';
import Alerts from './pages/Alerts';
import ErrorBoundary from './components/ErrorBoundary';
import { TrendingUp, Compass, Eye, Layers, Bell, Zap, Menu, Wallet, ShieldAlert, Cpu, Brain, MessageSquare } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('discover'); // discover, terminal, whales, portfolio
  const [selectedToken, setSelectedToken] = useState('NOT');
  const [tonPrice, setTonPrice] = useState(7.24);
  const [wallet, setWallet] = useState(null);
  const [activeWalletId, setActiveWalletIdState] = useState('main');
  const [toasts, setToasts] = useState([]);
  const [tmaMode, setTmaMode] = useState(false);
  const [networkMode, setNetworkMode] = useState(() => localStorage.getItem('gramfinity_network_mode') || 'sandbox');
  const [tgUser, setTgUser] = useState(null);

  const [tonConnectUI] = useTonConnectUI();
  const realTonWallet = useTonWallet();

  // Load prices, network settings, and real wallet updates from TonConnect
  useEffect(() => {
    mockEngine.setNetworkMode(networkMode);
  }, [networkMode]);

  useEffect(() => {
    if (realTonWallet) {
      mockEngine.setRealWalletAddress(realTonWallet.account.address);
    } else {
      mockEngine.setRealWalletAddress(null);
    }
  }, [realTonWallet]);

  useEffect(() => {
    // If running in a real Telegram WebApp context
    const tgWebApp = window.Telegram?.WebApp;
    if (tgWebApp?.initDataUnsafe?.user) {
      setTgUser({
        username: tgWebApp.initDataUnsafe.user.username || 'tg_user',
        firstName: tgWebApp.initDataUnsafe.user.first_name || 'Telegram User',
        photoUrl: tgWebApp.initDataUnsafe.user.photo_url || null,
        isReal: true
      });
    } else {
      // Check localStorage for saved mock user
      const saved = localStorage.getItem('gramfinity_tg_user');
      if (saved) {
        setTgUser(JSON.parse(saved));
      }
    }
  }, []);

  const connectTelegram = () => {
    const mockUser = {
      username: 'ton_degen_777',
      firstName: 'Degen Trader',
      photoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&q=80',
      isReal: false
    };
    setTgUser(mockUser);
    localStorage.setItem('gramfinity_tg_user', JSON.stringify(mockUser));
    mockEngine.triggerToast('Telegram Account connected!', 'success');
  };

  const disconnectTelegram = () => {
    setTgUser(null);
    localStorage.removeItem('gramfinity_tg_user');
    mockEngine.triggerToast('Telegram Account disconnected.', 'info');
  };

  // Load prices and wallet from engine
  useEffect(() => {
    const unsubscribePrices = mockEngine.subscribePrices(tokens => {
      if (tokens.TON) {
        setTonPrice(tokens.TON.price);
      }
    });

    const unsubscribeWallet = mockEngine.subscribeWallet(w => {
      setWallet(w);
    });

    const unsubscribeActiveWallet = mockEngine.subscribeActiveWalletId(id => {
      setActiveWalletIdState(id);
    });

    // Hook up toast emitter to UI state
    mockEngine.registerToastEmitter((message, type) => {
      const newToast = {
        id: Date.now() + Math.random(),
        message,
        type // success, error, info, buy (green), sell (red), alert (gold)
      };
      
      setToasts(prev => [...prev, newToast]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    });

    return () => {
      unsubscribePrices();
      unsubscribeWallet();
      unsubscribeActiveWallet();
      mockEngine.registerToastEmitter(null);
    };
  }, []);

  const handleSelectTokenForTrade = (symbol) => {
    setSelectedToken(symbol);
    setActivePage('terminal');
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const renderInnerApp = () => {
    return (
      <div className={`app-container ${tmaMode ? 'tma-mode-layout' : ''}`}>
        
        {/* 1. TOP STATS BAR (grid area: stats) */}
        <div style={{
          gridArea: 'stats',
          background: '#04060a',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          zIndex: 15
        }}>
          {/* Left Side: live network stats */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff87', boxShadow: '0 0 8px #00ff87' }} />
              TON Network: <span style={{ color: '#ffffff' }}>Optimal</span>
            </span>
            <span style={{ display: tmaMode ? 'none' : 'inline' }}>
              Gas Fee: <span style={{ color: '#00ff87' }}>Low (0.005 TON)</span>
            </span>
            <span>
              GRAM Price: <span style={{ color: 'var(--accent-cyan)' }}>${tonPrice.toFixed(2)}</span>
            </span>
          </div>

          {/* Right Side: Sandbox/Mainnet, TMA Preview, API */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* Sandbox / Mainnet Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px', gap: '2px' }}>
              <button
                onClick={() => {
                  setNetworkMode('sandbox');
                  localStorage.setItem('gramfinity_network_mode', 'sandbox');
                }}
                style={{
                  background: networkMode === 'sandbox' ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                  border: 'none',
                  color: networkMode === 'sandbox' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: networkMode === 'sandbox' ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                Sandbox
              </button>
              <button
                onClick={() => {
                  setNetworkMode('mainnet');
                  localStorage.setItem('gramfinity_network_mode', 'mainnet');
                }}
                style={{
                  background: networkMode === 'mainnet' ? 'rgba(0, 255, 135, 0.12)' : 'transparent',
                  border: 'none',
                  color: networkMode === 'mainnet' ? 'var(--accent-green)' : 'var(--text-secondary)',
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: networkMode === 'mainnet' ? 600 : 400,
                  transition: 'all 0.2s'
                }}
              >
                Mainnet
              </button>
            </div>

            <button
              onClick={() => setTmaMode(prev => !prev)}
              style={{
                background: tmaMode ? 'rgba(0, 229, 255, 0.12)' : 'var(--bg-tertiary)',
                border: `1px solid ${tmaMode ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                color: tmaMode ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: '0.65rem',
                padding: '2px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              className="hover:border-cyan"
              title="Toggle Telegram Mini App Preview Mode"
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: tmaMode ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
              TMA View: {tmaMode ? 'ON' : 'OFF'}
            </button>
            <span style={{ display: tmaMode ? 'none' : 'inline' }}>Mode: <span style={{ color: networkMode === 'mainnet' ? 'var(--accent-green)' : 'var(--accent-cyan)' }}>{networkMode === 'mainnet' ? 'Live' : 'Sandbox'}</span></span>
          </div>
        </div>

        {/* 2. SIDEBAR NAVIGATION (grid area: sidebar) */}
        {!tmaMode && (
          <aside style={{
            gridArea: 'sidebar',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 12px',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Logo Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
                <Cpu size={24} className="text-cyan" />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.05em',
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  GRAMFINITY
                </span>
              </div>

              {/* Navigation Links */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className={`btn btn-secondary ${activePage === 'discover' ? 'active' : ''}`}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    background: activePage === 'discover' ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: activePage === 'discover' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: activePage === 'discover' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                  }}
                  onClick={() => setActivePage('discover')}
                >
                  <Compass size={16} /> Discover Scanner
                </button>

                <button
                  className={`btn btn-secondary ${activePage === 'terminal' ? 'active' : ''}`}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    background: activePage === 'terminal' ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: activePage === 'terminal' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: activePage === 'terminal' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                  }}
                  onClick={() => setActivePage('terminal')}
                >
                  <TrendingUp size={16} /> Trade Terminal
                </button>

                <button
                  className={`btn btn-secondary ${activePage === 'whales' ? 'active' : ''}`}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    background: activePage === 'whales' ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: activePage === 'whales' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: activePage === 'whales' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActivePage('whales')}
                >
                  <Eye size={16} /> Whale Tracker
                </button>

                <button
                  className={`btn btn-secondary ${activePage === 'intelligence' ? 'active' : ''}`}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    background: activePage === 'intelligence' ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: activePage === 'intelligence' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: activePage === 'intelligence' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActivePage('intelligence')}
                >
                  <Brain size={16} /> Smart Intelligence
                </button>

                <button
                  className={`btn btn-secondary ${activePage === 'social' ? 'active' : ''}`}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    background: activePage === 'social' ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: activePage === 'social' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: activePage === 'social' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActivePage('social')}
                >
                  <MessageSquare size={16} /> Social Sentiment
                </button>

                <button
                  className={`btn btn-secondary ${activePage === 'alerts' ? 'active' : ''}`}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    background: activePage === 'alerts' ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: activePage === 'alerts' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: activePage === 'alerts' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActivePage('alerts')}
                >
                  <Bell size={16} /> Bot Alert Center
                </button>

                <button
                  className={`btn btn-secondary ${activePage === 'portfolio' ? 'active' : ''}`}
                  style={{
                    justifyContent: 'flex-start',
                    width: '100%',
                    background: activePage === 'portfolio' ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    borderColor: activePage === 'portfolio' ? 'rgba(0, 229, 255, 0.2)' : 'transparent',
                    color: activePage === 'portfolio' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActivePage('portfolio')}
                >
                  <Layers size={16} /> Portfolio Tracker
                </button>
              </nav>
            </div>

            {/* Sidebar Footer Wallet */}
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <Wallet size={14} className="text-green" /> Wallet Balance
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {wallet ? wallet.balances.TON.toFixed(2) : '0.00'} TON
              </div>
            </div>
          </aside>
        )}

        {/* 3. APP HEADER ROW (grid area: header) */}
        <header style={{
          gridArea: 'header',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: tmaMode ? '0 12px' : '0 24px',
          zIndex: 5
        }}>
          <div>
            <h2 style={{ fontSize: tmaMode ? '0.85rem' : '1.1rem', textTransform: 'capitalize', color: '#ffffff' }}>
              {activePage === 'terminal' ? 'Instant Trade Terminal' : 
               activePage === 'discover' ? 'Token Discover & Safety Scanner' : 
               activePage === 'whales' ? 'Whale Tracker & Copy Wallets' : 
               activePage === 'intelligence' ? 'Forensic Smart Intelligence' : 
               activePage === 'social' ? 'Social Sentiment Metrics' : 
               activePage === 'alerts' ? 'Telegram Alert Configuration' : 'Gramfinity Wallet Portfolio'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Wallet profile selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Profile:</span>
              <select
                value={activeWalletId}
                onChange={(e) => mockEngine.setActiveWalletId(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.7rem',
                  padding: '3px 6px',
                  borderRadius: '6px',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <option value="main">💳 Main Wallet</option>
                <option value="sniper">🎯 Sniper Wallet</option>
                <option value="burner">🔥 Burner Wallet</option>
              </select>
            </div>

            {/* Telegram Profile Button */}
            {tgUser ? (
              <button
                onClick={disconnectTelegram}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                title="Disconnect Telegram Account"
              >
                {tgUser.photoUrl ? (
                  <img src={tgUser.photoUrl} alt="tg" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#000' }}>
                    {tgUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>@{tgUser.username}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-sell)' }}>[Exit]</span>
              </button>
            ) : (
              <button
                onClick={connectTelegram}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.89 1.19-5.33 3.52-.5.35-.95.52-1.37.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.74 3.89-1.69 6.48-2.8 7.77-3.32 3.7-1.5 4.46-1.76 4.96-1.77.11 0 .36.03.52.16.13.1.17.24.18.34z"/>
                </svg>
                <span>Connect TG</span>
              </button>
            )}

            {/* TON Wallet Connect Button */}
            {realTonWallet ? (
              <button
                onClick={() => tonConnectUI.disconnect()}
                className="btn btn-secondary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  borderColor: 'var(--accent-green)',
                  color: 'var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
                title="Disconnect Wallet"
              >
                <Wallet size={10} />
                <span>{`${realTonWallet.account.address.slice(0, 4)}...${realTonWallet.account.address.slice(-3)}`}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--color-sell)' }}>[Exit]</span>
              </button>
            ) : (
              <button
                onClick={() => tonConnectUI.openModal()}
                className="btn btn-primary"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                <Wallet size={10} />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </header>

        {/* 4. MAIN PAGE DISPLAY CONTENT (grid area: content) */}
        <main style={{
          gridArea: 'content',
          background: 'var(--bg-primary)',
          overflowY: 'auto'
        }}>
          {activePage === 'terminal' && (
            <ErrorBoundary>
              <Terminal initialSymbol={selectedToken} />
            </ErrorBoundary>
          )}
          {activePage === 'discover' && (
            <Discover onSelectTokenForTrade={handleSelectTokenForTrade} />
          )}
          {activePage === 'whales' && (
            <WhaleTracker />
          )}
          {activePage === 'portfolio' && (
            <Portfolio onSelectTokenForTrade={handleSelectTokenForTrade} />
          )}
          {activePage === 'intelligence' && (
            <Intelligence onSelectTokenForTrade={handleSelectTokenForTrade} />
          )}
          {activePage === 'social' && (
            <Social />
          )}
          {activePage === 'alerts' && (
            <Alerts />
          )}
        </main>

        {/* 5. BOTTOM NAVIGATION BAR (for TMA Mobile View) */}
        {tmaMode && (
          <nav style={{
            gridArea: 'bottomnav',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 10,
            padding: '4px 0'
          }}>
            <button
              onClick={() => setActivePage('discover')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'discover' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                fontSize: '0.58rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <Compass size={14} />
              <span style={{ transform: 'scale(0.95)' }}>Radar</span>
            </button>

            <button
              onClick={() => setActivePage('terminal')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'terminal' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                fontSize: '0.58rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <TrendingUp size={14} />
              <span style={{ transform: 'scale(0.95)' }}>Trade</span>
            </button>

            <button
              onClick={() => setActivePage('whales')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'whales' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                fontSize: '0.58rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <Eye size={14} />
              <span style={{ transform: 'scale(0.95)' }}>Whales</span>
            </button>

            <button
              onClick={() => setActivePage('intelligence')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'intelligence' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                fontSize: '0.58rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <Brain size={14} />
              <span style={{ transform: 'scale(0.95)' }}>Intel</span>
            </button>

            <button
              onClick={() => setActivePage('social')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'social' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                fontSize: '0.58rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <MessageSquare size={14} />
              <span style={{ transform: 'scale(0.95)' }}>Social</span>
            </button>

            <button
              onClick={() => setActivePage('alerts')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'alerts' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                fontSize: '0.58rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <Bell size={14} />
              <span style={{ transform: 'scale(0.95)' }}>Alerts</span>
            </button>

            <button
              onClick={() => setActivePage('portfolio')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activePage === 'portfolio' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                fontSize: '0.58rem',
                cursor: 'pointer',
                flex: 1
              }}
            >
              <Layers size={14} />
              <span style={{ transform: 'scale(0.95)' }}>Wallet</span>
            </button>
          </nav>
        )}

      </div>
    );
  };

  return (
    <div className={`app-wrapper ${tmaMode ? 'tma-active' : ''}`} style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: tmaMode ? '#030508' : 'transparent',
      overflow: 'hidden'
    }}>
      {tmaMode ? (
        <div className="tma-phone-container">
          <div className="tma-phone-bezel">
            {/* Camera notch */}
            <div className="tma-phone-notch" />
            
            {/* Phone Status Bar */}
            <div className="tma-phone-status-bar">
              <span style={{ fontWeight: 600 }}>9:41</span>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.62rem' }}>5G</span>
                <div style={{ width: '15px', height: '8px', border: '1px solid currentColor', borderRadius: '2px', padding: '1px', display: 'flex' }}>
                  <div style={{ width: '100%', height: '100%', background: 'currentColor', borderRadius: '0.5px' }} />
                </div>
              </div>
            </div>
            
            {/* Telegram App Webview Header overlay */}
            <div className="tma-tg-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="tma-tg-btn" onClick={() => setTmaMode(false)} style={{ fontSize: '1rem', background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>&larr;</button>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>Gramfinity Terminal</span>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>@gramfinity_bot</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="tma-tg-btn" style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem' }}>&bull;&bull;&bull;</button>
                <button className="tma-tg-btn" onClick={() => setTmaMode(false)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>&#x2715;</button>
              </div>
            </div>
            
            {/* Render app container here */}
            <div style={{ width: '100%', height: 'calc(100% - 66px)', position: 'relative' }}>
              {renderInnerApp()}
            </div>
          </div>
        </div>
      ) : (
        renderInnerApp()
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px'
      }}>
        {toasts.map(toast => {
          let bg = 'var(--bg-surface)';
          let border = 'var(--border-color)';
          let textColor = '#ffffff';

          if (toast.type === 'success') {
            border = 'var(--color-buy)';
            bg = 'rgba(16, 185, 129, 0.95)';
            textColor = '#ffffff';
          } else if (toast.type === 'buy') {
            border = 'var(--color-buy)';
            bg = 'rgba(6, 15, 20, 0.95)';
            textColor = 'var(--color-buy)';
          } else if (toast.type === 'sell') {
            border = 'var(--color-sell)';
            bg = 'rgba(15, 6, 10, 0.95)';
            textColor = 'var(--color-sell)';
          } else if (toast.type === 'alert') {
            border = 'var(--accent-gold)';
            bg = 'rgba(15, 12, 6, 0.95)';
            textColor = 'var(--accent-gold)';
          }

          return (
            <div
              key={toast.id}
              className="glass-panel"
              style={{
                padding: '12px 16px',
                background: bg,
                border: `1.5px solid ${border}`,
                color: textColor,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}
              onClick={() => removeToast(toast.id)}
            >
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', lineHeight: '1.4' }}>
                {toast.type === 'alert' && <ShieldAlert size={16} style={{ flexShrink: 0 }} />}
                <span>{toast.message}</span>
              </div>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'currentColor',
                  opacity: 0.5,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex'
                }}
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
