import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanelPage = ({ events, setEvents, settings, setSettings }) => {
  const navigate = useNavigate();
  const [activeAdminTab, setActiveTab] = useState('events'); // 'events' or 'bookings'
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    checkedInCount: 0,
    totalBookingsCount: 0
  });
  
  // Site Branding states
  const [siteName, setSiteName] = useState(settings?.siteName || '');
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || '');
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Event Management states
  const [editingEventId, setEditingEventId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [venueName, setVenueName] = useState('');
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  
  // Custom Pricing states (4 tiers)
  const [vipPrice, setVipPrice] = useState(450);
  const [goldPrice, setGoldPrice] = useState(250);
  const [silverPrice, setSilverPrice] = useState(150);
  const [standardPrice, setStandardPrice] = useState(100);
  
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Booking Management states
  const [allBookings, setAllBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editBookingName, setEditBookingName] = useState('');
  const [editBookingEmail, setEditBookingEmail] = useState('');

  // QR Scanning Simulation state
  const [scanBookingId, setScanBookingId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const fetchAnalytics = () => {
    fetch('http://localhost:5000/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error fetching analytics:', err));
  };

  const fetchAllBookings = () => {
    setLoadingBookings(true);
    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(data => {
        setAllBookings(data);
        setLoadingBookings(false);
      })
      .catch(() => setLoadingBookings(false));
  };

  useEffect(() => {
    fetchAnalytics();
    if (activeAdminTab === 'bookings') fetchAllBookings();
  }, [events, activeAdminTab]);

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteName, contactEmail })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        alert('Branding updated.');
        setUpdatingSettings(false);
      })
      .catch(() => setUpdatingSettings(false));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setImage(reader.result);
  };

  const handleEditClick = (evt) => {
    setEditingEventId(evt._id);
    setTitle(evt.title);
    setDescription(evt.description);
    const d = new Date(evt.date);
    setDate(d.toISOString().slice(0, 16));
    setLocation(evt.location);
    setVenueName(evt.venueName);
    setVipPrice(evt.pricingTiers?.vip?.price || 450);
    setGoldPrice(evt.pricingTiers?.gold?.price || 250);
    setSilverPrice(evt.pricingTiers?.silver?.price || 150);
    setStandardPrice(evt.pricingTiers?.standard?.price || 100);
    setImage(null);
    setImageName('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingEventId(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
    setVenueName('');
    setVipPrice(450);
    setGoldPrice(250);
    setSilverPrice(150);
    setStandardPrice(100);
    setImage(null);
    setImageName('');
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmittingEvent(true);
    const eventData = {
      title,
      description,
      date,
      location,
      venueName,
      image, 
      pricingTiers: {
        standard: { price: Number(standardPrice), capacity: 250 },
        silver: { price: Number(silverPrice), capacity: 150 },
        gold: { price: Number(goldPrice), capacity: 100 },
        vip: { price: Number(vipPrice), capacity: 50 }
      }
    };
    const url = editingEventId ? `http://localhost:5000/api/events/${editingEventId}` : 'http://localhost:5000/api/events';
    const method = editingEventId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const data = await res.json();
      if (res.ok) {
        if (editingEventId) setEvents(events.map(ev => ev._id === editingEventId ? data : ev));
        else setEvents([...events, data]);
        alert('Event updated.');
        resetForm();
      }
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Archive this event?')) return;
    const res = await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEvents(events.filter(ev => ev._id !== id));
      alert('Archived.');
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBookingId(booking._id);
    setEditBookingName(booking.fullName);
    setEditBookingEmail(booking.email);
  };

  const saveBookingEdit = async () => {
    const res = await fetch(`http://localhost:5000/api/bookings/${editingBookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: editBookingName, email: editBookingEmail })
    });
    if (res.ok) {
      setAllBookings(allBookings.map(b => b._id === editingBookingId ? { ...b, fullName: editBookingName, email: editBookingEmail } : b));
      setEditingBookingId(null);
      alert('Ticket updated.');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Cancel and delete this ticket permanently?')) return;
    const res = await fetch(`http://localhost:5000/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAllBookings(allBookings.filter(b => b._id !== id));
      fetchAnalytics();
      alert('Ticket deleted.');
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setScanning(true);
    const res = await fetch(`http://localhost:5000/api/bookings/check-in/${scanBookingId}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setScanResult({ success: true, message: 'Done!', details: data.booking });
      fetchAnalytics();
    } else setScanResult({ success: false, message: data.error });
    setScanning(false);
    setScanBookingId('');
  };

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10 gap-12">
      
      <div className="flex flex-col gap-8 border-b border-outline-variant/15 pb-8 select-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2 tracking-tight">ADMIN COMMAND CENTER</h1>
            <p className="font-body-md text-on-surface-variant text-[14px]">Synchronized management of global events and ticket inventory.</p>
          </div>
          <button onClick={() => navigate('/')} className="border border-outline-variant/40 bg-surface-container-low/20 px-8 py-4 rounded font-label-sm text-label-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            View Client Portal
          </button>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setActiveTab('events')} className={`px-6 py-3 rounded-lg font-label-sm text-[12px] uppercase tracking-widest transition-all ${activeAdminTab === 'events' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:text-white'}`}>
            Manage Events
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`px-6 py-3 rounded-lg font-label-sm text-[12px] uppercase tracking-widest transition-all ${activeAdminTab === 'bookings' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:text-white'}`}>
            Manage Tickets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 select-none">
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Revenue</span>
          <span className="font-display-xl text-[24px] text-primary font-bold">${analytics.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Tickets Sold</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.ticketsSold}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Active Shows</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.activeEvents}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Check-ins</span>
          <span className="font-display-xl text-[24px] text-secondary font-bold">{analytics.checkedInCount}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Logs</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.totalBookingsCount}</span>
        </div>
      </div>

      {activeAdminTab === 'events' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="glass-panel p-8 rounded-xl border border-secondary/20 bg-secondary/5">
              <h3 className="font-label-sm text-[11px] text-secondary uppercase tracking-widest mb-4">WEBSITE BRANDING</h3>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Site Name" className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required />
                <button type="submit" disabled={updatingSettings} className="w-full bg-secondary text-on-secondary py-4 rounded font-label-sm text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-md">Apply Brand Changes</button>
              </form>
            </div>

            <div className="glass-panel p-8 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-4">LIVE SCANNER SIMULATOR</h3>
              <form onSubmit={handleCheckIn} className="flex gap-2">
                <input type="text" value={scanBookingId} onChange={(e) => setScanBookingId(e.target.value)} placeholder="Enter Ticket ID" className="flex-1 bg-surface-container/60 border border-outline-variant/30 rounded-lg px-4 py-3 text-[13px] font-mono text-on-surface focus:border-primary outline-none" required />
                <button type="submit" disabled={scanning} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-sm text-[11px] uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-md">Scan</button>
              </form>
              {scanResult && <p className={`mt-3 text-[12px] font-bold ${scanResult.success ? 'text-secondary' : 'text-error'}`}>{scanResult.message}</p>}
            </div>

            <div className="glass-panel p-8 rounded-xl border border-outline-variant/15">
              <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6 uppercase italic">
                {editingEventId ? 'Modify Active Event' : 'Launch New Brand Showcase'}
              </h3>
              <form onSubmit={handleSubmitEvent} className="space-y-5">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:border-primary outline-none" required />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface h-24 focus:border-primary outline-none" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:border-primary outline-none" required />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City" className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:border-primary outline-none" required />
                </div>
                <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Venue Landmark" className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:border-primary outline-none" required />
                
                <div className="p-4 bg-surface-container-highest/20 rounded-lg border border-outline-variant/10 space-y-4">
                  <h4 className="font-label-sm text-[10px] text-primary uppercase tracking-widest font-bold italic">Ticket Pricing Override (4 Tiers)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-on-surface-variant uppercase">Standard</span>
                      <input type="number" value={standardPrice} onChange={(e) => setStandardPrice(e.target.value)} className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-on-surface-variant uppercase">Silver</span>
                      <input type="number" value={silverPrice} onChange={(e) => setSilverPrice(e.target.value)} className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-secondary uppercase font-bold">Gold</span>
                      <input type="number" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)} className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-primary uppercase font-bold">VIP</span>
                      <input type="number" value={vipPrice} onChange={(e) => setVipPrice(e.target.value)} className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="cloudinaryInput" />
                  <button type="button" onClick={() => document.getElementById('cloudinaryInput').click()} className="w-full py-3 border border-outline-variant/30 bg-surface-container/30 rounded text-[11px] font-label-sm uppercase tracking-wider text-on-surface hover:bg-surface-container-highest/40 transition-all">
                    {imageName ? `Attached: ${imageName.slice(0,25)}...` : editingEventId ? 'Replace Brand Visual' : 'Upload Thumbnail'}
                  </button>
                </div>

                <div className="flex gap-3">
                  {editingEventId && <button type="button" onClick={resetForm} className="flex-1 py-5 border border-outline-variant/30 text-on-surface-variant rounded font-label-sm text-[13px] uppercase tracking-widest hover:text-white transition-all">Cancel</button>}
                  <button type="submit" disabled={submittingEvent} className="flex-[2] bg-primary text-on-primary py-5 rounded font-label-sm text-[13px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg font-bold">{submittingEvent ? 'Uploading...' : editingEventId ? 'Confirm Updates' : 'Launch Showcase'}</button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4">ACTIVE REPERTOIRE</h3>
            <div className="grid grid-cols-1 gap-4">
              {events.map((evt) => (
                <div key={evt._id} className="glass-panel p-6 rounded-xl border border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-6 w-full">
                    <img src={evt.image} alt={evt.title} className="w-20 h-20 rounded-lg object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all border border-outline-variant/10" />
                    <div className="flex-1">
                      <h4 className="font-title-md text-[18px] text-on-surface leading-tight mb-1">{evt.title}</h4>
                      <p className="font-body-md text-[13px] text-on-surface-variant italic">{evt.location}</p>
                      <div className="flex gap-4 mt-2 text-[10px] text-on-surface-variant font-mono uppercase flex-wrap">
                        <span>VIP: ${evt.pricingTiers?.vip?.price}</span>
                        <span>Gold: ${evt.pricingTiers?.gold?.price}</span>
                        <span>Silver: ${evt.pricingTiers?.silver?.price}</span>
                        <span>Standard: ${evt.pricingTiers?.standard?.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleEditClick(evt)} className="flex-1 px-4 py-3 bg-surface-container-high rounded text-on-surface hover:bg-white hover:text-black transition-all font-label-sm text-[10px] uppercase tracking-widest border border-outline-variant/20 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Edit
                    </button>
                    <button onClick={() => handleDeleteEvent(evt._id)} className="px-4 py-3 bg-error/10 border border-error/30 text-error hover:bg-error hover:text-white rounded transition-all"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in glass-panel p-8 rounded-xl border border-outline-variant/15">
          <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4 mb-8">
            <h3 className="font-title-md text-[20px] text-on-surface uppercase italic">Master Ledger (All Tickets)</h3>
            <button onClick={fetchAllBookings} className="text-primary font-label-sm text-[11px] uppercase tracking-widest hover:underline flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">refresh</span> Reload Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            {loadingBookings ? <p className="py-20 text-center font-label-sm text-on-surface-variant uppercase tracking-widest animate-pulse">Synchronizing Global Sales...</p> : (
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest border-b border-outline-variant/10">
                    <th className="pb-4">Ticket Ref</th>
                    <th className="pb-4">Attendee / Event</th>
                    <th className="pb-4">Details</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {allBookings.map(booking => (
                    <tr key={booking._id} className="text-on-surface/90 hover:text-on-surface">
                      <td className="py-4 font-mono text-primary text-[12px]">{booking._id.toString().slice(-8).toUpperCase()}</td>
                      <td className="py-4">
                        {editingBookingId === booking._id ? (
                          <div className="flex flex-col gap-2 max-w-[200px]">
                            <input value={editBookingName} onChange={e => setEditBookingName(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded p-1.5 text-[12px]" />
                            <input value={editBookingEmail} onChange={e => setEditBookingEmail(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded p-1.5 text-[12px]" />
                          </div>
                        ) : (
                          <>
                            <p className="font-bold">{booking.fullName}</p>
                            <p className="text-[11px] opacity-60">{booking.email}</p>
                            <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-tight">{booking.eventId?.title}</p>
                          </>
                        )}
                      </td>
                      <td className="py-4">
                        <p>{booking.selectedSeats?.length} Seat(s)</p>
                        <p className="text-primary font-bold">${booking.subtotal}</p>
                        <p className="text-[10px] opacity-50">{booking.paymentMethod}</p>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border w-fit ${booking.isCheckedIn ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                            {booking.isCheckedIn ? 'Checked-In' : 'Valid'}
                          </span>
                          <span className="text-[10px] opacity-40 font-mono italic">{booking.paymentStatus}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {editingBookingId === booking._id ? (
                            <>
                              <button onClick={saveBookingEdit} className="text-secondary font-bold hover:underline uppercase text-[10px]">Save</button>
                              <button onClick={() => setEditingBookingId(null)} className="text-on-surface-variant hover:underline uppercase text-[10px]">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditBooking(booking)} className="p-2 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                              <button onClick={() => handleDeleteBooking(booking._id)} className="p-2 hover:bg-error/10 rounded transition-colors text-error"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanelPage;
