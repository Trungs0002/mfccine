import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import { QRCodeSVG } from 'qrcode.react';

const DigitalTicketPage = ({ completedBookingId, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

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
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [completedBookingId]);

  if (loading) {
    return (
      <div className="w-full flex-grow flex flex-col justify-center items-center py-20 gap-4 pt-[120px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
        <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">
          {language === 'vi' ? 'Đang tạo vé điện tử...' : 'Generating Digital Ticket Stub...'}
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full flex-grow flex flex-col justify-center items-center py-20 gap-4 pt-[120px] select-none text-center">
        <span className="material-symbols-outlined text-4xl text-error">error</span>
        <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">
          {language === 'vi' ? 'Không tìm thấy vé.' : 'No Ticket Found.'}
        </p>
        <button onClick={() => navigate('/')} className="text-primary underline font-label-sm text-[12px] uppercase tracking-widest">
          {language === 'vi' ? 'Về trang chủ' : 'Return to Homepage'}
        </button>
      </div>
    );
  }

  const event = booking.eventId;
  const seats = booking.selectedSeats || [];
  const ticketCode = booking.ticketCode || localStorage.getItem('lastTicketCode') || booking._id.toString().toUpperCase().slice(-8);
  const refId = booking._id.toString().toUpperCase().slice(-8);

  return (
    <div className="w-full flex-grow flex flex-col pt-[120px] pb-section-gap px-margin-mobile md:px-margin-desktop items-center justify-center min-h-screen relative z-10 animate-fade-in">

      <div className="w-full max-w-[440px] flex flex-col gap-6 items-center">

        {/* Success Badge */}
        <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary font-label-sm text-[10px] uppercase tracking-widest rounded-full select-none animate-pulse">
          {language === 'vi' ? '✓ Đặt vé thành công' : '✓ Reservation Completed Successfully'}
        </span>

        {/* Ticket Card */}
        <div className="w-full relative bg-surface-container/50 backdrop-blur-[24px] border border-outline-variant/20 rounded-xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_50px_100px_-20px_rgba(70,69,215,0.15)] group">

          {/* Event Image Header */}
          <div className="h-44 relative bg-surface-container-high overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container/95 via-surface-container/40 to-transparent z-10" />
            <img
              src={event?.image}
              alt="Event"
              className="absolute w-full h-full object-cover mix-blend-luminosity opacity-55 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-5 left-6 right-6 z-20 flex justify-between items-end">
              <div>
                <p className="font-label-sm text-[9px] text-primary uppercase tracking-[0.2em] mb-1.5 font-bold">Admit One</p>
                <h2 className="font-headline-lg-mobile text-[22px] text-on-surface leading-none tracking-wide uppercase">
                  {l(event?.title)}
                </h2>
              </div>
              <span className="material-symbols-outlined text-3xl text-primary font-light">local_activity</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4 border-b border-outline-variant/15 pb-5">
              <div>
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                  {language === 'vi' ? 'Ngày & Giờ' : 'Date & Time'}
                </p>
                <p className="font-body-md text-[14px] text-on-surface font-semibold">
                  {event?.date ? new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </p>
                <p className="text-[11px] text-on-surface-variant/80 uppercase mt-0.5">8:00 PM</p>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5">
                  {language === 'vi' ? 'Địa điểm' : 'Venue'}
                </p>
                <p className="font-body-md text-[14px] text-on-surface font-semibold">{l(event?.venueName)}</p>
                <p className="text-[11px] text-on-surface-variant/80 uppercase mt-0.5">{l(event?.location)}</p>
              </div>
            </div>

            {/* Seats & Tier */}
            <div className="flex justify-between items-center">
              <div className="bg-surface-container-highest/40 px-4 py-2.5 rounded-lg border border-outline-variant/10">
                <p className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">
                  {language === 'vi' ? 'Chỗ ngồi' : 'Seats Reserved'}
                </p>
                <p className="font-title-md text-[15px] text-primary">
                  {seats.map(s => s.seatId.split('-').slice(2).join(' ')).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">
                  {language === 'vi' ? 'Hạng vé' : 'Ticket Type'}
                </p>
                <p className="font-body-md text-[14px] text-on-surface font-semibold">
                  {l(event?.pricingTiers?.[seats[0]?.type?.toLowerCase()]?.label) || seats[0]?.type}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-primary/5 border border-primary/15 rounded-lg px-4 py-3">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">
                {language === 'vi' ? 'Tổng thanh toán' : 'Total Paid'}
              </span>
              <span className="font-display-xl text-[22px] text-primary font-bold">${booking.subtotal}</span>
            </div>
          </div>

          {/* Tear line */}
          <div className="relative flex items-center w-full select-none">
            <div className="w-6 h-6 rounded-full bg-background absolute -left-3 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.4)]" />
            <div className="flex-1 border-t-2 border-dashed border-outline-variant/25 mx-4" />
            <div className="w-6 h-6 rounded-full bg-background absolute -right-3 shadow-[inset_3px_0_5px_rgba(0,0,0,0.4)]" />
          </div>

          {/* QR Code Section */}
          <div className="p-8 flex flex-col items-center justify-center bg-surface-container/20 gap-4">
            {/* Real QR Code */}
            <div className="bg-white p-3 rounded-xl shadow-lg">
              <QRCodeSVG
                value={ticketCode}
                size={140}
                bgColor="#ffffff"
                fgColor="#01010A"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Ticket Code Display */}
            <div className="text-center">
              <p className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-[0.2em] mb-2">
                {language === 'vi' ? 'MÃ VÉ' : 'TICKET CODE'}
              </p>
              <div className="flex items-center gap-2 bg-surface-container-highest/60 border border-primary/20 px-5 py-2.5 rounded-lg">
                <span className="font-mono text-[18px] text-primary font-bold tracking-[0.15em]">{ticketCode}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(ticketCode); }}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  title="Copy"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
              </div>
              <p className="font-label-sm text-[9px] text-on-surface-variant/60 mt-2 uppercase tracking-widest">
                REF: {refId}
              </p>
            </div>

            <p className="font-label-sm text-[9px] text-on-surface-variant/50 text-center uppercase tracking-wider max-w-[220px]">
              {language === 'vi'
                ? 'Xuất trình mã QR hoặc mã vé tại cửa vào'
                : 'Present QR code or ticket code at venue entrance'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 select-none">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 border border-outline-variant/40 bg-transparent text-on-surface px-6 py-4 rounded-xl font-label-sm text-[12px] uppercase tracking-widest hover:bg-surface-container-highest/20 hover:border-white transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              PDF
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(ticketCode);
              }}
              className="flex-1 flex items-center justify-center gap-2 border border-outline-variant/40 bg-transparent text-on-surface px-6 py-4 rounded-xl font-label-sm text-[12px] uppercase tracking-widest hover:bg-surface-container-highest/20 hover:border-white transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              {language === 'vi' ? 'Sao chép' : 'Copy Code'}
            </button>
          </div>

          <button
            onClick={() => { navigate('/dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface border border-outline-variant/30 py-4 rounded-xl font-label-sm text-[13px] uppercase tracking-widest hover:bg-white hover:text-background transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
            {language === 'vi' ? 'Quay lại Dashboard' : 'View My Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketPage;
