import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LanguageModal from './components/LanguageModal';
import { LanguageProvider } from './context/LanguageContext';
import { API_URL } from './apiConfig';

import LandingPage        from './pages/LandingPage';
import SeatSelectionPage  from './pages/SeatSelectionPage';
import CheckoutPage       from './pages/CheckoutPage';
import DigitalTicketPage  from './pages/DigitalTicketPage';
import UserDashboardPage  from './pages/UserDashboardPage';
import AdminPanelPage     from './pages/AdminPanelPage';
import AboutPage          from './pages/AboutPage';
import RecruitPage        from './pages/RecruitPage';
import NhatPage           from './pages/NhatPage';
import CastingCallPage    from './pages/CastingCallPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';

const FALLBACK_EVENTS = [
  {
    _id: "6649f82d001a1c11eef2bb01",
    title: { en: "ĐỘC", vi: "ĐỘC" },
    description: {
      en: "ĐỘC is a journey celebrating individual identity, where fashion, art and emotion intertwine to create unforgettable marks.",
      vi: "ĐỘC là hành trình tôn vinh bản sắc riêng, nơi thời trang, nghệ thuật và cảm xúc giao thoa để tạo nên những dấu ấn không trộn lẫn."
    },
    date: "2026-08-22T19:30:00.000Z",
    location: { en: "Hanoi, Vietnam", vi: "Hà Nội, Việt Nam" },
    venueName: { en: "Trong Dong Palace, Lang Yen", vi: "Trống Đồng Palace, cơ sở Lãng Yên" },
    image: "/kv-doc.jpeg",
    schedule: [
      { time: "19:00", title: { en: "Doors Open",       vi: "Mở cửa đón khách" }, description: { en: "Red Carpet",             vi: "Thảm đỏ" } },
      { time: "19:30", title: { en: "Opening Ceremony", vi: "Khai mạc" },           description: { en: "Welcome & Introduction", vi: "Chào đón & Giới thiệu" } },
      { time: "20:00", title: { en: "Main Show",        vi: "Chương trình chính" }, description: { en: "Fashion Showcase",       vi: "Trình diễn thời trang" } },
      { time: "22:00", title: { en: "Closing",          vi: "Bế mạc" },             description: { en: "Awards & Finale",        vi: "Trao giải & Kết thúc" } },
    ],
    pricingTiers: {
      standard: { price: 150000, label: { en: "Standard",        vi: "Khu phổ thông" },     description: { en: "Standard seating area",         vi: "Khu vực khán đài tiêu chuẩn" } },
      premium:  { price: 250000, label: { en: "Premium",         vi: "Khu Premium" },       description: { en: "Premium view",                  vi: "Khu vực khán đài cao cấp" } },
      vip:      { price: 500000, label: { en: "VIP",             vi: "Khu VIP" },           description: { en: "Center VIP with exclusive perks", vi: "Vị trí trung tâm và đặc quyền riêng" } },
    }
  }
];

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ selectedSeats: [], subtotal: 0 });
  const [completedBookingId, setCompletedBookingId] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [settings, setSettings] = useState({ siteName: 'MFC & FASHION CLUB' });

  useEffect(() => {
    setIsAdminMode(location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  // Always land at the top of the page on route change/redirect (browser doesn't reset scroll on its own in an SPA)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    fetch(`${API_URL}/api/events`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data && data.length > 0) {
          setEvents(data);
          setSelectedEvent(data[0]);
        } else {
          setSelectedEvent(FALLBACK_EVENTS[0]);
        }
      })
      .catch(() => setSelectedEvent(FALLBACK_EVENTS[0]));

    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => { if (data) setSettings(data); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hideNav = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      <LanguageModal />
      {!hideNav && (
        <Navbar
          isAdminMode={isAdminMode}
          user={user}
          onLogout={handleLogout}
          setEvent={setSelectedEvent}
          settings={settings}
          selectedEvent={selectedEvent}
        />
      )}
      <main style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/"          element={<LandingPage events={events} setEvent={setSelectedEvent} settings={settings} />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/recruit"   element={<RecruitPage />} />
          <Route path="/nhat"      element={<NhatPage />} />
          <Route path="/casting-call" element={<CastingCallPage />} />
          <Route path="/login"     element={user ? <Navigate to="/" /> : <LoginPage setUser={setUser} />} />
          <Route path="/register"  element={user ? <Navigate to="/" /> : <RegisterPage setUser={setUser} />} />

          {/* TODO: login requirement for buying tickets disabled for now — to re-enable, restore the
              `user ? (...) : <Navigate to="/login" />` wrapper on these two routes:
          <Route path="/seating"   element={user ? (selectedEvent ? <SeatSelectionPage event={selectedEvent} setBookingDetails={setBookingDetails} /> : <Navigate to="/" />) : <Navigate to="/login" />} />
          <Route path="/checkout"  element={user ? (selectedEvent ? <CheckoutPage event={selectedEvent} bookingDetails={bookingDetails} user={user} setCompletedBookingId={setCompletedBookingId} /> : <Navigate to="/" />) : <Navigate to="/login" />} />
          */}
          <Route path="/seating"   element={selectedEvent ? <SeatSelectionPage event={selectedEvent} setBookingDetails={setBookingDetails} /> : <Navigate to="/" />} />
          <Route path="/checkout"  element={selectedEvent ? <CheckoutPage event={selectedEvent} bookingDetails={bookingDetails} user={user} setCompletedBookingId={setCompletedBookingId} /> : <Navigate to="/" />} />
          <Route path="/ticket"    element={<DigitalTicketPage completedBookingId={completedBookingId} settings={settings} />} />
          <Route path="/dashboard" element={user ? <UserDashboardPage userEmail={user.email} setCompletedBookingId={setCompletedBookingId} settings={settings} /> : <Navigate to="/login" />} />
          <Route path="/admin"     element={(user?.role === 'admin' || user?.role === 'staff') ? <AdminPanelPage events={events} setEvents={setEvents} settings={settings} setSettings={setSettings} user={user} /> : <Navigate to="/login" />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!hideNav && <Footer settings={settings} setIsAdminMode={setIsAdminMode} />}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}
