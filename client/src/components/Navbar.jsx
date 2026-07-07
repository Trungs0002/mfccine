import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ isAdminMode, user, onLogout, settings, selectedEvent }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const ticketsPath = selectedEvent ? `/event/${selectedEvent._id}` : '/seating';

  const navLinks = isAdminMode
    ? null
    : [
        { label: language === 'vi' ? 'Trang chủ'      : 'Home',         path: '/' },
        { label: language === 'vi' ? 'Giới thiệu'     : 'About',        path: '/about' },
        { label: language === 'vi' ? 'Mua vé'         : 'Tickets',      path: ticketsPath },
        { label: language === 'vi' ? 'Cộng tác viên'  : 'Collaborate',  path: '/recruit' },
        { label: language === 'vi' ? '"Nhất"'         : '"Nhất"',       path: '#' },
        { label: language === 'vi' ? 'Casting Call'   : 'Casting Call', path: '#' },
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
          <div className="nav-links nav-links-desktop">
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
          <div className="nav-links-desktop" style={{
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
            <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                onClick={() => navigate('/dashboard')}
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
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
                <span className="hidden sm:inline">{language === 'vi' ? 'Tài khoản' : 'Profile'}</span>
              </button>
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
            <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                onClick={() => { setIsMobileMenuOpen(false); navigate('/seating'); }}
                className="btn-pill btn-pill-sm hidden sm:inline-flex"
              >
                {language === 'vi' ? 'Mua vé ngay ✦' : 'Buy Tickets ✦'}
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          {!isAdminMode && (
            <button
              className="mobile-only"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, marginLeft: 4
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {!isAdminMode && isMobileMenuOpen && (
        <div className="mobile-only animate-fade-in" style={{
          position: 'absolute', top: 84, left: 12, right: 12, pointerEvents: 'auto',
          background: 'rgba(1,1,10,.95)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--line)', borderRadius: 22,
          padding: '20px', zIndex: 40,
          display: 'flex', flexDirection: 'column', gap: 12,
          boxShadow: '0 20px 40px rgba(0,0,0,.5)'
        }}>
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (link.path === null) {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate(link.path);
                  window.scrollTo(0, 0);
                }
              }}
              style={{
                background: 'none', border: 'none',
                color: link.path && isActive(link.path) ? '#fff' : 'var(--muted)',
                fontSize: 16, textAlign: 'left', padding: '12px 16px',
                fontFamily: 'inherit', fontWeight: link.path && isActive(link.path) ? 600 : 400,
                borderBottom: '1px solid rgba(255,255,255,.05)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {link.label}
                {link.path && isActive(link.path) && (
                  <div style={{
                    position: 'absolute', left: '50%', bottom: -6, width: 34, height: 2, transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, transparent, var(--purple), var(--mint), transparent)',
                    boxShadow: '0 0 12px var(--purple)'
                  }} />
                )}
              </div>
              <span style={{ color: 'var(--purple)', fontSize: 18 }}>→</span>
            </button>
          ))}
          {/* Mobile Actions Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8, borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20 }}>
            {/* Language toggle (Mobile) */}
            <div style={{
              display: 'flex',
              background: 'rgba(1,1,10,.5)',
              border: '1px solid var(--line)',
              borderRadius: 999,
              padding: 3,
              gap: 2,
              alignSelf: 'flex-start'
            }}>
              {['vi', 'en'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 999,
                    fontSize: 12,
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

            {/* Auth actions (Mobile) */}
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }}
                  className="btn-outline-pill" style={{ justifyContent: 'center', borderColor: 'var(--purple)', color: 'var(--purple)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6 }}>person</span>
                  {language === 'vi' ? 'Tài khoản' : 'Profile'}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); navigate(isAdminMode ? '/' : '/admin'); }}
                    className="btn-outline-pill" style={{ justifyContent: 'center' }}
                  >
                    {isAdminMode ? (language === 'vi' ? 'Trang chủ' : 'Home') : 'Admin Panel'}
                  </button>
                )}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                  className="btn-outline-pill" style={{ justifyContent: 'center' }}
                >
                  {language === 'vi' ? 'Đăng xuất' : 'Log Out'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                  className="btn-outline-pill" style={{ justifyContent: 'center' }}
                >
                  {language === 'vi' ? 'Đăng nhập' : 'Sign In'}
                </button>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/seating'); }}
                  className="btn-pill" style={{ justifyContent: 'center' }}
                >
                  {language === 'vi' ? 'Mua vé ngay ✦' : 'Buy Tickets ✦'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
