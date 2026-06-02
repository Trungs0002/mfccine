import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const CheckoutPage = ({ event, bookingDetails, user, setCompletedBookingId }) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MoMo');
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(false);

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
  }, [user, fullName, email]);

  const subtotal = bookingDetails.subtotal;
  const seatsCount = bookingDetails.selectedSeats.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const bookingData = {
      eventId: event._id,
      fullName, email, phone,
      selectedSeats: bookingDetails.selectedSeats,
      subtotal: isStudent ? Math.round(subtotal * 0.95) : subtotal,
      paymentMethod
    };
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (res.ok) {
        setCompletedBookingId(data.bookingId);
        navigate('/ticket');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      <div className="mb-10 select-none">
        <button onClick={() => navigate('/seating')} className="flex items-center gap-2 font-label-sm text-[13px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
          {language === 'vi' ? 'Điều chỉnh chỗ ngồi' : 'Adjust Seating'}
        </button>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface uppercase leading-none font-bold tracking-tight">
          {language === 'vi' ? 'Xác nhận Đặt chỗ' : 'Secure Final Access'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 rounded-xl border border-outline-variant/20 shadow-xl space-y-8">
            <div className="space-y-6">
              <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-4">{language === 'vi' ? 'Thông tin cá nhân' : 'Personal Credentials'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">{language === 'vi' ? 'Họ và tên' : 'Legal Full Name'}</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface" required />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">{language === 'vi' ? 'Số điện thoại' : 'Phone Index'}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface w-full" required />
              </div>
              <div className="flex items-center gap-3 select-none pt-2">
                <input type="checkbox" id="student" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} className="w-5 h-5 rounded accent-primary" />
                <label htmlFor="student" className="font-body-md text-[14px] text-on-surface-variant cursor-pointer">{language === 'vi' ? 'Áp dụng ưu đãi sinh viên' : 'Apply Student Benefit'} <span className="text-primary font-bold">(5% Reduction)</span></label>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-4">{language === 'vi' ? 'Phương thức thanh toán' : 'Payment Architecture'}</h3>
              <div className="grid grid-cols-3 gap-4">
                {['MoMo', 'VNPay', 'Bank Transfer'].map(method => (
                  <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`p-5 rounded-lg border text-center font-label-sm text-[13px] uppercase tracking-wider transition-all ${paymentMethod === method ? 'border-primary bg-primary-container/20 text-primary font-bold' : 'border-outline-variant/20 text-on-surface-variant hover:text-on-surface'}`}>{method}</button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-8 bg-primary text-on-primary py-6 rounded-xl font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-xl flex justify-center items-center gap-3">
              {loading ? <span className="material-symbols-outlined text-[18px] animate-spin">sync</span> : <><span className="material-symbols-outlined text-[18px]">verified_user</span> {language === 'vi' ? 'Xác nhận & Thanh toán' : 'Confirm & Finalize Payment'}</>}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-[120px]">
          <div className="glass-panel p-8 rounded-xl border border-outline-variant/20 shadow-lg bg-surface-container-low/20">
            <h3 className="font-title-md text-[20px] text-on-surface mb-6 uppercase italic">{language === 'vi' ? 'Chi tiết đơn hàng' : 'Access Portfolio'}</h3>
            <div className="flex gap-6 mb-8 select-none">
              <div className="w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/10"><img src={event?.image} alt="Show" className="w-full h-full object-cover mix-blend-luminosity" /></div>
              <div className="flex-1">
                <h4 className="font-title-md text-[18px] text-on-surface mb-1">{l(event?.title)}</h4>
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">{l(event?.venueName)} • {l(event?.location)}</p>
                <p className="font-body-md text-[13px] text-primary mt-1">{new Date(event?.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="space-y-4 border-t border-outline-variant/10 pt-6 select-none">
              <div className="flex justify-between items-center text-[14px]"><span className="text-on-surface-variant">{language === 'vi' ? 'Vé tham dự' : 'Tier Passes'} ({seatsCount}x)</span><span className="text-on-surface font-semibold">${subtotal}</span></div>
              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest">{t('consolidatedTotal')}</span>
                <span className="font-display-xl text-[30px] text-on-surface font-bold">${isStudent ? Math.round(subtotal * 0.95) : subtotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
