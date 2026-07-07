import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const FacebookIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const InstagramIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>;
const TiktokIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 003.5 16.5a6.34 6.34 0 0010.86 4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" /></svg>;

const Footer = ({ setIsAdminMode, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const quickLinks = [
    { label: vi ? 'Mua vé' : 'Tickets', path: '/' },
    { label: vi ? 'Giới thiệu' : 'About', path: '/about' },
    { label: vi ? 'Cộng tác viên' : 'Collaborate', path: '/recruit' },
    { label: '"Nhất"', path: '#' },
    { label: 'Casting Call', path: '#' },
  ];

  return (
    <footer className="site-footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand column */}
          <div>
            <div className="footer-brand">
              <img src="/logo-mfc.png" alt="MFC logo" />
              <div>
                <h4 style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#fff', margin: '0 0 4px' }}>
                  {settings?.siteName || 'MFC & FASHION CLUB'}
                </h4>
                <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.06em' }}>
                  FOREIGN TRADE UNIVERSITY
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, marginTop: 16, whiteSpace: 'pre-line' }}>
              {vi
                ? 'MC, Người mẫu, Sáng tạo thời trang và Tổ chức sự kiện.\nHơn cả một sở thích, hơn cả một đam mê.\nHơn cả một CLB.\nLà MFC.'
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
            <a href="mailto:nnkhanhhuyen.mfc@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--purple)' }}>mail</span>
              nnkhanhhuyen.mfc@gmail.com
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
              <a href="tel:0374748310" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--purple)' }}>phone</span>
                037 474 8310 (Ms. Khánh Huyền)
              </a>
              <a href="tel:0961972458" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'transparent' }}>phone</span>
                096 197 2458 (Ms. Hiền Anh)
              </a>
            </div>
            <span style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--muted)', fontSize: 13, lineHeight: 1.5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--purple)', marginTop: 2 }}>location_on</span>
              Văn phòng các CLB, nhà B<br />trường ĐH Ngoại Thương<br />91 Chùa Láng - Láng Thượng - Đống Đa - Hà Nội
            </span>
          </div>

          {/* Social */}
          <div className="footer-col">
            <h4>{vi ? 'Theo dõi chúng tôi' : 'Follow Us'}</h4>
            <div className="footer-social">
              {[
                { icon: <FacebookIcon />, label: 'Facebook', url: 'https://facebook.com/mfc.ftu' },
                { icon: <InstagramIcon />, label: 'Instagram', url: 'https://www.instagram.com/mfc.ftu' },
                { icon: <TiktokIcon />, label: 'TikTok', url: 'https://www.tiktok.com/@mfc.ftu' },
              ].map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="footer-social-icon" title={s.label} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </a>
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
