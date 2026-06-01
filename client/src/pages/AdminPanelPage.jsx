import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanelPage = ({ events, setEvents, settings, setSettings }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    checkedInCount: 0,
    totalBookingsCount: 0
  });
  
  // Site Settings states
  const [siteName, setSiteName] = useState(settings?.siteName || '');
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || '');
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Event Creator Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [venueName, setVenueName] = useState('');
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  const [creatingEvent, setCreatingEvent] = useState(false);

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

  useEffect(() => {
    fetchAnalytics();
  }, [events]);

  // 1.1 Handle Settings Update
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
        alert('Site settings updated successfully!');
        setUpdatingSettings(false);
      })
      .catch(err => {
        alert('Failed to update settings.');
        setUpdatingSettings(false);
      });
  };

  // 2. Handle Image Selection & Conversion to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImage(reader.result);
    };
  };

  // 3. Create New Event
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setCreatingEvent(true);

    const newEvent = {
      title,
      description,
      date,
      location,
      venueName,
      image, // Base64 string to be uploaded via Cloudinary on Backend
      pricingTiers: {
        silver: { price: 150, capacity: 150 },
        gold: { price: 250, capacity: 100 },
        vip: { price: 450, capacity: 50 }
      }
    };

    try {
      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();

      if (res.ok) {
        setEvents([...events, data]);
        alert('Showcase launched and listed successfully!');
        // Clear form
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setVenueName('');
        setImage(null);
        setImageName('');
      } else {
        alert(data.error || 'Failed to create event.');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Network error while launching showcase.');
    } finally {
      setCreatingEvent(false);
    }
  };

  // 4. Handle QR Check-in Simulation
  const handleCheckIn = async (e) => {
    e.preventDefault();
    setScanning(true);
    setScanResult(null);

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/check-in/${scanBookingId}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (res.ok) {
        setScanResult({ success: true, message: 'Check-in successful!', details: data.booking });
        fetchAnalytics(); // Refresh stats
      } else {
        setScanResult({ success: false, message: data.error || 'Invalid Ticket ID.' });
      }
    } catch (err) {
      setScanResult({ success: false, message: 'Check-in node unreachable.' });
    } finally {
      setScanning(false);
      setScanBookingId('');
    }
  };

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10 gap-12">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant/15 pb-8 select-none">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">CONTROL PANEL OVERVIEW</h1>
          <p className="font-body-md text-on-surface-variant text-[14px]">Configure events, monitor metrics, and simulate QR check-ins.</p>
        </div>
        <button 
          onClick={() => {
            navigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="border border-outline-variant/40 bg-surface-container-low/20 px-8 py-4 rounded font-label-sm text-label-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          View Client Portal
        </button>
      </div>

      {/* 2. ANALYTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 select-none">
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Total Sales</span>
          <span className="font-display-xl text-[24px] text-primary font-bold">${analytics.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Passes Sold</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.ticketsSold}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Active Shows</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.activeEvents}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Checked In</span>
          <span className="font-display-xl text-[24px] text-secondary font-bold">{analytics.checkedInCount}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">Bookings</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.totalBookingsCount}</span>
        </div>
      </div>

      {/* 3. DUAL ACTION SPLIT (QR Simulator & Event Creator vs Show List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns (Span 5): QR check-in & Event Creator */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* 0. Site Branding Settings */}
          <div className="glass-panel p-8 rounded-xl border border-secondary/20 bg-secondary/5">
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6 select-none">
              SITE BRANDING
            </h3>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Website Name</label>
                <input 
                  type="text" 
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. EVENT TICKETING PRO"
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Support Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. support@domain.com"
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={updatingSettings}
                className="w-full bg-secondary text-on-secondary py-5 rounded font-label-sm text-[13px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-lg"
              >
                {updatingSettings ? 'Updating...' : 'Save Site Branding'}
              </button>
            </form>
          </div>

          {/* A. Live QR Check-in simulator */}
          <div className="glass-panel p-8 rounded-xl border border-primary/20 bg-primary/5">
            <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-4">LIVE QR CODE SCANNER</h3>
            <form onSubmit={handleCheckIn} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={scanBookingId}
                onChange={(e) => setScanBookingId(e.target.value)}
                placeholder="Paste Ticket ID (e.g. 6649f82b...)"
                className="flex-1 bg-surface-container/60 border border-outline-variant/30 rounded-lg px-4 py-3 text-[13px] font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                required
              />
              <button 
                type="submit"
                disabled={scanning}
                className="bg-primary text-on-primary px-6 py-4 rounded-lg font-label-sm text-[11px] uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                Scan
              </button>
            </form>

            {/* Check-in scanning results card */}
            {scanResult && (
              <div className={`p-4 rounded-lg border text-[13px] ${
                scanResult.success ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-error/10 border-error/30 text-error'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[18px]">
                    {scanResult.success ? 'check_circle' : 'error'}
                  </span>
                  <p className="font-bold">{scanResult.message}</p>
                </div>
                {scanResult.success && (
                  <p className="opacity-80">Attendee: {scanResult.details.fullName} • Seat: {scanResult.details.selectedSeats.map(s => s.seatId).join(', ')}</p>
                )}
              </div>
            )}
          </div>

          {/* B. Showcase Creator Form */}
          <div className="glass-panel p-8 rounded-xl border border-outline-variant/15">
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6 select-none">LAUNCH NEW SHOWCASE</h3>
            
            <form onSubmit={handleSubmitEvent} className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Editorial Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. THE FALL SYMPHONY"
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Thematic Narrative</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the aesthetic direction..."
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface h-24 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Launch Date</label>
                  <input 
                    type="datetime-local" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Metropolitan City</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tokyo"
                    className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Venue Landmark</label>
                <input 
                  type="text" 
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Shibuya Sky"
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[14px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Showcase Banner</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="cloudinaryInput"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('cloudinaryInput').click()}
                  className="w-full py-2 border border-outline-variant/30 bg-surface-container/30 rounded text-[11px] font-label-sm uppercase tracking-wider text-on-surface hover:bg-surface-container-highest/20 transition-all text-center"
                >
                  {imageName ? `Attached: ${imageName.slice(0,25)}...` : 'Choose Image File'}
                </button>
              </div>

              <button 
                type="submit"
                disabled={creatingEvent}
                className="w-full bg-primary text-on-primary py-5 rounded font-label-sm text-[13px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-lg"
              >
                {creatingEvent ? 'Uploading Image to Cloudinary...' : 'Launch Runway Showcase'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns (Span 7): Show lists */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 select-none">ACTIVE REPERTOIRE</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {events.map((evt) => (
              <div key={evt._id} className="glass-panel p-6 rounded-xl border border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-6 w-full">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-outline-variant/10 shrink-0">
                    <img src={evt.image} alt={evt.title} className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
                  </div>
                  <div className="select-none">
                    <span className="font-label-sm text-[9px] text-primary uppercase tracking-widest">
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h4 className="font-title-md text-[18px] text-on-surface mb-0.5">{evt.title}</h4>
                    <p className="font-body-md text-[13px] text-on-surface-variant">{evt.venueName} • {evt.location}</p>
                  </div>
                </div>
                
                {/* quick monitor triggers */}
                <div className="flex gap-2 w-full sm:w-auto justify-end select-none">
                  <button 
                    onClick={() => alert(`Reviewing seat capacities for event ID: ${evt._id}`)}
                    className="px-6 py-3 border border-outline-variant/40 rounded text-on-surface hover:bg-surface-variant hover:border-white transition-colors font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Seats
                  </button>
                  <button 
                    onClick={() => {
                      // Fetch first checkin logs or seed simulation ID
                      fetch(`http://localhost:5000/api/bookings/event/${evt._id}/occupied-seats`)
                        .then(res => res.json())
                        .then(data => {
                          alert(`Show has ${data.length} reserved seat(s) synced in the MongoDB Atlas catalog! Monitor check-ins active.`);
                        });
                    }}
                    className="px-6 py-3 bg-surface-container-highest rounded text-on-surface hover:bg-white hover:text-black transition-colors font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">monitoring</span>
                    Monitor
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
