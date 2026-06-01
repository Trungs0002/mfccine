import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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

// Standard high-fidelity fallback events
const FALLBACK_EVENTS = [
  {
    _id: "6649f82d001a1c11eef2bb01",
    title: "HAUTE ETHER GALA",
    description: "An ethereal projection of digital fabrics and floating crystal-infused meshwear, exploring space elegance.",
    date: "2026-10-24T20:00:00.000Z",
    location: "Paris, France",
    venueName: "The Grand Palais Loft",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2zp9mt2s9NMz6BrgnUb3YY0d3kiA9TzIVf4oyRBB2ymI0h5zeo2N5P4xW-knR51jcjeIMPZZNSEIFT0ot4qZWsIRN55IV9IPz5N8DZo6Q4ioSJq3VN4pjnrTmo8vJARrCRXMEucFOSHN71XsjuZLnPcKkezdb0-FJKrhDclMOSVQjYWKyzCTHOV_kWp-bD48iKKRPJj2OyA1Ld7hcgEQBfwVz_EIxKyo2_sAI0bqf6_QT1at8d0AynzxEFd7Ft5kzjRW-Ta1wdFI",
    schedule: [
      { time: "19:00", title: "Arrival & Red Carpet", description: "Cocktails and designer interviews." },
      { time: "20:00", title: "Couture Showcase", description: "Ethereal crystal-infused reveals." },
      { time: "21:00", title: "Toast & Afterparty", description: "E-lounge networking session." }
    ],
    pricingTiers: {
      silver: { price: 150, capacity: 150 },
      gold: { price: 250, capacity: 100 },
      vip: { price: 450, capacity: 50 }
    }
  }
];

function AppContent() {
  const location = useLocation();
  
  // Global States
  const [user, setUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ selectedSeats: [], subtotal: 0 });
  const [completedBookingId, setCompletedBookingId] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [settings, setSettings] = useState({ siteName: 'EVENT PRO' });
  const [loading, setLoading] = useState(true);

  // Sync admin mode with URL
  useEffect(() => {
    setIsAdminMode(location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  // Initial Auth & Data Load
  useEffect(() => {
    // 0. Restore User Session
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    // 1. Fetch Events
    fetch('http://localhost:5000/api/events')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data && data.length > 0) {
          setEvents(data);
          setSelectedEvent(data[0]);
        }
      })
      .catch(() => {
        setSelectedEvent(FALLBACK_EVENTS[0]);
      });

    // 2. Fetch Settings
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading && events === FALLBACK_EVENTS) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center py-40 gap-4 pt-[180px]">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
        <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.2em]">Synchronizing Brand Portals...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar 
        isAdminMode={isAdminMode} 
        setIsAdminMode={setIsAdminMode} 
        user={user}
        onLogout={handleLogout}
        setEvent={handleSelectEvent}
        settings={settings}
      />

      <main className="flex-grow flex flex-col relative z-10 w-full">
        <Routes>
          <Route path="/" element={<LandingPage events={events} setEvent={handleSelectEvent} settings={settings} />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage setUser={setUser} />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage setUser={setUser} />} />
          
          <Route path="/event/:id" element={<EventDetailsPage event={selectedEvent} setEvent={handleSelectEvent} />} />
          <Route path="/seating" element={selectedEvent ? <SeatSelectionPage event={selectedEvent} setBookingDetails={setBookingDetails} /> : <Navigate to="/" />} />
          <Route path="/checkout" element={selectedEvent ? <CheckoutPage event={selectedEvent} bookingDetails={bookingDetails} setUserEmail={() => {}} setCompletedBookingId={setCompletedBookingId} /> : <Navigate to="/" />} />
          <Route path="/ticket" element={<DigitalTicketPage completedBookingId={completedBookingId} settings={settings} />} />
          
          {/* Protected Routes */}
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
    <Router>
      <div className="min-h-screen flex flex-col bg-background text-on-surface relative overflow-x-hidden">
        <div className="absolute top-0 inset-x-0 h-screen pointer-events-none select-none z-0">
          <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(72,45,88,0.3)_0%,transparent_70%)] blur-[90px] bg-atmosphere"></div>
          <div className="absolute top-[30%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(82,61,109,0.25)_0%,transparent_70%)] blur-[80px] bg-atmosphere"></div>
        </div>
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
