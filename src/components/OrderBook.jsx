import React, { useState, useEffect } from 'react';
import { mockEngine } from '../utils/mockEngine';

export default function OrderBook({ selectedTokenSymbol, currentPrice }) {
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  useEffect(() => {
    // Generate order book and refresh periodically
    const refreshOrderBook = () => {
      const data = mockEngine.getOrderBook(selectedTokenSymbol);
      setOrderBook(data);
    };

    refreshOrderBook();
    const interval = setInterval(refreshOrderBook, 4000);
    return () => clearInterval(interval);
  }, [selectedTokenSymbol, currentPrice]);

  const maxTotal = Math.max(
    orderBook.asks.length > 0 ? orderBook.asks[orderBook.asks.length - 1].total : 1,
    orderBook.bids.length > 0 ? orderBook.bids[orderBook.bids.length - 1].total : 1
  );

  const renderPriceString = (price) => {
    const gramPrice = mockEngine.tokens.GRAM?.price || 0.0085;
    const priceInGram = price / gramPrice;
    return priceInGram.toLocaleString(undefined, {
      minimumFractionDigits: selectedTokenSymbol === "TONY" ? 4 : 2,
      maximumFractionDigits: selectedTokenSymbol === "TONY" ? 4 : 2
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
        ORDER BOOK — {selectedTokenSymbol}/GRAM
      </h3>
      
      {/* Tables grid */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
        
        {/* Asks (Sells) - Sorted High to Low (Top is highest ask, bottom is nearest spread ask) */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '3px', flex: 1, justifyContent: 'flex-end', overflow: 'hidden', paddingBottom: '4px' }}>
          {orderBook.asks.map((ask, idx) => {
            const fillPercentage = (ask.total / maxTotal) * 100;
            return (
              <div
                key={`ask-${idx}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  position: 'relative',
                  padding: '2px 4px',
                  zIndex: 1
                }}
              >
                {/* Depth Background Bar */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${fillPercentage}%`,
                  background: 'var(--color-sell-bg)',
                  zIndex: -1,
                  borderRadius: '2px 0 0 2px'
                }} />
                <span style={{ color: 'var(--color-sell)' }}>{renderPriceString(ask.price)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{ask.size.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                <span style={{ color: 'var(--text-muted)' }}>{(ask.size * (ask.price / (mockEngine.tokens.GRAM?.price || 0.0085))).toLocaleString(undefined, { maximumFractionDigits: 0 })} G</span>
              </div>
            );
          })}
        </div>

        {/* Current Price Ticker Spread */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '6px 4px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.01)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LAST PRICE</span>
          <span style={{ color: 'var(--accent-cyan)', fontSize: '1rem', fontWeight: 600 }}>
            {renderPriceString(currentPrice)} GRAM
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SPREAD: ~0.08%</span>
        </div>

        {/* Bids (Buys) - Sorted Low to High (Top is nearest spread bid, bottom is lowest bid) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflow: 'hidden', paddingTop: '4px' }}>
          {orderBook.bids.map((bid, idx) => {
            const fillPercentage = (bid.total / maxTotal) * 100;
            return (
              <div
                key={`bid-${idx}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  position: 'relative',
                  padding: '2px 4px',
                  zIndex: 1
                }}
              >
                {/* Depth Background Bar */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${fillPercentage}%`,
                  background: 'var(--color-buy-bg)',
                  zIndex: -1,
                  borderRadius: '2px 0 0 2px'
                }} />
                <span style={{ color: 'var(--color-buy)' }}>{renderPriceString(bid.price)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{bid.size.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                <span style={{ color: 'var(--text-muted)' }}>{(bid.size * (bid.price / (mockEngine.tokens.GRAM?.price || 0.0085))).toLocaleString(undefined, { maximumFractionDigits: 0 })} G</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
