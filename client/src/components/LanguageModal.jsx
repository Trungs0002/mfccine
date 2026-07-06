import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageModal = () => {
  const { language, setLanguage } = useLanguage();
  if (language) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(1,1,10,.92)', backdropFilter: 'blur(20px)',
    }} className="animate-fade-in">
      <div className="mfc-card" style={{
        padding: '48px 40px', maxWidth: 480, width: '90%',
        textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center',
      }}>
        <div>
          <img src="/logo-mfc.jpeg" alt="MFC" style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(168,150,246,.4)' }} />
          <h2 className="gradient-title" style={{ fontSize: 28, margin: '0 0 10px' }}>
            MFC Fashion Show 2026
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            Chọn ngôn ngữ / Select language
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, width: '100%' }}>
          {[
            { lang: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
            { lang: 'en', flag: '🇬🇧', label: 'English' },
          ].map(({ lang, flag, label }) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                flex: 1, padding: '20px 16px',
                borderRadius: 16,
                border: '1px solid var(--line)',
                background: 'rgba(14,16,44,.6)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14, fontWeight: 700,
                letterSpacing: '.04em',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'border-color .2s, background .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.background = 'rgba(70,69,215,.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'rgba(14,16,44,.6)'; }}
            >
              <span style={{ fontSize: 28 }}>{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
