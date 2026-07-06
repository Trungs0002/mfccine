import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import { QRCodeSVG } from 'qrcode.react';

const DigitalTicketPage = ({ completedBookingId, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  useEffect(() => {
    if (!completedBookingId) return;
    setLoading(true);
    fetch(`${API_URL}/api/bookings/${completedBookingId}`)
      .then(res => res.json())
      .then(data => { setBooking(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [completedBookingId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 48, color: 'var(--purple)' }}>sync</span>
      <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: '.15em', textTransform: 'uppercase' }}>
        {vi ? 'Đang tạo vé điện tử...' : 'Generating ticket...'}
      </p>
    </div>
  );

  if (!booking) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ff6b6b' }}>error</span>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>{vi ? 'Không tìm thấy vé.' : 'Ticket not found.'}</p>
      <button onClick={() => navigate('/')} style={{ color: 'var(--purple)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
        {vi ? 'Về trang chủ' : 'Back to Home'}
      </button>
    </div>
  );

  const event     = booking.eventId;
  const seats     = booking.selectedSeats || [];
  const ticketCode = booking.ticketCode || localStorage.getItem('lastTicketCode') || booking._id.toString().toUpperCase().slice(-8);
  const refId     = booking._id.toString().toUpperCase().slice(-8);
  const formatPrice = (p) => vi ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + p;

  return (
    <div className="animate-fade-in" style={{ paddingTop: 120, paddingBottom: 64, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 460, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>

        {/* Back to Dashboard */}
        <button
          onClick={() => { navigate('/dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, textDecoration: 'none', padding: '6px 0', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
          {vi ? 'Về Dashboard' : 'Back to Dashboard'}
        </button>

        {/* Success badge */}
        <span style={{ padding: '6px 18px', borderRadius: 999, background: 'rgba(158,254,253,.1)', border: '1px solid rgba(158,254,253,.3)', color: 'var(--mint)', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
          ✓ {vi ? 'Xuất vé thành công' : 'Booking Confirmed'}
        </span>

        {/* Ticket card */}
        <div style={{ width: '100%', background: 'linear-gradient(180deg, rgba(14,16,44,.9), rgba(7,8,24,.85))', border: '1px solid rgba(168,150,246,.4)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(70,69,215,.2)' }}>

          {/* Image header */}
          <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
            <img src={event?.image} alt="Event" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .55, filter: 'saturate(1.2)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,8,24,.95) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ color: 'var(--mint)', fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 4 }}>ADMIT ONE</p>
                <h2 className="serif" style={{ color: '#fff', fontSize: 26, margin: 0, lineHeight: .9 }}>{l(event?.title)}</h2>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--purple)', fontSize: 32 }}>local_activity</span>
            </div>
          </div>

          {/* QR section */}
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ background: '#fff', padding: 12, borderRadius: 16, boxShadow: '0 0 40px rgba(168,150,246,.3)' }}>
              <QRCodeSVG value={ticketCode} size={180} bgColor="#ffffff" fgColor="#01010A" level="H" includeMargin={false} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.18em', marginBottom: 10 }}>
                {vi ? 'MÃ VÉ' : 'TICKET CODE'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(168,150,246,.08)', border: '1px solid rgba(168,150,246,.3)', borderRadius: 12, padding: '12px 20px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 20, color: 'var(--purple)', fontWeight: 700, letterSpacing: '.15em' }}>{ticketCode}</span>
                <button onClick={() => handleCopy(ticketCode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--mint)' : 'var(--muted)', transition: 'color .2s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{copied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
              <p style={{ fontSize: 9, color: 'rgba(168,150,246,.5)', marginTop: 8, letterSpacing: '.1em', textTransform: 'uppercase' }}>REF: {refId}</p>
            </div>

            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', letterSpacing: '.08em', textTransform: 'uppercase', maxWidth: 240 }}>
              {vi ? 'Xuất trình mã QR tại cửa vào sự kiện' : 'Present QR code at the event entrance'}
            </p>
          </div>

          {/* Tear line */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--black)', position: 'absolute', left: -11, boxShadow: 'inset -3px 0 5px rgba(0,0,0,.4)' }} />
            <div style={{ flex: 1, margin: '0 12px', borderTop: '2px dashed rgba(168,150,246,.25)' }} />
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--black)', position: 'absolute', right: -11, boxShadow: 'inset 3px 0 5px rgba(0,0,0,.4)' }} />
          </div>

          {/* Info grid */}
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
            {[
              { labelEn: 'Date & Time', labelVi: 'Ngày & Giờ', value: event?.date ? new Date(event.date).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', sub: new Date(event?.date).toLocaleTimeString(vi ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) },
              { labelEn: 'Venue',       labelVi: 'Địa điểm',  value: l(event?.venueName), sub: l(event?.location), align: 'right' },
              { labelEn: 'Seats',       labelVi: 'Chỗ ngồi',  value: seats.map(s => s.seatId.split('-').slice(2).join(' ')).join(', ') || '—', sub: '' },
              { labelEn: 'Tier',        labelVi: 'Hạng vé',   value: l(event?.pricingTiers?.[seats[0]?.type?.toLowerCase()]?.label) || seats[0]?.type || '—', sub: '', align: 'right' },
            ].map(c => (
              <div key={c.labelEn} style={{ textAlign: c.align || 'left' }}>
                <p style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 4 }}>
                  {vi ? c.labelVi : c.labelEn}
                </p>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0 }}>{c.value}</p>
                {c.sub && <p style={{ color: 'var(--muted)', fontSize: 11, margin: '2px 0 0' }}>{c.sub}</p>}
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(70,69,215,.08)' }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              {vi ? 'Tổng thanh toán' : 'Total Paid'}
            </span>
            <span className="serif" style={{ fontSize: 24, color: 'var(--purple)', fontWeight: 700 }}>{formatPrice(booking.subtotal)}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => window.print()}
              className="btn-outline-pill"
              style={{ flex: 1, justifyContent: 'center', gap: 8 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
              PDF
            </button>
            <button
              onClick={() => handleCopy(ticketCode)}
              className="btn-outline-pill"
              style={{ flex: 1, justifyContent: 'center', gap: 8 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{copied ? 'check' : 'content_copy'}</span>
              {copied ? (vi ? 'Đã sao chép' : 'Copied!') : (vi ? 'Sao chép' : 'Copy Code')}
            </button>
          </div>
          <button
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="btn-pill"
            style={{ justifyContent: 'center', gap: 8 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
            {vi ? 'Về trang chủ' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketPage;
