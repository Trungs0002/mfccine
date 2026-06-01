import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center pt-[100px] px-margin-mobile relative z-10">
      <div className="w-full max-w-[450px] glass-panel p-8 md:p-10 rounded-2xl border border-outline-variant/20 shadow-2xl">
        <div className="text-center mb-10 select-none">
          <h1 className="font-display-xl text-[32px] text-on-surface italic mb-2 tracking-tight">Access Your Portal</h1>
          <p className="font-body-md text-on-surface-variant text-[14px]">Enter your credentials to manage your experiences.</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg mb-6 text-[13px] flex items-center gap-3">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alexander@editorial.com"
              className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Security Password</label>
              <button type="button" className="text-[10px] text-primary uppercase tracking-widest hover:underline">Forgot?</button>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-6 rounded font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_10px_30px_rgba(221,186,238,0.2)] flex justify-center items-center gap-3"
          >
            {loading ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center select-none">
          <p className="font-body-md text-[13px] text-on-surface-variant">
            New to our community? <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
