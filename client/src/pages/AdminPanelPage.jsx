import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import QrScannerOverlay from '../components/QrScannerOverlay';

const AdminPanelPage = ({ events, setEvents, settings, setSettings }) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [activeAdminTab, setActiveTab] = useState('events'); // 'events', 'bookings', or 'coupons'
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
  const [contactEmail] = useState(settings?.contactEmail || '');
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
    standard: { labelEn: 'STANDARD ENTRY', labelVi: 'HẠNG PHỔ THÔNG', descEn: 'General admission pass.', descVi: 'Vé vào cửa tiêu chuẩn.', price: 100 },
    premium: { labelEn: 'SILVER ATTIRE', labelVi: 'HẠNG BẠC CAO CẤP', descEn: 'Premium seating.', descVi: 'Vị trí ngồi cao cấp.', price: 150 },
    vip: { labelEn: 'VIP FRONT ROW', labelVi: 'HẠNG VIP TRỰC DIỆN', descEn: 'Exclusive front row access.', descVi: 'Quyền lợi hàng ghế đầu độc quyền.', price: 450 }
  });

  // Dynamic Schedule state
  const [schedule, setSchedule] = useState([{ time: '19:00', titleEn: 'Arrival', titleVi: 'Đón khách', descEn: 'Red Carpet', descVi: 'Thảm đỏ' }]);

  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Booking Management states
  const [allBookings, setAllBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editBookingName, setEditBookingName] = useState('');
  const [editBookingEmail, setEditBookingEmail] = useState('');

  // QR Scanning state
  const [scanBookingId, setScanBookingId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  // Discount code management states
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('');
  const [newCouponMaxSeats, setNewCouponMaxSeats] = useState('');
  const [submittingCoupon, setSubmittingCoupon] = useState(false);

  const fetchAnalytics = () => {
    fetch(`${API_URL}/api/analytics`)
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error fetching analytics:', err));
  };

  const fetchAllBookings = () => {
    setLoadingBookings(true);
    fetch(`${API_URL}/api/bookings`)
      .then(res => res.json())
      .then(data => {
        setAllBookings(data);
        setLoadingBookings(false);
      })
      .catch(() => setLoadingBookings(false));
  };

  const fetchCoupons = () => {
    setLoadingCoupons(true);
    fetch(`${API_URL}/api/coupons`)
      .then(res => res.json())
      .then(data => {
        setCoupons(data);
        setLoadingCoupons(false);
      })
      .catch(() => setLoadingCoupons(false));
  };

  useEffect(() => {
    fetchAnalytics();
    if (activeAdminTab === 'bookings') fetchAllBookings();
    if (activeAdminTab === 'coupons') fetchCoupons();
  }, [events, activeAdminTab]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponPercent) return;
    setSubmittingCoupon(true);
    try {
      const res = await fetch(`${API_URL}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode.trim(),
          percent: Number(newCouponPercent),
          maxSeats: newCouponMaxSeats ? Number(newCouponMaxSeats) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons([data, ...coupons]);
        setNewCouponCode('');
        setNewCouponPercent('');
        setNewCouponMaxSeats('');
      } else {
        alert(data.error || 'Failed to create code.');
      }
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    const res = await fetch(`${API_URL}/api/coupons/${coupon._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !coupon.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setCoupons(coupons.map(c => c._id === coupon._id ? data : c));
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this discount code?')) return;
    const res = await fetch(`${API_URL}/api/coupons/${id}`, { method: 'DELETE' });
    if (res.ok) setCoupons(coupons.filter(c => c._id !== id));
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    fetch(`${API_URL}/api/settings`, {
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

    // Safely extract values handling both string (old) and object (new) formats
    const getVal = (field, lang) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      return field[lang] || '';
    };

    setTitleEn(getVal(evt.title, 'en'));
    setTitleVi(getVal(evt.title, 'vi'));
    setDescEn(getVal(evt.description, 'en'));
    setDescVi(getVal(evt.description, 'vi'));

    if (evt.date) {
      const d = new Date(evt.date);
      setDate(d.toISOString().slice(0, 16));
    }

    setLocEn(getVal(evt.location, 'en'));
    setLocVi(getVal(evt.location, 'vi'));
    setVenueEn(getVal(evt.venueName, 'en'));
    setVenueVi(getVal(evt.venueName, 'vi'));

    const mappedTiers = {};
    ['standard', 'premium', 'vip'].forEach(key => {
      const tData = evt.pricingTiers?.[key] || {};
      mappedTiers[key] = {
        labelEn: getVal(tData.label, 'en'),
        labelVi: getVal(tData.label, 'vi'),
        descEn: getVal(tData.description, 'en'),
        descVi: getVal(tData.description, 'vi'),
        price: tData.price || 0
      };
    });
    setTiers(mappedTiers);

    if (evt.schedule && evt.schedule.length > 0) {
      setSchedule(evt.schedule.map(s => ({
        time: s.time,
        titleEn: getVal(s.title, 'en'),
        titleVi: getVal(s.title, 'vi'),
        descEn: getVal(s.description, 'en'),
        descVi: getVal(s.description, 'vi')
      })));
    } else {
      setSchedule([{ time: '19:00', titleEn: '', titleVi: '', descEn: '', descVi: '' }]);
    }

    setImage(null);
    setImageName('');
    setShowEventForm(true);

    setTimeout(() => {
      const el = document.getElementById('event-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const resetForm = () => {
    setEditingEventId(null);
    setTitleEn(''); setTitleVi('');
    setDescEn(''); setDescVi('');
    setDate('');
    setLocEn(''); setLocVi('');
    setVenueEn(''); setVenueVi('');
    setTiers({
      standard: { labelEn: 'STANDARD ENTRY', labelVi: 'HẠNG PHỔ THÔNG', descEn: 'General admission pass.', descVi: 'Vé vào cửa tiêu chuẩn.', price: 100 },
      premium: { labelEn: 'SILVER ATTIRE', labelVi: 'HẠNG BẠC CAO CẤP', descEn: 'Premium seating.', descVi: 'Vị trí ngồi cao cấp.', price: 150 },
      vip: { labelEn: 'VIP FRONT ROW', labelVi: 'HẠNG VIP TRỰC DIỆN', descEn: 'Exclusive front row access.', descVi: 'Quyền lợi hàng ghế đầu độc quyền.', price: 450 }
    });
    setSchedule([{ time: '19:00', titleEn: 'Arrival', titleVi: 'Đón khách', descEn: 'Red Carpet', descVi: 'Thảm đỏ' }]);
    setImage(null);
    setImageName('');
    setShowEventForm(false);
  };

  const handleAddNewEvent = () => {
    resetForm();
    setShowEventForm(true);
    setTimeout(() => {
      const el = document.getElementById('event-form-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const updateTierField = (tierKey, field, val) => {
    setTiers({
      ...tiers,
      [tierKey]: { ...tiers[tierKey], [field]: val }
    });
  };

  const addScheduleItem = () => setSchedule([...schedule, { time: '20:00', titleEn: '', titleVi: '', descEn: '', descVi: '' }]);
  const removeScheduleItem = (idx) => setSchedule(schedule.filter((_, i) => i !== idx));

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setSubmittingEvent(true);

    const formattedTiers = {};
    ['standard', 'premium', 'vip'].forEach(key => {
      const t = tiers[key];
      formattedTiers[key] = {
        label: { en: t.labelEn, vi: t.labelVi },
        description: { en: t.descEn, vi: t.descVi },
        price: Number(t.price),
        capacity: key === 'standard' ? 250 : key === 'premium' ? 150 : 50
      };
    });

    const formattedSchedule = schedule.map(s => ({
      time: s.time,
      title: { en: s.titleEn, vi: s.titleVi },
      description: { en: s.descEn, vi: s.descVi }
    }));

    const eventData = {
      title: { en: titleEn, vi: titleVi },
      description: { en: descEn, vi: descVi },
      date,
      location: { en: locEn, vi: locVi },
      venueName: { en: venueEn, vi: venueVi },
      image,
      pricingTiers: formattedTiers,
      schedule: formattedSchedule
    };

    const url = editingEventId ? `${API_URL}/api/events/${editingEventId}` : `${API_URL}/api/events`;
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
    if (!window.confirm('Archive this event?')) return;
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, { method: 'DELETE' });
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
    const res = await fetch(`${API_URL}/api/bookings/${editingBookingId}`, {
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
    const res = await fetch(`${API_URL}/api/bookings/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAllBookings(allBookings.filter(b => b._id !== id));
      fetchAnalytics();
      alert('Ticket deleted.');
    }
  };

  const handleCheckIn = async (code) => {
    const idToScan = code || scanBookingId;
    if (!idToScan.trim()) return;
    setScanning(true);
    const res = await fetch(`${API_URL}/api/bookings/check-in/${idToScan.trim()}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      // status: 'valid' — newly checked in
      setScanResult({ status: 'valid', message: data.message, details: data.booking });
      fetchAnalytics();
    } else if (data.status === 'already_used') {
      // status: 'already_used' — ticket was already scanned before
      setScanResult({ status: 'already_used', message: data.error, details: data.booking });
    } else {
      // not found or server error
      setScanResult({ status: 'not_found', message: data.error || 'Ticket not found' });
    }
    setScanning(false);
    setScanBookingId('');
  };

  return (
    <>
      {/* Full-screen QR Scanner Overlay */}
      {showScanner && (
        <QrScannerOverlay
          language={language}
          onScan={(code) => {
            setShowScanner(false);
            handleCheckIn(code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

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
            <button onClick={() => setActiveTab('coupons')} className={`px-6 py-3 rounded-lg font-label-sm text-[12px] uppercase tracking-widest transition-all ${activeAdminTab === 'coupons' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:text-white'}`}>
              {language === 'vi' ? 'Mã giảm giá' : 'Discount Codes'}
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
                <h3 className="font-label-sm text-[11px] text-primary uppercase tracking-widest mb-5">{t('liveScanner')}</h3>

                {/* Camera Button */}
                <button
                  onClick={() => { setScanResult(null); setShowScanner(true); }}
                  className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-5 rounded-xl font-label-sm text-[13px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg mb-4"
                >
                  <span className="material-symbols-outlined text-[22px]">photo_camera</span>
                  {language === 'vi' ? 'Bật camera quét QR' : 'Start Camera Scanner'}
                </button>

                {/* Manual input fallback */}
                <div className="border-t border-outline-variant/10 pt-4">
                  <p className="font-label-sm text-[9px] text-on-surface-variant uppercase tracking-widest mb-2">
                    {language === 'vi' ? 'Hoặc nhập mã vé thủ công' : 'Or enter ticket code manually'}
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }} className="flex gap-2">
                    <input
                      type="text"
                      value={scanBookingId}
                      onChange={(e) => setScanBookingId(e.target.value)}
                      placeholder="MFCXXXXXXXX"
                      className="flex-1 bg-surface-container/60 border border-outline-variant/30 rounded-lg px-4 py-3 text-[13px] font-mono text-on-surface focus:border-primary outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={scanning}
                      className="bg-primary text-on-primary px-5 py-3 rounded-lg font-label-sm text-[11px] uppercase tracking-wider hover:bg-white hover:text-black transition-all shadow-md"
                    >
                      {scanning ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : t('scan')}
                    </button>
                  </form>
                </div>

                {/* ── Scan Result Card ── */}
                {scanResult && (() => {
                  const isValid = scanResult.status === 'valid';
                  const isUsed = scanResult.status === 'already_used';
                  const d = scanResult.details;

                  const statusCfg = isValid
                    ? { border: 'border-secondary/40', bg: 'bg-secondary/5', icon: 'check_circle', iconColor: 'text-secondary', badge: 'bg-secondary/15 text-secondary border-secondary/30', label: language === 'vi' ? 'HỢP LỆ — VÀO CỬA' : 'VALID — ADMITTED' }
                    : isUsed
                      ? { border: 'border-[#ffb800]/40', bg: 'bg-[#ffb800]/5', icon: 'warning', iconColor: 'text-[#ffb800]', badge: 'bg-[#ffb800]/15 text-[#ffb800] border-[#ffb800]/30', label: language === 'vi' ? 'ĐÃ SỬ DỤNG' : 'ALREADY USED' }
                      : { border: 'border-error/40', bg: 'bg-error/5', icon: 'cancel', iconColor: 'text-error', badge: 'bg-error/10 text-error border-error/30', label: language === 'vi' ? 'KHÔNG TÌM THẤY' : 'NOT FOUND' };

                  return (
                    <div className={`mt-4 rounded-xl border overflow-hidden ${statusCfg.border} ${statusCfg.bg}`}>
                      {/* Status Header */}
                      <div className={`flex items-center gap-3 px-4 py-3 border-b ${statusCfg.border}`}>
                        <span className={`material-symbols-outlined text-[22px] ${statusCfg.iconColor}`}>
                          {statusCfg.icon}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-label-sm font-black uppercase tracking-widest ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                        <button
                          onClick={() => setScanResult(null)}
                          className="ml-auto text-on-surface-variant hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      {/* Ticket Info */}
                      {d && (
                        <div className="p-4 space-y-3 text-[13px]">
                          {/* Attendee */}
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">person</span>
                            <div>
                              <p className="font-semibold text-on-surface text-[14px]">{d.fullName}</p>
                              <p className="text-on-surface-variant text-[12px]">{d.email}</p>
                            </div>
                          </div>

                          {/* Ticket code */}
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">qr_code</span>
                            <span className="font-mono text-primary font-bold tracking-widest">{d.ticketCode}</span>
                          </div>

                          {/* Event */}
                          {d.eventTitle && (
                            <div className="flex items-start gap-3">
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5">event</span>
                              <div>
                                <p className="text-on-surface font-semibold">
                                  {typeof d.eventTitle === 'object' ? (d.eventTitle[language] || d.eventTitle.en) : d.eventTitle}
                                </p>
                                {d.eventDate && (
                                  <p className="text-on-surface-variant text-[12px]">
                                    {new Date(d.eventDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Seats */}
                          {d.selectedSeats?.length > 0 && (
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">chair</span>
                              <div className="flex flex-wrap gap-1.5">
                                {d.selectedSeats.map((s, i) => (
                                  <span key={i} className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono px-2 py-0.5 rounded">
                                    {s.seatId.split('-').slice(2).join(' ')} • {s.type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Amount */}
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">payments</span>
                            <span className="font-bold text-on-surface text-[15px]">${d.subtotal}</span>
                            <span className="text-on-surface-variant text-[11px]">{d.paymentMethod}</span>
                          </div>

                          {/* Check-in time (if already used) */}
                          {isUsed && d.checkInDate && (
                            <div className="flex items-center gap-3 pt-2 border-t border-[#ffb800]/20">
                              <span className="material-symbols-outlined text-[18px] text-[#ffb800]">schedule</span>
                              <div>
                                <p className="text-[11px] text-[#ffb800] uppercase tracking-widest font-label-sm">
                                  {language === 'vi' ? 'Đã quét lúc' : 'Scanned at'}
                                </p>
                                <p className="text-[13px] text-on-surface font-mono">
                                  {new Date(d.checkInDate).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Success check-in time */}
                          {isValid && d.checkInDate && (
                            <div className="flex items-center gap-3 pt-2 border-t border-secondary/20">
                              <span className="material-symbols-outlined text-[18px] text-secondary">verified</span>
                              <p className="text-[12px] text-secondary font-mono">
                                {new Date(d.checkInDate).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Not found — no details */}
                      {!d && (
                        <p className="p-4 text-[13px] text-error">{scanResult.message}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* RIGHT: Active List & Form below */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <h3 className="font-title-md text-[20px] text-on-surface border-b border-outline-variant/15 pb-4 uppercase italic">{t('activeRepertoire')}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {events.map((evt) => {
                    const isBeingEdited = editingEventId === evt._id;
                    return (
                      <div
                        key={evt._id}
                        className={`glass-panel p-6 rounded-xl border transition-all duration-500 flex flex-col sm:flex-row justify-between items-center gap-6 group ${isBeingEdited
                          ? 'border-primary bg-primary/5 shadow-[0_0_25px_rgba(221,186,238,0.15)] ring-1 ring-primary/40'
                          : 'border-outline-variant/15 hover:border-primary/30'
                          }`}
                      >
                        <div className="flex items-center gap-6 w-full">
                          <div className="relative shrink-0">
                            <img
                              src={evt.image}
                              alt="Show"
                              className={`w-24 h-24 rounded-lg object-cover transition-all duration-700 ${isBeingEdited ? 'mix-blend-normal scale-105 shadow-lg' : 'mix-blend-luminosity group-hover:mix-blend-normal'
                                }`}
                            />
                            {isBeingEdited && (
                              <div className="absolute -top-2 -right-2 bg-primary text-black px-2 py-0.5 rounded-full text-[9px] font-black uppercase animate-bounce shadow-lg">
                                {language === 'vi' ? 'Đang sửa' : 'Editing'}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="font-label-sm text-[10px] text-primary uppercase tracking-widest font-bold">
                                {new Date(evt.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-outline-variant/30"></span>
                              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">
                                {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <h4 className="font-title-md text-[20px] text-on-surface leading-tight mb-1 truncate">
                              {l(evt.title)}
                            </h4>

                            <p className="font-body-md text-[13px] text-on-surface-variant italic mb-3">
                              {l(evt.venueName)} • {l(evt.location)}
                            </p>

                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                              {['vip', 'premium', 'standard'].map(tKey => (
                                <div key={tKey} className="flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${tKey === 'vip' ? 'bg-[#a896f6]' : tKey === 'premium' ? 'bg-[#5aaddc]' : 'bg-[#10b981]'
                                    }`}></span>
                                  <span className="text-[11px] font-mono text-on-surface/70">${evt.pricingTiers?.[tKey]?.price || 0}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0 select-none">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditClick(evt)}
                              className={`flex-1 px-5 py-3 rounded-lg font-label-sm text-[11px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${isBeingEdited
                                ? 'bg-primary text-black border-primary font-bold shadow-lg'
                                : 'bg-surface-container-high text-on-surface hover:bg-white hover:text-black border-outline-variant/20'
                                }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">{isBeingEdited ? 'check_circle' : 'edit'}</span>
                              {isBeingEdited ? (language === 'vi' ? 'Đang chọn' : 'Active') : t('editEvent').split(' ')[0]}
                            </button>
                            <button onClick={() => handleDeleteEvent(evt._id)} className="px-4 py-3 bg-error/10 border border-error/20 text-error hover:bg-error hover:text-white rounded-lg transition-all">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              fetch(`${API_URL}/api/bookings/event/${evt._id}/occupied-seats`)
                                .then(res => res.json())
                                .then(data => alert(`${l(evt.title)}: ${data.length} seats reserved.`));
                            }}
                            className="w-full px-4 py-2.5 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:border-primary hover:text-primary transition-all font-label-sm text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">monitoring</span>
                            {t('logs')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                <div id="event-form-section" className="glass-panel p-8 rounded-xl border border-outline-variant/25 animate-fade-in space-y-10 ring-2 ring-primary/20 shadow-2xl">
                  <div className="flex justify-between items-start border-b border-outline-variant/15 pb-4">
                    <div>
                      <h3 className="font-title-md text-[24px] text-on-surface uppercase italic leading-tight">
                        {editingEventId ? t('editEvent') : t('newEvent')}
                      </h3>
                      {editingEventId && (
                        <p className="text-primary font-label-sm text-[11px] uppercase tracking-widest mt-1">
                          Currently Modifying: <span className="text-white font-bold">{l(events.find(e => e._id === editingEventId)?.title)}</span>
                        </p>
                      )}
                    </div>
                    <button onClick={resetForm} className="text-on-surface-variant hover:text-white bg-surface-container/60 p-2 rounded-full transition-colors"><span className="material-symbols-outlined">close</span></button>
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
                        {['standard', 'premium', 'vip'].map(tKey => (
                          <div key={tKey} className="glass-panel p-5 rounded-xl border border-outline-variant/15 space-y-4">
                            <p className="font-bold text-[12px] uppercase text-primary">{tKey} Tier</p>
                            <div className="grid grid-cols-2 gap-3">
                              <input type="text" value={tiers[tKey].labelEn} onChange={e => updateTierField(tKey, 'labelEn', e.target.value)} placeholder="Label (EN)" className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface focus:border-primary outline-none" required />
                              <input type="text" value={tiers[tKey].labelVi} onChange={e => updateTierField(tKey, 'labelVi', e.target.value)} placeholder="Tên (VI)" className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface focus:border-primary outline-none" required />
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase opacity-60">Price ($)</span>
                              <input type="number" value={tiers[tKey].price} onChange={e => updateTierField(tKey, 'price', e.target.value)} className="bg-background border border-outline-variant/30 rounded p-2 text-[12px] w-full text-on-surface focus:border-primary outline-none" required />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Schedule Section */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b border-outline-variant/15 pb-2">
                        <h4 className="font-label-sm text-[11px] text-primary uppercase tracking-[0.2em] font-bold">Event Itinerary (Schedule)</h4>
                        <button type="button" onClick={addScheduleItem} className="text-[10px] bg-surface-container-highest px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-white hover:text-black transition-all">+ Add Time Slot</button>
                      </div>
                      <div className="space-y-4">
                        {schedule.map((item, idx) => (
                          <div key={idx} className="glass-panel p-5 rounded-xl border border-outline-variant/15 space-y-4 relative group">
                            <button type="button" onClick={() => removeScheduleItem(idx)} className="absolute top-2 right-2 text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-2 space-y-1.5"><label className="text-[9px] uppercase opacity-50">Time</label><input type="text" value={item.time} onChange={e => { const ns = [...schedule]; ns[idx].time = e.target.value; setSchedule(ns); }} placeholder="19:00" className="w-full bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface outline-none" required /></div>
                              <div className="col-span-5 space-y-1.5"><label className="text-[9px] uppercase opacity-50">Title (EN)</label><input type="text" value={item.titleEn} onChange={e => { const ns = [...schedule]; ns[idx].titleEn = e.target.value; setSchedule(ns); }} className="w-full bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface outline-none" required /></div>
                              <div className="col-span-5 space-y-1.5"><label className="text-[9px] uppercase text-primary">Tên (VI)</label><input type="text" value={item.titleVi} onChange={e => { const ns = [...schedule]; ns[idx].titleVi = e.target.value; setSchedule(ns); }} className="w-full bg-background border border-outline-variant/30 rounded p-2 text-[12px] text-on-surface outline-none" required /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <textarea value={item.descEn} onChange={e => { const ns = [...schedule]; ns[idx].descEn = e.target.value; setSchedule(ns); }} placeholder="Description (EN)" className="w-full bg-background border border-outline-variant/30 rounded p-2 text-[11px] h-14 text-on-surface outline-none" required />
                              <textarea value={item.descVi} onChange={e => { const ns = [...schedule]; ns[idx].descVi = e.target.value; setSchedule(ns); }} placeholder="Mô tả (VI)" className="w-full bg-background border border-outline-variant/30 rounded p-2 text-[11px] h-14 text-on-surface outline-none" required />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="cloudinaryInput" />
                      <button type="button" onClick={() => document.getElementById('cloudinaryInput').click()} className="w-full py-4 border border-outline-variant/30 bg-surface-container/30 rounded-lg text-[11px] font-label-sm uppercase tracking-wider text-on-surface hover:bg-surface-container-highest/40 transition-all flex items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-[18px]">image</span>
                        {imageName ? `Attached: ${imageName.slice(0, 25)}...` : editingEventId ? 'Replace Brand Visual' : 'Upload Event Thumbnail'}
                      </button>
                      <div className="flex gap-4">
                        <button type="button" onClick={resetForm} className="flex-1 py-5 border border-outline-variant/30 text-on-surface-variant rounded-xl font-label-sm text-[13px] uppercase hover:text-white transition-all">{t('cancel')}</button>
                        <button type="submit" disabled={submittingEvent} className="flex-[2] bg-primary text-on-primary py-5 rounded-xl font-label-sm text-[13px] uppercase hover:bg-white hover:text-black transition-all shadow-lg font-bold">
                          {submittingEvent ? 'Synchronizing...' : (editingEventId ? t('confirmUpdates') : t('saveShowcase'))}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : activeAdminTab === 'coupons' ? (
          <div className="animate-fade-in glass-panel p-8 rounded-xl border border-outline-variant/15">
            <div className="flex justify-between items-center border-b border-outline-variant/15 pb-4 mb-8">
              <h3 className="font-title-md text-[20px] text-on-surface uppercase italic">{language === 'vi' ? 'Mã giảm giá' : 'Discount Codes'}</h3>
              <button onClick={fetchCoupons} className="text-primary font-label-sm text-[11px] uppercase tracking-widest hover:underline flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">refresh</span> {language === 'vi' ? 'Tải lại' : 'Reload'}
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="glass-panel p-6 rounded-xl border border-outline-variant/15 mb-8 flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-[10px] uppercase text-on-surface-variant tracking-widest">{language === 'vi' ? 'Mã' : 'Code'}</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="MFC2026"
                  className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none uppercase font-mono"
                  required
                />
              </div>
              <div className="w-full sm:w-32 space-y-1.5">
                <label className="text-[10px] uppercase text-on-surface-variant tracking-widest">%</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newCouponPercent}
                  onChange={e => setNewCouponPercent(e.target.value)}
                  placeholder="10"
                  className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none"
                  required
                />
              </div>
              <div className="w-full sm:w-40 space-y-1.5">
                <label className="text-[10px] uppercase text-on-surface-variant tracking-widest">
                  {language === 'vi' ? 'Số lượt vé áp dụng' : 'Max seats'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={newCouponMaxSeats}
                  onChange={e => setNewCouponMaxSeats(e.target.value)}
                  placeholder={language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
                  className="w-full bg-surface-container/40 border border-outline-variant/20 rounded-lg p-3 text-[13px] text-on-surface focus:border-primary outline-none"
                />
              </div>
              <button type="submit" disabled={submittingCoupon} className="w-full sm:w-auto bg-primary text-on-primary px-6 py-3 rounded-lg font-label-sm text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-md">
                {submittingCoupon ? '...' : (language === 'vi' ? 'Tạo mã' : 'Create')}
              </button>
            </form>

            {loadingCoupons ? (
              <p className="py-20 text-center font-label-sm text-on-surface-variant uppercase tracking-widest animate-pulse">
                {language === 'vi' ? 'Đang tải...' : 'Loading...'}
              </p>
            ) : coupons.length === 0 ? (
              <p className="py-10 text-center text-on-surface-variant text-[13px]">
                {language === 'vi' ? 'Chưa có mã giảm giá nào.' : 'No discount codes yet.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {coupons.map(c => (
                  <div key={c._id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border border-outline-variant/15 bg-surface-container/30">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-primary font-bold tracking-widest text-[15px]">{c.code}</span>
                      <span className="text-secondary font-bold text-[14px]">−{c.percent}%</span>
                      <span className="text-on-surface-variant text-[11px]">
                        {c.maxSeats
                          ? (language === 'vi' ? `Tối đa ${c.maxSeats} vé/đơn` : `Max ${c.maxSeats} seats/order`)
                          : (language === 'vi' ? 'Số lượt vé áp dụng ' : 'Unlimited seats')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${c.active ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-error/10 text-error border-error/20'}`}>
                        {c.active ? (language === 'vi' ? 'Đang bật' : 'Active') : (language === 'vi' ? 'Đã tắt' : 'Inactive')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleCoupon(c)} className="px-3 py-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:text-white text-[11px] uppercase tracking-widest transition-all">
                        {c.active ? (language === 'vi' ? 'Tắt' : 'Disable') : (language === 'vi' ? 'Bật' : 'Enable')}
                      </button>
                      <button onClick={() => handleDeleteCoupon(c._id)} className="p-2 hover:bg-error/10 rounded transition-colors text-error">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                              <input value={editBookingName} onChange={e => setEditBookingName(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded p-1.5 text-[12px] text-on-surface focus:border-primary outline-none" />
                              <input value={editBookingEmail} onChange={e => setEditBookingEmail(e.target.value)} className="bg-surface-container border border-outline-variant/30 rounded p-1.5 text-[12px] text-on-surface focus:border-primary outline-none" />
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
    </>
  );
};

export default AdminPanelPage;
