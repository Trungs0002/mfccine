import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';



/* Reusable centered section heading */
const SectionHeading = ({ children }) => (
  <div style={{ textAlign: 'center', marginBottom: 40 }}>
    <div className="section-eyebrow" style={{ margin: '0 auto', width: '100%', padding: '0 16px' }}>
      <span className="gradient-title-hero" style={{ fontSize: 'clamp(28px, 7vw, 48px)', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'transparent', WebkitTextFillColor: 'transparent' }}>
        {children}
      </span>
    </div>
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
    Number(p).toLocaleString('vi-VN') + (vi ? 'đ' : ' VND');

  const tiers = activeEvent ? [
    { key: 'standard', accentColor: '#10b981', featured: false },
    { key: 'premium', accentColor: '#5aaddc', featured: false },
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
                <motion.div
                  key={key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: 'linear-gradient(135deg, rgba(40,40,55,0.85), rgba(20,20,30,0.95))',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: featured ? `4px solid ${accentColor}` : `3px solid ${accentColor}`,
                    borderRadius: 24,
                    WebkitMaskImage: 'radial-gradient(circle at 0px calc(100% - 100px), transparent 14px, black 15px), radial-gradient(circle at 100% calc(100% - 100px), transparent 14px, black 15px)',
                    WebkitMaskSize: '51% 100%',
                    WebkitMaskPosition: '0 0, 100% 0',
                    WebkitMaskRepeat: 'no-repeat',
                    overflow: 'hidden',
                    boxShadow: featured ? `0 20px 80px ${accentColor}60, 0 0 30px ${accentColor}40` : `0 15px 40px ${accentColor}40`,
                    zIndex: featured ? 2 : 1,
                  }}
                >
                  {/* Glowing Highlight */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: '100%',
                    background: featured ? `radial-gradient(circle at 50% 0%, ${accentColor}70 0%, transparent 80%)` : `radial-gradient(circle at 50% 0%, ${accentColor}35 0%, transparent 60%)`,
                    pointerEvents: 'none',
                  }} />
                  {featured && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0, height: '50%',
                      background: `radial-gradient(circle at 50% 100%, ${accentColor}40 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }} />
                  )}

                  {/* Top Section */}
                  <div style={{ padding: '16px 20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1, position: 'relative' }}>
                    <h3 className="serif" style={{ color: accentColor, fontSize: 'clamp(26px, 5vw, 32px)', margin: '0 0 8px', fontWeight: 700, textShadow: `0 0 25px ${accentColor}60` }}>
                      {l(tier.label)}
                    </h3>

                    <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.4, margin: '0' }}>{l(tier.description)}</p>
                  </div>

                  {/* Dashed Line separator */}
                  <div style={{ position: 'relative', width: '100%', height: 0 }}>
                    <div style={{ position: 'absolute', top: -1, left: 20, right: 20, borderTop: `3px dashed ${accentColor}80` }} />
                  </div>

                  {/* Bottom Section (Stub) */}
                  <div style={{ height: 100, padding: '20px 24px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)' }}>
                    {/* Price */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
                        {vi ? 'Giá vé' : 'Price'}
                      </span>
                      <div className="serif" style={{ fontSize: settings?.ticketSalesEnabled === false ? 18 : 32, color: '#fff', margin: '0', fontWeight: 700 }}>
                        {settings?.ticketSalesEnabled === false ? (vi ? 'Sắp công bố' : 'Coming Soon') : formatPrice(tier.price)}
                      </div>
                    </div>

                    {/* Barcode */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0.8 }}>
                      <div style={{ display: 'flex', gap: 3, height: 44, alignItems: 'center' }}>
                        {[2, 5, 2, 7, 3, 2, 8, 4, 2, 2, 5, 6].map((w, i) => (
                          <div key={i} style={{ width: w, height: '100%', background: accentColor }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA VẪN CÒN PHÂN VÂN ─────────────────────────────── */}
      <section className="relative z-10" style={{ padding: '20px 0 100px' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="cta-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'linear-gradient(135deg, rgba(20,20,30,0.8), rgba(30,30,45,0.9))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 32,
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.05)',
              position: 'relative'
            }}
          >
            {/* Background Glow */}
            <div style={{
              position: 'absolute', top: '50%', left: '25%', transform: 'translate(-50%, -50%)',
              width: '400px', height: '400px',
              background: 'radial-gradient(circle, var(--purple) 0%, transparent 60%)',
              opacity: 0.15, pointerEvents: 'none', zIndex: 0
            }} />

            {/* Content Side */}
            <div className="cta-content" style={{ padding: '64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
              <div>

                <h2 className="gradient-title-hero" style={{ fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
                  {vi ? 'Vẫn còn phân vân?' : 'Discover the story behind the show'}
                </h2>

                <p style={{ color: 'var(--muted)', fontSize: 'clamp(15px, 1.5vw, 16px)', lineHeight: 1.6, margin: '0 0 32px' }}>
                  {vi
                    ? 'Khám phá thêm về MFC FTU và hành trình đứng sau những sân khấu thời trang, nghệ thuật và dẫn chương trình trước khi chọn tấm vé đồng hành cùng đêm diễn.'
                    : 'Want to know more about the Organizing Committee and the silent efforts to create a grand stage? Discover our journey and dedication.'}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { navigate('/about'); window.scrollTo(0, 0); }}
                  className="btn-pill"
                  style={{
                    padding: '14px 32px',
                    fontSize: 15,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--purple)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 10px 20px rgba(168,150,246,0.3)'
                  }}
                >
                  {vi ? 'Khám phá MFC' : 'About the Organizers'}
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </motion.button>
              </div>
            </div>

            {/* Image Side */}
            <div className="cta-image" style={{ position: 'relative', minHeight: 400 }}>
              <img
                src="/Thumbnail pts (1).png"
                alt="About us"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Overlay shadow to blend with the card */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(to right, rgba(20,20,30,1) 0%, rgba(20,20,30,0) 30%)',
                pointerEvents: 'none'
              }} className="cta-image-overlay" />
            </div>
          </motion.div>
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
          .cta-grid { grid-template-columns: 1fr !important; }
          .cta-content { padding: 40px 24px !important; }
          .cta-image { min-height: 250px !important; }
          .cta-image-overlay { background: linear-gradient(to bottom, rgba(20,20,30,1) 0%, rgba(20,20,30,0) 40%) !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
