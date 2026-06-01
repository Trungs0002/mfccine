import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ isAdminMode, user, onLogout, settings }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isViewActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/65 backdrop-blur-xl border-b border-outline-variant/15 transition-all duration-300">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')}
          className="font-title-md text-title-md italic text-on-surface cursor-pointer select-none hover:opacity-80 transition-opacity"
        >
          {settings?.siteName || 'EVENT PRO'}
        </div>

        {/* Central Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {!isAdminMode ? (
            <>
              <button 
                onClick={() => navigate('/')}
                className={`font-label-sm text-label-sm uppercase tracking-widest px-3 py-2 rounded transition-all duration-300 ${
                  isViewActive('/')
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
                }`}
              >
                Events
              </button>
              {user && (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className={`font-label-sm text-label-sm uppercase tracking-widest px-3 py-2 rounded transition-all duration-300 ${
                    isViewActive('/dashboard') || isViewActive('/ticket')
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
                  }`}
                >
                  My Tickets
                </button>
              )}
            </>
          ) : (
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest px-3 py-2 border border-secondary/30 bg-secondary/5 rounded-lg select-none">
              Control Panel Active
            </span>
          )}
        </nav>

        {/* Auth & Portal Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <button 
                  onClick={() => navigate(isAdminMode ? '/' : '/admin')}
                  className="flex items-center gap-2 border border-outline-variant/40 bg-surface-container-low/40 px-5 py-3 rounded-lg text-[12px] font-label-sm uppercase tracking-widest hover:border-primary/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    {isAdminMode ? 'account_circle' : 'admin_panel_settings'}
                  </span>
                  {isAdminMode ? 'Client View' : 'Admin Panel'}
                </button>
              )}
              
              <div className="hidden sm:flex flex-col items-end leading-none select-none">
                <span className="text-[11px] font-bold text-on-surface">{user.fullName}</span>
                <span className="text-[9px] text-on-surface-variant uppercase tracking-tighter">{user.role}</span>
              </div>

              <button 
                onClick={onLogout}
                className="bg-surface-container-highest text-on-surface border border-outline-variant/30 px-6 py-3 rounded font-label-sm text-[12px] uppercase tracking-widest hover:bg-white hover:text-background transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="text-on-surface-variant hover:text-primary px-4 py-2 text-[12px] font-label-sm uppercase tracking-widest transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-primary text-on-primary px-8 py-3 rounded font-label-sm text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg"
              >
                Join
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
