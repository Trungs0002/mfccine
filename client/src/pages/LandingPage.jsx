import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ events, setEvent, settings }) => {
  const navigate = useNavigate();
  const galaEvent = events[0] || {
    title: 'THE HAUTE ETHER GALA',
    description: 'An evening of transcendent high fashion, sensory exploration, and digital art installations in the heart of the Grand Palais.',
    date: '2026-10-24T20:00:00Z',
    location: 'Paris, France',
    venueName: 'The Grand Palais Expose',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2zp9mt2s9NMz6BrgnUb3YY0d3kiA9TzIVf4oyRBB2ymI0h5zeo2N5P4xW-knR51jcjeIMPZZNSEIFT0ot4qZWsIRN55IV9IPz5N8DZo6Q4ioSJq3VN4pjnrTmo8vJARrCRXMEucFOSHN71XsjuZLnPcKkezdb0-FJKrhDclMOSVQjYWKyzCTHOV_kWp-bD48iKKRPJj2OyA1Ld7hcgEQBfwVz_EIxKyo2_sAI0bqf6_QT1at8d0AynzxEFd7Ft5kzjRW-Ta1wdFI',
    schedule: [
      { time: '19:00', title: 'Atmospheric Red Carpet & Arrival', description: 'Begin the journey with sensory cocktail pairings and editorial photography.' },
      { time: '20:00', title: 'The Haute Ether Runway Presentation', description: 'Unveiling zero-waste couture silhouettes against live digital scenography.' },
      { time: '21:30', title: 'Afterparty & Installation Gallery Tour', description: 'Mingle with designers and experience interactive projection-mapping installations.' }
    ]
  };

  // Real-time Countdown Timer
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(galaEvent.date) - +new Date();
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
  }, [galaEvent.date]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const handleBookNow = () => {
    setEvent(galaEvent);
    navigate('/seating');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex-grow flex flex-col relative z-10">
      
      {/* 1. CINEMATIC HERO HEADER */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-margin-mobile md:px-margin-desktop text-center overflow-hidden pt-16">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background z-10"></div>
          <img 
            src={galaEvent.image} 
            alt="Editorial Hero Banner" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-45 scale-102 blur-[1px]"
          />
        </div>

        {/* Hero Title & Countdown Details */}
        <div className="relative z-20 max-w-[850px] flex flex-col items-center select-none">
          <p className="font-label-sm text-[12px] text-primary uppercase tracking-[0.3em] mb-4">
            {settings?.siteName || 'EVENT PRO'} EXCLUSIVE SHOWCASE
          </p>
          <h1 className="font-display-xl text-[46px] md:text-[88px] text-on-surface font-extrabold leading-[1.1] mb-8 tracking-tight">
            THE HAUTE<br/>ETHER GALA
          </h1>

          {/* Luxury Floating Clock */}
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
              Book Passes Now
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('details-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-outline-variant/40 bg-surface-container-low/20 backdrop-blur-md px-14 py-6 rounded font-label-sm text-[14px] uppercase tracking-widest hover:bg-surface-container-highest/40 hover:border-white transition-all"
            >
              Learn Runway Schedule
            </button>
          </div>
        </div>
      </section>

      {/* 2. SHOW DETAILS SECTION */}
      <section id="details-section" className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full relative z-20 border-t border-outline-variant/10">
        <div id="events-section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Show presentation column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="font-label-sm text-[12px] text-primary uppercase tracking-[0.25em] mb-3 block">
              {galaEvent.location} • {galaEvent.venueName}
            </span>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-on-surface font-extrabold leading-tight mb-6 uppercase">
              THE PRESTIGIOUS SHOWCASE
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8">
              {galaEvent.description}
            </p>

            <div className="bg-surface-container/30 border border-outline-variant/15 p-6 rounded-lg select-none">
              <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-3">Event Date & Location</h3>
              <div className="flex items-center gap-4 text-on-surface">
                <span className="material-symbols-outlined text-4xl font-light text-primary">calendar_today</span>
                <div>
                  <p className="font-title-md text-[18px] leading-tight">
                    {new Date(galaEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-widest mt-1">
                    Doors Open at 7:00 PM • Main event starts at 8:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privileges column */}
          <div className="lg:col-span-5 space-y-4 select-none">
            <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">ACCESS LEVELS</h3>
            
            <div className="glass-panel p-5 rounded-lg border-l-4 border-l-primary flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-2xl">stars</span>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-body-md font-semibold text-on-surface">VIP FRONT ROW</h4>
                  <span className="font-title-md text-[16px] text-primary">${galaEvent.pricingTiers?.vip?.price || 450}</span>
                </div>
                <p className="font-body-md text-[12px] text-on-surface-variant">Front row seating, private lounge access, and exclusive gift bags.</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-lg border-l-4 border-l-secondary flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-2xl">workspace_premium</span>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-body-md font-semibold text-on-surface">GOLD EXPOSURE</h4>
                  <span className="font-title-md text-[16px] text-secondary">${galaEvent.pricingTiers?.gold?.price || 250}</span>
                </div>
                <p className="font-body-md text-[12px] text-on-surface-variant">Premium elevation view and complimentary event portfolios.</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-lg border-l-4 border-l-outline flex items-start gap-4">
              <span className="material-symbols-outlined text-outline text-2xl">local_activity</span>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-body-md font-semibold text-on-surface">SILVER ATTIRE</h4>
                  <span className="font-title-md text-[16px] text-on-surface">${galaEvent.pricingTiers?.silver?.price || 150}</span>
                </div>
                <p className="font-body-md text-[12px] text-on-surface-variant">General attendance in rear viewing rows and digital portal access.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-outline-variant/10 pt-16 flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <p className="font-label-sm text-[12px] text-primary uppercase tracking-wider mb-2">The Night flow</p>
            <h3 className="font-title-md text-[24px] uppercase text-on-surface leading-tight font-extrabold">CHRONICLES OF EVENT</h3>
          </div>
          <div className="md:w-2/3 space-y-8 select-none">
            {galaEvent.schedule && galaEvent.schedule.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start relative group">
                <div className="flex flex-col items-center">
                  <span className="w-10 h-10 rounded-full border border-primary/30 bg-primary/5 flex items-center justify-center font-display-xl text-[12px] text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                    {item.time}
                  </span>
                  {idx < galaEvent.schedule.length - 1 && (
                    <div className="w-[1px] h-12 bg-outline-variant/20 mt-2"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-body-md font-semibold text-on-surface mb-0.5">{item.title}</h4>
                  <p className="font-body-md text-[13px] text-on-surface-variant">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FINAL ACTION BUTTON ANCHOR */}
      <section className="py-16 text-center select-none relative z-20 bg-surface-container/20 border-t border-b border-outline-variant/10">
        <h3 className="font-title-md text-[26px] text-on-surface italic mb-4">Are you ready to witness the experience?</h3>
        <button 
          onClick={handleBookNow}
          className="bg-primary text-on-primary px-16 py-7 rounded font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_8px_32px_rgba(221,186,238,0.25)]"
        >
          Secure Your Access Pass
        </button>
      </section>

      {/* Subtle glowing elements */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <div className="absolute top-[30%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(72,45,88,0.12)_0%,transparent_70%)] blur-[80px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(82,61,109,0.1)_0%,transparent_70%)] blur-[80px]"></div>
      </div>
    </div>
  );
};

export default LandingPage;
