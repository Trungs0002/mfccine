import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page components
import LandingPage from './pages/LandingPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import DigitalTicketPage from './pages/DigitalTicketPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminPanelPage from './pages/AdminPanelPage';

// Standard high-fidelity fallback events in case backend hasn't booted or is offline
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
    rehearsalImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApty4F9Xfw23ECdQJ5ZTVMJVLqZkumLZSnPchteKqYAt7kbaw7ncNDFEiTRQCtG1cUSUAz39N6fHh50Iyp3oEUj3Dy3TB1oFcNg1J6tdNP5vG13lq_C73YLcAT62Hqm75Q8F-9Quai63CQVfiaA8Agz8inhwp0Kns_BBhx6BnKd9lUMJBpcfRIITdZoWncSm3ySDmbpq3EcCLnjUC8iSAJhkothu0xcmsWWUojosnMrC9wE02SjPWa4kp4rn9NWzo-PZlCpPQvdAg",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCqR6c4B2iK5k_42hQ-wD2H5l0w4rJj2q4d7j0sT4f3d2a7c8b9a0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2"
    ],
    pricingTiers: {
      silver: { price: 150, capacity: 150 },
      gold: { price: 250, capacity: 100 },
      vip: { price: 450, capacity: 50 }
    }
  },
  {
    _id: "6649f82d001a1c11eef2bb02",
    title: "NEO-JACARTA LINE",
    description: "Deep structured shadows and asymmetrical shapes tailored from dark velvet and silver hardware aesthetics.",
    date: "2026-11-12T19:30:00.000Z",
    location: "Milan, Italy",
    venueName: "Metropolitan Spazio",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuApty4F9Xfw23ECdQJ5ZTVMJVLqZkumLZSnPchteKqYAt7kbaw7ncNDFEiTRQCtG1cUSUAz39N6fHh50Iyp3oEUj3Dy3TB1oFcNg1J6tdNP5vG13lq_C73YLcAT62Hqm75Q8F-9Quai63CQVfiaA8Agz8inhwp0Kns_BBhx6BnKd9lUMJBpcfRIITdZoWncSm3ySDmbpq3EcCLnjUC8iSAJhkothu0xcmsWWUojosnMrC9wE02SjPWa4kp4rn9NWzo-PZlCpPQvdAg",
    schedule: [
      { time: "18:30", title: "Asymmetrical Opening", description: "Cocktails and velvet looks portfolio presentation." },
      { time: "19:30", title: "Hardware Reveal", description: "Neo-Jacarta dark silver catwalk show." }
    ],
    rehearsalImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCqR6c4B2iK5k_42hQ-wD2H5l0w4rJj2q4d7j0sT4f3d2a7c8b9a0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2"
    ],
    pricingTiers: {
      silver: { price: 120, capacity: 150 },
      gold: { price: 220, capacity: 100 },
      vip: { price: 400, capacity: 50 }
    }
  }
];

function App() {
  // Global States
  const [currentView, setView] = useState('landing');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ selectedSeats: [], subtotal: 0 });
  const [completedBookingId, setCompletedBookingId] = useState(null);
  const [userEmail, setUserEmail] = useState('alex.johnson@ftu.edu'); // Preloaded mock email, updates upon checkout
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(true);

  // Fetch events from Express API
  useEffect(() => {
    fetch('http://localhost:5000/api/events')
      .then(res => {
        if (!res.ok) throw new Error('API server unavailable');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setEvents(data);
          // Set first event as preselected default
          setSelectedEvent(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('Backend server is starting up or disconnected. Initializing with luxury local fallback models.', err);
        setSelectedEvent(FALLBACK_EVENTS[0]);
        setLoading(false);
      });
  }, []);

  // Set event context helper
  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
  };

  // Switch View Rendering Engine
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage 
            events={events} 
            setView={setView} 
            setEvent={handleSelectEvent} 
          />
        );
      case 'details':
        return (
          <LandingPage 
            events={events} 
            setView={setView} 
            setEvent={handleSelectEvent} 
          />
        );
      case 'seating':
        return (
          <SeatSelectionPage 
            event={selectedEvent} 
            setView={setView} 
            setBookingDetails={setBookingDetails} 
          />
        );
      case 'checkout':
        return (
          <CheckoutPage 
            event={selectedEvent} 
            bookingDetails={bookingDetails} 
            setView={setView} 
            setUserEmail={setUserEmail} 
            setCompletedBookingId={setCompletedBookingId} 
          />
        );
      case 'ticket':
        return (
          <DigitalTicketPage 
            completedBookingId={completedBookingId} 
            setView={setView} 
          />
        );
      case 'dashboard':
        return (
          <UserDashboardPage 
            userEmail={userEmail} 
            setView={setView} 
            setCompletedBookingId={setCompletedBookingId} 
          />
        );
      case 'admin':
        return (
          <AdminPanelPage 
            events={events} 
            setEvents={setEvents} 
            setView={setView} 
          />
        );
      default:
        return (
          <LandingPage 
            events={events} 
            setView={setView} 
            setEvent={handleSelectEvent} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface relative overflow-x-hidden">
      
      {/* Cinematic purple glow bubbles (background atmospheric overlays) */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none select-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(72,45,88,0.3)_0%,transparent_70%)] blur-[90px] bg-atmosphere"></div>
        <div className="absolute top-[30%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(82,61,109,0.25)_0%,transparent_70%)] blur-[80px] bg-atmosphere"></div>
      </div>

      {/* Global Header Navigation */}
      <Navbar 
        currentView={currentView} 
        setView={setView} 
        isAdminMode={isAdminMode} 
        setIsAdminMode={setIsAdminMode} 
        userEmail={userEmail}
        setEvent={handleSelectEvent}
      />

      {/* Core Dynamic Content */}
      <main className="flex-grow flex flex-col relative z-10 w-full">
        {loading && events === FALLBACK_EVENTS ? (
          <div className="flex-grow flex flex-col justify-center items-center py-40 gap-4 pt-[180px]">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">sync</span>
            <p className="font-label-sm text-on-surface-variant uppercase tracking-[0.2em]">Synchronizing Brand Portals...</p>
          </div>
        ) : (
          renderView()
        )}
      </main>

      {/* Shared Editorial Footer */}
      <Footer 
        setView={setView} 
        setIsAdminMode={setIsAdminMode} 
      />
    </div>
  );
}

export default App;
