import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const fieldLabelStyle = { display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 };
const errorTextStyle = { color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' };

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ImageUploadField = ({ label, helpText, value, onChange, onRemove, error }) => {
  const inputRef = useRef(null);
  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '';
    onRemove();
  };
  return (
    <div>
      <label style={fieldLabelStyle}>{label} *</label>
      {helpText && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: -4, marginBottom: 8 }}>{helpText}</p>}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={onChange} className="mfc-input" style={{ padding: '10px 16px', cursor: 'pointer' }} />
      {value && (
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
    const base64 = await fileToBase64(file);
    setViewerFormData(f => ({ ...f, [field]: base64 }));
    setViewerErrors(er => (er[field] ? { ...er, [field]: undefined } : er));
  };

  const handleViewerSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!viewerFormData.fullName.trim()) newErrors.fullName = vi ? 'Vui lòng nhập họ và tên' : 'Please enter your full name';
    if (!viewerFormData.email.trim()) newErrors.email = vi ? 'Vui lòng nhập email' : 'Please enter your email';
    else if (!/^\S+@\S+\.\S+$/.test(viewerFormData.email)) newErrors.email = vi ? 'Email không hợp lệ' : 'Invalid email';
    if (!viewerFormData.schoolOption) newErrors.schoolOption = vi ? 'Vui lòng chọn trường' : 'Please select a school';
    else if (viewerFormData.schoolOption === 'Trường khác' && !viewerFormData.school.trim()) newErrors.school = vi ? 'Vui lòng nhập tên trường' : 'Please enter your school';
    if (!viewerFormData.studentId.trim()) newErrors.studentId = vi ? 'Vui lòng nhập MSSV' : 'Please enter your student ID';
    if (!viewerFormData.classInfo.trim()) newErrors.classInfo = vi ? 'Vui lòng nhập lớp - ngành - khóa' : 'Please enter class - major - cohort';
    if (!viewerFormData.likePostProof) newErrors.likePostProof = vi ? 'Vui lòng tải lên minh chứng bài viết' : 'Please upload proof';
    if (!viewerFormData.likePageProof) newErrors.likePageProof = vi ? 'Vui lòng tải lên minh chứng trang MFC' : 'Please upload proof';
    if (!viewerFormData.likeFfsPageProof) newErrors.likeFfsPageProof = vi ? 'Vui lòng tải lên minh chứng trang FTU Fashion Show' : 'Please upload proof';

    if (Object.keys(newErrors).length > 0) {
      setViewerErrors(newErrors);
      return;
    }

    setViewerSubmitStatus('submitting');
    try {
      const res = await fetch(`${API_URL}/api/nhat/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viewerFormData),
      });
      if (res.ok) {
        setViewerSubmitStatus('success');
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
    <div className="animate-fade-in nhat-page" style={{ paddingTop: 96, paddingBottom: 64, display: 'flex', justifyContent: 'center' }}>
      <div className="mfc-card" style={{ padding: '32px 24px', maxWidth: 560, width: '100%', background: 'var(--card-bg)' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>
                {vi ? 'Đăng kí đến xem Nhất' : 'Register to Watch Nhất'}
              </h3>
              <button type="button" onClick={() => navigate('/nhat')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
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
              <div style={{ marginBottom: 16 }}>
                <ImageUploadField
                  label={vi ? 'Minh chứng đã like bài mở đơn đăng kí' : 'Proof of liking the registration post'}
                  value={viewerFormData.likePostProof}
                  onChange={handleViewerFileChange('likePostProof')}
                  onRemove={() => setViewerFormData(f => ({ ...f, likePostProof: null }))}
                  error={viewerErrors.likePostProof}
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
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={fieldLabelStyle}>{vi ? 'Bạn có câu hỏi gì cho BTC không? (Tùy chọn)' : 'Any questions for the organizers? (Optional)'}</label>
                <textarea className="mfc-input" rows={3} value={viewerFormData.question} onChange={setViewerField('question')} />
              </div>
              <button type="submit" className="btn-pill" style={{ width: '100%', justifyContent: 'center' }} disabled={viewerSubmitStatus === 'submitting'}>
                {viewerSubmitStatus === 'submitting' ? (vi ? 'Đang xử lý...' : 'Processing...') : (vi ? 'Đăng kí' : 'Register')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default NhatViewerRegisterPage;
