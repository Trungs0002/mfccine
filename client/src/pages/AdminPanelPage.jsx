import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import QrScannerOverlay from '../components/QrScannerOverlay';

const fieldLabelStyle = { display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 };
const sectionLabelStyle = { fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 18, paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' };

const AdminPanelPage = ({ events, setEvents, settings, setSettings, user }) => {
  const { language, t } = useLanguage();
  const formatPrice = (p) => language === 'vi' ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + Number(p).toLocaleString('en-US');
  const isStaff = user?.role === 'staff'; // staff accounts only see Bookings & Applications
  const [activeAdminTab, setActiveTab] = useState(isStaff ? 'bookings' : 'events'); // 'events', 'bookings', 'coupons', 'applications', or 'staff'
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
  const [siteTagline, setSiteTagline] = useState(settings?.siteTagline || '');
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

  // Recruitment application (CTV) management states
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationDeptFilter, setApplicationDeptFilter] = useState('all');
  const [expandedApplicationId, setExpandedApplicationId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({}); // { [applicationId]: draft text }
  const staffName = user?.fullName || user?.email || '';

  // Staff account management states (admin-only tab)
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [loadingStaffAccounts, setLoadingStaffAccounts] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [creatingStaff, setCreatingStaff] = useState(false);

  const fetchAnalytics = () => {
    fetch(`${API_URL}/api/analytics`)
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error fetching analytics:', err));
  };

  const fetchAllBookings = (silent = false) => {
    if (!silent) setLoadingBookings(true);
    fetch(`${API_URL}/api/bookings`)
      .then(res => res.json())
      .then(data => {
        setAllBookings(data);
        if (!silent) setLoadingBookings(false);
      })
      .catch(() => { if (!silent) setLoadingBookings(false); });
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

  const fetchApplications = (silent = false) => {
    if (!silent) setLoadingApplications(true);
    fetch(`${API_URL}/api/applications`)
      .then(res => res.json())
      .then(data => {
        setApplications(data);
        if (!silent) setLoadingApplications(false);
      })
      .catch(() => { if (!silent) setLoadingApplications(false); });
  };

  const fetchStaffAccounts = () => {
    setLoadingStaffAccounts(true);
    fetch(`${API_URL}/api/users?role=staff`)
      .then(res => res.json())
      .then(data => {
        setStaffAccounts(data);
        setLoadingStaffAccounts(false);
      })
      .catch(() => setLoadingStaffAccounts(false));
  };

  useEffect(() => {
    fetchAnalytics();
    if (activeAdminTab === 'bookings') fetchAllBookings();
    if (activeAdminTab === 'coupons') fetchCoupons();
    if (activeAdminTab === 'applications') fetchApplications();
    if (activeAdminTab === 'staff') fetchStaffAccounts();
  }, [events, activeAdminTab]);

  // Auto-sync the history tabs (bookings ledger, CTV applications) every 5s — no manual reload needed.
  // Uses the silent flag so the periodic refresh swaps data in place instead of
  // flashing the loading placeholder over the list every 5s (was causing visible jitter).
  useEffect(() => {
    let fetchFn = null;
    if (activeAdminTab === 'bookings') fetchFn = () => fetchAllBookings(true);
    if (activeAdminTab === 'applications') fetchFn = () => fetchApplications(true);
    if (!fetchFn) return;
    const interval = setInterval(fetchFn, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAdminTab]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) return;
    setCreatingStaff(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newStaffName.trim(), email: newStaffEmail.trim(), password: newStaffPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setStaffAccounts([data, ...staffAccounts]);
        setNewStaffName('');
        setNewStaffEmail('');
        setNewStaffPassword('');
      } else {
        alert(data.error || 'Failed to create staff account.');
      }
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm(language === 'vi' ? 'Xóa tài khoản nhân viên này?' : 'Delete this staff account?')) return;
    const res = await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) setStaffAccounts(staffAccounts.filter(s => s._id !== id));
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm(language === 'vi' ? 'Xóa đơn ứng tuyển này?' : 'Delete this application?')) return;
    const res = await fetch(`${API_URL}/api/applications/${id}`, { method: 'DELETE' });
    if (res.ok) setApplications(applications.filter(a => a._id !== id));
  };

  const handleAddNote = async (applicationId) => {
    const message = (noteDrafts[applicationId] || '').trim();
    if (!staffName.trim() || !message) return;
    const res = await fetch(`${API_URL}/api/applications/${applicationId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: staffName.trim(), message }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApplications(applications.map(a => a._id === applicationId ? updated : a));
      setNoteDrafts(d => ({ ...d, [applicationId]: '' }));
    }
  };

  const handleToggleResolved = async (application) => {
    const resolved = !application.resolved;
    const res = await fetch(`${API_URL}/api/applications/${application._id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved, resolvedBy: resolved ? staffName : null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApplications(applications.map(a => a._id === application._id ? updated : a));
    }
  };

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
      body: JSON.stringify({ siteName, siteTagline, contactEmail })
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        alert('Branding updated.');
        setUpdatingSettings(false);
      })
      .catch(() => setUpdatingSettings(false));
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

  const ADMIN_TABS = [
    { id: 'events', icon: 'theater_comedy', label: t('manageEvents') },
    { id: 'bookings', icon: 'confirmation_number', label: t('manageTickets') },
    { id: 'coupons', icon: 'sell', label: language === 'vi' ? 'Mã giảm giá' : 'Discount Codes' },
    { id: 'applications', icon: 'assignment_ind', label: language === 'vi' ? 'Đơn ứng tuyển CTV' : 'CTV Applications' },
    { id: 'staff', icon: 'badge', label: language === 'vi' ? 'Nhân viên' : 'Staff' },
  ].filter(tab => !isStaff || tab.id === 'bookings' || tab.id === 'applications');

  const getStatCards = () => {
    if (activeAdminTab === 'events') {
      return [
        { label: t('activeShows'), value: analytics.activeEvents, icon: 'theater_comedy', color: 'var(--pink)' },
        { label: t('revenue'), value: formatPrice(analytics.totalRevenue), icon: 'payments', color: 'var(--purple)' },
        { label: t('ticketsSold'), value: analytics.ticketsSold, icon: 'confirmation_number', color: 'var(--mint)' },
      ];
    }
    if (activeAdminTab === 'bookings') {
      const checkedIn = allBookings.filter(b => b.isCheckedIn).length;
      return [
        {
          label: language === 'vi' ? 'Tổng số vé đã bán' : 'Total Tickets Sold', value: allBookings.length, icon: 'confirmation_number', color: 'var(--purple)',
          onClick: () => document.getElementById('master-ledger-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        },
        { label: language === 'vi' ? 'Chưa check-in' : 'Not Checked-in', value: allBookings.length - checkedIn, icon: 'schedule', color: '#ffb800' },
        { label: language === 'vi' ? 'Đã check-in' : 'Checked-in', value: checkedIn, icon: 'how_to_reg', color: 'var(--mint)' },
      ];
    }
    if (activeAdminTab === 'coupons') {
      const activeCount = coupons.filter(c => c.active).length;
      return [
        { label: language === 'vi' ? 'Tổng số mã' : 'Total Codes', value: coupons.length, icon: 'sell', color: 'var(--purple)' },
        { label: language === 'vi' ? 'Còn lượt dùng' : 'Still Active', value: activeCount, icon: 'check_circle', color: 'var(--mint)' },
        { label: language === 'vi' ? 'Hết lượt dùng' : 'Exhausted', value: coupons.length - activeCount, icon: 'block', color: '#ff6b6b' },
      ];
    }
    if (activeAdminTab === 'applications') {
      const resolvedCount = applications.filter(a => a.resolved).length;
      return [
        { label: language === 'vi' ? 'Tổng số CTV đã nộp đơn' : 'Total Applications', value: applications.length, icon: 'assignment_ind', color: 'var(--purple)' },
        { label: language === 'vi' ? 'Chưa xử lý' : 'Pending', value: applications.length - resolvedCount, icon: 'pending', color: '#ffb800' },
        { label: language === 'vi' ? 'Đã xử lý' : 'Processed', value: resolvedCount, icon: 'task_alt', color: 'var(--mint)' },
      ];
    }
    return [];
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

      <div className="animate-fade-in" style={{ paddingTop: 120, paddingBottom: 64 }}>
        <div className="container">

          {/* HEADER */}
          <div style={{ marginBottom: 24 }}>
            <h1 className="gradient-title" style={{ fontSize: 'clamp(26px, 4vw, 38px)', margin: '0 0 6px' }}>
              {t('adminCommandCenter')}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>{t('adminSubtitle')}</p>
          </div>

          {/* TAB BAR */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {ADMIN_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 999,
                  border: activeAdminTab === tab.id ? '1px solid rgba(168,150,246,.8)' : '1px solid rgba(168,150,246,.22)',
                  background: activeAdminTab === tab.id ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(1,1,10,.4)',
                  color: activeAdminTab === tab.id ? '#fff' : 'var(--muted)',
                  fontSize: 13, fontWeight: activeAdminTab === tab.id ? 700 : 500,
                  cursor: 'pointer', transition: 'all .2s',
                  boxShadow: activeAdminTab === tab.id ? '0 0 20px rgba(168,150,246,.3)' : 'none',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* STAT CARDS — contextual to the active tab */}
          {(() => {
            const statCards = getStatCards();
            return statCards.length > 0 && (
              <div className="admin-analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                {statCards.map((c, i) => (
                  <div
                    key={i}
                    className="mfc-card"
                    onClick={c.onClick}
                    style={{
                      padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12,
                      cursor: c.onClick ? 'pointer' : 'default',
                      transition: c.onClick ? 'border-color .2s' : undefined,
                    }}
                    onMouseEnter={c.onClick ? (e => e.currentTarget.style.borderColor = 'rgba(168,150,246,.6)') : undefined}
                    onMouseLeave={c.onClick ? (e => e.currentTarget.style.borderColor = '') : undefined}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(168,150,246,.12)', color: c.color }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{c.icon}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4, whiteSpace: 'nowrap' }}>{c.label}</div>
                      <div className="serif" style={{ fontSize: 21, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {activeAdminTab === 'events' ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div className="mfc-card" style={{ padding: 26 }}>
                <h3 style={{ ...sectionLabelStyle, color: 'var(--mint)' }}>{t('websiteBranding')}</h3>
                <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 260px' }}>
                    <label style={fieldLabelStyle}>{t('siteName')}</label>
                    <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder={t('siteName')} className="mfc-input" required />
                  </div>
                  <div style={{ flex: '1 1 260px' }}>
                    <label style={fieldLabelStyle}>{language === 'vi' ? 'Chữ phụ (dưới tên site)' : 'Tagline (below site name)'}</label>
                    <input type="text" value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} placeholder="FOREIGN TRADE UNIVERSITY" className="mfc-input" required />
                  </div>
                  <button type="submit" disabled={updatingSettings} className="btn-pill" style={{ flexShrink: 0 }}>
                    {updatingSettings ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : t('applyChanges')}
                  </button>
                </form>
              </div>

              {/* Active List & Form below */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={sectionLabelStyle}>{t('activeRepertoire')}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {events.map((evt) => {
                      const isBeingEdited = editingEventId === evt._id;
                      return (
                        <div
                          key={evt._id}
                          className="mfc-card admin-event-card"
                          style={{
                            padding: 20, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
                            border: isBeingEdited ? '1px solid rgba(168,150,246,.8)' : undefined,
                            boxShadow: isBeingEdited ? '0 0 24px rgba(168,150,246,.25)' : undefined,
                          }}
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <img src={evt.image} alt="Show" style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover' }} />
                            {isBeingEdited && (
                              <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--purple)', color: '#000', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 800, textTransform: 'uppercase' }}>
                                {language === 'vi' ? 'Đang sửa' : 'Editing'}
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700 }}>
                                {new Date(evt.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--line)' }} />
                              <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                                {new Date(evt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <h4 className="serif" style={{ color: '#fff', fontSize: 19, margin: '0 0 4px' }}>{l(evt.title)}</h4>
                            <p style={{ color: 'var(--muted)', fontSize: 12, fontStyle: 'italic', margin: '0 0 10px' }}>{l(evt.venueName)} • {l(evt.location)}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                              {['vip', 'premium', 'standard'].map(tKey => (
                                <div key={tKey} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: tKey === 'vip' ? '#a896f6' : tKey === 'premium' ? '#5aaddc' : '#10b981' }} />
                                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,.7)' }}>{formatPrice(evt.pricingTiers?.[tKey]?.price || 0)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 'fit-content' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleEditClick(evt)} className={isBeingEdited ? 'btn-pill' : 'btn-outline-pill'} style={{ fontSize: 12 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{isBeingEdited ? 'check_circle' : 'edit'}</span>
                                {isBeingEdited ? (language === 'vi' ? 'Đang chọn' : 'Active') : t('editEvent').split(' ')[0]}
                              </button>
                              <button onClick={() => handleDeleteEvent(evt._id)} style={{ padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                fetch(`${API_URL}/api/bookings/event/${evt._id}/occupied-seats`)
                                  .then(res => res.json())
                                  .then(data => alert(`${l(evt.title)}: ${data.length} seats reserved.`));
                              }}
                              className="btn-outline-pill"
                              style={{ fontSize: 11, justifyContent: 'center' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>monitoring</span>
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
                      style={{
                        width: '100%', padding: '32px', borderRadius: 20, border: '2px dashed rgba(168,150,246,.3)',
                        background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all .2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,150,246,.6)'; e.currentTarget.style.color = 'var(--purple)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(168,150,246,.3)'; e.currentTarget.style.color = 'var(--muted)'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 32 }}>add_circle</span>
                      <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.15em' }}>{t('addNewShowcase')}</span>
                    </button>
                  )}
                </div>

                {/* THE DYNAMIC EVENT FORM */}
                {showEventForm && (
                  <div id="event-form-section" className="mfc-card animate-fade-in" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                      <div>
                        <h3 className="serif" style={{ color: '#fff', fontSize: 24, margin: 0 }}>
                          {editingEventId ? t('editEvent') : t('newEvent')}
                        </h3>
                        {editingEventId && (
                          <p style={{ color: 'var(--purple)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 6 }}>
                            {language === 'vi' ? 'Đang chỉnh sửa: ' : 'Editing: '}
                            <span style={{ color: '#fff', fontWeight: 700 }}>{l(events.find(e => e._id === editingEventId)?.title)}</span>
                          </p>
                        )}
                      </div>
                      <button onClick={resetForm} style={{ background: 'rgba(1,1,10,.4)', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 8, borderRadius: 999, display: 'flex' }}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmitEvent} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                      <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label style={fieldLabelStyle}>{t('titleEn')}</label>
                            <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="mfc-input" required />
                          </div>
                          <div>
                            <label style={fieldLabelStyle}>{t('descEn')}</label>
                            <textarea value={descEn} onChange={e => setDescEn(e.target.value)} className="mfc-input" style={{ height: 96, resize: 'vertical' }} required />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('titleVi')}</label>
                            <input type="text" value={titleVi} onChange={e => setTitleVi(e.target.value)} className="mfc-input" required />
                          </div>
                          <div>
                            <label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('descVi')}</label>
                            <textarea value={descVi} onChange={e => setDescVi(e.target.value)} className="mfc-input" style={{ height: 96, resize: 'vertical' }} required />
                          </div>
                        </div>
                      </div>

                      <div className="admin-form-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                        <div><label style={fieldLabelStyle}>{t('dateLabel')}</label><input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="mfc-input" required /></div>
                        <div><label style={fieldLabelStyle}>{t('cityEn')}</label><input type="text" value={locEn} onChange={e => setLocEn(e.target.value)} className="mfc-input" required /></div>
                        <div><label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('cityVi')}</label><input type="text" value={locVi} onChange={e => setLocVi(e.target.value)} className="mfc-input" required /></div>
                      </div>

                      <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div><label style={fieldLabelStyle}>{t('venueEn')}</label><input type="text" value={venueEn} onChange={e => setVenueEn(e.target.value)} className="mfc-input" required /></div>
                        <div><label style={{ ...fieldLabelStyle, color: 'var(--purple)' }}>{t('venueVi')}</label><input type="text" value={venueVi} onChange={e => setVenueVi(e.target.value)} className="mfc-input" required /></div>
                      </div>

                      <div>
                        <h4 style={{ ...sectionLabelStyle, fontWeight: 700, letterSpacing: '.15em' }}>{t('ticketPricing')}</h4>
                        <div className="admin-tier-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                          {['standard', 'premium', 'vip'].map(tKey => (
                            <div key={tKey} className="mfc-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <p style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--purple)', margin: 0 }}>{tKey} Tier</p>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input type="text" value={tiers[tKey].labelEn} onChange={e => updateTierField(tKey, 'labelEn', e.target.value)} placeholder="Label (EN)" className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required />
                                <input type="text" value={tiers[tKey].labelVi} onChange={e => updateTierField(tKey, 'labelVi', e.target.value)} placeholder="Tên (VI)" className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', flexShrink: 0 }}>Price ($)</span>
                                <input type="number" value={tiers[tKey].price} onChange={e => updateTierField(tKey, 'price', e.target.value)} className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Schedule Section */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 18, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                          <h4 style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.15em', fontWeight: 700, margin: 0 }}>
                            {language === 'vi' ? 'Lịch trình sự kiện' : 'Event Itinerary'}
                          </h4>
                          <button type="button" onClick={addScheduleItem} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                            + {language === 'vi' ? 'Thêm mốc' : 'Add Time Slot'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {schedule.map((item, idx) => (
                            <div key={idx} className="mfc-card" style={{ padding: 18, position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              <button type="button" onClick={() => removeScheduleItem(idx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                              </button>
                              <div className="admin-schedule-grid" style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr 2fr', gap: 14 }}>
                                <div><label style={{ ...fieldLabelStyle, fontSize: 9 }}>Time</label><input type="text" value={item.time} onChange={e => { const ns = [...schedule]; ns[idx].time = e.target.value; setSchedule(ns); }} placeholder="19:00" className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required /></div>
                                <div><label style={{ ...fieldLabelStyle, fontSize: 9 }}>Title (EN)</label><input type="text" value={item.titleEn} onChange={e => { const ns = [...schedule]; ns[idx].titleEn = e.target.value; setSchedule(ns); }} className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required /></div>
                                <div><label style={{ ...fieldLabelStyle, fontSize: 9, color: 'var(--purple)' }}>Tên (VI)</label><input type="text" value={item.titleVi} onChange={e => { const ns = [...schedule]; ns[idx].titleVi = e.target.value; setSchedule(ns); }} className="mfc-input" style={{ fontSize: 12, padding: '10px 12px' }} required /></div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <textarea value={item.descEn} onChange={e => { const ns = [...schedule]; ns[idx].descEn = e.target.value; setSchedule(ns); }} placeholder="Description (EN)" className="mfc-input" style={{ fontSize: 11, height: 56, resize: 'vertical' }} required />
                                <textarea value={item.descVi} onChange={e => { const ns = [...schedule]; ns[idx].descVi = e.target.value; setSchedule(ns); }} placeholder="Mô tả (VI)" className="mfc-input" style={{ fontSize: 11, height: 56, resize: 'vertical' }} required />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <button
                          type="button"
                          onClick={() => { setImage('/kv-doc.jpeg'); setImageName('kv-doc.jpeg'); }}
                          className="btn-outline-pill"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>image</span>
                          {imageName ? `${language === 'vi' ? 'Đã chọn' : 'Selected'}: ${imageName}` : editingEventId ? (language === 'vi' ? 'Thay ảnh sự kiện' : 'Replace Event Image') : (language === 'vi' ? 'Dùng ảnh sự kiện' : 'Use Event Image')}
                        </button>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <button type="button" onClick={resetForm} className="btn-outline-pill" style={{ flex: 1, justifyContent: 'center' }}>{t('cancel')}</button>
                          <button type="submit" disabled={submittingEvent} className="btn-pill" style={{ flex: 2, justifyContent: 'center' }}>
                            {submittingEvent ? (language === 'vi' ? 'Đang lưu...' : 'Synchronizing...') : (editingEventId ? t('confirmUpdates') : t('saveShowcase'))}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ) : activeAdminTab === 'coupons' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>{language === 'vi' ? 'Mã giảm giá' : 'Discount Codes'}</h3>
                <button onClick={fetchCoupons} style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span> {language === 'vi' ? 'Tải lại' : 'Reload'}
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="mfc-card admin-coupon-form" style={{ padding: 20, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <label style={fieldLabelStyle}>{language === 'vi' ? 'Mã' : 'Code'}</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="MFC2026"
                    className="mfc-input"
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                    required
                  />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <label style={fieldLabelStyle}>%</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newCouponPercent}
                    onChange={e => setNewCouponPercent(e.target.value)}
                    placeholder="10"
                    className="mfc-input"
                    required
                  />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={fieldLabelStyle}>
                    {language === 'vi' ? 'Số lượt vé áp dụng' : 'Max seats'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCouponMaxSeats}
                    onChange={e => setNewCouponMaxSeats(e.target.value)}
                    placeholder={language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
                    className="mfc-input"
                  />
                </div>
                <button type="submit" disabled={submittingCoupon} className="btn-pill" style={{ flexShrink: 0 }}>
                  {submittingCoupon ? '...' : (language === 'vi' ? 'Tạo mã' : 'Create')}
                </button>
              </form>

              {loadingCoupons ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </p>
              ) : coupons.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có mã giảm giá nào.' : 'No discount codes yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {coupons.map(c => (
                    <div key={c._id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--purple)', fontWeight: 700, letterSpacing: '.05em', fontSize: 15 }}>{c.code}</span>
                        <span style={{ color: 'var(--mint)', fontWeight: 700, fontSize: 14 }}>−{c.percent}%</span>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                          {c.maxSeats
                            ? (language === 'vi' ? `Tối đa ${c.maxSeats} vé/đơn` : `Max ${c.maxSeats} seats/order`)
                            : (language === 'vi' ? 'Không giới hạn vé' : 'Unlimited seats')}
                        </span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                          border: `1px solid ${c.active ? 'rgba(158,254,253,.3)' : 'rgba(255,107,107,.3)'}`,
                          color: c.active ? 'var(--mint)' : '#ff6b6b',
                          background: c.active ? 'rgba(158,254,253,.08)' : 'rgba(255,107,107,.08)',
                        }}>
                          {c.active ? (language === 'vi' ? 'Đang bật' : 'Active') : (language === 'vi' ? 'Đã tắt' : 'Inactive')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleToggleCoupon(c)} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                          {c.active ? (language === 'vi' ? 'Tắt' : 'Disable') : (language === 'vi' ? 'Bật' : 'Enable')}
                        </button>
                        <button onClick={() => handleDeleteCoupon(c._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeAdminTab === 'applications' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>
                  {language === 'vi' ? 'Đơn ứng tuyển CTV' : 'CTV Applications'}
                </h3>
              </div>

              {(() => {
                const deptOptions = ['all', ...Array.from(new Set(applications.map(a => a.department)))];
                const filteredApplications = applicationDeptFilter === 'all'
                  ? applications
                  : applications.filter(a => a.department === applicationDeptFilter);

                return (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      {deptOptions.map(d => (
                        <button
                          key={d}
                          onClick={() => setApplicationDeptFilter(d)}
                          style={{
                            padding: '9px 18px', borderRadius: 999, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em',
                            border: applicationDeptFilter === d ? '1px solid rgba(168,150,246,.8)' : '1px solid var(--line)',
                            background: applicationDeptFilter === d ? 'linear-gradient(135deg, var(--ultra), var(--purple))' : 'rgba(1,1,10,.4)',
                            color: applicationDeptFilter === d ? '#fff' : 'var(--muted)',
                            cursor: 'pointer', transition: 'all .2s',
                          }}
                        >
                          {d === 'all' ? (language === 'vi' ? 'Tất cả' : 'All') : d}
                          {' '}({d === 'all' ? applications.length : applications.filter(a => a.department === d).length})
                        </button>
                      ))}
                    </div>

                    {loadingApplications ? (
                      <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                        {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                      </p>
                    ) : filteredApplications.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                        {language === 'vi' ? 'Chưa có đơn ứng tuyển nào.' : 'No applications yet.'}
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filteredApplications.map(a => {
                          const isExpanded = expandedApplicationId === a._id;
                          return (
                            <div key={a._id} style={{ borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)', overflow: 'hidden' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{a.name}</span>
                                  <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', border: '1px solid rgba(168,150,246,.3)', color: 'var(--purple)', background: 'rgba(168,150,246,.1)' }}>
                                    {a.department}
                                  </span>
                                  <span
                                    style={{
                                      padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                                      border: `1px solid ${a.resolved ? 'rgba(158,254,253,.3)' : 'rgba(255,184,0,.3)'}`,
                                      color: a.resolved ? 'var(--mint)' : '#ffb800',
                                      background: a.resolved ? 'rgba(158,254,253,.08)' : 'rgba(255,184,0,.08)',
                                    }}
                                    title={a.resolved ? `${language === 'vi' ? 'Xử lý bởi' : 'Processed by'} ${a.resolvedBy || '—'}` : ''}
                                  >
                                    {a.resolved ? (language === 'vi' ? 'Đã xử lý' : 'Processed') : (language === 'vi' ? 'Chưa xử lý' : 'Pending')}
                                  </span>
                                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                                    {new Date(a.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                  </span>
                                  <span style={{ color: 'var(--muted)', fontSize: 11 }}>{a.email} · {a.phone}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => setExpandedApplicationId(isExpanded ? null : a._id)} className="btn-outline-pill" style={{ fontSize: 11, padding: '8px 16px' }}>
                                    {isExpanded ? (language === 'vi' ? 'Thu gọn' : 'Collapse') : (language === 'vi' ? 'Xem chi tiết' : 'View details')}
                                  </button>
                                  {!isStaff && (
                                    <button onClick={() => handleDeleteApplication(a._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
                                  <div className="admin-app-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Ngày sinh: ' : 'DOB: '}</span><span style={{ color: '#fff' }}>{a.dob}</span></p>
                                    <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>{language === 'vi' ? 'Trường / đơn vị: ' : 'School: '}</span><span style={{ color: '#fff' }}>{a.school || '—'}</span></p>
                                    {a.facebook && (
                                      <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>Facebook: </span><a href={a.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', wordBreak: 'break-all' }}>{a.facebook}</a></p>
                                    )}
                                    {a.portfolio && (
                                      <p style={{ margin: 0 }}><span style={{ color: 'var(--muted)' }}>Portfolio: </span><a href={a.portfolio} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)', wordBreak: 'break-all' }}>{a.portfolio}</a></p>
                                    )}
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                                    {(a.answers || []).map((qa, i) => qa.answer && (
                                      <div key={i}>
                                        <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 4px' }}>
                                          {language === 'vi' ? `Câu ${i + 1}` : `Q${i + 1}`}
                                        </p>
                                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{qa.question}</p>
                                        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{qa.answer}</p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Processing notes */}
                                  <div style={{ paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                      <p style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', margin: 0 }}>
                                        {language === 'vi' ? 'Ghi chú' : 'Notes'}
                                      </p>
                                      <button
                                        onClick={() => handleToggleResolved(a)}
                                        className={a.resolved ? 'btn-outline-pill' : 'btn-pill'}
                                        style={{ fontSize: 10, padding: '7px 14px' }}
                                      >
                                        {a.resolved ? (language === 'vi' ? '↺ Đánh dấu chưa xử lý' : '↺ Mark Unprocessed') : (language === 'vi' ? '✓ Đánh dấu đã xử lý' : '✓ Mark Processed')}
                                      </button>
                                    </div>

                                    {(a.notes || []).length > 0 && (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                        {a.notes.map((n, i) => (
                                          <div key={i} style={{ borderRadius: 10, background: 'rgba(1,1,10,.4)', border: '1px solid var(--line)', padding: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                              <span style={{ fontWeight: 700, color: 'var(--purple)', fontSize: 12 }}>{n.author}</span>
                                              <span style={{ color: 'var(--muted)', fontSize: 10 }}>
                                                {new Date(n.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                              </span>
                                            </div>
                                            <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>{n.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {a.resolved ? (
                                      <p style={{ color: 'var(--mint)', fontSize: 12, fontStyle: 'italic', margin: 0 }}>
                                        {language === 'vi'
                                          ? `Đã được xử lý xong bởi ${a.resolvedBy || '—'}${a.resolvedAt ? ` lúc ${new Date(a.resolvedAt).toLocaleString('vi-VN')}` : ''}. Bấm "Đánh dấu chưa xử lý" để mở lại.`
                                          : `Processed by ${a.resolvedBy || '—'}${a.resolvedAt ? ` at ${new Date(a.resolvedAt).toLocaleString('en-US')}` : ''}. Click "Mark Unprocessed" to reopen.`}
                                      </p>
                                    ) : (
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <input
                                          value={noteDrafts[a._id] || ''}
                                          onChange={e => setNoteDrafts(d => ({ ...d, [a._id]: e.target.value }))}
                                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(a._id); } }}
                                          placeholder={language === 'vi' ? 'Nhập ghi chú...' : 'Enter a note...'}
                                          className="mfc-input"
                                          style={{ flex: 1, fontSize: 12, padding: '10px 14px' }}
                                        />
                                        <button
                                          onClick={() => handleAddNote(a._id)}
                                          disabled={!staffName.trim() || !(noteDrafts[a._id] || '').trim()}
                                          className="btn-pill"
                                          style={{ fontSize: 11, flexShrink: 0 }}
                                        >
                                          {language === 'vi' ? 'Gửi' : 'Send'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : activeAdminTab === 'staff' ? (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, marginBottom: 24, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>
                  {language === 'vi' ? 'Tài khoản nhân viên' : 'Staff Accounts'}
                </h3>
                <button onClick={fetchStaffAccounts} style={{ background: 'none', border: 'none', color: 'var(--purple)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span> {language === 'vi' ? 'Tải lại' : 'Reload'}
                </button>
              </div>

              <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 0, marginBottom: 20 }}>
                {language === 'vi'
                  ? 'Tài khoản nhân viên chỉ có thể xem "Quản lý vé" và "Đơn ứng tuyển CTV" trong trang quản trị.'
                  : 'Staff accounts can only access "Manage Tickets" and "CTV Applications" in the admin panel.'}
              </p>

              <form onSubmit={handleCreateStaff} className="mfc-card" style={{ padding: 20, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={fieldLabelStyle}>{language === 'vi' ? 'Họ và tên' : 'Full Name'}</label>
                  <input type="text" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'} className="mfc-input" required />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={fieldLabelStyle}>Email</label>
                  <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} placeholder="email@example.com" className="mfc-input" required />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={fieldLabelStyle}>{language === 'vi' ? 'Mật khẩu' : 'Password'}</label>
                  <input type="password" value={newStaffPassword} onChange={e => setNewStaffPassword(e.target.value)} placeholder="••••••••" className="mfc-input" required />
                </div>
                <button type="submit" disabled={creatingStaff} className="btn-pill" style={{ flexShrink: 0 }}>
                  {creatingStaff ? '...' : (language === 'vi' ? 'Tạo tài khoản' : 'Create Account')}
                </button>
              </form>

              {loadingStaffAccounts ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                </p>
              ) : staffAccounts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có tài khoản nhân viên nào.' : 'No staff accounts yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {staffAccounts.map(s => (
                    <div key={s._id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)' }}>
                      <div>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{s.fullName}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 10 }}>{s.email}</span>
                      </div>
                      <button onClick={() => handleDeleteStaff(s._id)} style={{ padding: '8px 10px', borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mfc-card animate-fade-in" style={{ padding: 32 }}>

              {/* ── Live Scanner ── */}
              <h3 style={sectionLabelStyle}>{t('liveScanner')}</h3>
              <button
                onClick={() => { setScanResult(null); setShowScanner(true); }}
                className="btn-pill"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 18, padding: '14px 20px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>photo_camera</span>
                {language === 'vi' ? 'Bật camera quét QR' : 'Start Camera Scanner'}
              </button>

              <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                {language === 'vi' ? 'Hoặc nhập mã vé thủ công' : 'Or enter ticket code manually'}
              </p>
              <form onSubmit={(e) => { e.preventDefault(); handleCheckIn(); }} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                <input
                  type="text"
                  value={scanBookingId}
                  onChange={(e) => setScanBookingId(e.target.value)}
                  placeholder="MFCXXXXXXXX"
                  className="mfc-input"
                  style={{ fontFamily: 'monospace' }}
                  required
                />
                <button type="submit" disabled={scanning} className="btn-pill" style={{ flexShrink: 0 }}>
                  {scanning ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span> : t('scan')}
                </button>
              </form>

              {/* ── Scan Result Card ── */}
              {scanResult && (() => {
                const isValid = scanResult.status === 'valid';
                const isUsed = scanResult.status === 'already_used';
                const d = scanResult.details;

                const cfg = isValid
                  ? { color: 'var(--mint)', icon: 'check_circle', label: language === 'vi' ? 'HỢP LỆ — VÀO CỬA' : 'VALID — ADMITTED' }
                  : isUsed
                    ? { color: '#ffb800', icon: 'warning', label: language === 'vi' ? 'ĐÃ SỬ DỤNG' : 'ALREADY USED' }
                    : { color: '#ff6b6b', icon: 'cancel', label: language === 'vi' ? 'KHÔNG TÌM THẤY' : 'NOT FOUND' };

                return (
                  <div style={{ marginBottom: 28, borderRadius: 16, overflow: 'hidden', border: `1px solid ${cfg.color}55`, background: `${cfg.color}0d` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${cfg.color}33` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: cfg.color }}>{cfg.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: cfg.color, textTransform: 'uppercase' }}>{cfg.label}</span>
                      <button onClick={() => setScanResult(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                      </button>
                    </div>

                    {d ? (
                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--muted)' }}>person</span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{d.fullName}</div>
                            <div style={{ color: 'var(--muted)', fontSize: 12 }}>{d.email}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--muted)' }}>qr_code</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--purple)', fontWeight: 700, letterSpacing: '.05em' }}>{d.ticketCode}</span>
                        </div>

                        {d.eventTitle && (
                          <div style={{ display: 'flex', gap: 10 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--muted)' }}>event</span>
                            <div>
                              <div style={{ color: '#fff', fontWeight: 600 }}>
                                {typeof d.eventTitle === 'object' ? (d.eventTitle[language] || d.eventTitle.en) : d.eventTitle}
                              </div>
                              {d.eventDate && (
                                <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                                  {new Date(d.eventDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {d.selectedSeats?.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--muted)' }}>chair</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {d.selectedSeats.map((s, i) => (
                                <span key={i} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 10, fontFamily: 'monospace', background: 'rgba(168,150,246,.12)', border: '1px solid rgba(168,150,246,.25)', color: 'var(--purple)' }}>
                                  {s.seatId.split('-').slice(2).join(' ')} • {s.type}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--muted)' }}>payments</span>
                          <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{formatPrice(d.subtotal)}</span>
                          <span style={{ color: 'var(--muted)', fontSize: 11 }}>{d.paymentMethod}</span>
                        </div>

                        {isUsed && d.checkInDate && (
                          <div style={{ display: 'flex', gap: 10, paddingTop: 10, borderTop: '1px solid rgba(255,184,0,.2)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffb800' }}>schedule</span>
                            <div>
                              <div style={{ fontSize: 10, color: '#ffb800', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                                {language === 'vi' ? 'Đã quét lúc' : 'Scanned at'}
                              </div>
                              <div style={{ fontFamily: 'monospace', color: '#fff', fontSize: 13 }}>
                                {new Date(d.checkInDate).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                              </div>
                            </div>
                          </div>
                        )}

                        {isValid && d.checkInDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10, borderTop: '1px solid rgba(158,254,253,.2)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--mint)' }}>verified</span>
                            <span style={{ fontFamily: 'monospace', color: 'var(--mint)', fontSize: 12 }}>
                              {new Date(d.checkInDate).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US')}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ padding: 16, fontSize: 13, color: '#ff6b6b', margin: 0 }}>{scanResult.message}</p>
                    )}
                  </div>
                );
              })()}

              {/* ── Check-in overview: two split lists ── */}
              <div className="admin-checkin-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
                {[
                  { key: 'in', title: language === 'vi' ? 'Đã check-in' : 'Checked-in', color: 'var(--mint)', icon: 'check_circle', list: allBookings.filter(b => b.isCheckedIn) },
                  { key: 'out', title: language === 'vi' ? 'Chưa check-in' : 'Not Checked-in', color: '#ffb800', icon: 'schedule', list: allBookings.filter(b => !b.isCheckedIn) },
                ].map(group => (
                  <div key={group.key}>
                    <h4 style={{ ...sectionLabelStyle, color: group.color }}>{group.title} ({group.list.length})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto', paddingRight: 4 }}>
                      {group.list.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                          {language === 'vi' ? 'Không có vé nào.' : 'No tickets.'}
                        </p>
                      ) : group.list.map(b => (
                        <div key={b._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--line)', background: 'rgba(1,1,10,.3)' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.fullName}</div>
                            <div style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'monospace' }}>{b.ticketCode || b._id.toString().slice(-8).toUpperCase()}</div>
                          </div>
                          <span className="material-symbols-outlined" style={{ color: group.color, fontSize: 18, flexShrink: 0 }}>{group.icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Master ledger: full ticket list ── */}
              <div id="master-ledger-section" style={{ paddingBottom: 16, marginBottom: 20, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                <h3 className="serif" style={{ color: '#fff', fontSize: 22, margin: 0 }}>{t('masterLedger')}</h3>
              </div>

              {loadingBookings ? (
                <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', fontSize: 12 }}>
                  {language === 'vi' ? 'Đang đồng bộ...' : 'Synchronizing Global Sales...'}
                </p>
              ) : allBookings.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 13 }}>
                  {language === 'vi' ? 'Chưa có đơn đặt vé nào.' : 'No bookings yet.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {allBookings.map(booking => (
                    <div key={booking._id} className="admin-booking-row" style={{ display: 'grid', gridTemplateColumns: '90px 1.4fr 1fr 100px auto', alignItems: 'center', gap: 16, padding: 16, borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(1,1,10,.35)' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--purple)', fontSize: 12 }}>{booking._id.toString().slice(-8).toUpperCase()}</span>

                      <div>
                        {editingBookingId === booking._id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 220 }}>
                            <input value={editBookingName} onChange={e => setEditBookingName(e.target.value)} className="mfc-input" style={{ fontSize: 12, padding: '8px 12px' }} />
                            <input value={editBookingEmail} onChange={e => setEditBookingEmail(e.target.value)} className="mfc-input" style={{ fontSize: 12, padding: '8px 12px' }} />
                          </div>
                        ) : (
                          <>
                            <p style={{ fontWeight: 700, color: '#fff', margin: 0 }}>{booking.fullName}</p>
                            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{booking.email}</p>
                            <p style={{ fontSize: 10, color: 'var(--mint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', margin: '4px 0 0' }}>{l(booking.eventId?.title)}</p>
                          </>
                        )}
                      </div>

                      <div>
                        <p style={{ margin: 0, color: '#fff' }}>{booking.selectedSeats?.length} Seat(s)</p>
                        <p style={{ margin: '2px 0 0', color: 'var(--purple)', fontWeight: 700 }}>{formatPrice(booking.subtotal)}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--muted)' }}>{booking.paymentMethod}</p>
                      </div>

                      <span style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', width: 'fit-content',
                        border: `1px solid ${booking.isCheckedIn ? 'rgba(158,254,253,.3)' : 'rgba(168,150,246,.3)'}`,
                        color: booking.isCheckedIn ? 'var(--mint)' : 'var(--purple)',
                        background: booking.isCheckedIn ? 'rgba(158,254,253,.08)' : 'rgba(168,150,246,.08)',
                      }}>
                        {booking.isCheckedIn ? t('passUsed') : 'Valid'}
                      </span>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        {isStaff ? null : editingBookingId === booking._id ? (
                          <>
                            <button onClick={saveBookingEdit} style={{ background: 'none', border: 'none', color: 'var(--mint)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', cursor: 'pointer' }}>{t('save')}</button>
                            <button onClick={() => setEditingBookingId(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', cursor: 'pointer' }}>{t('cancel')}</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditBooking(booking)} style={{ padding: 8, borderRadius: 999, border: '1px solid var(--line)', background: 'none', color: 'var(--muted)', cursor: 'pointer', display: 'flex' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit</span>
                            </button>
                            <button onClick={() => handleDeleteBooking(booking._id)} style={{ padding: 8, borderRadius: 999, border: '1px solid rgba(255,107,107,.3)', background: 'rgba(255,107,107,.08)', color: '#ff6b6b', cursor: 'pointer', display: 'flex' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .admin-analytics-grid { grid-template-columns: 1fr !important; }
          .admin-checkin-split { grid-template-columns: 1fr !important; }
          .admin-form-grid-2, .admin-form-grid-3, .admin-tier-grid, .admin-schedule-grid, .admin-app-detail-grid {
            grid-template-columns: 1fr !important;
          }
          .admin-booking-row {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>
    </>
  );
};

export default AdminPanelPage;
