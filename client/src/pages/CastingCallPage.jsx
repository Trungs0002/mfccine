import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const CastingCallPage = () => {
  const { language } = useLanguage();
  const vi = language === 'vi';

  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 20px 80px',
      }}
    >
      <div style={{
        width: 84, height: 84, borderRadius: '50%', marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(168,150,246,.35)', background: 'rgba(168,150,246,.06)',
        boxShadow: '0 0 40px rgba(168,150,246,.25)',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--mint)' }}>visibility_off</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ height: 1, width: 32, background: 'var(--mint)' }} />
        <div style={{ fontSize: 11, color: 'var(--mint)', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 600 }}>
          Casting Call
        </div>
        <div style={{ height: 1, width: 32, background: 'var(--mint)' }} />
      </div>

      <h1 className="gradient-title-hero serif" style={{ fontSize: 'clamp(40px, 8vw, 80px)', fontWeight: 800, letterSpacing: '.08em', margin: '0 0 20px' }}>
        COMING SOON
      </h1>

      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.8, maxWidth: 460, margin: 0 }}>
        {vi
          ? ''
          : ''}
      </p>
    </div>
  );
};

export default CastingCallPage;
