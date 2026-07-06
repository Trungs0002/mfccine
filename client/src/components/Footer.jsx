import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = ({ setIsAdminMode, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const quickLinks = [
    { label: vi ? 'Trang chủ'     : 'Home',        path: '/' },
    { label: vi ? 'Giới thiệu'    : 'About',       path: '/about' },
    { label: vi ? 'Mua vé'        : 'Tickets',     path: '/seating' },
    { label: vi ? 'Sơ đồ ghế'    : 'Seat Map',    path: '/seating' },
    { label: vi ? 'Cộng tác viên' : 'Collaborate', path: '/recruit' },
    { label: vi ? 'Liên hệ'       : 'Contact',     path: null },
  ];

  return (
    <footer className="site-footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <div className="footer-brand">
              <img src="/logo-mfc.jpeg" alt="MFC logo" />
              <div>
                <h4 style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#fff', margin: '0 0 4px' }}>
                  {settings?.siteName || 'MFC & FASHION CLUB'}
                </h4>
                <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em' }}>
                  FOREIGN TRADE UNIVERSITY
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, marginTop: 16 }}>
              {vi
                ? 'MFC & Fashion Club – Trường Đại học Ngoại thương.\nKết nối đam mê – Lan tỏa giá trị – Tỏa sáng bản thân.'
                : 'MFC & Fashion Club – Foreign Trade University.\nConnect passion – Spread value – Shine your way.'}
            </p>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>{vi ? 'Liên kết nhanh' : 'Quick Links'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              {quickLinks.map(l => (
                <button key={l.label}
                  onClick={() => {
                    if (l.path === null) {
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate(l.path);
                      window.scrollTo(0, 0);
                    }
                  }}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, lineHeight: 1.9, textAlign: 'left', padding: 0, transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>{vi ? 'Liên hệ' : 'Contact'}</h4>
            <a href="mailto:mfc.ftu@ftu.edu.vn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--purple)' }}>mail</span>
              mfc.ftu@ftu.edu.vn
            </a>
            <a href="tel:02437547865" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--purple)' }}>phone</span>
              024 3754 7865
            </a>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 14 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--purple)' }}>location_on</span>
              91 Chùa Láng, Đống Đa, Hà Nội
            </span>
          </div>

          {/* Social */}
          <div className="footer-col">
            <h4>{vi ? 'Theo dõi chúng tôi' : 'Follow Us'}</h4>
            <div className="footer-social">
              {[
                { icon: 'f', label: 'Facebook' },
                { icon: '◎', label: 'Instagram' },
                { icon: '♪', label: 'TikTok' },
                { icon: '▶', label: 'YouTube' },
              ].map(s => (
                <div key={s.label} className="footer-social-icon" title={s.label}>
                  {s.icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-copyright">
          © 2026 MFC & Fashion Club – Trường Đại học Ngoại thương. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
