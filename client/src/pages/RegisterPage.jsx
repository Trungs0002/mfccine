import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center pt-[100px] pb-12 px-margin-mobile relative z-10">
      <div className="w-full max-w-[500px] glass-panel p-8 md:p-10 rounded-2xl border border-outline-variant/20 shadow-2xl">
        <div className="text-center mb-10 select-none">
          <h1 className="font-display-xl text-[32px] text-on-surface italic mb-2 tracking-tight">Join the Community</h1>
          <p className="font-body-md text-on-surface-variant text-[14px]">Create your profile to start reserving exclusive experiences.</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error p-4 rounded-lg mb-6 text-[13px] flex items-center gap-3">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Full Legal Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alexander Johnson"
              className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@editorial.com"
              className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Confirm</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-surface-container/40 border border-outline-variant/30 rounded-lg px-4 py-3.5 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors font-mono"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-6 rounded font-label-sm text-[15px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_10px_30px_rgba(221,186,238,0.2)] flex justify-center items-center gap-3"
          >
            {loading ? (
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center select-none">
          <p className="font-body-md text-[13px] text-on-surface-variant">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In Instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
