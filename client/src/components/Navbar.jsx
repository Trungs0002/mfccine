import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ isAdminMode, user, onLogout, settings, selectedEvent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const isActive = (path) => location.pathname === path;

  const ticketsPath = selectedEvent ? `/event/${selectedEvent._id}` : '/seating';

  const navLinks = isAdminMode
    ? null
    : [
        { label: language === 'vi' ? 'Trang chủ'      : 'Home',         path: '/' },
        { label: language === 'vi' ? 'Giới thiệu'     : 'About',        path: '/about' },
        { label: language === 'vi' ? 'Mua vé'         : 'Tickets',      path: ticketsPath },
        { label: language === 'vi' ? 'Sơ đồ ghế'     : 'Seat Map',     path: '/seating' },
        { label: language === 'vi' ? 'Cộng tác viên'  : 'Collaborate',  path: '/recruit' },
        { label: language === 'vi' ? 'Liên hệ'        : 'Contact',      path: null },
      ];

  return (
    <header className="site-header">
      <nav className="site-nav">
        {/* Brand */}
        <div className="nav-brand" onClick={() => navigate('/')}>
          <img src="/logo-mfc.jpeg" alt="MFC logo" />
          <div className="nav-brand-text">
            <strong>{settings?.siteName || 'MFC & FASHION CLUB'}</strong>
            <span>FOREIGN TRADE UNIVERSITY</span>
          </div>
        </div>

        {/* Center nav links (desktop) */}
        {!isAdminMode && (
          <div className="nav-links hidden lg:flex">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => {
                  if (link.path === null) {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate(link.path);
                    window.scrollTo(0, 0);
                  }
                }}
                className={link.path && isActive(link.path) ? 'active' : ''}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        {isAdminMode && (
          <span style={{
            fontSize: '11px',
            color: 'var(--mint)',
            textTransform: 'uppercase',
            letterSpacing: '.1em',
            border: '1px solid rgba(158,254,253,.3)',
            background: 'rgba(158,254,253,.06)',
            borderRadius: 8,
            padding: '6px 14px',
          }}>
            Control Panel
          </span>
        )}

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {/* Language toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(1,1,10,.5)',
            border: '1px solid var(--line)',
            borderRadius: 999,
            padding: 3,
            gap: 2,
          }}>
            {['vi', 'en'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.06em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background .2s, color .2s',
                  background: language === lang
                    ? 'linear-gradient(135deg, var(--ultra), var(--purple))'
                    : 'transparent',
                  color: language === lang ? '#fff' : 'var(--muted)',
                  boxShadow: language === lang ? '0 0 10px rgba(168,150,246,.4)' : 'none',
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Auth + Admin actions */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate(isAdminMode ? '/' : '/admin')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px',
                    borderRadius: 999,
                    border: '1px solid var(--line)',
                    background: 'rgba(1,1,10,.4)',
                    color: 'var(--purple)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '.04em',
                    whiteSpace: 'nowrap',
                    transition: 'border-color .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--purple)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    {isAdminMode ? 'home' : 'admin_panel_settings'}
                  </span>
                  <span className="hidden sm:inline">{isAdminMode ? (language === 'vi' ? 'Trang chủ' : 'Home') : 'Admin'}</span>
                </button>
              )}
              <button
                onClick={onLogout}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,.2)',
                  background: 'rgba(255,255,255,.06)',
                  color: 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '.04em',
                  transition: 'color .2s, background .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
              >
                {language === 'vi' ? 'Đăng xuất' : 'Log Out'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: 'none',
                  background: 'none',
                  color: 'var(--muted)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'color .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
              >
                {language === 'vi' ? 'Đăng nhập' : 'Sign In'}
              </button>
              <button
                onClick={() => navigate('/seating')}
                className="btn-pill btn-pill-sm"
              >
                {language === 'vi' ? 'Mua vé ngay ✦' : 'Buy Tickets ✦'}
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
