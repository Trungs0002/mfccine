import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ isAdminMode, setIsAdminMode, userEmail, setEvent, settings }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isViewActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/65 backdrop-blur-xl border-b border-outline-variant/15 transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        {/* Brand Logo */}
        <div 
          onClick={() => {
            setIsAdminMode(false);
            navigate('/');
          }}
          className="font-title-md text-title-md italic text-on-surface cursor-pointer select-none hover:opacity-80 transition-opacity"
        >
          {settings?.siteName || 'EVENT PRO'}
        </div>

        {/* Central Nav Links (User Mode vs Admin Mode) */}
        <nav className="hidden md:flex items-center gap-8">
          {!isAdminMode ? (
            <>
              <button 
                onClick={() => navigate('/')}
                className={`font-label-sm text-label-sm uppercase tracking-widest px-3 py-2 rounded transition-all duration-300 ${
                  isViewActive('/')
                    ? 'text-primary font-bold border-b-2 border-primary scale-100'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
                }`}
              >
                Events
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className={`font-label-sm text-label-sm uppercase tracking-widest px-3 py-2 rounded transition-all duration-300 ${
                  isViewActive('/dashboard') || isViewActive('/ticket')
                    ? 'text-primary font-bold border-b-2 border-primary scale-100'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
                }`}
              >
                My Tickets
              </button>
            </>
          ) : (
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-3 py-2 border border-secondary/30 bg-secondary/5 rounded-lg select-none">
              Control Panel Active
            </span>
          )}
        </nav>

        {/* Portal Switcher & Action Call */}
        <div className="flex items-center gap-4">
          {/* Quick Dashboard/Admin Portal Toggle */}
          <button 
            onClick={() => {
              const newAdmin = !isAdminMode;
              setIsAdminMode(newAdmin);
              navigate(newAdmin ? '/admin' : '/');
            }}
            className="flex items-center gap-2 border border-outline-variant/40 bg-surface-container-low/40 px-6 py-3 rounded-lg text-[12px] font-label-sm uppercase tracking-widest hover:border-primary/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              {isAdminMode ? 'account_circle' : 'admin_panel_settings'}
            </span>
            {isAdminMode ? 'Switch to Client' : 'Switch to Admin'}
          </button>

          {!isAdminMode ? (
            <button 
              onClick={() => {
                if (location.pathname !== '/') {
                  navigate('/');
                  setTimeout(() => {
                    const el = document.getElementById('events-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  const el = document.getElementById('events-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="hidden sm:block bg-tertiary text-on-tertiary px-10 py-4 rounded font-label-sm text-[13px] uppercase tracking-widest hover:bg-tertiary-fixed hover:text-on-tertiary-fixed transition-colors select-none shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            >
              Book Now
            </button>
          ) : (
            <button 
              onClick={() => {
                setIsAdminMode(false);
                navigate('/');
              }}
              className="hidden sm:block bg-surface-container-highest text-on-surface border border-outline-variant/30 px-10 py-4 rounded font-label-sm text-[13px] uppercase tracking-widest hover:bg-white hover:text-background transition-colors"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
