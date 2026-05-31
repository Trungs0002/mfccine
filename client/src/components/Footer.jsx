import React from 'react';

const Footer = ({ setView, setIsAdminMode }) => {
  return (
    <footer className="bg-surface-container-lowest w-full border-t border-outline-variant/15 relative z-10">
      <div className="flex flex-col gap-12 px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Headline brand label */}
          <div 
            onClick={() => {
              setIsAdminMode(false);
              setView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display-xl text-display-xl text-on-surface italic tracking-tight cursor-pointer hover:opacity-85 select-none transition-opacity"
          >
            MFC FTU
          </div>

          {/* Links navigation columns */}
          <nav className="flex flex-wrap gap-x-8 gap-y-4">
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              Club Mission
            </span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              Press
            </span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              Sustainability
            </span>
            <span className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-sm text-label-sm uppercase tracking-widest cursor-pointer select-none">
              Terms of Service
            </span>
          </nav>
        </div>

        <div className="text-tertiary-fixed-dim font-body-md text-[14px] pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between gap-4">
          <span>© 2026 MFC FTU. Elevating fashion through editorial excellence.</span>
          <span className="text-[12px] opacity-60">Handcrafted utilizing Stitch luxury dark presets.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
