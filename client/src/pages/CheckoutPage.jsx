import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const CheckoutPage = ({ event, bookingDetails, user, setCompletedBookingId }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MoMo');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const [discountInput, setDiscountInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, percent, maxSeats }
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.fullName);
      if (!email) setEmail(user.email);
    }
  }, [user]); // eslint-disable-line

  const subtotal = bookingDetails.subtotal;
  const seatsCount = bookingDetails.selectedSeats.length;

  // Discount only covers up to the code's remaining allowance (shared across every past use of
  // this code, not just this order) — applied to the highest-priced seats first.
  const seatsByPriceDesc = [...bookingDetails.selectedSeats].sort((a, b) => b.price - a.price);
  const discountApplyCount = appliedCoupon
    ? (appliedCoupon.remaining != null ? Math.min(appliedCoupon.remaining, seatsCount) : seatsCount)
    : 0;
  const discountedSeatIds = new Set(seatsByPriceDesc.slice(0, discountApplyCount).map(s => s.seatId));
  const discountBase = seatsByPriceDesc.slice(0, discountApplyCount).reduce((sum, s) => sum + s.price, 0);
  const discountAmount = appliedCoupon ? Math.round(discountBase * (appliedCoupon.percent / 100)) : 0;
  const finalTotal = subtotal - discountAmount;
  const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + (vi ? 'đ' : ' VND');

  const handleApplyCoupon = async () => {
    const code = discountInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon({ code: data.code, percent: data.percent, maxSeats: data.maxSeats, remaining: data.remaining });
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || (vi ? 'Mã giảm giá không hợp lệ.' : 'Invalid discount code.'));
      }
    } catch {
      setCouponError(vi ? 'Không thể kiểm tra mã giảm giá.' : 'Could not check the discount code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountInput('');
    setCouponError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowComingSoon(true);

    // TODO: payment not finished yet — re-enable this once it's ready.
    // (async () => {
    //   const res = await fetch(`${API_URL}/api/bookings`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       eventId: event._id,
    //       fullName, email, phone,
    //       selectedSeats: bookingDetails.selectedSeats,
    //       subtotal,
    //       discountCode: appliedCoupon?.code || null,
    //       paymentMethod,
    //     }),
    //   });
    //   const data = await res.json();
    //   if (res.ok) {
    //     setCompletedBookingId(data.bookingId);
    //     localStorage.setItem('lastTicketCode', data.ticketCode || '');
    //     navigate('/ticket');
    //     window.scrollTo({ top: 0, behavior: 'smooth' });
    //   }
    // })();
  };

  const PAYMENT_METHODS = [
    { id: 'MoMo', icon: <img src="https://img.mservice.com.vn/app/img/portal_documents/mini-app_design-guideline_branding-guide-2-2.png" alt="MoMo" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />, label: 'MoMo' },
    { id: 'VNPay', icon: <div style={{ background: '#fff', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', height: 28 }}><img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png" alt="VNPay" style={{ height: 16, width: 'auto', objectFit: 'contain' }} /></div>, label: 'VNPay' },
    { id: 'Bank Transfer', icon: <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#a896f6' }}>account_balance</span>, label: vi ? 'Chuyển khoản' : 'Bank Transfer' },
  ];

  return (
    <div style={{ paddingTop: 120, paddingBottom: 64 }} className="animate-fade-in">
      {showComingSoon && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(1,1,10,.75)', backdropFilter: 'blur(6px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="mfc-card" style={{ padding: 40, maxWidth: 420, textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--purple)', marginBottom: 16, display: 'block' }}>construction</span>
            <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: '0 0 12px' }}>
              {vi ? 'Sắp ra mắt' : 'Coming Soon'}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
              {vi ? 'Tính năng thanh toán đang được hoàn thiện. Vui lòng quay lại sau nhé!' : 'Payment is still being built. Please check back soon!'}
            </p>
            <button onClick={() => setShowComingSoon(false)} className="btn-pill" style={{ width: '100%', justifyContent: 'center' }}>
              {vi ? 'Đã hiểu' : 'Got it'}
            </button>
          </div>
        </div>
      )}
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

            {/* Discount code */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                {vi ? 'Mã giảm giá' : 'Discount Code'}
              </div>
              {appliedCoupon ? (
                <div style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(158,254,253,.4)', background: 'rgba(158,254,253,.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--mint)', fontSize: 14, fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 6 }}>local_offer</span>
                      {appliedCoupon.code} · −{appliedCoupon.percent}%
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)' }}
                    >
                      {vi ? 'Xóa' : 'Remove'}
                    </button>
                  </div>
                  {appliedCoupon.maxSeats != null && (
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 0' }}>
                      {vi
                        ? `Áp dụng cho ${discountApplyCount}/${seatsCount} vé có giá cao nhất trong đơn. Mã còn ${Math.max(0, appliedCoupon.remaining - discountApplyCount)} lượt sau đơn này.`
                        : `Applied to the ${discountApplyCount}/${seatsCount} highest-priced seats in this order. ${Math.max(0, appliedCoupon.remaining - discountApplyCount)} use(s) left after this order.`}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      value={discountInput}
                      onChange={e => { setDiscountInput(e.target.value); setCouponError(''); }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                      className="mfc-input"
                      placeholder={vi ? 'Nhập mã giảm giá (nếu có)' : 'Enter code (optional)'}
                    // style={{ textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !discountInput.trim()}
                      className="btn-outline-pill"
                      style={{ flexShrink: 0, opacity: couponLoading || !discountInput.trim() ? 0.5 : 1 }}
                    >
                      {couponLoading ? (vi ? 'Đang kiểm tra...' : 'Checking...') : (vi ? 'Áp dụng' : 'Apply')}
                    </button>
                  </div>
                  {couponError && (
                    <p style={{ color: '#ff6b6b', fontSize: 12, marginTop: 8, marginBottom: 0 }}>{couponError}</p>
                  )}
                </>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-pill"
              style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 20px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span> {vi ? 'Xác nhận & Thanh toán' : 'Confirm & Pay'}
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
              {bookingDetails.selectedSeats.map((s, i) => {
                const isDiscounted = appliedCoupon && discountedSeatIds.has(s.seatId);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                    <span style={{ color: 'var(--muted)' }}>
                      {s.seatId} · {s.type}
                      {isDiscounted && (
                        <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: 'var(--mint)' }}>
                          −{appliedCoupon.percent}%
                        </span>
                      )}
                    </span>
                    <span>
                      {isDiscounted ? (
                        <>
                          <span style={{ color: 'var(--muted)', textDecoration: 'line-through', marginRight: 8, fontSize: 12 }}>
                            {formatPrice(s.price)}
                          </span>
                          <span style={{ color: 'var(--mint)' }}>
                            {formatPrice(Math.round(s.price * (1 - appliedCoupon.percent / 100)))}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: '#fff' }}>{formatPrice(s.price)}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid rgba(168,150,246,.18)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--muted)' }}>{vi ? `Tạm tính (${seatsCount} vé)` : `Subtotal (${seatsCount} seats)`}</span>
                <span style={{ color: '#fff' }}>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--mint)' }}>{vi ? `Mã ${appliedCoupon.code} (−${appliedCoupon.percent}%)` : `Code ${appliedCoupon.code} (−${appliedCoupon.percent}%)`}</span>
                  <span style={{ color: 'var(--mint)' }}>−{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(168,150,246,.18)' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                  {vi ? 'Tổng thanh toán' : 'Total'}
                </span>
                <span style={{ fontSize: 32, color: 'var(--mint)', fontWeight: 700 }}>{formatPrice(finalTotal)}</span>
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
