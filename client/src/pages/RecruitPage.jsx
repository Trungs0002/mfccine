import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const TEAMS = [
  { vi: 'Truyền thông',   en: 'Media',       descVi: 'Lên ý tưởng, xây dựng nội dung và lan tỏa hình ảnh chương trình.',             descEn: 'Develop ideas, create content and spread the program\'s image.' },
  { vi: 'Hậu cần',        en: 'Logistics',    descVi: 'Đảm bảo vận hành sự kiện trơn tru, từ hậu cần đến logistics.',                descEn: 'Ensure smooth event operations from backstage logistics to delivery.' },
  { vi: 'Đối ngoại',      en: 'Partnership',  descVi: 'Kết nối nhà tài trợ, đối tác và mở rộng hợp tác.',                            descEn: 'Connect sponsors, partners and expand collaborations.' },
  { vi: 'Sân khấu',       en: 'Stage',        descVi: 'Phụ trách dàn dựng, kỹ thuật và không gian sân khấu.',                        descEn: 'Responsible for staging, technical setup and stage space.' },
  { vi: 'Nội dung',       en: 'Content',      descVi: 'Sáng tạo concept, lịch bản và nội dung chương trình.',                        descEn: 'Create concepts, scripts and program content.' },
  { vi: 'Thiết kế',       en: 'Design',       descVi: 'Thiết kế ấn phẩm, nhận diện và visual cho sự kiện.',                          descEn: 'Design publications, branding and visuals for the event.' },
];

const BENEFITS = [
  { vi: 'Trải nghiệm thực tế',    en: 'Real Experience',      descVi: 'Trực tiếp tham gia tổ chức một fashion show quy mô lớn.',        descEn: 'Directly participate in organising a large-scale fashion show.' },
  { vi: 'Mở rộng kết nối',        en: 'Expand Network',       descVi: 'Kết nối với anh chị đi trước, đối tác và cộng đồng sáng tạo.',  descEn: 'Connect with seniors, partners and the creative community.' },
  { vi: 'Rèn luyện kỹ năng',      en: 'Build Skills',         descVi: 'Phát triển kỹ năng chuyên môn và kỹ năng mềm toàn diện.',       descEn: 'Develop professional and comprehensive soft skills.' },
  { vi: 'Chứng nhận hoạt động',   en: 'Activity Certificate', descVi: 'Nhận giấy chứng nhận từ MFC & FTU sau khi hoàn thành.',         descEn: 'Receive a certificate from MFC & FTU upon completion.' },
];

const REQUIREMENTS = [
  { vi: 'Chủ động',                        en: 'Self-motivated' },
  { vi: 'Có trách nhiệm',                  en: 'Responsible' },
  { vi: 'Sẵn sàng làm việc nhóm',          en: 'Team-oriented' },
  { vi: 'Quan tâm đến thời trang và sự kiện', en: 'Interested in fashion and events' },
];

const MILESTONES = [
  { num: '01', vi: 'Mở đơn',          en: 'Applications Open', date: '10/05 – 25/05/2026' },
  { num: '02', vi: 'Phỏng vấn',       en: 'Interviews',        date: '26/05 – 02/06/2026' },
  { num: '03', vi: 'Công bố kết quả', en: 'Results Announced', date: '03/06/2026' },
  { num: '04', vi: 'Training',         en: 'Training',          date: '07/06 – 14/06/2026' },
];

const EMPTY_FORM = { name: '', class: '', phone: '', email: '', team: '', intro: '' };

const RecruitPage = () => {
  const { language } = useLanguage();
  const vi = language === 'vi';
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="animate-fade-in" style={{ paddingTop: 96, paddingBottom: 64 }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ padding: '48px 0 40px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--mint)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 10 }}>
              {vi ? 'Cộng tác viên · ĐỘC FTU Fashion Show 2026' : 'Collaborate · ĐỘC FTU Fashion Show 2026'}
            </div>
            <h1 className="gradient-title-hero" style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.05, margin: '0 0 20px', fontWeight: 700 }}>
              {vi ? 'Tuyển cộng tác viên' : 'Join Our Team'}
            </h1>
            <p style={{ color: '#e0dbff', fontSize: 16, lineHeight: 1.85, maxWidth: 520, margin: '0 0 32px' }}>
              {vi
                ? 'Tham gia cùng MFC để đồng hành trong quá trình tổ chức một fashion show sáng tạo, chuyên nghiệp và giàu dấu ấn.'
                : 'Join MFC to be part of organising a creative, professional and impactful fashion show.'}
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                className="btn-pill"
                onClick={() => document.getElementById('recruit-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {vi ? 'Đăng ký ngay →' : 'Apply Now →'}
              </button>
              <button
                className="btn-outline-pill"
                onClick={() => document.getElementById('recruit-teams')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {vi ? 'Xem mô tả công việc →' : 'See Job Descriptions →'}
              </button>
            </div>
          </div>

          {/* KV right */}
          <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', border: '1px solid var(--line)', minHeight: 420 }}>
            <img src="/kv-doc.jpeg" alt="ĐỘC" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .7, display: 'block', minHeight: 420 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(70,69,215,.3), rgba(1,1,10,.55))' }} />
            <div style={{ position: 'absolute', bottom: 28, right: 28, textAlign: 'right' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 56, color: '#fff', lineHeight: 1, textShadow: '0 0 28px rgba(168,150,246,.7)' }}>ĐỘC</div>
              <div style={{ fontSize: 11, letterSpacing: '.2em', color: 'var(--mint)', textTransform: 'uppercase', marginTop: 4 }}>FTU FASHION SHOW 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAMS ────────────────────────────────────────────── */}
      <section id="recruit-teams" style={{ padding: '56px 0' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 32 }}>
            <span>{vi ? 'Các ban tuyển' : 'Departments'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
            {TEAMS.map((t, i) => (
              <div key={t.vi} className="mfc-card" style={{ padding: '22px 18px' }}>
                <div style={{ fontSize: 11, color: 'var(--purple)', letterSpacing: '.18em', fontWeight: 600, marginBottom: 10 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="serif" style={{ color: '#fff', fontSize: 16, margin: '0 0 8px' }}>{vi ? t.vi : t.en}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{vi ? t.descVi : t.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS + REQUIREMENTS + FORM ───────────────────── */}
      <section style={{ padding: '40px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>
          {/* Left */}
          <div>
            <div className="section-eyebrow" style={{ justifyContent: 'flex-start', marginBottom: 24 }}>
              <span>{vi ? 'Quyền lợi khi tham gia' : 'Benefits'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
              {BENEFITS.map((b, i) => (
                <div key={b.vi} className="mfc-card" style={{ padding: '20px 22px' }}>
                  <div style={{ width: 24, height: 2, background: 'linear-gradient(90deg, var(--purple), var(--mint))', marginBottom: 12, borderRadius: 2 }} />
                  <h4 className="serif" style={{ color: '#fff', fontSize: 16, margin: '0 0 6px' }}>{vi ? b.vi : b.en}</h4>
                  <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.65, margin: 0 }}>{vi ? b.descVi : b.descEn}</p>
                </div>
              ))}
            </div>

            <div className="section-eyebrow" style={{ justifyContent: 'flex-start', marginBottom: 20 }}>
              <span>{vi ? 'Yêu cầu ứng tuyển' : 'Requirements'}</span>
            </div>
            <div className="mfc-card" style={{ padding: '24px 28px' }}>
              {REQUIREMENTS.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < REQUIREMENTS.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <span style={{ color: 'var(--mint)', fontSize: 16 }}>✦</span>
                  <span style={{ color: '#e0dbff', fontSize: 14 }}>{vi ? r.vi : r.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div id="recruit-form" className="mfc-card" style={{ padding: '32px 28px', position: 'sticky', top: 104 }}>
            <h2 className="gradient-title" style={{ fontSize: 24, margin: '0 0 24px' }}>
              {vi ? 'Biểu mẫu đăng ký ✦' : 'Application Form ✦'}
            </h2>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 className="serif" style={{ color: '#fff', fontSize: 20, margin: '0 0 10px' }}>
                  {vi ? 'Đã gửi thành công!' : 'Submitted!'}
                </h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
                  {vi
                    ? 'Cảm ơn bạn đã đăng ký. MFC sẽ liên hệ với bạn sớm nhất có thể.'
                    : 'Thank you for applying. MFC will reach out to you as soon as possible.'}
                </p>
                <button className="btn-outline-pill" style={{ marginTop: 20 }} onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }}>
                  {vi ? 'Gửi lại' : 'Submit again'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input className="mfc-input" placeholder={vi ? 'Họ và tên' : 'Full Name'} value={form.name} onChange={set('name')} required />
                  <input className="mfc-input" placeholder={vi ? 'Lớp / Khóa' : 'Class / Year'} value={form.class} onChange={set('class')} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input className="mfc-input" placeholder={vi ? 'Số điện thoại' : 'Phone'} value={form.phone} onChange={set('phone')} required />
                  <input className="mfc-input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
                </div>
                <select
                  className="mfc-input"
                  value={form.team}
                  onChange={set('team')}
                  required
                  style={{ cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="">{vi ? 'Ban ứng tuyển' : 'Select Department'}</option>
                  {TEAMS.map(t => <option key={t.vi} value={t.vi}>{vi ? t.vi : t.en}</option>)}
                </select>
                <textarea
                  className="mfc-input"
                  placeholder={vi ? 'Giới thiệu ngắn về bản thân' : 'Brief self-introduction'}
                  rows={4}
                  value={form.intro}
                  onChange={set('intro')}
                  style={{ resize: 'vertical' }}
                />
                <button type="submit" className="btn-pill" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                  {vi ? 'Gửi đăng ký ✈' : 'Submit Application ✈'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── MILESTONES ───────────────────────────────────────── */}
      <section style={{ padding: '48px 0 64px' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ marginBottom: 32 }}>
            <span>{vi ? 'Mốc thời gian' : 'Key Dates'}</span>
          </div>
          <div style={{ position: 'relative' }}>
            {/* Connector */}
            <div style={{
              position: 'absolute', left: '12%', right: '12%', top: 28, height: 2,
              background: 'linear-gradient(90deg, transparent, var(--purple), var(--mint), var(--purple), transparent)',
              boxShadow: '0 0 12px var(--purple)',
            }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, position: 'relative', paddingTop: 56 }}>
              {MILESTONES.map((m, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Number dot */}
                  <div style={{
                    position: 'absolute', top: -44, left: '50%', transform: 'translateX(-50%)',
                    width: 48, height: 48, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    background: 'linear-gradient(135deg, var(--ultra), var(--purple))',
                    border: '1px solid rgba(168,150,246,.6)',
                    boxShadow: '0 0 18px rgba(168,150,246,.3)',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 16, fontWeight: 700, color: '#fff',
                  }}>
                    {m.num}
                  </div>
                  <div className="mfc-card" style={{ padding: '22px 20px', textAlign: 'center' }}>
                    <h3 className="serif" style={{ color: '#fff', fontSize: 16, margin: '0 0 6px' }}>{vi ? m.vi : m.en}</h3>
                    <p style={{ color: 'var(--mint)', fontSize: 13, fontWeight: 600, margin: 0 }}>{m.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 960px) {
          .recruit-hero { grid-template-columns: 1fr !important; }
          .recruit-teams { grid-template-columns: repeat(3, 1fr) !important; }
          .recruit-main { grid-template-columns: 1fr !important; }
          .recruit-milestones { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .recruit-teams { grid-template-columns: 1fr 1fr !important; }
          .recruit-milestones { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default RecruitPage;
