import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      } else {
        setError(data.error || (vi ? 'Đăng nhập thất bại.' : 'Login failed.'));
      }
    } catch {
      setError(vi ? 'Lỗi kết nối. Vui lòng thử lại.' : 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px' }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Card */}
        <div className="mfc-card animate-fade-in" style={{ padding: '40px 36px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="/logo-mfc.png" alt="MFC" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(168,150,246,.4)', display: 'block' }} />
            <h1 className="gradient-title" style={{ fontSize: 28, margin: '0 0 6px' }}>
              {vi ? 'Đăng nhập' : 'Sign In'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              {vi ? 'Chào mừng trở lại với MFC ✦' : 'Welcome back to MFC ✦'}
            </p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,107,107,.1)', border: '1px solid rgba(255,107,107,.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#ff6b6b', fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mfc-input"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {vi ? 'Mật khẩu' : 'Password'}
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mfc-input"
                placeholder="••••••••"
                style={{ fontFamily: 'monospace' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill"
              style={{ justifyContent: 'center', fontSize: 15, padding: '15px 20px', marginTop: 6 }}
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span> {vi ? 'Đang xử lý...' : 'Signing in...'}</>
              ) : (
                vi ? 'Đăng nhập →' : 'Sign In →'
              )}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(168,150,246,.18)', textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            {vi ? 'Chưa có tài khoản?' : 'New here?'}{' '}
            <Link to="/register" style={{ color: 'var(--purple)', fontWeight: 700 }}>
              {vi ? 'Đăng ký ngay' : 'Create account'}
            </Link>
          </div>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate('/')}
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

export default LoginPage;
