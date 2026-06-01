import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ isAdminMode, user, onLogout, settings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const isViewActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/65 backdrop-blur-xl border-b border-outline-variant/15 transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-10">
          {/* Brand Logo */}
          <div 
            onClick={() => navigate('/')}
            className="font-title-md text-title-md italic text-on-surface cursor-pointer select-none hover:opacity-80 transition-opacity shrink-0"
          >
            {settings?.siteName || 'EVENT PRO'}
          </div>

          {/* Central Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {!isAdminMode ? (
              <>
                <button 
                  onClick={() => navigate('/')}
                  className={`font-label-sm text-[12px] uppercase tracking-widest px-3 py-2 rounded transition-all duration-300 ${
                    isViewActive('/')
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
                  }`}
                >
                  {t('events')}
                </button>
                {user && (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className={`font-label-sm text-[12px] uppercase tracking-widest px-3 py-2 rounded transition-all duration-300 ${
                      isViewActive('/dashboard') || isViewActive('/ticket')
                        ? 'text-primary font-bold border-b-2 border-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
                    }`}
                  >
                    {t('myTickets')}
                  </button>
                )}
              </>
            ) : (
              <span className="font-label-sm text-[11px] text-secondary uppercase tracking-widest px-3 py-2 border border-secondary/30 bg-secondary/5 rounded-lg select-none">
                Control Panel Active
              </span>
            )}
          </nav>
        </div>

        {/* Right Section: Language Toggle, Auth & Portal */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* Language Toggle (EN/VI) */}
          <div className="flex bg-surface-container-low/60 border border-outline-variant/30 rounded-full p-1 select-none shadow-inner">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all duration-300 ${language === 'en' ? 'bg-primary text-black shadow-md' : 'text-on-surface-variant hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('vi')}
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all duration-300 ${language === 'vi' ? 'bg-primary text-black shadow-md' : 'text-on-surface-variant hover:text-white'}`}
            >
              VI
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                {user.role === 'admin' && (
                  <button 
                    onClick={() => navigate(isAdminMode ? '/' : '/admin')}
                    className="flex items-center gap-2 border border-outline-variant/40 bg-surface-container-low/40 px-5 py-3 rounded-lg text-[12px] font-label-sm uppercase tracking-widest hover:border-primary/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      {isAdminMode ? 'account_circle' : 'admin_panel_settings'}
                    </span>
                    <span className="hidden sm:inline">{isAdminMode ? t('switchClient') : t('switchAdmin')}</span>
                  </button>
                )}
                
                <button 
                  onClick={onLogout}
                  className="bg-surface-container-highest text-on-surface border border-outline-variant/30 px-6 py-3 rounded font-label-sm text-[12px] uppercase tracking-widest hover:bg-white hover:text-background transition-colors"
                >
                  {t('logOut')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2 md:gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-on-surface-variant hover:text-primary px-3 md:px-4 py-2 text-[12px] font-label-sm uppercase tracking-widest transition-colors"
                >
                  {t('signIn')}
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-primary text-on-primary px-6 md:px-8 py-3 rounded font-label-sm text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg font-bold"
                >
                  {t('join')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
