import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const VISION = [
  {
    vi: 'Kết nối',
    en: 'Connect',
    descVi: 'Xây dựng cộng đồng sinh viên năng động, cởi mở và gắn kết, nơi mọi ý tưởng đều được lắng nghe và trân trọng.',
    descEn: 'Build a dynamic, open and bonded student community where every idea is heard and valued.',
  },
  {
    vi: 'Sáng tạo',
    en: 'Create',
    descVi: 'Khơi nguồn cảm hứng và khuyến khích sự sáng tạo trong lĩnh vực MC, thời trang, truyền thông và nghệ thuật.',
    descEn: 'Inspire and encourage creativity in MC, fashion, media and the arts.',
  },
  {
    vi: 'Phát triển',
    en: 'Grow',
    descVi: 'Trang bị kiến thức, kỹ năng và trải nghiệm thực tế để sinh viên tự tin phát triển và sẵn sàng bứt phá trong tương lai.',
    descEn: 'Equip students with knowledge, skills and real experience to grow and break through.',
  },
];

const SPECIAL = [
  {
    vi: 'Đào tạo bài bản',
    en: 'Structured Training',
    descVi: 'Các khóa học chuyên sâu về MC, Thời trang, Truyền thông và kỹ năng mềm do đội ngũ giàu kinh nghiệm trực tiếp giảng dạy.',
    descEn: 'In-depth courses on MC, Fashion, Media and soft skills taught by experienced practitioners.',
  },
  {
    vi: 'Sự kiện chất lượng',
    en: 'Quality Events',
    descVi: 'Tổ chức nhiều sự kiện, talkshow, workshop và cuộc thi sáng tạo, quy mô bài bản và chuyên nghiệp.',
    descEn: 'Organise events, talkshows, workshops and creative contests at a professional scale.',
  },
  {
    vi: 'Fashion Show đẳng cấp',
    en: 'Premium Fashion Show',
    descVi: 'Tổ chức các fashion show ấn tượng, là sân chơi để sinh viên thể hiện cá tính và khẳng định chất riêng.',
    descEn: 'Stage impressive fashion shows — the playground for students to express their identity.',
  },
  {
    vi: 'Cộng đồng truyền cảm hứng',
    en: 'Inspiring Community',
    descVi: 'Môi trường cởi mở, thân thiện, luôn sẵn sàng đồng hành và truyền cảm hứng để bạn trở thành phiên bản tốt nhất của chính mình.',
    descEn: 'An open, friendly environment that accompanies and inspires you to become your best self.',
  },
];

const TIMELINE = [
  {
    year: '2018',
    vi: 'Khởi nguồn',
    en: 'Founded',
    descVi: 'MFC được thành lập bởi các sinh viên đam mê thời trang, với mong muốn tạo ra một sân chơi sáng tạo và kết nối cộng đồng.',
    descEn: 'MFC was founded by fashion-passionate students to create a creative playground and community.',
  },
  {
    year: '2020',
    vi: 'Những bước đầu',
    en: 'First Steps',
    descVi: 'Tổ chức các workshop, talkshow và mini show đầu tiên, thu hút sự quan tâm của đông đảo sinh viên trong và ngoài trường.',
    descEn: 'Organised first workshops, talkshows and mini shows, attracting wide student interest.',
  },
  {
    year: '2022',
    vi: 'Mở rộng hoạt động',
    en: 'Expansion',
    descVi: 'MFC mở rộng quy mô, đa dạng hóa các hoạt động chuyên môn, đồng hành cùng nhiều đối tác và thương hiệu uy tín.',
    descEn: 'MFC scaled up, diversified professional activities and partnered with reputable brands.',
  },
  {
    year: '2024',
    vi: 'Khẳng định dấu ấn',
    en: 'Established',
    descVi: 'Tổ chức thành công các sự kiện lớn, để lại dấu ấn mạnh mẽ trong cộng đồng thời trang sinh viên khu vực phía Bắc.',
    descEn: 'Successfully hosted major events, making a strong mark in the northern student fashion scene.',
  },
  {
    year: '2026',
    vi: 'Hướng tới tương lai',
    en: 'The Future',
    descVi: 'Tiếp tục đổi mới, nâng tầm trải nghiệm và khẳng định vị thế của MFC trong bản đồ thời trang sinh viên dẫn đầu trong sinh viên.',
    descEn: 'Continue innovating, elevating the experience and solidifying MFC as a leading student fashion force.',
  },
];

const CORE_VALUES = [
  { vi: 'Bản sắc', en: 'Identity', descVi: 'Tôn vinh cá tính riêng và bản sắc thời trang độc đáo của mỗi thành viên.', descEn: 'Celebrate the unique identity and fashion style of every member.' },
  { vi: 'Kỷ luật', en: 'Discipline', descVi: 'Đề cao tinh thần trách nhiệm, chuyên nghiệp và cam kết trong mọi hoạt động.', descEn: 'Uphold responsibility, professionalism and commitment in all activities.' },
  { vi: 'Sáng tạo', en: 'Creativity', descVi: 'Không ngừng đổi mới, khuyến khích tư duy sáng tạo và dám khác biệt trong thời trang.', descEn: 'Never stop innovating, encouraging creative thinking and bold differentiation.' },
  { vi: 'Kết nối', en: 'Connection', descVi: 'Xây dựng cộng đồng gắn kết, lan tỏa giá trị tích cực và tạo nên những mối liên kết bền vững.', descEn: 'Build a cohesive community, spread positive values and forge lasting bonds.' },
];

const HIGHLIGHTS = [
  { label: 'WORKSHOP',     descVi: 'Kết nối tri thức – Khơi nguồn cảm hứng',    descEn: 'Connect knowledge – Inspire creativity',   pos: 'left center' },
  { label: 'TRAINING',     descVi: 'Trang bị kỹ năng – Tự tin tỏa sáng',        descEn: 'Build skills – Shine with confidence',     pos: 'center center' },
  { label: 'FASHION SHOW', descVi: 'Sân khấu tỏa sáng – Dấu ấn khác biệt',     descEn: 'Shine on stage – Leave your mark',         pos: 'right center' },
];

const AboutPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  return (
    <div className="animate-fade-in" style={{ paddingTop: 96, paddingBottom: 64 }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding: '48px 0 40px' }}>
        <div className="container about-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          {/* KV image left */}
          <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', border: '1px solid var(--line)', minHeight: 420 }}>
            <img
              src="/kv-doc.jpeg"
              alt="ĐỘC key visual"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .75, display: 'block', minHeight: 420 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(70,69,215,.35), rgba(1,1,10,.5))' }} />
            <div style={{ position: 'absolute', bottom: 28, left: 28 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 72, color: '#fff', lineHeight: 1, textShadow: '0 0 32px rgba(168,150,246,.7)', opacity: .9 }}>ĐỘC</div>
              <div style={{ fontSize: 12, letterSpacing: '.2em', color: 'var(--mint)', textTransform: 'uppercase', marginTop: 6 }}>FTU Fashion Show 2026</div>
            </div>
          </div>

          {/* Text right */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--mint)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 10 }}>
              {vi ? 'Giới thiệu' : 'About'}
            </div>
            <h1 className="gradient-title-hero" style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.05, margin: '0 0 20px', fontWeight: 700 }}>
              {vi ? 'MFC là gì?' : 'What is MFC?'}
            </h1>
            <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg, var(--purple), var(--mint))', marginBottom: 20 }} />
            <p style={{ color: '#e0dbff', fontSize: 16, lineHeight: 1.85, margin: '0 0 32px' }}>
              {vi
                ? 'MFC – MC & Fashion Club là câu lạc bộ sinh viên trực thuộc Trường Đại học Ngoại thương, nơi hội tụ những bạn trẻ đam mê Ngôn ngữ, MC, Thời trang, Truyền thông và Sáng tạo. Chúng tôi tin rằng mỗi cá nhân đều có một bản sắc riêng và MFC chính là nơi giúp bạn khám phá, phát triển bản thân và tỏa sáng theo cách của riêng mình.'
                : 'MFC – MC & Fashion Club is a student club affiliated with Foreign Trade University, a gathering place for young people passionate about Languages, MC, Fashion, Media and Creativity. We believe every individual has a unique identity, and MFC is the place to help you explore, develop and shine in your own way.'}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-pill" onClick={() => { navigate('/seating'); window.scrollTo(0, 0); }}>
                {vi ? 'Mua vé ngay ✦' : 'Get Tickets ✦'}
              </button>
              <button className="btn-outline-pill" onClick={() => { navigate('/recruit'); window.scrollTo(0, 0); }}>
                {vi ? 'Tham gia MFC →' : 'Join MFC →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION ───────────────────────────────────────────── */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 32 }}>
            <span>{vi ? 'Tầm nhìn và sứ mệnh' : 'Vision & Mission'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {VISION.map((v, i) => (
              <div key={v.vi} className="mfc-card" style={{ padding: '28px 26px' }}>
                <div style={{ width: 32, height: 2, background: 'linear-gradient(90deg, var(--purple), var(--mint))', marginBottom: 18, borderRadius: 2 }} />
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: '0 0 10px' }}>{vi ? v.vi : v.en}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>{vi ? v.descVi : v.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIAL ──────────────────────────────────────────── */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 32 }}>
            <span>{vi ? 'MFC có gì đặc biệt?' : 'What makes MFC special?'}</span>
          </div>
          <div className="about-special" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {SPECIAL.map((s, i) => (
              <div key={s.vi} className="mfc-card" style={{ padding: '26px 22px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, color: 'var(--purple)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 600 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="serif" style={{ color: '#fff', fontSize: 18, margin: '0 0 8px' }}>{vi ? s.vi : s.en}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{vi ? s.descVi : s.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────── */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 40 }}>
            <span>{vi ? 'Hành trình hình thành MFC' : 'MFC\'s Journey'}</span>
          </div>

          {/* Timeline bar */}
          <div style={{ position: 'relative', overflowX: 'auto', paddingBottom: 8 }}>
            {/* Connector line */}
            <div className="about-timeline-connector" style={{
              position: 'absolute', left: '4%', right: '4%', top: 36, height: 2,
              background: 'linear-gradient(90deg, transparent, var(--purple), var(--mint), var(--purple), transparent)',
              boxShadow: '0 0 16px var(--purple)',
            }} />

            <div className="about-timeline" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '84px 16px', position: 'relative', paddingTop: 76 }}>
              {TIMELINE.map((t, i) => (
                <div key={t.year} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', top: -46, left: '50%', transform: 'translateX(-50%)',
                    width: 14, height: 14, borderRadius: '50%',
                    background: 'var(--purple)', boxShadow: '0 0 18px var(--purple)',
                  }} />
                  {/* Year label */}
                  <div style={{
                    position: 'absolute', top: -74, left: '50%', transform: 'translateX(-50%)',
                    fontFamily: 'Georgia, serif', fontSize: 16, color: '#fff', whiteSpace: 'nowrap',
                  }}>
                    {t.year}
                  </div>

                  <div className="mfc-card" style={{ padding: '22px 18px' }}>
                    <h4 className="serif" style={{ color: '#fff', fontSize: 16, margin: '0 0 8px' }}>{vi ? t.vi : t.en}</h4>
                    <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.65, margin: 0 }}>{vi ? t.descVi : t.descEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ──────────────────────────────────────── */}
      <section style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 32 }}>
            <span>{vi ? 'Giá trị cốt lõi' : 'Core Values'}</span>
          </div>
          <div className="about-values" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {CORE_VALUES.map((c, i) => (
              <div key={c.vi} className="mfc-card" style={{ padding: '26px 22px' }}>
                <div style={{ width: 24, height: 2, background: 'linear-gradient(90deg, var(--mint), var(--purple))', marginBottom: 16, borderRadius: 2 }} />
                <h3 className="serif" style={{ color: '#fff', fontSize: 18, margin: '0 0 8px' }}>{vi ? c.vi : c.en}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{vi ? c.descVi : c.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS ───────────────────────────────────────── */}
      <section style={{ padding: '56px 0 64px' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 32 }}>
            <span>{vi ? 'Dấu mốc nổi bật' : 'Highlights'}</span>
          </div>
          <div className="about-highlights" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {HIGHLIGHTS.map(card => (
              <div
                key={card.label}
                className="mfc-card"
                style={{ minHeight: 240, position: 'relative', overflow: 'hidden', borderRadius: 20, cursor: 'pointer' }}
                onClick={() => { navigate('/seating'); window.scrollTo(0, 0); }}
              >
                <img
                  src="/kv-doc.jpeg"
                  alt={card.label}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: card.pos, opacity: .6 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(1,1,10,.9) 35%, transparent)' }} />
                <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22 }}>
                  <h3 className="serif" style={{ color: '#fff', fontSize: 20, margin: '0 0 5px' }}>{card.label}</h3>
                  <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 13, margin: '0 0 12px' }}>{vi ? card.descVi : card.descEn}</p>
                  <span style={{ display: 'inline-flex', width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,.4)', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .about-hero-grid { grid-template-columns: 1fr !important; }
          .about-special { grid-template-columns: 1fr 1fr !important; }
          .about-timeline { grid-template-columns: 1fr 1fr !important; }
          .about-values { grid-template-columns: 1fr 1fr !important; }
          .about-highlights { grid-template-columns: 1fr !important; }
          .about-timeline-connector { display: none !important; }
        }
        @media (max-width: 600px) {
          .about-special { grid-template-columns: 1fr !important; }
          .about-values { grid-template-columns: 1fr !important; }
          .about-timeline { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
