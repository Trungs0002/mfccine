import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const DigitalTicketPage = ({ completedBookingId, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for bilingual fields
  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  useEffect(() => {
    if (!completedBookingId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/bookings/${completedBookingId}`)
      .then(res => res.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching booking details:', err);
        setLoading(false);
      });
  }, [completedBookingId]);

  if (loading) {
    return (
      <div className="w-full flex-grow flex flex-col justify-center items-center py-20 gap-4 pt-[120px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
        <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Generating Digital Ticket Stub...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full flex-grow flex flex-col justify-center items-center py-20 gap-4 pt-[120px] select-none text-center">
        <span className="material-symbols-outlined text-4xl text-error">error</span>
        <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">No Ticket Found.</p>
        <button onClick={() => navigate('/')} className="text-primary underline">Return to Homepage</button>
      </div>
    );
  }

  const event = booking.eventId;
  const seats = booking.selectedSeats || [];
  const refId = booking._id.toString().toUpperCase().slice(-8);

  return (
    <div className="w-full flex-grow flex flex-col pt-[120px] pb-section-gap px-margin-mobile md:px-margin-desktop flex items-center justify-center min-h-screen relative z-10 animate-fade-in">
      
      <div className="w-full max-w-[420px] flex flex-col gap-6 items-center">
        <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary font-label-sm text-[10px] uppercase tracking-widest rounded-full select-none animate-pulse">
          {language === 'vi' ? 'Đặt vé thành công' : 'Reservation Completed Successfully'}
        </span>

        <div className="w-full relative bg-surface-container/50 backdrop-blur-[24px] border border-outline-variant/20 rounded-xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.55)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_50px_100px_-20px_rgba(221,186,238,0.12)] group">
          <div className="h-48 relative bg-surface-container-high overflow-hidden select-none">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container/95 via-surface-container/40 to-transparent z-10"></div>
            <img 
              src={event?.image} 
              alt="Stub Background" 
              className="absolute w-full h-full object-cover mix-blend-luminosity opacity-55 group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end">
              <div>
                <p className="font-label-sm text-[9px] text-primary uppercase tracking-[0.2em] mb-1.5 font-bold">Admit One</p>
                <h2 className="font-headline-lg-mobile text-[24px] text-on-surface leading-none tracking-wide uppercase">
                  {l(event?.title)}
                </h2>
              </div>
              <span className="material-symbols-outlined text-4xl text-primary font-light">local_activity</span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 border-b border-outline-variant/15 pb-6">
              <div>
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5">{language === 'vi' ? 'Ngày & Giờ' : 'Date & Time'}</p>
                <p className="font-body-md text-[14px] text-on-surface font-semibold">
                  {event?.date ? new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </p>
                <p className="text-[11px] text-on-surface-variant/80 uppercase mt-0.5">8:00 PM</p>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest mb-1.5">{language === 'vi' ? 'Địa điểm' : 'Venue'}</p>
                <p className="font-body-md text-[14px] text-on-surface font-semibold">
                  {l(event?.venueName)}
                </p>
                <p className="text-[11px] text-on-surface-variant/80 uppercase mt-0.5">{l(event?.location)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="bg-surface-container-highest/40 px-4 py-3 rounded-lg border border-outline-variant/10">
                <p className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">{language === 'vi' ? 'Chỗ ngồi' : 'Seats Reserved'}</p>
                <p className="font-title-md text-[16px] text-primary">
                  {seats.map(s => s.seatId.split('-').slice(2).join(' ')).join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-widest mb-1">{language === 'vi' ? 'Hạng vé' : 'Ticket Type'}</p>
                <p className="font-body-md text-[14px] text-on-surface font-semibold">
                  {l(event?.pricingTiers?.[seats[0]?.type.toLowerCase()]?.label) || seats[0]?.type}
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center w-full select-none">
            <div className="w-6 h-6 rounded-full bg-background absolute -left-3 shadow-[inset_-3px_0_5px_rgba(0,0,0,0.4)]"></div>
            <div className="flex-1 border-t-2 border-dashed border-outline-variant/25 mx-4"></div>
            <div className="w-6 h-6 rounded-full bg-background absolute -right-3 shadow-[inset_3px_0_5px_rgba(0,0,0,0.4)]"></div>
          </div>

          <div className="p-8 flex flex-col items-center justify-center bg-surface-container/20">
            <div className="bg-white p-3.5 rounded-lg mb-4 select-none shadow-md">
              <svg className="w-32 h-32 text-black" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                <g fill="black">
                  <rect x="5" y="5" width="25" height="25" />
                  <rect x="9" y="9" width="17" height="17" fill="white" />
                  <rect x="13" y="13" width="9" height="9" />
                  <rect x="70" y="5" width="25" height="25" />
                  <rect x="74" y="9" width="17" height="17" fill="white" />
                  <rect x="78" y="13" width="9" height="9" />
                  <rect x="5" y="70" width="25" height="25" />
                  <rect x="9" y="74" width="17" height="17" fill="white" />
                  <rect x="13" y="13" width="9" height="9" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="45" y="45" width="10" height="10" fill="white" />
                </g>
              </svg>
            </div>
            <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-[0.25em]">
              REF ID: {refId}
            </p>
          </div>
        </div>

        <div className="w-full space-y-4 select-none">
          <button onClick={() => alert('Done.')} className="w-full flex items-center justify-center gap-2 bg-tertiary text-on-tertiary px-8 py-5 rounded-xl font-label-sm text-[13px] uppercase tracking-widest hover:bg-tertiary-fixed transition-colors shadow-lg">
            <span className="material-symbols-outlined fill-icon text-[20px]">account_balance_wallet</span>
            {language === 'vi' ? 'Lưu vào ví' : 'Save to Wallet'}
          </button>
          
          <div className="flex gap-4">
            <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 border border-outline-variant/40 bg-transparent text-on-surface px-8 py-5 rounded-xl font-label-sm text-[12px] uppercase tracking-widest hover:bg-surface-container-highest/20 hover:border-white transition-all">
              <span className="material-symbols-outlined text-[18px]">download</span>
              PDF
            </button>
            <button onClick={() => alert(`Link copied`)} className="flex-1 flex items-center justify-center gap-2 border border-outline-variant/40 bg-transparent text-on-surface px-8 py-5 rounded-xl font-label-sm text-[12px] uppercase tracking-widest hover:bg-surface-container-highest/20 hover:border-white transition-all">
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              {language === 'vi' ? 'Chia sẻ' : 'Share'}
            </button>
          </div>

          <button onClick={() => { navigate('/dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface border border-outline-variant/30 py-5 rounded-xl font-label-sm text-[13px] uppercase tracking-widest hover:bg-white hover:text-background transition-all">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
            {language === 'vi' ? 'Quay lại Dashboard' : 'View My Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketPage;
