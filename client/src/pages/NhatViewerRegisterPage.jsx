import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import { fileToBase64 } from '../utils/imageUtils';
import { useLoadingText } from '../hooks/useLoadingText';

const fieldLabelStyle = { display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 };
const errorTextStyle = { color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' };

const ImageUploadField = ({ label, helpText, value, onChange, onRemove, error, isUploading }) => {
  const inputRef = useRef(null);
  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '';
    onRemove();
  };
  return (
    <div>
      <label style={fieldLabelStyle}>{label} *</label>
      {helpText && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4, marginBottom: 8 }}>{helpText}</p>}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={onChange} className="mfc-input" disabled={isUploading} style={{ padding: '10px 16px', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.6 : 1 }} />
      {isUploading && <p style={{ color: 'var(--mint)', fontSize: 12, margin: '6px 0 0', fontWeight: 600 }}>Đang tải lên...</p>}
      {value && !isUploading && (
        <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
          <img src={value} alt="" style={{ maxHeight: 200, maxWidth: '100%', border: '1px solid var(--line)', display: 'block' }} />
          <span style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(1,1,10,.75)', color: 'var(--mint)', fontSize: 11, fontWeight: 700, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
          </span>
          <button type="button" onClick={handleRemove} title="Xóa ảnh" style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'rgba(1,1,10,.75)', color: '#ff6b6b', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      )}
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = /\.(jpe?g|png)$/i;

const NhatViewerRegisterPage = ({ settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [viewerFormData, setViewerFormData] = useState({ fullName: '', email: '', schoolOption: '', school: '', studentId: '', classInfo: '', likePostProof: null, likePageProof: null, likeFfsPageProof: null, question: '' });
  const [viewerErrors, setViewerErrors] = useState({});
  const [viewerSubmitStatus, setViewerSubmitStatus] = useState(null);
  const loadingText = useLoadingText(viewerSubmitStatus === 'submitting', vi);
  const [uploadingImage, setUploadingImage] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const setViewerField = (key) => (e) => {
    setViewerFormData(f => ({ ...f, [key]: e.target.value }));
    setViewerErrors(er => (er[key] ? { ...er, [key]: undefined } : er));
  };

  const handleViewerFileChange = (field) => async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isAllowed = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.test(file.name);
    if (!isAllowed) {
      setViewerErrors(er => ({ ...er, [field]: vi ? 'Chỉ chấp nhận ảnh định dạng JPG, JPEG hoặc PNG.' : 'Only JPG, JPEG, or PNG images are accepted.' }));
      e.target.value = '';
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setViewerErrors(er => ({ ...er, [field]: vi ? 'Kích thước ảnh không được vượt quá 200MB.' : 'Image size cannot exceed 200MB.' }));
      e.target.value = '';
      return;
    }
    try {
      setUploadingImage(p => ({ ...p, [field]: true }));
      const base64 = await fileToBase64(file);
      const res = await fetch(`${API_URL}/api/upload-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, folder: 'mfc_nhat_tickets' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setViewerFormData(f => ({ ...f, [field]: data.url }));
      setViewerErrors(er => (er[field] ? { ...er, [field]: undefined } : er));
    } catch (err) {
      setViewerErrors(er => ({ ...er, [field]: vi ? 'Lỗi tải ảnh.' : 'Upload error.' }));
    } finally {
      setUploadingImage(p => ({ ...p, [field]: false }));
      e.target.value = '';
    }
  };

  const handleViewerSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!viewerFormData.fullName.trim()) newErrors.fullName = vi ? 'Vui lòng nhập họ và tên' : 'Please enter your full name';
    if (!viewerFormData.email.trim()) newErrors.email = vi ? 'Vui lòng nhập email' : 'Please enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(viewerFormData.email)) newErrors.email = vi ? 'Email không hợp lệ' : 'Invalid email';
    if (!viewerFormData.schoolOption) newErrors.schoolOption = vi ? 'Vui lòng chọn trường' : 'Please select a school';
    else if (viewerFormData.schoolOption === 'Trường khác' && !viewerFormData.school.trim()) newErrors.school = vi ? 'Vui lòng nhập tên trường' : 'Please enter your school';
    if (viewerFormData.schoolOption === 'FTU') {
      if (!viewerFormData.studentId.trim()) newErrors.studentId = vi ? 'Vui lòng nhập MSSV' : 'Please enter your student ID';
      if (!viewerFormData.classInfo.trim()) newErrors.classInfo = vi ? 'Vui lòng nhập lớp - ngành - khóa' : 'Please enter class - major - cohort';
    }
    if (!viewerFormData.likePostProof) newErrors.likePostProof = vi ? 'Vui lòng tải lên minh chứng bài viết' : 'Please upload proof';
    if (!viewerFormData.likePageProof) newErrors.likePageProof = vi ? 'Vui lòng tải lên minh chứng trang MFC' : 'Please upload proof';
    if (!viewerFormData.likeFfsPageProof) newErrors.likeFfsPageProof = vi ? 'Vui lòng tải lên minh chứng trang FTU Fashion Show' : 'Please upload proof';

    if (Object.keys(newErrors).length > 0) {
      setViewerErrors(newErrors);
      return;
    }

    setViewerSubmitStatus('submitting');
    try {
      const payload = { ...viewerFormData };
      if (payload.schoolOption === 'Trường khác') {
        payload.studentId = 'Trường khác';
        payload.classInfo = 'Trường khác';
      }

      const res = await fetch(`${API_URL}/api/nhat/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await new Promise(r => setTimeout(r, 2500)); // Ensure loading text cycles
      if (res.ok) {
        setViewerSubmitStatus('success');
        setTimeout(() => document.getElementById('nhat-register-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      } else {
        alert(vi ? 'Có lỗi xảy ra, vui lòng thử lại.' : 'An error occurred, please try again.');
        setViewerSubmitStatus(null);
      }
    } catch (err) {
      alert(vi ? 'Có lỗi xảy ra, vui lòng thử lại.' : 'An error occurred, please try again.');
      setViewerSubmitStatus(null);
    }
  };

  return (
    <div className="animate-fade-in nhat-page" style={{ paddingTop: 96, paddingBottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, paddingLeft: 20, paddingRight: 20 }}>
      {viewerSubmitStatus !== 'success' && (
        <div style={{ maxWidth: 640, width: '100%', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top block: 2 Training points */}
          <div style={{ textAlign: 'center', padding: '24px 16px', background: 'radial-gradient(ellipse at center, rgba(168,150,246,0.15) 0%, transparent 80%)' }}>
            <h2 className="gradient-title-hero serif" style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 12px', lineHeight: 1.3 }}>
              {vi ? 'Đăng ký ngay để nhận' : 'Register now to get'}
              <br />
              <span style={{ color: 'var(--mint)', textShadow: '0 0 20px rgba(85,255,200,0.5)', display: 'inline-block', marginTop: 4, WebkitTextFillColor: 'var(--mint)' }}>02 ĐIỂM RÈN LUYỆN</span>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15, margin: 0, fontStyle: 'italic', maxWidth: 480, marginInline: 'auto', lineHeight: 1.5 }}>
              {vi ? 'Áp dụng cho sinh viên Ngoại Thương vào kỳ 1 năm học 2026-2027 khi tham gia sự kiện Nhất đầy đủ.' : 'Applicable for FTU students in Semester 1 of 2026-2027 if attending the event fully.'}
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, fontStyle: 'italic' }}>
              {vi ? 'Ngoài ra, hãy tham gia Nhất để có cơ hội:' : 'Besides, join Nhất for the opportunity to:'}
            </p>
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/ok123.jpg" 
              alt="Quyền lợi tham dự Nhất" 
              style={{ 
                width: '100%', 
                maxWidth: 640,
                aspectRatio: '10 / 4',
                borderRadius: 16, 
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                display: 'block',
                objectFit: 'cover'
              }} 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, padding: '16px 0' }}>
            {/* Ticket 1 */}
            <div style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(40,40,55,0.85), rgba(20,20,30,0.95))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '3px solid var(--mint)',
              borderRadius: 24,
              WebkitMaskImage: 'radial-gradient(circle at 0px calc(50%), transparent 14px, black 15px), radial-gradient(circle at 100% calc(50%), transparent 14px, black 15px)',
              WebkitMaskSize: '51% 100%',
              WebkitMaskPosition: '0 0, 100% 0',
              WebkitMaskRepeat: 'no-repeat',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(85,255,200,0.15)',
              padding: '40px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '100%',
                background: 'radial-gradient(circle at 50% 0%, rgba(85,255,200,0.3) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />
              
              <p style={{ color: '#fff', fontSize: 15, margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 1, fontWeight: 500 }}>
                {vi ? 'Trực tiếp chiêm ngưỡng những thiết kế nguyên bản và cảm nhận các ý tưởng sáng tạo được hiện thực hóa trên sân khấu.' : 'Experience original designs and creative ideas brought to life on stage.'}
              </p>
            </div>

            {/* Ticket 2 */}
            <div style={{
              position: 'relative',
              background: 'linear-gradient(135deg, rgba(40,40,55,0.85), rgba(20,20,30,0.95))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '3px solid var(--purple)',
              borderRadius: 24,
              WebkitMaskImage: 'radial-gradient(circle at 0px calc(50%), transparent 14px, black 15px), radial-gradient(circle at 100% calc(50%), transparent 14px, black 15px)',
              WebkitMaskSize: '51% 100%',
              WebkitMaskPosition: '0 0, 100% 0',
              WebkitMaskRepeat: 'no-repeat',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(168,150,246,0.15)',
              padding: '40px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, height: '100%',
                background: 'radial-gradient(circle at 50% 0%, rgba(168,150,246,0.3) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />

              <p style={{ color: '#fff', fontSize: 15, margin: 0, lineHeight: 1.6, position: 'relative', zIndex: 1, fontWeight: 500 }}>
                {vi ? 'Đắm mình trong không gian thời trang, nơi mỗi thiết kế đều mang dấu ấn riêng và lan toả câu chuyện của người sáng tạo.' : 'Immerse yourself in a fashion atmosphere where every design tells a unique story.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div id="nhat-register-card" className="mfc-card" style={{ padding: '32px 24px', maxWidth: 560, width: '100%', background: 'var(--card-bg)' }}>
        {viewerSubmitStatus === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--mint)', marginBottom: 16 }}>check_circle</span>
            <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: '0 0 12px' }}>
              {vi ? 'Đăng kí thành công!' : 'Registration successful!'}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
              {vi ? 'Thông tin của bạn đã được ghi nhận. Vé sẽ được gửi qua email sau khi chúng tôi duyệt minh chứng.' : 'Your information has been recorded. The ticket will be sent via email after we verify your proof.'}
            </p>
            <button type="button" className="btn-pill" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/nhat')}>
              {vi ? 'Trở về trang Nhất' : 'Back to Nhất'}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
              <h3 className="gradient-title-hero serif" style={{ fontSize: 'clamp(20px, 4.5vw, 30px)', margin: 0, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', fontWeight: 900, textShadow: '0 0 30px rgba(168,150,246,0.6)', whiteSpace: 'nowrap' }}>
                {vi ? 'Đăng kí đến xem Nhất ngay!' : 'Register to Watch Nhất Now!'}
              </h3>
            </div>



            <form onSubmit={handleViewerSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabelStyle}>{vi ? 'Họ và tên *' : 'Full Name *'}</label>
                <input className="mfc-input" value={viewerFormData.fullName} onChange={setViewerField('fullName')} placeholder={vi ? 'Nhập họ và tên' : 'Enter your name'} />
                {viewerErrors.fullName && <p style={errorTextStyle}>{viewerErrors.fullName}</p>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabelStyle}>Email *</label>
                <input type="email" className="mfc-input" value={viewerFormData.email} onChange={setViewerField('email')} placeholder="example@gmail.com" />
                {viewerErrors.email && <p style={errorTextStyle}>{viewerErrors.email}</p>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={fieldLabelStyle}>{vi ? 'Trường *' : 'School *'}</label>
                <select
                  className="mfc-input"
                  value={viewerFormData.schoolOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setViewerFormData(f => ({ ...f, schoolOption: val, school: val === 'FTU' ? 'FTU' : '' }));
                    setViewerErrors(er => ({ ...er, schoolOption: undefined, school: undefined }));
                  }}
                  style={{ appearance: 'auto', background: 'var(--input-bg)', color: '#fff' }}
                >
                  <option value="" disabled hidden>{vi ? '-- Chọn trường --' : '-- Select School --'}</option>
                  <option value="FTU" style={{ color: '#000' }}>FTU (Đại học Ngoại Thương)</option>
                  <option value="Trường khác" style={{ color: '#000' }}>{vi ? 'Trường khác' : 'Other School'}</option>
                </select>
                {viewerErrors.schoolOption && <p style={errorTextStyle}>{viewerErrors.schoolOption}</p>}

                {viewerFormData.schoolOption === 'Trường khác' && (
                  <div style={{ marginTop: 8 }}>
                    <input className="mfc-input" value={viewerFormData.school} onChange={setViewerField('school')} placeholder={vi ? 'Nhập tên trường của bạn' : 'Enter your school name'} />
                    {viewerErrors.school && <p style={errorTextStyle}>{viewerErrors.school}</p>}
                  </div>
                )}
              </div>
              {viewerFormData.schoolOption === 'FTU' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={fieldLabelStyle}>{vi ? 'Mã sinh viên *' : 'Student ID *'}</label>
                    <input className="mfc-input" value={viewerFormData.studentId} onChange={setViewerField('studentId')} placeholder="VD: 23111111" />
                    {viewerErrors.studentId && <p style={errorTextStyle}>{viewerErrors.studentId}</p>}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={fieldLabelStyle}>{vi ? 'Lớp hành chính - ngành - khóa *' : 'Class - Major - Cohort *'}</label>
                    <input className="mfc-input" value={viewerFormData.classInfo} onChange={setViewerField('classInfo')} placeholder="VD: Anh 01 - CLCQT - K62" />
                    {viewerErrors.classInfo && <p style={errorTextStyle}>{viewerErrors.classInfo}</p>}
                  </div>
                </>
              )}
              <div style={{ marginBottom: 16 }}>
                <ImageUploadField
                  label={vi ? 'Minh chứng đã like bài mở đơn đăng kí' : 'Proof of liking the registration post'}
                  value={viewerFormData.likePostProof}
                  onChange={handleViewerFileChange('likePostProof')}
                  onRemove={() => setViewerFormData(f => ({ ...f, likePostProof: null }))}
                  error={viewerErrors.likePostProof}
                  isUploading={uploadingImage.likePostProof}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <ImageUploadField
                  label={vi ? 'Minh chứng đã like page FTU Fashion Show' : 'Proof of liking the FTU Fashion Show fanpage'}
                  helpText={<span>{vi ? 'Truy cập page tại: ' : 'Visit page at: '}<a href="https://www.facebook.com/ftufashionshow.mfc" target="_blank" rel="noopener noreferrer" style={{ color: '#a896f6', textDecoration: 'none' }}>https://www.facebook.com/ftufashionshow.mfc</a></span>}
                  value={viewerFormData.likeFfsPageProof}
                  onChange={handleViewerFileChange('likeFfsPageProof')}
                  onRemove={() => setViewerFormData(f => ({ ...f, likeFfsPageProof: null }))}
                  error={viewerErrors.likeFfsPageProof}
                  isUploading={uploadingImage.likeFfsPageProof}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <ImageUploadField
                  label={vi ? 'Minh chứng đã like page CLB MC và Thời trang ĐH Ngoại Thương' : 'Proof of liking the MFC FTU fanpage'}
                  helpText={<span>{vi ? 'Truy cập page tại: ' : 'Visit page at: '}<a href="https://www.facebook.com/mfc.ftu" target="_blank" rel="noopener noreferrer" style={{ color: '#a896f6', textDecoration: 'none' }}>https://www.facebook.com/mfc.ftu</a></span>}
                  value={viewerFormData.likePageProof}
                  onChange={handleViewerFileChange('likePageProof')}
                  onRemove={() => setViewerFormData(f => ({ ...f, likePageProof: null }))}
                  error={viewerErrors.likePageProof}
                  isUploading={uploadingImage.likePageProof}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={fieldLabelStyle}>{vi ? 'Bạn có câu hỏi gì cho BTC không? (Tùy chọn)' : 'Any questions for the organizers? (Optional)'}</label>
                <textarea className="mfc-input" rows={3} value={viewerFormData.question} onChange={setViewerField('question')} />
              </div>
              <button type="submit" className="btn-pill" style={{ width: '100%', justifyContent: 'center', opacity: (viewerSubmitStatus === 'submitting' || Object.values(uploadingImage).some(Boolean)) ? 0.7 : 1 }} disabled={viewerSubmitStatus === 'submitting' || Object.values(uploadingImage).some(Boolean)}>
                {viewerSubmitStatus === 'submitting' ? loadingText : (vi ? 'Đăng kí' : 'Register')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default NhatViewerRegisterPage;
