import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const MFC_FEATURES = [
  { en: 'Training',       vi: 'Đào tạo',            descEn: 'In-depth workshops on MC, fashion, media and stagecraft by expert lecturers.',     descVi: 'Các khóa học chuyên sâu về MC, Kỹ năng, Thời trang và Truyền thông do đội ngũ chuyên gia hướng dẫn.' },
  { en: 'Events',         vi: 'Sự kiện',             descEn: 'Organize and accompany many dynamic events inside and outside the university.',     descVi: 'Tổ chức và đồng hành cùng nhiều sự kiện, talkshow, workshop sôi động trong và ngoài trường.' },
  { en: 'Fashion Show',   vi: 'Fashion Show',        descEn: 'A platform for students to perform and bring creative fashion ideas to life.',      descVi: 'Đạo diễn, tổ chức các fashion show ấn tượng, nơi ý tưởng sáng tạo trở thành hiện thực.' },
  { en: 'Growth',         vi: 'Cơ hội phát triển',  descEn: 'Expand connections, build skills and create a strong foundation for your career.',  descVi: 'Mở rộng kết nối, rèn luyện kỹ năng và tạo bước đệm vững chắc cho sự nghiệp tương lai.' },
];

const WHY_JOIN = [
  { en: 'Quality Network',   vi: 'Kết nối chất lượng',  descEn: 'Meet people with the same passion and learn from creative leaders.',  descVi: 'Gặp gỡ và học hỏi từ những người bạn cùng đam mê và các chuyên gia hàng đầu.' },
  { en: 'Unique Experience',  vi: 'Trải nghiệm độc đáo', descEn: 'Join creative fashion projects and professionally organized events.', descVi: 'Tham gia các dự án sáng tạo và sự kiện thời trang chuyên nghiệp.' },
  { en: 'All-Round Growth',  vi: 'Phát triển toàn diện', descEn: 'Sharpen skills, self-trust and a creative mindset every day.',        descVi: 'Nâng cao kỹ năng, sự tự tin và tư duy sáng tạo mỗi ngày.' },
  { en: 'Be Yourself',       vi: 'Tỏa sáng bản thân',   descEn: 'Affirm your unique mark and shine in your own way.',                  descVi: 'Khẳng định dấu ấn riêng và tỏa sáng theo cách của bạn.' },
];

/* Reusable centered section heading */
const SectionHeading = ({ children }) => (
  <div style={{ textAlign: 'center', marginBottom: 40 }}>
    <div className="section-eyebrow"><span>{children}</span></div>
  </div>
);

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
    { key: 'silver',   accentColor: '#5aaddc', featured: false },
    { key: 'vip',      accentColor: '#a896f6', featured: true  },
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
          gridTemplateColumns: '300px 1fr 260px',
          gap: 28,
          alignItems: 'stretch',
          minHeight: 480,
        }}>

          {/* Col 1 – ĐỘC KV logo image */}
          <div style={{
            borderRadius: 22,
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
            <div style={{ fontSize: 11, color: 'var(--mint)', letterSpacing: '.24em', textTransform: 'uppercase', marginBottom: 12 }}>
              FTU Fashion Show 2026
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
            <div className="lp-chips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 30 }}>
              {[
                { icon: 'schedule',            label: vi ? 'Thời gian' : 'Time',   value: eventTimeLabel },
                { icon: 'location_on',         label: vi ? 'Địa điểm' : 'Venue',   value: l(activeEvent.venueName) },
                { icon: 'confirmation_number', label: vi ? 'Hình thức' : 'Format', value: vi ? 'Vé điện tử' : 'Digital Ticket' },
              ].map(c => (
                <div key={c.icon} style={{
                  padding: '14px 16px',
                  borderRadius: 14,
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

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-pill" onClick={handleBook} style={{ fontSize: 15, padding: '14px 30px' }}>
                {vi ? 'Đặt vé →' : 'Book Now →'}
              </button>
              <button
                className="btn-outline-pill"
                onClick={() => document.getElementById('event-details')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ fontSize: 15, padding: '13px 26px' }}
              >
                {vi ? 'Khám phá sự kiện ✦' : 'Explore Event ✦'}
              </button>
            </div>
          </div>

          {/* Col 3 – 3 vertical model strips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr .8fr', gap: 8, borderRadius: 22, overflow: 'hidden' }}>
            <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(168,150,246,.22)', position: 'relative' }}>
              <img src={activeEvent.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right top', opacity: .75, display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(1,1,10,.55), transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: 9, letterSpacing: '.3em', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>BE UNIQUE</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(168,150,246,.18)' }}>
                <img src={activeEvent.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: .65, display: 'block' }} />
              </div>
              <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(168,150,246,.18)', background: 'linear-gradient(135deg, rgba(70,69,215,.25), rgba(168,150,246,.12))', position: 'relative' }}>
                <img src={activeEvent.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left center', opacity: .45, mixBlendMode: 'luminosity', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 10, right: 0, left: 0, textAlign: 'center', fontSize: 9, letterSpacing: '.3em', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>BE YOU</div>
              </div>
            </div>
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
                  style={{ padding: '30px 26px', display: 'flex', flexDirection: 'column', position: 'relative' }}
                >
                  {featured && (
                    <div style={{
                      position: 'absolute', top: 16, right: 16,
                      background: 'linear-gradient(135deg, var(--ultra), var(--purple))',
                      color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
                      padding: '5px 16px', borderRadius: 999,
                    }}>
                      {vi ? 'Được ưu chọn' : 'Most Popular'}
                    </div>
                  )}
                  <h3 className="serif" style={{ color: '#fff', fontSize: 20, margin: '0 0 8px' }}>{l(tier.label)}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, margin: '0 0 4px', flex: 1 }}>{l(tier.description)}</p>
                  <div className="serif" style={{ fontSize: 40, color: accentColor, margin: '18px 0 20px', fontWeight: 700 }}>
                    {formatPrice(tier.price)}
                  </div>
                  <ul style={{ margin: '0 0 24px', padding: 0, listStyle: 'none', color: '#e6e1ff', fontSize: 13 }}>
                    {[
                      vi ? `Ghế ngồi khu vực ${l(tier.label).toLowerCase()}` : `${l(tier.label)} seating area`,
                      vi ? 'Tham dự chương trình chính' : 'Attend main program',
                      vi ? 'Vé điện tử QR code' : 'Digital QR ticket',
                      ...(featured ? [vi ? 'Quà tặng độc quyền từ BTC' : 'Exclusive gift from organizers'] : []),
                    ].map((item, i) => (
                      <li key={i} style={{ marginBottom: 9, display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span style={{ color: 'var(--mint)', fontWeight: 700, flexShrink: 0 }}>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleBook}
                    className={featured ? 'btn-pill' : 'btn-outline-pill'}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {vi ? 'Chọn vé →' : 'Choose →'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. MFC STRIP ─────────────────────────────────────────── */}
      <section style={{ padding: '16px 0 48px' }}>
        <div className="container">
          <div className="mfc-card lp-mfc-strip" style={{
            padding: '32px 36px',
            display: 'grid',
            gridTemplateColumns: '200px 1fr auto',
            gap: 28,
            alignItems: 'center',
          }}>
            <div style={{
              height: 130, borderRadius: 20,
              background: 'radial-gradient(circle at 30% 40%, rgba(0,230,215,.95), transparent 35%), radial-gradient(circle at 65% 55%, rgba(168,150,246,.95), transparent 38%), radial-gradient(circle at 80% 70%, rgba(255,78,203,.72), transparent 30%), rgba(70,69,215,.2)',
              filter: 'saturate(1.5)',
              boxShadow: '0 0 40px rgba(0,220,200,.2)',
            }} />
            <div>
              <h2 className="serif" style={{
                fontSize: 26, margin: '0 0 10px',
                background: 'linear-gradient(90deg, var(--purple), #fff 55%, var(--mint))',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {vi ? 'MFC là gì?' : 'What is MFC?'}
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.8, fontSize: 14, margin: 0 }}>
                {vi
                  ? 'MFC – MC & Fashion Club của Trường Đại học Ngoại thương là môi trường năng động dành cho những bạn trẻ đam mê thời trang, truyền thông và sự kiện. Chúng tôi kết nối, đào tạo và truyền cảm hứng để mỗi thành viên tự tin tỏa sáng theo cách riêng.'
                  : 'MFC – MC & Fashion Club of Foreign Trade University is a dynamic environment for young people passionate about fashion, media and events. We connect, train and inspire every member to confidently shine their way.'}
              </p>
            </div>
            <button
              className="btn-outline-pill"
              onClick={() => { navigate('/about'); window.scrollTo(0, 0); }}
              style={{ whiteSpace: 'nowrap' }}
            >
              {vi ? 'Tìm hiểu thêm ↗' : 'Learn More ↗'}
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. MFC FEATURES ──────────────────────────────────────── */}
      <section id="mfc-features" style={{ padding: '20px 0 52px' }}>
        <div className="container">
          <SectionHeading>{vi ? 'MFC có gì?' : 'What does MFC offer?'}</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MFC_FEATURES.map((f, idx) => (
              <div key={f.en} className="mfc-card" style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 22 }}>
                {/* Number */}
                <div style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700, letterSpacing: '.08em', flexShrink: 0, minWidth: 28, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                {/* Text */}
                <div style={{ flex: 1 }}>
                  <h3 className="serif" style={{ color: '#fff', fontSize: 18, margin: '0 0 5px' }}>{vi ? f.vi : f.en}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{vi ? f.descVi : f.descEn}</p>
                </div>
                {/* Arrow button */}
                <button
                  onClick={handleBook}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    border: '1px solid rgba(168,150,246,.3)', background: 'rgba(168,150,246,.06)',
                    color: 'var(--mint)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    transition: 'background .2s, border-color .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(158,254,253,.14)'; e.currentTarget.style.borderColor = 'rgba(158,254,253,.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,150,246,.06)'; e.currentTarget.style.borderColor = 'rgba(168,150,246,.3)'; }}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. HIGHLIGHTS ────────────────────────────────────────── */}
      <section style={{ padding: '20px 0 52px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <h2 className="serif" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', color: '#fff', margin: 0 }}>
              {vi ? 'Khoảnh khắc nổi bật' : 'Highlights'}
            </h2>
            <button className="btn-outline-pill btn-pill-sm" onClick={handleBook}>
              {vi ? 'Xem thêm ↗' : 'See More ↗'}
            </button>
          </div>
          <div className="lp-highlights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: 'FTU FASHION SHOW', sub: vi ? 'Sự kiện trình diễn thời trang thường niên, bệ phóng cho người mẫu sinh viên.' : 'Annual fashion show, a launchpad for student models.', pos: 'left top', img: '/sk3.jpg', link: 'https://www.facebook.com/ftufashionshow.mfc' },
              { label: 'MC FIRE',          sub: vi ? 'Cuộc thi tìm kiếm tài năng MC chuyên nghiệp dành cho giới trẻ.' : 'Professional MC talent search contest for the youth.', pos: 'center top', img: '/sk1.jpg', link: 'https://www.facebook.com/mcfire.mfc.ftu' },
              { label: 'JUST ART EXHIBITION', sub: vi ? 'Triển lãm nghệ thuật nơi giao thoa giữa thời trang và sáng tạo.' : 'Art exhibition where fashion and creativity intersect.', pos: 'right top', img: '/sk2.jpg', link: 'https://www.facebook.com/media/set/?set=a.683672377197844&type=3&rdid=cxILwUfkmIZvz9OR&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FFDxkAgr2%2F#' },
            ].map(card => (
              <div key={card.label} className="mfc-card" style={{ height: 218, position: 'relative', overflow: 'hidden', cursor: 'pointer', borderRadius: 18 }}
                onClick={() => window.open(card.link, '_blank')}>
                <img
                  src={card.img}
                  alt={card.label}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: card.pos, opacity: .55, transition: 'opacity .3s' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(1,1,10,.92) 30%, rgba(1,1,10,.08) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                  <h3 className="serif" style={{ color: '#fff', fontSize: 15, margin: '0 0 4px', letterSpacing: '.07em' }}>{card.label}</h3>
                  <p style={{ color: 'rgba(255,255,255,.58)', fontSize: 11, margin: '0 0 10px', lineHeight: 1.4 }}>{card.sub}</p>
                  <span style={{ display: 'inline-flex', width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(255,255,255,.3)', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. WHY JOIN ──────────────────────────────────────────── */}
      <section style={{ padding: '20px 0 52px' }}>
        <div className="container">
          <SectionHeading>{vi ? 'Vì sao bạn nên tham gia?' : 'Why join us?'}</SectionHeading>
          <div className="lp-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {WHY_JOIN.map((w, i) => (
              <div key={w.en} className="mfc-card" style={{ padding: '28px 22px' }}>
                <div style={{ width: 28, height: 2, background: 'linear-gradient(90deg, var(--purple), var(--mint))', marginBottom: 16, borderRadius: 2 }} />
                <h3 className="serif" style={{ color: '#fff', fontSize: 17, margin: '0 0 10px' }}>{vi ? w.vi : w.en}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{vi ? w.descVi : w.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. POLICY STRIP ──────────────────────────────────────── */}
      <section style={{ padding: '0 0 52px' }}>
        <div className="container">
          <div className="lp-policy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: 'sync',    title: vi ? 'Vé không hoàn lại'              : 'Non-refundable',         desc: vi ? 'Vé đã mua không hỗ trợ hoàn, hủy hoặc đổi trả dưới mọi hình thức.'     : 'Tickets once purchased are non-refundable or cancellable.' },
              { icon: 'qr_code', title: vi ? 'Check-in bằng mã QR'            : 'QR Check-in',            desc: vi ? 'Khán giả sử dụng mã QR trên vé điện tử để check-in tại sự kiện.'        : 'Attendees use the QR code on the digital ticket to check-in.' },
              { icon: 'mail',    title: vi ? 'Hỗ trợ qua email và fanpage'     : 'Email & Fanpage Support', desc: vi ? 'Mọi thắc mắc vui lòng liên hệ kênh chính thức của MFC.'                  : 'For questions, contact the official MFC channels.' },
            ].map(p => (
              <div key={p.icon} className="mfc-card" style={{ padding: '22px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'rgba(70,69,215,.14)', border: '1px solid rgba(158,254,253,.22)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--mint)', fontSize: 20 }}>{p.icon}</span>
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 5px' }}>{p.title}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CTA BANNER ────────────────────────────────────────── */}
      <section style={{ padding: '0 0 72px' }}>
        <div className="container">
          <div className="mfc-card" style={{
            padding: '52px 40px', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(70,69,215,.28), rgba(168,150,246,.16))',
            borderColor: 'rgba(168,150,246,.55)',
          }}>
            <h2 className="serif" style={{ fontSize: 'clamp(22px, 4vw, 34px)', color: '#fff', margin: '0 0 12px' }}>
              {vi ? 'Bạn đã sẵn sàng trải nghiệm chưa?' : 'Ready to witness the experience?'}
            </h2>
            <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 15 }}>
              22.08.2026 · {l(activeEvent.venueName)}
            </p>
            <button className="btn-pill" onClick={handleBook} style={{ fontSize: 16, padding: '16px 44px' }}>
              {vi ? 'Sở hữu tấm vé của bạn ✦' : 'Secure Your Pass ✦'}
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .lp-hero-grid { grid-template-columns: 1fr 1.4fr !important; }
          .lp-hero-grid > *:last-child { display: none !important; }
        }
        @media (max-width: 768px) {
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-tiers-grid { grid-template-columns: 1fr !important; }
          .lp-highlights-grid { grid-template-columns: 1fr !important; }
          .lp-why-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-policy-grid { grid-template-columns: 1fr !important; }
          .lp-mfc-strip { grid-template-columns: 1fr !important; }
          .lp-chips-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .lp-highlights-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
