import React, { useState, useEffect } from 'react';

const AdminPanelPage = ({ events, setEvents, setView }) => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    checkedInCount: 0,
    totalBookingsCount: 0
  });
  
  // Event Creator Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [venueName, setVenueName] = useState('');
  const [silverPrice, setSilverPrice] = useState('150');
  const [goldPrice, setGoldPrice] = useState('250');
  const [vipPrice, setVIPPrice] = useState('450');
  const [imageBase64, setImageBase64] = useState('');
  const [imageName, setImageName] = useState('');
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Scanner Simulator states
  const [scanBookingId, setScanBookingId] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // 1. Fetch Analytics details from backend
  const fetchAnalytics = () => {
    fetch('http://localhost:5000/api/admin/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error fetching admin analytics:', err));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [events]);

  // 2. Handle Image Selection & Conversion to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result); // Base64 Data URL!
    };
    reader.readAsDataURL(file);
  };

  // 3. Handle Event Creation (POST)
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!title || !description || !date || !location || !venueName) {
      alert('Please fill out all required fields.');
      return;
    }

    setCreatingEvent(true);

    const payload = {
      title,
      description,
      date: new Date(date),
      location,
      venueName,
      pricingTiers: {
        silver: { price: Number(silverPrice), capacity: 150 },
        gold: { price: Number(goldPrice), capacity: 100 },
        vip: { price: Number(vipPrice), capacity: 50 }
      },
      imageBase64
    };

    fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create event.');
        return res.json();
      })
      .then(newEvent => {
        alert(`Event "${newEvent.title}" successfully created and cover uploaded to Cloudinary!`);
        // Refresh local events list
        setEvents([...events, newEvent]);
        
        // Reset form
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setVenueName('');
        setSilverPrice('150');
        setGoldPrice('250');
        setVIPPrice('450');
        setImageBase64('');
        setImageName('');
        
        setCreatingEvent(false);
      })
      .catch(err => {
        alert(err.message || 'Error occurred during event creation.');
        setCreatingEvent(false);
      });
  };

  // 4. Handle QR Scan / Simulation check-in
  const handleCheckIn = (e) => {
    e.preventDefault();
    if (!scanBookingId.trim()) return;

    setScanning(true);
    setScanResult(null);

    fetch(`http://localhost:5000/api/bookings/${scanBookingId.trim()}/check-in`, {
      method: 'PUT'
    })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Verification failed.'); });
        return res.json();
      })
      .then(data => {
        setScanResult({
          success: true,
          message: `ACCESS GRANTED: ${data.booking.fullName} checked in successfully.`,
          booking: data.booking
        });
        setScanBookingId('');
        fetchAnalytics(); // Refresh counters on screen
        setScanning(false);
      })
      .catch(err => {
        setScanResult({
          success: false,
          message: `ACCESS DENIED: ${err.message}`
        });
        setScanning(false);
      });
  };

  const checkInRate = analytics.totalBookingsCount > 0 
    ? Math.round((analytics.checkedInCount / analytics.totalBookingsCount) * 100)
    : 0;

  return (
    <div className="w-full flex-grow flex flex-col pt-[100px] pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10 gap-12">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant/15 pb-8 select-none">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">CONTROL PANEL OVERVIEW</h1>
          <p className="font-body-md text-on-surface-variant text-[14px]">Configure high-end fashion shows, monitor metrics, and simulate QR check-ins.</p>
        </div>
        <button 
          onClick={() => {
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="border border-outline-variant/40 bg-surface-container-low/20 px-6 py-3 rounded font-label-sm text-label-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          View Client Portal
        </button>
      </div>

      {/* 2. STATS OVERVIEW BENTO GRID */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none animate-fadeIn">
        {/* Card 1: Total Revenue */}
        <div className="glass-panel p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <div>
            <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">Cumulative Gross</p>
            <h2 className="font-display-xl text-[44px] text-primary font-extrabold leading-none">${analytics.totalRevenue}</h2>
          </div>
          <div className="mt-6 flex items-center gap-2 text-secondary text-[12px] font-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Real-time DB Sync</span>
          </div>
        </div>

        {/* Card 2: Tickets Sold */}
        <div className="glass-panel p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">Seats Confirmed</p>
            <h2 className="font-display-xl text-[44px] text-on-surface font-extrabold leading-none">{analytics.ticketsSold}</h2>
          </div>
          <div className="mt-6 flex items-center gap-2 text-on-surface-variant text-[12px] font-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
            <span>Across active shows</span>
          </div>
        </div>

        {/* Card 3: Active Line Count */}
        <div className="glass-panel p-8 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <p className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">Active Runways</p>
            <h2 className="font-display-xl text-[44px] text-on-surface font-extrabold leading-none">{analytics.activeEvents}</h2>
          </div>
          <div className="mt-6 flex items-center gap-2 text-on-surface-variant text-[12px] font-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>Stitch themes seeded</span>
          </div>
        </div>
      </section>

      {/* 3. DUAL ACTION SPLIT (QR Simulator & Event Creator vs Show List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns (Span 5): QR check-in & Event Creator */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
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
                className="bg-primary text-on-primary px-4 py-3 rounded-lg font-label-sm text-[11px] uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                Scan
              </button>
            </form>

            {/* Check-in scanning results card */}
            {scanResult && (
              <div className={`p-4 rounded-lg border text-[13px] ${
                scanResult.success 
                  ? 'bg-secondary/15 border-secondary/30 text-secondary' 
                  : 'bg-error-container/20 border-error-container/30 text-error'
              } animate-fadeIn`}>
                <div className="flex gap-2 items-start">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">
                    {scanResult.success ? 'check_circle' : 'error'}
                  </span>
                  <div>
                    <p className="font-semibold">{scanResult.message}</p>
                    {scanResult.booking && (
                      <p className="text-[11px] mt-1 opacity-80 uppercase font-mono">
                        Ref: {scanResult.booking._id.toString().toUpperCase().slice(-8)} • Seats: {scanResult.booking.selectedSeats.map(s => s.seatId.split('-').slice(2).join(' ')).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Live Progress summary bar */}
            <div className="mt-6 pt-6 border-t border-outline-variant/15 flex flex-col gap-2 select-none text-[12px] font-label-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Doors Admittance Status</span>
                <span className="text-secondary">{analytics.checkedInCount} / {analytics.totalBookingsCount} scanned</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <div className="bg-secondary h-1.5 rounded-full transition-all duration-500" style={{ width: `${checkInRate}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                <span>Total checkout logs</span>
                <span>{checkInRate}% complete</span>
              </div>
            </div>
          </div>

          {/* B. Event Creator Form */}
          <div className="glass-panel p-8 rounded-xl">
            <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 mb-6 select-none">
              CREATE FASHION SHOW
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Show Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ETHEREAL BLOOM COUTURE"
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an elegant, stylized editorial description..."
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors h-20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. New York, USA"
                    className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Venue Name</label>
                <input 
                  type="text" 
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Metropolitan Gallery Loft"
                  className="bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              {/* Pricing tiers */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[8px] text-on-surface-variant uppercase">Silver ($)</label>
                  <input 
                    type="number" 
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(e.target.value)}
                    className="bg-surface-container/40 border border-outline-variant/20 rounded p-2 text-[12px] text-on-surface"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[8px] text-on-surface-variant uppercase">Gold ($)</label>
                  <input 
                    type="number" 
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                    className="bg-surface-container/40 border border-outline-variant/20 rounded p-2 text-[12px] text-on-surface"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-[8px] text-on-surface-variant uppercase">VIP ($)</label>
                  <input 
                    type="number" 
                    value={vipPrice}
                    onChange={(e) => setVIPPrice(e.target.value)}
                    className="bg-surface-container/40 border border-outline-variant/20 rounded p-2 text-[12px] text-on-surface"
                    required
                  />
                </div>
              </div>

              {/* Premium Cloudinary upload portal */}
              <div className="flex flex-col gap-2 border border-dashed border-outline-variant/40 p-4 rounded-lg bg-surface-container/10">
                <label className="font-label-sm text-[10px] text-primary uppercase tracking-wider cursor-pointer flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  Upload Runway Cover (Cloudinary)
                </label>
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
                className="w-full bg-primary text-on-primary py-3 rounded font-label-sm text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors shadow-lg"
              >
                {creatingEvent ? 'Uploading Image to Cloudinary...' : 'Launch E-Runway Showcase'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Columns (Span 7): Show lists */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex justify-between items-end border-b border-outline-variant/15 pb-4 select-none">
            <h3 className="font-title-md text-title-md text-on-surface">Seeded & Custom Runway Shows</h3>
            <span className="font-label-sm text-[11px] text-primary uppercase tracking-widest">{events.length} Live Items</span>
          </div>

          <div className="flex flex-col gap-4">
            {events.map(evt => (
              <div key={evt._id} className="glass-panel p-6 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-primary/10 transition-all duration-300">
                <div className="flex items-center gap-6 select-none">
                  {/* cover preview */}
                  <div className="w-16 h-20 bg-surface-container rounded overflow-hidden relative hidden sm:block">
                    <img 
                      src={evt.image} 
                      alt={evt.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                  </div>
                  <div>
                    <span className="font-label-sm text-[9px] text-primary uppercase tracking-wider block mb-1">
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
                    className="px-4 py-2 border border-outline-variant/40 rounded text-on-surface hover:bg-surface-variant hover:border-white transition-colors font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1.5"
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
                    className="px-4 py-2 bg-surface-container-highest rounded text-on-surface hover:bg-white hover:text-black transition-colors font-label-sm text-[10px] uppercase tracking-wider flex items-center gap-1.5"
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
