import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

// CRA hashes the JS bundle filename on every build, so a changed hash in
// index.html means a new deploy has gone out since this tab was opened.
const extractBuildId = (html) => {
  const match = html.match(/\/static\/js\/main\.[a-zA-Z0-9]+\.js/);
  return match ? match[0] : null;
};

const UpdateBanner = () => {
  const { language } = useLanguage();
  const vi = language === 'vi';
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const currentBuildRef = useRef(null);

  useEffect(() => {
    const checkForUpdate = () => {
      fetch('/index.html', { cache: 'no-store' })
        .then(res => res.text())
        .then(html => {
          const buildId = extractBuildId(html);
          if (!buildId) return;
          if (currentBuildRef.current === null) {
            currentBuildRef.current = buildId;
          } else if (buildId !== currentBuildRef.current) {
            setUpdateAvailable(true);
          }
        })
        .catch(() => {});
    };

    checkForUpdate();
    const intervalId = setInterval(checkForUpdate, 5 * 60 * 1000);
    const onVisibility = () => { if (document.visibilityState === 'visible') checkForUpdate(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', checkForUpdate);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', checkForUpdate);
    };
  }, []);

  if (!updateAvailable) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'rgba(10,8,20,.95)', border: '1px solid var(--mint)',
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,.5)', fontSize: 14, backdropFilter: 'blur(8px)',
    }}>
      <span>{vi ? 'Đã có bản cập nhật mới' : 'A new version is available'}</span>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: 'var(--mint)', color: '#000', border: 'none', borderRadius: 6,
          padding: '6px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
        }}
      >
        {vi ? 'Tải lại' : 'Reload'}
      </button>
    </div>
  );
};

export default UpdateBanner;
