import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageModal = () => {
  const { language, setLanguage } = useLanguage();

  if (language) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl animate-fade-in">
      <div className="glass-panel p-10 md:p-16 rounded-3xl border border-outline-variant/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col items-center gap-12 max-w-[500px] w-[90%] text-center">
        <div className="space-y-4">
          <h2 className="font-display-xl text-[32px] text-on-surface italic tracking-tight">Welcome to Editorial Ticketing</h2>
          <p className="font-body-md text-on-surface-variant">Please select your preferred language to continue.</p>
          <div className="w-12 h-[1px] bg-primary/30 mx-auto mt-6"></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <button 
            onClick={() => setLanguage('en')}
            className="flex-1 bg-surface-container-high hover:bg-white hover:text-black text-on-surface p-6 rounded-2xl border border-outline-variant/30 transition-all group flex flex-col items-center gap-2"
          >
            <span className="text-[24px]">🇬🇧</span>
            <span className="font-label-sm text-[13px] uppercase tracking-widest font-bold">English</span>
          </button>
          
          <button 
            onClick={() => setLanguage('vi')}
            className="flex-1 bg-surface-container-high hover:bg-white hover:text-black text-on-surface p-6 rounded-2xl border border-outline-variant/30 transition-all group flex flex-col items-center gap-2"
          >
            <span className="text-[24px]">🇻🇳</span>
            <span className="font-label-sm text-[13px] uppercase tracking-widest font-bold">Tiếng Việt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
