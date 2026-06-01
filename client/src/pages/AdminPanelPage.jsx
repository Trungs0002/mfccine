import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AdminPanelPage = ({ events, setEvents, settings, setSettings }) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [activeAdminTab, setActiveTab] = useState('events'); // 'events' or 'bookings'
  const [showEventForm, setShowEventForm] = useState(false); // Controls visibility of the Create/Edit form
  
  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

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

  // Bilingual Event Management states
  const [editingEventId, setEditingEventId] = useState(null);
  const [titleEn, setTitleEn] = useState('');
  const [titleVi, setTitleVi] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descVi, setDescVi] = useState('');
  const [date, setDate] = useState('');
  const [locEn, setLocEn] = useState('');
  const [locVi, setLocVi] = useState('');
  const [venueEn, setVenueEn] = useState('');
  const [venueVi, setVenueVi] = useState('');
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState('');
  
  // Custom Bilingual Tier states
  const [tiers, setTiers] = useState({
    standard: { labelEn: 'STANDARD ENTRY', labelVi: 'HẠNG PHỔ THÔNG', descEn: '', descVi: '', price: 100 },
    silver: { labelEn: 'SILVER ATTIRE', labelVi: 'HẠNG BẠC CAO CẤP', descEn: '', descVi: '', price: 150 },
    gold: { labelEn: 'GOLD EXPOSURE', labelVi: 'HẠNG VÀNG ĐẲNG CẤP', descEn: '', descVi: '', price: 250 },
    vip: { labelEn: 'VIP FRONT ROW', labelVi: 'HẠNG VIP TRỰC DIỆN', descEn: '', descVi: '', price: 450 }
  });

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
    setTitleEn(evt.title?.en || '');
    setTitleVi(evt.title?.vi || '');
    setDescEn(evt.description?.en || '');
    setDescVi(evt.description?.vi || '');
    const d = new Date(evt.date);
    setDate(d.toISOString().slice(0, 16));
    setLocEn(evt.location?.en || '');
    setLocVi(evt.location?.vi || '');
    setVenueEn(evt.venueName?.en || '');
    setVenueVi(evt.venueName?.vi || '');
    
    const mappedTiers = { ...tiers };
    ['standard', 'silver', 'gold', 'vip'].forEach(key => {
      const tData = evt.pricingTiers?.[key] || {};
      mappedTiers[key] = {
        labelEn: tData.label?.en || '',
        labelVi: tData.label?.vi || '',
        descEn: tData.description?.en || '',
        descVi: tData.description?.vi || '',
        price: tData.price || 0
      };
    });
    setTiers(mappedTiers);

    setImage(null);
    setImageName('');
    setShowEventForm(true);
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingEventId(null);
    setTitleEn(''); setTitleVi('');
    setDescEn(''); setDescVi('');
    setDate('');
    setLocEn(''); setLocVi('');
    setVenueEn(''); setVenueVi('');
    setTiers({
      standard: { labelEn: 'STANDARD ENTRY', labelVi: 'HẠNG PHỔ THÔNG', descEn: '', descVi: '', price: 100 },
      silver: { labelEn: 'SILVER ATTIRE', labelVi: 'HẠNG BẠC CAO CẤP', descEn: '', descVi: '', price: 150 },
      gold: { labelEn: 'GOLD EXPOSURE', labelVi: 'HẠNG VÀNG ĐẲNG CẤP', descEn: '', descVi: '', price: 250 },
      vip: { labelEn: 'VIP FRONT ROW', labelVi: 'HẠNG VIP TRỰC DIỆN', descEn: '', descVi: '', price: 450 }
    });
    setImage(null);
    setImageName('');
    setShowEventForm(false);
  };

  const handleAddNewEvent = () => {
    resetForm();
    setShowEventForm(true);
    window.scrollTo({ top: 800, behavior: 'smooth' });
  };

  const updateTierField = (tierKey, field, val) => {
    setTiers({
      ...tiers,
      [tierKey]: { ...tiers[tierKey], [field]: val }
    });
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmittingEvent(true);

    const formattedTiers = {};
    ['standard', 'silver', 'gold', 'vip'].forEach(key => {
      const t = tiers[key];
      formattedTiers[key] = {
        label: { en: t.labelEn, vi: t.labelVi },
        description: { en: t.descEn, vi: t.descVi },
        price: Number(t.price),
        capacity: key === 'standard' ? 250 : key === 'silver' ? 150 : key === 'gold' ? 100 : 50
      };
    });

    const eventData = {
      title: { en: titleEn, vi: titleVi },
      description: { en: descEn, vi: descVi },
      date,
      location: { en: locEn, vi: locVi },
      venueName: { en: venueEn, vi: venueVi },
      image, 
      pricingTiers: formattedTiers
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
        alert('Success.');
        resetForm();
      }
    } finally {
      setSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Archive?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(ev => ev._id !== id));
        alert('Archived.');
      }
    } catch (err) {
      alert('Delete failed.');
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
      
      {/* HEADER */}
      <div className="flex flex-col gap-8 border-b border-outline-variant/15 pb-8 select-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2 tracking-tight uppercase">{t('adminCommandCenter')}</h1>
            <p className="font-body-md text-on-surface-variant text-[14px]">{t('adminSubtitle')}</p>
          </div>
          <button onClick={() => navigate('/')} className="border border-outline-variant/40 bg-surface-container-low/20 px-8 py-4 rounded font-label-sm text-label-sm uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
            {t('switchClient')}
          </button>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setActiveTab('events')} className={`px-6 py-3 rounded-lg font-label-sm text-[12px] uppercase tracking-widest transition-all ${activeAdminTab === 'events' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:text-white'}`}>
            {t('manageEvents')}
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`px-6 py-3 rounded-lg font-label-sm text-[12px] uppercase tracking-widest transition-all ${activeAdminTab === 'bookings' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:text-white'}`}>
            {t('manageTickets')}
          </button>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 select-none">
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">{t('revenue')}</span>
          <span className="font-display-xl text-[24px] text-primary font-bold">${analytics.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">{t('ticketsSold')}</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.ticketsSold}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">{t('activeShows')}</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.activeEvents}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">{t('checkins')}</span>
          <span className="font-display-xl text-[24px] text-secondary font-bold">{analytics.checkedInCount}</span>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-1">
          <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest">{t('logs')}</span>
          <span className="font-display-xl text-[24px] text-on-surface font-bold">{analytics.totalBookingsCount}</span>
        </div>
      </div>

      {activeAdminTab === 'events' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* LEFT: Branding & Scanner */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="glass-panel p-8 rounded-xl border border-secondary/20 bg-secondary/5">
              <h3 className="font-label-sm text-[11px] text-secondary uppercase tracking-widest mb-4">{t('websiteBranding')}</h3>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder={t('siteName')} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none transition-colors" required />
                <button type="submit" disabled={updatingSettings} className="w-full bg-secondary text-on-secondary py-4 rounded font-label-sm text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-md">
                  {updatingSettings ? 'Sync...' : t('applyChanges')}
                </button>
              </form>
            </div>

            <div className="glass-panel p-8 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-4">{t('liveScanner')}</h3>
              <form onSubmit={handleCheckIn} className="flex gap-2">
                <input type="text" value={scanBookingId} onChange={(e) => setScanBookingId(e.target.value)} placeholder={t('enterTicketId')} className="flex-1 bg-surface-container/60 border border-outline-variant/30 rounded-lg px-4 py-3 text-[13px] font-mono text-on-surface focus:border-primary outline-none" required />
                <button type="submit" disabled={scanning} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-sm text-[11px] uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-md">
                  {t('scan')}
                </button>
              </form>
              {scanResult && <p className={`mt-3 text-[12px] font-bold ${scanResult.success ? 'text-secondary' : 'text-error'}`}>{scanResult.message}</p>}
            </div>
          </div>

          {/* RIGHT: Active List & Form below */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 uppercase italic">{t('activeRepertoire')}</h3>
              <div className="grid grid-cols-1 gap-4">
                {events.map((evt) => (
                  <div key={evt._id} className="glass-panel p-6 rounded-xl border border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-6 w-full">
                      <img src={evt.image} alt="Show" className="w-20 h-20 rounded-lg object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all border border-outline-variant/10" />
                      <div className="flex-1">
                        <h4 className="font-title-md text-[18px] text-on-surface leading-tight mb-1">{l(evt.title)}</h4>
                        <p className="font-body-md text-[13px] text-on-surface-variant italic">{l(evt.location)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 select-none">
                      <button onClick={() => handleEditClick(evt)} className="px-4 py-3 bg-surface-container-high rounded text-on-surface hover:bg-white hover:text-black transition-all font-label-sm text-[10px] uppercase tracking-widest border border-outline-variant/20 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">edit</span> {t('actions')}
                      </button>
                      <button onClick={() => handleDeleteEvent(evt._id)} className="px-4 py-3 bg-error/10 border border-error/30 text-error hover:bg-error hover:text-white rounded transition-all"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
              
              {!showEventForm && (
                <button 
                  onClick={handleAddNewEvent}
                  className="w-full py-8 border-2 border-dashed border-outline-variant/20 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="font-label-sm text-[12px] uppercase tracking-[0.2em]">{t('addNewShowcase')}</span>
                </button>
              )}
            </div>

            {/* THE DYNAMIC EVENT FORM */}
            {showEventForm && (
              <div id="event-form-section" className="glass-panel p-8 rounded-xl border border-outline-variant/25 animate-fade-in space-y-10">
                <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4">
                  <h3 className="font-title-md text-[20px] text-on-surface uppercase italic">
                    {editingEventId ? t('editEvent') : t('newEvent')}
                  </h3>
                  <button onClick={resetForm} className="text-on-surface-variant hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <form onSubmit={handleSubmitEvent} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5"><label className="text-[10px] uppercase text-on-surface-variant tracking-widest">{t('titleEn')}</label><input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required /></div>
                      <div className="space-y-1.5"><label className="text-[10px] uppercase text-on-surface-variant tracking-widest">{t('descEn')}</label><textarea value={descEn} onChange={e => setDescEn(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface h-24 focus:border-primary outline-none" required /></div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5"><label className="text-[10px] uppercase text-primary tracking-widest">{t('titleVi')}</label><input type="text" value={titleVi} onChange={e => setTitleVi(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required /></div>
                      <div className="space-y-1.5"><label className="text-[10px] uppercase text-primary tracking-widest">{t('descVi')}</label><textarea value={descVi} onChange={e => setDescVi(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface h-24 focus:border-primary outline-none" required /></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1.5"><label className="text-[10px] uppercase text-on-surface-variant">{t('dateLabel')}</label><input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required /></div>
                    <div className="space-y-1.5"><label className="text-[10px] uppercase text-on-surface-variant">{t('cityEn')}</label><input type="text" value={locEn} onChange={e => setLocEn(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required /></div>
                    <div className="space-y-1.5"><label className="text-[10px] uppercase text-primary">{t('cityVi')}</label><input type="text" value={locVi} onChange={e => setLocVi(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required /></div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5"><label className="text-[10px] uppercase text-on-surface-variant">{t('venueEn')}</label><input type="text" value={venueEn} onChange={e => setVenueEn(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required /></div>
                    <div className="space-y-1.5"><label className="text-[10px] uppercase text-primary">{t('venueVi')}</label><input type="text" value={venueVi} onChange={e => setVenueVi(e.target.value)} className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none" required /></div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-label-sm text-[11px] text-primary uppercase tracking-[0.2em] font-bold border-b border-outline-variant/15 pb-2">{t('ticketPricing')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {['standard', 'silver', 'gold', 'vip'].map(tKey => (
                        <div key={tKey} className="glass-panel p-5 rounded-xl border border-outline-variant/15 space-y-4">
                          <p className="font-bold text-[12px] uppercase text-primary">{tKey} Tier</p>
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" value={tiers[tKey].labelEn} onChange={e => updateTierField(tKey, 'labelEn', e.target.value)} placeholder="Label (EN)" className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface focus:border-primary outline-none" required />
                            <input type="text" value={tiers[tKey].labelVi} onChange={e => updateTierField(tKey, 'labelVi', e.target.value)} placeholder="Tên (VI)" className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface focus:border-primary outline-none" required />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <textarea value={tiers[tKey].descEn} onChange={e => updateTierField(tKey, 'descEn', e.target.value)} placeholder="Desc (EN)" className="bg-background border border-outline-variant/30 rounded p-2 text-[11px] h-16 text-on-surface focus:border-primary outline-none" required />
                            <textarea value={tiers[tKey].descVi} onChange={e => updateTierField(tKey, 'descVi', e.target.value)} placeholder="Mô tả (VI)" className="bg-background border border-outline-variant/30 rounded p-2 text-[11px] h-16 text-on-surface focus:border-primary outline-none" required />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase opacity-60">Price ($)</span>
                            <input type="number" value={tiers[tKey].price} onChange={e => updateTierField(tKey, 'price', e.target.value)} className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] w-24 text-on-surface focus:border-primary outline-none" required />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="cloudinaryInput" />
                    <button type="button" onClick={() => document.getElementById('cloudinaryInput').click()} className="w-full py-4 border border-outline-variant/30 bg-surface-container/30 rounded-lg text-[11px] font-label-sm uppercase tracking-wider text-on-surface hover:bg-surface-container-highest/40 transition-all flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-[18px]">image</span>
                      {imageName ? `Attached: ${imageName.slice(0,25)}...` : editingEventId ? 'Replace Brand Visual' : 'Upload Event Thumbnail'}
                    </button>
                    <div className="flex gap-4">
                      <button type="button" onClick={resetForm} className="flex-1 py-5 border border-outline-variant/30 text-on-surface-variant rounded-xl font-label-sm text-[13px] uppercase hover:text-white transition-all">{t('cancel')}</button>
                      <button type="submit" disabled={submittingEvent} className="flex-[2] bg-primary text-on-primary py-5 rounded-xl font-label-sm text-[13px] uppercase hover:bg-white hover:text-black transition-all shadow-lg font-bold">
                        {submittingEvent ? 'Syncing...' : (editingEventId ? t('confirmUpdates') : t('saveShowcase'))}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in glass-panel p-8 rounded-xl border border-outline-variant/15">
          <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4 mb-8">
            <h3 className="font-title-md text-[20px] text-on-surface uppercase italic">{t('masterLedger')}</h3>
            <button onClick={fetchAllBookings} className="text-primary font-label-sm text-[11px] uppercase tracking-widest hover:underline flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">refresh</span> {t('reloadLedger')}
            </button>
          </div>

          <div className="overflow-x-auto">
            {loadingBookings ? <p className="py-20 text-center font-label-sm text-on-surface-variant uppercase tracking-widest animate-pulse">Synchronizing Global Sales...</p> : (
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-widest border-b border-outline-variant/10">
                    <th className="pb-4">{t('refId')}</th>
                    <th className="pb-4">{t('attendee')} / {t('showcase')}</th>
                    <th className="pb-4">{t('details')}</th>
                    <th className="pb-4">{t('status')}</th>
                    <th className="pb-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {allBookings.map(booking => (
                    <tr key={booking._id} className="text-on-surface/90 hover:text-on-surface">
                      <td className="py-4 font-mono text-primary text-[12px]">{booking._id.toString().slice(-8).toUpperCase()}</td>
                      <td className="py-4">
                        {editingBookingId === booking._id ? (
                          <div className="flex flex-col gap-2 max-w-[200px]">
                            <input value={editBookingName} onChange={e => setEditBookingName(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded p-1.5 text-[12px] text-on-surface" />
                            <input value={editBookingEmail} onChange={e => setEditBookingEmail(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded p-1.5 text-[12px] text-on-surface" />
                          </div>
                        ) : (
                          <>
                            <p className="font-bold">{booking.fullName}</p>
                            <p className="text-[11px] opacity-60">{booking.email}</p>
                            <p className="text-[10px] text-secondary font-bold mt-1 uppercase tracking-tight">{l(booking.eventId?.title)}</p>
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
                            {booking.isCheckedIn ? t('passUsed') : 'Valid'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {editingBookingId === booking._id ? (
                            <>
                              <button onClick={saveBookingEdit} className="text-secondary font-bold hover:underline uppercase text-[10px]">{t('save')}</button>
                              <button onClick={() => setEditingBookingId(null)} className="text-on-surface-variant hover:underline uppercase text-[10px]">{t('cancel')}</button>
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
