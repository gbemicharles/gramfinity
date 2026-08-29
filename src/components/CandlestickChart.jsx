import React, { useRef, useEffect, useState } from 'react';

export default function CandlestickChart({ data = [], symbol = "TON" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [mousePos, setMousePos] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    
    // Handle resizing
    const resizeCanvas = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    };

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Clear canvas
      ctx.fillStyle = '#06090f';
      ctx.fillRect(0, 0, width, height);

      if (data.length === 0) return;

      // Chart Padding
      const paddingRight = 65;
      const paddingTop = 30;
      const paddingBottom = 25;
      const paddingLeft = 15;
      
      const chartWidth = width - paddingLeft - paddingRight;
      const chartHeight = height - paddingTop - paddingBottom;

      // Min/Max pricing
      const prices = data.map(d => [d.high, d.low]).flat();
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice || 1.0;
      const priceBuffer = priceRange * 0.05;

      const yMin = minPrice - priceBuffer;
      const yMax = maxPrice + priceBuffer;
      const yRange = yMax - yMin;

      // Draw Grid Lines
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1;
      
      // Horizontal grids (prices)
      const gridCount = 5;
      for (let i = 0; i <= gridCount; i++) {
        const yVal = yMax - (yRange / gridCount) * i;
        const yPos = paddingTop + (chartHeight / gridCount) * i;
        
        ctx.beginPath();
        ctx.moveTo(paddingLeft, yPos);
        ctx.lineTo(width - paddingRight, yPos);
        ctx.stroke();

        // Price label
        ctx.fillStyle = '#64748b';
        ctx.font = '10px "Space Grotesk", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `$${yVal.toLocaleString(undefined, { minimumFractionDigits: symbol === "TONY" ? 6 : 4, maximumFractionDigits: symbol === "TONY" ? 6 : 4 })}`,
          width - paddingRight + 5,
          yPos
        );
      }

      // Vertical grids & Candle drawing calculations
      const candleCount = data.length;
      const candleWidth = chartWidth / candleCount;
      const candleSpacing = Math.max(1, candleWidth * 0.15);
      const bodyWidth = candleWidth - candleSpacing;

      // Map time to X coordinate
      const getX = (index) => paddingLeft + index * candleWidth + bodyWidth / 2;
      // Map price to Y coordinate
      const getY = (price) => paddingTop + chartHeight - ((price - yMin) / yRange) * chartHeight;

      // Render vertical grid lines (every 20 candles)
      for (let i = 0; i < candleCount; i += 20) {
        const xPos = getX(i);
        ctx.beginPath();
        ctx.moveTo(xPos, paddingTop);
        ctx.lineTo(xPos, height - paddingBottom);
        ctx.stroke();

        // Timestamp
        const date = new Date(data[i].time);
        const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        ctx.fillStyle = '#64748b';
        ctx.font = '10px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, xPos, height - paddingBottom + 12);
      }

      // Draw Candlesticks
      data.forEach((candle, index) => {
        const openY = getY(candle.open);
        const closeY = getY(candle.close);
        const highY = getY(candle.high);
        const lowY = getY(candle.low);
        const xPos = getX(index);

        const isBullish = candle.close >= candle.open;
        const color = isBullish ? '#10b981' : '#ef4444';

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.5;

        // Wick
        ctx.beginPath();
        ctx.moveTo(xPos, highY);
        ctx.lineTo(xPos, lowY);
        ctx.stroke();

        // Body
        const top = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
        
        ctx.fillRect(xPos - bodyWidth / 2, top, bodyWidth, bodyHeight);
      });

      // Crosshair & Hover Logic
      if (mousePos && mousePos.x >= paddingLeft && mousePos.x <= width - paddingRight) {
        const hoveredIndex = Math.min(
          candleCount - 1,
          Math.max(0, Math.floor((mousePos.x - paddingLeft) / candleWidth))
        );
        const hovered = data[hoveredIndex];
        
        if (hovered) {
          const xPos = getX(hoveredIndex);
          const yPos = getY(hovered.close);

          // Draw Crosshair Lines
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);

          // Vertical Line
          ctx.beginPath();
          ctx.moveTo(xPos, paddingTop);
          ctx.lineTo(xPos, height - paddingBottom);
          ctx.stroke();

          // Horizontal Line
          ctx.beginPath();
          ctx.moveTo(paddingLeft, yPos);
          ctx.lineTo(width - paddingRight, yPos);
          ctx.stroke();

          ctx.setLineDash([]); // Reset line dash

          // Highlight intersection point
          ctx.fillStyle = '#00e5ff';
          ctx.beginPath();
          ctx.arc(xPos, yPos, 4, 0, Math.PI * 2);
          ctx.fill();

          // Set Hovered Candle for layout tooltip
          setHoveredCandle(hovered);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [data, mousePos, symbol]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Tooltip display */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '12px',
        display: 'flex',
        gap: '12px',
        background: 'rgba(6, 9, 15, 0.85)',
        border: '1px solid var(--border-color)',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        color: '#94a3b8',
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        {hoveredCandle ? (
          <>
            <span>O: <span style={{ color: hoveredCandle.close >= hoveredCandle.open ? '#10b981' : '#ef4444' }}>${hoveredCandle.open.toFixed(symbol === "TONY" ? 6 : 4)}</span></span>
            <span>H: <span style={{ color: '#00e5ff' }}>${hoveredCandle.high.toFixed(symbol === "TONY" ? 6 : 4)}</span></span>
            <span>L: <span style={{ color: '#ffb700' }}>${hoveredCandle.low.toFixed(symbol === "TONY" ? 6 : 4)}</span></span>
            <span>C: <span style={{ color: hoveredCandle.close >= hoveredCandle.open ? '#10b981' : '#ef4444' }}>${hoveredCandle.close.toFixed(symbol === "TONY" ? 6 : 4)}</span></span>
            <span>Vol: <span style={{ color: '#f8fafc' }}>{hoveredCandle.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
          </>
        ) : (
          <>
            <span style={{ color: '#00e5ff', fontWeight: 600 }}>{symbol}/USD Terminal Chart</span>
            <span>Hover chart to inspect ticks</span>
          </>
        )}
      </div>

      <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block', cursor: 'crosshair', width: '100%', height: '100%' }} 
      />
    </div>
  );
}
