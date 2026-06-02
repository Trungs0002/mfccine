import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LanguageModal from './components/LanguageModal';
import { LanguageProvider } from './context/LanguageContext';
import { API_URL } from './apiConfig';

// Page components
import LandingPage from './pages/LandingPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import DigitalTicketPage from './pages/DigitalTicketPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';
import EventDetailsPage from './pages/EventDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const FALLBACK_EVENTS = [
  {
    _id: "6649f82d001a1c11eef2bb01",
    title: { en: "HAUTE ETHER GALA", vi: "ĐÊM TIỆC HAUTE ETHER" },
    description: { 
      en: "An ethereal projection of digital fabrics and floating crystal-infused meshwear, exploring space elegance.",
      vi: "Một buổi tối của thời trang cao cấp siêu thực, khám phá giác quan và không gian nghệ thuật kỹ thuật số."
    },
    date: "2026-10-24T20:00:00.000Z",
    location: { en: "Paris, France", vi: "Paris, Pháp" },
    venueName: { en: "The Grand Palais Loft", vi: "Triển lãm Grand Palais" },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2zp9mt2s9NMz6BrgnUb3YY0d3kiA9TzIVf4oyRBB2ymI0h5zeo2N5P4xW-knR51jcjeIMPZZNSEIFT0ot4qZWsIRN55IV9IPz5N8DZo6Q4ioSJq3VN4pjnrTmo8vJARrCRXMEucFOSHN71XsjuZLnPcKkezdb0-FJKrhDclMOSVQjYWKyzCTHOV_kWp-bD48iKKRPJj2OyA1Ld7hcgEQBfwVz_EIxKyo2_sAI0bqf6_QT1at8d0AynzxEFd7Ft5kzjRW-Ta1wdFI",
    schedule: [
      { time: "19:00", title: { en: "Arrival", vi: "Đón khách" }, description: { en: "Red Carpet", vi: "Thảm đỏ" } }
    ],
    pricingTiers: {
      standard: { price: 100, label: { en: "Standard", vi: "Phổ thông" }, description: { en: "Basic", vi: "Cơ bản" } },
      silver: { price: 150, label: { en: "Silver", vi: "Bạc" }, description: { en: "Premium", vi: "Cao cấp" } },
      gold: { price: 250, label: { en: "Gold", vi: "Vàng" }, description: { en: "Luxury", vi: "Đẳng cấp" } },
      vip: { price: 450, label: { en: "VIP", vi: "VIP" }, description: { en: "Elite", vi: "Thượng lưu" } }
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
  const [settings, setSettings] = useState({ siteName: 'EVENT PRO' });

  useEffect(() => {
    setIsAdminMode(location.pathname.startsWith('/admin'));
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
        }
      })
      .catch(() => setSelectedEvent(FALLBACK_EVENTS[0]));

    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <>
      <LanguageModal />
      <Navbar isAdminMode={isAdminMode} user={user} onLogout={handleLogout} setEvent={setSelectedEvent} settings={settings} />
      <main className="flex-grow flex flex-col relative z-10 w-full">
        <Routes>
          <Route path="/" element={<LandingPage events={events} setEvent={setSelectedEvent} settings={settings} />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage setUser={setUser} />} />
          <Route path="/event/:id" element={<EventDetailsPage event={selectedEvent} setEvent={setSelectedEvent} />} />
          <Route path="/seating" element={selectedEvent ? <SeatSelectionPage event={selectedEvent} setBookingDetails={setBookingDetails} /> : <Navigate to="/" />} />
          <Route path="/checkout" element={selectedEvent ? <CheckoutPage event={selectedEvent} bookingDetails={bookingDetails} user={user} setCompletedBookingId={setCompletedBookingId} /> : <Navigate to="/" />} />
          <Route path="/ticket" element={<DigitalTicketPage completedBookingId={completedBookingId} settings={settings} />} />
          <Route path="/dashboard" element={user ? <UserDashboardPage userEmail={user.email} setCompletedBookingId={setCompletedBookingId} settings={settings} /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanelPage events={events} setEvents={setEvents} settings={settings} setSettings={setSettings} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer settings={settings} setIsAdminMode={setIsAdminMode} />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-on-surface relative overflow-x-hidden">
          <div className="absolute top-0 inset-x-0 h-screen pointer-events-none select-none z-0">
            <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(72,45,88,0.3)_0%,transparent_70%)] blur-[90px] bg-atmosphere"></div>
            <div className="absolute top-[30%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(82,61,109,0.25)_0%,transparent_70%)] blur-[80px] bg-atmosphere"></div>
          </div>
          <AppContent />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
