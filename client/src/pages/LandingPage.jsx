import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';



/* Reusable centered section heading */
const SectionHeading = ({ children }) => (
  <div style={{ textAlign: 'center', marginBottom: 40 }}>
    <div className="section-eyebrow"><span>{children}</span></div>
  </div>
);

const Countdown = ({ targetDate, vi }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
      <div className="container" style={{ width: '100%', paddingBottom: 'clamp(4px, 1.5vw, 12px)', marginBottom: 'clamp(8px, 2vw, 24px)' }}>
        <div className="section-eyebrow" style={{ marginBottom: 0, width: '100%' }}>
          <span className="gradient-title-hero" style={{ fontSize: 'clamp(18px, 4vw, 28px)', letterSpacing: '.05em', textTransform: 'uppercase', color: 'transparent', WebkitTextFillColor: 'transparent', textAlign: 'center', lineHeight: 1.4 }}>
            {vi ? 'Cơ hội có mặt tại đêm diễn chỉ còn' : 'Time left to join the show'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', justifyContent: 'center' }}>
        {[
          { label: vi ? 'Ngày' : 'Days', value: timeLeft.days },
          { label: vi ? 'Giờ' : 'Hours', value: timeLeft.hours },
          { label: vi ? 'Phút' : 'Minutes', value: timeLeft.minutes },
          { label: vi ? 'Giây' : 'Seconds', value: timeLeft.seconds },
        ].map((unit, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 'clamp(56px, 12vw, 76px)',
              height: 'clamp(64px, 13vw, 84px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(70,69,215,.15), rgba(168,150,246,.08))',
              border: '1px solid rgba(168,150,246,.25)',
              boxShadow: 'inset 0 0 20px rgba(168,150,246,.05), 0 8px 32px rgba(0,0,0,.3)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              perspective: '200px'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                zIndex: 2
              }} />
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: 90, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.25 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(24px, 4.5vw, 36px)',
                    fontWeight: 800,
                    fontFamily: '"Inter", sans-serif',
                    color: '#fff',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    textShadow: '0 0 15px rgba(168,150,246,0.6)',
                    zIndex: 1
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>
            <span style={{
              fontSize: 'clamp(10px, 2vw, 12px)',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '.15em',
              fontWeight: 600
            }}>
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = ({ events, setEvent, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const activeEvent = events?.[0] ?? null;

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  useEffect(() => { if (activeEvent) setEvent(activeEvent); }, [activeEvent, setEvent]);

  const handleBook = () => { navigate('/seating'); window.scrollTo(0, 0); };

  const formatPrice = (p) =>
    vi ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + Number(p).toLocaleString('en-US');

  const tiers = activeEvent ? [
    { key: 'standard', accentColor: '#7c6fe0', featured: false },
    { key: 'silver', accentColor: '#5aaddc', featured: false },
    { key: 'vip', accentColor: '#a896f6', featured: true },
  ] : [];

  if (!activeEvent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 48, color: 'var(--purple)' }}>sync</span>
        <p style={{ color: 'var(--muted)', letterSpacing: '.15em', textTransform: 'uppercase', fontSize: 13 }}>
          {vi ? 'Đang tải thông tin sự kiện...' : 'Loading event info...'}
        </p>
      </div>
    );
  }

  /* Formatted time: "19:30 · 22.08.2026" */
  const eventDt = new Date(activeEvent.date);
  const eventTimeLabel =
    eventDt.toLocaleTimeString(vi ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    + ' · '
    + eventDt.toLocaleDateString(vi ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="animate-fade-in" style={{ paddingTop: 96 }}>

      {/* ── 1. HERO ────────────────────────────────────────────── */}
      <section style={{ padding: '36px 0 52px' }}>
        <div className="container lp-hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 420px) 1fr',
          gap: 40,
          alignItems: 'center',
          minHeight: 480,
        }}>

          {/* Col 1 – ĐỘC KV logo image */}
          <div style={{
            borderRadius: 0,
            overflow: 'hidden',
            border: '1px solid rgba(168,150,246,.35)',
            position: 'relative',
            boxShadow: '0 0 60px rgba(100,40,255,.28), 0 0 120px rgba(0,220,200,.10)',
          }}>
            <img
              src="/kv-doc.jpeg"
              alt="ĐỘC – FTU Fashion Show 2026"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(1,1,10,.45) 0%, transparent 55%)' }} />
          </div>

          {/* Col 2 – Title + info chips + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ height: 1, width: 32, background: 'var(--mint)' }} />
              <div style={{ fontSize: 11, color: 'var(--mint)', letterSpacing: '.24em', textTransform: 'uppercase', fontWeight: 600 }}>
                FTU Fashion Show 2026
              </div>
            </div>
            <h1 className="serif" style={{
              fontSize: 'clamp(38px, 5.5vw, 72px)',
              lineHeight: .95,
              margin: '0 0 16px',
              background: 'linear-gradient(135deg, #fff 25%, var(--purple) 60%, var(--mint))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {vi ? 'Mua vé tham dự' : 'Join the show'}<br />
              <em style={{ fontStyle: 'italic' }}>{l(activeEvent.title)}</em>
            </h1>
            <p style={{ color: '#ccc8f0', fontSize: 15, lineHeight: 1.78, margin: '0 0 28px', maxWidth: 480 }}>
              {l(activeEvent.description)}
            </p>

            {/* Info chips */}
            <div className="lp-chips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 30 }}>
              {[
                { icon: 'schedule', label: vi ? 'Thời gian' : 'Time', value: eventTimeLabel },
                { icon: 'location_on', label: vi ? 'Địa điểm' : 'Venue', value: l(activeEvent.venueName) },
              ].map(c => (
                <div key={c.icon} style={{
                  padding: '14px 16px',
                  borderRadius: 0,
                  border: '1px solid rgba(168,150,246,.28)',
                  background: 'rgba(1,1,10,.45)',
                  backdropFilter: 'blur(14px)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--purple)', display: 'block', marginBottom: 5 }}>{c.icon}</span>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>{c.label}</div>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{c.value}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* CTA buttons moved below grid */}
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'clamp(16px, 5vw, 48px)' }}>
          <Countdown targetDate={activeEvent.date} vi={vi} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn-pill btn-radiate" onClick={handleBook} style={{ fontSize: 16, padding: '16px 36px' }}>
              {vi ? 'Đặt vé ngay →' : 'Book Now →'}
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. TICKET TIERS ─────────────────────────────────────── */}
      <section id="event-details" style={{ padding: '40px 0 52px' }}>
        <div className="container">
          <SectionHeading>{vi ? 'Hạng vé' : 'Ticket Tiers'}</SectionHeading>

          <div className="lp-tiers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {tiers.map(({ key, accentColor, featured }) => {
              const tier = activeEvent.pricingTiers?.[key];
              if (!tier) return null;
              return (
                <div
                  key={key}
                  className={`mfc-card${featured ? ' mfc-card-vip' : ''}`}
                  style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}
                >
                  {featured && (
                    <div style={{
                      background: 'linear-gradient(135deg, var(--ultra), var(--purple))',
                      color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
                      padding: '5px 16px', borderRadius: 999, marginBottom: 10
                    }}>
                      {vi ? 'Được ưa chuộng' : 'Most Popular'}
                    </div>
                  )}
                  {!featured && <div style={{ height: 25, marginBottom: 10 }} />}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                    <div style={{ height: 1, width: 30, background: `linear-gradient(to right, transparent, ${accentColor})` }} />
                    <h3 className="serif" style={{ color: accentColor, fontSize: 'clamp(24px, 4vw, 32px)', margin: 0, fontWeight: 700, textShadow: `0 0 15px ${accentColor}40` }}>
                      {l(tier.label)}
                    </h3>
                    <div style={{ height: 1, width: 30, background: `linear-gradient(to left, transparent, ${accentColor})` }} />
                  </div>

                  <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, margin: '0 0 12px', flex: 1 }}>{l(tier.description)}</p>
                  
                  <div className="serif" style={{ fontSize: 40, color: accentColor, margin: '0', fontWeight: 700 }}>
                    {formatPrice(tier.price)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>




      <style>{`
        @media (max-width: 1024px) {
          .lp-hero-grid { grid-template-columns: 1fr 1.4fr !important; }
        }
        @media (max-width: 768px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-tiers-grid { grid-template-columns: 1fr !important; }
          .lp-chips-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
