import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../apiConfig';
import { QRCodeSVG } from 'qrcode.react';

const UserDashboardPage = ({ userEmail, setCompletedBookingId, settings }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [qrReveal, setQrReveal]   = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg]         = useState(null); // { type: 'error' | 'success', text }

  const savedUser = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const email = userEmail || savedUser.email || '';
  const name  = (savedUser.fullName || email.split('@')[0])
    .split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

  const [fullName, setFullName] = useState(name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'error' | 'success', text }

  const l = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[language] || field.en || '';
  }, [language]);

  const formatPrice = (p) => vi ? Number(p).toLocaleString('vi-VN') + 'đ' : '$' + p;

  const stats = useMemo(() => ({
    totalPasses:  bookings.reduce((sum, b) => sum + (b.selectedSeats?.length || 0), 0),
    upcomingShows: bookings.filter(b => !b.isCheckedIn).length,
    memberSince:  bookings.length > 0 ? new Date(bookings[bookings.length - 1].bookingDate).getFullYear() : new Date().getFullYear(),
  }), [bookings]);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(`${API_URL}/api/bookings/email/${email}`)
      .then(res => res.json())
      .then(data => { setBookings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!fullName.trim()) {
      setProfileMsg({ type: 'error', text: vi ? 'Họ và tên không được để trống.' : 'Full name cannot be empty.' });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${savedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({ ...savedUser, fullName: data.fullName }));
        setProfileMsg({ type: 'success', text: vi ? 'Cập nhật thành công.' : 'Updated successfully.' });
      } else {
        setProfileMsg({ type: 'error', text: data.error || (vi ? 'Cập nhật thất bại.' : 'Update failed.') });
      }
    } catch {
      setProfileMsg({ type: 'error', text: vi ? 'Lỗi kết nối máy chủ.' : 'Server connection error.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: vi ? 'Mật khẩu mới phải có ít nhất 6 ký tự.' : 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: vi ? 'Mật khẩu xác nhận không khớp.' : 'Password confirmation does not match.' });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${savedUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: vi ? 'Đổi mật khẩu thành công.' : 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.error || (vi ? 'Đổi mật khẩu thất bại.' : 'Failed to change password.') });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: vi ? 'Lỗi kết nối máy chủ.' : 'Server connection error.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const TABS = [
    { id: 'tickets', icon: 'local_activity', labelVi: 'Vé của tôi',    labelEn: 'My Tickets' },
    { id: 'history', icon: 'receipt_long',   labelVi: 'Lịch sử',       labelEn: 'History' },
    { id: 'profile', icon: 'person',         labelVi: 'Tài khoản',      labelEn: 'Profile' },
  ];

  return (
    <div className="animate-fade-in container" style={{ paddingTop: 120, paddingBottom: 64, minHeight: '100vh' }}>
      <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-user-info" style={{ marginBottom: 28, padding: '0 8px' }}>
          <h2 className="serif" style={{ color: '#fff', fontSize: 18, margin: '0 0 4px' }}>{name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
        </div>

        <nav className="dashboard-sidebar-nav" style={{ display: 'flex', gap: 4, flex: 1 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined dashboard-tab-icon">{tab.icon}</span>
              {vi ? tab.labelVi : tab.labelEn}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="dashboard-logout-btn"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          {vi ? 'Đăng xuất' : 'Log Out'}
        </button>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        {/* ── TAB: Tickets ── */}
        {activeTab === 'tickets' && (
          <div>
            {/* Stats */}
            <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 32 }}>
              {[
                { icon: 'confirmation_number', labelVi: 'Tổng ghế đặt',  labelEn: 'Total Passes',   value: stats.totalPasses,   color: 'var(--purple)' },
              ].map(s => (
                <div key={s.icon} className="mfc-card" style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span className="material-symbols-outlined" style={{ color: s.color, fontSize: 22 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {vi ? s.labelVi : s.labelEn}
                    </span>
                  </div>
                  <div className="serif" style={{ fontSize: 32, color: '#fff', fontWeight: 700 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <h3 className="gradient-title" style={{ fontSize: 24, marginBottom: 20 }}>
              {vi ? 'Vé của tôi' : 'My Tickets'}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 40, color: 'var(--purple)' }}>sync</span>
                <p style={{ color: 'var(--muted)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  {vi ? 'Đang tải vé...' : 'Loading tickets...'}
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="mfc-card empty-tickets-card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'rgba(168,150,246,.3)' }}>local_activity</span>
                <h3 className="serif" style={{ color: '#fff', fontSize: 20, margin: 0 }}>{vi ? 'Chưa có vé nào' : 'No tickets yet'}</h3>
                <button className="btn-pill btn-pill-sm" onClick={() => navigate('/')}>
                  {vi ? 'Mua vé ngay' : 'Browse Events'}
                </button>
              </div>
            ) : (
              <div className="dashboard-tickets-list" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {bookings.map(booking => {
                  const event = booking.eventId;
                  const seats = booking.selectedSeats || [];
                  const isReveal = qrReveal === booking._id;
                  const ticketCode = booking.ticketCode || booking._id.toString().toUpperCase().slice(-8);

                  return (
                    <div key={booking._id} className="mfc-card ticket-card" style={{ display: 'flex', overflow: 'hidden', minHeight: 180 }}>
                      {/* Image */}
                      <div className="ticket-img-col" style={{ width: 160, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                        <img src={event?.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .6, mixBlendMode: 'luminosity' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, rgba(7,8,24,.4))' }} />
                      </div>

                      {/* Info */}
                      {isReveal ? (
                        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }} className="animate-fade-in">
                          <div style={{ background: '#fff', padding: 10, borderRadius: 12 }}>
                            <QRCodeSVG value={ticketCode} size={110} bgColor="#ffffff" fgColor="#01010A" level="H" includeMargin={false} />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 4 }}>
                              {vi ? 'Mã vé' : 'Ticket Code'}
                            </p>
                            <p style={{ fontFamily: 'monospace', fontSize: 16, color: 'var(--purple)', fontWeight: 700, letterSpacing: '.1em' }}>{ticketCode}</p>
                          </div>
                          <button onClick={() => setQrReveal(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                            {vi ? 'Đóng' : 'Close'}
                          </button>
                        </div>
                      ) : (
                        <div className="ticket-info" style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                              <span style={{ fontSize: 10, padding: '4px 12px', borderRadius: 999, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: booking.isCheckedIn ? 'rgba(255,255,255,.1)' : 'rgba(158,254,253,.1)', color: booking.isCheckedIn ? 'var(--muted)' : 'var(--mint)', border: `1px solid ${booking.isCheckedIn ? 'rgba(255,255,255,.15)' : 'rgba(158,254,253,.3)'}` }}>
                                {booking.isCheckedIn ? (vi ? 'Đã check-in' : 'Used') : (vi ? 'Còn hiệu lực' : 'Active')}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                {event?.date ? new Date(event.date).toLocaleDateString(vi ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                              </span>
                            </div>
                            <h3 className="serif" style={{ color: '#fff', fontSize: 20, margin: '0 0 4px' }}>{l(event?.title)}</h3>
                            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 12px' }}>{l(event?.venueName)}</p>
                            <div className="ticket-info-grid" style={{ display: 'flex', gap: 12 }}>
                              {[
                                { lbl: vi ? 'Ghế' : 'Seats', val: `${seats.length}×` },
                                { lbl: vi ? 'Hạng' : 'Type',  val: l(event?.pricingTiers?.[seats[0]?.type?.toLowerCase()]?.label) || seats[0]?.type },
                                { lbl: vi ? 'Giá' : 'Total',  val: formatPrice(booking.subtotal) },
                              ].map(c => (
                                <div key={c.lbl} className="ticket-info-item" style={{ padding: '8px 12px', background: 'rgba(168,150,246,.07)', borderRadius: 10, border: '1px solid rgba(168,150,246,.15)' }}>
                                  <p style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 2px' }}>{c.lbl}</p>
                                  <p style={{ fontSize: 14, color: '#fff', fontWeight: 700, margin: 0 }}>{c.val}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                              <button
                              onClick={() => setQrReveal(booking._id)}
                              className="btn-outline-pill btn-pill-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>qr_code_2</span>
                              QR
                            </button>
                            <button
                              onClick={() => { setCompletedBookingId(booking._id); navigate('/ticket'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="btn-pill btn-pill-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>confirmation_number</span>
                              {vi ? 'Xem vé' : 'View Ticket'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: History ── */}
        {activeTab === 'history' && (
          <div>
            <h3 className="gradient-title" style={{ fontSize: 24, marginBottom: 20 }}>
              {vi ? 'Lịch sử đặt vé' : 'Booking History'}
            </h3>
            <div className="mfc-card history-card" style={{ overflowX: 'auto' }}>
              {bookings.length === 0 ? (
                <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
                  {vi ? 'Chưa có giao dịch nào.' : 'No transactions yet.'}
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(168,150,246,.2)' }}>
                      {[vi ? 'Mã' : 'Ref', vi ? 'Sự kiện' : 'Event', vi ? 'Ngày' : 'Date', vi ? 'Thanh toán' : 'Payment', vi ? 'Trạng thái' : 'Status', vi ? 'Số tiền' : 'Amount'].map(h => (
                        <th key={h} style={{ paddingBottom: 12, color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', textAlign: h === (vi ? 'Số tiền' : 'Amount') ? 'right' : 'left', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(168,150,246,.08)' }}>
                        <td style={{ padding: '14px 0', fontFamily: 'monospace', color: 'var(--purple)', fontSize: 12 }}>{b._id.toString().toUpperCase().slice(-8)}</td>
                        <td style={{ padding: '14px 12px 14px 0' }}>
                          <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 2px' }}>{l(b.eventId?.title)}</p>
                          <p style={{ color: 'var(--muted)', fontSize: 11, margin: 0 }}>{(b.selectedSeats || []).length} {vi ? 'ghế' : 'seat(s)'}</p>
                        </td>
                        <td style={{ padding: '14px 12px 14px 0', color: 'var(--muted)', fontSize: 12 }}>
                          {new Date(b.bookingDate).toLocaleDateString(vi ? 'vi-VN' : 'en-US')}
                        </td>
                        <td style={{ padding: '14px 12px 14px 0', color: 'var(--muted)', fontSize: 12 }}>{b.paymentMethod}</td>
                        <td style={{ padding: '14px 12px 14px 0' }}>
                          <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 999, background: 'rgba(158,254,253,.1)', color: 'var(--mint)', border: '1px solid rgba(158,254,253,.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                            {vi ? 'Đã xác nhận' : 'Confirmed'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 0', textAlign: 'right', color: 'var(--purple)', fontWeight: 700, fontSize: 15 }}>{formatPrice(b.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Profile ── */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 560 }}>
            <h3 className="gradient-title" style={{ fontSize: 24, marginBottom: 20 }}>
              {vi ? 'Tài khoản' : 'Your Account'}
            </h3>
            <div className="mfc-card profile-card">
              <h4 style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 20px', paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                {vi ? 'Đổi Thông Tin Cá Nhân' : 'Change Personal Information'}
              </h4>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    {vi ? 'Họ và tên' : 'Full Name'}
                  </label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mfc-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    Email
                  </label>
                  <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(168,150,246,.28)', background: 'rgba(1,1,10,.4)', color: 'var(--muted)', fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>
                    {email}
                  </div>
                </div>

                {profileMsg && (
                  <p style={{ margin: 0, fontSize: 13, color: profileMsg.type === 'success' ? 'var(--mint)' : '#ff6b6b' }}>
                    {profileMsg.text}
                  </p>
                )}

                <button type="submit" disabled={savingProfile} className="btn-pill" style={{ justifyContent: 'center', marginTop: 4 }}>
                  {savingProfile ? (vi ? 'Đang lưu...' : 'Saving...') : (vi ? 'Cập nhật' : 'Update')}
                </button>
              </form>
            </div>

            <div className="mfc-card profile-card" style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 11, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.12em', margin: '0 0 20px', paddingBottom: 10, borderBottom: '1px solid rgba(168,150,246,.18)' }}>
                {vi ? 'Đổi mật khẩu' : 'Change Password'}
              </h4>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    {vi ? 'Mật khẩu hiện tại' : 'Current Password'}
                  </label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mfc-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    {vi ? 'Mật khẩu mới' : 'New Password'}
                  </label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mfc-input" required minLength={6} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    {vi ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'}
                  </label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mfc-input" required minLength={6} />
                </div>

                {passwordMsg && (
                  <p style={{ margin: 0, fontSize: 13, color: passwordMsg.type === 'success' ? 'var(--mint)' : '#ff6b6b' }}>
                    {passwordMsg.text}
                  </p>
                )}

                <button type="submit" disabled={changingPassword} className="btn-pill" style={{ justifyContent: 'center', marginTop: 4 }}>
                  {changingPassword ? (vi ? 'Đang lưu...' : 'Saving...') : (vi ? 'Cập nhật mật khẩu' : 'Update Password')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default UserDashboardPage;
