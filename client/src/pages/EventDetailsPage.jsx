import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventDetailsPage = ({ event, setEvent }) => {
  const navigate = useNavigate();
  if (!event) return null;

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      {/* 1. BACK LINK */}
      <div className="mb-8 select-none">
        <button 
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 font-label-sm text-[13px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-[18px]">keyboard_backspace</span>
          Back to Events
        </button>
      </div>

      {/* 2. MAIN HEADER BLOCK */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        {/* Left Side: Editorial Banner */}
        <div className="lg:col-span-7 glass-panel rounded-xl overflow-hidden shadow-2xl relative select-none">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-[450px] object-cover mix-blend-luminosity opacity-85 hover:mix-blend-normal hover:scale-102 hover:opacity-100 transition-all duration-700"
          />
        </div>

        {/* Right Side: Showcase Metadata */}
        <div className="lg:col-span-5 flex flex-col justify-center h-full">
          <span className="font-label-sm text-[12px] text-primary uppercase tracking-[0.2em] mb-3 block">
            {event.location} • {event.venueName}
          </span>
          <h1 className="font-display-xl text-[36px] md:text-[50px] text-on-surface font-extrabold leading-[1.2] mb-6">
            {event.title}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
            {event.description}
          </p>

          <div className="bg-surface-container/30 border border-outline-variant/15 p-6 rounded-lg mb-8 select-none">
            <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-4">Event Date</h3>
            <div className="flex items-center gap-4 text-on-surface">
              <span className="material-symbols-outlined text-3xl font-light text-primary">calendar_today</span>
              <div>
                <p className="font-title-md text-[18px] leading-tight">
                  {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            Select Your Seats
          </button>
        </div>
      </section>

      {/* 3. SCHEDULE & SEAT TIERS DUAL COLUMN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
        {/* Left Side: Timeline */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/20 pb-4">
            THE EVENING SCHEDULE
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
                    {item.title}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant text-[14px]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Access Levels */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <h2 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/20 pb-4">
            TIER PRIVILEGES
          </h2>
          <div className="space-y-4 select-none">
            {/* VIP Tier */}
            <div className="glass-panel p-6 rounded-lg border-l-4 border-l-primary flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl font-light">stars</span>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-body-lg text-body-lg font-semibold text-on-surface">VIP FRONT ROW</h4>
                  <span className="font-title-md text-[18px] text-primary">${event.pricingTiers?.vip?.price || 450}</span>
                </div>
                <p className="font-body-md text-[13px] text-on-surface-variant">Front row access, backstage lounge, and premium gift bag.</p>
              </div>
            </div>

            {/* Gold Tier */}
            <div className="glass-panel p-6 rounded-lg border-l-4 border-l-secondary flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-3xl font-light">workspace_premium</span>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-body-lg text-body-lg font-semibold text-on-surface">GOLD EXPOSURE</h4>
                  <span className="font-title-md text-[18px] text-secondary">${event.pricingTiers?.gold?.price || 250}</span>
                </div>
                <p className="font-body-md text-[13px] text-on-surface-variant">Elevated views and event portfolio booklet.</p>
              </div>
            </div>

            {/* Silver Tier */}
            <div className="glass-panel p-6 rounded-lg border-l-4 border-l-outline flex items-start gap-4">
              <span className="material-symbols-outlined text-outline text-3xl font-light">local_activity</span>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-body-lg text-body-lg font-semibold text-on-surface">SILVER ATTIRE</h4>
                  <span className="font-title-md text-[18px] text-on-surface">${event.pricingTiers?.silver?.price || 150}</span>
                </div>
                <p className="font-body-md text-[13px] text-on-surface-variant">Standard access to rear viewing rows.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetailsPage;
