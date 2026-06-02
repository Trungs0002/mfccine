import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = ({ setIsAdminMode, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <footer className="bg-surface-container-lowest w-full border-t border-outline-variant/15 relative z-10">
      <div className="flex flex-col gap-12 px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Headline brand label */}
          <div 
            onClick={() => {
              setIsAdminMode(false);
              navigate('/');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display-xl text-display-xl text-on-surface italic tracking-tight cursor-pointer hover:opacity-85 select-none transition-opacity"
          >
            {settings?.siteName || 'EVENT PRO'}
          </div>

          {/* Links navigation columns */}
          <nav className="flex flex-wrap gap-x-8 gap-y-4">
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              {language === 'vi' ? 'Sứ mệnh' : 'Club Mission'}
            </span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              {language === 'vi' ? 'Báo chí' : 'Press'}
            </span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              {language === 'vi' ? 'Bền vững' : 'Sustainability'}
            </span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              {language === 'vi' ? 'Điều khoản' : 'Terms of Service'}
            </span>
          </nav>
        </div>

        <div className="text-tertiary-fixed-dim font-body-md text-[14px] pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between gap-4">
          <span>© 2026 {settings?.siteName || 'EVENT PRO'}. {language === 'vi' ? 'Nâng tầm trải nghiệm đẳng cấp.' : 'Elevating experiences through excellence.'}</span>
          <span className="text-[12px] opacity-60">{language === 'vi' ? 'Thiết kế bởi Stitch Editorial.' : 'Handcrafted utilizing luxury dark presets.'}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
