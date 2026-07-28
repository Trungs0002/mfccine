import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const CheckoutPage = ({ event, bookingDetails, setBookingDetails, user, setCompletedBookingId }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('VNPay');
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [isUploadingBill, setIsUploadingBill] = useState(false);
  const [billImage, setBillImage] = useState(null);
  const [uploadingBillLoading, setUploadingBillLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const receiptRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]); // eslint-disable-line

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'vnpay_failed') {
      alert(vi ? 'Thanh toán VNPay thất bại hoặc bị huỷ.' : 'VNPay payment failed or was cancelled.');
      // Remove query param without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [vi]);

  const [timeLeft, setTimeLeft] = useState(null);

  const hasAlerted = useRef(false);

  useEffect(() => {
    if (showSuccessPopup || uploadingBillLoading) {
      setTimeLeft(null);
      return;
    }
    if (!qrData?.expiresAt || hasAlerted.current) return;
    let interval;
    const updateTimer = async () => {
      if (hasAlerted.current) return;
      const remaining = new Date(qrData.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        hasAlerted.current = true;
        clearInterval(interval);
        setTimeLeft(0);
        
        // Cancel the pending booking on timeout (await it so it frees seats BEFORE we navigate)
        try {
          await fetch(`${API_URL}/api/bookings/${qrData.bookingId}/cancel`, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.error(error);
        }

        // Use setTimeout to allow the state update and clearInterval to take effect before the blocking alert
        setTimeout(() => {
          alert(vi ? 'Đã hết thời gian giao dịch! Vui lòng đặt lại.' : 'Payment time expired! Please book again.');
          navigate('/seating');
        }, 10);
      } else {
        setTimeLeft(remaining);
      }
    };
    updateTimer();
    if (!hasAlerted.current) {
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [qrData?.expiresAt, qrData?.bookingId, navigate, vi, showSuccessPopup, uploadingBillLoading]);

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
    if (isSubmitting) return;

    (async () => {
      setIsSubmitting(true);
      try {
        const res = await fetch(`${API_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event._id,
            fullName, email, phone,
            selectedSeats: bookingDetails.selectedSeats,
            subtotal,
            discountCode: appliedCoupon?.code || null,
            paymentMethod,
            lockId: bookingDetails.lockId,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setQrData({
            bookingId: data.bookingId,
            ticketCode: data.ticketCode,
            amount: finalTotal,
            expiresAt: new Date(Date.now() + 10 * 60000).toISOString()
          });
        } else {
            alert(data.error || 'Checkout failed');
            navigate('/seating');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const handleBillChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setBillImage(reader.result);
  };

  const handleUploadBillSubmit = async () => {
    if (billImage) {
      setUploadingBillLoading(true);
      try {
        await fetch(`${API_URL}/api/bookings/${qrData.bookingId}/bill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: billImage }),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setUploadingBillLoading(false);
      }
    }
    setShowSuccessPopup(true);
  };


  const PAYMENT_METHODS = [
    { id: 'VNPay', icon: <div style={{ background: '#fff', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', height: 28 }}><img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR.png" alt="VNPay" style={{ height: 16, width: 'auto', objectFit: 'contain' }} /></div>, label: 'VNPay' },
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
            onClick={() => {
              if (bookingDetails.lockId) {
                fetch(`${API_URL}/api/bookings/unlock`, { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify({ lockId: bookingDetails.lockId }) 
                }).catch(e => console.error(e));
              }
              navigate('/seating');
            }}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h1 className="gradient-title" style={{ fontSize: 'clamp(24px, 4vw, 36px)', margin: 0 }}>
              {vi ? 'Thông tin & Thanh toán' : 'Your Details & Payment'}
            </h1>
          </div>
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
              disabled={isSubmitting}
              className="btn-pill"
              style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '16px 20px', opacity: isSubmitting ? 0.7 : 1 }}
            >
              <span className={`material-symbols-outlined ${isSubmitting ? 'animate-spin' : ''}`} style={{ fontSize: 18 }}>
                {isSubmitting ? 'sync' : 'verified_user'}
              </span>
              {isSubmitting 
                ? (vi ? 'Đang xử lý...' : 'Processing...') 
                : (vi ? 'Xác nhận & Thanh toán' : 'Confirm & Pay')}
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
                    <span style={{ color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                      <span style={{ whiteSpace: 'nowrap' }}>{s.seatId} · {s.type}</span>
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

      {/* VietQR Popup */}
      {qrData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(1,1,10,.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="mfc-card animate-fade-in" style={{ padding: 40, maxWidth: 420, width: '100%', textAlign: 'center', background: '#14141e' }}>
            {!isUploadingBill ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: 0 }}>
                    {vi ? 'Thanh toán vé' : 'Payment'}
                  </h3>
                  {timeLeft !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', padding: '6px 12px', borderRadius: 999, color: '#ff6b6b' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>timer</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {vi ? 'Hết hạn: ' : 'Expires: '}{formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 24px', lineHeight: 1.5 }}>
                  {vi ? 'Vui lòng dùng ứng dụng ngân hàng quét mã QR dưới đây để thanh toán.' : 'Please use your banking app to scan this QR code.'}
                </p>
                
                <div style={{ background: '#fff', padding: 16, borderRadius: 16, display: 'inline-block', marginBottom: 24 }}>
                  <img 
                    src={`https://img.vietqr.io/image/vietinbank-0374748310-compact2.png?amount=${qrData.amount}&addInfo=${encodeURIComponent('Thanh toan don hang ' + qrData.bookingId.slice(-8).toUpperCase())}&accountName=Nguyen Ngoc Khanh Huyen`}
                    alt="VietQR"
                    style={{ width: '100%', maxWidth: 260, display: 'block' }}
                  />
                </div>

                <div style={{ background: 'rgba(168,150,246,.08)', border: '1px solid rgba(168,150,246,.2)', padding: 16, borderRadius: 12, marginBottom: 24, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Ngân hàng:</span>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>VietinBank</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Số tài khoản:</span>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>0374748310</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Tên người nhận:</span>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>NGUYEN NGOC KHANH HUYEN</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Số tiền:</span>
                    <span style={{ color: 'var(--mint)', fontSize: 14, fontWeight: 700 }}>{formatPrice(qrData.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>Nội dung CK:</span>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Thanh toan don hang {qrData.bookingId.slice(-8).toUpperCase()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button 
                    className="btn-pill" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => setIsUploadingBill(true)}
                  >
                    {vi ? 'Tôi đã chuyển khoản thành công' : 'I have transferred successfully'}
                  </button>
                  <button 
                    className="btn-pill" 
                    style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.2)' }}
                    onClick={async () => {
                      if (window.confirm(vi ? 'Bạn chắc chắn muốn hủy thanh toán này?' : 'Are you sure you want to cancel this payment?')) {
                        try {
                          const res = await fetch(`${API_URL}/api/bookings/${qrData.bookingId}/cancel`, { 
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ lockId: bookingDetails.lockId })
                          });
                          const data = await res.json();
                          if (data.expiresAt) {
                            setBookingDetails(prev => ({ ...prev, lockExpiresAt: data.expiresAt }));
                          }
                        } catch (e) { console.error(e); }
                        setQrData(null);
                        // stay on checkout page
                      }
                    }}
                  >
                    {vi ? 'Hủy thanh toán' : 'Cancel payment'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: 0 }}>
                    {vi ? 'Xác nhận thanh toán' : 'Confirm Payment'}
                  </h3>
                  {timeLeft !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', padding: '6px 12px', borderRadius: 999, color: '#ff6b6b' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>timer</span>
                      <span style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {vi ? 'Hết hạn: ' : 'Expires: '}{formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 24px', lineHeight: 1.5 }}>
                  {vi ? 'Vui lòng tải lên ảnh chụp màn hình (bill) đã chuyển khoản để chúng tôi xác nhận nhanh hơn.' : 'Please upload a screenshot of your transfer bill.'}
                </p>

                <label style={{ display: 'block', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', padding: 32, borderRadius: 12, cursor: 'pointer', marginBottom: 24 }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBillChange} />
                  {billImage ? (
                    <img src={billImage} alt="Bill preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--muted)' }}>upload_file</span>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{vi ? 'Nhấn để chọn ảnh' : 'Click to select image'}</span>
                    </div>
                  )}
                </label>

                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                  <button 
                    className="btn-pill" 
                    style={{ width: '100%', justifyContent: 'center', opacity: (uploadingBillLoading || !billImage) ? 0.5 : 1, pointerEvents: (uploadingBillLoading || !billImage) ? 'none' : 'auto' }}
                    onClick={handleUploadBillSubmit}
                    disabled={!billImage}
                  >
                    {uploadingBillLoading ? (vi ? 'Đang tải lên...' : 'Uploading...') : (vi ? 'Đã thanh toán' : 'I have paid')}
                  </button>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, textDecoration: 'underline', cursor: 'pointer', padding: '8px 0' }}
                    onClick={() => setIsUploadingBill(false)}
                  >
                    {vi ? 'Chưa thanh toán, quay về mã QR' : 'Not paid yet, back to QR'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(1,1,10,.85)', backdropFilter: 'blur(8px)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="mfc-card animate-fade-in" style={{ maxWidth: 420, width: '100%', textAlign: 'center', background: '#14141e', overflow: 'hidden' }}>
            <div ref={receiptRef} style={{ background: '#14141e', padding: '40px 40px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(168,150,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              </div>
              
              <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: '0 0 12px' }}>
                {vi ? 'Cảm ơn bạn đã đặt vé!' : 'Thank you for your booking!'}
              </h3>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, textAlign: 'left', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{vi ? 'Người mua' : 'Buyer'}</span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                    {fullName}<br/>
                    <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 400 }}>{email}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{vi ? 'Ghế đã chọn' : 'Selected Seats'}</span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
                    {bookingDetails.selectedSeats?.map(s => s.seatId).join(', ')}<br/>
                    <span style={{ color: 'var(--purple)', fontSize: 11 }}>{bookingDetails.selectedSeats?.length || 0} {vi ? 'vé' : 'tickets'}</span>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{vi ? 'Thanh toán' : 'Payment'}</span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>{vi ? 'Trạng thái' : 'Status'}</span>
                  <span style={{ color: '#ffb800', fontSize: 12, fontWeight: 700, background: 'rgba(255,184,0,0.15)', padding: '5px 12px 6px', borderRadius: 999, display: 'inline-block', lineHeight: 1, letterSpacing: '0.05em' }}>PENDING</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '16px 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{vi ? 'Tổng cộng' : 'Total'}</span>
                  <span style={{ color: 'var(--mint)', fontSize: 18, fontWeight: 700 }}>{formatPrice(finalTotal || 0)}</span>
                </div>
              </div>

              <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0', lineHeight: 1.6 }}>
                {vi 
                  ? 'Vé của bạn đang ở trạng thái chờ xử lý (Pending). Chúng tôi sẽ xác nhận thông tin thanh toán và gửi mã QR điện tử qua email cho bạn trong thời gian sớm nhất.' 
                  : 'Your ticket is currently Pending. We will verify your payment and send the e-ticket QR code to your email as soon as possible.'}
              </p>
            </div>

            <div style={{ padding: '0 40px 40px', display: 'flex', gap: 12 }}>
              <button 
                className="btn-outline-pill" 
                style={{ flex: 1, justifyContent: 'center', gap: 8 }}
                onClick={async () => {
                  const element = receiptRef.current;
                  if (element) {
                    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#14141e' });
                    const imgData = canvas.toDataURL('image/png');
                    
                    const pdfWidth = canvas.width;
                    const pdfHeight = canvas.height;
                    
                    const pdf = new jsPDF({
                      orientation: pdfWidth > pdfHeight ? 'l' : 'p',
                      unit: 'px',
                      format: [pdfWidth, pdfHeight]
                    });
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Hoa_don_${bookingDetails.bookingId || 'MFC'}.pdf`);
                  }
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                {vi ? 'Hóa đơn' : 'Invoice'}
              </button>
              <button 
                className="btn-pill" 
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  navigate('/');
                  window.scrollTo(0, 0);
                }}
              >
                {vi ? 'Về trang chủ' : 'Back to Home'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
