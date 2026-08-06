import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import { useLoadingText } from '../hooks/useLoadingText';
import { uploadToCloudinaryDirect } from '../utils/imageUtils';

/* ─── Shared styles ─────────────────────────────────── */
const fieldLabelStyle = {
  display: 'block', fontSize: 11, color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8,
};
const errorTextStyle = { color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' };



/* ─── Image upload field ─────────────────────────────── */
const ImageUploadField = ({ label, value, onChange, onRemove, error, isUploading }) => {
  const inputRef = useRef(null);
  return (
    <div>
      <label style={fieldLabelStyle}>{label} <span style={{ color: 'var(--pink)' }}>*</span></label>
      <input
        ref={inputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={onChange} className="mfc-input" disabled={isUploading}
        style={{ padding: '10px 16px', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.6 : 1 }}
      />
      {isUploading && <p style={{ color: 'var(--mint)', fontSize: 12, margin: '6px 0 0', fontWeight: 600 }}>Đang tải lên...</p>}
      {value && !isUploading && (
        <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
          <img src={value.previewUrl || value} alt="" style={{ maxHeight: 180, maxWidth: '100%', border: '1px solid var(--line)', display: 'block' }} />
          <span style={{
            position: 'absolute', top: 6, left: 6, display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(1,1,10,.82)', color: 'var(--mint)', fontSize: 10, fontWeight: 700,
            padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '.05em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check_circle</span>
          </span>
          <button type="button" onClick={() => { if (inputRef.current) inputRef.current.value = ''; onRemove(); }}
            style={{
              position: 'absolute', top: 6, right: 6, width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', background: 'rgba(1,1,10,.82)', color: '#ff6b6b', cursor: 'pointer',
            }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
          </button>
        </div>
      )}
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
};

/* ─── Form section header (numbered) ──────────────────── */
const FormSection = ({ num, label }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18,
    paddingBottom: 10, borderBottom: '1px dashed rgba(168,150,246,.25)',
  }}>
    <span className="serif" style={{ fontSize: 22, color: 'rgba(168,150,246,.4)', fontWeight: 700 }}>{num}</span>
    <span style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em' }}>{label}</span>
  </div>
);

/* ─── Page ───────────────────────────────────────────── */
const CastingCallPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [formData, setFormData] = useState({
    fullName: '', dob: '', email: '', phone: '', facebook: '',
    height: '', weight: '', bust: '', waist: '', hips: '', experience: '',
  });
  const [compcard, setCompcard] = useState({
    portraitFront: null, portraitSide: null, halfBody: null, fullBody: null,
  });
  const [uploadingImage, setUploadingImage] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const loadingText = useLoadingText(submitting, vi);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const dobPickerRef = useRef(null);

  const setField = (key) => (e) => {
    setFormData(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: undefined }));
  };

  const handleDobTextChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setFormData(f => ({ ...f, dob: formatted }));
    setErrors(er => (er.dob ? { ...er, dob: undefined } : er));
  };

  const handleDobPickerChange = (e) => {
    const iso = e.target.value;
    if (!iso) return;
    const [y, m, d] = iso.split('-');
    setFormData(f => ({ ...f, dob: `${d}/${m}/${y}` }));
    setErrors(er => (er.dob ? { ...er, dob: undefined } : er));
  };

  const openDobPicker = () => {
    const el = dobPickerRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else el.focus();
  };
  const handleImageChange = (key) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png'].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!allowed) { setErrors(er => ({ ...er, [key]: 'Chỉ JPG/PNG.' })); e.target.value = ''; return; }
    if (file.size > 200 * 1024 * 1024) { setErrors(er => ({ ...er, [key]: 'Ảnh không được vượt quá 200MB.' })); e.target.value = ''; return; }
    
    setErrors(er => ({ ...er, [key]: undefined }));
    const previewUrl = URL.createObjectURL(file);
    setCompcard(p => ({ ...p, [key]: { file, previewUrl } }));
    e.target.value = '';
  };

  const validate = () => {
    const errs = {};
    const r = vi ? 'Vui lòng nhập thông tin.' : 'Required.';
    ['fullName','dob','email','phone','facebook','height','weight','bust','waist','hips','experience']
      .forEach(k => { if (!formData[k].trim()) errs[k] = r; });
    ['portraitFront','portraitSide','halfBody','fullBody']
      .forEach(k => { if (!compcard[k]) errs[k] = vi ? 'Vui lòng tải ảnh.' : 'Required.'; });
    setErrors(errs);
    if (Object.keys(errs).length) {
      setServerError(vi ? 'Vui lòng điền đầy đủ các trường bắt buộc (*).' : 'Please fill all required fields.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) {
      const el = document.getElementById('form-section');
      if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    try {
      // 1. Upload images directly to Cloudinary
      const finalCompcard = {};
      const compcardKeys = ['portraitFront', 'portraitSide', 'halfBody', 'fullBody'];
      
      // We process sequentially to avoid overwhelming network, or Promise.all if preferred
      for (const key of compcardKeys) {
        const item = compcard[key];
        if (item && item.file) {
          setUploadingImage(p => ({ ...p, [key]: true }));
          try {
            const url = await uploadToCloudinaryDirect(item.file, 'casting_call_entries', API_URL);
            finalCompcard[key] = url;
          } catch (uploadErr) {
            throw new Error(`Upload ảnh ${key} thất bại: ${uploadErr.message}`);
          } finally {
            setUploadingImage(p => ({ ...p, [key]: false }));
          }
        } else if (typeof item === 'string') {
          finalCompcard[key] = item;
        }
      }

      // 2. Submit form data
      const res = await fetch(`${API_URL}/api/casting-call-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...finalCompcard }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      await new Promise(r => setTimeout(r, 2500)); // Ensure loading text cycles
      setSubmitSuccess(true);
      const el = document.getElementById('form-section');
      if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    } catch (err) {
      setServerError(err.message || 'Lỗi hệ thống.');
    } finally {
      setSubmitting(false);
    }
  };

  const LOOKING_FOR = [
    {
      num: '01',
      title_vi: 'Thần thái & Bản sắc',
      title_en: 'Aura & Identity',
      vi: 'Sự tự tin, thần thái cuốn hút và bản sắc cá nhân không trộn lẫn.',
      en: 'Confidence, charismatic aura, and a distinctive personal identity.',
    },
    {
      num: '02',
      title_vi: 'Đam mê trình diễn',
      title_en: 'Passion for Runway',
      vi: 'Những gương mặt đam mê trình diễn, khao khát thể hiện bản thân trên sàn runway chuyên nghiệp.',
      en: 'Faces passionate about performing, eager to express themselves on a professional runway.',
    },
    {
      num: '03',
      title_vi: 'Tự tin tỏa sáng',
      title_en: 'Ready to Shine',
      vi: 'Không giới hạn về độ tuổi hay phong cách — chỉ cần bạn sẵn sàng tỏa sáng.',
      en: 'No age or style limits — as long as you are ready to shine.',
    },
  ];

  const BENEFITS = [
    { num: '01', vi: 'Trình diễn Runway', en: 'Runway Performance', desc_vi: 'Trực tiếp trình diễn tại FTU Fashion Show 2026.', desc_en: 'Perform live on the FTU Fashion Show 2026 runway.' },
    { num: '02', vi: 'Quá trình chuẩn bị', en: 'Preparation Process', desc_vi: 'Tham gia vào quy trình chuẩn bị và vận hành chuyên nghiệp.', desc_en: 'Participate in the professional preparation and operations.' },
    { num: '03', vi: 'Trải nghiệm tập luyện', en: 'Training Experience', desc_vi: 'Thử trang phục, tập luyện và hoàn thiện phần trình diễn.', desc_en: 'Fittings, rehearsals, and perfecting your stage presence.' },
    { num: '04', vi: 'Kết nối cộng đồng', en: 'Creative Community', desc_vi: 'Kết nối với nhà thiết kế, người mẫu và nghệ sĩ sáng tạo.', desc_en: 'Connect with designers, models, and creative artists.' },
    { num: '05', vi: 'Hình ảnh truyền thông', en: 'Media Coverage', desc_vi: 'Xuất hiện trong hình ảnh và nội dung truyền thông chính thức.', desc_en: 'Appear in official media images and content.' },
    { num: '06', vi: 'Tư liệu cá nhân', en: 'Personal Portfolio', desc_vi: 'Xây dựng kinh nghiệm, hình ảnh và tư liệu hồ sơ thời trang.', desc_en: 'Build experience and portfolio material for your career.' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingTop: 96, paddingBottom: 80 }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 72px' }}>
        <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ height: 1, width: 36, background: 'var(--mint)', opacity: .6 }} />
            <span style={{ fontSize: 11, color: 'var(--mint)', letterSpacing: '.26em', textTransform: 'uppercase', fontWeight: 600 }}>
              FTU Fashion Show 2026
            </span>
            <div style={{ height: 1, width: 36, background: 'var(--mint)', opacity: .6 }} />
          </div>

          {/* Title */}
          <h1 className="gradient-title-hero serif"
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 28px', lineHeight: 1.05 }}>
            {vi ? 'Casting Call\nModel' : 'Model\nCasting Call'}
          </h1>

          {/* Intro line */}
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.9, margin: '0 auto', maxWidth: 660, fontWeight: 300 }}>
            {vi
              ? 'FTU Fashion Show là nơi những ý tưởng được hiện thực hóa, nơi mỗi thiết kế đều mang trong mình một câu chuyện và mỗi người mẫu là người truyền tải câu chuyện ấy đến khán giả. Trở lại với mùa thứ 11, chúng tôi tìm kiếm những gương mặt bản lĩnh, tự tin và giàu dấu ấn để cùng viết tiếp hành trình này.'
              : 'FTU Fashion Show is where ideas come to life, where every design carries a story and every model is the storyteller. Returning for its 11th season, we are looking for bold, confident faces with presence to continue writing this journey.'}
          </p>
        </div>
      </section>

      {/* ── LOOKING FOR ──────────────────────────────────────────── */}
      <section style={{ padding: '0 0 72px' }}>
        <div className="container" style={{ maxWidth: 900 }}>

          <div className="section-eyebrow" style={{ marginBottom: 36 }}>
            <span className="gradient-title-hero"
              style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {vi ? 'Chúng tôi tìm kiếm' : 'What We Look For'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 16 }}>
            {LOOKING_FOR.map(item => (
              <div key={item.num} className="mfc-card" style={{ padding: '24px 22px', borderTop: '2px solid rgba(168,150,246,.4)' }}>
                {/* (Removed numbers) */}
                <h4 className="serif" style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: '0 0 8px' }}>
                  {vi ? item.title_vi : item.title_en}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>
                  {vi ? item.vi : item.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────────── */}
      <section id="form-section" style={{ padding: '0 0 72px' }}>
        <div className="container" style={{ maxWidth: 760 }}>

          {/* Chúng tôi cần bạn — site-native callout */}
          <div style={{
            textAlign: 'center',
            padding: '40px 24px',
            marginBottom: 0,
            position: 'relative',
          }}>
            {/* Ambient glow */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(168,150,246,.12), transparent 70%)',
              filter: 'blur(24px)',
            }} />

            <div style={{ position: 'relative' }}>
              {/* Top line */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(90deg, transparent, var(--purple))' }} />
                <span style={{ fontSize: 10, color: 'var(--purple)', letterSpacing: '.28em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {vi ? 'Mùa thứ 11 · 2026' : 'Season 11 · 2026'}
                </span>
                <div style={{ flex: 1, maxWidth: 60, height: 1, background: 'linear-gradient(90deg, var(--purple), transparent)' }} />
              </div>

              {/* Main headline */}
              <h2 className="gradient-title serif" style={{
                fontSize: 'clamp(36px, 7vw, 64px)',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                margin: '0 0 16px',
                lineHeight: 1,
              }}>
                {vi ? 'Chúng tôi cần bạn' : 'We Need You'}
              </h2>

              {/* Tagline */}
              <p style={{ color: 'var(--mint)', fontSize: 14, letterSpacing: '.06em', textTransform: 'uppercase', margin: '0 0 28px' }}>
                {vi ? 'Hãy Đăng ký ngay bên dưới' : 'Please Apply Below'}
              </p>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'center', height: 40 }}>
                <span className="material-symbols-outlined animate-bounce-down" style={{ fontSize: 36, color: 'var(--mint)' }}>expand_more</span>
              </div>
            </div>
          </div>

          {submitSuccess ? (
            <div className="mfc-card" style={{ padding: '56px 32px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'var(--mint)', display: 'block', marginBottom: 20 }}>check_circle</span>
              <h3 className="serif" style={{ color: '#fff', fontSize: 26, margin: '0 0 14px', fontWeight: 600 }}>
                {vi ? 'Đăng ký thành công' : 'Registration Successful'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.75, maxWidth: 440, margin: '0 auto 28px' }}>
                {vi
                  ? 'Đơn đăng ký của bạn đã được gửi thành công. Ban Tổ chức sẽ liên hệ với các ứng viên qua thông tin đã cung cấp.'
                  : 'Your application has been submitted. The Organizing Committee will contact candidates via the provided information.'}
              </p>
              <button onClick={() => window.location.reload()} className="btn-outline-pill">
                {vi ? 'Gửi thêm đơn' : 'Submit another'}
              </button>
            </div>
          ) : (
            /* Form with NhatPage-style halo */
            <div style={{ position: 'relative' }}>
              {/* Halo */}
              <div style={{
                position: 'absolute', inset: '-28px -12px', zIndex: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, rgba(158,254,253,.22), rgba(168,150,246,.14) 50%, transparent 75%)',
                filter: 'blur(44px)',
              }} />

              <form onSubmit={handleSubmit} noValidate className="mfc-card" style={{
                position: 'relative', zIndex: 1, overflow: 'hidden',
                padding: '36px 32px 32px',
                background: `
                  radial-gradient(ellipse 120% 50% at 50% -8%, rgba(220,215,255,.35), transparent 58%),
                  linear-gradient(180deg, rgba(96,90,155,.45), rgba(22,20,48,.85))
                `,
                boxShadow: '0 0 80px rgba(158,254,253,.2), 0 0 24px rgba(158,254,253,.28)',
              }}>
                {/* Corner accent marks */}
                {[['top',12,'left',12,{borderTop:'2px solid var(--mint)',borderLeft:'2px solid var(--mint)'}],
                  ['top',12,'right',12,{borderTop:'2px solid var(--mint)',borderRight:'2px solid var(--mint)'}],
                  ['bottom',12,'left',12,{borderBottom:'2px solid var(--mint)',borderLeft:'2px solid var(--mint)'}],
                  ['bottom',12,'right',12,{borderBottom:'2px solid var(--mint)',borderRight:'2px solid var(--mint)'}]
                ].map(([v,vv,h,hh,bdr], i) => (
                  <div key={i} style={{ position:'absolute', [v]:vv, [h]:hh, width:16, height:16, opacity:.5, ...bdr }} />
                ))}

                {/* Form header */}
                <div style={{
                  position: 'relative', textAlign: 'center',
                  margin: '-36px -32px 28px', padding: '28px 32px 22px',
                  borderBottom: '1px dashed rgba(168,150,246,.28)',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: 8 }}>
                    {vi ? 'Đơn đăng ký' : 'Registration Form'}
                  </div>
                  <h3 className="serif" style={{ color: '#fff', fontSize: 'clamp(18px, 4vw, 22px)', margin: 0, fontWeight: 700, letterSpacing: '.04em' }}>
                    Model Casting Call - FTU Fashion Show 2026
                  </h3>
                  {/* Perforation notches */}
                  <div style={{ position:'absolute', left:0, bottom:0, width:18, height:18, borderRadius:'50%', background:'var(--black)', transform:'translate(-50%,50%)' }} />
                  <div style={{ position:'absolute', right:0, bottom:0, width:18, height:18, borderRadius:'50%', background:'var(--black)', transform:'translate(50%,50%)' }} />
                </div>

                {serverError && (
                  <div style={{ background:'rgba(255,107,107,.08)', border:'1px solid rgba(255,107,107,.3)', color:'#ff6b6b', padding:'10px 14px', borderRadius:10, fontSize:13, marginBottom:24 }}>
                    {serverError}
                  </div>
                )}

                {/* 01 — Thông tin cá nhân */}
                <div style={{ marginBottom: 28 }}>
                  <FormSection num="01" label={vi ? 'Thông tin cá nhân' : 'Personal Information'} />
                  <div className="cc-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Họ và tên' : 'Full Name'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <input className="mfc-input" value={formData.fullName} onChange={setField('fullName')} placeholder={vi ? 'Nhập họ và tên của bạn' : 'Enter your full name'} style={{ borderColor: errors.fullName ? '#ff6b6b' : '' }} />
                      {errors.fullName && <p style={errorTextStyle}>{errors.fullName}</p>}
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Ngày sinh' : 'Date of Birth'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="mfc-input"
                          type="text"
                          inputMode="numeric"
                          value={formData.dob}
                          onChange={handleDobTextChange}
                          placeholder="dd/mm/yyyy"
                          maxLength={10}
                          style={{ paddingRight: 40, borderColor: errors.dob ? '#ff6b6b' : '' }}
                        />
                        <button
                          type="button"
                          onClick={openDobPicker}
                          aria-label={vi ? 'Chọn ngày sinh' : 'Pick date of birth'}
                          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 6, display: 'flex', alignItems: 'center' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_month</span>
                        </button>
                        <input
                          ref={dobPickerRef}
                          type="date"
                          onChange={handleDobPickerChange}
                          tabIndex={-1}
                          aria-hidden="true"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
                        />
                      </div>
                      {errors.dob && <p style={errorTextStyle}>{errors.dob}</p>}
                    </div>
                  </div>
                  <div className="cc-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Số điện thoại' : 'Phone'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <input type="tel" className="mfc-input" value={formData.phone} onChange={setField('phone')} placeholder={vi ? 'Nhập số điện thoại' : 'Enter your phone number'} style={{ borderColor: errors.phone ? '#ff6b6b' : '' }} />
                      {errors.phone && <p style={errorTextStyle}>{errors.phone}</p>}
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>Email <span style={{color:'var(--pink)'}}>*</span></label>
                      <input type="email" className="mfc-input" value={formData.email} onChange={setField('email')} placeholder={vi ? 'Nhập email' : 'Enter your email'} style={{ borderColor: errors.email ? '#ff6b6b' : '' }} />
                      {errors.email && <p style={errorTextStyle}>{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{vi ? 'Link Facebook' : 'Facebook Link'} <span style={{color:'var(--pink)'}}>*</span></label>
                    <input className="mfc-input" value={formData.facebook} onChange={setField('facebook')} placeholder="https://www.facebook.com/..." style={{ borderColor: errors.facebook ? '#ff6b6b' : '' }} />
                    {errors.facebook && <p style={errorTextStyle}>{errors.facebook}</p>}
                  </div>
                </div>

                {/* 02 — Chỉ số hình thể */}
                <div style={{ marginBottom: 28 }}>
                  <FormSection num="02" label={vi ? 'Chỉ số hình thể' : 'Body Statistics'} />
                  <div className="cc-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Chiều cao (cm)' : 'Height (cm)'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <input type="number" className="mfc-input" value={formData.height} onChange={setField('height')} placeholder="170" style={{ borderColor: errors.height ? '#ff6b6b' : '' }} />
                      {errors.height && <p style={errorTextStyle}>{errors.height}</p>}
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Cân nặng (kg)' : 'Weight (kg)'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <input type="number" className="mfc-input" value={formData.weight} onChange={setField('weight')} placeholder="52" style={{ borderColor: errors.weight ? '#ff6b6b' : '' }} />
                      {errors.weight && <p style={errorTextStyle}>{errors.weight}</p>}
                    </div>
                  </div>
                  <div className="cc-grid-3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Vòng 1 (cm)' : 'Bust (cm)'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <input type="number" className="mfc-input" value={formData.bust} onChange={setField('bust')} placeholder="85" style={{ borderColor: errors.bust ? '#ff6b6b' : '' }} />
                      {errors.bust && <p style={errorTextStyle}>{errors.bust}</p>}
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Vòng 2 (cm)' : 'Waist (cm)'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <input type="number" className="mfc-input" value={formData.waist} onChange={setField('waist')} placeholder="60" style={{ borderColor: errors.waist ? '#ff6b6b' : '' }} />
                      {errors.waist && <p style={errorTextStyle}>{errors.waist}</p>}
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Vòng 3 (cm)' : 'Hips (cm)'} <span style={{color:'var(--pink)'}}>*</span></label>
                      <input type="number" className="mfc-input" value={formData.hips} onChange={setField('hips')} placeholder="90" style={{ borderColor: errors.hips ? '#ff6b6b' : '' }} />
                      {errors.hips && <p style={errorTextStyle}>{errors.hips}</p>}
                    </div>
                  </div>
                </div>

                {/* 03 — Kinh nghiệm */}
                <div style={{ marginBottom: 28 }}>
                  <FormSection num="03" label={vi ? 'Kinh nghiệm trình diễn' : 'Runway Experience'} />
                  <label style={fieldLabelStyle}>
                    {vi ? 'Bạn đã từng tham gia trình diễn show thời trang nào trước đây chưa? Nếu có hãy kể chi tiết' : 'Have you participated in any runway shows? If yes, please describe in detail.'} <span style={{color:'var(--pink)'}}>*</span>
                  </label>
                  <textarea className="mfc-input" rows={4} value={formData.experience} onChange={setField('experience')}
                    placeholder={vi ? 'Nhập câu trả lời của bạn...' : 'Enter your answer...'}
                    style={{ resize: 'vertical', borderColor: errors.experience ? '#ff6b6b' : '' }} />
                  {errors.experience && <p style={errorTextStyle}>{errors.experience}</p>}
                </div>

                {/* 04 — Compcard */}
                <div style={{ marginBottom: 32 }}>
                  <FormSection num="04" label={vi ? 'Hồ sơ hình ảnh — Compcard' : 'Compcard Photos'} />
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, margin: '0 0 18px' }}>
                    {vi ? 'Vui lòng tải lên 4 ảnh bên dưới. Lưu ý: ảnh chụp không quá 5 tháng gần nhất.' : 'Please upload the 4 photos below. Note: photos must be taken within the last 5 months.'}
                  </p>
                  <div className="cc-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                    <ImageUploadField label={vi ? '1. Chân dung chính diện' : '1. Frontal Portrait'} value={compcard.portraitFront} onChange={handleImageChange('portraitFront')} onRemove={() => setCompcard(p => ({...p, portraitFront:null}))} error={errors.portraitFront} isUploading={uploadingImage.portraitFront} />
                    <ImageUploadField label={vi ? '2. Chân dung góc nghiêng' : '2. Side-Profile Portrait'} value={compcard.portraitSide} onChange={handleImageChange('portraitSide')} onRemove={() => setCompcard(p => ({...p, portraitSide:null}))} error={errors.portraitSide} isUploading={uploadingImage.portraitSide} />
                    <ImageUploadField label={vi ? '3. Bán toàn thân' : '3. Half-Body'} value={compcard.halfBody} onChange={handleImageChange('halfBody')} onRemove={() => setCompcard(p => ({...p, halfBody:null}))} error={errors.halfBody} isUploading={uploadingImage.halfBody} />
                    <ImageUploadField label={vi ? '4. Toàn thân' : '4. Full-Body'} value={compcard.fullBody} onChange={handleImageChange('fullBody')} onRemove={() => setCompcard(p => ({...p, fullBody:null}))} error={errors.fullBody} isUploading={uploadingImage.fullBody} />
                  </div>
                </div>

                <button type="submit" disabled={submitting || Object.values(uploadingImage).some(Boolean)} className="btn-pill btn-radiate"
                  style={{ width:'100%', justifyContent:'center', opacity: (submitting || Object.values(uploadingImage).some(Boolean)) ? .65 : 1, padding:'16px', fontSize:15, letterSpacing:'.06em' }}>
                  {Object.values(uploadingImage).some(Boolean)
                    ? (vi ? 'Đang xử lý ảnh...' : 'Processing images...')
                    : submitting
                      ? loadingText
                      : (vi ? 'GỬI ĐƠN ĐĂNG KÝ' : 'SUBMIT APPLICATION')}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 40px' }}>
        <div className="container" style={{ maxWidth: 900 }}>

          <div className="section-eyebrow" style={{ marginBottom: 36 }}>
            <span className="gradient-title-hero"
              style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {vi ? 'Quyền lợi khi đồng hành' : 'Benefits of Joining'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 16 }}>
            {BENEFITS.map(b => (
              <div key={b.num} className="mfc-card" style={{ padding: '24px 22px', borderTop: '2px solid rgba(168,150,246,.4)' }}>
                <div className="serif" style={{
                  fontSize: 32, fontWeight: 700, lineHeight: 1, marginBottom: 12,
                  background: 'linear-gradient(135deg, var(--mint), var(--purple))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {b.num}
                </div>
                <h4 className="serif" style={{ fontSize: 16, color: '#fff', fontWeight: 600, margin: '0 0 8px' }}>
                  {vi ? b.vi : b.en}
                </h4>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>
                  {vi ? b.desc_vi : b.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container" style={{ maxWidth: 640 }}>

          <div className="section-eyebrow" style={{ marginBottom: 40 }}>
            <span className="gradient-title-hero"
              style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Timeline
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
            {/* Round 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 240px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ultra), var(--purple))', boxShadow: '0 0 14px rgba(168,150,246,.7)', marginBottom: 14 }} />
              <div className="serif" style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
                {vi ? 'Vòng đơn' : 'Round 1'}
              </div>
              <div style={{ color: 'var(--mint)', fontSize: 14, letterSpacing: '.04em', marginBottom: 8 }}>02/08 – 13/08</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>{vi ? 'Nộp đơn đăng ký online' : 'Online applications'}</div>
            </div>

            {/* Connector */}
            <div style={{ height: 1, flex: '1 1 60px', background: 'var(--line)', marginTop: 7 }} />

            {/* Round 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 240px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ultra), var(--purple))', boxShadow: '0 0 14px rgba(168,150,246,.7)', marginBottom: 14 }} />
              <div className="serif" style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
                {vi ? 'Vòng tuyển chọn' : 'Round 2'}
              </div>
              <div style={{ color: 'var(--mint)', fontSize: 14, letterSpacing: '.04em', marginBottom: 8 }}>15/08</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>{vi ? 'Tuyển chọn offline trực tiếp' : 'In-person selection'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 0 72px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn-outline-pill"
            onClick={() => { navigate('/about'); window.scrollTo(0, 0); }}
            style={{ fontSize: 16, padding: '16px 32px' }}
          >
            {vi ? 'Khám phá thêm về chúng tôi →' : 'Discover More About Us →'}
          </button>
        </div>
      </section>
      <style>{`
        .cc-grid-2 > div, .cc-grid-3 > div {
          min-width: 0;
        }
        input[type="date"].mfc-input {
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          display: block;
        }
        @media (max-width: 640px) {
          .cc-grid-2 { grid-template-columns: 1fr !important; }
          .cc-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default CastingCallPage;
