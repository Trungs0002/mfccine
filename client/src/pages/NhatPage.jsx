import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const fieldLabelStyle = { display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 };
const errorTextStyle = { color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' };

// Images are uploaded to Cloudinary server-side and only the resulting URL is stored in
// MongoDB, so the original file is sent as-is here (no resizing/compression needed).
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ImageUploadField = ({ label, value, onChange, onRemove, error }) => {
  const inputRef = useRef(null);

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '';
    onRemove();
  };

  return (
    <div>
      <label style={fieldLabelStyle}>{label} *</label>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={onChange} className="mfc-input" style={{ padding: '10px 16px', cursor: 'pointer' }} />
      {value && (
        <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
          <img src={value} alt="" style={{ maxHeight: 200, maxWidth: '100%', border: '1px solid var(--line)', display: 'block' }} />
          <span style={{
            position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(1,1,10,.75)', color: 'var(--mint)', fontSize: 11, fontWeight: 700,
            padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '.05em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
          </span>
          <button
            type="button"
            onClick={handleRemove}
            title="Xóa ảnh"
            style={{
              position: 'absolute', top: 8, right: 8, width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', background: 'rgba(1,1,10,.75)', color: '#ff6b6b', cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
};

const HIGHLIGHTS = [
  { vi: 'Trình diễn thiết kế của bạn trên sàn diễn FTU Fashion Show 2026 trước hàng trăm khán giả.', en: 'Showcase your design on the FTU Fashion Show 2026 runway in front of hundreds of guests.' },
  { vi: 'Được cố vấn và nhận xét trực tiếp từ các chuyên gia, nhà thiết kế trong ngành thời trang.', en: 'Get direct mentorship and feedback from industry experts and fashion designers.' },
  { vi: 'Giải thưởng giá trị cùng cơ hội hợp tác với các thương hiệu thời trang.', en: 'Valuable prizes and a chance to collaborate with fashion brands.' },
  { vi: 'Xây dựng portfolio thiết kế và ghi dấu ấn cá nhân trong cộng đồng yêu thời trang.', en: 'Build your design portfolio and make your mark in the fashion community.' },
];

const JUDGES_ROUND_1 = [
  { key: 'r1-1' }, { key: 'r1-2' }, { key: 'r1-3' },
];
const JUDGES_ROUND_2 = [
  { key: 'r2-1' }, { key: 'r2-2' }, { key: 'r2-3' },
];

const JudgeCard = ({ index, vi }) => (
  <div className="mfc-card nhat-sharp-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' }}>
    <div style={{
      position: 'relative', width: 64, height: 64, flexShrink: 0, overflow: 'hidden',
      background: 'linear-gradient(160deg, rgba(168,150,246,.18), rgba(1,1,10,.6))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 30, color: 'rgba(255,255,255,.25)' }}>person</span>
    </div>
    <div>
      <div style={{ fontSize: 10, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.18em', marginBottom: 6 }}>
        {vi ? 'Giám khảo' : 'Judge'} 0{index}
      </div>
      <h4 className="serif" style={{ color: '#fff', fontSize: 16, margin: '0 0 4px', fontWeight: 600 }}>
        {vi ? 'Đang cập nhật' : 'To be announced'}
      </h4>
      <p style={{ color: 'var(--muted)', fontSize: 11, margin: 0, lineHeight: 1.4 }}>
        {vi ? 'Thông tin sẽ sớm được công bố' : 'Details will be revealed soon'}
      </p>
    </div>
  </div>
);

const NhatPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', school: '', note: '' });
  const [designImage, setDesignImage] = useState(null);
  const [outfitPhoto1, setOutfitPhoto1] = useState(null);
  const [outfitPhoto2, setOutfitPhoto2] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'

  const setField = (key) => (e) => {
    const { value } = e.target;
    setFormData(f => ({ ...f, [key]: value }));
    setErrors(er => (er[key] ? { ...er, [key]: undefined } : er));
  };

  const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
  const ALLOWED_EXTENSIONS = /\.(jpe?g|png)$/i;

  const handleFileChange = (setter, key) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isAllowed = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.test(file.name);
    if (!isAllowed) {
      setErrors(er => ({ ...er, [key]: vi ? 'Chỉ chấp nhận ảnh định dạng JPG, JPEG hoặc PNG.' : 'Only JPG, JPEG, or PNG images are accepted.' }));
      e.target.value = '';
      return;
    }
    const base64 = await fileToBase64(file);
    setter(base64);
    setErrors(er => (er[key] ? { ...er, [key]: undefined } : er));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = vi ? 'Vui lòng nhập họ và tên.' : 'Please enter your full name.';
    if (!formData.email.trim()) newErrors.email = vi ? 'Vui lòng nhập email.' : 'Please enter your email.';
    if (!formData.phone.trim()) newErrors.phone = vi ? 'Vui lòng nhập số điện thoại.' : 'Please enter your phone number.';
    if (!designImage) newErrors.designImage = vi ? 'Vui lòng tải lên ảnh bản vẽ thiết kế.' : 'Please upload your design sketch image.';
    if (!outfitPhoto1) newErrors.outfitPhoto1 = vi ? 'Vui lòng tải lên ảnh chụp bộ đồ (1).' : 'Please upload outfit photo (1).';
    if (!outfitPhoto2) newErrors.outfitPhoto2 = vi ? 'Vui lòng tải lên ảnh chụp bộ đồ (2).' : 'Please upload outfit photo (2).';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus(null);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/nhat-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, designImage, outfitPhoto1, outfitPhoto2 }),
      });
      setSubmitStatus(res.ok ? 'success' : 'error');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in nhat-page" style={{ paddingTop: 96, paddingBottom: 64 }}>
      {/* Hero */}
      <section style={{ padding: '0 0 56px' }}>
        <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ height: 1, width: 32, background: 'var(--mint)' }} />
            <div style={{ fontSize: 11, color: 'var(--mint)', letterSpacing: '.24em', textTransform: 'uppercase', fontWeight: 600 }}>
              FTU Fashion Show 2026
            </div>
            <div style={{ height: 1, width: 32, background: 'var(--mint)' }} />
          </div>
          <h1 className="gradient-title-hero serif" style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            "NHẤT"
          </h1>
          <p style={{ color: '#ccc8f0', fontSize: 16, lineHeight: 1.85, margin: '0 auto' }}>
            {vi
              ? '"NHẤT" là cuộc thi thiết kế thời trang do MFC FTU tổ chức trong khuôn khổ FTU Fashion Show 2026, nơi các bạn trẻ yêu thời trang được thỏa sức thể hiện góc nhìn sáng tạo và dấu ấn cá nhân qua từng thiết kế. Từ những bản phác thảo đầu tiên đến sản phẩm hoàn chỉnh, "NHẤT" là sân chơi để các nhà thiết kế trẻ chứng minh bản lĩnh và chinh phục cơ hội tỏa sáng trên sàn diễn FTU Fashion Show 2026.'
              : '"NHẤT" is a fashion design competition held by MFC FTU as part of FTU Fashion Show 2026, where young fashion enthusiasts can freely express their creative perspective and personal signature through every design. From the very first sketches to the finished piece, "NHẤT" is a platform for young designers to prove their talent and earn a chance to shine on the FTU Fashion Show 2026 runway.'}
          </p>
        </div>

        <div className="container" style={{ maxWidth: 900, marginTop: 40 }}>
          <div style={{ position: 'relative', overflow: 'hidden', border: '1px solid rgba(168,150,246,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(168,150,246,0.1)' }}>
            <img src="/kv-doc.jpeg" alt="NHẤT - FTU Fashion Show 2026" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 420, objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(70,69,215,.08), rgba(1,1,10,.25))', pointerEvents: 'none' }} />
          </div>
        </div>
      </section>

      {/* Why join */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="section-eyebrow" style={{ marginBottom: 28 }}>
            <span className="gradient-title-hero" style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {vi ? 'Tham gia ngay để có cơ hội' : 'Join Now for Your Chance'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="nhat-highlights-grid">
            {HIGHLIGHTS.map((h, i) => (
              <div key={i} className="mfc-card" style={{
                padding: '26px 24px', borderColor: 'rgba(158,254,253,.35)',
                boxShadow: '0 0 30px rgba(158,254,253,.1)',
                borderTop: '2px solid var(--mint)',
              }}>
                <div className="serif" style={{ fontSize: 34, fontWeight: 700, color: 'var(--mint)', lineHeight: 1, marginBottom: 12 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <p style={{ color: '#e0dbff', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{vi ? h.vi : h.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submission form */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="section-eyebrow" style={{ marginBottom: 28 }}>
            <span className="gradient-title-hero" style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {vi ? 'Nộp bài dự thi' : 'Submit Your Entry'}
            </span>
          </div>

          {submitStatus === 'success' ? (
            <div className="mfc-card" style={{ padding: '48px 32px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 52, color: 'var(--mint)', marginBottom: 16, display: 'block' }}>check_circle</span>
              <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: '0 0 12px' }}>
                {vi ? 'Nộp bài thành công!' : 'Entry submitted!'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.75, maxWidth: 440, margin: '0 auto' }}>
                {vi
                  ? 'Cảm ơn bạn đã gửi bài dự thi. MFC FTU sẽ liên hệ với bạn trong thời gian sớm nhất.'
                  : 'Thank you for your submission. MFC FTU will contact you as soon as possible.'}
              </p>
            </div>
          ) : (
            <div className="nhat-form-halo-wrap" style={{ position: 'relative' }}>
              <div className="nhat-form-halo" style={{
                position: 'absolute', inset: '-30px -16px', zIndex: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, rgba(158,254,253,.3), rgba(168,150,246,.18) 45%, transparent 72%)',
                filter: 'blur(40px)',
              }} />
              <form onSubmit={handleSubmit} className="mfc-card" style={{
                position: 'relative', zIndex: 1, overflow: 'hidden', padding: '32px 24px 28px',
                background: `
                radial-gradient(ellipse 140% 55% at 50% -10%, rgba(225,220,255,.4), transparent 62%),
                linear-gradient(180deg, rgba(96,90,155,.5), rgba(28,26,55,.82))
              `,
                boxShadow: '0 0 80px rgba(158,254,253,.25), 0 0 26px rgba(158,254,253,.35)',
              }}>
                {/* Corner marks - gives the card a "document / entry form" feel */}
                <div style={{ position: 'absolute', top: 12, left: 12, width: 16, height: 16, borderTop: '2px solid var(--mint)', borderLeft: '2px solid var(--mint)', opacity: .55 }} />
                <div style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, borderTop: '2px solid var(--mint)', borderRight: '2px solid var(--mint)', opacity: .55 }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, width: 16, height: 16, borderBottom: '2px solid var(--mint)', borderLeft: '2px solid var(--mint)', opacity: .55 }} />
                <div style={{ position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, borderBottom: '2px solid var(--mint)', borderRight: '2px solid var(--mint)', opacity: .55 }} />

                {/* Form header - full-bleed so its bottom border reaches the card's true edges;
                  the dashed line doubles as a ticket perforation with punch-hole notches. */}
                <div style={{ position: 'relative', textAlign: 'center', margin: '-32px -24px 24px', padding: '26px 24px 20px', borderBottom: '1px dashed rgba(168,150,246,.3)' }}>
                  <div style={{ fontSize: 10, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.22em', marginBottom: 8 }}>
                    {vi ? 'Mẫu đơn dự thi' : 'Entry Form'}
                  </div>
                  <h3 className="serif" style={{ color: '#fff', fontSize: 'clamp(18px, 5vw, 24px)', margin: 0, fontWeight: 700 }}>
                    "NHẤT" - FTU Fashion Show 2026
                  </h3>
                  <div style={{ position: 'absolute', left: 0, bottom: 0, width: 20, height: 20, borderRadius: '50%', background: 'var(--black)', transform: 'translate(-50%, 50%)' }} />
                  <div style={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 20, borderRadius: '50%', background: 'var(--black)', transform: 'translate(50%, 50%)' }} />
                </div>

                {/* Personal info */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18, paddingBottom: 10, borderBottom: '1px dashed rgba(168,150,246,.25)' }}>
                    <span className="serif" style={{ fontSize: 22, color: 'rgba(168,150,246,.4)', fontWeight: 700 }}>01</span>
                    <span style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                      {vi ? 'Thông tin cá nhân' : 'Personal Information'}
                    </span>
                  </div>
                  <div className="nhat-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Họ và tên *' : 'Full Name *'}</label>
                      <input className="mfc-input" value={formData.fullName} onChange={setField('fullName')} placeholder={vi ? 'Nhập họ và tên của bạn' : 'Enter your full name'} />
                      {errors.fullName && <p style={errorTextStyle}>{errors.fullName}</p>}
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Số điện thoại *' : 'Phone Number *'}</label>
                      <input className="mfc-input" value={formData.phone} onChange={setField('phone')} placeholder="0912 345 678" />
                      {errors.phone && <p style={errorTextStyle}>{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="nhat-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={fieldLabelStyle}>Email *</label>
                      <input type="email" className="mfc-input" value={formData.email} onChange={setField('email')} placeholder="ban@email.com" />
                      {errors.email && <p style={errorTextStyle}>{errors.email}</p>}
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{vi ? 'Trường / đơn vị' : 'School / Organization'}</label>
                      <input className="mfc-input" value={formData.school} onChange={setField('school')} placeholder={vi ? 'Nhập tên trường / đơn vị' : 'Enter your school / organization'} />
                    </div>
                  </div>
                </div>

                {/* Entry images */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18, paddingBottom: 10, borderBottom: '1px dashed rgba(168,150,246,.25)' }}>
                    <span className="serif" style={{ fontSize: 22, color: 'rgba(168,150,246,.4)', fontWeight: 700 }}>02</span>
                    <span style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                      {vi ? 'Hình ảnh bài dự thi' : 'Entry Images'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <ImageUploadField
                      label={vi ? 'Ảnh bản vẽ thiết kế' : 'Design Sketch Image'}
                      value={designImage}
                      onChange={handleFileChange(setDesignImage, 'designImage')}
                      onRemove={() => setDesignImage(null)}
                      error={errors.designImage}
                    />
                    <ImageUploadField
                      label={vi ? 'Ảnh chụp sơ bộ bộ đồ (1)' : 'Preliminary Outfit Photo (1)'}
                      value={outfitPhoto1}
                      onChange={handleFileChange(setOutfitPhoto1, 'outfitPhoto1')}
                      onRemove={() => setOutfitPhoto1(null)}
                      error={errors.outfitPhoto1}
                    />
                    <ImageUploadField
                      label={vi ? 'Ảnh chụp sơ bộ bộ đồ (2)' : 'Preliminary Outfit Photo (2)'}
                      value={outfitPhoto2}
                      onChange={handleFileChange(setOutfitPhoto2, 'outfitPhoto2')}
                      onRemove={() => setOutfitPhoto2(null)}
                      error={errors.outfitPhoto2}
                    />
                  </div>
                </div>

                {/* Note */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18, paddingBottom: 10, borderBottom: '1px dashed rgba(168,150,246,.25)' }}>
                    <span className="serif" style={{ fontSize: 22, color: 'rgba(168,150,246,.4)', fontWeight: 700 }}>03</span>
                    <span style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                      {vi ? 'Ghi chú thêm (nếu có)' : 'Additional Notes (if any)'}
                    </span>
                  </div>
                  <textarea
                    className="mfc-input"
                    rows={3}
                    placeholder={vi ? 'Chia sẻ thêm về ý tưởng thiết kế của bạn...' : 'Share more about your design idea...'}
                    value={formData.note}
                    onChange={setField('note')}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {submitStatus === 'error' && (
                  <p style={{ ...errorTextStyle, textAlign: 'center', marginBottom: 12 }}>
                    {vi ? 'Đã có lỗi xảy ra, vui lòng thử lại.' : 'Something went wrong, please try again.'}
                  </p>
                )}

                <button type="submit" disabled={submitting} className="btn-pill" style={{ width: '100%', justifyContent: 'center', opacity: submitting ? .6 : 1 }}>
                  {submitting ? (vi ? 'Đang gửi...' : 'Submitting...') : (vi ? 'Gửi bài dự thi' : 'Submit Entry')}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Judges */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="section-eyebrow" style={{ marginBottom: 12 }}>
            <span className="gradient-title-hero" style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              {vi ? 'Ban giám khảo' : 'Panel of Judges'}
            </span>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, margin: '0 0 36px' }}>
            {vi ? 'Thông tin ban giám khảo sẽ được cập nhật sớm.' : "Judges' details will be announced soon."}
          </p>

          <div style={{ fontSize: 11, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
            {vi ? 'Vòng 1 - Sơ khảo' : 'Round 1 - Preliminary'}
          </div>
          <div className="nhat-judges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
            {JUDGES_ROUND_1.map((j, i) => (
              <JudgeCard key={j.key} index={i + 1} vi={vi} />
            ))}
          </div>

          <div style={{ fontSize: 11, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
            {vi ? 'Vòng 2 - Tuyển chọn' : 'Round 2 - Selection'}
          </div>
          <div className="nhat-judges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {JUDGES_ROUND_2.map((j, i) => (
              <JudgeCard key={j.key} index={i + 1} vi={vi} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="section-eyebrow" style={{ marginBottom: 40 }}>
            <span className="gradient-title-hero" style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Timeline
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 220px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ultra), var(--purple))', boxShadow: '0 0 14px rgba(168,150,246,.6)', marginBottom: 14 }} />
              <div className="serif" style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {vi ? 'Vòng đơn' : 'Round 1'}
              </div>
              <div style={{ color: 'var(--mint)', fontSize: 13, letterSpacing: '.04em' }}>11/7 – 22/7</div>
            </div>
            <div style={{ height: 1, flex: '1 1 60px', background: 'var(--line)', marginTop: 7 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 220px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ultra), var(--purple))', boxShadow: '0 0 14px rgba(168,150,246,.6)', marginBottom: 14 }} />
              <div className="serif" style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {vi ? 'Vòng tuyển chọn' : 'Round 2'}
              </div>
              <div style={{ color: 'var(--mint)', fontSize: 13, letterSpacing: '.04em' }}>25/7</div>
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
          <button
            className="btn-pill btn-radiate"
            onClick={() => { navigate('/seating'); window.scrollTo(0, 0); }}
            style={{ fontSize: 16, padding: '16px 32px' }}
          >
            {vi ? 'Mua vé ngay' : 'Buy Tickets Now'}
          </button>
        </div>
      </section>

      <style>{`
        /* Selective rounding: photography and the judges' cards stay sharp/editorial,
           while the form and highlight cards keep their natural soft rounded corners. */
        .nhat-page img,
        .nhat-page .nhat-sharp-card {
          border-radius: 0 !important;
        }
        @media (max-width: 700px) {
          .nhat-highlights-grid, .nhat-judges-grid, .nhat-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NhatPage;
