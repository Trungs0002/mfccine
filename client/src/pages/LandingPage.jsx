import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const LandingPage = ({ events, setEvent, settings }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const activeEvent = events && events.length > 0 ? events[0] : null;

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  const calculateTimeLeft = useCallback(() => {
    if (!activeEvent) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const difference = +new Date(activeEvent.date) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  }, [activeEvent]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!activeEvent) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [activeEvent, calculateTimeLeft]);

  useEffect(() => {
    if (activeEvent) {
      setEvent(activeEvent);
    }
  }, [activeEvent, setEvent]);

  const handleBookNow = () => {
    if (!activeEvent) return;
    navigate('/seating');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!activeEvent) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-40 gap-4 pt-[180px]">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
        <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.2em]">{t('retrievingShowcase')}</p>
      </div>
    );
  }

  const formatPrice = (p) => Number(p || 0).toLocaleString();

  const tiers = [
    { key: 'vip', color: '#ff2a8d', icon: 'stars' },
    { key: 'gold', color: '#ffb800', icon: 'workspace_premium' },
    { key: 'silver', color: '#00f0ff', icon: 'local_activity' },
    { key: 'standard', color: '#d946ef', icon: 'confirmation_number' }
  ];

  return (
    <div className="w-full flex-grow flex flex-col relative z-10 animate-fade-in">
      
      {/* 1. CINEMATIC HERO HEADER */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop text-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background z-10"></div>
          <img 
            src={activeEvent.image} 
            alt="Hero" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-45 scale-102 blur-[1px]"
          />
        </div>

        <div className="relative z-20 max-w-[850px] flex flex-col items-center select-none">
          <p className="font-label-sm text-[12px] text-primary uppercase tracking-[0.3em] mb-4">
            {settings?.siteName || 'EVENT PRO'} {t('exclusiveHosting')}
          </p>
          <h1 className="font-display-xl text-[46px] md:text-[88px] text-on-surface font-extrabold leading-[1.1] mb-8 tracking-tight uppercase">
            {l(activeEvent.title)}
          </h1>

          <div className="flex gap-4 md:gap-8 justify-center mb-12 w-full max-w-[450px]">
            {Object.keys(timeLeft).map((interval, i) => (
              <div key={i} className="flex-1 bg-surface-container/30 backdrop-blur-md border border-outline-variant/15 py-3 rounded-lg flex flex-col items-center justify-center shadow-2xl">
                <span className="font-display-xl text-[26px] md:text-[38px] text-primary font-bold">
                  {String(timeLeft[interval] || 0).padStart(2, '0')}
                </span>
                <span className="font-label-sm text-[9px] md:text-[11px] text-on-surface-variant uppercase tracking-widest mt-1">
                  {interval}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleBookNow}
              className="bg-primary text-on-primary px-14 py-6 rounded font-label-sm text-[14px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_10px_35px_rgba(221,186,238,0.3)] hover:scale-102 duration-300"
            >
              {t('bookPassesNow')}
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('details-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-outline-variant/40 bg-surface-container-low/20 backdrop-blur-md px-14 py-6 rounded font-label-sm text-[14px] uppercase tracking-widest hover:bg-surface-container-highest/40 hover:border-white transition-all"
            >
              {t('eventLogistics')}
            </button>
          </div>
        </div>
      </section>

      {/* 2. SHOW DETAILS SECTION */}
      <section id="details-section" className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full relative z-20 border-t border-outline-variant/10">
        <div id="events-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-label-sm text-[12px] text-primary uppercase tracking-[0.25em] mb-3 block">
              {l(activeEvent.location)} • {l(activeEvent.venueName)}
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-surface font-extrabold leading-tight mb-6 uppercase">
              {t('featuredShowcase')}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8">
              {l(activeEvent.description)}
            </p>

            <div className="bg-surface-container/30 border border-outline-variant/15 p-6 rounded-lg select-none">
              <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-3">{t('eventDateLocation')}</h3>
              <div className="flex items-center gap-4 text-on-surface">
                <span className="material-symbols-outlined text-4xl font-light text-primary">calendar_today</span>
                <div>
                  <p className="font-title-md text-[18px] leading-tight">
                    {new Date(activeEvent.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest mt-1">
                    {t('doorsOpenLabel')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 select-none">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">{t('accessLevels')}</h3>
            
            {tiers.map(tier => {
              const tierData = activeEvent.pricingTiers?.[tier.key];
              if (!tierData) return null;

              return (
                <div key={tier.key} className="glass-panel p-5 rounded-lg border-l-4 flex items-start gap-4 transition-all hover:translate-x-1" style={{ borderLeftColor: tier.color }}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: tier.color }}>{tier.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-body-md font-semibold text-on-surface uppercase">
                        {l(tierData.label) || `${tier.key.toUpperCase()} TIER`}
                      </h4>
                      <span className="font-title-md text-[18px] font-bold" style={{ color: tier.color }}>
                        ${formatPrice(tierData.price)}
                      </span>
                    </div>
                    <p className="font-body-md text-[12px] text-on-surface-variant leading-snug">
                      {l(tierData.description) || (language === 'vi' ? 'Sở hữu ngay tấm vé tham dự sự kiện cao cấp này.' : 'Premium access pass for this event tier.')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-outline-variant/10 pt-16 flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <p className="font-label-sm text-[12px] text-primary uppercase tracking-wider mb-2">{t('nightFlow')}</p>
            <h3 className="font-title-md text-[24px] uppercase text-on-surface leading-tight font-extrabold">{t('chroniclesOfEvent')}</h3>
          </div>
          <div className="md:w-2/3 space-y-8 select-none">
            {activeEvent.schedule && activeEvent.schedule.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start relative group">
                <div className="flex flex-col items-center">
                  <span className="w-10 h-10 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center font-display-xl text-[12px] text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                    {item.time}
                  </span>
                  {idx < activeEvent.schedule.length - 1 && (
                    <div className="w-[1px] h-12 bg-outline-variant/20 mt-2"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-body-md font-semibold text-on-surface mb-0.5">{l(item.title)}</h4>
                  <p className="font-body-md text-[13px] text-on-surface-variant">{l(item.description)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center select-none relative z-20 bg-surface-container/20 border-t border-b border-outline-variant/10">
        <h3 className="font-title-md text-[26px] text-on-surface italic mb-4">{t('readyToWitness')}</h3>
        <button 
          onClick={handleBookNow}
          className="bg-primary text-on-primary px-16 py-7 rounded font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_8px_32px_rgba(221,186,238,0.25)]"
        >
          {t('securePass')}
        </button>
      </section>

      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(72,45,88,0.12)_0%,transparent_70%)] blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(82,61,109,0.1)_0%,transparent_70%)] blur-[80px]"></div>
      </div>
    </div>
  );
};

export default LandingPage;
