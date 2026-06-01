import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboardPage = ({ userEmail, setCompletedBookingId, settings }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [qrReveal, setQrReveal] = useState(null); // Track which booking ID to show QR for

  // Restore user from localStorage if props are missing (handling direct navigation)
  const savedUser = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const email = userEmail || savedUser.email || 'guest@example.com';
  const name = (savedUser.fullName || email.split('@')[0]).split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

  // 1. Calculate Dynamic Stats
  const stats = useMemo(() => {
    const totalPasses = bookings.reduce((sum, b) => sum + (b.selectedSeats?.length || 0), 0);
    const upcomingShows = bookings.filter(b => !b.isCheckedIn).length;
    const memberSince = bookings.length > 0 
      ? new Date(bookings[bookings.length - 1].bookingDate).getFullYear() 
      : new Date().getFullYear();
    
    return { totalPasses, upcomingShows, memberSince };
  }, [bookings]);

  // Fetch email history from backend
  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/bookings/email/${email}`)
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard bookings:', err);
        setLoading(false);
      });
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Force a full reload to clear all states
  };

  return (
    <div className="w-full flex-grow flex flex-col md:flex-row min-h-screen relative z-10 pt-[80px]">
      
      {/* 1. SIDE NAVIGATION */}
      <aside className="w-full md:w-64 bg-surface-container/30 backdrop-blur-xl border-b md:border-b-0 md:border-r border-outline-variant/15 p-6 flex flex-col select-none">
        <div className="font-display-xl text-[24px] text-on-surface mb-8 italic tracking-tight hidden md:block">
          {settings?.siteName?.split(' ')[0] || 'SITE'} PORTAL
        </div>
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 font-label-sm text-[12px] uppercase tracking-widest">
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 md:flex-initial text-left px-4 py-4 rounded-lg border transition-all ${
              activeTab === 'tickets' 
                ? 'border-primary bg-primary-container/20 text-primary font-bold shadow-[0_0_8px_rgba(221,186,238,0.1)]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
            }`}
          >
            My Tickets
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-initial text-left px-4 py-4 rounded-lg border transition-all ${
              activeTab === 'history' 
                ? 'border-primary bg-primary-container/20 text-primary font-bold shadow-[0_0_8px_rgba(221,186,238,0.1)]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
            }`}
          >
            Purchase History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-initial text-left px-4 py-4 rounded-lg border transition-all ${
              activeTab === 'profile' 
                ? 'border-primary bg-primary-container/20 text-primary font-bold shadow-[0_0_8px_rgba(221,186,238,0.1)]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
            }`}
          >
            Profile
          </button>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-auto hidden md:block w-full py-4.5 border border-outline-variant/30 text-on-surface-variant hover:text-white font-label-sm text-[12px] uppercase tracking-widest hover:bg-surface-container-highest/20 transition-all rounded"
        >
          Exit Dashboard
        </button>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max">
        
        {/* Editorial Header & Stats */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">Welcome, {name}</h1>
              <p className="font-body-lg text-on-surface-variant text-[16px]">Managing your reserved access and stubs in the Vault.</p>
            </div>
          </div>

          {/* Dynamic Stats Row */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 select-none">
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/15 flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Total Passes</span>
              <span className="font-display-xl text-[24px] text-primary font-bold">{stats.totalPasses}</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/15 flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Upcoming</span>
              <span className="font-display-xl text-[24px] text-on-surface font-bold">{stats.upcomingShows}</span>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-outline-variant/15 flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Member Since</span>
              <span className="font-display-xl text-[24px] text-on-surface font-bold">{stats.memberSince}</span>
            </div>
          </div>
        </header>

        {/* Tab 1: My Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-12">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
                <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">Checking active passes...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="glass-panel p-12 rounded-xl text-center flex flex-col justify-center items-center gap-6">
                <span className="material-symbols-outlined text-5xl text-outline-variant font-light">local_activity</span>
                <div>
                  <h3 className="font-title-md text-[20px] text-on-surface mb-1">No Active Tickets</h3>
                  <p className="font-body-md text-on-surface-variant text-[14px]">You haven't reserved access for any active showcases yet.</p>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded font-label-sm text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-gutter">
                {bookings.map((booking) => {
                  const event = booking.eventId;
                  const seats = booking.selectedSeats || [];
                  const isReveal = qrReveal === booking._id;

                  return (
                    <div 
                      key={booking._id} 
                      className="glass-panel rounded-xl overflow-hidden flex flex-col lg:flex-row group transition-all duration-300 border border-outline-variant/20 hover:border-primary/30"
                    >
                      {/* Left: Image banner */}
                      <div className="lg:w-2/5 h-56 lg:h-auto relative overflow-hidden select-none">
                        <img 
                          src={event?.image} 
                          alt="Event"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 lg:from-background/10 via-transparent to-transparent"></div>
                      </div>

                      {/* Right: Info stub */}
                      <div className="lg:w-3/5 p-8 flex flex-col justify-between relative bg-surface-container-low/30">
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background hidden lg:block border border-outline-variant/10"></div>
                        
                        {isReveal ? (
                          <div className="flex flex-col items-center justify-center animate-fade-in py-4">
                            <div className="bg-white p-2 rounded-lg mb-4">
                              <svg className="w-32 h-32 text-black" viewBox="0 0 100 100">
                                <rect width="100" height="100" fill="white" />
                                <g fill="black">
                                  <rect x="5" y="5" width="25" height="25" /><rect x="70" y="5" width="25" height="25" /><rect x="5" y="70" width="25" height="25" /><rect x="40" y="40" width="20" height="20" />
                                </g>
                              </svg>
                            </div>
                            <p className="font-mono text-[11px] text-primary mb-4">{booking._id}</p>
                            <button onClick={() => setQrReveal(null)} className="text-[10px] text-on-surface-variant uppercase tracking-widest hover:text-white underline">Close Scan View</button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="flex justify-between items-start mb-4 select-none">
                                <span className="inline-block px-3 py-1 bg-primary-container/60 text-on-primary-container font-label-sm text-[9px] uppercase tracking-widest rounded">
                                  {booking.isCheckedIn ? 'Pass Used' : 'Active Pass'}
                                </span>
                                <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
                                  {new Date(event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              
                              <h3 className="font-title-md text-[22px] text-on-surface font-bold group-hover:text-primary transition-colors mb-2">
                                {event?.title || 'SHOWCASE'}
                              </h3>
                              <p className="font-body-md text-[13px] text-on-surface-variant mb-6">
                                {event?.venueName} • {event?.location}
                              </p>

                              <div className="flex gap-4 select-none">
                                <div className="bg-surface-container-highest/60 px-4 py-2 rounded border border-outline-variant/10 text-center">
                                  <span className="block font-label-sm text-[8px] text-on-surface-variant uppercase">Seats</span>
                                  <span className="font-title-md text-[16px] text-primary font-bold">
                                    {seats.length}x
                                  </span>
                                </div>
                                <div className="bg-surface-container-highest/60 px-4 py-2 rounded border border-outline-variant/10 text-center">
                                  <span className="block font-label-sm text-[8px] text-on-surface-variant uppercase">Class</span>
                                  <span className="font-title-md text-[16px] text-on-surface font-bold">
                                    {seats[0]?.type}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center select-none gap-4">
                              <button 
                                onClick={() => setQrReveal(booking._id)}
                                className="flex-1 border border-primary/40 text-primary hover:bg-primary hover:text-on-primary py-3.5 rounded font-label-sm text-[12px] uppercase tracking-widest transition-all flex justify-center items-center gap-2"
                              >
                                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                                Quick QR
                              </button>
                              <button 
                                onClick={() => {
                                  setCompletedBookingId(booking._id);
                                  navigate('/ticket');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="flex-1 bg-primary text-on-primary px-4 py-3.5 rounded font-label-sm text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                              >
                                View Stub
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Purchase History */}
        {activeTab === 'history' && (
          <div className="glass-panel p-8 rounded-xl overflow-x-auto select-none border border-outline-variant/10">
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6">
              ORDER TRANSACTION HISTORY
            </h3>
            {bookings.length === 0 ? (
              <p className="font-body-md text-on-surface-variant text-[14px]">No transactions completed on this email account.</p>
            ) : (
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-outline-variant/15 font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">
                    <th className="pb-4">Ref ID</th>
                    <th className="pb-4">Showcase</th>
                    <th className="pb-4">Payment</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="text-on-surface/90 hover:text-on-surface transition-colors">
                      <td className="py-5 font-mono text-[12px] text-primary">{booking._id.toString().toUpperCase().slice(-8)}</td>
                      <td className="py-5">
                        <p className="font-semibold leading-none mb-1">{booking.eventId?.title}</p>
                        <p className="text-[11px] opacity-60 uppercase">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </td>
                      <td className="py-5 text-[12px]">{booking.paymentMethod}</td>
                      <td className="py-5">
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded text-[10px] uppercase font-bold">Confirmed</span>
                      </td>
                      <td className="py-5 text-right text-primary font-bold text-[16px]">${booking.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-[600px] space-y-8 animate-fade-in">
            <div className="glass-panel p-10 rounded-2xl border border-outline-variant/15">
              <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-8">USER CREDENTIALS</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Legal Full Name</label>
                  <p className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-4 text-[15px] text-on-surface font-semibold">{name}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Authenticated Email</label>
                  <p className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-4 text-[15px] text-on-surface font-semibold">{email}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Account Privilege</label>
                  <div className="flex items-center gap-2 bg-secondary/5 border border-secondary/20 rounded-lg p-4">
                    <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                    <span className="text-[14px] text-secondary font-bold uppercase tracking-widest">{savedUser.role || 'Member'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-outline-variant/10">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 border border-error/30 text-error hover:bg-error hover:text-white py-4 rounded font-label-sm text-[12px] uppercase tracking-widest transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Terminate Session
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboardPage;
