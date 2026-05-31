import React, { useState, useEffect } from 'react';

const UserDashboardPage = ({ userEmail, setView, setCompletedBookingId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');

  const email = userEmail || 'alex.johnson@ftu.edu';
  const name = email.split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

  // Fetch email history from backend
  useEffect(() => {
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

  return (
    <div className="w-full flex-grow flex flex-col md:flex-row min-h-screen relative z-10 pt-[80px]">
      
      {/* 1. SIDE NAVIGATION (Desktop aside, Mobile top bar) */}
      <aside className="w-full md:w-64 bg-surface-container/30 backdrop-blur-xl border-b md:border-b-0 md:border-r border-outline-variant/15 p-6 flex flex-col select-none">
        <div className="font-display-xl text-[24px] text-on-surface mb-8 italic tracking-tight hidden md:block">MFC PORTAL</div>
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 font-label-sm text-[11px] uppercase tracking-widest">
          <button 
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-lg border transition-all ${
              activeTab === 'tickets' 
                ? 'border-primary bg-primary-container/20 text-primary font-bold shadow-[0_0_8px_rgba(221,186,238,0.1)]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
            }`}
          >
            My Tickets
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-initial text-left px-4 py-3 rounded-lg border transition-all ${
              activeTab === 'history' 
                ? 'border-primary bg-primary-container/20 text-primary font-bold shadow-[0_0_8px_rgba(221,186,238,0.1)]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20'
            }`}
          >
            Purchase History
          </button>
          <button 
            onClick={() => alert('Profile credentials fully managed.')}
            className="flex-1 md:flex-initial text-left px-4 py-3 rounded-lg border border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/20"
          >
            Profile
          </button>
        </div>

        <button 
          onClick={() => {
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-auto hidden md:block w-full py-3.5 border border-outline-variant/30 text-on-surface-variant hover:text-white font-label-sm text-[11px] uppercase tracking-widest hover:bg-surface-container-highest/20 transition-all rounded"
        >
          Exit Dashboard
        </button>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max">
        <header className="mb-12">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">Welcome Back, {name}</h1>
          <p className="font-body-lg text-on-surface-variant text-[16px]">Here are your upcoming fashion experiences and stubs.</p>
        </header>

        {/* Tab 1: My Tickets (CRA look) */}
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
                  onClick={() => setView('landing')}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded font-label-sm text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-gutter">
                {/* Active Hero Ticket Segment */}
                {bookings.map((booking) => {
                  const event = booking.eventId;
                  const seats = booking.selectedSeats || [];
                  return (
                    <div 
                      key={booking._id} 
                      className="glass-panel rounded-xl overflow-hidden flex flex-col lg:flex-row group transition-all duration-300 border border-outline-variant/20 hover:border-primary/30"
                    >
                      {/* Left: Image banner cover */}
                      <div className="lg:w-2/5 h-56 lg:h-auto relative overflow-hidden select-none">
                        <img 
                          src={event?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuApty4F9Xfw23ECdQJ5ZTVMJVLqZkumLZSnPchteKqYAt7kbaw7ncNDFEiTRQCtG1cUSUAz39N6fHh50Iyp3oEUj3Dy3TB1oFcNg1J6tdNP5vG13lq_C73YLcAT62Hqm75Q8F-9Quai63CQVfiaA8Agz8inhwp0Kns_BBhx6BnKd9lUMJBpcfRIITdZoWncSm3ySDmbpq3EcCLnjUC8iSAJhkothu0xcmsWWUojosnMrC9wE02SjPWa4kp4rn9NWzo-PZlCpPQvdAg'} 
                          alt="Event Cover"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 lg:from-background/10 via-transparent to-transparent"></div>
                      </div>

                      {/* Right: Info stub notches */}
                      <div className="lg:w-3/5 p-8 flex flex-col justify-between relative bg-surface-container-low/30">
                        {/* Notch circles */}
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background hidden lg:block border border-outline-variant/10"></div>
                        
                        <div>
                          <div className="flex justify-between items-start mb-4 select-none">
                            <span className="inline-block px-3 py-1 bg-primary-container/60 text-on-primary-container font-label-sm text-[9px] uppercase tracking-widest rounded">
                              Active Pass
                            </span>
                            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
                              {new Date(event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          
                          <h3 className="font-title-md text-[22px] text-on-surface font-bold group-hover:text-primary transition-colors mb-2">
                            {event?.title || 'SHOWCASE'}
                          </h3>
                          <p className="font-body-md text-[13px] text-on-surface-variant mb-6">
                            {event?.venueName || 'Grand Hall'} • {event?.location || 'Paris'}
                          </p>

                          <div className="flex gap-4 select-none">
                            <div className="bg-surface-container-highest/60 px-4 py-2 rounded border border-outline-variant/10 text-center">
                              <span className="block font-label-sm text-[8px] text-on-surface-variant uppercase">Row</span>
                              <span className="font-title-md text-[16px] text-primary font-bold">
                                {seats[0]?.seatId.split('-')[2] || 'A'}
                              </span>
                            </div>
                            <div className="bg-surface-container-highest/60 px-4 py-2 rounded border border-outline-variant/10 text-center">
                              <span className="block font-label-sm text-[8px] text-on-surface-variant uppercase">Seats</span>
                              <span className="font-title-md text-[16px] text-primary font-bold">
                                {seats.map(s => s.seatId.split('-')[3]).join(', ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center select-none">
                          <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                            Status: <span className={booking.isCheckedIn ? 'text-secondary' : 'text-primary animate-pulse'}>
                              {booking.isCheckedIn ? 'Checked-In' : 'Ready for Scan'}
                            </span>
                          </span>
                          <button 
                            onClick={() => {
                              setCompletedBookingId(booking._id);
                              setView('ticket');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-primary text-on-primary px-6 py-2.5 rounded font-label-sm text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                          >
                            View Stub
                          </button>
                        </div>
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
          <div className="glass-panel p-8 rounded-xl overflow-x-auto select-none">
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6">
              ORDER TRANSACTION HISTORY
            </h3>
            {bookings.length === 0 ? (
              <p className="font-body-md text-on-surface-variant text-[14px]">No transactions completed on this email account.</p>
            ) : (
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-outline-variant/15 font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">
                    <th className="pb-4">Transaction ID</th>
                    <th className="pb-4">Showcase</th>
                    <th className="pb-4">Seats Count</th>
                    <th className="pb-4">Payment Method</th>
                    <th className="pb-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="text-on-surface/90 hover:text-on-surface">
                      <td className="py-4 font-mono text-[12px]">{booking._id.toString().toUpperCase().slice(-8)}</td>
                      <td className="py-4 font-semibold">{booking.eventId?.title}</td>
                      <td className="py-4">{booking.selectedSeats?.length} Seat(s)</td>
                      <td className="py-4">{booking.paymentMethod}</td>
                      <td className="py-4 text-right text-primary font-semibold">${booking.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboardPage;
