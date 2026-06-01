import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const EventDetailsPage = ({ event, setEvent }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  if (!event) return null;

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      <div className="mb-8 select-none">
        <button 
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 font-label-sm text-[13px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
          {language === 'vi' ? 'Quay lại sự kiện' : 'Back to Showcase'}
        </button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        <div className="lg:col-span-7 glass-panel rounded-xl overflow-hidden shadow-2xl relative select-none">
          <img 
            src={event.image} 
            alt="Event" 
            className="w-full h-[450px] object-cover mix-blend-luminosity opacity-85 hover:mix-blend-normal hover:scale-102 hover:opacity-100 transition-all duration-700"
          />
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center h-full">
          <span className="font-label-sm text-[12px] text-primary uppercase tracking-[0.2em] mb-3 block">
            {l(event.location)} • {l(event.venueName)}
          </span>
          <h1 className="font-display-xl text-[36px] md:text-[50px] text-on-surface font-extrabold leading-[1.2] mb-6">
            {l(event.title)}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
            {l(event.description)}
          </p>

          <div className="bg-surface-container/30 border border-outline-variant/15 p-6 rounded-lg mb-8 select-none">
            <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-4">{language === 'vi' ? 'Ngày diễn ra' : 'Event Date'}</h3>
            <div className="flex items-center gap-4 text-on-surface">
              <span className="material-symbols-outlined text-3xl font-light text-primary">calendar_today</span>
              <div>
                <p className="font-title-md text-[18px] leading-tight">
                  {new Date(event.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest mt-1">
                  Doors Open at 7:00 PM • Ceremony starts at 8:00 PM
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              setEvent(event);
              navigate('/seating');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-primary text-on-primary w-full py-6 rounded font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors select-none shadow-[0_10px_30px_rgba(221,186,238,0.2)]"
          >
            {language === 'vi' ? 'Chọn chỗ ngồi của bạn' : 'Select Your Seats'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/20 pb-4">
            {language === 'vi' ? 'LỊCH TRÌNH CHƯƠNG TRÌNH' : 'THE EVENING SCHEDULE'}
          </h2>
          <div className="space-y-8 select-none">
            {event.schedule && event.schedule.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start relative group">
                <div className="flex flex-col items-center">
                  <span className="w-12 h-12 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center font-display-xl text-[14px] text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                    {item.time}
                  </span>
                  {idx < event.schedule.length - 1 && (
                    <div className="w-[1px] h-16 bg-outline-variant/30 mt-2"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-body-lg text-body-lg font-semibold text-on-surface mb-1">
                    {l(item.title)}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-[14px]">
                    {l(item.description)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-6">
          <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/20 pb-4">
            {language === 'vi' ? 'ĐẶC QUYỀN HẠNG VÉ' : 'TIER PRIVILEGES'}
          </h2>
          <div className="space-y-4 select-none">
            {['vip', 'gold', 'silver', 'standard'].map(key => {
              const tier = event.pricingTiers?.[key];
              if (!tier) return null;
              return (
                <div key={key} className="glass-panel p-6 rounded-lg border-l-4 flex items-start gap-4" style={{ borderLeftColor: key === 'vip' ? '#ff2a8d' : key === 'gold' ? '#ffb800' : key === 'silver' ? '#00f0ff' : '#d946ef' }}>
                  <span className="material-symbols-outlined text-3xl font-light" style={{ color: key === 'vip' ? '#ff2a8d' : key === 'gold' ? '#ffb800' : key === 'silver' ? '#00f0ff' : '#d946ef' }}>
                    {key === 'vip' ? 'stars' : key === 'gold' ? 'workspace_premium' : key === 'silver' ? 'local_activity' : 'confirmation_number'}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-body-lg text-body-lg font-semibold text-on-surface">{l(tier.label) || key.toUpperCase()}</h4>
                      <span className="font-title-md text-[18px] font-bold" style={{ color: key === 'vip' ? '#ff2a8d' : key === 'gold' ? '#ffb800' : key === 'silver' ? '#00f0ff' : '#d946ef' }}>${tier.price}</span>
                    </div>
                    <p className="font-body-md text-[13px] text-on-surface-variant">{l(tier.description)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailsPage;
