import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

/* ─── Seat generation ──────────────────────────────────────── */
const ROWS_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SP = 24;   // seat spacing px
const X_OFF = 30; // centering offset

/*
  Layout (canvas 820 × 560):
  Stage at top center

  [STD-C-L]  [VIP-A-L]   [VIP-B]   [VIP-A-R]  [STD-C-R]
  (7r×6c)     (7r×5c)   (5r×10c)   (7r×5c)     (7r×6c)

  [STD-D-L]                                     [STD-D-R]
  (4r×6c)                                        (4r×6c)

                    [STD-E]
                   (4r×14c)
*/

const buildSeats = (vi, vipPrice, silverPrice, standardPrice) => {
  const list = [];

  const addZone = (key, labelEn, labelVi, type, price, color, baseX, startY, numRows, numCols) => {
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const rowLetter = ROWS_ALPHA[r];
        const seatNum = c + 1;
        list.push({
          id:        `${key}-${rowLetter}${seatNum}`,
          num:       `${rowLetter}${seatNum}`,
          rowLetter,
          type,
          zone:      key,
          zoneName:  vi ? labelVi : labelEn,
          price,
          color,
          x: X_OFF + baseX + c * SP,
          y: startY + r * SP,
        });
      }
    }
  };

  addZone('STD-C-L', 'Standard C', 'Tiêu chuẩn C', 'Standard', standardPrice, '#4b5169', 14,  110, 7, 6);
  addZone('VIP-A-L', 'VIP A',      'VIP A',         'VIP',      vipPrice,      '#b026d9', 162, 110, 7, 5);
  addZone('VIP-B',   'VIP B',      'VIP B',         'Silver',   silverPrice,   '#2563eb', 282, 110, 5, 10);
  addZone('VIP-A-R', 'VIP A',      'VIP A',         'VIP',      vipPrice,      '#b026d9', 526, 110, 7, 5);
  addZone('STD-C-R', 'Standard C', 'Tiêu chuẩn C', 'Standard', standardPrice, '#4b5169', 674, 110, 7, 6);
  addZone('STD-D-L', 'Standard D', 'Tiêu chuẩn D', 'Standard', standardPrice, '#4b5169', 14,  290, 4, 6);
  addZone('STD-D-R', 'Standard D', 'Tiêu chuẩn D', 'Standard', standardPrice, '#4b5169', 674, 290, 4, 6);
  addZone('STD-E',   'Standard E', 'Tiêu chuẩn E', 'Standard', standardPrice, '#7c55d9', 158, 420, 4, 14);

  return list;
};

/* ─── Zone label config ─────────────────────────────────────── */
const ZONE_LABELS = [
  { key: 'STD-C-L', text: 'STANDARD C', x: X_OFF + 14 + 5 * 24 / 2 - 12,  y: 95,  anchor: 'middle' },
  { key: 'VIP-A-L', text: 'VIP A',      x: X_OFF + 162 + 4 * 24 / 2,       y: 95,  anchor: 'middle' },
  { key: 'VIP-B',   text: 'VIP B',      x: X_OFF + 282 + 9 * 24 / 2,       y: 95,  anchor: 'middle' },
  { key: 'VIP-A-R', text: 'VIP A',      x: X_OFF + 526 + 4 * 24 / 2,       y: 95,  anchor: 'middle' },
  { key: 'STD-C-R', text: 'STANDARD C', x: X_OFF + 674 + 5 * 24 / 2 - 12,  y: 95,  anchor: 'middle' },
  { key: 'STD-D-L', text: 'STANDARD D', x: X_OFF + 14 + 5 * 24 / 2 - 12,   y: 276, anchor: 'middle' },
  { key: 'STD-D-R', text: 'STANDARD D', x: X_OFF + 674 + 5 * 24 / 2 - 12,  y: 276, anchor: 'middle' },
  { key: 'STD-E',   text: 'STANDARD E', x: X_OFF + 158 + 13 * 24 / 2,       y: 407, anchor: 'middle' },
];

/* ─── Component ─────────────────────────────────────────────── */
const SeatSelectionPage = ({ event, setBookingDetails }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = React.useRef(null);

  const vipPrice      = event?.pricingTiers?.vip?.price      || 499000;
  const silverPrice   = event?.pricingTiers?.silver?.price   || 299000;
  const standardPrice = event?.pricingTiers?.standard?.price || 199000;

  const formatPrice = (p) => vi ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + p;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const avail = containerRef.current.clientWidth - 32;
        setScale(Math.min(1, avail / 820));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    const t = setTimeout(handleResize, 100);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(t); };
  }, [loading]);

  useEffect(() => {
    if (!event) return;
    setLoading(true);
    fetch(`${API_URL}/api/bookings/event/${event._id}/occupied-seats`)
      .then(res => res.json())
      .then(data => { setOccupiedSeats(data); setLoading(false); })
      .catch(() => { setOccupiedSeats([]); setLoading(false); });
  }, [event]);

  const seats = buildSeats(vi, vipPrice, silverPrice, standardPrice);

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

  const handleProceed = () => {
    if (!selectedSeats.length) return;
    setBookingDetails({
      selectedSeats: selectedSeats.map(s => ({ seatId: s.id, type: s.type, price: s.price })),
      subtotal: selectedSeats.reduce((sum, s) => sum + s.price, 0),
    });
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const svcFee = Math.round(total * 0.05);

  /* Unique zones of selected seats */
  const selectedZones = [...new Set(selectedSeats.map(s => s.zoneName))];

  const LEGEND_ITEMS = [
    { color: '#b026d9', label: vi ? 'VIP A' : 'VIP A', price: formatPrice(vipPrice) },
    { color: '#2563eb', label: vi ? 'VIP B' : 'VIP B', price: formatPrice(silverPrice) },
    { color: '#4b5169', label: vi ? 'Tiêu chuẩn' : 'Standard', price: formatPrice(standardPrice) },
    { color: '#00e8c8', label: vi ? 'Đang chọn' : 'Selected', price: null },
    { color: '#1e1e2f', label: vi ? 'Đã bán' : 'Taken', price: null, bordered: true },
  ];

  if (!event) return null;

  const CANVAS_W = 820;
  const CANVAS_H = 560;

  return (
    <div style={{ paddingTop: 96, paddingBottom: 64 }} className="animate-fade-in">
      <div className="container">

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

          {/* ── SEAT MAP ─────────────────────────────────────────── */}
          <div ref={containerRef} className="mfc-card" style={{ padding: '20px', userSelect: 'none' }}>

            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 20, justifyContent: 'center' }}>
              {LEGEND_ITEMS.map(({ color, label, price, bordered }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                    background: color,
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
              <div style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H * scale}px`, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  width: `${CANVAS_W}px`, height: `${CANVAS_H}px`,
                  transform: `scale(${scale})`, transformOrigin: 'top center',
                  position: 'absolute', left: 0, top: 0,
                }}>

                  {/* Stage */}
                  <div style={{
                    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
                    width: 280, height: 62,
                    background: 'linear-gradient(135deg, rgba(14,16,44,.9), rgba(70,69,215,.2))',
                    border: '1px solid rgba(168,150,246,.35)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 20,
                    clipPath: 'polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)',
                  }}>
                    <span className="serif" style={{ color: 'var(--purple)', letterSpacing: '.6em', fontWeight: 800, fontSize: 13, textTransform: 'uppercase' }}>
                      {vi ? 'SÂN KHẤU' : 'STAGE'}
                    </span>
                  </div>

                  {/* Zone labels (SVG overlay) */}
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
                    {ZONE_LABELS.map(zl => (
                      <text
                        key={zl.key}
                        x={zl.x}
                        y={zl.y}
                        textAnchor="middle"
                        style={{ fontSize: 9, fill: 'rgba(200,190,255,.55)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}
                      >
                        {zl.text}
                      </text>
                    ))}
                  </svg>

                  {/* Seats */}
                  {seats.map(seat => {
                    const isOccupied = occupiedSeats.includes(seat.id);
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const seatColor = isOccupied
                      ? '#1c1c30'
                      : isSelected
                        ? '#00e8c8'
                        : seat.color;
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isOccupied}
                        title={seat.num}
                        style={{
                          position: 'absolute',
                          left: seat.x, top: seat.y,
                          width: 20, height: 20,
                          borderRadius: '50%',
                          background: seatColor,
                          border: isOccupied
                            ? '1px solid #2e2e44'
                            : isSelected
                              ? '2px solid #00e8c8'
                              : `1px solid ${seat.color}99`,
                          opacity: isOccupied ? .45 : 1,
                          cursor: isOccupied ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 6, fontWeight: 900,
                          color: isOccupied ? '#3a3a58' : isSelected ? '#000' : 'rgba(0,0,0,.5)',
                          transform: isSelected ? 'scale(1.15)' : undefined,
                          boxShadow: isSelected
                            ? '0 0 14px rgba(0,232,200,.8)'
                            : isOccupied
                              ? 'none'
                              : `0 0 6px ${seat.color}55`,
                          zIndex: 20,
                          transition: 'transform .1s, box-shadow .1s',
                        }}
                      >
                        {isOccupied ? '×' : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 14 }}>
              {vi ? '🔒 Vui lòng chọn tối đa 6 ghế trong một lần đặt.' : '🔒 Please select up to 6 seats per booking.'}
            </p>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────── */}
          <div className="mfc-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 96 }}>
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
                    {vi ? 'Khu vực' : 'Zone'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedZones.map(z => (
                      <span key={z} style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                        background: 'linear-gradient(135deg, var(--ultra), var(--purple))',
                        color: '#fff', letterSpacing: '.04em',
                      }}>{z}</span>
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedSeats.map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        style={{
                          padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                          border: '1px solid rgba(168,150,246,.45)',
                          background: 'rgba(168,150,246,.1)',
                          color: '#fff', cursor: 'pointer',
                          transition: 'background .15s, border-color .15s',
                        }}
                        title={vi ? 'Nhấn để bỏ chọn' : 'Click to deselect'}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,.1)'; e.currentTarget.style.borderColor = 'rgba(255,107,107,.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,150,246,.1)'; e.currentTarget.style.borderColor = 'rgba(168,150,246,.45)'; }}
                      >
                        {seat.num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13 }}>
                  {[...new Set(selectedSeats.map(s => s.type))].map(type => {
                    const sameType = selectedSeats.filter(s => s.type === type);
                    const priceEach = sameType[0].price;
                    return (
                      <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--muted)' }}>
                          {sameType[0].zoneName} × {sameType.length}
                        </span>
                        <span style={{ color: '#e0dcff' }}>{formatPrice(priceEach * sameType.length)}</span>
                      </div>
                    );
                  })}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)' }}>{vi ? 'Phí dịch vụ (5%)' : 'Service fee (5%)'}</span>
                    <span style={{ color: '#e0dcff' }}>{formatPrice(svcFee)}</span>
                  </div>
                </div>

                {/* Total */}
                <div style={{ borderTop: '1px solid rgba(168,150,246,.2)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                    {vi ? 'Tổng cộng' : 'Total'}
                  </span>
                  <span className="serif" style={{ fontSize: 28, color: 'var(--purple)', fontWeight: 700 }}>
                    {formatPrice(total + svcFee)}
                  </span>
                </div>

                {/* Proceed button */}
                <button onClick={handleProceed} className="btn-pill" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px 20px' }}>
                  {vi ? 'Tiếp tục →' : 'Continue →'}
                </button>

                {/* Back link */}
                <button
                  onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="btn-outline-pill"
                  style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                >
                  {vi ? '← Quay lại chọn loại vé' : '← Back to Ticket Types'}
                </button>

                <p style={{ fontSize: 11, color: 'rgba(168,150,246,.45)', textAlign: 'center', margin: 0 }}>
                  🔒 {vi ? 'Thông tin và giao dịch được bảo mật.' : 'Your info and payment are secured.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@media(max-width:900px){
        .seat-page-grid{grid-template-columns:1fr!important}
        .seat-sidebar{position:static!important}
      }`}</style>
    </div>
  );
};

export default SeatSelectionPage;
