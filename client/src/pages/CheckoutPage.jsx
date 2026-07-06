import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const CheckoutPage = ({ event, bookingDetails, user, setCompletedBookingId }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [fullName, setFullName]       = useState(user?.fullName || '');
  const [email, setEmail]             = useState(user?.email    || '');
  const [phone, setPhone]             = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MoMo');
  const [isStudent, setIsStudent]     = useState(false);
  const [loading, setLoading]         = useState(false);

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName);
      if (!email)    setEmail(user.email);
    }
  }, [user]); // eslint-disable-line

  const subtotal   = bookingDetails.subtotal;
  const seatsCount = bookingDetails.selectedSeats.length;
  const finalTotal = isStudent ? Math.round(subtotal * 0.95) : subtotal;
  const formatPrice = (p) => vi ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + p;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event._id,
          fullName, email, phone,
          selectedSeats: bookingDetails.selectedSeats,
          subtotal: finalTotal,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCompletedBookingId(data.bookingId);
        localStorage.setItem('lastTicketCode', data.ticketCode || '');
        navigate('/ticket');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  const PAYMENT_METHODS = [
    { id: 'MoMo',          icon: <img src="https://img.mservice.com.vn/app/img/portal_documents/mini-app_design-guideline_branding-guide-2-2.png" alt="MoMo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />, label: 'MoMo' },
    { id: 'VNPay',         icon: <div style={{ background: '#fff', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', height: 28 }}><img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png" alt="VNPay" style={{ height: 16, width: 'auto', objectFit: 'contain' }} /></div>, label: 'VNPay' },
    { id: 'Bank Transfer', icon: <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#a896f6' }}>account_balance</span>, label: vi ? 'Chuyển khoản' : 'Bank Transfer' },
  ];

  return (
    <div style={{ paddingTop: 120, paddingBottom: 64 }} className="animate-fade-in">
      <div className="container">
        {/* Header + Steps */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/seating')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_backspace</span>
            {vi ? 'Chỉnh sửa ghế' : 'Edit Seats'}
          </button>

          <div className="steps" style={{ marginBottom: 24 }}>
            <div className="step-item done">
              <div className="step-num">✓</div>
              <span>{vi ? 'Chọn ghế' : 'Seats'}</span>
            </div>
            <div className="step-connector" />
            <div className="step-item active">
              <div className="step-num">2</div>
              <span>{vi ? 'Thông tin' : 'Your Info'}</span>
            </div>
            <div className="step-connector" />
            <div className="step-item">
              <div className="step-num">3</div>
              <span>{vi ? 'Xác nhận' : 'Confirm'}</span>
            </div>
          </div>

          <h1 className="gradient-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)', margin: 0 }}>
            {vi ? 'Thông tin & Thanh toán' : 'Your Details & Payment'}
          </h1>
        </div>

        <div className="checkout-page-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handleSubmit} className="mfc-card" style={{ padding: '32px' }}>
            {/* Personal info */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                {vi ? 'Thông tin cá nhân' : 'Personal Information'}
              </div>
              <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    {vi ? 'Họ và tên' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="mfc-input"
                    placeholder={vi ? 'Nguyễn Văn A' : 'John Doe'}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mfc-input"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  {vi ? 'Số điện thoại' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mfc-input"
                  placeholder="0912 345 678"
                  required
                />
              </div>
            </div>

            {/* Payment */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                {vi ? 'Phương thức thanh toán' : 'Payment Method'}
              </div>
              <div className="checkout-payment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {PAYMENT_METHODS.map(({ id, icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    style={{
                      padding: '16px 12px',
                      borderRadius: 14,
                      border: paymentMethod === id ? '1px solid rgba(168,150,246,.8)' : '1px solid rgba(168,150,246,.25)',
                      background: paymentMethod === id ? 'rgba(70,69,215,.2)' : 'rgba(1,1,10,.4)',
                      color: paymentMethod === id ? '#fff' : 'var(--muted)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                      fontSize: 13, fontWeight: paymentMethod === id ? 700 : 500,
                      boxShadow: paymentMethod === id ? '0 0 18px rgba(168,150,246,.2)' : 'none',
                      transition: 'all .2s',
                    }}
                  >
                    <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Student discount */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '16px', borderRadius: 12, border: '1px solid rgba(168,150,246,.2)', background: 'rgba(70,69,215,.06)', marginBottom: 24, userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={isStudent}
                onChange={e => setIsStudent(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--purple)' }}
              />
              <div>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                  {vi ? 'Áp dụng ưu đãi sinh viên (giảm 5%)' : 'Apply student discount (5% off)'}
                </span>
                <br />
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {vi ? 'Áp dụng cho sinh viên đang học tại FTU và các trường đại học.' : 'Valid for students at FTU and other universities.'}
                </span>
              </div>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-pill"
              style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 20px' }}
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span> {vi ? 'Đang xử lý...' : 'Processing...'}</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span> {vi ? 'Xác nhận & Thanh toán' : 'Confirm & Pay'}</>
              )}
            </button>
          </form>

          {/* Order Summary */}
          <div className="mfc-card" style={{ padding: '24px', position: 'sticky', top: 96 }}>
            <h3 className="serif" style={{ color: '#fff', fontSize: 20, margin: '0 0 20px' }}>
              {vi ? 'Tóm tắt đơn hàng' : 'Order Summary'}
            </h3>

            {/* Event info */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--line)' }}>
                <img src={event?.image} alt="Event" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'luminosity' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 className="serif" style={{ color: '#fff', fontSize: 18, margin: '0 0 4px' }}>{l(event?.title)}</h4>
                <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 4px' }}>{l(event?.venueName)}</p>
                <p style={{ color: 'var(--purple)', fontSize: 13, margin: 0 }}>
                  {new Date(event?.date).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Seats list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {bookingDetails.selectedSeats.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{s.seatId}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{formatPrice(s.price)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid rgba(168,150,246,.18)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>{vi ? `Tạm tính (${seatsCount} vé)` : `Subtotal (${seatsCount} seats)`}</span>
                <span style={{ color: '#fff' }}>{formatPrice(subtotal)}</span>
              </div>
              {isStudent && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--mint)' }}>{vi ? 'Ưu đãi sinh viên (−5%)' : 'Student discount (−5%)'}</span>
                  <span style={{ color: 'var(--mint)' }}>−{formatPrice(subtotal - finalTotal)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(168,150,246,.18)' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                  {vi ? 'Tổng thanh toán' : 'Total'}
                </span>
                <span className="serif" style={{ fontSize: 32, color: 'var(--purple)', fontWeight: 700 }}>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){
        .checkout-page-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        .checkout-form-grid { grid-template-columns: 1fr !important; }
        .checkout-payment-grid { grid-template-columns: 1fr !important; }
      }`}</style>
    </div>
  );
};

export default CheckoutPage;
