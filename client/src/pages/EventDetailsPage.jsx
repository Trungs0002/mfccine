import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const EventDetailsPage = ({ event, setEvent }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  if (!event) return null;

  const TIER_COLORS = { vip: '#a896f6', premium: '#5aaddc', standard: '#10b981' };
  const formatPrice = (p) => vi ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + p;

  return (
    <div style={{ paddingTop: 120, paddingBottom: 64 }} className="animate-fade-in">
      <div className="container">


        {/* Hero */}
        <div className="event-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start', marginBottom: 48 }}>
          <div className="mfc-card" style={{ overflow: 'hidden', padding: 0 }}>
            <img src={event.image} alt="Event" style={{ width: '100%', height: 400, objectFit: 'cover', opacity: .85, display: 'block' }} />
          </div>

          <div>
            <span style={{ fontSize: 12, color: 'var(--mint)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 10, display: 'block' }}>
              {l(event.location)} · {l(event.venueName)}
            </span>
            <h1 className="gradient-title-hero" style={{ fontSize: 'clamp(40px, 6vw, 72px)', margin: '0 0 16px', lineHeight: .9, fontWeight: 700 }}>
              {l(event.title)}
            </h1>
            <p style={{ color: '#e0dbff', fontSize: 16, lineHeight: 1.75, marginBottom: 28 }}>
              {l(event.description)}
            </p>

            {/* Date card */}
            <div className="mfc-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--purple)', fontSize: 32 }}>calendar_today</span>
              <div>
                <h4 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>
                  {new Date(event.date).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {vi ? 'Cửa mở 19:00 · Bắt đầu 19:30' : 'Doors 7PM · Show 7:30PM'}
                </p>
              </div>
            </div>

            <button
              className="btn-pill"
              style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '16px 20px' }}
              onClick={() => { setEvent(event); navigate('/seating'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              {vi ? 'Chọn chỗ ngồi →' : 'Select Your Seats →'}
            </button>
          </div>
        </div>

        {/* Schedule + Tiers */}
        <div className="event-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Schedule */}
          <div>
            <h2 className="gradient-title" style={{ fontSize: 22, marginBottom: 20 }}>
              {vi ? 'Lịch trình đêm hội' : 'Evening Schedule'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {event.schedule?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', paddingBottom: 24 }}>
                  {/* Timeline line */}
                  {idx < event.schedule.length - 1 && (
                    <div style={{ position: 'absolute', left: 22, top: 44, width: 1, height: 'calc(100% - 20px)', background: 'rgba(168,150,246,.25)' }} />
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(168,150,246,.4)', background: 'rgba(70,69,215,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Georgia, serif', fontSize: 12, color: 'var(--purple)', fontWeight: 700 }}>
                    {item.time}
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{l(item.title)}</h4>
                    <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{l(item.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tiers */}
          <div>
            <h2 className="gradient-title" style={{ fontSize: 22, marginBottom: 20 }}>
              {vi ? 'Hạng vé' : 'Ticket Tiers'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['vip', 'premium', 'standard'].map(key => {
                const tier = event.pricingTiers?.[key];
                if (!tier) return null;
                const color = TIER_COLORS[key];
                return (
                  <div key={key} className="mfc-card" style={{ padding: '16px 20px', borderLeft: `3px solid ${color}`, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span className="material-symbols-outlined" style={{ color, fontSize: 28 }}>
                      {key === 'vip' ? 'stars' : key === 'premium' ? 'workspace_premium' : 'confirmation_number'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#fff', fontSize: 15, fontWeight: 700, margin: '0 0 2px' }}>{l(tier.label)}</h4>
                      <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0 }}>{l(tier.description)}</p>
                    </div>
                    <span className="serif" style={{ color, fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{formatPrice(tier.price)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:900px){
        .event-hero-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        .event-info-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
      }`}</style>
    </div>
  );
};

export default EventDetailsPage;
