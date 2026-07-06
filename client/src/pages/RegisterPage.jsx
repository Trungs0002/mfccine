import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const RegisterPage = ({ setUser }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [fullName, setFullName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError(vi ? 'Mật khẩu không khớp.' : 'Passwords do not match.');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/');
      } else {
        setError(data.error || (vi ? 'Đăng ký thất bại.' : 'Registration failed.'));
      }
    } catch {
      setError(vi ? 'Lỗi kết nối.' : 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px' }}>
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div className="mfc-card animate-fade-in" style={{ padding: '40px 36px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo-mfc.jpeg" alt="MFC" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(168,150,246,.4)', display: 'block' }} />
            <h1 className="gradient-title" style={{ fontSize: 28, margin: '0 0 6px' }}>
              {vi ? 'Tạo tài khoản' : 'Join MFC'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              {vi ? 'Đăng ký để đặt vé và theo dõi sự kiện ✦' : 'Register to book tickets and track events ✦'}
            </p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#ff6b6b', fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                {vi ? 'Họ và tên' : 'Full Name'}
              </label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mfc-input" placeholder={vi ? 'Nguyễn Văn A' : 'John Doe'} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mfc-input" placeholder="email@example.com" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  {vi ? 'Mật khẩu' : 'Password'}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mfc-input" placeholder="••••••••" style={{ fontFamily: 'monospace' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  {vi ? 'Xác nhận MK' : 'Confirm'}
                </label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mfc-input" placeholder="••••••••" style={{ fontFamily: 'monospace' }} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-pill" style={{ justifyContent: 'center', fontSize: 15, padding: '15px 20px', marginTop: 6 }}>
              {loading ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span> {vi ? 'Đang xử lý...' : 'Creating...'}</>
              ) : (
                vi ? 'Tạo tài khoản →' : 'Create Account →'
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(168,150,246,.18)', textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            {vi ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
            <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 700 }}>
              {vi ? 'Đăng nhập' : 'Sign In'}
            </Link>
          </div>
        </div>

        <button onClick={() => navigate('/')}
          style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'color .2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>keyboard_backspace</span>
          {vi ? 'Về trang chủ' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
