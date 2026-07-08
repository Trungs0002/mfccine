import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

/* ─── Seat generation ──────────────────────────────────────── */
const ZONE = {
  Standard: { color: '#10b981', label: (vi) => vi ? 'Khu phổ thông' : 'Standard' },
  Premium: { color: '#5aaddc', label: (vi) => vi ? 'Khu Premium' : 'Premium' },
  VIP: { color: '#a896f6', label: (vi) => vi ? 'Khu VIP' : 'VIP' },
};

const SEAT_SIZE = 20; // seat button diameter
const SEAT_GAP = 24; // seatGap: normal pitch between seats inside a vertical strip (top → bottom)
const AISLE_GAP = 46; // aisleGap: pitch between every adjacent column — real seat-strip or runway slot alike
const ENTRY_AISLE = 10; // walking gap between the vertical strips and the bottom U-section
const H_ROW_GAP = 30; // pitch between the 5 bottom horizontal rows
const X0 = 40;  // left margin (x of column A) — also doubles as the row-number gutter width
const STAGE_TOP = 16;
const RUNWAY_TOP = 80;
const Y0 = 110; // top y of seat 1 in every vertical strip (below the stage)
const FOOTER_GAP = 16; // gap between the last seat row and the column-letter footer

/* One unified 17-column grid (A → Q), shared by the vertical strips and the bottom rows, so every
   seat is addressed as ColumnLetter + RowNumber (e.g. "C15", "J29") — same axis meaning everywhere:
   columns = letters (horizontal axis), rows = numbers (vertical axis).
   Columns A-G and K-Q carry real seats top → bottom for rows 1-26. Columns H, I, J are the runway:
   empty for rows 1-26, and become real seats — aligned under the runway — for rows 27-31. */
const COL_LABELS = 'ABCDEFGHIJKLMNOPQ'.split('');
const COL_TYPE = {
  A: 'Standard', B: 'Standard', C: 'Premium', D: 'Premium', E: 'Premium', F: 'VIP', G: 'VIP',
  K: 'VIP', L: 'VIP', M: 'Premium', N: 'Premium', O: 'Premium', P: 'Standard', Q: 'Standard',
};
const V_SEATS_PER_STRIP = 26; // rows 1-26

/* every column sits one AISLE_GAP apart — this also widens the runway (H-I-J) enough to fit 3 seats */
const COL_X = {};
COL_LABELS.forEach((col, i) => { COL_X[col] = X0 + i * AISLE_GAP; });

const H_ROWS_START = V_SEATS_PER_STRIP + 1; // row 27
const H_ROW_COUNT = 5; // rows 27-31

/* Bottom U-section tier map, per exact seat position (not a uniform per-row color):
   rows 27-28: 2 Standard, 3 Premium, 7 VIP (F-L), 3 Premium, 2 Standard
   rows 29-30: 2 Standard, 13 Premium (C-O), 2 Standard
   row 31: all Standard */
const bottomTypeAt = (rowNum, colIndex) => {
  if (rowNum === 27 || rowNum === 28) {
    if (colIndex <= 1 || colIndex >= 15) return 'Standard'; // A,B / P,Q
    if (colIndex <= 4 || colIndex >= 12) return 'Premium';  // C,D,E / M,N,O
    return 'VIP';                                            // F-L
  }
  if (rowNum === 29 || rowNum === 30) {
    if (colIndex <= 1 || colIndex >= 15) return 'Standard'; // A,B / P,Q
    return 'Premium';                                        // C-O
  }
  return 'Standard'; // row 31
};

const V_BLOCK_RIGHT = COL_X['Q'] + SEAT_SIZE;
const V_BLOCK_BOTTOM = Y0 + (V_SEATS_PER_STRIP - 1) * SEAT_GAP + SEAT_SIZE; // bottom edge of the vertical strips

const H_STRIP_Y = [V_BLOCK_BOTTOM + ENTRY_AISLE];
for (let j = 1; j < H_ROW_COUNT; j++) {
  H_STRIP_Y.push(H_STRIP_Y[j - 1] + H_ROW_GAP);
}

/* y position for every row number 1-31, for the row-number axis gutter */
const ROW_Y = [];
for (let r = 0; r < V_SEATS_PER_STRIP; r++) ROW_Y.push(Y0 + r * SEAT_GAP);
H_STRIP_Y.forEach((y) => ROW_Y.push(y));

/* column-letter footer sits below the last seat row */
const FOOTER_Y = H_STRIP_Y[H_STRIP_Y.length - 1] + SEAT_SIZE + FOOTER_GAP;

const CANVAS_W = V_BLOCK_RIGHT + X0; // symmetric right margin
const CANVAS_H = FOOTER_Y + 30;

/* Runway visual: the widened gap spanning columns H-I-J, between the two innermost VIP strips G and K */
const RUNWAY_LEFT = COL_X['G'] + SEAT_SIZE;
const RUNWAY_RIGHT = COL_X['K'];
const RUNWAY_WIDTH = RUNWAY_RIGHT - RUNWAY_LEFT;
const RUNWAY_HEIGHT = V_BLOCK_BOTTOM - RUNWAY_TOP;

/* T-stage top bar — widened along with the runway so the "T" keeps a clear, proportioned flare */
const STAGE_WIDTH = RUNWAY_WIDTH + 176;

const buildSeats = (vi, vipPrice, premiumPrice, standardPrice) => {
  const list = [];
  const priceOf = { Standard: standardPrice, Premium: premiumPrice, VIP: vipPrice };

  const pushSeat = (col, rowNum, type, x, y) => {
    const { color, label: zoneLabel } = ZONE[type];
    const id = `${col}${rowNum}`;
    list.push({
      id, num: id, col, type,
      zoneName: zoneLabel(vi), price: priceOf[type], color, x, y,
    });
  };

  // Vertical strips: columns A-G and K-Q, seats numbered top → bottom (rows 1-26)
  COL_LABELS.forEach((col) => {
    const type = COL_TYPE[col];
    if (!type) return; // H, I, J are the runway — no seats here
    const x = COL_X[col];
    for (let r = 0; r < V_SEATS_PER_STRIP; r++) {
      pushSeat(col, r + 1, type, x, Y0 + r * SEAT_GAP);
    }
  });

  // Bottom U-section: rows 27-31, seated across all 17 columns (incl. runway columns H, I, J)
  for (let j = 0; j < H_ROW_COUNT; j++) {
    const y = H_STRIP_Y[j];
    const rowNum = H_ROWS_START + j;
    COL_LABELS.forEach((col, colIndex) => {
      pushSeat(col, rowNum, bottomTypeAt(rowNum, colIndex), COL_X[col], y);
    });
  }

  return list;
};

/* ─── Component ─────────────────────────────────────────────── */
const SeatSelectionPage = ({ event, setBookingDetails }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = React.useRef(null);

  const vipPrice = event?.pricingTiers?.vip?.price || 500000;
  const premiumPrice = event?.pricingTiers?.premium?.price || 250000;
  const standardPrice = event?.pricingTiers?.standard?.price || 150000;

  const formatPrice = (p) => vi ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + p;

  useEffect(() => {
    if (!event) return;
    setLoading(true);
    fetch(`${API_URL}/api/bookings/event/${event._id}/occupied-seats`)
      .then(res => res.json())
      .then(data => { setOccupiedSeats(data); setLoading(false); })
      .catch(() => { setOccupiedSeats([]); setLoading(false); });
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

  /* Unique zones of selected seats */
  const selectedZones = [...new Set(selectedSeats.map(s => s.zoneName))];

  const LEGEND_ITEMS = [
    { color: '#a896f6', label: vi ? 'Vé VIP' : 'VIP', price: formatPrice(vipPrice) },
    { color: '#5aaddc', label: vi ? 'Vé Premium' : 'Premium', price: formatPrice(premiumPrice) },
    { color: '#10b981', label: vi ? 'Vé Standard' : 'Standard', price: formatPrice(standardPrice) },
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
              <div style={{ overflowX: 'auto', margin: '0 -20px', padding: '0 20px 20px' }}>
                <div style={{
                  width: `${CANVAS_W}px`, height: `${CANVAS_H}px`,
                  position: 'relative', margin: '0 auto',
                }}>

                  {/* Row-number gutter (vertical axis) */}
                  {ROW_Y.map((y, idx) => (
                    <div key={`row-${idx}`} style={{
                      position: 'absolute', top: y, left: 0, width: X0 - 6, height: SEAT_SIZE,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                      fontSize: 9, fontWeight: 600, color: 'rgba(168,150,246,.55)',
                      zIndex: 25, pointerEvents: 'none',
                    }}>
                      {idx + 1}
                    </div>
                  ))}

                  {/* Column-letter footer (horizontal axis) — placed below the last seat row */}
                  {COL_LABELS.map((col) => (
                    <div key={`col-${col}`} style={{
                      position: 'absolute', top: FOOTER_Y + 12, left: COL_X[col], width: SEAT_SIZE,
                      textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'rgba(168,150,246,.7)',
                      zIndex: 25, pointerEvents: 'none',
                    }}>
                      {col}
                    </div>
                  ))}

                  {/* Stage — a small raised 3D platform: angled top face + a front riser edge */}
                  <div style={{ position: 'absolute', top: STAGE_TOP, left: '50%', transform: 'translateX(-50%)', width: STAGE_WIDTH, zIndex: 20 }}>
                    <div style={{
                      height: 44,
                      background: 'linear-gradient(135deg, rgba(30,32,70,.95), rgba(70,69,215,.3))',
                      border: '1px solid rgba(168,150,246,.4)',
                      borderBottom: 'none',
                      clipPath: 'polygon(7% 0, 93% 0, 100% 100%, 0% 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: 'inset 0 12px 18px -12px rgba(168,150,246,.4)',
                    }}>
                      <span className="serif" style={{ color: 'var(--purple)', letterSpacing: '.6em', fontWeight: 800, fontSize: 13, textTransform: 'uppercase' }}>
                        {vi ? 'SÂN KHẤU' : 'STAGE'}
                      </span>
                    </div>
                    <div style={{
                      height: 12,
                      background: 'linear-gradient(180deg, rgba(70,69,215,.35), rgba(10,11,30,.95))',
                      borderLeft: '1px solid rgba(168,150,246,.4)',
                      borderRight: '1px solid rgba(168,150,246,.4)',
                      borderBottom: '1px solid rgba(168,150,246,.4)',
                      borderRadius: '0 0 8px 8px',
                    }} />
                  </div>

                  {/* Runway (T-shape vertical bar, ends where the vertical strips end) */}
                  <div style={{
                    position: 'absolute', top: RUNWAY_TOP, left: '50%', transform: 'translateX(-50%)',
                    width: RUNWAY_WIDTH, height: RUNWAY_HEIGHT,
                    background: 'linear-gradient(180deg, rgba(14,16,44,.9), rgba(70,69,215,.2))',
                    border: '1px solid rgba(168,150,246,.35)',
                    borderTop: 'none',
                    borderRadius: '0 0 10px 10px',
                    zIndex: 15,
                  }} />

                  {/* Seats */}
                  {seats.map(seat => {
                    const isOccupied = occupiedSeats.includes(seat.id);
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const seatColor = isOccupied
                      ? '#1c1c30'
                      : isSelected
                        ? '#ff3b3b'
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
                              ? '2px solid #ff3b3b'
                              : `1px solid ${seat.color}99`,
                          opacity: isOccupied ? .45 : 1,
                          cursor: isOccupied ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 6, fontWeight: 900,
                          color: isOccupied ? '#3a3a58' : isSelected ? '#000' : 'rgba(0,0,0,.5)',
                          transform: isSelected ? 'scale(1.15)' : undefined,
                          boxShadow: isSelected
                            ? '0 0 14px rgba(255,59,59,.8)'
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
                        {seat.num} · {seat.type}
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
