import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

/* ─── Layout constants ──────────────────────────────────────── */
/*
  NEW VENUE LAYOUT (matches the diagram):
  ┌─────────────────────────────────────────────────────┐
  │               [SÂN KHẤU CHỮ T]                     │
  │         [RUNWAY — vertical bar of the T]            │
  │  [TOP-LEFT 8×20]         [TOP-RIGHT 8×20]           │
  │  (8 cols × 20 rows)      (8 cols × 20 rows)         │
  │                                                      │
  │  [BOT-LEFT 6×25] [AISLE] [BOT-RIGHT 6×25]          │
  │  (6 rows × 25 cols)      (6 rows × 25 cols)         │
  └─────────────────────────────────────────────────────┘

  Top sections: 8 columns × 20 rows each (left & right of runway)
  Bottom sections: 6 rows × 25 columns each (left & right of center aisle)
*/

import {
  S, TOP_COL_PITCH, COL_PITCH, ROW_PITCH, ROW_LABEL_W,
  TOP_COLS, TOP_ROWS, BOT_ROWS, BOT_COLS, RUNWAY_W, STAGE_H, STAGE_RISER,
  CENTER_AISLE_W,
  TOP_BLOCK_W, BOT_BLOCK_W, STAGE_W,
  CANVAS_W, CX, TOP_LEFT_X, TOP_RIGHT_X, BOT_LEFT_X, BOT_RIGHT_X,
  STAGE_Y, STAGE_BOT, TOP_SECT_Y, TOP_SECT_H, BOT_SECT_Y, BOT_SECT_H, CANVAS_H,
  buildSeats
} from '../utils/seatMap';

/* ─── Component ─────────────────────────────────────────────── */
const SeatSelectionPage = ({ event, setBookingDetails }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = React.useRef(null);
  const [mapScale, setMapScale] = useState(1);
  const mapScaleRef = React.useRef(1); // mirror of mapScale for use inside event closures
  const [showMobileMinimap, setShowMobileMinimap] = useState(false);

  // ── Zoom/pan stored in refs (no re-render during gesture) ──
  const zoomRef  = React.useRef(1);
  const panXRef  = React.useRef(0);
  const panYRef  = React.useRef(0);
  const [zoom, setZoom] = useState(1); // only used for zoom buttons re-render
  const canvasRef = React.useRef(null);
  const touchRef  = React.useRef({});

  // Apply transform directly to DOM (fast, no React re-render)
  const applyTransform = React.useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const s = mapScaleRef.current * zoomRef.current;
    el.style.transform =
      `scale(${s}) translate(${panXRef.current / s}px, ${panYRef.current / s}px)`;
  }, []);

  // Auto-scale to fit card width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const available = el.clientWidth - 40;
      const scale = Math.min(1, available / CANVAS_W);
      mapScaleRef.current = scale;
      setMapScale(scale);
      // reset pan/zoom on resize
      zoomRef.current = 1; panXRef.current = 0; panYRef.current = 0;
      setZoom(1);
      applyTransform();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [applyTransform]);

  // ── Attach non-passive touch listeners directly to canvas DOM node ──
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;   // canvas only exists when loading=false

    const getTouchDist = (t) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e) => {
      const t = e.touches;
      if (t.length === 2) {
        touchRef.current = {
          mode: 'pinch',
          startDist: getTouchDist(t),
          startZoom: zoomRef.current,
          midX: (t[0].clientX + t[1].clientX) / 2,
          midY: (t[0].clientY + t[1].clientY) / 2,
          startPanX: panXRef.current,
          startPanY: panYRef.current,
        };
      } else if (t.length === 1) {
        touchRef.current = {
          mode: 'pan',
          startX: t[0].clientX - panXRef.current,
          startY: t[0].clientY - panYRef.current,
        };
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      const t = e.touches;
      const ref = touchRef.current;
      if (ref.mode === 'pinch' && t.length === 2) {
        const ratio = getTouchDist(t) / ref.startDist;
        zoomRef.current = Math.min(3, Math.max(0.5, ref.startZoom * ratio));
        const dx = (t[0].clientX + t[1].clientX) / 2 - ref.midX;
        const dy = (t[0].clientY + t[1].clientY) / 2 - ref.midY;
        panXRef.current = ref.startPanX + dx;
        panYRef.current = ref.startPanY + dy;
      } else if (ref.mode === 'pan' && t.length === 1) {
        panXRef.current = t[0].clientX - ref.startX;
        panYRef.current = t[0].clientY - ref.startY;
      }
      applyTransform();
    };

    const onTouchEnd = () => { touchRef.current = {}; };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: false });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });

    // ── Mouse drag (desktop) ──
    // mousedown on canvas, but move/up on document so drag stays live
    const onMouseDown = (e) => {
      if (e.button !== 0 || e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      touchRef.current = {
        mode: 'mouse',
        startX: e.clientX - panXRef.current,
        startY: e.clientY - panYRef.current,
      };
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e) => {
      if (touchRef.current.mode !== 'mouse') return;
      panXRef.current = e.clientX - touchRef.current.startX;
      panYRef.current = e.clientY - touchRef.current.startY;
      applyTransform();
    };
    const onMouseUp = () => {
      if (touchRef.current.mode !== 'mouse') return;
      touchRef.current = {};
      el.style.cursor = zoomRef.current > 1 ? 'grab' : 'default';
    };

    // ── Wheel zoom (desktop) ──
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      zoomRef.current = Math.min(3, Math.max(0.5, zoomRef.current + delta));
      applyTransform();
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('wheel',     onWheel, { passive: false });
    // move + up on document so drag works even outside canvas bounds
    document.addEventListener('mousemove',  onMouseMove);
    document.addEventListener('mouseup',    onMouseUp);

    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('mousedown',   onMouseDown);
      el.removeEventListener('wheel',       onWheel);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup',   onMouseUp);
    };
  }, [applyTransform, loading]); // re-run when loading→false so canvasRef is set


  const changeZoom = (delta) => {
    zoomRef.current = Math.min(3, Math.max(0.5, zoomRef.current + delta));
    setZoom(zoomRef.current); // trigger re-render for cursor style
    applyTransform();
  };
  const resetZoom = () => {
    zoomRef.current = 1; panXRef.current = 0; panYRef.current = 0;
    setZoom(1);
    applyTransform();
  };


  const vipPrice = event?.pricingTiers?.vip?.price || 500000;
  const premiumPrice = event?.pricingTiers?.premium?.price || 250000;
  const standardPrice = event?.pricingTiers?.standard?.price || 150000;

  const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + (vi ? 'đ' : ' VND');

  useEffect(() => {
    const fetchOccupied = () => {
      if (!event) return;
      setLoading(true);
      fetch(`${API_URL}/api/bookings/event/${event._id}/occupied-seats`)
        .then(res => res.json())
        .then(data => { setOccupiedSeats(data); setLoading(false); })
        .catch(() => { setOccupiedSeats([]); setLoading(false); });
    };
    fetchOccupied();
  }, [event]);

  const seats = buildSeats(vi, vipPrice, premiumPrice, standardPrice);

  const handleSeatClick = (seat) => {
    if (occupiedSeats.includes(seat.id)) return;
    const already = selectedSeats.some(s => s.id === seat.id);
    if (already) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) { alert(vi ? 'Tối đa 6 ghế mỗi lần đặt.' : 'Maximum 6 seats per booking.'); return; }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleClearAll = () => setSelectedSeats([]);

  const handleProceed = async () => {
    if (!selectedSeats.length) return;
    
    setBookingDetails({
      selectedSeats: selectedSeats.map(s => ({ seatId: s.id, type: s.zoneName || s.type, price: s.price })),
      subtotal: selectedSeats.reduce((sum, s) => sum + s.price, 0),
    });
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  /* Unique zones of selected seats, paired with each zone's ticket color */
  const selectedZones = [...new Map(selectedSeats.map(s => [s.zoneName, s.color])).entries()];

  const LEGEND_ITEMS = [
    { color: '#a896f6', label: 'Nhất Ảnh', price: formatPrice(vipPrice) },
    { color: '#5aaddc', label: 'Khởi Ảnh', price: formatPrice(premiumPrice) },
    { color: '#10b981', label: 'Hoàn Ảnh', price: formatPrice(standardPrice) },
    { color: '#ff3b3b', label: vi ? 'Đang chọn' : 'Selected', price: null },
    { color: '#1e1e2f', label: vi ? 'Đã bán' : 'Taken', price: null, bordered: true },
  ];

  if (!event) return null;

  return (
    <div style={{ paddingTop: 120, paddingBottom: 64 }} className="animate-fade-in">
      <div className="container">

        {/* Back */}
        <button
          onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, transition: 'color .2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_backspace</span>
          {vi ? 'Quay lại' : 'Back'}
        </button>

        {/* Steps */}
        <div className="steps" style={{ marginBottom: 28 }}>
          <div className="step-item active">
            <div className="step-num">1</div>
            <span>{vi ? 'Chọn ghế' : 'Select Seats'}</span>
          </div>
          <div className="step-connector" />
          <div className="step-item">
            <div className="step-num">2</div>
            <span>{vi ? 'Thông tin' : 'Your Info'}</span>
          </div>
          <div className="step-connector" />
          <div className="step-item">
            <div className="step-num">3</div>
            <span>{vi ? 'Thanh toán' : 'Payment'}</span>
          </div>
        </div>

        {/* Page title */}
        <h1 className="gradient-title" style={{ fontSize: 'clamp(22px, 3.5vw, 34px)', margin: '0 0 6px' }}>
          {vi ? 'Chọn vị trí ngồi' : 'Seat Selection'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 24px' }}>
          {vi ? 'Tối đa 6 ghế mỗi lần đặt. Nhấp vào ghế trống để chọn.' : 'Up to 6 seats per booking. Click an available seat to select.'}
        </p>

        <div className="seat-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── SEAT MAP ─────────────────────────────────────────── */}
          <div ref={containerRef} className="mfc-card" style={{ padding: '20px', userSelect: 'none' }}>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 20, justifyContent: 'center' }}>
              {LEGEND_ITEMS.map(({ color, label, price, bordered }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                    background: bordered ? '#5a5a72' : color,
                    border: bordered ? '1px solid #44405a' : `1px solid ${color}88`,
                    boxShadow: bordered ? 'none' : `0 0 8px ${color}55`,
                  }} />
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  {price && <span style={{ color, fontWeight: 600 }}>{price}</span>}
                </div>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 40, color: 'var(--purple)' }}>sync</span>
                <span style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  {vi ? 'Đang tải sơ đồ...' : 'Loading map...'}
                </span>
              </div>
            ) : (
              /* ── Touch-enabled canvas wrapper ── */
              <div style={{ position: 'relative', margin: '0 -20px' }}>

                {/* Mobile Toggle Button */}
                <button
                  className="mobile-minimap-toggle"
                  onClick={() => setShowMobileMinimap(!showMobileMinimap)}
                  style={{
                    display: 'none', position: 'absolute', top: 8, left: 8, zIndex: 60,
                    width: 30, height: 30, borderRadius: 8,
                    background: showMobileMinimap ? 'rgba(168,150,246,.3)' : 'rgba(168,150,246,.18)',
                    border: '1px solid rgba(168,150,246,.35)',
                    color: 'var(--purple)',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s', padding: 0
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{showMobileMinimap ? 'close' : 'map'}</span>
                </button>

                {/* Minimap (Area Guide) */}
                <div className={`minimap-container ${showMobileMinimap ? 'mobile-open' : ''}`} style={{
                  position: 'absolute', top: 8, left: 28, zIndex: 50,
                  background: 'rgba(1,1,10,.75)',
                  border: '1px solid rgba(168,150,246,.25)',
                  borderRadius: 8,
                  padding: 8,
                  backdropFilter: 'blur(8px)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  pointerEvents: 'none'
                }}>
                  <span style={{ color: 'var(--purple)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>
                    {vi ? 'Sơ đồ khu vực' : 'Area Map'}
                  </span>
                  
                  <div style={{ position: 'relative', width: 100, height: 90, margin: '4px auto 0' }}>
                    {/* Sân khấu (Stage) */}
                    <div style={{ position: 'absolute', top: 0, left: 30, width: 40, height: 6, background: 'rgba(255,255,255,.15)', borderRadius: 2 }} />
                    {/* Runway (Đường băng) */}
                    <div style={{ position: 'absolute', top: 6, left: 46, width: 8, height: 46, background: 'rgba(255,255,255,.15)', borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }} />

                    {/* Khu 1 */}
                    <div style={{ position: 'absolute', top: 15, left: 16, width: 26, height: 46, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 600 }}>1</div>
                    
                    {/* Khu 2 */}
                    <div style={{ position: 'absolute', top: 15, left: 58, width: 26, height: 46, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 600 }}>2</div>
                    
                    {/* Khu 3 */}
                    <div style={{ position: 'absolute', top: 67, left: 0, width: 46, height: 23, background: 'rgba(168,150,246,.12)', border: '1px solid rgba(168,150,246,.3)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--purple)', fontWeight: 600 }}>3</div>
                    
                    {/* Khu 4 */}
                    <div style={{ position: 'absolute', top: 67, left: 54, width: 46, height: 23, background: 'rgba(168,150,246,.12)', border: '1px solid rgba(168,150,246,.3)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--purple)', fontWeight: 600 }}>4</div>
                  </div>
                </div>

                {/* Zoom controls */}
                <div style={{
                  position: 'absolute', top: 8, right: 8, zIndex: 50,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  {[{label:'+', delta:.3},{label:'−', delta:-.3},{label:'⊙', delta:0}].map(({label,delta}) => (
                    <button key={label}
                      onClick={() => delta === 0 ? resetZoom() : changeZoom(delta)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: 'rgba(168,150,246,.18)',
                        border: '1px solid rgba(168,150,246,.35)',
                        color: 'var(--purple)', fontSize: label==='⊙'?14:18,
                        fontWeight: 700, cursor: 'pointer', lineHeight: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >{label}</button>
                  ))}
                </div>

                {/* Overflow clip viewport */}
                <div style={{ overflow: 'hidden', padding: '0 20px 20px' }}>
                  {/* Outer sizer — collapses to auto-scaled size */}
                  <div style={{
                    width: `${CANVAS_W * mapScale}px`,
                    height: `${CANVAS_H * mapScale}px`,
                    margin: '0 auto',
                    position: 'relative',
                  }}>
                    {/* Inner canvas — touch listeners & transform applied via useEffect/ref */}
                    <div
                      ref={canvasRef}
                      style={{
                        width: `${CANVAS_W}px`, height: `${CANVAS_H}px`,
                        position: 'absolute', top: 0, left: 0,
                        transformOrigin: 'top left',
                        transform: `scale(${mapScale})`,  /* initial; overwritten by applyTransform */
                        touchAction: 'none',
                        cursor: zoom > 1 ? 'grab' : 'default',
                      }}
                    >

                  {/* ── Stage (horizontal T-bar) ── */}
                  <div style={{
                    position: 'absolute', top: STAGE_Y, left: '50%',
                    transform: 'translateX(-50%)', width: STAGE_W, zIndex: 20,
                  }}>
                    <div style={{
                      height: STAGE_H,
                      background: 'linear-gradient(135deg, rgba(30,32,70,.95), rgba(70,69,215,.3))',
                      border: '1px solid rgba(168,150,246,.4)', borderBottom: 'none',
                      clipPath: 'polygon(4% 0, 96% 0, 100% 100%, 0% 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'inset 0 12px 18px -12px rgba(168,150,246,.4)',
                      overflow: 'hidden', padding: '0 12px',
                    }}>
                      <span className="serif" style={{
                        color: 'var(--purple)', letterSpacing: '.15em',
                        fontWeight: 800, fontSize: 11, textTransform: 'uppercase',
                        overflow: 'hidden', whiteSpace: 'nowrap',
                        maxWidth: '100%', textAlign: 'center',
                      }}>
                        {vi ? 'SÂN KHẤU' : 'STAGE'}
                      </span>
                    </div>
                    <div style={{
                      height: STAGE_RISER,
                      background: 'linear-gradient(180deg, rgba(70,69,215,.35), rgba(10,11,30,.95))',
                      borderLeft: '1px solid rgba(168,150,246,.4)',
                      borderRight: '1px solid rgba(168,150,246,.4)',
                      borderBottom: '1px solid rgba(168,150,246,.4)',
                      borderRadius: '0 0 6px 6px',
                    }} />
                  </div>

                  {/* ── Runway (T-bar vertical stem) ── */}
                  <div style={{
                    position: 'absolute',
                    top: STAGE_BOT,
                    left: CX - RUNWAY_W / 2,
                    width: RUNWAY_W,
                    height: TOP_SECT_H + 8,
                    background: 'linear-gradient(180deg, rgba(14,16,44,.88), rgba(70,69,215,.18))',
                    border: '1px solid rgba(168,150,246,.3)',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    zIndex: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="serif" style={{
                      color: 'rgba(168,150,246,.4)', letterSpacing: '.3em',
                      fontWeight: 800, fontSize: 14, textTransform: 'uppercase',
                      writingMode: 'vertical-rl', transform: 'rotate(180deg)'
                    }}>
                      {vi ? 'SÂN KHẤU' : 'STAGE'}
                    </span>
                  </div>

                  {/* ── Row number labels — Top-Left block (left side) ── */}
                  {Array.from({ length: TOP_ROWS }, (_, r) => (
                    <div key={`tl-row-${r}`} style={{
                      position: 'absolute',
                      top: TOP_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
                      left: TOP_LEFT_X - ROW_LABEL_W,
                      width: ROW_LABEL_W - 4,
                      height: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
                      pointerEvents: 'none',
                    }}>
                      {r + 1}
                    </div>
                  ))}

                  {/* ── Row number labels — Top-Right block (right side) ── */}
                  {Array.from({ length: TOP_ROWS }, (_, r) => (
                    <div key={`tr-row-${r}`} style={{
                      position: 'absolute',
                      top: TOP_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
                      left: TOP_RIGHT_X + TOP_BLOCK_W + 4,
                      width: ROW_LABEL_W - 4,
                      height: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                      fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
                      pointerEvents: 'none',
                    }}>
                      {r + 1}
                    </div>
                  ))}

                  {/* ── Row number labels — Bottom-Left block (left side) ── */}
                  {Array.from({ length: BOT_ROWS }, (_, r) => (
                    <div key={`bl-row-${r}`} style={{
                      position: 'absolute',
                      top: BOT_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
                      left: BOT_LEFT_X - ROW_LABEL_W,
                      width: ROW_LABEL_W - 4,
                      height: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
                      pointerEvents: 'none',
                    }}>
                      {String.fromCharCode(65 + 16 + r)}
                    </div>
                  ))}

                  {/* ── Row number labels — Bottom-Right block (right side) ── */}
                  {Array.from({ length: BOT_ROWS }, (_, r) => (
                    <div key={`br-row-${r}`} style={{
                      position: 'absolute',
                      top: BOT_SECT_Y + r * ROW_PITCH + (S - 10) / 2,
                      left: BOT_RIGHT_X + BOT_BLOCK_W + 4,
                      width: ROW_LABEL_W - 4,
                      height: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
                      fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
                      pointerEvents: 'none',
                    }}>
                      {String.fromCharCode(65 + 16 + r)}
                    </div>
                  ))}

                  {/* ── Col number labels — Top-Left block (below) ── */}
                  {Array.from({ length: TOP_COLS }, (_, c) => (
                    <div key={`tl-col-${c}`} style={{
                      position: 'absolute',
                      top: TOP_SECT_Y + TOP_SECT_H + 4,
                      left: TOP_LEFT_X + c * TOP_COL_PITCH,
                      width: S,
                      textAlign: 'center',
                      fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
                      pointerEvents: 'none',
                    }}>
                      {c === 0 ? 'AA' : c === 1 ? 'BB' : String.fromCharCode(65 + c - 2)}
                    </div>
                  ))}

                  {/* ── Col number labels — Top-Right block (below) ── */}
                  {Array.from({ length: TOP_COLS }, (_, c) => (
                    <div key={`tr-col-${c}`} style={{
                      position: 'absolute',
                      top: TOP_SECT_Y + TOP_SECT_H + 4,
                      left: TOP_RIGHT_X + c * TOP_COL_PITCH,
                      width: S,
                      textAlign: 'center',
                      fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
                      pointerEvents: 'none',
                    }}>
                      {c === TOP_COLS - 2 ? 'OO' : c === TOP_COLS - 1 ? 'PP' : String.fromCharCode(65 + 8 + c)}
                    </div>
                  ))}

                  {/* ── Col number labels — Bottom-Left block (below) ── */}
                  {Array.from({ length: BOT_COLS }, (_, c) => (
                    <div key={`bl-col-${c}`} style={{
                      position: 'absolute',
                      top: BOT_SECT_Y + BOT_SECT_H + 4,
                      left: BOT_LEFT_X + c * COL_PITCH,
                      width: S,
                      textAlign: 'center',
                      fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
                      pointerEvents: 'none',
                    }}>
                      {c + 1}
                    </div>
                  ))}

                  {/* ── Col number labels — Bottom-Right block (below) ── */}
                  {Array.from({ length: BOT_COLS }, (_, c) => (
                    <div key={`br-col-${c}`} style={{
                      position: 'absolute',
                      top: BOT_SECT_Y + BOT_SECT_H + 4,
                      left: BOT_RIGHT_X + c * COL_PITCH,
                      width: S,
                      textAlign: 'center',
                      fontSize: 7, fontWeight: 600, color: 'rgba(168,150,246,.45)',
                      pointerEvents: 'none',
                    }}>
                      {BOT_COLS + c + 1}
                    </div>
                  ))}

                  {/* ── Center aisle divider (bottom section) ── */}
                  <div style={{
                    position: 'absolute',
                    top: BOT_SECT_Y - 6,
                    left: CX - CENTER_AISLE_W / 2,
                    width: CENTER_AISLE_W,
                    height: BOT_SECT_H + 12,
                    borderLeft: '1px dashed rgba(168,150,246,.3)',
                    borderRight: '1px dashed rgba(168,150,246,.3)',
                    zIndex: 5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <span style={{
                      fontSize: 9, color: 'rgba(168,150,246,.5)',
                      fontWeight: 600, letterSpacing: '.08em',
                      textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3,
                    }}>
                      {vi ? 'LỐI ĐI\nGIỮA' : 'AISLE'}
                    </span>
                  </div>

                  {/* Seats */}
                  {seats.map(seat => {
                    const isOccupied = occupiedSeats.includes(seat.id);
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const seatBg = isOccupied ? '#5a5a72' : isSelected ? '#ff3b3b' : seat.color;
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isOccupied}
                        title={seat.num}
                        style={{
                          position: 'absolute',
                          left: seat.x, top: seat.y,
                          width: S, height: S,
                          borderRadius: '50%',
                          background: seatBg,
                          border: isOccupied
                            ? '1px solid #7a7a92'
                            : isSelected
                              ? '2px solid #ff3b3b'
                              : `1px solid ${seat.color}99`,
                          opacity: isOccupied ? .5 : 1,
                          cursor: isOccupied ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 6, fontWeight: 900,
                          color: isSelected ? '#000' : 'rgba(0,0,0,.5)',
                          transform: isSelected ? 'scale(1.18)' : undefined,
                          boxShadow: isSelected
                            ? '0 0 14px rgba(255,59,59,.8)'
                            : isOccupied
                              ? 'none'
                              : `0 0 5px ${seat.color}44`,
                          zIndex: 20,
                          transition: 'transform .1s, box-shadow .1s',
                        }}
                      />
                    );
                  })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 14 }}>
              {vi ? 'Vui lòng chỉ chọn tối đa 6 ghế trong một lần đặt.' : 'Please select up to 6 seats per booking.'}
            </p>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────── */}
          <div className="mfc-card seat-sidebar" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 96 }}>
            <h3 className="serif" style={{ color: '#fff', fontSize: 19, margin: 0 }}>
              {vi ? 'Thông tin đặt vé' : 'Booking Info'}
            </h3>

            {selectedSeats.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 44, color: 'rgba(168,150,246,.25)', display: 'block', marginBottom: 10 }}>event_seat</span>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                  {vi ? 'Chưa có ghế nào được chọn' : 'No seats selected yet'}
                </p>
              </div>
            ) : (
              <>
                {/* Zone badges */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
                    {vi ? 'Hạng vé' : 'Tier'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedZones.map(([name, color]) => (
                      <span key={name} style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                        background: color,
                        color: 'rgba(0,0,0,.75)', letterSpacing: '.04em',
                      }}>{name}</span>
                    ))}
                  </div>
                </div>

                {/* Selected seat chips */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {vi ? `Ghế đã chọn (${selectedSeats.length})` : `Selected (${selectedSeats.length})`}
                    </span>
                    <button
                      onClick={handleClearAll}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--muted)', transition: 'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                    >
                      {vi ? 'Xóa tất cả' : 'Clear all'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedSeats.map(seat => (
                      <div
                        key={seat.id}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                          padding: '8px 8px 8px 12px', borderRadius: 10, fontSize: 13,
                          border: '1px solid rgba(168,150,246,.3)',
                          background: 'rgba(168,150,246,.06)',
                        }}
                      >
                        <span style={{ color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          <span style={{ whiteSpace: 'nowrap' }}>{seat.num}</span> 
                          <span>· {seat.zoneName}</span>
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: '#e0dcff' }}>{formatPrice(seat.price)}</span>
                          <button
                            onClick={() => handleSeatClick(seat)}
                            title={vi ? 'Bỏ chọn ghế' : 'Remove seat'}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                              border: '1px solid rgba(255,107,107,.4)', background: 'rgba(255,107,107,.1)',
                              color: '#ff6b6b', cursor: 'pointer', padding: 0,
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div style={{ borderTop: '1px solid rgba(168,150,246,.2)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                    {vi ? 'Tổng cộng' : 'Total'}
                  </span>
                  <span style={{ fontSize: 28, color: 'var(--mint)', fontWeight: 700 }}>
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Proceed button */}
                <button onClick={handleProceed} className="btn-pill" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px 20px' }}>
                  {vi ? 'Tiếp tục →' : 'Continue →'}
                </button>

                <p style={{ fontSize: 11, color: 'rgba(168,150,246,.45)', textAlign: 'center', margin: 0 }}>
                  {vi ? 'Thông tin và giao dịch được bảo mật.' : 'Your info and payment are secured.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){
        .seat-page-grid{grid-template-columns:1fr!important; gap: 16px!important;}
        .seat-sidebar{position:static!important; margin-bottom: 24px;}
      }`}</style>
    </div>
  );
};

export default SeatSelectionPage;
