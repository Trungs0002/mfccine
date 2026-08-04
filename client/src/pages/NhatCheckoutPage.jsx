import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../context/LanguageContext';

import { API_URL } from '../apiConfig';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png)$/i;

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

const ImageUploadField = ({ label, value, onChange, onRemove, error }) => {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</label>
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 240 }}>
          <img src={value} alt="Preview" style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(168,150,246,.3)' }} />
          <button type="button" onClick={onRemove} style={{ position: 'absolute', top: -10, right: -10, background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input type="file" accept="image/png, image/jpeg" onChange={onChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
          <div style={{ padding: '24px', border: '1px dashed rgba(168,150,246,.4)', borderRadius: 8, textAlign: 'center', background: 'rgba(168,150,246,.05)', transition: 'all 0.3s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'var(--mint)', marginBottom: 8 }}>cloud_upload</span>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Nhấp để tải ảnh lên (JPG, PNG)</p>
          </div>
        </div>
      )}
      {error && <p style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6, margin: '6px 0 0' }}>{error}</p>}
    </div>
  );
};

const NhatCheckoutPage = () => {
  const { language } = useLanguage();
  const vi = language === 'vi';
  const pageUrl = window.location.href; // Generate QR for this page

  const [formData, setFormData] = useState({
    ticketCode: '',
    fullName: '',
    schoolOption: '',
    school: '',
    studentId: '',
    classInfo: '',
    proofImage: null
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'

  const setField = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isAllowed = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.test(file.name);
    if (!isAllowed) {
      setErrors(er => ({ ...er, proofImage: vi ? 'Chỉ chấp nhận ảnh định dạng JPG, JPEG hoặc PNG.' : 'Only JPG, JPEG, or PNG images are accepted.' }));
      e.target.value = '';
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setErrors(er => ({ ...er, proofImage: vi ? 'Kích thước file vượt quá 200MB.' : 'File size exceeds 200MB.' }));
      e.target.value = '';
      return;
    }
    const base64 = await fileToBase64(file);
    setFormData(f => ({ ...f, proofImage: base64 }));
    setErrors(er => (er.proofImage ? { ...er, proofImage: undefined } : er));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.ticketCode.trim()) newErrors.ticketCode = 'Vui lòng nhập mã vé';
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.schoolOption) newErrors.schoolOption = 'Vui lòng chọn trường';
    else if (formData.schoolOption === 'Trường khác' && !formData.school.trim()) newErrors.school = 'Vui lòng nhập tên trường';
    if (formData.schoolOption === 'FTU') {
      if (!formData.studentId.trim()) newErrors.studentId = 'Vui lòng nhập MSSV';
      if (!formData.classInfo.trim()) newErrors.classInfo = 'Vui lòng nhập Lớp - Ngành - Khóa';
    }
    if (!formData.proofImage) newErrors.proofImage = 'Vui lòng tải ảnh minh chứng';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('submitting');
    try {
      const payload = { ...formData };
      if (payload.schoolOption === 'Trường khác') {
        payload.studentId = 'Trường khác';
        payload.classInfo = 'Trường khác';
      }

      const res = await fetch(`${API_URL}/api/nhat/checkouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus('success');
        window.scrollTo(0, 0);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '120px 20px 40px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* QR Code Section */}
        <div className="mfc-card animate-fade-in" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 24 }}>
          <h2 className="serif" style={{ color: '#fff', fontSize: 24, margin: '0 0 16px' }}>Checkout Sự kiện Nhất</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Quét mã QR để truy cập trang này trên điện thoại</p>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, display: 'inline-block' }}>
            <QRCodeSVG value={pageUrl} size={180} />
          </div>
        </div>

        {/* Form Section */}
        <div className="mfc-card animate-fade-in" style={{ padding: '32px 24px', animationDelay: '0.1s' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--mint)', marginBottom: 16 }}>check_circle</span>
              <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: '0 0 12px' }}>Checkout thành công!</h3>
              <p style={{ color: 'var(--muted)' }}>Cảm ơn bạn đã tham gia sự kiện Nhất. Hẹn gặp lại bạn lần sau!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Mã vé *</label>
                <input className="mfc-input" value={formData.ticketCode} onChange={setField('ticketCode')} placeholder="VD: NHATXXXXXX" />
                {errors.ticketCode && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{errors.ticketCode}</p>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Họ và tên *</label>
                <input className="mfc-input" value={formData.fullName} onChange={setField('fullName')} placeholder="Nhập họ và tên" />
                {errors.fullName && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{errors.fullName}</p>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Trường *</label>
                <select
                  className="mfc-input"
                  value={formData.schoolOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, schoolOption: val, school: val === 'FTU' ? 'FTU' : '' }));
                    setErrors(er => ({ ...er, schoolOption: null, school: null }));
                  }}
                  style={{ appearance: 'auto', background: 'var(--input-bg)', color: '#fff' }}
                >
                  <option value="" disabled hidden>-- Chọn trường --</option>
                  <option value="FTU" style={{ color: '#000' }}>FTU (Đại học Ngoại Thương)</option>
                  <option value="Trường khác" style={{ color: '#000' }}>Trường khác</option>
                </select>
                {errors.schoolOption && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{errors.schoolOption}</p>}

                {formData.schoolOption === 'Trường khác' && (
                  <div style={{ marginTop: 8 }}>
                    <input className="mfc-input" value={formData.school} onChange={setField('school')} placeholder="Nhập tên trường của bạn" />
                    {errors.school && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{errors.school}</p>}
                  </div>
                )}
              </div>

              {formData.schoolOption === 'FTU' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Mã sinh viên *</label>
                    <input className="mfc-input" value={formData.studentId} onChange={setField('studentId')} placeholder="VD: 23111111" />
                    {errors.studentId && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{errors.studentId}</p>}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Lớp hành chính - ngành - khóa *</label>
                    <input className="mfc-input" value={formData.classInfo} onChange={setField('classInfo')} placeholder="VD: Anh 01 - CLCQT - K62" />
                    {errors.classInfo && <p style={{ color: '#ff6b6b', fontSize: 12, margin: '6px 0 0' }}>{errors.classInfo}</p>}
                  </div>
                </>
              )}

              <div style={{ marginBottom: 24 }}>
                <ImageUploadField
                  label="Ảnh chụp minh chứng có mặt cuối sự kiện *"
                  value={formData.proofImage}
                  onChange={handleFileChange}
                  onRemove={() => setFormData(f => ({ ...f, proofImage: null }))}
                  error={errors.proofImage}
                />
              </div>

              <button type="submit" className="btn-pill" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Đang xử lý...' : 'Checkout'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NhatCheckoutPage;
